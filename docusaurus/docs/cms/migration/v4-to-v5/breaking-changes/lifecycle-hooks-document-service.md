---
title: Database lifecycle hooks are triggered differently with the Document Service API methods
description: In Strapi 5, database lifecycle hooks are triggered differently with the various Document Service API methods.
sidebar_label: Lifecycle hooks
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Document Service API
 - lifecycle hooks
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Database lifecycle hooks are triggered differently with the Document Service API methods

In Strapi 5, database lifecycle hooks are triggered differently with the various [Document Service API](/cms/api/document-service) methods, mainly due to the new way the [Draft & Publish](/cms/features/draft-and-publish) feature works.

The majority of use cases should only use the Document Service. The Document Service API handles Draft & Publish, i18n, and any underlying strapi logic.

However, the Document Service API might not suit all your use cases; the database layer is therefore exposed allowing you to do anything on the database without any restriction. Users would then need to resort to the database lifecycle hooks as a system to extend the database behaviour.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In Strapi v4, lifecycle hooks work as documented in the [Strapi v4 documentation](https://docs-v4.strapi.io/cms/backend-customization/models#lifecycle-hooks).

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Lifecycle hooks work the same way as in Strapi v4 but are triggered differently, based on which Document Service API methods are triggered. A complete reference is available (see [notes](#notes)).

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

#### Database lifecycle hooks triggered by the Document Service API methods {#table}
Depending on the [Document Service API methods](/cms/api/document-service) called, the following database lifecycle hooks are triggered:

| Document Service API method       | Triggered database lifecycle hook(s) |
|-----------------------------------|--------------------------------------|
| `findOne()`                       | before(after) findOne                |
| `findFirst()`                     | before(after) findOne                |
| `findMany()`                      | before(after) findMany               |
| `create()`                        | before(after) Create                 |
| `create({ status: 'published' })` | <ul><li>before(after) Create️<br/>Triggered twice as it creates both the draft and published versions</li><li>before(after) Delete<ul><li>Deletes previous draft versions of a document</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul></li></ul> |
| `update()`                        | <ul><li>before(after) Create<br/>when creating a new locale on a document</li><li>before(after) Update<br/>when updating an existing version of a document</li></ul> |
| `update({ status: 'published' })` | <ul><li>before(after) Create<br/>Can be triggered multiple times if deleting multiple locales (one per each locale)</li><li>before(after) Update<br/>when updating an existing version of a document</li><li>before(after) Delete<ul><li>Deletes previous published versions of a document</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul></li></ul> |
| `delete()`                        | before(after) Delete<br/>Can be triggered multiple times if deleting multiple locales (one per each locale) |
| `publish()`                       | <ul><li>before(after) Create<br/>Can be triggered multiple times if deleting multiple locales (one per each locale)</li><li>before(after) Delete<ul><li>Deletes previous published versions of a document</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul></li></ul> |
| `unpublish()`                     | before(after) Delete<ul><li>Deletes all published versions of a document</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul> |
| `discardDraft()`                  | <ul><li>before(after) Create<ul><li>Creates new draft versions</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul></li><li>before(after) Delete<ul><li>Deletes previous draft versions of a document</li><li>Can be triggered multiple times if deleting multiple locales (one per each locale)</li></ul></li></ul> |
| `count()`                         | before(after) Count |

:::note
Bulk actions lifecycles (`createMany`, `updateMany`, `deleteMany`) will never be triggered by a Document Service API method.
:::

### Manual procedure

Users might need to adapt their custom code to how lifecycle hooks are triggered by Document Service API methods in Strapi 5.

