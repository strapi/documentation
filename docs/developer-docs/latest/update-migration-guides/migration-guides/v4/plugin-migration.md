---
title: Plugin migration guide for v4 - Strapi Developer Docs
description: Migrate your plugins from v3.6.8 to v4.0 with step-by-step instructions
sidebarDepth: 2
canonicalUrl:
---

<!-- TODO: update SEO -->

# v4 plugin migration guide

The goal of this guide is to get a v3 plugin up and running on v4 as fast as possible by resolving breaking changes. It is not an exhaustive resource for the v4 plugin APIs, which are described in the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#server-api-for-plugins) and [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#admin-panel-api-for-plugins) documentations.

Migrating a plugin from Strapi v3.6.9 to v4.0.4 consists in:

- [enabling the plugin](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.md)
- [updating the folder structure](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.md)
- [migrating the back end](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.md)
- optionally, [migrating the front end](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.md) if the plugin interacts with the admin panel

<br/>

Some actions required for plugin migration can be performed by scripts that automatically modify code (codemods). The following table sums up the available options:

| Action                              | Migration type                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enable the plugin                   | [Manual](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.md)                                                                               |
| Update the folder structure         | [Automatic](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.md#update-the-folder-structure-automatically) or [manual](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.md#update-the-folder-structure-manually) |
| Migrate the back end of the plugin  | Partially automatic (see [Migrate the backend](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.md))                                      |
| Migrate the front end of the plugin | [Manual](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.md#migrate-the-front-end)                                                                      |

<br/>

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/codemod-prerequisites.md)!!!

<br/>

::: strapi Codemods support & community contributions
If you have any issues with the codemods or would like to contribute to the project please [create an issue](https://github.com/strapi/codemods/issues) or [open a pull request](https://github.com/strapi/codemods/pulls).
:::
