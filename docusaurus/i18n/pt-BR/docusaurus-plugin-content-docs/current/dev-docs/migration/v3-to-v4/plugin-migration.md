---
title: Plugin migration guide
description: Migrate a Strapi plugin from v3.6.x to v4.0.x with step-by-step instructions
sidebarDepth: 2

---

# v4 plugin migration guide

The goal of this guide is to get a v3 plugin up and running on v4 by resolving breaking changes.

:::note
This guide is not an exhaustive resource for the v4 plugin APIs, which are described in the [Server API](/dev-docs/api/plugins/server-api.md#server-api-for-plugins) and [Admin Panel API](/dev-docs/api/plugins/admin-panel-api.md#admin-panel-api-for-plugins) documentations.
:::

Migrating a plugin from Strapi v3.6.x to v4.0.x consists in the following steps:

- [updating the folder structure](/dev-docs/migration/v3-to-v4/plugin/update-folder-structure),
- optionally, [migrating the back-end code](/dev-docs/migration/v3-to-v4/plugin/migrate-back-end.md) if the plugin interacts with Strapi's back end,
- optionally, [migrating the front-end code](/dev-docs/migration/v3-to-v4/plugin/migrate-front-end.md) if the plugin interacts with the admin panel,
- and [enabling the plugin](/dev-docs/migration/v3-to-v4/plugin/enable-plugin.md).

Depending on these steps, some actions can only be done manually while others can be performed automatically by scripts that modify the code, which are called codemods. The following table lists available options for each step of the migration:

| Action                              | Migration type                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Update the folder structure         | [Automatic](/dev-docs/migration/v3-to-v4/plugin/update-folder-structure.md#updating-folder-structure-automatically) or [manual](/dev-docs/migration/v3-to-v4/plugin/update-folder-structure.md#updating-folder-structure-manually) |
| Migrate the back end of the plugin  | [Partially automatic](/dev-docs/migration/v3-to-v4/plugin/migrate-back-end.md)                                      |
| Migrate the front end of the plugin | [Manual](/dev-docs/migration/v3-to-v4/plugin/migrate-front-end.md)                                                                      |
| Enable the plugin                   | [Manual](/dev-docs/migration/v3-to-v4/plugin/enable-plugin.md)                                                                               |

:::strapi Codemods support & community contributions
If you have any issues with the codemods or would like to contribute to the project please [create an issue](https://github.com/strapi/codemods/issues) or [open a pull request](https://github.com/strapi/codemods/pulls).
:::
