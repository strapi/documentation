---
title: Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API

Strapi provides a Query Engine API to interact with the database layer at a lower level. It should mostly be used by plugin developers and developers adding custom business logic to their applications.

Strapi's Query Engine API gives unrestricted internal access to the database layer. It is not aware of the complex data structures like components and dynamic zones, as opposed to the [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md).

## Basic usage

The Query Engine is available through `strapi.db.query`:

```js
strapi.db.query('api::blog.article').findMany({ // uid syntax: 'api::api-name.content-type-name'
  where: {
    title: {
      $startWith: '2021',
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

- CRUD operations on [single entities](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md) or [multiple entities](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.md)
- [filtering entries](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md), [populating relations](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) and [ordering and paginating queries results](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)
