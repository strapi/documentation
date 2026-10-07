---
title: Installing Enterprise plugins
displayed_sidebar: cmsSidebar
description: Install and upgrade Strapi Enterprise plugins with the strapi enterprise install command, and set up access to the Strapi package registry for your team and deployments.
tags:
- plugins
- Enterprise feature
- Command Line Interface (CLI)
- strapi enterprise install
---

# Installing Enterprise plugins
<EnterpriseBadge tooltip="This is available with an Enterprise plan."/> <VersionBadge version="5.57.0" />

<Tldr>
Enterprise plugins are distributed from the Strapi package registry to the licenses that include them. The `strapi enterprise install` command finds your license, sets up access to the registry, and installs a version compatible with your Strapi application.
</Tldr>

Enterprise plugins are not published on the public npm registry. They are installed like any other dependency, and the Strapi package registry only serves the plugins your Strapi license includes. The `strapi enterprise install` command sets up the registry for you, so package manager configuration files don't need to be edited by hand.

:::prerequisites
- A Strapi 5.57.0 or later application, with its dependencies installed.
- A license for the CMS Enterprise plan. The license key is available in the [Strapi billing portal](/cms/billing-portal#viewing-and-saving-a-cms-license-key).
- npm, pnpm, or Yarn (1 or 2 and later).
:::

## Installing a plugin

To install Enterprise plugins, run the `strapi enterprise install` command from the root folder of your Strapi application:

- Without any argument, the command lists the Enterprise plugins your license includes, so you can choose which ones to install or upgrade.
- When passing one or more plugin name(s) as arguments, the command installs them directly. The `@strapi-enterprise/` prefix is optional.

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">
Listing available plugins to install or upgrade:

```bash
yarn strapi enterprise install
```

Installing plugins by name:

```bash
yarn strapi enterprise install plugin-byok
```

<!-- Installing plugins by name, specifying a version:

```bash
yarn strapi enterprise install plugin-byok@1.0.0
``` -->

<br/>

</TabItem>
<TabItem value="npm" label="NPM">
Listing available plugins to install or upgrade:

```bash
npm run strapi enterprise install
```

Installing plugins by name:

```bash
npm run strapi enterprise install plugin-byok
```

<!-- Installing plugins by name, specifying a version:

```bash
npm run strapi enterprise install plugin-byok@1.0.0
``` -->

<br/>

</TabItem>
<TabItem value="pnpm" label="pnpm">
Listing available plugins to install or upgrade:

```bash
pnpm strapi enterprise install
```

Installing plugins by name:

```bash
pnpm strapi enterprise install plugin-byok
```
<!-- 
Installing plugins by name, specifying a version:

```bash
pnpm strapi enterprise install plugin-byok@1.0.0
``` -->

<br/>

</TabItem>
</Tabs>

<!-- :::note
The command saves the exact version it installs in `package.json`, so a later dependency update can't move the plugin to a version your Strapi application doesn't support.

It does not replace your package manager. Once the registry is set up, you keep installing, upgrading, and removing Enterprise plugins with your usual tools. To upgrade a plugin, run `npm install @strapi-enterprise/plugin-byok@latest`, or its equivalent for your package manager.
:::

:::caution
* Strapi enables an installed plugin by default. A plugin that requires a configuration may stop Strapi from starting until it is configured. See the plugin's own page for how to configure it, such as [Bring your own AI key](/cms/plugins/byok#configuration).
* If a project-level `.npmrc` or `.yarnrc.yml` sets another license for `packages.strapi.io`, the command stops before installing anything. A project-level file takes precedence over the user-level file.
:::

:::info Registry access

The first time it runs on a computer, the command adds the registry setup at the end of your user-level configuration file, and restricts the file to your user:

| Package manager | File |
|---|---|
| npm, pnpm, Yarn 1 | `~/.npmrc` |
| Yarn 2 and later | `~/.yarnrc.yml` |

::: -->

### Setting up access manually {#setting-up-access-manually}

The command is optional. To set up access yourself, add these lines to your user-level configuration file, with your license in place of `<your license>`:

<Tabs groupId="npm-yarn-config">
<TabItem value="npmrc" label="npm, pnpm, Yarn 1 (~/.npmrc)">

```ini title="~/.npmrc"
@strapi-enterprise:registry=https://packages.strapi.io/
//packages.strapi.io/:_authToken=<your license>
```

</TabItem>
<TabItem value="yarnrc" label="Yarn 2 and later (~/.yarnrc.yml)">

```yaml title="~/.yarnrc.yml"
npmScopes:
  strapi-enterprise:
    npmRegistryServer: 'https://packages.strapi.io/'
    npmAlwaysAuth: true
    npmAuthToken: '<your license>'
```

If the file already has an `npmScopes` key, add the `strapi-enterprise` entry under it.

</TabItem>
</Tabs>

The file now holds your license, so restrict it to your user with `chmod 600 ~/.npmrc`. Then install the plugin with your package manager, saving the exact version: `npm install --save-exact @strapi-enterprise/<plugin-name>`.

:::note Setting up access for CI and deployments
The command only configures the computer it runs on. Any other environment that installs your application's dependencies also needs access to the registry, such as a CI pipeline, a deployment build, or a teammate's computer. Otherwise, installing dependencies fails with an authentication error (401) or a not found error (404).
:::

### Committing a project-level configuration file

Add a configuration file to your project that reads the license from the `STRAPI_LICENSE` environment variable. Then set `STRAPI_LICENSE` as a secret in every environment that installs dependencies:

<Tabs groupId="npm-yarn-config">
<TabItem value="npmrc" label="npm, Yarn 1 (.npmrc)">

```ini title="./.npmrc"
@strapi-enterprise:registry=https://packages.strapi.io/
//packages.strapi.io/:_authToken=${STRAPI_LICENSE}
```

</TabItem>
<TabItem value="yarnrc" label="Yarn 2 and later (.yarnrc.yml)">

```yaml title="./.yarnrc.yml"
npmScopes:
  strapi-enterprise:
    npmRegistryServer: 'https://packages.strapi.io/'
    npmAlwaysAuth: true
    npmAuthToken: '${STRAPI_LICENSE:-}'
```

If the project already has a `.yarnrc.yml`, add these lines to it, under its existing `npmScopes` key if it has one.

</TabItem>
</Tabs>

:::caution
`STRAPI_LICENSE` must then be set in the shell of everyone who installs dependencies. npm, pnpm, and Yarn do not read the application's `.env` file.

This approach does not work with pnpm. Since pnpm 10.34.2 and 11.5.3, pnpm no longer expands environment variables in authentication settings that come from a file committed to the repository (see <ExternalLink to="https://pnpm.io/blog/2026/06/11/env-variables-in-repository-npmrc" text="the pnpm announcement"/>). With pnpm, keep the license out of the repository and set it where you control it instead, with `pnpm config set` or a user-level `~/.npmrc` provided by the environment.
:::

## Troubleshooting

| Message | What to do |
|---|---|
| `No Strapi license found…` | Set `STRAPI_LICENSE`, or run the command in a terminal to paste the license. |
| `This Strapi license is not valid…` | Copy the whole license again from the billing portal. |
| `This Strapi license expired on…` | Renew your license. |
| `…rejected this Strapi license…` | Check that the license is still active in the billing portal. |
| `Your license does not include…` | Check the plugin name. If the name is correct, contact your account manager. |
| `No Enterprise package named…` | Check the plugin name. |
| `… has no version or tag …` | Check the version you added to the plugin name. |
| `… requires Strapi … and this app uses …` | Upgrade Strapi first. |
| `Could not reach https://packages.strapi.io…` | Check your network connection, proxy, and firewall. |
| `Could not tell which package manager this app uses…` | Install your application's dependencies first, or set `packageManager` in `package.json`. |
| `… already sets up packages.strapi.io with another license…` | Replace those lines with the ones in the message. |
| `… sets another license for packages.strapi.io and takes precedence…` | Update or remove that line in the named file. |
| `… could not be updated automatically…` | Add the lines from the message to the named file, then run the command again. |
| `Could not search packages.strapi.io…` | Try again later, or pass the plugin name. |
| `Pass package names, or run the command in an interactive terminal.` | Run the command in a terminal, or pass the plugin names, as in CI. |
| Installing dependencies fails with a 401 or 404 error | See [Setting up access manually](#setting-up-access-manually) and [Committing a project-level configuration file](#committing-a-project-level-configuration-file). |
