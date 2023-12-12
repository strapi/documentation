---
title: Document Service API
description: The Document Service API is the recommended way to interact with your content from the back-end server or from plugins.
displayed_sidebar: devDocsSidebar
---

# Document Service API

The Document Service API is built on top of the **Query Engine API** <Annotation>2 different back-end APIs allow you to interact with your content: <ul><li>The [Query Engine API](/dev-docs/api/query-engine) is the lower-level layer that offers unrestricted access to the database, but is not aware of complex Strapi data structures such as components and dynamic zones.</li><li>The Document Service API is built on top of the Query Engine and is the recommended way to interact with your content while you are customizing the back end server or developing plugins.</li></ul>More details can be found in the [Content API](/dev-docs/api/content-apis) and [backend customization](/dev-docs/backend-customization) introductions.</Annotation> and used to perform CRUD ([create](#create), [retrieve](#findone), [update](#update), and [delete](#delete)) operations on **documents** <DocumentDefinition />.

With the Document Service API, you can also [count](#count) documents and perform Strapi-specific features such as [publishing](#publish) and [unpublishing](#unpublish) documents and [discarding drafts](#discarddraft).

## `findOne()`

Find a document matching the id and parameters.

Syntax: `findOne(id: ID, parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale`|  Locale of the documents to create. | Default locale | String or `undefined` |
| `status` | Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'published'` | `'published'` or `'draft'` |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-findone-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-findone-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Find document by id">

```js
await strapi.documents('api::.articles.articles').findOne(
  documentId,
)
```

</Request>

<Response>

```js
{
  id: documentId,
  locale: 'en', // locale=en (default locale) is the default 
  status: 'draft', 
  // …
}

```

</Response>

</ApiCall>

#### Find the default locale of a document

If no locale and no published status is specified in the parameters, `findOne()` returns the published variation of the document for the default locale (i.e., English).

```js
// Returns the published variation of the document for the default locale
await documents(uid).findOne(id);

// Returns the same result as the code above
await documents(uid).findOne(id, { locale: "en", status: "published" })
```

#### Find a specific locale of a document

```js
await documents(uid).findOne(id, { locale: 'fr' });
```

## `findFirst()`

Find the first document matching the parameters.

Syntax:  `findFirst(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale`|  Locale of the documents to find. | Default locale | String or `undefined` |
| `status` | Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'published'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-findfirst-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-findfirst-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate)<Annotation>2 different back-end APIs allow you to interact with your content: <ul><li>The [Query Engine API](/dev-docs/api/query-engine) is the lower-level layer that offers unrestricted access to the database, but is not aware of complex Strapi data structures such as components and dynamic zones.</li><li>The Document Service API is built on top of the Query Engine and is the recommended way to interact with your content while you are customizing the back end server or developing plugins.</li></ul>More details can be found in the [Content API](/dev-docs/api/content-apis) and [backend customization](/dev-docs/backend-customization) introductions.</Annotation> | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Find the first document that matches the defined filters">

```js
await strapi.documents('api::.articles.articles').findFirst(
  documentId,
  {
    filters: {  
      title: "V5 is coming"
    }
  }
)
```

</Request>

<Response>

```js
{
  id: documentId,
  locale: 'en', // locale=en (default locale) is the default 
  status: 'draft', 
  title: "V5 is coming"
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
| `locale`|  Locale of the documents to find. | Default locale | String or `undefined` |
| `status` | Publication status, can be: <ul><li>`'published'` to find only published documents</li><li>`'draft'` to find only draft documents</li></ul> | `'published'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-findmany-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-findmany-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |
| [`pagination`](/dev-docs/api/document-service/sort-pagination#pagination) | [Paginate](/dev-docs/api/document-service/sort-pagination#pagination) results |
| [`sort`](/dev-docs/api/document-service/sort-pagination#sort) | [Sort](/dev-docs/api/document-service/sort-pagination#sort) results | | | 
| `_q` | | |

### Examples

#### Generic example

<ApiCall>

<Request title="Find documents that match a specific filter">

```js
await strapi.documents('api::.articles.articles').findMany(
  documentId,
  {
    filters: {  
      title: "V5 is coming"
    }
  }
)
```

</Request>

<Response>

```js
[
  {
    id: documentId,
    locale: 'en', // locale=en (default locale) is the default 
    status: 'draft', 
    title: "V5 is coming"
    // …
  }, 
  // …
]
```

</Response>

</ApiCall>

#### Find `fr` version of all documents that have a `fr` locale available

```js
await documents(uid).findMany({ locale: 'fr' }); // Defaults to status: published
await documents(uid).findMany(); // Defaults to default locale  and published status
```

<details>
<summary>Result:</summary>

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

`findMany({ locale: 'fr' })` would only return the documents that have the `‘fr’` version, that is documents A, C, and D.

</details>

<!-- TODO: To be completed post v5 GA -->
<!-- #### Find ‘fr’ version of all documents with fallback on default (en)

```js
await documents(uid).findMany({ locale: 'fr', fallbackLocales: ['en'] } );
``` -->

<!-- TODO: To be completed post v5 GA -->
<!-- #### Find sibling locales for one or many documents

```js
await documents(uid).findMany({ locale: 'fr', populateLocales: ['en', 'it'] } );
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


await documents(uid).findMany({ locale: ['en', 'it'] } );
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

Syntax: `create(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of the documents to create. | Default locale | String or `undefined` |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-create-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-create-queries) to return   | All fields<br/>(except those not populated by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Update spanish draft locale of a document">

```js
strapi.documents.create(
  documentId, 
  { 
    locale: 'es' // defaults to default locale
    data: { title: "Título" }
  } 
)
```

</Request>

<Response>

```js
{ 
  id: documentId,
  locale: 'es',
  status: 'draft',
  data: { title: "Titulo" }
} 
```

</Response>

</ApiCall>

#### Create document with specific locale

```js
await documents(uid).create({locale: 'fr', data: {}})
```

#### Create document with default locale

```js
await documents(uid).create({data: {}}
```

#### Create document draft

```js
await documents(uid).create({data: {}}
```

#### Auto publish document

```js
// Creates the document in draft, and publishes it afterwards
await documents(uid).create({autoPublish: true, data: {}}
```

## `update()`

Updates document versions and returns them

Syntax: `update(parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of array of locales of the documents to update.<br/><br/>Defaults to `null`, which updates all of the document locales at once. | Default locale | String, array of strings, or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-update-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-update-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Update spanish draft locale of a document">

```js
strapi.documents.update(
  documentId, 
  { 
    locale: 'es'
    data: { title: "Título" }
  } 
)
```

</Request>

<Response>

```js
{ 
  documents: [
    {
      id: documentId,
      locale: 'es',
      status: 'draft',
      // …
    }
  ] 
} 
```

</Response>

</ApiCall>

#### Update many document locales

```js
// Updates the default locale by default
await documents(uid).update(docId, {locale: ['es', 'en'], data: {name: "updatedName" }}
```

#### Update a given document locale

```js
await documents(uid).update(docId, {locale: 'en', data: {name: "updatedName" }}

// Updates default locale
await documents(uid).update(docId, {data: {name: "updatedName" }}
```

#### Auto publish document when updating

```js
// Creates the document in draft, and publishes it afterwards
await documents(uid).update(documentId, {autoPublish: true, data: {}}

```

## `delete()`

Deletes one document, or a specific locale of it.

Syntax:

```js
delete(id: ID, parameters: Params) => { 
  versions: Document[], 
  errors: Errors[]  // Errors occurred when deleting documents
}
```

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of array of locales of the documents to update.<br/><br/>Defaults to `null`, which deletes all of the document locales at once. | `null`<br/>(all locales) | String or `null` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-delete-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-delete-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Delete spanish locale of a document">

```js
strapi.documents.delete(documentId, { locale: 'es'} )
```

</Request>

<Response>

```js
{ 
  versions: [
    { id: documentId, locale: 'es', status: 'draft' }
    { id: documentId, locale: 'es', status: 'published' }
  ] 
} 
```

</Response>

</ApiCall>

#### Delete an entire document

```js
// This would remove the entire document by default
// All its locales and versions
await documents(uid).delete(id, {});
```

#### Delete a single locale

```js
// Removes the english locale (both its draft and published versions)
await documents(uid).delete(id, { locale: 'en' });
```

#### Delete a document with filters

```js
// Removes the english locale (both its draft and published versions)
await documents(uid).delete(id, { filters: { title: 'V5 is coming' } });
```

:::caution
When deleting, if matched entries delete only the draft version , it will also delete the published version.
:::

## `publish()`

Publishes one or multiple locales of a document.

Syntax:

```js
publish(id: ID, parameters: Params) => { 
  id: string, 
  versions: Document[]  // Published versions
}
```

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of the documents to publish.<br/><br/>If omitted, publishes all document locales. | All locales | String |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-publish-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-publish-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Publish english locale of document
">

```js
strapi.documents.publish(
  documentId, 
  // Publish english locale of document
  { locale: 'en' }
);
```

</Request>

<Response>

```js
{
  id: documentId,
  documents: [
    {
      id: documentId,
      locale: 'en',
      // …
    }
  ]
}
```

</Response>

</ApiCall>

#### Publish a document locale

```js
await documents(uid).publish(id, { locale: 'en' });
```

#### Publish all document locales

```js
// Publishes all by default
await documents(uid).publish(id);
```

#### Publish document locales with filters

```js
// Only publish locales which title is "Ready to publish"
await documents(uid).publish(id, filters: {
  title: 'Ready to publish'
});
```

## `unpublish()`

Unpublishes one or multiple locales of a document.

Syntax:

```js
unpublish(id: ID, parameters: Params) => { 
  id: string, 
  versions: Document[]  // Unpublished versions
}
```

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of the documents to unpublish.<br/><br/>If omitted, unpublishes all document locales. | All locales | String |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-unpublish-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-unpublish-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Find document by id">

```js
strapi.documents.unpublish(
  documentId, 
  {
    locale: 'en' // Unpublish english locale of document
  }
);
```

</Request>

<Response>

```js
{
  id: documentId,
  documents: [
    { 
      id: documentId,
      locale: 'en',
      // …
    }
  ]
}
```

</Response>

</ApiCall>

#### Unpublish a document locale

```js
await documents(uid).publish(id, { locale: 'en' });
```

#### Unpublish all document locales

```js
// Unpublishes all by default
await documents(uid).unpublish(id, {});
```

#### Unpublish document locales with filters

```js
// Only Unpublish locales which title is "Ready to unpublish"
await documents(uid).unpublish(id, filters: {
  title: 'Ready to unpublish'
});
```

## `discardDraft()`

Discards draft data and overrides it with the published version.

Syntax:

```js
discardDraft(id: ID, parameters: Params) => { 
  id: string, 
  versions: Document[]  // New drafts
}
```

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of the documents to discard.<br/><br/>If omitted, discards all draft locales. | All locales | String |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |
| [`fields`](/dev-docs/api/document-service/select#selecting-fields-with-discarddraft-queries)   | [Select fields](/dev-docs/api/document-service/select#selecting-fields-with-discarddraft-queries) to return   | All fields<br/>(except those not populate by default)  | Object |
| [`populate`](/dev-docs/api/document-service/populate) | [Populate](/dev-docs/api/document-service/populate) results with additional fields. | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Find document by id">

```js
strapi.documents.discard(
  documentId, 
  {
    locale: 'en' // Discard english locale draft of document
  }
);
```

</Request>

<Response>

```js
{
  id: documentId,
  documents: [
    { 
      id: documentId,
      locale: 'en',
      // …
    }
  ]
}
```

</Response>

</ApiCall>

#### Unpublish a document locale

```js
await documents(uid).publish(id, { locale: 'en' });
```

#### Unpublish all document locales

```js
// Unpublishes all by default
await documents(uid).unpublish(id, {});
```

#### Unpublish document locales with filters

```js
// Only unpublish locales which title is "Ready to unpublish"
await documents(uid).unpublish(id, filters: {
  title: 'Ready to unpublish'
});
```

## `count()`

Count the number of documents that match the provided filters.

Syntax: `count(parameters: Params) => number` 

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale` | Locale of the documents to count, defaults to the default locale of the application. | All locales | String |
| `status` | Publication status, can be: <ul><li>`'published'` to find only published documents </li><li>`'draft'` to find only draft documents</li></ul> | `'published'` | `'published'` or `'draft'` |
| [`filters`](/dev-docs/api/document-service/filters) | [Filters](/dev-docs/api/document-service/filters) to use | `null` | Object |

### Examples

#### Generic example

<ApiCall>

<Request title="Find document by id">

```js
const enArticles = await strapi.documents('api::article.article').count({ locale: 'en' })
// enArticles = 2 
```

</Request>

</ApiCall>

#### count draft documents in a specific locale

```js
// Count number of draft documents in English
strapi.documents(uid).count({ locale: 'en', status: 'draft' })
```

#### Count published documents in a specific locale

```js
// Count number of published documents in French
strapi.documents(uid).count({ locale: 'fr', status: 'published' })
```

#### Count documents with filters

```js
/**
 * Count number of published documents (default if status is omitted) 
 * in English (default locale) 
 * that match a title 
 */
strapi.documents(uid).count({ filters: { title: "V5 is coming" } })`
```
