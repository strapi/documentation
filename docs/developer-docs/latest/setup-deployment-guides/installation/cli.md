---
title: Installing from CLI - Strapi Developer Documentation
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
---

<style lang="scss" scoped>
/*
    We override the :::warning and :::danger callouts for specific uses here.
    The CSS is scoped so this won't affect the rest of the docs.

    Eventually this will be turned into custom blocks or VuePress components,
    once I understand better how markdown-it and markdown-it-custom-block work.
  */
  .custom-block.congrats,
  .custom-block.danger {
    border-left-width: .25rem;
  }

  .custom-block.danger {
    margin-top: 2em;
    margin-bottom: 2em;

    .custom-block-title, p, li {
      color: rgb(44, 62, 80);
    }
    a {
      color: #007eff;
    }
  }

  .custom-block.danger {
    background-color: rgba(129,107,250, .05);
    border-color: rgb(129,107,250);

    .custom-block-title {
      color: rgb(129,107,250);
      font-weight: bold;
    }
  }

  .custom-block.details {
      color: rgb(44, 62, 80);
  }
</style>

# Installing from CLI

Strapi CLI (Command Line Interface) installation scripts are the fastest way to get Strapi running locally. The following guide is the installation option most recommended by Strapi.

## Preparing the installation

The CLI installation guide requires 2 softwares to be already installed on your computer:

- [Node.js](https://nodejs.org): only LTS versions are supported (version 12.x minimum). Other versions of Node.js may not be compatible with the latest release of Strapi. The 14.x version is most recommended by Strapi.
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install) (version 6.x minimum) or [yarn](https://yarnpkg.com/getting-started/install) to run the CLI installation scripts.

A database is also required for any Strapi project. Strapi currently supports the following databases:

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

## Creating a Strapi project

::: danger 🤓 CLI installation options
The following installation guide covers the most basic installation option using the CLI. There are however other options that can be used when creating a new Strapi project:

- Using the `--quickstart` flag at the end of the command to directly create the project in quickstart mode.
- Using the `--template` flag at the end of the command to create a project with pre-made Strapi configurations (see [Templates](templates.md)).

Strapi also offers a starters CLI to create a project with a pre-made frontend application (see [our dedicated blog post](https://strapi.io/blog/announcing-the-strapi-starter-cli)).
:::


1. In a terminal, run the following command:

:::: tabs card
::: tab npm
 ```sh
  npx create-strapi-app my-project
  ```
::: 
::: tab yarn
 ```sh
  yarn create strapi-app my-project
 ```
:::

2. Choose an installation type:
   * `Quickstart (recommended)`, which uses the default database (SQLite)
   * `Custom (manual settings)`, which allows to choose your preferred database

3. (Custom installation type only) Among the list of databases, choose a database for your Strapi project.

4. (Custom installation type only) Name your project's database.

## Running Strapi

To start the Strapi application, run the following command in the project folder:

:::: tabs card
::: tab npm
```bash
npm run develop
```
:::

::: tab yarn
```sh
yarn develop
```
:::

<!-- ### Creating a project with starters

A [starter](https://strapi.io/starters) is a premade front-end application linked to a [template](/developer-docs/latest/setup-deployment-guides/installation/templates.md) with pre-configured content types, components, dynamic zones or plugins. Using the starter CLI is the quickest way to kickstart a full stack project with Strapi.

To create a project with the starter CLI, run this command:

<code-group>
<code-block title="NPM">
```bash
npx create-strapi-starter my-project <starter-url>
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-starter my-project <starter-url>
```
</code-block>
</code-group>

where `<starter-url>` is the full Github URL for the starter, or its shorthand. The shorthand can be found at the bottom of the corresponding starter page.

This will create a mono repository, install dependencies, and start the application automatically.

:::tip
The project can be created from a specific branch, if specified in the url (e.g.: `https://github.com/strapi/strapi-starter-gatsby-blog/tree/<my-branch>`).
:::

If you need an application that is preconfigured for a specific use case, but the existing [starters](#creating-a-project-with-starters) do not suit your use case, you can use [Templates](/developer-docs/latest/setup-deployment-guides/installation/templates.md) or [create an empty project](/developer-docs/latest/setup-deployment-guides/installation/cli.md#creating-a-project-without-starters).
### Creating a project without starters

To quickly create an empty project, run this command:

<code-group>
<code-block title="NPM">
```sh
npx create-strapi-app my-project --quickstart
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-app my-project --quickstart
```
</code-block>
</code-group>

This will create a mono repository, install dependencies, and start the application automatically.

::: tip
The `--quickstart` flag sets the database to SQLite. To use another database, run the command without the flag, and select `Custom (manual settings)` when prompted for installation type.
:::

::: warning
When using a custom database, it has to be up and running before creating the Strapi project.
::: -->
