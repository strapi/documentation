---
title: Install from CLI - Strapi Developer Documentation
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
---

# Installing from CLI

Fast-track local install for getting Strapi running on your computer.

[[toc]]

## Step 1: Make sure requirements are met

#### Node.js

Strapi only requires [Node.js](https://nodejs.org). Strapi only supports **LTS versions** of Node.js, the current recommended version to run Strapi is **Node LTS v14**. Other versions of Node.js may not be compatible with the latest release of Strapi.

This is everything you need to run Strapi on your local environment.

| Software | Minimum version | Recommended version |
| -------- | --------------- | ------------------- |
| Node.js  | 12.x            | 14.x                |
| npm      | 6.x             | 6.x                 |

#### Yarn (optional)

You can also use **yarn** if you want [here](https://yarnpkg.com/en/docs/getting-started) are the instructions to get started with it.

#### Databases

Strapi currently support the following databases.

::: warning WARNING
Starting from the release of Strapi v4, MongoDB is not supported natively anymore and no connector is available. For more information, please refer to [the official communication on the topic](https://strapi.io/blog/mongo-db-support-in-strapi-past-present-and-future).
:::

| Database   | Minimum version |
| ---------- | --------------- |
| SQLite     | 3               |
| PostgreSQL | 10              |
| MySQL      | 5.6             |
| MariaDB    | 10.1            |
| MongoDB    | 3.6             |

## Step 2: Create a new project

:::: tabs

::: tab yarn

To quickly create a blank project from scratch, run this command:

```bash
yarn create strapi-app my-project --quickstart
```

Alternatively, to use one of our [starters](https://strapi.io/starters), run this command instead:

```bash
yarn create strapi-starter my-project <starter-url>
```

:::

::: tab npx

To quickly create a blank project from scratch, run this command:

```bash
npx create-strapi-app my-project --quickstart
```

Alternatively, to use one of our [starters](https://strapi.io/starters), run this command instead:

```bash
npx create-strapi-starter my-project <starter-url>
```

:::

::::

::: tip
If you want to use specific database, you don't have to use the `--quickstart` flag. The CLI will let you choose the database of your choice. The `--quickstart` flag sets the database to SQLite.
:::

:::tip
By default, `create-strapi-app` will generate an empty Strapi project. If you want an application that is pre-configured for a specific use case, see the [Templates section](/developer-docs/latest/setup-deployment-guides/installation/templates.md).
:::

:::tip
When using a starter, the project can be created from a specific branch, for example with a url like this: `https://github.com/strapi/strapi-starter-gatsby-blog/tree/<my-branch>`.
:::

::: warning
If you use a custom database, it has to be up and running before creating your Strapi project
:::

## Step 3: Start the project

To start your Strapi application you will have to run the following command in your application folder.

:::: tabs

::: tab yarn

```bash
yarn develop
```

:::

::: tab npm

```bash
npm run develop
```

:::

::::

::: tip
If you created your application using `--quickstart` flag, it will automatically run your application.
:::
