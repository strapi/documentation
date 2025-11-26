---
title: Document Service API
description: The Document Service API is the recommended way to interact with your content from the back-end server or from plugins.
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- Documents
- documentId
- Document Service API
toc_max_heading_level: 4
---

# Document Service API

The Document Service API is built on top of the **Query Engine API** <Annotation>2 different back-end APIs allow you to interact with your content: <ul><li>The [Query Engine API](/cms/api/query-engine) is the lower-level layer that offers unrestricted access to the database, but is not aware of complex Strapi content structures such as components and dynamic zones.</li><li>The Document Service API is built on top of the Query Engine and is the recommended way to interact with your content while you are customizing the back end server or developing plugins.</li></ul>More details can be found in the [Content API](/cms/api/content-api) and [backend customization](/cms/backend-customization) introductions.</Annotation> and is used to perform CRUD ([create](#create), [retrieve](#findone), [update](#update), and [delete](#delete)) operations on **documents** <DocumentDefinition />.

The Document Service API also supports [counting](#count) documents and, if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type, performing Strapi-specific operations such as [publishing](#publish), [unpublishing](#unpublish), and [discarding drafts](#discarddraft).

In Strapi 5, documents are uniquely identified by their `documentId` at the API level.

<ExpandableContent maxHeight="80px">

**`documentId` explained: Replacing `id` from Strapi v4**

In previous Strapi versions, the concept of `id` (used both in the Content API and as the database row identifier) was not always stable: a single entry could have multiple versions or localizations, and its numeric identifier `id` could change in cases such as duplication or import/export operations.

To address this limitation, Strapi 5 introduced `documentId`, a 24-character alphanumeric string, as a unique and persistent identifier for a content entry, independent of its physical records.

This new identifier is used internally in Strapi 5 to manage relationships, publishing, localization, and version history, as all possible variations of a content entry are now grouped under a single [document](/cms/api/document) concept.

As a result, starting with Strapi 5, many APIs and services rely on `documentId` instead of `id` to ensure consistency across operations. Some APIs may still return both `documentId` and `id` to ease the transition, but using `documentId` for content queries is strongly recommended, as `documentId` might be the only identifier used in future Strapi versions.

For more details on the transition from `id` to `documentId`, refer to the [breaking change page](/cms/migration/v4-to-v5/breaking-changes/use-document-id) and the [migration guide from Entity Service to Document Service API](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service).

</ExpandableContent>

:::strapi Entity Service API is deprecated in Strapi 5
The Document Service API replaces the Entity Service API used in Strapi v4 (<ExternalLink to="https://docs-v4.strapi.io/dev-docs/api/entity-service" text="see Strapi v4 documentation"/>).

Additional information on how to migrate from the Entity Service API to the Document Service API can be found in the [migration reference](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service).
:::

:::note
Relations can also be connected, disconnected, and set through the Document Service API, just like with the REST API (see the [REST API relations documentation](/cms/api/rest/relations) for examples).
:::

## Document objects

Document methods return a document object, which represents one locale (i.e. version) of a content entry grouped under a stable `documentId`. Returned objects typically include:

- `documentId`: Persistent identifier for the entry across locales and draft/published versions.
- `id`: Database identifier for the specific locale/version record.
- Metadata: `locale`, `publishedAt`, `createdAt`, `updatedAt`, and `createdBy`/`updatedBy` when available.
- Model fields: All fields defined in the content-type schema. Relations, components, and dynamic zones are not populated unless you opt in with `populate` (see [Populating fields](/cms/api/document-service/populate)) or limit fields with `fields` (see [Selecting fields](/cms/api/document-service/fields)).

## Method overview

Each section below documents the parameters and examples for a specific method:

| Method | Purpose |
| --- | --- |
| [`findOne()`](#findone) | Fetch a document by `documentId`, optionally scoping to a locale or status. |
| [`findFirst()`](#findfirst) | Return the first document that matches filters. |
| [`findMany()`](#findmany) | List documents with filters, sorting, and pagination. |
| [`create()`](#create) | Create a document, optionally targeting a locale. |
| [`update()`](#update) | Update a document by `documentId`. |
| [`delete()`](#delete) | Delete a document or a specific locale version. |
| [`publish()`](#publish) | Publish the draft version of a document. |
| [`unpublish()`](#unpublish) | Move a published document back to draft. |
| [`discardDraft()`](#discarddraft) | Drop draft data and keep only the published version. |
| [`count()`](#count) | Count how many documents match the parameters. |

### `findOne()`

Find a document matching the passed `documentId` and parameters.

Syntax: `findOne(parameters: Params) => Document`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId` | Document id | | `ID` |
| [`locale`](/cms/api/document-service/locale#find-one)|  Locale of the document to find. | Default locale | String or `undefined` |
| [`status`](/cms/api/document-service/status#find-one) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`fields`](/cms/api/document-service/fields#findone)   | [Select fields](/cms/api/document-service/fields#findone) to return   | All fields<br/>(except those not populated by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

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

The `findOne()` method returns the matching document if found, otherwise returns `null`.

### `findFirst()`

Find the first document matching the parameters.

Syntax:  `findFirst(parameters: Params) => Document`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/cms/api/document-service/locale#find-first) |  Locale of the documents to find. | Default locale | String or `undefined` |
| [`status`](/cms/api/document-service/status#find-first) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#findfirst)   | [Select fields](/cms/api/document-service/fields#findfirst) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Examples

<br />

##### Generic example

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

##### Find the first document matching parameters

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

### `findMany()`

Find documents matching the parameters.

Syntax: `findMany(parameters: Params) => Document[]`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/cms/api/document-service/locale#find-many) |  Locale of the documents to find. | Default locale | String or `undefined` |
| [`status`](/cms/api/document-service/status#find-many) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#findmany)   | [Select fields](/cms/api/document-service/fields#findmany) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |
| [`pagination`](/cms/api/document-service/sort-pagination#pagination) | [Paginate](/cms/api/document-service/sort-pagination#pagination) results |
| [`sort`](/cms/api/document-service/sort-pagination#sort) | [Sort](/cms/api/document-service/sort-pagination#sort) results | | | 

#### Examples

<br />

##### Generic example

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

##### Find documents matching parameters

Available filters are detailed in the [filters](/cms/api/document-service/filters) page of the Document Service API reference.

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

### `create()`

Creates a drafted document and returns it.

Pass fields for the content to create in a `data` object.

Syntax: `create(parameters: Params) => Document`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/cms/api/document-service/locale#create) | Locale of the documents to create. | Default locale | String or `undefined` |
| [`fields`](/cms/api/document-service/fields#create)   | [Select fields](/cms/api/document-service/fields#create) to return   | All fields<br/>(except those not populated by default)  | Object |
| [`status`](/cms/api/document-service/status#create) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Can be set to `'published'` to automatically publish the draft version of a document while creating it  | -| `'published'` |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

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
If the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled on the content-type, you can automatically publish a document while creating it (see [`status` documentation](/cms/api/document-service/status#create)).
:::

### `update()`

Updates document versions and returns them.

Syntax: `update(parameters: Params) => Promise<Document>`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId` | Document id | | `ID` |
| [`locale`](/cms/api/document-service/locale#update) | Locale of the document to update. | Default locale | String or `null` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#update)   | [Select fields](/cms/api/document-service/fields#update) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`status`](/cms/api/document-service/status#update) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Can be set to `'published'` to automatically publish the draft version of a document while updating it  | - | `'published'` |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

:::tip
Published versions are read-only, so you can not technically update the published version of a document.
To update a document and publish the new version right away, you can:

- update its draft version with `update()`, then [publish it](#publish) with `publish()`,
- or directly add `status: 'published'` along with the other parameters passed to `update()` (see [`status` documentation](/cms/api/document-service/status#update)).
:::

:::caution
It's not recommended to update repeatable components with the Document Service API (see the related [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/do-not-update-repeatable-components-with-document-service-api.md) for more details).
:::

#### Example

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

### `delete()`

Deletes one document, or a specific locale of it.

Syntax: `delete(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/cms/api/document-service/locale#delete) | Locale version of the document to delete. | `null`<br/>(deletes only the default locale) | String, `'*'`, or `null` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#delete)   | [Select fields](/cms/api/document-service/fields#delete) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

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

### `publish()`

Publishes one or multiple locales of a document.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `publish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/cms/api/document-service/locale#publish) | Locale of the documents to publish. | Only the default locale | String, `'*'`, or `null` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#publish)   | [Select fields](/cms/api/document-service/fields#publish) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

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

### `unpublish()`

Unpublishes one or all locale versions of a document, and returns how many locale versions were unpublished.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `unpublish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/cms/api/document-service/locale#unpublish) | Locale of the documents to unpublish. | Only the default locale | String, `'*'`, or `null` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#unpublish)   | [Select fields](/cms/api/document-service/fields#unpublish) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

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

### `discardDraft()`

Discards draft data and overrides it with the published version.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `discardDraft(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `documentId`| Document id | | `ID`|
| [`locale`](/cms/api/document-service/locale#discard-draft) | Locale of the documents to discard. | Only the default locale. | String, `'*'`, or `null` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |
| [`fields`](/cms/api/document-service/fields#discarddraft)   | [Select fields](/cms/api/document-service/fields#discarddraft) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/cms/api/document-service/populate) | [Populate](/cms/api/document-service/populate) results with additional fields. | `null` | Object |

#### Example

If no `locale` parameter is passed, `discardDraft()` discards draft data and overrides it with the published version only for the default locale:

<ApiCall>

<Request title="Discard draft for the default locale of a document">

```js
strapi.documents.discardDraft({
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

### `count()`

Count the number of documents that match the provided parameters.

Syntax: `count(parameters: Params) => number`

#### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| [`locale`](/cms/api/document-service/locale#count) | Locale of the documents to count | Default locale | String or `null` |
| [`status`](/cms/api/document-service/status#count) | _If [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type_:<br/>Publication status, can be: <ul><li>`'published'` to find only published documents </li><li>`'draft'` to find draft documents (will return all documents)</li></ul> | `'draft'` | `'published'` or `'draft'` |
| [`filters`](/cms/api/document-service/filters) | [Filters](/cms/api/document-service/filters) to use | `null` | Object |

:::note
Since published documents necessarily also have a draft counterpart, a published document is still counted as having a draft version.

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore. There currently is no way to prevent already published documents from being counted.
:::

#### Examples

<br />

##### Generic example

If no parameter is passed, the `count()` method the total number of documents for the default locale:
<ApiCall>

<Request>

```js
await strapi.documents('api::restaurant.restaurant').count()
```

</Request>

</ApiCall>

##### Count published documents

To count only published documents, pass `status: 'published'` along with other parameters to the `count()` method.

If no `locale` parameter is passed, documents are counted for the default locale.

<Request>

```js
strapi.documents('api::restaurant.restaurant').count({ status: 'published' })
```

</Request>

##### Count documents with filters

Any [filters](/cms/api/document-service/filters) can be passed to the `count()` method.

If no `locale` and no `status` parameter is passed, draft documents (which is the total of available documents for the locale since even published documents are counted as having a draft version) are counted only for the default locale:

```js
/**
 * Count number of draft documents (default if status is omitted) 
 * in English (default locale) 
 * whose name starts with 'Pizzeria'
 */
strapi.documents('api::restaurant.restaurant').count({ filters: { name: { $startsWith: "Pizzeria" }}})`
```
