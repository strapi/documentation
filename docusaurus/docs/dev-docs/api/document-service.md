---
title: Document Service API
description: The Document Service API is the recommended way to interact with your content from the back-end server or from plugins.
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- Documents
- documentId
- Document Service API
---

# Document Service API

The Document Service API is built on top of the **Query Engine API** <Annotation>2 different back-end APIs allow you to interact with your content: <ul><li>The [Query Engine API](/dev-docs/api/query-engine) is the lower-level layer that offers unrestricted access to the database, but is not aware of complex Strapi data structures such as components and dynamic zones.</li><li>The Document Service API is built on top of the Query Engine and is the recommended way to interact with your content while you are customizing the back end server or developing plugins.</li></ul>More details can be found in the [Content API](/dev-docs/api/content-api) and [backend customization](/dev-docs/backend-customization) introductions.</Annotation> and used to perform CRUD ([create](#create), [retrieve](#findone), [update](#update), and [delete](#delete)) operations on **documents** <DocumentDefinition />.

With the Document Service API, you can also [count](#count) documents and, if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled on the content-type, perform Strapi-specific features such as [publishing](#publish)/[unpublishing](#unpublish) documents and [discarding drafts](#discarddraft).

:::strapi Entity Service API is deprecated in Strapi 5
The Document Service API is meant to replace the Entity Service API used in Strapi v4 ([see Strapi v4 documentation](https://docs-v4.strapi.io/dev-docs/api/entity-service)). Additional information on how to transition away from the Entity Service API to the Document Service API can be found in the related [migration reference](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service).
:::

:::note
Relations can also be connected, disconnected, and set through the Document Service API just like with the REST API (see the [REST API relations documentation](/dev-docs/api/rest/relations) for examples).
:::

## `findOne()`

Find a document matching the passed `documentId` and parameters.

Syntax: `findOne(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId` | Document id | | `ID` |
| [`locale`](/dev-docs/api/document-service/locale#find-one)|  Locale of the documents to create. | Default locale | String or `undefined` |
| [`status`](/dev-docs/api/document-service/status#find-one) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`fields`](/dev-docs/api/document-service/fields#findone)   | [Select fields](/dev-docs/api/document-service/fields#findone) to return   | All fields<br/>(except those not populated by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If only a `documentId` is passed without any other parameters, `findOne()` returns the draft version of a document in the default locale:

<ApiCall>

<Request title="Find a document by passing its documentId">

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm'
})
```

</Request>

<Response>

```js {4,5}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  publishedAt: null, // draft version (default)
  locale: "en", // default locale
  // …
}
```

</Response>

</ApiCall>

## `findFirst()`

Find the first document matching the parameters.

Syntax:  `findFirst(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/dev-docs/api/document-service/locale#find-first) |  Locale of the documents to find. | Default locale | String or `undefined` |
| [`status`](/dev-docs/api/document-service/status#find-first) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#findfirst)   | [Select fields](/dev-docs/api/document-service/fields#findfirst) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

By default, `findFirst()` returns the draft version, in the default locale, of the first document for the passed unique identifier (collection type id or single type id):

<ApiCall>

<Request title="Find the first document">

```js
await strapi.documents('api::restaurant.restaurant').findFirst()
```

</Request>

<Response>

```js
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Restaurant Biscotte",
  publishedAt: null,
  locale: "en"
  // …
}
```

</Response>

</ApiCall>

#### Find the first document matching parameters

Pass some parameters to `findFirst()` to return the first document matching them.

If no `locale` or `status` parameters are passed, results return the draft version for the default locale:

<ApiCall>

<Request title="Find the first document that matches the defined filters">

```js
await strapi.documents('api::restaurant.restaurant').findFirst(
  {
    filters: {
      name: {
        $startsWith: "Pizzeria"
      }
    }
  }
)
```

</Request>

<Response>

```js
{
  documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
  name: "Pizzeria Arrivederci",
  publishedAt: null,
  locale: "en"
  // …
}
```

</Response>

</ApiCall>

## `findMany()`

Find documents matching the parameters.

Syntax: `findMany(parameters: Params) => Document[]`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/dev-docs/api/document-service/locale#find-many) |  Locale of the documents to find. | Default locale | String or `undefined` |
| [`status`](/dev-docs/api/document-service/status#find-many) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#findmany)   | [Select fields](/dev-docs/api/document-service/fields#findmany) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |
| [`pagination`](/dev-docs/api/document-service/sort-pagination#pagination) | [Paginate](/dev-docs/api/document-service/sort-pagination#pagination) results |
| [`sort`](/dev-docs/api/document-service/sort-pagination#sort) | [Sort](/dev-docs/api/document-service/sort-pagination#sort) results | | | 

### Examples

#### Generic example

When no parameter is passed, `findMany()` returns the draft version in the default locale for each document:

<ApiCall>

<Request title="Find documents that match a specific filter">

```js
await strapi.documents('api::restaurant.restaurant').findMany()
```

</Request>

<Response>

```js {5,6}
[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    name: "Biscotte Restaurant",
    publishedAt: null, // draft version (default)
    locale: "en" // default locale
    // …
  },
  {
    documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
    name: "Pizzeria Arrivederci",
    publishedAt: null,
    locale: "en"
    // …
  },
]
```

</Response>

</ApiCall>

#### Find documents matching parameters

Available filters are detailed in the [filters](/dev-docs/api/document-service/filters) page of the Document Service API reference.

If no `locale` or `status` parameters are passed, results return the draft version for the default locale:

<ApiCall>

<Request title="Find documents that match a specific filter">

```js
await strapi.documents('api::restaurant.restaurant').findMany(
  {
    filters: {  
      name: {
        $startsWith: 'Pizzeria'
      }
    }
  }
)
```

</Request>

<Response>

```js
[
  {
    documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
    name: "Pizzeria Arrivederci",
    locale: "en", // default locale
    publishedAt: null, // draft version (default)
    // …
  }, 
  // …
]
```

</Response>

</ApiCall>

<!-- TODO: To be completed post v5 GA -->
<!-- #### Find ‘fr’ version of all documents with fallback on default (en)

```js
await documents('api:restaurant.restaurant').findMany({ locale: 'fr', fallbackLocales: ['en'] } );
``` -->

<!-- TODO: To be completed post v5 GA -->
<!-- #### Find sibling locales for one or many documents

```js
await documents('api:restaurant.restaurant').findMany({ locale: 'fr', populateLocales: ['en', 'it'] } );
// Option of response forma for this case 
{
  data: {
		title: { "Wonderful" }
  },
  localizations: [
    { enLocaleData },
    { itLocaleData }
  ]
}


await documents('api:restaurant.restaurant').findMany({ locale: ['en', 'it'] } );
// Option of response format for this case 
{
  data: {
		title: {
			"en": "Wonderful",
			"it": "Bellissimo"
		}
  },
}
```

</Request> -->

## `create()`

Creates a drafted document and returns it.

Pass fields for the content to create in a `data` object.

Syntax: `create(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/dev-docs/api/document-service/locale#create) | Locale of the documents to create. | Default locale | String or `undefined` |
| [`fields`](/dev-docs/api/document-service/fields#create)   | [Select fields](/dev-docs/api/document-service/fields#create) to return   | All fields<br/>(except those not populated by default)  | Object |
| [`status`](/dev-docs/api/document-service/status#create) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Can be set to `'published'` to automatically publish the draft version of a document while creating it  | -| `'published'` |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If no `locale` parameter is passed, `create()` creates the draft version of the document for the default locale:

<ApiCall>

<Request title="Create a new 'Restaurant B' document">

```js
await strapi.documents('api::restaurant.restaurant').create({
  data: {
    name: 'Restaurant B'
  }
})
```

</Request>

<Response>

```js
{
  documentId: "ln1gkzs6ojl9d707xn6v86mw",
  name: "Restaurant B",
  publishedAt: null,
  locale: "en",
}
```

</Response>
</ApiCall>

:::tip
If the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature is enabled on the content-type, you can automatically publish a document while creating it (see [`status` documentation](/dev-docs/api/document-service/status#create)).
:::

## `update()`

Updates document versions and returns them.

Syntax: `update(parameters: Params) => Promise<Document>`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId` | Document id | | `ID` |
| [`locale`](/dev-docs/api/document-service/locale#update) | Locale of the document to update. | Default locale | String or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#update)   | [Select fields](/dev-docs/api/document-service/fields#update) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`status`](/dev-docs/api/document-service/status#update) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Can be set to `'published'` to automatically publish the draft version of a document while updating it  | - | `'published'` |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

:::tip
Published versions are read-only, so you can not technically update the published version of a document.
To update a document and publish the new version right away, you can:

- update its draft version with `update()`, then [publish it](#publish) with `publish()`,
- or directly add `status: 'published'` along with the other parameters passed to `update()` (see [`status` documentation](/dev-docs/api/document-service/status#update)).

:::

### Example

If no `locale` parameter is passed, `update()` updates the document for the default locale:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').update({ 
    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
    data: { name: "New restaurant name" }
})
```

</Request>

<Response>

```js {3}
{
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  name: "New restaurant name",
  locale: "en",
  publishedAt: null, // draft
  // …
}
```

</Response>

</ApiCall>

<!-- ! not working -->
<!-- #### Update many document locales

```js
// Updates the default locale by default
await documents('api:restaurant.restaurant').update(documentId, {locale: ['es', 'en'], data: {name: "updatedName" }}
``` -->

## `delete()`

Deletes one document, or a specific locale of it.

Syntax: `delete(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/dev-docs/api/document-service/locale#delete) | Locale version of the document to delete. | `null`<br/>(deletes only the default locale) | String, `'*'`, or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#delete)   | [Select fields](/dev-docs/api/document-service/fields#delete) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If no `locale` parameter is passed, `delete()` only deletes the default locale version of a document. This deletes both the draft and published versions:

<Request>

```js
await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', // documentId,
})
```

</Request>


<Response>

```js {6}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  entries: [
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "name": "Biscotte Restaurant",
      "publishedAt": "2024-03-14T18:30:48.870Z",
      "locale": "en"
      // …
    }
  ]
}
```

</Response>

<!-- ! not working -->
<!-- #### Delete a document with filters

To delete documents matching parameters, pass these parameters to `delete()`.

If no `locale` parameter is passed, it will delete only the default locale version:

<Request>

```js
await strapi.documents('api::restaurant.restaurant').delete(
  { filters: { name: { $startsWith: 'Pizzeria' }}}
)
```

</Request> -->

## `publish()`

Publishes one or multiple locales of a document.

This method is only available if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled on the content-type.

Syntax: `publish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/dev-docs/api/document-service/locale#publish) | Locale of the documents to publish. | Only the default locale | String, `'*'`, or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#publish)   | [Select fields](/dev-docs/api/document-service/fields#publish) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If no `locale` parameter is passed, `publish()` only publishes the default locale version of the document:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
});
```

</Request>

<Response>

```js {6}
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  entries: [
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "name": "Biscotte Restaurant",
      "publishedAt": "2024-03-14T18:30:48.870Z",
      "locale": "en"
      // …
    }
  ]
}
```

</Response>

</ApiCall>

<!-- ! not working -->
<!-- #### Publish document locales with filters

```js
// Only publish locales with title is "Ready to publish"
await strapi.documents('api::restaurant.restaurant').publish(
  { filters: { title: 'Ready to publish' }}
);
``` -->

## `unpublish()`

Unpublishes one or all locale versions of a document, and returns how many locale versions were unpublished.

This method is only available if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled on the content-type.

Syntax: `unpublish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/dev-docs/api/document-service/locale#unpublish) | Locale of the documents to unpublish. | Only the default locale | String, `'*'`, or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#unpublish)   | [Select fields](/dev-docs/api/document-service/fields#unpublish) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If no `locale` parameter is passed, `unpublish()` only unpublishes the default locale version of the document:

<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').unpublish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm' 
});
```

</Request>

<Response>

```js
{
  documentId: "lviw819d5htwvga8s3kovdij",
  entries: [
    {
      documentId: "lviw819d5htwvga8s3kovdij",
      name: "Biscotte Restaurant",
      publishedAt: null,
      locale: "en"
      // …
    }
  ]
}
```

</Response>

</ApiCall>

## `discardDraft()`

Discards draft data and overrides it with the published version.

This method is only available if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled on the content-type.

Syntax: `discardDraft(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/dev-docs/api/document-service/locale#discard-draft) | Locale of the documents to discard. | Only the default locale. | String, `'*'`, or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/fields#discarddraft)   | [Select fields](/dev-docs/api/document-service/fields#discarddraft) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Example

If no `locale` parameter is passed, `discardDraft()` discards draft data and overrides it with the published version only for the default locale:

<ApiCall>

<Request title="Discard draft for the default locale of a document">

```js
strapi.documents('api::restaurant.restaurant').discardDraft({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm', 
});
```

</Request>

<Response>

```js
{
  documentId: "lviw819d5htwvga8s3kovdij",
  entries: [
    {
      documentId: "lviw819d5htwvga8s3kovdij",
      name: "Biscotte Restaurant",
      publishedAt: null,
      locale: "en"
      // …
    }
  ]
}
```

</Response>

</ApiCall>

## `count()`

Count the number of documents that match the provided parameters.

Syntax: `count(parameters: Params) => number`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/dev-docs/api/document-service/locale#count) | Locale of the documents to count | Default locale | String or `null` |
| [`status`](/dev-docs/api/document-service/status#count) | _If [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents </li><li>`'draft'` to find draft documents (will return all documents)</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |

:::note
Since published documents necessarily also have a draft counterpart, a published document is still counted as having a draft version.

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore. There currently is no way to prevent already published documents from being counted.
:::

### Examples

#### Generic example

If no parameter is passed, the `count()` method the total number of documents for the default locale:
<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').count()
```

</Request>

</ApiCall>

#### Count published documents

To count only published documents, pass `status: 'published'` along with other parameters to the `count()` method.

If no `locale` parameter is passed, documents are counted for the default locale.

<Request>

```js
strapi.documents('api::restaurant.restaurant').count({ status: 'published' })
```

</Request>

#### Count documents with filters

Any [filters](/dev-docs/api/document-service/filters) can be passed to the `count()` method.

If no `locale` and no `status` parameter is passed, draft documents (which is the total of available documents for the locale since even published documents are counted as having a draft version) are counted only for the default locale:

```js
/**
 * Count number of draft documents (default if status is omitted) 
 * in English (default locale) 
 * whose name starts with 'Pizzeria'
 */
strapi.documents('api::restaurant.restaurant').count({ filters: { name: { $startsWith: "Pizzeria" }}})`
```
