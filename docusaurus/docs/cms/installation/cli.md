---
title: CLI
displayed_sidebar: cmsSidebar
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
pagination_prev: cms/installation
pagination_next: cms/installation/docker
tags:
- installation
- Command Line Interface (CLI)
- database
- MySQL
- PostgreSQL
---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'
import SupportedDatabases from '/docs/snippets/supported-databases.md'

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

<InstallPrerequisites components={props.components} />
A supported database is also required for any Strapi project:
<SupportedDatabases components={props.components} />

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

    :::tip
    The older `npx create-strapi-app@latest` command still works and will provide the exact same experience as the newer `npx create-strapi@latest` command.
    :::

    Instead of npx, the traditional npm command can be used too, with `npm create strapi@latest`.

    Please note the additional dash between create and strapi when using npx: `npx create-strapi` vs. `npm create strapi`.
    </details>
    
    </TabItem>

    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn create strapi
   
    ```

    :::note
    Yarn does not support passing the version tag such as `@latest`, as opposed to npm. If you experience unexpected results with yarn and the latest version of Strapi is not installed, you might need to <ExternalLink to="https://yarnpkg.com/cli/cache/clean" text="run the `yarn cache clean` command"/> to clean your Yarn cache.
    :::

    </TabItem>

    <TabItem value="pnpm" label="pnpm">

    :::caution
    You might have issues with projects created with pnpm on Strapi Cloud. Strapi Cloud does not support pnpm yet, so it's recommended to use yarn or npm if you plan to eventually host your project on Strapi Cloud.
    :::

    ```bash
    pnpm create strapi
    ```
    
    </TabItem>

    </Tabs>

2. The terminal will ask you whether you want to `Login/Signup` or `Skip` this step. Use arrow keys and press `Enter` to make your choice. If you choose to login, you'll receive a 30-day trial of the <GrowthBadge /> plan that will be automatically applied to your created project. If you skip this step, the project will fall back to the CMS Free plan.

3. The terminal will ask you a few questions. For each of them, if you press `Enter` instead of typing something, the default answer (Yes) will be used:

  ![Terminal prompts at installation](/img/assets/installation/prompts.png)

  :::tip
  You can skip these questions using various options passed to the installation command. Please refer to the [table](#cli-installation-options) for the full list of available options.
  :::

4. _(optional)_ If you answered `n` for "no" to the default (SQLite) database question, the CLI will ask for more questions about the database:

    * Use arrow keys to select the database type you want, then press `Enter`.
    * Give the database a name, define the database host address and port, define the database admin username and password, and define whether the database will use a SSL connection.<br/>For any of these questions, if you press `Enter` without typing anything, the default value (indicated in parentheses in the terminal output) will be used.

Once all questions have been answered, the script will start creating the Strapi project.

### CLI installation options

The above installation guide only covers the basic installation option using the CLI. There are other options that can be used when creating a new Strapi project, for example:

| Option                              | Description                                                                                                                                                                                                                                     |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--no-run`                          | Do not start the application after it is created                                                                                                                                                                                                |
| `--ts`<br/>`--typescript`           | Initialize the project with TypeScript (default)                                                                                                                                                                                                |
| `--js`<br/>`--javascript`           | Initialize the project with JavaScript                                                                                                                                                                                                          |
| `--use-npm`                         | Force the usage of <ExternalLink to="https://www.npmjs.com/" text="npm"/> as the project package manager                                                                                                                                        |
| `--use-yarn`                        | Force the usage of <ExternalLink to="https://yarnpkg.com/" text="yarn"/> as the project package manager                                                                                                                                         |
| `--use-pnpm`                        | Force the usage of <ExternalLink to="https://pnpm.io/" text="pnpm"/> as the project package manager                                                                                                                                             |
| `--install`                         | Install all dependencies, skipping the related CLI prompt                                                                                                                                                                                       |
| `--no-install`                      | Do not install all dependencies, skipping the related CLI prompt                                                                                                                                                                                |
| `--git-init`                        | Initialize a git repository, skipping the related CLI prompt                                                                                                                                                                                    |
| `--no-git-init`                     | Do not initialize a git repository, skipping the related CLI prompt                                                                                                                                                                             |
| `--example`                         | Add example data, skipping the related CLI prompt                                                                                                                                                                                               |
| `--no-example`                      | Do not add example data, skipping the related CLI prompt                                                                                                                                                                                        |
| `--skip-cloud`                      | Skip [Strapi login and project creation steps](#skipping-the-strapi-login-step)                                                                                                                                                     |
| `--non-interactive`                 | Skip all interactive prompts and use defaults (TypeScript, install dependencies, initialize git, SQLite database, no A/B tests). The `<directory>` argument is required when using this flag.                                        |
| `--enable-ab-tests`<br/>`--no-enable-ab-tests` | Enable or disable anonymous A/B testing, skipping the related CLI prompt                                                                                                                                                  |
| `--skip-db`                         | Skip all database-related prompts and create a project with the default (SQLite) database                                                                                                                                                       |
| `--template <template-name-or-url>` | Create the application based on a given template.<br/>Additional options for templates are available, see the [templates documentation](/cms/templates) for details.                                                                            |
| `--dbclient <dbclient>`             | Define the database client to use by replacing `<dbclient>` in the command by one of the these values:<ul><li>`sql` for a SQLite database (default)</li><li>`postgres` for a PostgreSQL database</li><li>`mysql` for a MySQL database</li></ul> |
| `--dbhost <dbhost>`                 | Define the database host to use by replacing `<dbhost>` in the command by the value of your choice                                                                                                                                              |
| `--dbport <dbport>`                 | Define the database port to use by replacing `<dbport>` in the command by the value of your choice                                                                                                                                              |
| `--dbname <dbname>`                 | Define the database name to use by replacing `<dbname>` in the command by the value of your choice                                                                                                                                              |
| `--dbusername <dbusername>`         | Define the database username to use by replacing `<dbusername>` in the command by the value of your choice                                                                                                                                      |
| `--dbpassword <dbpassword>`         | Define the database password to use by replacing `<dbpassword>` in the command by the value of your choice                                                                                                                                      |
| `--dbssl <dbssl>`                   | Define that SSL is used with the database, by passing `--dbssl=true` (No SSL by default)                                                                                                                                                        |
| `--dbfile <dbfile>`                 | For SQLite databases, define the database file path to use by replacing `<dbclient>` in the command by the value of your choice                                                                                                                 |
| `--quickstart`                      | (**Deprecated in Strapi 5**)<br/>Directly create the project in quickstart mode. Use `--non-interactive` instead.                                                                                                                               |

:::note Notes
* If you do not pass a `--use-yarn|npm|pnpm` option, the installation script will use whatever package manager was used with the create command to install all dependencies (e.g., `npm create strapi` will install all the project's dependencies with npm).
* For additional information about database configuration, please refer to the [database configuration documentation](/cms/configurations/database).
* Experimental Strapi versions are released every Tuesday through Saturday at midnight GMT. You can create a new Strapi application based on the latest experimental release using `npx create-strapi@experimental`. Please use these experimental builds at your own risk. It is not recommended to use them in production.
:::

### Skipping the Strapi login step

When the installation script runs, the terminal will first ask you if you want to login/signup. Choosing `Login/signup` will provide you with a 30-day trial of the <GrowthBadge tooltip="The CMS Growth plan includes the Live Preview, Releases, and Content History features."/> that will be automatically applied to your created project. This will give you access to advanced CMS features.

If you prefer skipping this Strapi login part, use the arrow keys to select `Skip`. The script will resume and create a local project using the CMS Free plan.

You will be able to purchase a CMS license later by checking out our <ExternalLink to="https://strapi.io/pricing-self-hosted" text="pricing page"/>.

### Hosting your project

You can create a free [Strapi Cloud](/cloud/intro) project. To deploy this project and host it online, you can choose to:

- host it yourself by pushing the project's code to a repository (e.g., on GitHub) before following the [deployment guide](/cms/deployment),
- or use the [Cloud CLI](/cloud/cli/cloud-cli#) commands to login to Strapi Cloud and deploy your project there for free.

If you want to host your project yourself and are not already familiar with GitHub, the following togglable content should get you started👇.

<details>
<summary>Steps required to push your Strapi project code to GitHub:</summary>

1. In the terminal, ensure you are still in the folder that hosts the Strapi project you created.
2. Run the `git init` command to initialize git for this folder.
3. Run the `git add .` command to add all modified files to the git index.
4. Run the `git commit -m "Initial commit"` command to create a commit with all the added changes.
5. Log in to your GitHub account and <ExternalLink to="https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories" text="create a new repository"/>. Give the new repository a name, for instance `my-first-strapi-project`, and remember this name.
6. Go back to the terminal and push your local repository to GitHub:

  a. Run a command similar to the following: `git remote add origin git@github.com:yourname/my-first-strapi-project.git`, ensuring you replace `yourname` by your own GitHub profile name, and `my-first-strapi-project` by the actual name you used at step 4.

  b. Run the `git push --set-upstream origin main` command to finally push the commit to your GitHub repository.

Additional information about using git with the command line interface can be found in the <ExternalLink to="https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#adding-a-local-repository-to-github-using-git" text="official GitHub documentation"/>.

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
For self-hosted Strapi projects, all your content is saved in a database file (by default, SQLite) found in the `.tmp` subfolder in your project's folder. So anytime you start the Strapi application from the folder where you created your Strapi project, your content will be available (see [database configuration](/cms/configurations/database) for additional information).

If the content was added to a Strapi Cloud project, it is stored in the database managed with your Strapi Cloud project (see [advanced database configuration for Strapi Cloud](/cloud/advanced/database) for additional information).
:::