---
title: Frontend code migration
displayed_sidebar: devDocsSidebar
description: Migrate the frontend of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions

next: ./frontend/wysiwyg.md
---

# v4 Code migration: Frontend overview

This frontend code migration overview is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration).

The frontend code of Strapi runs the admin panel, which can be customized. The main difference between Strapi v3 and v4 admin panel customization is that v3 supports file replacement where v4 does not and instead uses several newly introduced APIs (see [admin panel customization](/dev-docs/admin-panel-customization) documentation).

:::prerequisites
Make sure to entirely [migrate the backend](/dev-docs/migration/v3-to-v4/code/backend) before migrating the frontend.
:::

Migrating the frontend of a Strapi application to Strapi v4 depends on whether your project added customizations to the admin panel or not.

## Migrating the admin panel without customizations

If the admin panel was not customized, the migration process consists in the following steps:

1. Delete the `./admin` folder of the project.

2. Run `yarn strapi build` (or `npm run strapi build`) to rebuild the admin panel.

3. Start the server with `yarn develop` (or `npm run develop`) to make sure the admin panel is working properly.

## Migrating the admin panel with customizations

If you customized the Strapi v3 admin panel using the file replacement system, please check if this customization is still available in Strapi v4. The [admin panel customization documentation](/dev-docs/admin-panel-customization) lists every possible customization in Strapi v4.

If some of the customizations you applied in Strapi v3 are not available in Strapi v4, the recommended way to add them back is to fork the customized package and install it in your application instead of the corresponding default Strapi package.

The following specific guides also cover the migration of some dedicated customizations:

- [WYSIWYG customizations](/dev-docs//migration/v3-to-v4/code/wysiwyg)
- [translations](/dev-docs/migration/v3-to-v4//code/translations)
- [webpack configuration](/dev-docs/migration/v3-to-v4/code/webpack)
- [theme customizations](/dev-docs/migration/v3-to-v4/code/theming)
- [calls to the `strapi` global variable](/dev-docs/migration/v3-to-v4/code/strapi-global) (e.g. to handle notifications and freeze user interactions)

:::note NOTES

- Strapi v4 admin panel can also be extended, either by a plugin using the new [Admin Panel API](/dev-docs/api/plugins/admin-panel-api) or by taking advantage of the [extensions](/dev-docs/admin-panel-customization#extension) system.
- Another difference between Strapi v3 and v4 is that the configuration of the admin panel in Strapi v4 is declared in a specific `./config/admin.js` configuration file (see [admin panel configuration migration](/dev-docs/migration/v3-to-v4/code/configuration#admin-panel-configuration).

:::
