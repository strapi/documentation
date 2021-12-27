---
title: CRUD operations with Entity Service API - Strapi Developer Docs
description: Use Strapi's Entity Service API to perform CRUD (create, read, update, delete) operations on your content.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.html
---

# Entity Service API: CRUD operations

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) is built on top of the the [Query Engine API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) and uses it to perform CRUD operations on entities.

## findOne()

Finds the first entry matching the parameters.

Syntax: `findOne(uid: string, id: ID, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description                                                                                                                                            | Type                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`   | Attributes to return                                                                                                                                   | `String[]`                                                                                                                                    |
| `populate` | Relations, components and dynamic zones to [populate](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) |

### Example

```js
const entry = await strapi.entityService.findOne('api::article.article', 1, {
  fields: ['title', 'description'],
  populate: { category: true },
});
```

## findMany()

Finds entries matching the parameters.

Syntax: `findMany(uid: string, parameters: Params)` ⇒ `Entry[]`

### Parameters

| Parameter          | Description                                                                                                                                                        | Type                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`           | Attributes to return                                                                                                                                               | `String[]`                                                                                                                                            |
| `filters`          | [Filters](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md) to use                                                      | [`FiltersParameters`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md)             |
| `start`            | Number of entries to skip (see [pagination](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md#pagination))   | `Number`                                                                                                                                              |
| `limit`            | Number of entries to return (see [pagination](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md#pagination)) | `Number`                                                                                                                                              |
| `sort`             | [Order](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md) definition                                       | [`OrderByParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md) |
| `populate`         | Relations, components and dynamic zones to [populate](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md)             | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md)         |
| `publicationState` | Publication state, can be:<ul><li>`live` to return only published entries (default)</li><li>`preview` to return both draft entries & published entries</li></ul>   | `PublicationStateParameter`                                                                                                                           |

### Example

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  fields: ['title', 'description'],
  filters: { title: 'Hello World' },
  sort: { createdAt: 'DESC' },
  populate: { category: true },
});
```

## create()

Creates one entry and returns it

Syntax: `create(uid: string, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description                                                                                                                                            | Type                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`   | Attributes to return                                                                                                                                   | `String[]`                                                                                                                                    |
| `populate` | Relations, components and dynamic zones to [populate](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) |
| `data`     | Input data                                                                                                                                             | `Object`                                                                                                                                      |

### Example

```js
const entry = await strapi.entityService.create('api::article.article', {
  data: {
    title: 'My Article',
  },
});
```

## update()

Updates one entry and returns it.

:::note
`update()` only performs a partial update, so existing fields that are not included won't be replaced.
:::

Syntax: `update(uid: string, id: ID, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description                                                                                                                                            | Type                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`   | Attributes to return                                                                                                                                   | `String[]`                                                                                                                                    |
| `populate` | Relations, components and dynamic zones to [populate](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) |
| `data`     | Input data                                                                                                                                             | `object`                                                                                                                                      |

### Example

```js
const entry = await strapi.entityService.update('api::article.article', 1, {
  data: {
    title: 'xxx',
  },
});
```

## delete()

Deletes one entry and returns it.

Syntax: `delete(uid: string, id: ID, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description                                                                                                                                            | Type                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`   | Attributes to return                                                                                                                                   | `String[]`                                                                                                                                    |
| `populate` | Relations, components and dynamic zones to [populate](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) | [`PopulateParameter`<Fa-Link color="grey"/>](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md) |

### Example

```js
const entry = await strapi.entityService.delete('api::article.article', 1);
```
