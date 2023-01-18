---
title: Single Operations for Query Engine API - Strapi Developer Docs
description: Use Strapi's Query Engine API to perform operations on single entries.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html
---

# Query Engine API: Single Operations

## findOne()

Finds the first entry matching the parameters.

Syntax: `findOne(parameters) ⇒ Entry`

### Parameters

| Parameter  | Type                                                                                                                                         | Description                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `where`    | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use                                                                                                                 |
| `offset`   | Integer                                                                                                                                       | Number of entries to skip                                                                                                |
| `orderBy`  | [`OrderByParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) | [Order](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) definition |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)

### Example

```js
const entry = await strapi.db.query('api::blog.article').findOne({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  populate: { category: true },
});
```

## findMany()

Finds entries matching the parameters.

Syntax: `findMany(parameters) ⇒ Entry[]`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `where`    | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use                                                                                                                 |
| `limit`     | Integer                       | Number of entries to return                 |
| `offset`   | Integer                                                                                                                                       | Number of entries to skip                                                                                                |
| `orderBy`  | [`OrderByParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) | [Order](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) definition |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)

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
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `where`    | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use                                                                                                                 |
| `limit`     | Integer                       | Number of entries to return                 |
| `offset`   | Integer                                                                                                                                       | Number of entries to skip                                                                                                |
| `orderBy`  | [`OrderByParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) | [Order](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md) definition |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)
|

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

Creates one entry and returns it.

Syntax: `create(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)
| data      | Object                      | Input data                                 |

### Example

```js
const entry = await strapi.db.query('api::blog.article').create({
  data: {
    title: 'My Article',
  },
});
```

!!!include(developer-docs/latest/developer-resources/database-apis-reference/snippets/managing-relations.md)!!!

## update()

Updates one entry and returns it.

Syntax: `update(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)
| `where`    | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use                                                                                                                 |
| `data`      | Object                      | Input data                                 |

### Example

```js
const entry = await strapi.db.query('api::blog.article').update({
  where: { id: 1 },
  data: {
    title: 'xxx',
  },
});
```

!!!include(developer-docs/latest/developer-resources/database-apis-reference/snippets/managing-relations.md)!!!

## delete()

Deletes one entry and returns it.

Syntax: `delete(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`   | String, or Array of strings                                                                                                                  | [Attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return |
| `populate` | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)      | Relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md)
| `where`    | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use                                      |

### Example

```js
const entry = await strapi.db.query('api::blog.article').delete({
  where: { id: 1 },
});
```
