---
title: Using Draft & Publish with the Document Service API
description: Use Strapi's Document Service API to return draft or published versions of a document and filter by publication history with hasPublishedVersion.
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
- published version
- status

---

# Document Service API: Usage with Draft & Publish

By default the [Document Service API](/cms/api/document-service) returns the draft version of a document when the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled. This page describes how to use the `status` and `hasPublishedVersion` parameters to:

- return the published version of a document,
- filter documents by whether they have ever been published,
- count documents depending on their status,
- directly publish a document while creating it or updating it.

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

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore. To count only documents that have never been published, use the [`hasPublishedVersion`](#has-published-version) parameter.
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

## Filter by publication history with `hasPublishedVersion` <NewBadge /> {#has-published-version}

The `hasPublishedVersion` parameter filters documents by whether a published version exists. Use `hasPublishedVersion` with `status: 'draft'` to distinguish documents that have never been published from drafts of already-published documents.

The parameter accepts a boolean (`true` or `false`) and works with `findOne()`, `findFirst()`, `findMany()`, and `count()`.

### Find never-published documents

Pass `hasPublishedVersion: false` with `status: 'draft'` to return only documents that have never been published:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  status: 'draft',
  hasPublishedVersion: false,
});
```

</Request>

<Response title="Example response">

```js
[
  {
    documentId: "ln1gkzs6ojl9d707xn6v86mw",
    name: "Restaurant B",
    publishedAt: null, // never published
    locale: "en",
    // …
  },
  // … other never-published documents
]
```

</Response>
</ApiCall>

### Find drafts of published documents

Pass `hasPublishedVersion: true` with `status: 'draft'` to return only drafts of documents that have been published at least once:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  status: 'draft',
  hasPublishedVersion: true,
});
```

</Request>

<Response title="Example response">

```js
[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    name: "Biscotte Restaurant",
    publishedAt: null, // draft version is returned, but a published version exists
    locale: "en",
    // …
  },
  // …
]
```

</Response>
</ApiCall>

:::note
Because the draft version is returned, `publishedAt` is `null` even when a published version exists.
:::

### Count never-published documents

Combine `hasPublishedVersion: false` with `count()` to count documents that have never been published:

```js
const neverPublishedCount = await strapi.documents("api::restaurant.restaurant").count({
  status: 'draft',
  hasPublishedVersion: false,
});
```

### Combine with other parameters

`hasPublishedVersion` can be combined with [`locale`](/cms/api/document-service/locale), [`filters`](/cms/api/document-service/filters), and [`populate`](/cms/api/document-service/populate):

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  status: 'draft',
  hasPublishedVersion: false,
  locale: 'en',
  filters: {
    name: { $startsWith: 'Pizzeria' },
  },
});
```

</Request>

<Response title="Example response">

```js
[
  {
    documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
    name: "Pizzeria Napoli",
    publishedAt: null,
    locale: "en",
    // …
  },
]
```

</Response>
</ApiCall>

:::tip
When `hasPublishedVersion` is used with [`populate`](/cms/api/document-service/populate), the filter also applies to populated relations. Each related document is filtered based on whether a published version exists for it.
:::

