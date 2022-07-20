---
title: Code migration guide for Strapi v4 -  Strapi Developer Docs
description: Migrate the back-end and front-end code of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code-migration.html
---

# v4 code migration guide

Strapi v4 introduces breaking changes that require manually updating the codebase of an existing Strapi project.

This guide covers migrating both [the back end](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) and [the front end](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.md) of a Strapi v3.6.x application to Strapi v4.0.x. and is built around small independent topics.

::: prerequisites
Migrating the back end code of a Strapi application is a prerequisite to migrating the front end.
:::

For each topic covered, this guide is designed to:

- help you understand the main differences between Strapi v3 and v4,
- help you resolve breaking changes by migrating built-in code to Strapi v4,
- and, whenever possible, offer some clues and starting points on how to migrate custom code.

The following topics are covered by this guide, and you can either click on a specific topic to jump to the dedicated migration documentation or click on a scope to read a more general introduction for the back end or the front end migration:

| Scope | Topic |
| - | - |
| [Back end code migration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md)  | <ul><li>[Configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.md)</li><li>[Dependencies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.md)</li><li>[Routes](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.md)</li><li>[Controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md)</li><li>[Services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md)</li><li>[Content-type schema](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.md)</li><li>[Policies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.md)</li><li>[Route middlewares](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.md)</li><li>[Global middlewares](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.md)</li><li>[GraphQL resolvers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.md)</li></ul> |
| [Front end code migration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.md) | <ul><li>[WYSIWYG customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.md)</li><li>[Translations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.md)</li><li>[Webpack configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.md)</li><li>[Theme customizations](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.md)</li><li>[Calls to the `strapi` global variable](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.md)</li></ul> |

::: note
The following topics are not extensively covered in this code migration guide, but Strapi v4 also introduces:

- a new [file structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) for the project, which can be migrated with the help of [Strapi codemods](https://github.com/strapi/codemods/),
- fully rewritten [REST](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) and [GraphQL](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md) APIs, with the REST API not [populating](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md) by default any relations, components, dynamic zones, and medias,
- the new [Entity Service](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) and [Query Engine](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.md) APIs,
- and the [Strapi Design System](https://design-system.strapi.io/) which is used to build the new user interface of Strapi v4.

:::

::: strapi Need more help?
Feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
:::
