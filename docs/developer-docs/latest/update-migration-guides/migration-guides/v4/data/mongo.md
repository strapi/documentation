---
title: Migrate from MongoDB to SQL with Strapi v3 - Strapi Developer Docs
description: Migrate from a MongoDB to a SQL database in Strapi v3
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.html
---

<!-- TODO: update SEO -->

# Migrate from MongoDB to SQL with Strapi v3

Strapi v4 does not support MongoDB databases (see [blog post announcement](https://strapi.io/blog/mongo-db-support-in-strapi-past-present-and-future)).

If your Strapi v3 project uses a MongoDB database, migrating from Strapi v3 to Strapi v4 is a 2-step process: first, migrate from MongoDB to SQL within Strapi v3, and then migrate the SQL database from Strapi v3 to Strapi v4.

Migrating from MongoDB to SQL with Strapi v3 requires:

1. [preparing the migration locally](#prepare-the-migration-locally),
2. [migrating the data locally](#migrate-the-data-locally),
3. [migrating the local data to production](#migrate-the-local-data-to-production).

## Prepare the migration locally

To prepare the migration locally:

1. Dump the MongoDB database (see [MongoDB official documentation](https://www.mongodb.com/docs/database-tools/mongodump/)) and load it locally.
2. (_optional, only if not migrating to SQLite_) Create a SQL database locally.

    ::: tip
    To avoid installing SQL and MongoDB on your computer, you can setup the local Mongo and SQL databases using a [Docker](https://hub.docker.com/) image.

    :::

3. Switch the application connector to bookshelf and configure it with the previously created databases:

    a. Add the required dependencies:

    ```bash
    
    ## install the bookshelf connector
    npm install strapi-connector-bookshelf@3.6.9 knex@0.21.19

    # install the appropriate database driver
    # for SQLite
    npm install sqlite3@5.0.2
    # for PostgreSQL
    npm install pg@8.7.3
    # for MySQL
    npm install mysql@2.18.1
    ```

    b. Update the configuration in  `./config/database.js`:

    :::: columns
    ::: column-left Before, with a MongoDB database:

    ```jsx
    // before
    {
      connector: 'mongoose',
      settings: {
        database: 'strapi',
        username: 'strapi',
        password: 'strapi',
        port: 27017,
        host: 'localhost',
      },
      options: {},
    }
    
    ```

    :::
    ::: column-right After, with a SQL database:
    <br/>

    <code-group>

    <code-block title="SQLite">

    ```js
    // after
    {
      connector: 'bookshelf',
      settings: {
        client: 'sqlite',
        filename: '.tmp/data.db',
      },
      options: {
        useNullAsDefault: true,
      },
    }
    ```

    </code-block>

    <code-block title="PostgreSQL">
    ```js
    // after
    {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        database: 'strapi',
        username: 'strapi',
        password: 'strapi',
        port: 5432,
        host: 'localhost',
      },
      options: {},
    }
    ```

    </code-block>

    <code-block title="MySQL">

    ```js
    // after
    {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        database: 'strapi',
        username: 'strapi',
        password: 'strapi',
        port: 3306,
        host: 'localhost',
      },
      options: {},
    }
    ```

    </code-block>
    </code-group>

    :::
    ::::

4. Start the application locally to generate the SQL schema and default values in the database.
5. Shut down the application.
6. Truncate every table and reset primary keys to only keep the structure, using the following queries, depending on the database type:

    <code-group>
    <code-block title="SQLite">

    ```sql
    // truncate
    DELETE FROM tableA;
    DELETE FROM tableB;

    // reset sequences
    DELETE FROM sqlite_sequence 
    WHERE name IN ('table_a', 'table_b', '...');
    ```

    </code-block>

    <code-block title="PostgreSQL">

    ```sql
    TRUNCATE tableA, tableB, tableC RESTART IDENTITY CASCADE;
    ```

    </code-block>

    <code-block title="MySQL">

    ```sql
    // truncate
    SET FOREIGN_KEY_CHECKS = 0;

    TRUNCATE tableA;
    TRUNCATE tableB;

    SET FOREIGN_KEY_CHECKS = 1;
    ```

    </code-block>
    </code-group>

## Migrate the data locally

To migrate the data locally:

- either build your own script based on the differences between MongoDB and SQL implementations (see [cheatsheet](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo-sql-cheatsheet.md)), using the following advices:

  - On the 1st pass:
    - Create all the entries without relations/components links.
    - Create a mapping from MongoDB ids to SQL ids.
  - and on the 2nd pass, create the relations/components links based on the MongoDB to SQL ids mapping.

- or use a migration tool, like [the Studio3T tutorial](https://studio3t.com/knowledge-base/articles/mongodb-to-sql-migration/#mappings), taking into account the differences between MongoDB and SQL implementations (see [cheatsheet](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo-sql-cheatsheet.md)).

## Migrate the local data to production

To migrate the local data to the production database:

1. Dump the SQL data migrated locally.

2. Import the dump into the production database.

3. Deploy the application with the updated connector (see [prepare the migration locally](#prepare-the-migration-locally) for configuration details).

<br/>

::: strapi Next steps
If the present guide was used to migrate from Strapi v3 to Strapi v4, the next step in the data migration process is to proceed to the [SQL migration from Strapi v3 to Strapi v4](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.md).
:::
