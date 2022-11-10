---
title: CLI
displayed_sidebar: devDocsSidebar
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/cli.html
---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

<InstallPrerequisites components={props.components} />

A database is also required for any Strapi project. Strapi currently supports the following databases:

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

:::strapi CLI installation options
The following installation guide covers the most basic installation option using the CLI. There are however other options that can be used when creating a new Strapi project:

- Using the `--quickstart` flag at the end of the command to directly create the project in quickstart mode.
<!-- 👇 Temporarily disabled while we update the Templates documentation -->
<!-- - Using the `--template` flag at the end of the command to create a project with pre-made Strapi configurations (see [Templates](./templates)). -->
- Using the `--typescript` flag (or the shorter version `--ts`) at the end of the command to create a project in [TypeScript](/dev-docs/development/typescript).
- Using the `--no-run` flag will prevent Strapi from automatically starting the server (useful in combination with `--quickstart`)

For more information on available flags, see our [CLI documentation](/docs/dev-docs/developer-resources/cli/cli).

Strapi also offers a starters CLI to create a project with a pre-made frontend application (see [our dedicated blog post](https://strapi.io/blog/announcing-the-strapi-starter-cli)).
:::

1. In a terminal, run the following command:

    <Tabs groupId="yarn-npm">

      <TabItem value="yarn" label="yarn">

      ```sh
      yarn create strapi-app my-project
      ```

      </TabItem>

      <TabItem value="npm" label="npm">

      ```sh
      npx create-strapi-app@latest my-project
      ```
      
      </TabItem>

    </Tabs>

2. Choose an installation type:

   - `Quickstart (recommended)`, which uses the default database (SQLite)
   - `Custom (manual settings)`, which allows to choose your preferred database

3. (Custom installation type only) Among the list of databases, choose a database for your Strapi project.

4. (Custom installation type only) Name your project's database.

:::tip
Experimental Strapi versions are released every Tuesday through Saturday at midnight GMT. You can create a new Strapi application based on the latest experimental release using `npx create-strapi-app@experimental`.

Please use these experimental builds at your own risk. It is not recommended to use them in production.
:::

## Running Strapi

To start the Strapi application, run the following command in the project folder:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn develop
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run develop
```

</TabItem>

</Tabs>
