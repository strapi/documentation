---
title: Backend code migration
displayed_sidebar: devDocsSidebar
description: Migrate the backend of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions

pagination_next: dev-docs/migration/v3-to-v4/code/dependencies
---

# v4 code migration: Backend overview

This backend code migration overview is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration).

Most of the backend of Strapi has been entirely rewritten in Strapi v4:

- The core features of a Strapi v4 server (routes, policies, controllers, and services) use factory functions. The new files can be created with the [interactive `strapi generate` CLI](/dev-docs/CLI#strapi-generate).
- There is a clear distinction in Strapi v4 between [policies](/dev-docs/backend-customization/policies) and [middlewares](/dev-docs/backend-customization/middlewares), which leads to the introduction of [route middlewares](/dev-docs/backend-customization/routes#middlewares).

The [project structure](/dev-docs/project-structure) is different in Strapi v3 and Strapi v4. The project structure can be migrated with [Strapi codemods](https://github.com/strapi/codemods) and is not covered in details in this guide.

Migrating the backend of a Strapi application to v4 requires updating all of these core features:

- [configurations](/dev-docs/migration/v3-to-v4/code/configuration)
- [dependencies](/dev-docs/migration/v3-to-v4/code/dependencies)
- [routes](/dev-docs/migration/v3-to-v4/code/routes)
- [controllers](/dev-docs/migration/v3-to-v4/code/controllers)
- [services](/dev-docs/migration/v3-to-v4/code/services)
- [content-type schemas](/dev-docs/migration/v3-to-v4/code/content-type-schema)

Optionally, depending on your usage of these features in Strapi v3, you might also need to migrate:

- [policies](/dev-docs/migration/v3-to-v4/code/policies)
- [route middlewares](/dev-docs/migration/v3-to-v4/code/route-middlewares)
- [global middlewares](/dev-docs/migration/v3-to-v4/code/global-middlewares)
- [GraphQL](/dev-docs/migration/v3-to-v4/code/graphql)

:::note
The dedicated short guides listed in this backend code migration guide are not exhaustive resources for the v4 backend customization features, which are described in the [backend customization](/dev-docs/backend-customization) documentation.
:::

Once the backend of Strapi has been migrated to v4, you can proceed to migrating the [frontend](/dev-docs/migration/v3-to-v4/code/frontend).
