---
title: publicationState is removed and replaced by status
description: In Strapi 5, 'publicationState' can no longer be used in Content API calls. The new status parameter can be used and accepts 2 different values, draft and published.
sidebar_label: status instead of publicationState
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Content API
 - GraphQL API
 - Document Service API
 - Draft & Publish
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `publicationState` is removed and replaced by `status`

In Strapi 5, the [Draft & Publish feature](/cms/features/draft-and-publish) has been reworked, and the Content API, including REST, GraphQL, and Document Service APIs accept a new `status` parameter.

<Intro />

<BreakingChangeIdCard
  plugins
  codemodName="entity-service-document-service"
  codemodLink="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/entity-service-document-service.code.ts"
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

`publicationState` is used and accepts the following values:

- `live` returns only published entries,
- `preview` returns both draft entries & published entries.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

`status` is used and accepts the following values:

- `draft` returns the draft version of a document,
- `published` returns the published version of a document.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* There are no fallbacks to return by default the published version, and return the draft version if no published version is found.
* Additional information about how to use the new `status` parameter can be found in the [REST API](/cms/api/rest/status), [GraphQL API](/cms/api/graphql#status), and [Document Service API](/cms/api/document-service/status) documentation.

### Migration procedure

* API calls initiated from the front end (REST API, GraphQL API) that used `publicationState` need to be manually updated.
* If `publicationState` is used in your custom back-end code with the Entity Service API in Strapi v4, a codemod will automatically handle the change for Strapi 5 (see [Entity Service to Document Service migration reference](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) for additional details).
