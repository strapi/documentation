---
title: v4 code migration
displayed_sidebar: devDocsSidebar
description: Migrate the backend and frontend code of a Strapi application from v3.6.x to v4.0.x with step-by-step instructions

---

# v4 code migration guide

Strapi v4 introduces breaking changes that require manually updating the codebase of an existing Strapi project.

This guide covers migrating both [the backend](/dev-docs/migration/v3-to-v4/code/backend) and [the frontend](/dev-docs/migration/v3-to-v4/code/frontend) of a Strapi v3.6.x application to Strapi v4.0.x. and is built around small independent topics.

:::prerequisites
Migrating the backend code of a Strapi application is a prerequisite to migrating the frontend.
:::

For each topic covered, this guide is designed to:

- help you understand the main differences between Strapi v3 and v4,
- help you resolve breaking changes by migrating built-in code to Strapi v4,
- and, whenever possible, offer some clues and starting points on how to migrate custom code.

The following topics are covered by this guide, and you can either click on a specific topic to jump to the dedicated migration documentation or click on a scope to read a more general introduction for the backend or the frontend migration:

| Scope | Topic |
| - | - |
| [Backend code migration](/dev-docs/migration/v3-to-v4/code/backend)  | <ul><li>[Configuration](/dev-docs/migration/v3-to-v4/code/configuration)</li><li>[Dependencies](/dev-docs/migration/v3-to-v4/code/dependencies)</li><li>[Routes](/dev-docs/migration/v3-to-v4/code/routes)</li><li>[Controllers](/dev-docs/migration/v3-to-v4/code/controllers)</li><li>[Services](/dev-docs/migration/v3-to-v4/code/services)</li><li>[Content-type schema](/dev-docs/migration/v3-to-v4/code/content-type-schema.md)</li><li>[Policies](/dev-docs/migration/v3-to-v4/code/policies)</li><li>[Route middlewares](/dev-docs/migration/v3-to-v4/code/route-middlewares)</li><li>[Global middlewares](/dev-docs/migration/v3-to-v4/code/global-middlewares)</li><li>[GraphQL resolvers](/dev-docs/migration/v3-to-v4/code/graphql)</li></ul> |
| [Frontend code migration](/dev-docs/migration/v3-to-v4/code/frontend) | <ul><li>[WYSIWYG customizations](/dev-docs/migration/v3-to-v4/code/wysiwyg)</li><li>[Translations](/dev-docs/migration/v3-to-v4/code/translations)</li><li>[Webpack configuration](/dev-docs/migration/v3-to-v4/code/webpack)</li><li>[Theme customizations](/dev-docs/migration/v3-to-v4/code/theming)</li><li>[Calls to the `strapi` global variable](/dev-docs/migration/v3-to-v4/code/strapi-global)</li></ul> |

:::note
The following topics are not extensively covered in this code migration guide, but Strapi v4 also introduces:

- a new [file structure](/dev-docs/project-structure) for the project, which can be migrated with the help of [Strapi codemods](https://github.com/strapi/codemods/),
- fully rewritten [REST](/dev-docs/api/rest) and [GraphQL](/dev-docs/api/graphql) APIs, with the REST API not [populating](/dev-docs/api/rest/populate-select) by default any relations, components, dynamic zones, and medias,
- the new [Entity Service](/dev-docs/api/entity-service) and [Query Engine](/dev-docs/api/query-engine) APIs,
- and the [Strapi Design System](https://design-system.strapi.io/) which is used to build the new user interface of Strapi v4.

:::

:::strapi Need more help?
Feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
:::
