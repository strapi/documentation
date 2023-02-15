---
title: Data migration
displayed_sidebar: devDocsSidebar
---

# Data migration guide

The goal of this guide is to cover how data can be migrated from Strapi `v3` to Strapi `v4`.

Strapi `v4` introduced breaking changes in the database layer which require manually migrating the data. The data migration should be done manually for now, but scripts will be available soon to help automate some of the migration steps.

Strapi `v4` only [supports SQL databases](/dev-docs/installation/cli#preparing-the-installation) and does not support MongoDB databases (see [blog post announcement](https://strapi.io/blog/mongo-db-support-in-strapi-past-present-and-future)). 

To migrate a SQL database from Strapi `v3` to Strapi `v4`, please refer to the [SQL section of the data migration guide](/dev-docs/migration/v3-to-v4/data/sql).

Migrating a Strapi `v3` project with a MongoDB database to Strapi `v4` is a 2-step process:

1. Migrate from MongoDB to SQL with Strapi `v3` (see [MongoDB migration](/dev-docs/migration/v3-to-v4/data/mongo)),
2. Migrate the SQL database from Strapi `v3` to Strapi `v4` (see [SQL migration](/dev-docs/migration/v3-to-v4/data/sql)).

:::warning 🚧  Migration scripts
[Data migration scripts](https://github.com/strapi/migration-scripts) are currently under testing. Please feel free to share feedback in [the dedicated forum thread](https://forum.strapi.io/t/strapi-v4-migration-scripts-are-live-for-testing/18266).
:::
