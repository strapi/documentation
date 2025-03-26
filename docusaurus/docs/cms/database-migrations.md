---
title: Database migrations
description: Strapi database migrations are ways to modify the database
---

# Database migrations

Database migrations exist to run one-time queries against the database, typically to modify the tables structure or the data when upgrading the Strapi application. These migrations are run automatically when the application starts and are executed before the automated schema migrations that Strapi also performs on boot.

:::callout 🚧  Experimental feature
Database migrations are experimental. This feature is still a work in progress and will continue to be updated and improved. In the meantime, feel free to ask for help on the <ExternalLink to="https://forum.strapi.io/" text="forum"/> or on the community <ExternalLink to="https://discord.strapi.io" text="Discord"/>.
:::

## Understanding database migration files

Migrations are run using JavaScript migration files stored in `./database/migrations`.

Strapi automatically detects migration files and run them once at the next startup in alphabetical order. Every new file is executed once. Migrations are run before the database tables are synced with the content-types schemas.

:::warning
* Currently Strapi does not support down migrations. This means that if you need to revert a migration, you will have to do it manually. It is planned to implement down migrations in the future but no timeline is currently available.

* Strapi will delete any unknown tables without warning. This means that database migrations can only be used to keep data when changing the Strapi schema. The `forceMigration` and `runMigrations` [database configuration parameters](/cms/configurations/database#settings-configuration-object) can be used to fine-tune the database migrations behavior.
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
      await strapi.entityService.create('api::article.article', {
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
