---
title: Query Engine API
description: Strapi provides a Query Engine API to give unrestricted internal access to the database layer at a lower level.
displayed_sidebar: devDocsSidebar
---

import EntityQueryKnex from '/docs/snippets/entity-query-knex.md'

# Query Engine API

Strapi provides a Query Engine API to interact with the database layer at a lower level. It should mostly be used by plugin developers and developers adding custom business logic to their applications. In most use cases, it's recommended to use the [Entity Service API](/dev-docs/api/entity-service/) instead.

:::strapi Entity Service API vs. Query Engine API
<EntityQueryKnex components={props.components} />
:::

## Basic usage

The Query Engine is available through `strapi.db.query`:

```js
strapi.db.query('api::blog.article').findMany({ // uid syntax: 'api::api-name.content-type-name'
  where: {
    title: {
      $startsWith: '2021',
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

- CRUD operations on [single entries](/dev-docs/api/query-engine/single-operations) or [multiple entries](/dev-docs/api/query-engine/bulk-operations)
- [filtering entries](/dev-docs/api/query-engine/filtering), [populating relations](/dev-docs/api/query-engine/populating) and [ordering and paginating queries results](/dev-docs/api/query-engine/order-pagination)
