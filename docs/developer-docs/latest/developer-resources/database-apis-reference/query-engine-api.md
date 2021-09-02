---
title: Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API

Strapi provides a Query Engine API to interact with the database layer at a lower level. It should mostly be used by plugin developers and developers adding custom business logic to their applications.

Strapi's Query Engine query lets you perform many interactions available with the [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) or [GraphQL API](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md) but at a lower level, by interacting with the database layer.

## Basic usage

The Query Engine is available through `db.query`:

```js
db.query('article').findMany({
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

The Query Engine allows many operations on database entities, such as:

- CRUD operations on [single entities](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md) or [multiple entities](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.md)
- taking advantage of the features leveraged by Strapi Content API such as [filtering entries](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.md), [populating relations](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.md) and [ordering and paginating queries results](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.md)
