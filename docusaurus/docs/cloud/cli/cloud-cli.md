---
sidebar_label: 'Cloud CLI'
displayed_sidebar: cloudSidebar
sidebar_position: 3
---

# Command Line Interface (CLI)

Strapi Cloud comes with a Command Line Interface (CLI) which allows you to log in and out, and to deploy a project that is not hosted on a remote git repository. The CLI works with both the `yarn` and `npm` package managers.

The Cloud CLI is designed as a CLI-only experience, meaning that users who wish to use Strapi Cloud to deploy their project with the CLI will have to mostly stick to using the CLI (e.g. if you login with the CLI you must logout with the CLI as well, your project deployed with the CLI can only be redeployed with the CLI etc.).

:::note
It is recommended to install Strapi locally only, which requires prefixing all of the following `strapi` commands with the package manager used for the project setup (e.g `npm run strapi help` or `yarn strapi help`) or a dedicated node package executor (e.g. `npx strapi help`).
:::

<!-- Do we need to repeat the prerequisites here?
:::prerequisites
To be able to fully use the Strapi Cloud CLI, make sure to fit the following prerequisites:
- Have a Google, GitHub or GitLab account, to be able to log into Strapi Cloud.
- Have an already created Strapi project, stored locally, to be able to deploy it with the CLI. The project must be less than 100MB. All CLI commands must be run from the folder of that Strapi project.
- Have available storage in your hard drive where the temporary folder of your operating system is stored.
:::
-->

## strapi login

**Alias:** `strapi cloud:login`

Log in Strapi Cloud.

```bash
strapi login
```

This command automatically opens a browser window to log into Strapi Cloud via Google, GitHub or GitLab. Once the browser window confirms successful login, it can be safely closed.

If the browser window doesn't automatically open, the terminal will display a clickable link as well as a code to enter manually.

## strapi deploy

**Alias:** `strapi cloud:deploy`

Deploy a new project (< 100MB), not stored in a git repository, in Strapi Cloud.

```bash
strapi deploy
```

This command must be used after the `login` one. It deploys a local Strapi project on Strapi Cloud, without having to store it on a git repository beforehand. The terminal will display a progress bar until the project is successfully deployed on Strapi Cloud.

Once the project is first deployed on Strapi Cloud with the CLI, the `deploy` command can be reused to trigger a new deployment of the same project.

:::caution
The `deploy` command can only be used by new users who have never created a Strapi Cloud project, and for which the free trial is still available. Once a project is deployed with the CLI, it isn't possible to deploy another project on the same Strapi Cloud account with the CLI.
:::

:::note
Once you deployed your project, if you visit the Strapi Cloud dashboard, you may see some limitations as well as impacts due to creating a Strapi Cloud project that is not in a repository and which was deployed with the CLI.

- Some areas in the dashboard that are usually reserved to display information about the git provider will be blank.
- Some buttons, such as the **Trigger deploy** button, will be greyed out and unclickable since you can only redeploy your project using the CLI.
- Options such as environment variables, and features like the logs, are not available for CLI-created projects. <!-- to be confirmed -->
:::

## strapi logout

**Alias:** `strapi cloud:logout`

Log out of Strapi Cloud.

```bash
strapi logout
```

This command logs you out of Strapi Cloud. Once the `logout` command is run, the terminal will display a confirmation message that you were successfully logged out, and you will not be able to use the `deploy` command anymore.