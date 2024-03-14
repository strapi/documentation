---
title: Using Draft & Publish with the Document Service API
description: Use Strapi's Document Service API to return either the draft or the published version of a document
displayed_sidebar: devDocsSidebar
---

# Document Service API: Usage with Draft & Publish

By default the [Document Service API](/dev-docs/api/document-service) returns the draft version of a document when the [Internationalization (i18n)](/dev-docs/plugins/i18n) feature is enabled. This page describes how to use the `status` parameter to return either the draft or the published version of a document

## Get the published version with `findOne()` queries {#find-one}

`findOne()` queries return the draft version of a document by default.

To return the published version while [finding a specific document](/dev-docs/api/document-service#findone) with the Document Service API, pass `status: 'published'`:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").findOne(
  documentId,
  { status: "published" },
);
```

</Request>

<Response title="Example response">

```json
{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article",
  "slug": "test-article"
}
```

</Response>
</ApiCall>

## Get the published version with `findFirst()` queries {#find-first}

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
}
```

</Response>
</ApiCall>

## Get the published version with `findMany()` queries {#find-many}

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
    "slug": "test-article"
  }
  // ...
]
```

</Response>
</ApiCall>

## `count()` only draft or published versions {#count}

To take into account only draft or published versions of documents while [counting documents](/dev-docs/api/document-service#count) with the Document Service API, pass the corresponding `status` parameter:

```js
// Count only draft documents
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
