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
| select       | `string[]`                     | Select some attributes to return           |
| where        | [`WhereParam`](#filtering)     | Filter                                     |
| limit        | `number`                       | Always `1` when used with `findOne`        |
| offset       | `number`                       | How many entries to skip                   |
| orderBy      | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate     | [`PopulateParam`](#populating) | Select which relations should be populated |

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
| select    | `string[]`                     | Select some attributes to return           |
| where     | [`WhereParam`](#filtering)     | Filter                                     |
| limit     | `number`                       | How many entries to return                 |
| offset    | `number`                       | How many entries to skip                   |
| orderBy   | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate  | [`PopulateParam`](#populating) | Select which relations should be populated |

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
| select    | `string[]`                     | Select some attributes to return           |
| where     | [`WhereParam`](#filtering)     | Filter                                     |
| limit     | `number`                       | How many entries to return                 |
| offset    | `number`                       | How many entries to skip                   |
| orderBy   | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate  | [`PopulateParam`](#populating) | Select which relations should be populated |

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
| select    | `string[]`                     | Select some attributes to return           |
| populate  | [`PopulateParam`](#populating) | Select which relations should be populated |
| data      | `object`                       | Input data                                 |

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
| select    | `string[]`                     | Select some attributes to return           |
| populate  | [`PopulateParam`](#populating) | Select which relations should be populated |
| where     | [`WhereParam`](#filtering)     | Filter                                     |
| data      | `object`                       | Input data                                 |

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
| select    | `string[]`                     | Select some attributes to return           |
| populate  | [`PopulateParam`](#populating) | Select which relations should be populated |
| where     | [`WhereParam`](#filtering)     | Filter                                     |

### Example

```js
const entry = await db.query('article').delete({
  where: { id: 1 },
});
```
