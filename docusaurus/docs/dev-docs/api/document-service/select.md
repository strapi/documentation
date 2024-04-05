---
title: Using Select with the Document Service API
description: Use Strapi's Document Service API to select the fields to return with your queries.
displayed_sidebar: devDocsSidebar
---

# Document Service API: Selecting fields

By default the [Document Service API](/dev-docs/api/document-service) returns all the fields of a document but does not populate any fields. This page describes how to use the `select` parameter to return only specific fields with the query results.

:::tip
You can also use the `populate` parameter to populate relations, media fields, components, or dynamic zones (see the [`populate` parameter](/dev-docs/api/document-service/populate) documentation).
:::

## Select fields with `findOne()` queries

To select fields to return while [finding a specific document](/dev-docs/api/document-service#findone) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").findOne({
  fields: ["title", "slug"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  title: "Test Article",
  slug: "test-article"
}
```

</Response>
</ApiCall>

## Select fields with `findFirst()` queries

To select fields to return while [finding the first document](/dev-docs/api/document-service#findfirst) matching the parameters with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").findFirst({
  fields: ["title", "slug"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  title: "Test Article",
  slug: "test-article" …
}
```

</Response>
</ApiCall>

## Select fields with `findMany()` queries

To select fields to return while [finding documents](/dev-docs/api/document-service#findmany) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::article.article").findMany({
  fields: ["title", "slug"],
});
```

</Request>

<Response title="Example response">

```js
[
  {
    documentId: "cjld2cjxh0000qzrmn831i7rn",
    title: "Test Article",
    slug: "test-article"
  }
  // ...
]
```

</Response>
</ApiCall>

## Select fields with `create()` queries

To select fields to return while [creating documents](/dev-docs/api/document-service#create) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").create({
  data: {
    title: "Test Article",
    slug: "test-article",
    body: "Test 1",
    headerImage: 2,
  },
  fields: ["title", "slug"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  title: "Test Article",
  slug: "test-article"
}
```

</Response>
</ApiCall>

## Select fields with `update()` queries

To select fields to return while [updating documents](/dev-docs/api/document-service#update) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").update({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  data: {
    title: "Test Article Updated",
  },
  fields: ["title"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  title: "Test Article Updated"
}
```

</Response>
</ApiCall>

## Select fields with `delete()` queries

To select fields to return while [deleting documents](/dev-docs/api/document-service#delete) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").delete({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["title"],
});
```

</Request>

<Response title="Example response">

```json
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  // All of the deleted document's versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `publish()` queries

To select fields to return while [publishing documents](/dev-docs/api/document-service#publish) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").publish({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["title"],
});
```

</Request>

<Response title="Example response">

```json
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  // All of the published locale versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `unpublish()` queries

To select fields to return while [unpublishing documents](/dev-docs/api/document-service#unpublish) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").unpublish({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["title"],
});
```

</Request>

<Response title="Example response">

```json
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  // All of the unpublished locale versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `discardDraft()` queries

To select fields to return while [discarding draft versions of documents](/dev-docs/api/document-service#discarddraft) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::article.article").discardDraft({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["title"],
});
```

</Request>

<Response title="Example response">

```json
{
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  // All of the discarded draft versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}
```

</Response>
</ApiCall>
