---
title: Database migrations - Strapi Developer Docs
description: Strapi database migrations are ways to modify the database
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/database-migrations.html
---

# Database migrations

Database migrations exist to run one-time queries against the database, typically to modify the tables structure or the data when upgrading the Strapi application. These migrations are run automatically when the application starts and are executed before the automated schema migrations that Strapi also performs on boot.

::: callout 🚧  Experimental feature
Database migrations are experimental. This feature is still a work in progress and will continue to be updated and improved. In the meantime, feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
:::

## Understand database migration files

Migrations are run using JavaScript migration files stored in `./database/migrations`.

Strapi:

- Automatically detects migration files,
- runs each new migration file 1 time in alphabetical order at the next startup,
- runs migrations before the database tables are synchronized with the content-types schemas.

::: warning
Currently Strapi does not support down migrations. This means that if you need to revert a migration, you will have to do it manually. It is planned to implement down migrations in the future but no timeline is currently available.
:::

Migration files should export the function `up()`, which is used when upgrading (e.g. adding a new table `my_new_table`).

The `up()` function runs in a database transaction which means if a query fails during the migration, the whole migration is cancelled, and no changes are applied to the database. If another transaction is created within the migration function, it will act as a nested transaction.

::: note
There is no CLI to manually execute the database migrations.
:::

## Create a migration file

To create a migration file:

1. In the project root directory, run the command:

  <code-group>
  <code-block title="YARN">

  ```bash
  yarn strapi generate migration
  ```

  </code-block>
  <code-block title="NPM">

  ```bash
  npm run strapi generate migration
  ```

  </code-block>
  </code-group>

2. Open the migration template in your code editor: `path: ./database/migrations/{file-name}`. The file name has a alphanumeric date-time value followed by the name declared in the `strapi generate migration` command.

3. Fill in the template by adding actual migration code inside the `up()` function.
`up()` receives a [Knex instance](https://knexjs.org/), already in a transaction state, that can be used to run the database queries.

::: details Example of migration file

```jsx
// path: ./database/migrations/2022.05.10T00.00.00.name-of-my-migration.js

module.exports = {
  async up(knex) {
    // You have full access to the Knex.js API with an already initialized connection to the database

    // EXAMPLE: renaming a table
    await knex.schema.renameTable('oldName', 'newName');

    // EXAMPLE: renaming a column
    await knex.schema.table('someTable', table => {
      table.renameColumn('oldName', 'newName');
    });

    // EXAMPLE: updating data
    await knex.from('someTable').update({ columnName: 'newValue' }).where({ columnName: 'oldValue' });
  },
};
```
