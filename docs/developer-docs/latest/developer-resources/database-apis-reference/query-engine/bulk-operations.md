---
title: Single Operations for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Bulk Operations

:::caution
To avoid performance issues, bulk operations are not allowed on relations.
:::

## createMany()

Creates multiple entries.

Syntax: `createMany(parameters) => { count: number }`

### Parameters

| Parameter | Type       | Description         |
| --------- | ---------- | ------------------- |
| `data`      | Array of objects | Array of input data |

### Example

```js
await strapi.db.query('article').createMany({
  data: [
    {
      title: 'ABCD',
    },
    {
      title: 'EFGH',
    },
  ],
});

// { count: 2 }
```

## updateMany()

Updates multiple entries matching the parameters.

Syntax: `updateMany(parameters) => { count: number }`

### Parameters

| Parameter | Type                       | Description         |
| --------- | -------------------------- | ------------------- |
| `where`     | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use             |
| `data`      | Object                   | Input data |

### Example

```js
await db.query('article').updateMany({
  where: {
    price: 20,
  },
  data: {
    price: 18,
  },
});

// { count: 42 }
```

## deleteMany()

Deletes multiple entries matching the parameters.

Syntax: `deleteMany(parameters) => { count: number }`

### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `where`     | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use             |

### Example

```js
await db.query('article').deleteMany({
  where: {
    title: {
      $startsWith: 'v3',
    },
  },
});

// { count: 42 }
```

## Aggregations

### count()

Counts entries matching the parameters.

Syntax: `count(parameters) => number`

#### Parameters

| Parameter | Type                       | Description |
| --------- | -------------------------- | ----------- |
| `where`     | [`WhereParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md) to use             |

```js
const count = await db.query('article').count({
  where: {
    title: {
      $startsWith: 'v3',
    },
  },
});

// 12
```
