---
title: Using Sort & Pagination with the Document Service API
description: Use Strapi's Document Service API to sort and paginate query results
displayed_sidebar: cmsSidebar
sidebar_label: Sort & Pagination
tags:
- API
- Content API
- Document Service API
- sort
- pagination
---

import Endpoint from '@site/src/components/ApiReference/Endpoint';

# Document Service API: Sorting and paginating results

The [Document Service API](/cms/api/document-service) offers the ability to sort and paginate query results.

## Sort

To sort results returned by the Document Service API, include the `sort` parameter with queries.

### Sort on a single field

To sort results based on a single field:

<Endpoint
  id="sort-single-field"
  method="GET"
  path="strapi.documents().findMany()"
  title="Sort on a single field"
  description="Sort results based on a single field using a string value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const documents = await strapi.documents("api::article.article").findMany({
  sort: "title:asc",
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
  }
]`,
    },
  ]}
/>

### Sort on multiple fields

To sort on multiple fields, pass them all in an array:

<Endpoint
  id="sort-multiple-fields"
  method="GET"
  path="strapi.documents().findMany()"
  title="Sort on multiple fields"
  description="Sort results on multiple fields by passing an array of sort objects."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const documents = await strapi.documents("api::article.article").findMany({
  sort: [{ title: "asc" }, { slug: "desc" }],
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
  }
]`,
    },
  ]}
/>

## Pagination

To paginate results, pass the `limit` and `start` parameters:

<Endpoint
  id="pagination"
  method="GET"
  path="strapi.documents().findMany()"
  title="Pagination"
  description="Paginate results using the limit and start parameters."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const documents = await strapi.documents("api::article.article").findMany({
  limit: 10,
  start: 0,
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
  }
]`,
    },
  ]}
/>
