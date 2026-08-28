---
title: Database migrations
description: Strapi database migrations are ways to modify the database
---

# Database migrations

<Tldr>
Database migrations run one-time scripts before the schema sync to preserve data during upgrades. Migration files export an `up()` function and run once, in alphabetical order. During the schema sync that follows, Strapi drops the tables, columns, indexes, and foreign keys it previously managed that are no longer in the content-types schemas.
</Tldr>

Database migrations exist to run one-time queries against the database, typically to modify the tables structure or the data when upgrading the Strapi application. These migrations are run automatically when the application starts and are executed before the automated schema sync that Strapi also performs on boot.

:::callout 🚧  Experimental feature
Database migrations are experimental. This feature is still a work in progress and will continue to be updated and improved. In the meantime, feel free to ask for help on <ExternalLink to="https://github.com/strapi/strapi/discussions" text="GitHub Discussions"/> or on the community <ExternalLink to="https://discord.strapi.io" text="Discord"/>.
:::

## Understanding database migration files

Migrations are run using JavaScript migration files stored in `./database/migrations`.

Strapi automatically detects migration files and run them once at the next startup in alphabetical order. Every new file is executed once.

### What happens on startup {#startup-sequence}

Understanding the order of operations helps predict what happens to your data. On every startup, Strapi performs the following steps:

1. Strapi loads the schema: content-types and components are converted into database models, then relations are validated.
2. Strapi runs the pending migrations: your migration files in `/database/migrations` run first, followed by Strapi's own internal migrations. Each migration runs in its own transaction, and applied migrations are tracked so they never run twice.
3. Strapi syncs the database schema: it compares the content-types schemas with the database, then applies the differences. Tables and columns are created first, then the tables that are no longer part of the schemas are dropped, then the remaining tables are altered.
4. Strapi persists the new schema: the resulting schema is stored in the database and becomes the reference for the next startup.

:::note
Migrations run before the schema sync, so an `up()` function still sees the database in its previous state. Write migrations against the old schema, not the one you are migrating to.
:::

:::note
Steps 2 and 3 are skipped entirely when there is no pending migration and the schema has not changed since the last startup. Strapi detects changes by comparing the content-types schemas, not by inspecting the database, so manual changes made directly to the database are not detected or reverted.
:::

### Data loss during the schema sync {#data-loss}

During the schema sync, Strapi drops the tables, columns, indexes, and foreign keys that it previously managed and that no longer match the content-types schemas. This happens automatically, without any warning or confirmation prompt, and identically in development and in production. Deleting a content-type from your code therefore deletes its table, and its data, on the next startup.

Tables that Strapi has never managed, such as tables you created yourself directly in the database, are left untouched.

Migrations are the way to preserve data across such changes: use them to copy or transform data before the schema sync removes the old structure.

:::warning
Strapi does not support down migrations. If you need to revert a migration, you have to do it manually. Down migrations are planned, but no timeline is currently available.
:::

:::tip
The `forceMigration` [database configuration parameter](/cms/configurations/database#settings-configuration-object) controls this behavior. Setting it to `false` skips every drop operation. The new schema is still recorded as the reference, so an object whose deletion was skipped stops being tracked by Strapi and is not dropped if you later set the parameter back to `true`. The `runMigrations` parameter only controls whether your own files in `/database/migrations` run, and has no effect on the schema sync.
:::

Migration files should export the function `up()`, which is used when upgrading (e.g. adding a new table `my_new_table`).

The `up()` function runs in a database transaction which means if a query fails during the migration, the whole migration is cancelled, and no changes are applied to the database. If another transaction is created within the migration function, it will act as a nested transaction.

:::note
There is no CLI to manually execute the database migrations.
:::

## Creating a migration file

To create a migration file:

1. In the `./database/migrations` folder, create a new file named after the date and the name of the migration (e.g. `2022.05.10T00.00.00.name-of-my-migration.js`). Make sure that the file name follows this naming pattern, because the alphabetical order of the files defines the order in which the migrations have to run.

2. Copy and paste the following template in the previously created file:

```jsx
'use strict'

async function up(knex) {}

module.exports = { up };
```

3. Fill in the template by adding actual migration code inside the `up()` function.
`up()` receives a <ExternalLink to="https://knexjs.org/" text="Knex instance"/>, already in a transaction state, that can be used to run the database queries.

<details>
<summary>Example of migration file</summary>

```jsx title="./database/migrations/2022.05.10T00.00.00.name-of-my-migration.js"

module.exports = {
  async up(knex) {
    // You have full access to the Knex.js API with an already initialized connection to the database

    // Example: renaming a table
    await knex.schema.renameTable('oldName', 'newName');

    // Example: renaming a column
    await knex.schema.table('someTable', table => {
      table.renameColumn('oldName', 'newName');
    });

    // Example: updating data
    await knex.from('someTable').update({ columnName: 'newValue' }).where({ columnName: 'oldValue' });
  },
};
```

</details>

### Using Strapi Instance for migrations

:::danger
If a user opts not to use Knex directly for migrations and instead utilizes the Strapi instance, it is important to wrap the migration code with `strapi.db.transaction()`. Failure to do so may result in migrations not rolling back if an error occurs.
:::

<details>
<summary>Example of migration file with Strapi instance</summary>

```jsx title="./database/migrations/2022.05.10T00.00.00.name-of-my-migration.js"
module.exports = {
  async up() {
    await strapi.db.transaction(async () => {
      // Your migration code here

      // Example: creating new entries
      await strapi.documents('api::article.article').create({
        data: {
          title: 'My Article',
        },
      });

      // Example: custom service method
      await strapi.service('api::article.article').updateRelatedArticles();
    });
  },
};
```

</details>

## Reading the migration progress heartbeats

Some of Strapi's internal migrations process large amounts of data and can run for several minutes. To show that they are still working, they log a periodic progress line, throttled to one message every 60 seconds:

```
[document-id] still running (120s) · articles 12000/450000
```

The prefix identifies the internal migration that is running, and the counters show how many rows have been processed so far. These messages are appended rather than rewritten in place, so they remain readable in log files.

:::note
Progress heartbeats are emitted by Strapi's internal migrations only. They are not available in your own migration files.
:::

## Handling migrations with TypeScript code

By default Strapi looks for migration files in the source directory rather than the build directory when using TypeScript. This means that TypeScript migrations won't be found and executed properly unless you configure Strapi to look in the right place.

To enable TypeScript migrations in Strapi, you need to set the `useTypescriptMigrations` parameter to true in your database configuration. This setting tells Strapi to look for migrations in the build directory instead of the source directory.

Here's how to configure it in your database settings:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/config/database.js"
module.exports = ({ env }) => ({
  connection: {
    // Your database connection settings
  },
  settings: {
    useTypescriptMigrations: true
  }
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```tsx title="/config/database.ts"
export default ({ env }) => ({
  connection: {
    // Your database connection settings
  },
  settings: {
    useTypescriptMigrations: true
  }
});
```

</TabItem>
</Tabs>

Additionally, if you want to continue using existing JavaScript migrations alongside TypeScript migrations, you can set `allowJs: true` in your `tsconfig.json` file's compiler options, as mentioned in the [database configuration documentation](/cms/configurations/database#settings-configuration-object).
