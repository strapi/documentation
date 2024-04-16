---
sidebar_label: 'Cloud CLI'
displayed_sidebar: cloudSidebar
sidebar_position: 3
---

# Command Line Interface (CLI)

Strapi Cloud comes with a Command Line Interface (CLI) which allows you to log in and out, and to deploy a project that is not stored in a git repository.

:::prerequisites
To be able to fully use the Strapi Cloud CLI, make sure to fit the following prerequisites:
- Have a Google, GitHub or GitLab account, to be able to log into Strapi Cloud.
- Have an already created Strapi project, stored locally, to be able to deploy it with the CLI. The project must be less than 100MB. All CLI commands must be run from the folder of that Strapi project.
- Have available storage in your hard drive where the temporary folder of your operating system is stored.
:::

## strapi login

Log in Strapi Cloud.

```bash
strapi login
```

This command automatically opens a browser window to access and log into the Strapi Cloud dashboard. If the browser window doesn't automatically open, the terminal will display a clickable link to the dashboard as well as a code to enter manually.

## strapi deploy

Deploy a new project (< 100MB), not stored in a git repository, in Strapi Cloud.

```bash
strapi deploy
```

This command must be used after the `login` one. It deploys a local Strapi project on Strapi Cloud, without having to store it on a git repository beforehand. The terminal will display a progress bar until the project is successfully deployed on Strapi Cloud.

Once the project is first deployed on Strapi Cloud via the CLI, the `deploy` command can be reused to trigger a new deployment of the same project.

:::caution
The `deploy` command can only be used by new users who have never created a Strapi Cloud project, and for which the free trial is still available. Once a project is deployed with the CLI, it isn't possible to deploy another project on the same Strapi Cloud account via the CLI.
:::

## strapi logout

Log out of Strapi Cloud.

```bash
strapi logout
```

This command logs you out of the Strapi Cloud dashboard. Once the `logout` command is run, the terminal will display a confirmation message that you were successfully logged out, and you will not be able to use the `deploy` command anymore.