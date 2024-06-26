---
unlisted: true
title: Single Operations
description: Use Strapi's Query Engine API to perform operations on single entries.
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- create()
- deleting content
- findOne()
- findMany()
- findWithCount()
- Query Engine API
- update()
---

import ManagingRelations from '/docs/snippets/managing-relations.md'
import ConsiderDocumentService from '/docs/snippets/consider-document-service.md'

# Single Operations with the Query Engine API

<ConsiderDocumentService />

## findOne()

:::note
 Only use the Query Engine's `findOne()` method if the [Document Service's `findOne()`](/dev-docs/api/document-service#findone) method can't cover your use case.
:::
Finds the first entry matching the parameters.

Syntax: `findOne(parameters) ⇒ Entry`

### Parameters

| Parameter  | Type   | Description   |
| ---------- | -------------- | --------- |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `where`    | [`WhereParameter`](/dev-docs/api/query-engine/filtering/) | [Filters](/dev-docs/api/query-engine/filtering/) to use   |
| `offset`   | Integer   | Number of entries to skip   |
| `orderBy`  | [`OrderByParameter`](/dev-docs/api/query-engine/order-pagination/) | [Order](/dev-docs/api/query-engine/order-pagination/) definition |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/) | Relations to [populate](/dev-docs/api/query-engine/populating/) |

### Example

```js
const entry = await strapi.db.query('api::blog.article').findOne({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  populate: { category: true },
});
```

## findMany()

:::note
 Only use the Query Engine's `findMany()` method if the [Document Service `findMany()`](/dev-docs/api/document-service#findmany) method can't cover your use case.
:::

Finds entries matching the parameters.

Syntax: `findMany(parameters) ⇒ Entry[]`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `where`    | [`WhereParameter`](/dev-docs/api/query-engine/filtering/)  | [Filters](/dev-docs/api/query-engine/filtering/) to use |
| `limit`   | Integer  | Number of entries to return  |
| `offset`   | Integer  | Number of entries to skip |
| `orderBy`  | [`OrderByParameter`](/dev-docs/api/query-engine/order-pagination/) | [Order](/dev-docs/api/query-engine/order-pagination/) definition |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/)      | Relations to [populate](/dev-docs/api/query-engine/populating/) |

### Example

```js
const entries = await strapi.db.query('api::blog.article').findMany({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { publishedAt: 'DESC' },
  populate: { category: true },
});
```

## findWithCount()

Finds and counts entries matching the parameters.

Syntax: `findWithCount(parameters) => [Entry[], number]`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `where`    | [`WhereParameter`](/dev-docs/api/query-engine/filtering/)          | [Filters](/dev-docs/api/query-engine/filtering/) to use |
| `limit`     | Integer    | Number of entries to return    |
| `offset`   | Integer  | Number of entries to skip  |
| `orderBy`  | [`OrderByParameter`](/dev-docs/api/query-engine/order-pagination/) | [Order](/dev-docs/api/query-engine/order-pagination/) definition |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/)      | Relations to [populate](/dev-docs/api/query-engine/populating/) |

### Example

```js
const [entries, count] = await strapi.db.query('api::blog.article').findWithCount({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

## create()

:::note
 Only use the Query Engine's `create()` method if the [Document Service `create()` method](/dev-docs/api/document-service#create) can't cover your use case.
:::

Creates one entry and returns it.

Syntax: `create(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/)  | Relations to [populate](/dev-docs/api/query-engine/populating/) |
| `data`  | Object   | Input data  |

### Example

```js
const entry = await strapi.db.query('api::blog.article').create({
  data: {
    title: 'My Article',
  },
});
```

<ManagingRelations components={props.components} />

## update()

:::note
 Only use the Query Engine's `update()` method if the [Document Service `update()`](/dev-docs/api/document-service#update) method can't cover your use case.
:::

Updates one entry and returns it.

Syntax: `update(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/)      | Relations to [populate](/dev-docs/api/query-engine/populating/)
| `where`    | [`WhereParameter`](/dev-docs/api/query-engine/filtering/)          | [Filters](/dev-docs/api/query-engine/filtering/) to use  |
| `data`  | Object     | Input data   |

### Example

```js
const entry = await strapi.db.query('api::blog.article').update({
  where: { id: 1 },
  data: {
    title: 'xxx',
  },
});
```

<ManagingRelations components={props.components} />

## delete()

:::note
 Only use the Query Engine's `delete()` method if the [Document Service `delete()`](/dev-docs/api/document-service#delete) method can't cover your use case.
:::

Deletes one entry and returns it.

Syntax: `delete(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings | [Attributes](/dev-docs/backend-customization/models#model-attributes) to return |
| `populate` | [`PopulateParameter`](/dev-docs/api/query-engine/populating/)      | Relations to [populate](/dev-docs/api/query-engine/populating/)
| `where`    | [`WhereParameter`](/dev-docs/api/query-engine/filtering/)          | [Filters](/dev-docs/api/query-engine/filtering/) to use    |

### Example

```js
const entry = await strapi.db.query('api::blog.article').delete({
  where: { id: 1 },
});
```
