# SQLite Installation

SQLite is the default ([Quick Start](/developer-docs/latest/getting-started/quick-start.md)) and recommended database to quickly create an app locally.

## Install SQLite locally

Simply use one of the following commands.

:::: tabs

::: tab yarn

```bash
yarn create strapi-app my-project --quickstart
```

:::

::: tab npx

```bash
npx create-strapi-app my-project --quickstart
```

:::

::::

This will create a new project and launch it in the browser.

::: tip
The [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md) is a complete step-by-step tutorial
:::

## Other SQL Databases (PostgreSQL, MySQL)

Refer to the [configuration section](/developer-docs/latest/setup-deployment-guides/configurations.md#database) for all supported options to setup Strapi with your SQL database.

::: tip
Most cloud service providers offer a managed SQL database service, which is a hassle-free way to get your database up and running. To get up and running locally, you might want to try using a Docker container.
:::
