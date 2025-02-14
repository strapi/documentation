---
title: Entity Service deprecated
description: In Strapi 5, the Entity Service API is deprecated in favor of the new Document Service API.
sidebar_label: Entity Service deprecated
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Entity Service API
 - Document Service API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import PartialCodemods from '/docs/snippets/breaking-change-partially-handled-by-codemod.md'

# Entity Service deprecated

The Entity Service that was used in Strapi v4 is deprecated and replaced by the new [Document Service API](/cms/api/document-service) in Strapi 5. <MigrationIntro/>

<YesPlugins/>
<PartialCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The Entity Service API is the go-to API to use to interact with your content-types.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The [Document Service API](/cms/api/document-service) replaces the Entity Service API from Strapi v4.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

The following are the main topics to take into account when using the Document Service API instead of the Entity Service API from Strapi v4:

* The Document Service API expects a `documentId` property.<br/>This breaking change also affects the REST and GraphQL APIs (👉 see [the related breaking change entry](/cms/migration/v4-to-v5/breaking-changes/use-document-id)).
  :::info
  To ease the transition to Strapi 5, Document Service API responses still include `id` fields in addition to the new `documentId` fields.
  :::

* The response returned by the `findMany()` function is different in Strapi v4 and Strapi 5:
  <SideBySideContainer>
  <SideBySideColumn>
  
  **In Strapi v4:**

  The `findMany()` function from the Entity Service API returns a single item for single types.
  </SideBySideColumn>

  <SideBySideColumn>

  **In Strapi 5:**

  The [`findMany()` function from the Document Service API](/cms/api/document-service#findmany) always returns arrays.<br/><br/>To get a single item, extract the first item from the returned array, or use [the `findFirst()` function](/cms/api/document-service#findfirst).

  </SideBySideColumn>
  </SideBySideContainer>

* There is no `findPage()` method anymore in Strapi 5.<br/>👉 see [the related breaking change entry](/cms/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service).

* The [Draft & Publish](/cms/features/draft-and-publish) feature has been updated in Strapi 5 and this is reflected in the Document Service API:
  - `publicationState` is replaced by `status`<br/>👉 see [the related breaking change entry](/cms/migration/v4-to-v5/breaking-changes/publication-state-removed).
  - New methods are introduced to handle the updated [Draft & Publish](/cms/features/draft-and-publish) feature:
    - [`publish()`](/cms/api/document-service#publish),
    - [`unpublish()`](/cms/api/document-service#unpublish),
    - and [`discardDraft()`](/cms/api/document-service#discarddraft).

  - The `published_at` property can not be used anymore to trigger the publication of content.

* The [`delete()` function](/cms/api/document-service#delete) of the Document Service API returns a list of affected entries (multiple locales can be deleted all at once), while the `delete()` function from Strapi v4 returns only the deleted entry.

* Entity Service decorators can not be used anymore, and [Document Service middlewares](/cms/api/document-service/middlewares) must be used instead.

* The Document Service API does not support file uploads.


### Migration procedure

The migration is partially handled by a codemod when using the [upgrade tool](/cms/upgrade-tool).

👉 The [Entity Service API to Document Service API migration reference](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) gives additional information about which aspects are handled by the codemod and which use cases require manual migration.
