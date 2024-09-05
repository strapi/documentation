---
unlisted: true
title: Ordering & Pagination
description: Use Strapi's Query Engine API to order and paginate the results of your queries.
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- sort
- pagination
- Query Engine API
---

import ConsiderDocumentService from '/docs/snippets/consider-document-service.md'

# Ordering and Paginating with the Query Engine API

<ConsiderDocumentService />

The [Query Engine API](/dev-docs/api/query-engine) offers the ability to [order](#ordering) and [paginate](#pagination) results.

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
