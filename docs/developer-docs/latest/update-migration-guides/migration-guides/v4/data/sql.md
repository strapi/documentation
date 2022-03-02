---
title: SQL v3 to v4 migration - Strapi Developer Docs
description: Migrate a SQL database from Strapi v3 to Strapi v4
sidebarDepth: 3
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.html
---

<!-- TODO: update SEO -->

# v4 data migration: Migrate SQL from Strapi v3 to v4

The database layer of Strapi has been fully rewritten in Strapi v4. Model schemas use new attributes, relations are handled differently, some tables have different names and some plugins have a different data structure.

::: strapi Relations in Strapi v3 vs. v4
The [v3 vs. v4 SQL relations cheatsheet](/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql-relations.md) is designed to help you understand the differences in model schemas and entity relationship diagrams between Strapi v3 and v4.
:::

## Column name casing

In Strapi v3, column names can have different casings (e.g. `PascalCase`, `camelCase`, and `snake_case`).

In Strapi v4, every column name should use `snake_case`. Attributes defined in another casing in the model schema will have their name automatically transformed to `snake_case` when communicating with the database layer.

## Timestamps columns

Timestamps columns are the `created_at` and `updated_at` columns.

In Strapi v3, timestamps columns are given a default value (i.e. `CURRENT_TIMESTAMP`) directly by the database layer.

In Strapi v4, it isn’t possible to rename or disable Strapi’s timestamps columns. Timestamps with custom column names should be migrated to the `created_at` and `updated_at` fields, and the default value must be removed from the table structure.

## Upload plugin

In Strapi v3, the polymorphic table associated to the file content-type is named `upload_file_morph` and has both an `id` and an `upload_file_id` attribute.

In Strapi v4:
  
* the polymorphic table is named `files_related_morphs` (as it concerns the file’s `related` attribute),
* the `id` and `upload_file_id` columns do not exist,
* a new column `file_id` is added, as a foreign key pointing to `files.id`,
* and an index is created for the `file_id` column, as `files_related_morph_fk`.

## Admin Permissions

- The table structure has changed:

  :::: columns
  ::: column-left Strapi v3
  ![v3-strapi_permission.png](./assets/v3-strapi_permission.png)
  :::
  ::: column-right Strapi v4
  ![v4-admin_permissions.png](./assets/v4-admin_permissions.png)
  :::
  ::::

- The role relation in Strapi v4 is handled in a join table named `admin_permissions_role_links`.
- In Strapi v4, new indexes have been created for the `created_by_id` and `updated_by_id` columns with the following names:

| Column name in Strapi v3 | Index name in Strapi v4 |
|----|----|
| `created_by_id` | `admin_permissions_created_by_id_fk` |
| `updated_by_id` | `admin_permissions_updated_by_id_fk`

## Core store

The core store table has a different name in Strapi v3 and Strapi v4:

| Name in Strapi v3 | Name in Strapi v4            |
| ----------------- | ---------------------------- |
| `core_store`      | `strapi_core_store_settings` |

The structure of the core store table remains untouched.

## Strapi’s tables
<!-- 
<aside>
💡 Tables that have been introduced In Strapi v4 and don’t have equivalent in Strapi v3 (noted **N/A**) **should not** be created by the migrations script.
</aside> -->

Strapi built-in tables have a different name in Strapi v3 and Strapi v4:

| Table name in Strapi v3       | Table name in Strapi v4 |
| ----------------------------- | ----------------------- |
| `admin_permissions`           | `strapi_permission`     |
| `admin_permissions_role_link` | _(non applicable)_      |
| `admin_roles`                 | `strapi_role`           |
| `admin_users`                 | `strapi_administrator`  |
| `amin_users_roles_links`      | `strapi_users_roles`    |
| `strapi_webhooks`             | `strapi_webhooks`       |
| `strapi_core_store_settings`  | `core_store`            |
| `strapi_migrations`           | _(non applicable)_      |
| `strapi_api_tokens`           | _(non applicable)_      |
| `strapi_database_schema`      | _(non applicable)_      |

## Users and Permissions plugin

The tables and database structure are different in Strapi v3 and v4.

**Strapi v3**:
![v3-up.png](./assets/v3-up.png)

**Strapi v4**:
![v4-up.png](./assets/v4-up.png)

<!-- ## Permissions *to be finished*

- In Strapi v3 `permissions` were defined by a `type`, a `controller`, and an `action` column.
- In Strapi v4 those columns have been aggregated and replaced by a single one named `action`

The aggregation works like so:

> **action = *transform(*type*)*.controller.action**
>  -->

<!-- ## I18N Plugin *to be finished*

Localization tables follows the [circular many to many relationships migration](./assets.md)  and thus are renamed from `entities__localizations` to `entities_localizations_links`.

The columns are also changed from v3(`id`, `entity_id`, `related_entity_id`) to v4(`entity_id`, `inv_entity_id`) ← ER diagram to be done -->
