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

Depending on the level of customization applied to the admin panel, migrating the front end of a Strapi application to v4 might require updating:

- [WYSIWYG customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.md)
- [translations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.md)
- the [webpack configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.md)
- [theme customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.md)
- [calls to the `strapi` global variable](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.md) to handle notifications and freeze user interactions
