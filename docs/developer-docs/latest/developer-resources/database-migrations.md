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

Migration files should export 2 functions `up()` and `down()`.
- The `up()` function is used when upgrading (e.g. adding a new table `my_new_table`).
- The `down()`function is used to reverse the `up()` function when downgrading (ex: deleting `my_new_table`)

Strapi will automatically detect migration files and run them once at the next startup in alphabetical order. Every new file is executed once.

Migrations are run before the database tables are synced with the content-types schemas.

There is no CLI to run the migration manually for the moment.

There are no ways to use the downgrade feature for the moment, hence, the `down()`is not usable for the moment.

`up()` and `down()` functions run in a database transaction which means if a query fails during the migration, the whole migration will be cancelled and no changes will be applied to the database. It also means that if an other transaction is created within the migration function, it will be a nested transaction.

## Creating a migration file

1. Create a new file in `database/migrations` with a name containing the date and the name of the migration (ex: `2022.05.10T00.00.00.name-of-my-migration.js`). The file name is important because the alphabetical order of the files defines the order in which the migrations have to run.

2. Fill the migration file with the following template:

```jsx
'use strict'

async function up(trx) {}

async function down(trx) {}

module.exports = { up, down };
```

3. Write the migration code inside the `up()` and `down()` functions.
`up()` and `down()` receive a [Knex instance](https://knexjs.org/) that can be used to run the database queries.
