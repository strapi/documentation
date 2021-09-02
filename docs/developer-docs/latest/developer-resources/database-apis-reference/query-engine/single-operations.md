---
title: Single Operations for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Single Operations

## findOne()

Finds the first entry matching the parameters.

Syntax: `findOne(parameters) ⇒ Entry`

### Parameters

| Parameter    | Type                           | Description                                |
| ------------ | ------------------------------ | ------------------------------------------ |
| `select`       | String, or Array of strings                     | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| `where`       | [`WhereParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)     | Filter                                     |
| `limit`        | Number                       | Always `1` when used with `findOne`        |
| `offset`       | Number                       | How many entries to skip                   |
| `orderBy`      | [`OrderByParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)    | How to order the entries                   |
| `populate`     | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |

### Example

```js
const entry = await db.query('article').findOne({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

## findMany()

Finds entries matching the parameters.

Syntax: `findMany(parameters) ⇒ Entry[]`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`    | String, or Array of strings                    | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| `where`     | [`WhereParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)     | Filter                                     |
| `limit`     | Number                       | How many entries to return                 |
| `offset`    | Number                       | How many entries to skip                   |
| `orderBy`   | [`OrderByParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)    | How to order the entries                   |
| `populate`  | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |

### Example

```js
const entries = await db.query('article').findMany({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

## findWithCount()

Finds and counts entries matching the parameters.

Syntax: `findWithCount(parameters) => [Entry[], number]`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| `select`    | String, or Array of strings                     | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| `where`     | [`WhereParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)     | Filter                                     |
| `limit`     | Number                       | How many entries to return                 |
| `offset`    | Number                       | How many entries to skip                   |
| `orderBy`   | [`OrderByParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)    | How to order the entries                   |
| `populate`  | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |

### Example

```js
const [entries, count] = await db.query('article').findWithCount({
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
| select    | String, or Array of strings                    | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| populate  | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |
| data      | Object                      | Input data                                 |

### Example

```js
const entry = await db.query('article').create({
  data: {
    title: 'My Article',
  },
});
```

## update()

Updates one entry and returns it.

Syntax: `update(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| select    | String, or Array of strings                    | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| populate  | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |
| where     | [`WhereParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)     | Filter                                     |
| data      | Object                      | Input data                                 |

### Example

```js
const entry = await db.query('article').update({
  where: { id: 1 },
  data: {
    title: 'xxx',
  },
});
```

## delete()

Deletes one entry and returns it.

Syntax: `delete(parameters) => Entry`

### Parameters

| Parameter | Type                           | Description                                |
| --------- | ------------------------------ | ------------------------------------------ |
| select    | String, or Array of strings                    | Select some [attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) to return           |
| populate  | [`PopulateParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) | Select which relations should be populated |
| where     | [`WhereParam`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md)     | Filter                                     |

### Example

```js
const entry = await db.query('article').delete({
  where: { id: 1 },
});
```
