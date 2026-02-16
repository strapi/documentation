---
title: Using Draft & Publish with the Document Service API
description: Use Strapi's Document Service API to return either the draft or the published version of a document
displayed_sidebar: cmsSidebar
sidebar_label: Status
tags:
- API
- Content API
- count()
- Document Service API
- Draft & Publish
- findOne()
- findMany()
- findFirst()
- hasPublishedVersion
- status

---

# Document Service API: Usage with Draft & Publish

By default the [Document Service API](/cms/api/document-service) returns the draft version of a document when the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled. This page describes how to use the `status` parameter to:

- return the published version of a document,
- count documents depending on their status,
- and directly publish a document while creating it or updating it.

This page also describes the [`hasPublishedVersion`](#haspublishedversion) parameter, which filters documents by whether they have a published version.

:::note
Passing `{ status: 'draft' }` to a Document Service API query returns the same results as not passing any `status` parameter.
:::

## Get the published version with `findOne()` {#find-one}

`findOne()` queries return the draft version of a document by default.

To return the published version while [finding a specific document](/cms/api/document-service#findone) with the Document Service API, pass `status: 'published'`:

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

To return the published version while [finding the first document](/cms/api/document-service#findfirst) with the Document Service API, pass `status: 'published'`:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").findFirst({
  status: 'published',
});
```

</Request>

<Response title="Example response">

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

## Get the published version with `findMany()` {#find-many}

`findMany()` queries return the draft version of documents by default.

To return the published version while [finding documents](/cms/api/document-service#findmany) with the Document Service API, pass `status: 'published'`:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  status: 'published'
});
```

</Request>

<Response title="Example response">

```js {5}
[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    name: "Biscotte Restaurant",
    publishedAt: "2024-03-14T15:40:45.330Z",
    locale: "en", // default locale
    // …
  }
  // …
]
```

</Response>
</ApiCall>

## `count()` only draft or published versions {#count}

To take into account only draft or published versions of documents while [counting documents](/cms/api/document-service#count) with the Document Service API, pass the corresponding `status` parameter:

```js
// Count draft documents (also actually includes published documents)
const draftsCount = await strapi.documents("api::restaurant.restaurant").count({
  status: 'draft'
});
```

```js
// Count only published documents
const publishedCount = await strapi.documents("api::restaurant.restaurant").count({
  status: 'published'
});
```

:::note
Since published documents necessarily also have a draft counterpart, a published document is still counted as having a draft version.

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore.

To exclude already-published documents from the count, use the [`hasPublishedVersion`](#count-never-published-documents) parameter.
:::

## Create a draft and publish it {#create}

To automatically publish a document while creating it, add `status: 'published'` to parameters passed to `create()`:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').create({
  data: {
    name: "New Restaurant",
  },
  status: 'published',
})
```

</Request>

<Response>

```js {5}
{
  documentId: "d41r46wac4xix5vpba7561at",
  name: "New Restaurant",
  publishedAt: "2024-03-14T17:29:03.399Z",
  locale: "en" // default locale
  // …
}
```

</Response>
</ApiCall>

## Update a draft and publish it {#update}

To automatically publish a document while updating it, add `status: 'published'` to parameters passed to `update()`:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').update({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  data: {
    name: "Biscotte Restaurant (closed)",
  },
  status: 'published',
})
```

</Request>

<Response>

```js {4}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant (closed)",
  publishedAt: "2024-03-14T17:29:03.399Z",
  locale: "en" // default locale
  // …
}
```

</Response>
</ApiCall>

## Filter by published status with `hasPublishedVersion` {#haspublishedversion}

The `hasPublishedVersion` parameter filters documents based on whether they have a published version. Combine it with `status: 'draft'` to distinguish documents that have never been published from drafts of already-published documents.

`hasPublishedVersion` accepts a boolean value (`true` or `false`) or the string equivalents (`'true'` or `'false'`). Passing any other value returns a validation error.

| Value | Description |
|-------|-------------|
| `true` | Returns only documents that have at least 1 published version. |
| `false` | Returns only documents that have never been published. |

### Find never-published documents

Pass `hasPublishedVersion: false` with `status: 'draft'` to retrieve only documents that have never been published:

<ApiCall noSideBySide>
<Request title="Example request">
```js
const neverPublished = await strapi.documents("api::article.article").findMany({
  status: 'draft',
  // highlight-next-line
  hasPublishedVersion: false,
});
```

</Request>

<Response title="Example response">
```js
[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    title: "Untitled draft",
    publishedAt: null,
    locale: "en",
    // …
  }
  // …
]
```

</Response>
</ApiCall>

### Find drafts of published documents

Pass `hasPublishedVersion: true` with `status: 'draft'` to retrieve draft versions of already-published documents:

<ApiCall noSideBySide>
<Request title="Example request">
```js
const draftOfPublished = await strapi.documents("api::article.article").findFirst({
  status: 'draft',
  // highlight-next-line
  hasPublishedVersion: true,
});
```

</Request>

<Response title="Example response">
```js
{
  documentId: "x9y8z7w6v5u4t3s2r1q0pon",
  title: "Published article (draft version)",
  publishedAt: null,
  locale: "en",
  // …
}
```

</Response>
</ApiCall>

### Count never-published documents

Combine `hasPublishedVersion` with `count()` to count only documents that have never been published:
```js
const neverPublishedCount = await strapi.documents("api::article.article").count({
  status: 'draft',
  hasPublishedVersion: false,
});
```

### Combine with `locale`

`hasPublishedVersion` works with the `locale` parameter:
```js
const neverPublishedInFrench = await strapi.documents("api::article.article").findMany({
  status: 'draft',
  hasPublishedVersion: false,
  locale: 'fr',
});
```

:::tip
`hasPublishedVersion` can also be combined with `filters` for more targeted queries:
```js
const results = await strapi.documents("api::article.article").findMany({
  status: 'draft',
  hasPublishedVersion: false,
  filters: { title: { $contains: 'draft' } },
});
```
:::

:::note
Passing `status: 'published'` with `hasPublishedVersion: false` returns an empty result set, since published documents by definition have a published version.
:::