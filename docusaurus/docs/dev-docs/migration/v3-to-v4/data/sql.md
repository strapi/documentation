---
title: SQL v3 to v4 migration
description: Migrate a SQL database from Strapi v3 to Strapi v4
displayed_sidebar: devDocsSidebar
---

# Data migration:Migrate SQL from Strapi v3 to v4

The database layer of Strapi has been fully rewritten in Strapi `v4`. This documentation is designed to highlight the breaking changes introduced in Strapi `v4` that impact SQL databases, by comparing `v3` and `v4` table and column names, data structures and relations. 

Changes can be [global](#global-changes) (impacting any table) or more limited in scope, impacting only [specific tables](#changes-impacting-strapi-built-in-tables) or some [Strapi plugins](#changes-impacting-strapi-plugins).

:::strapi Relations in Strapi v3 vs. v4
The [v3 vs. v4 SQL relations cheatsheet](/dev-docs/migration/v3-to-v4/data/sql-relations) is designed to help you understand the differences in model schemas and entity relationship diagrams between Strapi `v3` and Strapi `v4`.
:::

:::warning 🚧  Migration scripts
[Data migration scripts](https://github.com/strapi/migration-scripts) are currently in alpha/beta testing. Please feel free to share feedback in [the dedicated forum thread](https://forum.strapi.io/t/strapi-v4-migration-scripts-are-live-for-testing/18266).
:::

## Global changes

Changes in column casing and timestamps columns can affect all tables.

### Column name casing

:::strapi v3 / v4 comparison
In Strapi `v3` column names can have different casings (e.g. `PascalCase`, `camelCase`, and `snake_case`).

In Strapi v4, every column name should use `snake_case`.
:::

To migrate to Strapi `v4`, make sure all column names use `snake_case`. Attributes defined in another casing in the model schema will have their name automatically transformed to `snake_case` when communicating with the database layer.

### Timestamps columns

:::strapi v3 / v4 comparison
Timestamps columns refer to the `created_at` and `updated_at` columns.

In Strapi `v3`, timestamps columns are given a default value (i.e. `CURRENT_TIMESTAMP`) directly by the database layer.

In Strapi `v4`, timestamps columns can't be renamed or disabled. 
:::

To migrate to Strapi `v4`, migrate timestamps with custom column names to the `created_at` and `updated_at` fields, and remove the default value from the table structure.

## Changes impacting Strapi built-in tables

Strapi built-in tables have a different name in `v3` and `v4`, and Strapi v4 introduces new tables (indicated by the ✨ emoji):

| Table name in Strapi v3 | Table name in Strapi v4                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| `strapi_permission`     | `admin_permissions` (see [admin permissions](#admin-permissions))              |
| `strapi_role`           | `admin_roles`                                                                  |
| `strapi_administrator`  | `admin_users`                                                                  |
| `strapi_users_roles`    | `admin_users_roles_links`                                                      |
| `strapi_webhooks`       | `strapi_webhooks`                                                              |
| `core_store`            | `strapi_core_store_settings` (see [core store](#core-store))                   |
| _(non applicable)_      | ✨ `admin_permissions_role_link`  (see [admin permissions](#admin-permissions)) |
| _(non applicable)_      | ✨ `strapi_migrations`                                                          |
| _(non applicable)_      | ✨ `strapi_api_tokens`                                                          |
| _(non applicable)_      | ✨ `strapi_database_schema`                                                     |

### Admin permissions

The `strapi_permission` table used in Strapi `v3` is named `admin_permissions` in Strapi `v4`, and is subject to the following other changes:

- The table structure is different in Strapi `v3` and Strapi `v4`:

<Columns>

<ColumnLeft title="Strapi v3">
<img src="/img/assets/data-migration/v3-strapi_permission.png" alt="Strapi v3 permissions"/>
</ColumnLeft>

<ColumnRight title="Strapi v4">
<img src="/img/assets/data-migration/v4-admin_permissions.png" alt="Strapi v4 permissions"/>
</ColumnRight>

</Columns>

- The role relation in Strapi `v4` is handled in a join table named `admin_permissions_role_links`.
- New indexes have been created for the `created_by_id` and `updated_by_id` columns of Strapi v3, with the following names:

  | Column name in Strapi v3 | Index name in Strapi v4              |
  | ------------------------ | ------------------------------------ |
  | `created_by_id`          | `admin_permissions_created_by_id_fk` |
  | `updated_by_id`          | `admin_permissions_updated_by_id_fk` |

### Core store

The `core_store` table used in Strapi `v3` is named `strapi_core_store_settings` in Strapi `v4`.

The structure of the core store table remains untouched, but model definitions and content manager configurations have changed.

#### Model definitions

All the rows that begin with `model_def_` have been dropped and are no longer required.

#### Content manager configurations

All the rows that begin with `plugin_content_manager_configuration_content_types` have been changed to match new unique identifiers (UIDs) and reflect [table names changes](#changes-impacting-strapi-built-in-tables). These changes include both the suffix of the `key` column and the `uid` field in the `value` column.

In addition to all the content-types that have been renamed (see [table names changes](#changes-impacting-strapi-built-in-tables)), the following UIDs have changed:

| UID in Strapi v3 | UID in Strapi v4 |
|------------------|------------------|
| `application`    | `api`            |
| `plugins`        | `plugin`         |

#### Permissions mapping

The following tables list the mapping of all permissions between Strapi v3 and Strapi v4:

<details>
<summary>Permission mapping for an example "restaurant" API:</summary>

| Strapi v3 type | Strapi v3 controller | Strapi v3 action   | Strapi v4 action                              |
| -------------- | -------------------- | ------------------ | --------------------------------------------- |
| application    | restaurant           | count              | _(deleted)_                                   |
| application    | restaurant           | create             | api::restaurant.restaurant.create             |
| application    | restaurant           | delete             | api::restaurant.restaurant.delete             |
| application    | restaurant           | find               | api::restaurant.restaurant.find               |
| application    | restaurant           | findone            | api::restaurant.restaurant.findOne            |
| application    | restaurant           | update             | api::restaurant.restaurant.update             |
| application    | restaurant           | createlocalization | api::restaurant.restaurant.createLocalization |
</details>

<details>
<summary>Permission mapping for the Users & Permission plugin:</summary>

| Strapi v3 type    | Strapi v3 controller | Strapi v3 action       | Strapi v4 action                                     |
| ----------------- | -------------------- | ---------------------- | ---------------------------------------------------- |
| users-permissions | auth                 | callback               | plugin::users-permissions.auth.callback              |
| users-permissions | auth                 | connect                | plugin::users-permissions.auth.connect               |
| users-permissions | auth                 | emailconfirmation      | plugin::users-permissions.auth.emailConfirmation     |
| users-permissions | auth                 | forgotpassword         | plugin::users-permissions.auth.forgotPassword        |
| users-permissions | auth                 | register               | plugin::users-permissions.auth.register              |
| users-permissions | auth                 | resetpassword          | plugin::users-permissions.auth.resetPassword         |
| users-permissions | auth                 | sendemailconfirmation  | plugin::users-permissions.auth.sendEmailConfirmation |
| users-permissions | user                 | count                  | plugin::users-permissions.user.count                 |
| users-permissions | user                 | create                 | plugin::users-permissions.user.create                |
| users-permissions | user                 | destroy                | plugin::users-permissions.user.destroy               |
| users-permissions | user                 | destroyall             | _(deleted)_                                          |
| users-permissions | user                 | find                   | plugin::users-permissions.user.find                  |
| users-permissions | user                 | findone                | plugin::users-permissions.user.findOne               |
| users-permissions | user                 | me                     | plugin::users-permissions.user.me                    |
| users-permissions | user                 | update                 | plugin::users-permissions.user.update                |
| users-permissions | userspermissions     | getrole                | plugin::users-permissions.role.getRole               |
| users-permissions | userspermissions     | getroles               | plugin::users-permissions.role.getRoles              |
| users-permissions | userspermissions     | createrole             | plugin::users-permissions.role.createRole            |
| users-permissions | userspermissions     | deleterole             | plugin::users-permissions.role.deleteRole            |
| users-permissions | userspermissions     | updaterole             | plugin::users-permissions.role.updateRole            |
| users-permissions | userspermissions     | getpermissions         | plugin::users-permissions.permissions.getPermissions |
| users-permissions | userspermissions     | getadvancedsettings    | _(deleted)_                                          |
| users-permissions | userspermissions     | customroute            | _(deleted)_                                          |
| users-permissions | userspermissions     | getemailtemplate       | _(deleted)_                                          |
| users-permissions | userspermissions     | getpolicies            | _(deleted)_                                          |
| users-permissions | userspermissions     | getproviders           | _(deleted)_                                          |
| users-permissions | userspermissions     | getroutes              | _(deleted)_                                          |
| users-permissions | userspermissions     | index                  | _(deleted)_                                          |
| users-permissions | userspermissions     | searchusers            | _(deleted)_                                          |
| users-permissions | userspermissions     | updateadvancedsettings | _(deleted)_                                          |
| users-permissions | userspermissions     | updateemailtemplate    | _(deleted)_                                          |
| users-permissions | userspermissions     | updateproviders        | _(deleted)_                                          |
</details>

<details>
<summary>Permission mapping for the i18n plugin:</summary>

| Strapi v3 type | Strapi v3 controller | Strapi v3 action          | Strapi v4 action                 |
| -------------- | -------------------- | ------------------------- | -------------------------------- |
| i18n           | content-types        | getnonlocalizedattributes | _(deleted)_                      |
| i18n           | iso-locales          | listisolocales            | _(deleted)_                      |
| i18n           | locales              | createlocale              | _(deleted)_                      |
| i18n           | locales              | deletelocale              | _(deleted)_                      |
| i18n           | locales              | listlocales               | plugin::i18n.locales.listLocales |
| i18n           | locales              | updatelocale              | _(deleted)_                      |
</details>

<details>
<summary>Permission mapping for the Content-Type Builder:</summary>

| Strapi v3 type       | Strapi v3 controller | Strapi v3 action  | Strapi v4 action                                           |
| -------------------- | -------------------- | ----------------- | ---------------------------------------------------------- |
| content-type-builder | builder              | getreservednames  | _(deleted)_                                                |
| content-type-builder | componentcategories  | deletecategory    | _(deleted)_                                                |
| content-type-builder | componentcategories  | editcategory      | _(deleted)_                                                |
| content-type-builder | components           | createcomponent   | _(deleted)_                                                |
| content-type-builder | components           | deletecomponent   | _(deleted)_                                                |
| content-type-builder | components           | getcomponent      | plugin::content-type-builder.components.getComponent       |
| content-type-builder | components           | getcomponents     | plugin::content-type-builder.components.getComponents      |
| content-type-builder | components           | updatecomponent   | _(deleted)_                                                |
| content-type-builder | connections          | getconnections    | _(deleted)_                                                |
| content-type-builder | contenttypes         | createcontenttype | _(deleted)_                                                |
| content-type-builder | contenttypes         | deletecontenttype | _(deleted)_                                                |
| content-type-builder | contenttypes         | getcontenttype    | plugin::content-type-builder.content-types.getContentType  |
| content-type-builder | contenttypes         | getcontenttypes   | plugin::content-type-builder.content-types.getContentTypes |
| content-type-builder | contenttypes         | updatecontenttype | _(deleted)_                                                |
</details>

<details>
<summary>Permission mapping for the Upload plugin:</summary>

| Strapi v3 type | Strapi v3 controller | Strapi v3 action | Strapi v4 action                   |
| -------------- | -------------------- | ---------------- | ---------------------------------- |
| upload         | upload               | count            | plugin::upload.content-api.count   |
| upload         | upload               | destroy          | plugin::upload.content-api.destroy |
| upload         | upload               | find             | plugin::upload.content-api.find    |
| upload         | upload               | findone          | plugin::upload.content-api.findOne |
| upload         | upload               | getsettings      | _(deleted)_                        |
| upload         | upload               | search           | _(deleted)_                        |
| upload         | upload               | updatesettings   | _(deleted)_                        |
| upload         | upload               | upload           | plugin::upload.content-api.upload  |
</details>

<details>
<summary>Permission mapping for the Email plugin:</summary>

| Strapi v3 type | Strapi v3 controller | Strapi v3 action | Strapi v4 action         |
| -------------- | -------------------- | ---------------- | ------------------------ |
| email          | email                | getsettings      | _(deleted)_              |
| email          | email                | send             | plugin::email.email.send |
| email          | email                | test             | _(deleted)_              |
</details>

<details>
<summary> Permission mapping for the Content Manager and the Documentation plugin:</summary>
All permissions were deleted.
</details>

## Changes impacting Strapi plugins

Strapi `v4` introduces breaking changes that impact the table names, column names and database structures used by the [Users & Permissions](#users-and-permissions-plugin), [Upload](#upload-plugin) and [Internationalization (i18n)](#internationalization-i18n-plugin) plugins.

### Users and Permissions plugin

The tables and database structure used by the [Users & Permissions plugin](/dev-docs/plugins/users-permissions) are different in Strapi `v3` and Strapi `v4`:

**Strapi v3:**
<img src="/img/assets/data-migration/v3-up.png" alt="v3"/>

**Strapi v4:**
<img src="/img/assets/data-migration/v4-up.png" alt="v4"/>

#### Enabled permissions

In Strapi v3, permissions are always present in the table and are duplicated for each role. A permission "A" is set for a role "X" if permission "A" has the `enabled` column value set to `1` (`true`).

In Strapi v4, permissions that aren’t enabled for any role are not present in the database table (i.e. there is no more `enabled` column). A permission "A" is set for a role "X" if there is:

* a permission "A" in the table rows
* and a row linking the role "X" to the permission "A" in the join table.

#### Permissions columns

In Strapi v3, permissions are defined by 3 columns:`type`, `controller`, and `action`.

In Strapi v4, the `type`, `controller` and `action` columns are replaced by a single column named `action`, aggregated like the following:`action = transform(type).controller.action`.

:::tip
For more information and specific examples, you can compare the output of the same permission in Strapi v3 `users-permissions_permission` and Strapi v4 `up_permissions` tables.
:::

### Upload plugin

In Strapi v3, the polymorphic table associated to the file content-type is named `upload_file_morph` and has both an `id` and an `upload_file_id` attribute.

In Strapi v4, the data structure of the [Upload plugin](/dev-docs/plugins/upload) is subject to the following changes:
  
* The polymorphic table is named `files_related_morphs`. The name includes `related` since it concerns the file’s `related` attribute defined in the model schema.
* The `id` and `upload_file_id` columns do not exist.
* A new column `file_id` is added, as a foreign key pointing to `files.id`.
* An index is created for the `file_id` column, as `files_related_morph_fk`.

### Internationalization (i18n) plugin

In Strapi v4, localization tables used by the [Internationalization (i18n)](/dev-docs/plugins/i18n) plugin follow the [circular many-to-many relationships migration](/dev-docs/migration/v3-to-v4/data/sql-relations#circular-relations) and are renamed from `entities__localizations` to `entities_localizations_links`.

<Columns>

<ColumnLeft title="Strapi v3">
<img src="/img/assets/data-migration/v3-i18n-localizations.png" alt="Entity relationship diagram for i18n localizations in v3"/>
</ColumnLeft>

<ColumnRight title="Strapi v4">
<img src="/img/assets/data-migration/v4-i18n-localizations.png" alt="Entity relationship diagram for i18n localizations in v4"/>
</ColumnRight>

</Columns>
