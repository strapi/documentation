---
title: Front-end code migration - Strapi Developer Docs
description: Migrate the front end of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.html
---

# v4 code migration: Update the front end

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

:::note
This guide is not an exhaustive resource for the v4 front end customization features, which are described in the [admin panel customization](/developer-docs/latest/development/admin-customization.md) documentation.
:::

:::prerequisites
Make sure to entirely [migrate the back end](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) before migrating the front end.
:::

Migrating the front end of a Strapi application to Strapi v4 depends on whether your project added customizations to the admin panel or not.

If the admin panel was not customized, the migration process consists in the following steps:

1. Delete the `./admin` folder of the project.
2. Run `yarn strapi build` (or `npm run strapi build`) to rebuild the admin panel.
3. Start the server with `yarn develop` (or `npm run develop`) to make sure the admin panel is working properly.

If you did make some customizations to the admin panel using the file replacement system of Strapi v3, you need to check if your customization is still available is Strapi v4. The [admin panel customization documentation](/developer-docs/latest/development/admin-customization.md) lists every possible customization in Strapi v4.

If some of the customizations you applied in Strapi v3 are not available in Strapi v4, the recommended way to add them back is to fork the customized package and install it in your application instead of the corresponding default Strapi package.

The following specific guides also cover the migration of some dedicated customizations:
- [WYSIWYG customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.md)
- [translations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.md)
- [webpack configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.md)
- [theme customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.md)
- [calls to the `strapi` global variable](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.md) to handle notifications and freeze user interactions
