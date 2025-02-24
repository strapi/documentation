---
title: Apollo Server v3 upgraded to Apollo Server v4
description: The upgrade from Apollo Server v3 to v4 and graphql ^15 to ^16.
sidebar_label: Upgrade to Apollo Server v4
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Content API
 - GraphQL
 - GraphQL API
 - Apollo Server
 - upgrade to Strapi 5
---

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Apollo Server v3 upgraded to Apollo Server v4

Strapi 5 has migrated to Apollo Server v4 and this might require some manual migration steps.

<Intro />
<BreakingChangeIdCard plugins />

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

## Migration

<MigrationIntro />

### Notes
- Strapi automatically sets `status400ForVariableCoercionErrors: true` in the Apollo Server configuration due to a breaking change introduced by Apollo in v4. This behavior will be the default again in Apollo v5.
- Strapi 5 upgraded the package graphql from ^15 to ^16, and only one version can be included in any project. Therefore, user code or plugins relying on graphql:15 need to use the same version range as Strapi.
- For guidance on upgrading to Apollo Server v4, please refer to the following Manual migration section. For more detailed information, consult the [Apollo v4 migration](https://www.apollographql.com/docs/apollo-server/migration/) documentation.

### Manual migration

To migrate to Strapi 5:

- Set the `x-apollo-operation-name` header or disable the new protection by adding `csrfPrevention: false` to the GraphQL plugin configuration for multipart messages (file uploads).
- Replace `ApolloError` with `GraphQLError`.
- Remove root level configuration options like `formatResponse` and replace them with plugin hooks in the plugins array.
- Remove the modules configuration option and split it into `typeDefs` and `resolvers`.
- Replace `debug` with `includeStacktraceInErrorResponses`.
