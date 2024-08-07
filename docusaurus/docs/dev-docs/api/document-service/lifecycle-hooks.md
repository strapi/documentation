---
title: Database lifecycle triggered with Document Service API methods
description: Learn which lifecycle hooks are triggered when using Document Service API methods.
displayed_sidebar: devDocsSidebar
tags:
- Document Service API
- lifecycle hooks
---

# Document Service API: Triggered database lifecycle hooks

Depending on the [Document Service API methods](/dev-docs/api/document-service) called, the following database lifecycle hooks are triggered:

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

:::strapi Document Service middlewares
In Strapi 5, Document Service middlewares allow you to perform actions before and after a method runs. Please refer to the [Document Service middlewares documentation](/dev-docs/api/document-service/middlewares) for more information on how to register and implement this type of middleware.
:::
