---
title: Install from CLI - Strapi Developer Documentation
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
---

# Installing from CLI

To install Strapi locally, use our CLI tools.

[[toc]]
<!-- ? should we keep inline TOCs ? -->

## Step 1: Make sure requirements are met

#### Node.js

Strapi only requires [Node.js](https://nodejs.org). Strapi only supports **LTS versions** of Node.js, the current recommended version to run Strapi is **Node LTS v14**. Other versions of Node.js may not be compatible with the latest release of Strapi.

This is everything Strapi needs to run on a local environment:

| Software | Minimum version | Recommended version |
| -------- | --------------- | ------------------- |
| Node.js  | 12.x            | 14.x                |
| npm      | 6.x             | 6.x                 |

#### Yarn (optional)

[yarn](https://yarnpkg.com/getting-started/install) can also be used to run Strapi CLI tools.

#### Databases

Strapi currently supports the following databases:

| Database   | Minimum version |
| ---------- | --------------- |
| SQLite     | 3               |
| PostgreSQL | 10              |
| MySQL      | 5.6             |
| MariaDB    | 10.1            |
| MongoDB    | 3.6             |

<!-- TODO: Remove MongoDB for v4 -->

## Step 2: Create a new project

### Creating a project with starters

[Starters](https://strapi.io/starters) are the quickest way to kickstart a fullstack project with Strapi. To use one, run this command:

<code-group>
<code-block title="YARN">

```sh
yarn create strapi-starter my-project <starter-url>
```

</code-block>

<code-block title="NPX">

```bash
npx create-strapi-starter my-project <starter-url>
```

</code-block>
</code-group>

This creates a monorepo, installs dependencies, and runs the project automatically. The project file structure looks similar to this:

```sh
my-project
  /frontend // starter folder
  /backend  // template folder
```

:::tip
The project can be created from a specific branch, for example with a url like: `https://github.com/strapi/strapi-starter-gatsby-blog/tree/<my-branch>`.
:::

### Creating a project without starters

To quickly create an empty project, run this command:

<code-group>
<code-block title="YARN">
```sh
yarn create strapi-app my-project --quickstart
```
</code-block>

<code-block title="NPX">
<!-- ? should we call these tabs NPM or NPX? -->
```sh
npx create-strapi-app my-project --quickstart
```
</code-block>
</code-group>

::: tip
The `--quickstart` flag sets the database to SQLite.  If you need another database, don't use this flag and the CLI will prompt you to choose one.
:::

::: warning
If you use a custom database, it has to be up and running before creating your Strapi project.
:::

If you want an application that is pre-configured for a specific use case, but [starters](#creating-a-project-with-starters) do not suit your use case, see [Templates](/developer-docs/latest/setup-deployment-guides/installation/templates.md) documentation.

## Step 3: Start the project

To start Strapi, run the following command in the project folder:

<code-group>
<code-block title="YARN">
```sh
yarn develop
```
</code-block>

<code-block title="NPM">
```bash
npm run develop
```
</code-block>
</code-group>

::: tip
Creating a project using the `--quickstart` flag or with a [starter](#creating-a-project-with-starters) should automatically run your application.
:::
