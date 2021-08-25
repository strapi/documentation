---
title: Single Operations for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Bulk Operations

<!-- TODO: add intro here -->

<!-- ? not sure we should include this caution, which was [part of the RFC](https://strapi-rfc-v4.netlify.app/database/query-engine.html#bulk-operation) -->
:::caution
To avoid performance pitfalls, bulk operations are not allowed on relations (attach/detach…).
:::

## createMany()

Creates multiple entries.

Syntax: `createMany(parameters) => { count: number }`

### Parameters

| Parameter | Type       | Description         |
| --------- | ---------- | ------------------- |
| data      | `object[]` | Array of input data |

### Example

```js
await db.query('article').createMany({
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
| where     | [`WhereParam`](#filtering) | Filter              |
| data      | `object`                   | Array of input data |

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
| where     | [`WhereParam`](#filtering) | Filter      |

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
| where     | [`WhereParam`](#filtering) | Filter      |

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
