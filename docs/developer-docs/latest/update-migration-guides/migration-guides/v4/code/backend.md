---
title: Back-end code migration - Strapi Developer Docs
description: Migrate the back end of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.html
next: ./backend/dependencies.md
---

# v4 code migration: Back end overview

This back end code migration overview is part of the [v4 code migration guide](/developer-docs/latest/update-migration-guides/migration-guides/v4/code-migration.md).

Most of the back end of Strapi has been entirely rewritten in Strapi v4:

- The core features of a Strapi v4 server (routes, policies, controllers, and services) use factory functions. The new files can be easily created with the [interactive `strapi generate` CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate).
- There is a clear distinction in Strapi v4 between [policies](/developer-docs/latest/development/backend-customization/policies.md) and [middlewares](/developer-docs/latest/development/backend-customization/middlewares.md), which leads to the introduction of [route middlewares](/developer-docs/latest/development/backend-customization/routes.md#middlewares).

The [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) is different in Strapi v3 and Strapi v4. The project structure can be migrated with [Strapi codemods](https://github.com/strapi/codemods) and is not covered in details in this guide.

Migrating the back end of a Strapi application to v4 requires updating all of these core features:

- [configurations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.md)
- [dependencies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.md)
- [routes](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.md)
- [controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md)
- [services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md)
- [content-type schemas](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.md)

Optionally, depending on your usage of these features in Strapi v3, you might also need to migrate:

- [policies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.md)
- [route middlewares](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.md)
- [global middlewares](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.md)
- [GraphQL](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.md)

:::note
The dedicated short guides listed in this back end code migration guide are not exhaustive resources for the v4 back end customization features, which are described in the [back end customization](/developer-docs/latest/development/backend-customization.md) documentation.
:::

Once the back end of Strapi has been migrated to v4, you can proceed to migrating the [front end](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.md).
