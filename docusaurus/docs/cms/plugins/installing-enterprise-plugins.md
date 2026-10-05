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
<EnterpriseBadge />

<Tldr>
Enterprise plugins are distributed from the Strapi package registry to the licenses that include them. The `strapi enterprise install` command finds your license, sets up access to the registry, and installs a version compatible with your Strapi application.
</Tldr>

Enterprise plugins are not published on the public npm registry. They are installed like any other dependency, and the Strapi package registry only serves the plugins your Strapi license includes. The `strapi enterprise install` command sets up the registry for you, so npm or Yarn configuration files don't need to be edited by hand.

:::prerequisites
- A Strapi 5.57.0 or later application, with its dependencies installed.
- A license for the CMS Enterprise plan. The license key is available in the [Strapi billing portal](/cms/billing-portal#viewing-and-saving-a-cms-license-key).
- npm, pnpm, or Yarn (1 or 2 and later).
:::

## Installing a plugin

Run the command from the root folder of your Strapi application.

### Choosing plugins from a list

Without a plugin name, the command lists the Enterprise plugins your license includes:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi enterprise install
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm run strapi enterprise install
```

</TabItem>
</Tabs>

The list works as follows:

- Plugins with a newer compatible version are selected for upgrade. A major upgrade, which may include breaking changes, is shown with `[major upgrade]` and isn't selected.
- Plugins that can't be installed show the reason, for instance a newer Strapi version they require.
- Packages that are not plugins, such as providers, show their kind, for instance `[provider]`.
- Unselecting an installed plugin does not uninstall it.

1. Use the arrow keys to move through the list, and press <kbd>Space</kbd> to select a plugin.
2. Press <kbd>Enter</kbd> to install the selected plugins.

### Installing a plugin by name

Pass one or more plugin names to install them without the list. The `@strapi-enterprise/` prefix is optional:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi enterprise install plugin-byok
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm run strapi enterprise install plugin-byok
```

</TabItem>
</Tabs>

The command picks the newest stable version, up to the one tagged `latest`, that supports the Strapi version of your application. It warns you before a major upgrade.

To install another version, add it to the name:

- An exact version, including a prerelease, for instance `plugin-byok@1.2.0`.
- A tag, for instance `plugin-byok@next`.
- A range, for instance `plugin-byok@^1.2.0`. The command installs the highest version in it that supports the Strapi version of your application, or the version tagged `latest` if it qualifies.

If the version you name, or every version in the range, requires a newer Strapi version, the command warns you but still installs it.

:::note
The command saves the exact version it installs in `package.json`. A later dependency update then can't move the plugin to a version your Strapi application doesn't support. To upgrade, run `strapi enterprise install` again.
:::

:::caution
Strapi enables an installed plugin by default. A plugin that requires a configuration may stop Strapi from starting until it is configured. See each plugin's page, for instance [Bring your own AI key](/cms/plugins/byok#configuration), for how to configure it.
:::

## Registry access

The first time it runs on a computer, the command adds the registry setup at the end of your user-level configuration file, and restricts the file to your user:

| Package manager | File |
|---|---|
| npm, pnpm, Yarn 1 | `~/.npmrc` |
| Yarn 2 and later | `~/.yarnrc.yml` |

:::caution
If a project-level `.npmrc` or `.yarnrc.yml` sets another license for `packages.strapi.io`, the command stops before installing anything. A project-level file takes precedence over the user-level file.
:::

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

The file now holds your license, so restrict it to your user, for instance with `chmod 600 ~/.npmrc`. Then install the plugin with your package manager, saving the exact version, for instance `npm install --save-exact @strapi-enterprise/<plugin-name>`.

## Setting up access for CI and deployments

The command only configures the computer it runs on. Any other environment that installs your application's dependencies also needs access to the registry, such as a CI pipeline, a deployment build, or a teammate's computer. Otherwise, installing dependencies fails with an authentication error (401) or a not found error (404).

### Committing a project-level configuration file

Add a configuration file to your project that reads the license from the `STRAPI_LICENSE` environment variable. Then set `STRAPI_LICENSE` as a secret in every environment that installs dependencies:

<Tabs groupId="npm-yarn-config">
<TabItem value="npmrc" label="npm, pnpm, Yarn 1 (.npmrc)">

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
| `… has no stable release yet…` | Add the prerelease version to the name, for instance `plugin-name@<version>`. |
| `… has no version or tag …` | Check the version you added to the plugin name. |
| `… requires Strapi … and this app uses …` | Upgrade Strapi first. |
| `Could not reach https://packages.strapi.io…` | Check your network connection, proxy, and firewall. |
| `Could not tell which package manager this app uses…` | Install your application's dependencies first, or set `packageManager` in `package.json`. |
| `… already sets up packages.strapi.io with another license…` | Replace those lines with the ones in the message. |
| `… sets another license for packages.strapi.io and takes precedence…` | Update or remove that line in the named file. |
| `… could not be updated automatically…` | Add the lines from the message to the named file, then run the command again. |
| `Could not search packages.strapi.io…` | Try again later, or pass the plugin name. |
| `Pass package names, or run the command in an interactive terminal.` | Run the command in a terminal, or pass the plugin names, for instance in CI. |
| Installing dependencies fails with a 401 or 404 error | See [Registry access](#registry-access) and [Setting up access for CI and deployments](#setting-up-access-for-ci-and-deployments). |
