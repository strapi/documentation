---
title: SQLite
# displayed_sidebar: devDocsSidebar
description: Learn how you can use SQLite for your Strapi application.

---

# SQLite Installation

SQLite is the default ([Quick Start](/dev-docs/quick-start.md)) and recommended database to quickly create an app locally.

## Install SQLite during app creation

Use one of the following commands:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn create strapi-app my-project --quickstart
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npx create-strapi-app@latest my-project --quickstart
```

</TabItem>

</Tabs>

This will create a new project and launch it in the browser.

:::tip
The [Quick Start Guide](/dev-docs/quick-start.md) is a complete step-by-step tutorial.
:::

## Install SQLite manually

In a terminal, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add better-sqlite3
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install better-sqlite3
```

</TabItem>

</Tabs>

Add the following code to your `./config/database.js` or `./config/database.ts` file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/database.js"
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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/database.ts"
import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

</TabItem>

</Tabs>
