---
title: Data migration guide for v4 - Strapi Developer Docs
description: Migrate your data from Strapi v3.6.8 to v4.0.x with step-by-step instructions
sidebarDepth: 2
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/data-migration.html
---

# v4 data migration guide

The goal of this guide is to cover how data can be migrated from Strapi v3 to Strapi v4.

Strapi v4 introduced breaking changes in the database layer, which requires manually migrating the data. The data migration should be done manually for now, but scripts will be available soon to help automate some of the migration steps.

This guide covers [migrating a SQL database from Strapi v3 to Strapi v4](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.md).

Strapi v4 does not support MongoDB databases. Migrating a Strapi v3 project with a MongoDB database to Strapi v4 is a 2-step process:

1. migrate from MongoDB to SQL with Strapi v3 (see [migrating from MongoDB to SQL](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.md))
2. migrate the SQL database from Strapi v3 to Strapi v4.

