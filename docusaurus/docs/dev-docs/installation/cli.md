---
title: CLI
displayed_sidebar: devDocsSidebar
description: Fast-track local install for getting Strapi running on your computer in less than a minute.

---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

<InstallPrerequisites components={props.components} />

A supported database is also required for any Strapi project:

| Database   | Minimum | Recommended |
|------------|---------|-------------|
| MySQL      | 5.7.8   | 8.0         |
| MariaDB    | 10.3    | 10.6        |
| PostgreSQL | 11.0    | 14.0        |
| SQLite     | 3       | 3           |

:::caution
Strapi v4 does not support MongoDB.
:::

## Creating a Strapi project

Follow the steps below to create a new Strapi project, being sure to use the appropriate command for your installed package manager:

1. In a terminal, run the following command:

    <Tabs groupId="yarn-npm">

    <TabItem value="npm" label="NPM">

    ```bash
    npx create-strapi-app@4.25.19 my-project
    # 'npx' runs a command from an npm package
    # 'create-strapi-app' is the Strapi package
    # '@4.25.19' indicates which version of Strapi to install 
    # 'my-project' is the name of your Strapi project
    ```
    :::tip
    Please refer to the [releases notes on GitHub](https://github.com/strapi/strapi/releases) to find the latest 4.x.x version number.
    :::
    
    </TabItem>
    
    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn create strapi-app my-project
    # 'yarn create' creates a new project
    # 'strapi-app' is the Strapi package
    # 'my-project' is the name of your Strapi project
    ```
    
    </TabItem>

    </Tabs>

1. Choose an installation type:

   - `Quickstart (recommended)`, which uses the default database (SQLite)
   - `Custom (manual settings)`, which allows to choose your preferred database

2. (Custom installation type only) Among the list of databases, choose a database for your Strapi project.

3. (Custom installation type only) Name your project's database.

### CLI installation options

The above installation guide only covers the basic installation option using the CLI. There are other options that can be used when creating a new Strapi project, for example:

- `--quickstart`: Directly create the project in quickstart mode.
- `--template`: Create a project with pre-made Strapi configurations (see [Templates](/dev-docs/templates)).
- `--typescript`/`--ts`: Create a project in [TypeScript](/dev-docs/typescript).
- `--no-run`: Prevent Strapi from automatically starting the server (useful in combination with `--quickstart`).

- `--skip-cloud`: Automatically answers "Skip" to the Login/Signup question, which prevents the installation script from login into Strapi Cloud (useful in combination with `--quickstart`).

For more information on available flags, see our [CLI documentation](/dev-docs/cli).

Strapi also offers a starters CLI to create a project with a pre-made frontend application (see [our dedicated blog post](https://strapi.io/blog/announcing-the-strapi-starter-cli)).

### Skipping the Strapi Cloud login step

When the installation script runs, the terminal will first ask you if you want to login/signup. Choosing `Login/signup` will create a free, 14-day trial [Strapi Cloud](/cloud/intro#what-is-strapi-cloud) project as described in the [Quick Start Guide](/dev-docs/quick-start).

If you prefer skipping this Strapi Cloud login part, use the arrow keys to select `Skip`. The script will resume and create a local project. To deploy this project and host it online, you could later choose to:
- host it yourself by pushing the project's code to a repository (e.g., on GitHub) before following a [3rd-party deployment guide](/dev-docs/deployment),
- or use the [Cloud CLI](/cloud/cli/cloud-cli) commands to login to Strapi Cloud and deploy your project there.

If you want to host your project yourself and are not already familiar with GitHub, the following togglable content should get you started👇.

<details>
<summary>Steps required to push your Strapi project code to GitHub:</summary>

1. In the terminal, ensure you are still in the folder that hosts the Strapi project you created.
2. Run the `git init` command to initialize git for this folder.
3. Run the `git add .` command to add all modified files to the git index.
4. Run the `git commit -m "Initial commit"` command to create a commit with all the added changes.
5. Log in to your GitHub account and [create a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories). Give the new repository a name, for instance `my-first-strapi-project`, and remember this name.
6. Go back to the terminal and push your local repository to GitHub:

  a. Run a command similar to the following: `git remote add origin git@github.com:yourname/my-first-strapi-project.git`, ensuring you replace `yourname` by your own GitHub profile name, and `my-first-strapi-project` by the actual name you used at step 4.

  b. Run the `git push --set-upstream origin main` command to finally push the commit to your GitHub repository.

Additional information about using git with the command line interface can be found in the [official GitHub documentation](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#adding-a-local-repository-to-github-using-git).

</details>



## Running Strapi

To start the Strapi application, run the following command in the project folder:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn develop
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run develop
```

</TabItem>

</Tabs>

:::info Where is my content?
For self-hosted Strapi projects, all your content is saved in a database file (by default, SQLite) found in the `.tmp` subfolder in your project's folder. So anytime you start the Strapi application from the folder where you created your Strapi project, your content will be available (see [database configuration](/dev-docs/configurations/database) for additional information).

If the content was added to a Strapi Cloud project, it is stored in the database managed with your Strapi Cloud project (see [advanced database configuration for Strapi Cloud](/cloud/advanced/database) for additional information).
:::
