---
title: Installing from CLI - Strapi Developer Documentation
description: Fast-track local install for getting Strapi running on your computer in less than a minute.
---

# Installing from CLI

## Preparing the installation

Strapi CLI installation scripts are the fastest way to get Strapi running locally on your computer.

Strapi requires [Node.js](https://nodejs.org) and only supports its LTS versions. Other versions of Node.js may not be compatible with the latest release of Strapi.

| Software | Minimum version | Recommended version |
| -------- | --------------- | ------------------- |
| Node.js  | 12.x            | 14.x                |
| npm      | 6.x             | 6.x                 |

:::tip TIP
[yarn](https://yarnpkg.com/getting-started/install) can also be used to run Strapi CLI installation scripts.
:::

### Supported databases

Strapi currently supports the following databases:

| Database   | Minimum version |
| ---------- | --------------- |
| SQLite     | 3               |
| PostgreSQL | 10              |
| MySQL      | 5.6             |
| MariaDB    | 10.1            |
| MongoDB    | 3.6             |

<!-- TODO: Remove MongoDB for v4 -->

## Creating a Strapi project

1. Run the following command:

  <code-group>
  <code-block title="NPM">
  ```sh
  npx create-strapi-app my-project
  ```
  </code-block>

  <code-block title="YARN">
  ```sh
  yarn create strapi-app my-project
  ```
  </code-block>
  </code-group>

2. Choose installation type:
   * "Quickstart (recommended)" to use the default database (SQLite)
   * "Custom (manual settings)" to choose your database type
  
   and press Enter.

3. (Custom only):

  a. Choose your default database:

    [ insert database # and table ]

  b. Name your database


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


## Running Strapi

Creating a project using the [`--quickstart`](/developer-docs/latest/setup-deployment-guides/installation/cli.md#creating-a-project-without-starters) flag should automatically start the application.

To start the Strapi application, run the following command in the project folder:

<code-group>
<code-block title="NPM">
```bash
npm run develop
```
</code-block>

<code-block title="YARN">
```sh
yarn develop
```
</code-block>
</code-group>

