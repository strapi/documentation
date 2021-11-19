---
title: Ordering & Pagination for Query Engine API - Strapi Developer Docs
description: Use Strapi's Query Engine API to order and paginate the results of your queries.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.html
---

# Query Engine API: Ordering & Paginating

The [Query Engine API](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.md) offers the ability to [order](#ordering) and [paginate](#pagination) results.

## Ordering

To order results returned by the Query Engine, use the `orderBy` parameter. Results can be ordered based on a [single](#single) or on [multiple](#multiple) attributes and can also use [relational ordering](#relational-ordering).

### Single

```js
strapi.db.query('api::article.article').findMany({
  orderBy: 'id',
});

// single with direction
strapi.db.query('api::article.article').findMany({
  orderBy: { id: 'asc' },
});
```

### Multiple

```js
strapi.db.query('api::article.article').findMany({
  orderBy: ['id', 'name'],
});

// multiple with direction
strapi.db.query('api::article.article').findMany({
  orderBy: [{ title: 'asc' }, { publishedAt: 'desc' }],
});
```

### Relational ordering

```js
strapi.db.query('api::article.article').findMany({
  orderBy: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

To paginate results returned by the Query Engine API, use the `offset` and `limit` parameters:

```js
strapi.db.query('api::article.article').findMany({
  offset: 15, 
  limit: 10,
});
```
