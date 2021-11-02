---
title: Entity Service API - Ordering & Pagination - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Entity Service API: Ordering & Pagination

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) offers the ability to [order](#ordering) and [paginate](#pagination) results found with its [findMany()](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.html#findmany) method.

## Ordering

To order results returned by the Entity Service API, use the `orderBy` parameter. Results can be ordered based on a [single](#single) or on [multiple](#multiple) attribute(s) and can also use [relational ordering](#relational-ordering).

### Single

```js
strapi.entityService('api::article.article').findMany({
  orderBy: 'id',
});

// single with direction
strapi.entityService('api::article.article').findMany({
  orderBy: { id: 'asc' },
});
```

### Multiple

```js
strapi.entityService('api::article.article').findMany({
  orderBy: ['publishDate', 'name'],
});

// multiple with direction
strapi.entityService('api::article.article').findMany({
  orderBy: [{ title: 'asc' }, { publishedAt: 'desc' }],
});
```

### Relational ordering

```js
strapi.entityService('api::article.article').findMany({
  orderBy: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

To paginate results returned by the Entity Service API, use the `start` and `limit` parameters:

```js
strapi.entityService('api::article.article').findMany({
  start: 10,
  limit: 15,
});
```
