---
title: SQLite - Strapi Developer Docs
description: Learn how you can use SQLite for your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/databases/sqlite.html
---

# SQLite Installation

SQLite is the default ([Quick Start](/developer-docs/latest/getting-started/quick-start.md)) and recommended database to quickly create an app locally.

## Install SQLite using starter

Use one of the following commands:

<code-group>

<code-block title="NPM">
```sh
npx create-strapi-app@latest my-project --quickstart
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-app my-project --quickstart
```
</code-block>

</code-group>

This will create a new project and launch it in the browser.

::: tip
The [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md) is a complete step-by-step tutorial.
:::

## Install SQLite manually

In terminal, run the following command:

<code-group>

<code-block title="NPM">
```sh
npm install better-sqlite3
```
</code-block>

<code-block title="YARN">
```sh
yarn install better-sqlite3
```
</code-block>

</code-group>

Add the following to your `./config/database.js` file:

```js
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

## Other SQL Databases (PostgreSQL, MySQL)

Refer to the [configuration section](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md) for all supported options to setup Strapi with your SQL database.

::: tip
Most cloud service providers offer a managed SQL database service, which is a hassle-free way to get your database up and running. To get up and running locally, you might want to try using a Docker container.
:::
