---
title: Using the locale parameter with the Document Service API
description: Use Strapi's Document Service API to work with locale versions with your queries.
displayed_sidebar: cmsSidebar
sidebar_label: Locale
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

import Endpoint from '@site/src/components/ApiReference/Endpoint';

# Document Service API: Using the `locale` parameter

By default the [Document Service API](/cms/api/document-service) returns the default locale version of documents (which is 'en', i.e. the English version, unless another default locale has been set for the application, see [Internationalization (i18n) feature](/cms/features/internationalization)). This page describes how to use the `locale` parameter to get or manipulate data only for specific locales.

## Get a locale version with `findOne()` {#find-one}

If a `locale` is passed, the [`findOne()` method](/cms/api/document-service#findone) of the Document Service API returns the version of the document for this locale:

<Endpoint
  id="find-one"
  method="GET"
  path="strapi.documents().findOne()"
  title="Get a locale version with findOne()"
  description="Pass a locale to findOne() to get the version of the document for that locale."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'fr',
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  publishedAt: null, // draft version (default)
  locale: "fr", // as asked from the parameters
  // …
}`
    }
  ]}
/>

If no `status` parameter is passed, the `draft` version is returned by default.

## Get a locale version with `findFirst()` {#find-first}

To return a specific locale while [finding the first document](/cms/api/document-service#findfirst) matching the parameters with the Document Service API:

<Endpoint
  id="find-first"
  method="GET"
  path="strapi.documents().findFirst()"
  title="Get a locale version with findFirst()"
  description="Pass a locale to findFirst() to return documents matching that locale."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const document = await strapi.documents('api::article.article').findFirst({
  locale: 'fr',
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article"
  // …
}`
    }
  ]}
/>

If no `status` parameter is passed, the `draft` version is returned by default.

## Get locale versions with `findMany()` {#find-many}

When a `locale` is passed to the [`findMany()` method](/cms/api/document-service#findmany) of the Document Service API, the response will return all documents that have this locale available.

If no `status` parameter is passed, the `draft` versions are returned by default.

<Endpoint
  id="find-many"
  method="GET"
  path="strapi.documents().findMany()"
  title="Get locale versions with findMany()"
  description="Pass a locale to findMany() to return all documents that have this locale available."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `// Defaults to status: draft
await strapi.documents('api::restaurant.restaurant').findMany({ locale: 'fr' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `[
  {
    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
    name: 'Restaurant Biscotte',
    publishedAt: null,
    locale: 'fr',
    // …
  },
  // …
]`
    }
  ]}
/>

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

`findMany({ locale: 'fr' })` would only return the draft version of the documents that have a `'fr'` locale version, that is documents A, C, and D.

</details>

## `create()` a document for a locale {#create}

To create a document for specific locale, pass the `locale` as a parameter to the [`create` method](/cms/api/document-service#create) of the Document Service API:

<Endpoint
  id="create"
  method="POST"
  path="strapi.documents().create()"
  title="Create a document for a locale"
  description="Pass a locale to create() to create the document for that specific locale."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').create({
  locale: 'es' // if not passed, the draft is created for the default locale
  data: { name: 'Restaurante B' }
})`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  documentId: "pw2s0nh5ub1zmnk0d80vgqrh",
  name: "Restaurante B",
  publishedAt: null,
  locale: "es"
  // …
}`
    }
  ]}
/>

## `update()` a locale version {#update}

To update only a specific locale version of a document, pass the `locale` parameter to the [`update()` method](/cms/api/document-service#update) of the Document Service API:

<Endpoint
  id="update"
  method="PUT"
  path="strapi.documents().update()"
  title="Update a locale version"
  description="Pass a locale to update() to update only that specific locale version of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').update({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'es',
  data: { name: 'Nuevo nombre del restaurante' },
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Nuevo nombre del restaurante",
  locale: "es",
  publishedAt: null,
  // …
}`
    }
  ]}
/>

## `delete()` locale versions {#delete}

Use the `locale` parameter with the [`delete()` method](/cms/api/document-service#delete) of the Document Service API to delete only some locales. Unless a specific `status` parameter is passed, this deletes both the draft and published versions.

### Delete a locale version

To delete a specific locale version of a document:

<Endpoint
  id="delete-locale"
  method="DELETE"
  path="strapi.documents().delete()"
  title="Delete a locale version"
  description="Pass a locale to delete() to delete only that specific locale version of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', // documentId,
  locale: 'es',
});`
    }
  ]}
/>

### Delete all locale versions

The `*` wildcard is supported by the `locale` parameter and can be used to delete all locale versions of a document:

<Endpoint
  id="delete-all-locales"
  method="DELETE"
  path="strapi.documents().delete()"
  title="Delete all locale versions"
  description="Use the * wildcard with the locale parameter to delete all locale versions of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', // documentId,
  locale: '*',
}); // for all existing locales`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
  // All of the deleted locale versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}`
    }
  ]}
/>

## `publish()` locale versions {#publish}

To publish only specific locale versions of a document with the [`publish()` method](/cms/api/document-service#publish) of the Document Service API, pass `locale` as a parameter:

### Publish a locale version

To publish a specific locale version of a document:

<Endpoint
  id="publish-locale"
  method="POST"
  path="strapi.documents().publish()"
  title="Publish a locale version"
  description="Pass a locale to publish() to publish only that specific locale version of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'fr',
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  versions: [
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Restaurant Biscotte',
      publishedAt: '2024-03-14T18:38:05.674Z',
      locale: 'fr',
      // …
    },
  ]
}`
    }
  ]}
/>

### Publish all locale versions

The `*` wildcard is supported by the `locale` parameter to publish all locale versions of a document:

<Endpoint
  id="publish-all-locales"
  method="POST"
  path="strapi.documents().publish()"
  title="Publish all locale versions"
  description="Use the * wildcard with the locale parameter to publish all locale versions of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi
  .documents('api::restaurant.restaurant')
  .publish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
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
}`
    }
  ]}
/>

## `unpublish()` locale versions {#unpublish}

To publish only specific locale versions of a document with the [`unpublish()` method](/cms/api/document-service#unpublish) of the Document Service API, pass `locale` as a parameter:

### Unpublish a locale version

To unpublish a specific locale version of a document, pass the `locale` as a parameter to `unpublish()`:

<Endpoint
  id="unpublish-locale"
  method="DELETE"
  path="strapi.documents().unpublish()"
  title="Unpublish a locale version"
  description="Pass a locale to unpublish() to unpublish only that specific locale version of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi
  .documents('api::restaurant.restaurant')
  .unpublish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: 'fr' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  versions: 1
}`
    }
  ]}
/>

### Unpublish all locale versions

The `*` wildcard is supported by the `locale` parameter, to unpublish all locale versions of a document:

<Endpoint
  id="unpublish-all-locales"
  method="DELETE"
  path="strapi.documents().unpublish()"
  title="Unpublish all locale versions"
  description="Use the * wildcard with the locale parameter to unpublish all locale versions of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi
  .documents('api::restaurant.restaurant')
  .unpublish({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  versions: 3
}`
    }
  ]}
/>

<Endpoint
  id="unpublish-with-fields"
  method="DELETE"
  path="strapi.documents().unpublish()"
  title="Unpublish with fields selection"
  description="Unpublish a document while selecting specific fields to return."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const document = await strapi.documents('api::article.article').unpublish({
  documentId: 'cjld2cjxh0000qzrmn831i7rn',
  fields: ['title'],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  // All of the unpublished locale versions are returned
  "versions": [
    {
      "title": "Test Article"
    }
  ]
}`
    }
  ]}
/>

## `discardDraft()` for locale versions {#discard-draft}

To discard draft data only for some locales versions of a document with the [`discardDraft()` method](/cms/api/document-service#discarddraft) of the Document Service API, pass `locale` as a parameter:

### Discard draft for a locale version

To discard draft data for a specific locale version of a document and override it with data from the published version for this locale, pass the `locale` as a parameter to `discardDraft()`:

<Endpoint
  id="discard-draft-locale"
  method="DELETE"
  path="strapi.documents().discardDraft()"
  title="Discard draft for a locale version"
  description="Pass a locale to discardDraft() to discard draft data for that specific locale version."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi
  .documents('api::restaurant.restaurant')
  .discardDraft({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: 'fr' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
  versions: [
    {
      documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
      name: 'Restaurant Biscotte',
      publishedAt: null,
      locale: 'fr',
      // …
    },
  ]
}`
    }
  ]}
/>

### Discard drafts for all locale versions

The `*` wildcard is supported by the `locale` parameter, to discard draft data for all locale versions of a document and replace them with the data from the published versions:

<Endpoint
  id="discard-draft-all-locales"
  method="DELETE"
  path="strapi.documents().discardDraft()"
  title="Discard drafts for all locale versions"
  description="Use the * wildcard with the locale parameter to discard drafts for all locale versions of a document."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `await strapi
  .documents('api::restaurant.restaurant')
  .discardDraft({ documentId: 'a1b2c3d4e5f6g7h8i9j0klm', locale: '*' });`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: `{
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
  ]
}`
    }
  ]}
/>

## `count()` documents for a locale {#count}

To count documents for a specific locale, pass the `locale` along with other parameters to the [`count()` method](/cms/api/document-service#count) of the Document Service API.

If no `status` parameter is passed, draft documents are counted (which is the total of available documents for the locale since even published documents are counted as having a draft version):

```js
// Count number of published documents in French
strapi.documents('api::restaurant.restaurant').count({ locale: 'fr' });
```
