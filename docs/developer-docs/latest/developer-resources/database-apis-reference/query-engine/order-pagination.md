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
  orderBy: [{ id: 'asc' }, { name: 'desc' }],
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

<!-- ? can we use the page-based (page, pageSize) paginiation here? -->

```js
db.query('article').findMany({
  limit: 10,
  offset: 15,
});
```

