---
title: CRUD operations with Entity Service API - Strapi Developer Docs
description: …
---

<!-- TODO: update SEO -->

# Entity Service API: CRUD operations

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) is built on top of the the [Query Engine API](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.md) to perform CRUD operations on entities.

## findOne()

Finds the first entry matching the parameters.

Syntax: `findOne(uid: string, id: ID, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter | Description                                | Type                           |
| --------- | ------------------------------------------ | ------------------------------ |
| fields    | Select some attributes to return           | `string[]`                     |
| populate  | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |

### Example

```js
const entry = await strapi.entityService.findOne('article', {
  fields: ['title', 'description'],
  filters: { title: 'Hello World' },
  sort: { title: 'DESC' },
  populate: { category: true },
});
```

## findMany()

Finds entries matching the parameters.

Syntax: `findMany(uid: string, parameters: Params)` ⇒ `Entry[]`

### Parameters

| Parameter        | Description                                | Type                           |
| ---------------- | ------------------------------------------ | ------------------------------ |
| fields           | Select some attributes to return           | `string[]`                     |
| filters          | Filter                                     | [`FilterParameters`](#filtering)   |
| start            | How many entries to skip                   | `number`                       |
| limit            | Always `1` when used with `findOne`        | `number`                       |
| sort             | How to order the entries                   | [`OrderByParameter`](#ordering)    |
| populate         | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |
| publicationState | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |

### Example

```js
const entries = await strapi.entityService.findMany('articles', {
  fields: ['title', 'description'],
  filters { title: 'Hello World' },
  sort: { title: 'DESC' },
  populate: { category: true },
});
```

## create()

Creates one entry and returns it

Syntax: `create(uid: string, parameters: Params)` => `Entry`

### Parameters

| Parameter | Description                                | Type                           |
| --------- | ------------------------------------------ | ------------------------------ |
| fields    | Select some attributes to return           | `string[]`                     |
| populate  | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |
| data      | Input data                                 | `Object`                       |

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

Syntax: `update(uid: string, id: ID, parameters: Params)` => `Entry`

### Parameters

| Parameter | Description                                | Type                           |
| --------- | ------------------------------------------ | ------------------------------ |
| fields    | Select some attributes to return           | `string[]`                     |
| populate  | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |
| data      | Input data                                 | `object`                       |

### Example

```js
const entry = await db.query('article').update({
  filters { id: 1 },
  data: {
    title: 'xxx',
  },
});
```

## delete()

Deletes one entry and returns it.

Syntax: `delete(uid: string, id: ID, parameters: Params)` => `Entry`

### Parameters

| Parameter | Description                                | Type                           |
| --------- | ------------------------------------------ | ------------------------------ |
| fields    | Select some attributes to return           | `string[]`                     |
| populate  | Select which relations should be populated | [`PopulateParameter`](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) |

### Example

```js
const entry = await db.query('article').delete({
  filters { id: 1 },
});
```
