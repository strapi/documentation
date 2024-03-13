---
title: Apollo Server v3 upgraded to Apollo Server v4
description: The upgrade from Apollo Server v3 to v4 and graphql ^15 to ^16.
sidebar_label: Upgrade to Apollo Server v4
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - GraphQL
 - GraphQL API
---

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Apollo Server v3 upgraded to Apollo Server v4

Strapi 5 has strict requirements on the configuration filenames allowed to be loaded.
<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Apollo Server v3 for the GraphQL server and graphql ^15 for the GraphQL module.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Apollo Server v4 for the GraphQL server and graphql ^16 for the GraphQL module.

</SideBySideColumn>

</SideBySideContainer>

:::callout
Strapi automatically sets `status400ForVariableCoercionErrors: true` in the Apollo Server configuration due to a breaking change introduced by Apollo in v4. This behavior will be the default again in Apollo v5.
:::

:::callout
We upgraded the package graphql from ^15 to ^16, and only one version can be included in any project. Therefore, user code or plugins relying on graphql:15 need to use the same version range as Strapi.
:::

## Migration

<MigrationIntro />

### Notes

- The migration process for user code and configuration is too complicated for Strapi to cover completely. 
- For detailed instrustion consult the Apollo v4 migration documentation.
- To the following Manual migration section contains some key changes relevant to Strapi users.

### Manual migration

To migrate to Strapi 5:

- Multipart messages (file uploads) now require the `x-apollo-operation-name` header to be set or the new protection disabled by adding `csrfPrevention: false` to the GraphQL plugin configuration.
- `ApolloError` has been replaced with `GraphQLError`.
- Some root level config options like `formatResponse` have been removed and replaced with plugin hooks in the plugins array.
- The modules config option is removed and split into `typeDefs` and `resolvers`.
- `debug` is replaced with `includeStacktraceInErrorResponses`.