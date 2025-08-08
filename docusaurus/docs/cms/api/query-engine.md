---
unlisted: true
title: Query Engine API
description: Strapi provides a Query Engine API to give unrestricted internal access to the database layer at a lower level.
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- introduction
- Query Engine API
---

import EntityQueryKnex from '/docs/snippets/entity-query-knex.md'
import BackendIntroCrosslink from '/docs/snippets/backend-custom-intro-crosslink.md'
import ConsiderDocumentService from '/docs/snippets/consider-document-service.md'
import QueryEnginePrereqs from '/docs/snippets/query-engine-prereqs.md'

# Query Engine API

The Strapi backend provides a Query Engine API to interact with the database layer at a lower level.

<ConsiderDocumentService />

<QueryEnginePrereqs />

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

The Query Engine allows the following operations on database entries:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="Single operations" description="Create, read, update, and delete single database entries with the Query Engine API." link="/cms/api/query-engine/single-operations" />
<CustomDocCard emoji="" title="Bulk operations" description="Create, read, update, and delete multiple database entries with the Query Engine API." link="/cms/api/query-engine/bulk-operations" />
<CustomDocCard emoji="" title="Filters" description="Get exactly what you need by filtering database entries with the Query Engine API." link="/cms/api/query-engine/filtering" />
<CustomDocCard emoji="" title="Populate" description="Get additional data with your Query Engine API queries by populating relations." link="/cms/api/query-engine/populating" />
<CustomDocCard emoji="" title="Order & Pagination" description="Sort and paginate the results of your Query Engine API queries." link="/cms/api/query-engine/order-pagination" />
</CustomDocCardsWrapper>
