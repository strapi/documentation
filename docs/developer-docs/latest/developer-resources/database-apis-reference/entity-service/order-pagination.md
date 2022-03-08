---
title: Ordering & Pagination with Entity Service API - Strapi Developer Docs
description: Use Strapi's Entity Service API to order and paginate queries results.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.html
---

# Entity Service API: Ordering & Pagination

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) offers the ability to [order](#ordering) and [paginate](#pagination) results found with its [findMany()](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.md#findmany) method.

## Ordering

To order results returned by the Entity Service API, use the `sort` parameter. Results can be ordered based on a [single](#single) or on [multiple](#multiple) attribute(s) and can also use [relational ordering](#relational-ordering).

### Single

To order results by a single field, just pass it to the `sort` parameter:

- either as a string to sort with the default ascending order
- or as an object to define both the field name and the order (i.e. `'asc'` for ascending order or `'desc'` for descending order)

```js
strapi.entityService.findMany('api::article.article', {
  sort: 'id',
});

// single with direction
strapi.entityService.findMany('api::article.article', {
  sort: { id: 'desc' },
});
```

### Multiple

To order results by multiple fields, pass the fields as an array to the `sort` parameter:

- either as an array of strings to sort multiple fields using the default ascending order
- or as an array of objects to define both the field name and the order (i.e. `'asc'` for ascending order or `'desc'` for descending order)

```js
strapi.entityService.findMany('api::article.article', {
  sort: ['publishDate', 'name'],
});

// multiple with direction
strapi.entityService.findMany('api::article.article', {
  sort: [{ title: 'asc' }, { publishedAt: 'desc' }],
});
```

### Relational ordering

Fields can also be sorted based on fields from relations:

```js
strapi.entityService.findMany('api::article.article', {
  sort: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

To paginate results returned by the Entity Service API, use the `start` and `limit` parameters:

```js
strapi.entityService.findMany('api::article.article', {
  start: 10,
  limit: 15,
});
```
