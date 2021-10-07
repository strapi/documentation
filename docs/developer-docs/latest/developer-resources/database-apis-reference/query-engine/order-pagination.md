---
title: Ordering for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Ordering & Paginating

## Ordering

### Single

```js
db.query('article').findMany({
  orderBy: 'id',
});

// single with direction
db.query('article').findMany({
  orderBy: { id: 'asc' },
});
```

### Multiple

```js
db.query('article').findMany({
  orderBy: ['id', 'name'],
});

// multiple with direction
db.query('article').findMany({
  orderBy: [{ title: 'asc' }, { publishedAt: 'desc' }],
});
```

### Relational ordering

```js
db.query('article').findMany({
  orderBy: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

```js
db.query('article').findMany({
  limit: 10,
  offset: 15,
});
```
