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

    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn create strapi-app my-project
    # 'yarn create' creates a new project
    # 'strapi-app' is the Strapi package
    # 'my-project' is the name of your Strapi project
    ```
    
    </TabItem>

    <TabItem value="npm" label="NPM">

    ```bash
    npx create-strapi-app@latest my-project
    # 'npx' runs a command from an npm package
    # 'create-strapi-app' is the Strapi package
    # '@latest' indicates that the latest version of Strapi is used
    # 'my-project' is the name of your Strapi project
    ```
    
    </TabItem>

    </Tabs>

2. Choose an installation type:

   - `Quickstart (recommended)`, which uses the default database (SQLite)
   - `Custom (manual settings)`, which allows to choose your preferred database

3. (Custom installation type only) Among the list of databases, choose a database for your Strapi project.

4. (Custom installation type only) Name your project's database.

### CLI installation options

The above installation guide only covers the basic installation option using the CLI. There are other options that can be used when creating a new Strapi project, for example:

- `--quickstart`: Directly create the project in quickstart mode.
- `--template`: Create a project with pre-made Strapi configurations (see [Templates](/dev-docs/templates)).
- `--typescript`/`--ts`: Create a project in [TypeScript](/dev-docs/typescript).
- `--no-run`: Prevent Strapi from automatically starting the server (useful in combination with `--quickstart`).

For more information on available flags, see our [CLI documentation](/dev-docs/cli).

Strapi also offers a starters CLI to create a project with a pre-made frontend application (see [our dedicated blog post](https://strapi.io/blog/announcing-the-strapi-starter-cli)).

:::tip
Experimental Strapi versions are released every Tuesday through Saturday at midnight GMT. You can create a new Strapi application based on the latest experimental release using `npx create-strapi-app@experimental`.

Please use these experimental builds at your own risk. It is not recommended to use them in production.
:::

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
