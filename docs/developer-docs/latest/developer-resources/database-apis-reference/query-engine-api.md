---
title: Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine

Strapi provides a query engine to interact with the database layer.

You can just call `strapi.query('modelName', 'pluginName')` to access the query API for any model.

These queries handle for you specific Strapi features like `components`, `dynamic zones`, `filters` and `search`.

The query engine lets you perform many interactions with the database layer at a low level, for instance:

```js
qb.query('article').findMany({
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

<!-- TODO: add different links to sections here (for single/bulk ops, populate, filters, etc.) -->
