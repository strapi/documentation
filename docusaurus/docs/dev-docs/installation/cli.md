---
title: CLI
displayed_sidebar: devDocsSidebar
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
tags:
- installation
- Command Line Interface (CLI)
- database
- MySQL
- PostgreSQL
---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

<InstallPrerequisites components={props.components} />

A supported database is also required for any Strapi project:

| Database   | Recommended | Minimum |
| ---------- | ----------- | ------- |
| MySQL      | 8.0         | 8.0     |
| MariaDB    | 10.6        | 10.5    |
| PostgreSQL | 14.0        | 12.0    |
| SQLite     | 3           | 3       |

:::caution
Strapi does not support MongoDB.
:::

## Creating a Strapi project

Follow the steps below to create a new Strapi project, being sure to use the appropriate command for your installed package manager:

1. In a terminal, run the following command:

    <Tabs groupId="yarn-npm">

    <TabItem value="npm" label="NPM">

    ```bash
    npx create-strapi@latest
    ```

    <details>
    <summary>Additional explanations for the command:</summary>

    * `npx` runs a command from a npm package
    * `create-strapi` is the Strapi package
    * `@latest` indicates that the latest version of Strapi is used
    
    <br/>

    Instead of npx, the traditional npm command can be used too, with `npm create strapi@latest`.

    Please note the additional dash between create and strapi when using npx: `npx create-strapi` vs. `npm create strapi`.
    </details>
    
    </TabItem>

    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn create strapi
   
    ```

    :::note
    Yarn does not support passing the version tag such as `@latest`, as opposed to npm. If you experience unexpected results with yarn and the latest version of Strapi is not installed, you might need to [run the `yarn cache clean` command](https://yarnpkg.com/cli/cache/clean) to clean your Yarn cache.
    :::

    </TabItem>

    <TabItem value="pnpm" label="pnpm">

    ```bash
    pnpm create strapi
    ```
    
    </TabItem>

    </Tabs>

2. The terminal will ask you whether you want to `Login/Signup` to Strapi Cloud (and start using your free 14-day trial projects), or `Skip` this step. Use arrow keys and press `Enter` to make your choice. If you choose to skip this step, you will need to [host the project yourself](#skipping-the-strapi-cloud-login-step).

2. The terminal will ask you a few questions. For each of them, if you press `Enter` instead of typing something, the default answer (Yes) will be used:

  ![Terminal prompts at installation](/img/assets/installation/prompts.png)

  :::tip
  You can skip these questions using various options passed to the installation command. Please refer to the [table](#cli-installation-options) for the full list of available options.
  :::

3. _(optional)_ If you answered `n` for "no" to the default (SQLite) database question, the CLI will ask for more questions about the database:

    * Use arrow keys to select the database type you want, then press `Enter`.
    * Give the database a name, define the database host address and port, define the database admin username and password, and define whether the database will use a SSL connection.<br/>For any of these questions, if you press `Enter` without typing anything, the default value (indicated in parentheses in the terminal output) will be used.

Once all questions have been answered, the script will start creating the Strapi project.

:::caution
If the browser didn't respond you might need to disable any razer processes running in the background.
:::

### CLI installation options

The above installation guide only covers the basic installation option using the CLI. There are other options that can be used when creating a new Strapi project, for example:

| Option | Description |
|--------|---------------------------------------------------------|
| `--no-run` | Do not start the application after it is created |
| `--ts`<br/>`--typescript` | Initialize the project with TypeScript (default) |
| `--js`<br/>`--javascript` | Initialize the project with JavaScript  |
| `--use-npm` | Force the usage of [npm](https://www.npmjs.com/) as the project package manager |
| `--use-yarn` | Force the usage of [yarn](https://yarnpkg.com/) as the project package manager |
| `--use-pnpm` | Force the usage of [pnpm](https://pnpm.io/) as the project package manager |
| `--install`  | Install all dependencies, skipping the related CLI prompt |
| `--no-install`  | Do not install all dependencies, skipping the related CLI prompt |
| `--git-init` | Initialize a git repository, skipping the related CLI prompt |
| `--no-git-init` | Do not initialize a git repository, skipping the related CLI prompt |
| `--example`  | Add example data, skipping the related CLI prompt |
| `--no-example`  | Do not add example data, skipping the related CLI prompt |
| `--skip-cloud` |  Skip [Strapi Cloud login and project creation steps](#skipping-the-strapi-cloud-login-step) |
| `--skip-db` | Skip all database-related prompts and create a project with the default (SQLite) database |
| `--template <template-name-or-url>` | Create the application based on a given template.<br/>Additional options for templates are available, see the [templates documentation](/dev-docs/templates) for details. |
| `--dbclient <dbclient>` | Define the database client to use by replacing `<dbclient>` in the command by one of the these values:<ul><li>`sql` for a SQLite database (default)</li><li>`postgres` for a PostgreSQL database</li><li>`mysql` for a MySQL database</li></ul> |
| `--dbhost <dbhost>` | Define the database host to use by replacing `<dbclient>` in the command by the value of your choice |
| `--dbport <dbport>` | Define the database port to use by replacing `<dbclient>` in the command by the value of your choice |
| `--dbname <dbname>` | Define the database name to use by replacing `<dbclient>` in the command by the value of your choice |
| `--dbusername <dbusername>` | Define the database username to use by replacing `<dbclient>` in the command by the value of your choice |
| `--dbpassword <dbpassword>` | Define the database password to use by replacing `<dbclient>` in the command by the value of your choice |
| `--dbssl <dbssl>` | Define that SSL is used with the database, by passing `--dbssl=true` (No SSL by default) |
| `--dbfile <dbfile>` | For SQLite databases, define the database file path to use by replacing `<dbclient>` in the command by the value of your choice |
| `--quickstart` | (**Deprecated in Strapi 5**)<br/>Directly create the project in quickstart mode. |

:::note Notes
* If you do not pass a `--use-yarn|npm|pnpm` option, the installation script will use whatever package manager was used with the create command to install all dependencies (e.g., `npm create strapi` will install all the project's dependencies with npm).
* For additional information about database configuration, please refer to the [database configuration documentation](/dev-docs/configurations/database#configuration-structure).
* Experimental Strapi versions are released every Tuesday through Saturday at midnight GMT. You can create a new Strapi application based on the latest experimental release using `npx create-strapi@experimental`. Please use these experimental builds at your own risk. It is not recommended to use them in production.
:::

### Skipping the Strapi Cloud login step

When the installation script runs, the terminal will first ask you if you want to login/signup. Choosing `Login/signup` will create a free, 14-day trial [Strapi Cloud](/cloud/intro#what-is-strapi-cloud) project as described in the [Quick Start Guide](/dev-docs/quick-start).

If you prefer skipping this Strapi Cloud login part, use the arrow keys to select `Skip`. The script will resume and create a local project. To deploy this project and host it online, you could later choose to:

- host it yourself by pushing the project's code to a repository (e.g., on GitHub) before following the [deployment guide](/dev-docs/deployment),
- or use the [Cloud CLI](/cloud/cli/cloud-cli#) commands to login to Strapi Cloud and deploy your project there.

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
