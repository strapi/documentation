---
title: Using Draft & Publish with the Document Service API
description: Use Strapi's Document Service API to return either the draft or the published version of a document
displayed_sidebar: devDocsSidebar
---

# Document Service API: Usage with Draft & Publish

By default the [Document Service API](/dev-docs/api/document-service) returns the draft version of a document when the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature is enabled. This page describes how to use the `status` parameter to return the published version of a document. 

:::note
Passing `{ status: 'draft' }` to a Document Service API query returns the same results as not passing any `status` parameter.
:::

## Get the published version with `findOne()` {#find-one}

`findOne()` queries return the draft version of a document by default.

To return the published version while [finding a specific document](/dev-docs/api/document-service#findone) with the Document Service API, pass `status: 'published'`:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  status: 'published'
});
```

</Request>

<Response>

```js {4}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  publishedAt: "2024-03-14T15:40:45.330Z",
  locale: "en", // default locale
  // …
}
```

</Response>

</ApiCall>

## Get the published version with `findFirst()` {#find-first}

`findFirst()` queries return the draft version of a document by default.

To return the published version while [finding the first document](/dev-docs/api/document-service#findfirst) with the Document Service API, pass `status: 'published'`:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").findFirst({
  status: 'published',
});
```

</Request>

<Response title="Example response">

```json
{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article",
  "slug": "test-article"
  // …
}
```

</Response>
</ApiCall>

## Get the published version with `findMany()` {#find-many}

`findMany()` queries return the draft version of documents by default.

To return the published version while [finding documents](/dev-docs/api/document-service#findmany) with the Document Service API, pass `status: 'published'`:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::article.article").findMany({
  status: 'published'
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
    // …
  }
  // …
]
```

</Response>
</ApiCall>

## `count()` only published versions {#count}

To take into account only draft or published versions of documents while [counting documents](/dev-docs/api/document-service#count) with the Document Service API, pass the corresponding `status` parameter:

```js
// Count draft documents (also actually includes published documents)
const draftsCount = await strapi.documents("api::article.article").count({
  status: 'draft'
});
```

```js
// Count only published documents
const publishedCount = await strapi.documents("api::article.article").count({
  status: 'published'
});
```

:::note
Since published documents necessarily also have a draft counterpart, a published document is still counted as having a draft version.

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore. There currently is no way to prevent already published documents from being counted.
:::
