---
title: Database migrations - Strapi Developer Docs
description: Strapi database migrations are ways to modify the database
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/database-migrations.html
---

# Database migrations (experimental feature)

Database migrations exist to run one-time queries against the database, typically to modify the tables structure or the data when upgrading the Strapi application.

::: callout 🚧  Experimental
The feature is to be considered as unfinished and experimental.
:::

## General logic

Migrations are run using JavaScript migration files stored in `./database/migrations`.

Migration files should export 2 functions `up()` and `down()`:
- The `up()` function is used when upgrading (e.g. adding a new table `my_new_table`).
- The `down()` function is used to reverse the `up()` function when downgrading (e.g. deleting `my_new_table`).

Strapi will automatically detect migration files and run them once at the next startup in alphabetical order. Every new file is executed once.

Migrations are run before the database tables are synced with the content-types schemas.

There is no CLI to run the migration manually for the moment.

There are no ways to use the downgrade feature for the moment, hence, the `down()` is not usable for the moment.

`up()` and `down()` functions run in a database transaction which means if a query fails during the migration, the whole migration will be cancelled and no changes will be applied to the database. It also means that if an other transaction is created within the migration function, it will be a nested transaction.

## Creating a migration file

To create a migration file:

1. In the `./database/migrations` folder, create a new file named after the date and the name of the migration (e.g. `2022.05.10T00.00.00.name-of-my-migration.js`). Make sure that the file name follows this naming pattern, because the alphabetical order of the files defines the order in which the migrations have to run.

2. Copy and paste the following template in the previously created file:

```jsx
'use strict'

async function up(knex) {}

async function down(knex) {}

module.exports = { up, down };
```

3. Fill in the template by adding actual migration code inside the `up()` and `down()` functions.
`up()` and `down()` receive a [Knex instance](https://knexjs.org/), already in a transaction state, that can be used to run the database queries.

::: details Example of migration file

```jsx
// path: ./database/migrations/2022.05.10T00.00.00.name-of-my-migration.js

module.exports = {
  async up(knex) {
    // You have full access to the Knex.js API with an already initialized connection to the database
    // ------------------------
    // EXAMPLE: renaming a table
    // knex.schema.renameTable('oldName', 'newName');
    // ------------------------
    // EXAMPLE: renaming a column
    // knex.schema.table('someTable', table => {
    //   table.renameColumn('oldName', 'newName');
    // });
    // ------------------------
    // EXAMPLE: updating data
    // await knex.from('someTable').update({ columnName: 'newValue' }).where({ columnName: 'oldValue' });
    // ------------------------
  },
  async down(knex) {
    // This one isn't implemented yet, will be eventually
  },
};
```
