---
title: Ordering for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Ordering & Paginating

## Ordering

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

```js
strapi.db.query('api::article.article').findMany({
  limit: 10,
  offset: 15,
});
```
