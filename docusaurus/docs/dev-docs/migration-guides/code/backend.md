---
title: Back-end code migration
displayed_sidebar: devDocsSidebar
description: Migrate the back end of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/dev-docs/migration-guides//code/backend.html
pagination_next: dev-docs/migration-guides/code/dependencies
---

# v4 code migration: Back end overview

This back end code migration overview is part of the [v4 code migration guide](/dev-docs/migration-guides/code-migration).

Most of the back end of Strapi has been entirely rewritten in Strapi v4:

- The core features of a Strapi v4 server (routes, policies, controllers, and services) use factory functions. The new files can be created with the [interactive `strapi generate` CLI](/dev-docs/CLI#strapi-generate).
- There is a clear distinction in Strapi v4 between [policies](/dev-docs/development/backend-customization/policies) and [middlewares](/dev-docs/development/backend-customization/middlewares), which leads to the introduction of [route middlewares](/dev-docs/development/backend-customization/routes#middlewares).

The [project structure](/dev-docs/project-structure) is different in Strapi v3 and Strapi v4. The project structure can be migrated with [Strapi codemods](https://github.com/strapi/codemods) and is not covered in details in this guide.

Migrating the back end of a Strapi application to v4 requires updating all of these core features:

- [configurations](/dev-docs/migration-guides/code/configuration)
- [dependencies](/dev-docs/migration-guides/code/dependencies)
- [routes](/dev-docs/migration-guides/code/routes)
- [controllers](/dev-docs/migration-guides/code/controllers)
- [services](/dev-docs/migration-guides/code/services)
- [content-type schemas](/dev-docs/migration-guides/code/content-type-schema)

Optionally, depending on your usage of these features in Strapi v3, you might also need to migrate:

- [policies](/dev-docs/migration-guides/code/policies)
- [route middlewares](/dev-docs/migration-guides/code/route-middlewares)
- [global middlewares](/dev-docs/migration-guides/code/global-middlewares)
- [GraphQL](/dev-docs/migration-guides/code/graphql)

:::note
The dedicated short guides listed in this back end code migration guide are not exhaustive resources for the v4 back end customization features, which are described in the [back end customization](/dev-docs/development/backend-customization) documentation.
:::

Once the back end of Strapi has been migrated to v4, you can proceed to migrating the [front end](/dev-docs/migration-guides/code/frontend).
