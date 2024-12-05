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

# Document Service API: Sorting and paginating results

The [Document Service API](/dev-docs/api/document-service) offers the ability to sort and paginate query results.

## Sort

To sort results returned by the Document Service API, include the `sort` parameter with queries.

### Sort on a single field

To sort results based on a single field:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::article.article").findMany({
  sort: "title:asc",
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
    // ...
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
    // ...
  }
  // ...
]
```

</Response>
</ApiCall>

### Sort on multiple fields

To sort on multiple fields, pass them all in an array:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::article.article").findMany({
  sort: [{ title: "asc" }, { slug: "desc" }],
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
    // ...
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
    // ...
  }
  // ...
]
```

</Response>
</ApiCall>

## Pagination

To paginate results, pass the `limit` and `start` parameters:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::article.article").findMany({
  limit: 10,
  start: 0,
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "documentId": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1"
    // ...
  },
  {
    "documentId": "cjld2cjxh0001qzrm5q1j5q7m",
    "title": "Test Article 2",
    "slug": "test-article-2",
    "body": "Test 2"
    // ...
  }
  // ... (8 more)
]
```

</Response>
</ApiCall>
