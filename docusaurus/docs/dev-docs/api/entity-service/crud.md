---
title: CRUD operations
description: Use Strapi's Entity Service API to perform CRUD (create, read, update, delete) operations on your content.
displayed_sidebar: devDocsSidebar
unlisted: true
---
import ManagingRelations from '/docs/snippets/managing-relations.md'
import ESdeprecated from '/docs/snippets/entity-service-deprecated.md'

# CRUD operations with the Entity Service API

<ESdeprecated />

The [Entity Service API](/dev-docs/api/entity-service) is built on top of the the [Query Engine API](/dev-docs/api/query-engine) and uses it to perform CRUD operations on entities.


The `uid` parameter used in function calls for this API is a `string` built with the following format: `[category]::[content-type]` where `category` is one of: `admin`, `plugin` or `api`.

Examples:
- A correct `uid` to get users of the Strapi admin panel is `admin::user`.
- A possible `uid` for the Upload plugin could be `plugin::upload.file`.
- As the `uid`s for user-defined custom content-types follow the `api::[content-type]` syntax, if a content-type `article` exists, it is referenced by `api::article.article`.

:::tip
Run the [`strapi content-types:list`](/dev-docs/cli#strapi-content-types) command in a terminal to display all possible content-types' `uid`s for a specific Strapi instance.
:::

## findOne()

Finds the first entry matching the parameters.

Syntax: `findOne(uid: string, id: ID, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description | Type |
| ---------- | --------------- | --------------- |
| `fields`   | Attributes to return | `String[]`  |
| `populate` | Relations, components and dynamic zones to [populate](/dev-docs/api/entity-service/populate) | [`PopulateParameter`](/dev-docs/api/entity-service/populate) |

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

| Parameter   | Description | Type   |
| ----------- | ------ | -------------- |
| `fields`  | Attributes to return   | `String[]`  |
| `filters` | [Filters](/dev-docs/api/entity-service/filter) to use   | [`FiltersParameters`](/dev-docs/api/entity-service/filter)             |
| `start`   | Number of entries to skip (see [pagination](/dev-docs/api/entity-service/order-pagination#pagination))   | `Number`  |
| `limit`   | Number of entries to return (see [pagination](/dev-docs/api/entity-service/order-pagination#pagination)) | `Number`  |
| `sort`   | [Order](/dev-docs/api/entity-service/order-pagination) definition  | [`OrderByParameter`](/dev-docs/api/entity-service/order-pagination) |
| `populate`  | Relations, components and dynamic zones to [populate](/dev-docs/api/entity-service/populate)  | [`PopulateParameter`](/dev-docs/api/entity-service/populate)         |
| `publicationState` | Publication state, can be:<ul><li>`live` to return only published entries</li><li>`preview` to return both draft entries & published entries (default)</li></ul>   | `PublicationStateParameter`  |

### Example

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  fields: ['title', 'description'],
  filters: { title: 'Hello World' },
  sort: { createdAt: 'DESC' },
  populate: { category: true },
});
```

<br/>

:::tip
To retrieve only draft entries, combine the `preview` publication state and the `publishedAt` fields:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  publicationState: 'preview',
  filters: {
    publishedAt: {
      $null: true,
    },
  },
});

:::

## create()

Creates one entry and returns it

Syntax: `create(uid: string, parameters: Params)` ⇒ `Entry`

### Parameters

| Parameter  | Description | Type |
| ---------- | ----------- | ---------- |
| `fields`   | Attributes to return | `String[]`  |
| `populate` | Relations, components and dynamic zones to [populate](/dev-docs/api/entity-service/populate) | [`PopulateParameter`](/dev-docs/api/entity-service/populate) |
| `data`     | Input data  | `Object` |

<ManagingRelations components={props.components} />

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

<ManagingRelations components={props.components} />

### Parameters

| Parameter  | Description | Type |
| ---------- | ------------- | ---------- |
| `fields`   | Attributes to return | `String[]`  |
| `populate` | Relations, components and dynamic zones to [populate](/dev-docs/api/entity-service/populate) | [`PopulateParameter`](/dev-docs/api/entity-service/populate) |
| `data`     | Input data  | `object`  |

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

| Parameter  | Description | Type |
| ---------- | --------- | -------- |
| `fields`   | Attributes to return | `String[]`  |
| `populate` | Relations, components and dynamic zones to [populate](/dev-docs/api/entity-service/populate) | [`PopulateParameter`](/dev-docs/api/entity-service/populate) |

### Example

```js
const entry = await strapi.entityService.delete('api::article.article', 1);
```
