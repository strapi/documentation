---
title: Using the locale parameter with the Document Service API
description: Use Strapi's Document Service API to work with locale versions with your queries.
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- create()
- count()
- deleting content
- Document Service API
- discardDraft()
- findOne()
- findMany()
- findFirst()
- locale
- publish()
- update()
- unpublishing content
---

# Document Service API: Using the `locale` parameter

By default the [Document Service API](/dev-docs/api/document-service) returns the default locale version of documents (which is 'en', i.e. the English version, unless another default locale has been set for the application, see [User Guide](/user-docs/settings/internationalization)). This page describes how to use the `locale` parameter to get or manipulate data only for specific locales.

## Get a locale version with `findOne()` {#find-one}

If a `locale` is passed, the [`findOne()` method](/dev-docs/api/document-service#findone) of the Document Service API returns the version of the document for this locale:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'fr',
});
```

</Request>

<Response>

```js {5}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  publishedAt: null, // draft version (default)
  locale: "fr", // as asked from the parameters
  // …
}
```

</Response>

</ApiCall>

If no `status` parameter is passed, the `draft` version is returned by default.

## Get a locale version with `findFirst()` {#find-first}

To return a specific locale while [finding the first document](/dev-docs/api/document-service#findfirst) matching the parameters with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents('api::article.article').findFirst({
  locale: 'fr',
});
```

</Request>

<Response title="Example response">

```json
{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article"
  // …
}
```

</Response>
</ApiCall>

If no `status` parameter is passed, the `draft` version is returned by default.

## Get locale versions with `findMany()` {#find-many}

When a `locale` is passed to the [`findMany()` method](/dev-docs/api/document-service#findmany) of the Document Service API, the response will return all documents that have this locale available.

If no `status` parameter is passed, the `draft` versions are returned by default.

<ApiCall>
<Request>

```js
// Defaults to status: draft
await strapi.documents('api::restaurant.restaurant').findMany({ locale: 'fr' });
```

</Request>

<Response>

```js {6}
[
  {
    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
    name: 'Restaurant Biscotte',
    publishedAt: null,
    locale: 'fr',
    // …
  },
  // …
];
```

</Response>
</ApiCall>

<details>
<summary>Explanation:</summary>

Given the following 4 documents that have various locales:

- Document A:
  - en
  - `fr`
  - it
- Document B:
  - en
  - it
- Document C:
  - `fr`
- Document D:
  - `fr`
  - it

`findMany({ locale: 'fr' })` would only return the draft version of the documents that have a `‘fr’` locale version, that is documents A, C, and D.

</details>

## `create()` a document for a locale {#create}

To create a document for specific locale, pass the `locale` as a parameter to the [`create` method](/dev-docs/api/document-service#create) of the Document Service API:

<ApiCall>

<Request title="Create the Spanish draft locale of a document">

```js
await strapi.documents('api::restaurant.restaurant').create({
  locale: 'es' // if not passed, the draft is created for the default locale
  data: { name: 'Restaurante B' }
})
```

</Request>

<Response>

```js
{
  documentId: "pw2s0nh5ub1zmnk0d80vgqrh",
  name: "Restaurante B",
  publishedAt: null,
  locale: "es"
  // …
}
```

</Response>

</ApiCall>

## `update()` a locale version {#update}

To update only a specific locale version of a document, pass the `locale` parameter to the [`update()` method](/dev-docs/api/document-service#update) of the Document Service API:

<ApiCall>

<Request title="Update the Spanish locale of a document">

```js
await strapi.documents('api::restaurant.restaurant').update({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'es',
  data: { name: 'Nuevo nombre del restaurante' },
});
```

</Request>

<Response>

```js {3}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Nuevo nombre del restaurante",
  locale: "es",
  publishedAt: null,
  // …
}
```

</Response>

</ApiCall>

## `delete()` locale versions {#delete}

Use the `locale` parameter with the [`delete()` method](/dev-docs/api/document-service#delete) of the Document Service API to delete only some locales. Unless a specific `status` parameter is passed, this deletes both the draft and published versions.

### Delete a locale version

To delete a specific locale version of a document:

<Request title="Delete the Spanish locale of a document">

```js
await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', // documentId,
  locale: 'es',
});
```

</Request>

### Delete all locale versions

The `*` wildcard is supported by the `locale` parameter and can be used to delete all locale versions of a document:

<ApiCall>
<Request>

```js
await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', // documentId,
  locale: '*',
}); // for all existing locales
```

</Request>

<Response title="Example response">

```json
{
  "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
  // All of the deleted locale versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}
```

</Response>
</ApiCall>

## `publish()` locale versions {#publish}

To publish only specific locale versions of a document with the [`publish()` method](/dev-docs/api/document-service#publish) of the Document Service API, pass `locale` as a parameter:

### Publish a locale version

To publish a specific locale version of a document:

<ApiCall>

<Request title="Publish the French locale of document">

```js
await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'fr',
});
```

</Request>

<Response>

```js
{
  versions: [
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Restaurant Biscotte',
      publishedAt: '2024-03-14T18:38:05.674Z',
      locale: 'fr',
      // …
    },
  ];
}
```

</Response>

</ApiCall>

### Publish all locale versions

The `*` wildcard is supported by the `locale` parameter to publish all locale versions of a document:

<ApiCall>

<Request title="Publish all locales of a document">

```js
await strapi
  .documents('api::restaurant.restaurant')
  .publish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });
```

</Request>

<Response>

```js
{
  "versions": [
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "publishedAt": "2024-03-14T18:45:21.857Z",
      "locale": "en"
      // …
    },
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "publishedAt": "2024-03-14T18:45:21.857Z",
      "locale": "es"
      // …
    },
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "publishedAt": "2024-03-14T18:45:21.857Z",
      "locale": "fr"
      // …
    }
  ]
}
```

</Response>

</ApiCall>

## `unpublish()` locale versions {#unpublish}

To publish only specific locale versions of a document with the [`unpublish()` method](/dev-docs/api/document-service#unpublish) of the Document Service API, pass `locale` as a parameter:

### Unpublish a locale version

To unpublish a specific locale version of a document, pass the `locale` as a parameter to `unpublish()`:

<ApiCall>

<Request title="Unpublish the French locale version of document">

```js
await strapi
  .documents('api::restaurant.restaurant')
  .unpublish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: 'fr' });
```

</Request>

<Response>

```js
{
  versions: 1;
}
```

</Response>

</ApiCall>

### Unpublish all locale versions

The `*` wildcard is supported by the `locale` parameter, to unpublish all locale versions of a document:

<ApiCall>

<Request title="Unpublish all locale versions of a document">

```js
await strapi
  .documents('api::restaurant.restaurant')
  .unpublish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });
```

</Request>

<Response>

```js
{
  versions: 3;
}
```

</Response>

</ApiCall>

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents('api::article.article').unpublish({
  documentId: 'cjld2cjxh0000qzrmn831i7rn',
  fields: ['title'],
});
```

</Request>

<Response title="Example response">

```json
{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
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

## `discardDraft()` for locale versions {#discard-draft}

To discard draft data only for some locales versions of a document with the [`discardDraft()` method](/dev-docs/api/document-service#discarddraft) of the Document Service API, pass `locale` as a parameter:

### Discard draft for a locale version

To discard draft data for a specific locale version of a document and override it with data from the published version for this locale, pass the `locale` as a parameter to `discardDraft()`:

<ApiCall>

<Request title="Discard draft for the French locale version of document">

```js
await strapi
  .documents('api::restaurant.restaurant')
  .discardDraft({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: 'fr' });
```

</Request>

<Response>

```js
{
  versions: [
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Restaurant Biscotte',
      publishedAt: null,
      locale: 'fr',
      // …
    },
  ];
}
```

</Response>

</ApiCall>

### Discard drafts for all locale versions

The `*` wildcard is supported by the `locale` parameter, to discard draft data for all locale versions of a document and replace them with the data from the published versions:

<ApiCall>

<Request title="Discard drafts for all locale versions of a document">

```js
await strapi
  .documents('api::restaurant.restaurant')
  .discardDraft({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });
```

</Request>

<Response>

```js
{
  versions: [
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Biscotte Restaurant',
      publishedAt: null,
      locale: 'en',
      // …
    },
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Restaurant Biscotte',
      publishedAt: null,
      locale: 'fr',
      // …
    },
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Biscotte Restaurante',
      publishedAt: null,
      locale: 'es',
      // …
    },
  ];
}
```

</Response>

</ApiCall>

## `count()` documents for a locale {#count}

To count documents for a specific locale, pass the `locale` along with other parameters to the [`count()` method](/dev-docs/api/document-service#count) of the Document Service API.

If no `status` parameter is passed, draft documents are counted (which is the total of available documents for the locale since even published documents are counted as having a draft version):

```js
// Count number of published documents in French
strapi.documents('api::restaurant.restaurant').count({ locale: 'fr' });
```
