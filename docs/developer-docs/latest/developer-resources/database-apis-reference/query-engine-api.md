---
title: Query Engine API - Strapi Developer Docs
description: Strapi provides a Query Engine API to give unrestricted internal access to the database layer at a lower level.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html
---

# Query Engine API

Strapi provides a Query Engine API to interact with the database layer at a lower level. It should mostly be used by plugin developers and developers adding custom business logic to their applications. In most use cases, it's recommended to use the [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) instead.

::: strapi Entity Service API vs. Query Engine API
!!!include(developer-docs/latest/developer-resources/database-apis-reference/snippets/entity-query-knex-callout.md)!!!
:::

## Basic usage

The Query Engine is available through `strapi.db.query`:

```js
strapi.db.query('api::blog.article').findMany({ // uid syntax: 'api::api-name.content-type-name'
  where: {
    title: {
      $startsWith: '2021',
      $endsWith: 'v4',
    },
  },
  populate: {
    category: true,
  },
});
```

## Available operations

The Query Engine allows operations on database entries, such as:

- CRUD operations on [single entries](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md) or [multiple entries](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.md)
- [filtering entries](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md), [populating relations](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) and [ordering and paginating queries results](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)
