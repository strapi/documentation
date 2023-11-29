---
title: Document Service API
# description: todo
displayed_sidebar: devDocsSidebar
---

# Document Service API

The Document Service API is built on top of the **Query Engine API** <Annotation>2 different back-end APIs allow you to interact with your content: <ul><li>The [Query Engine API](/dev-docs/api/query-engine) is the lower-level layer that offers unrestricted access to the database, but is not aware of complex Strapi data structures such as components and dynamic zones.</li><li>The Document Service API is built on top of the Query Engine and is the recommended way to interact with your content while you are customizing the back end server or developing plugins.</li></ul>More details can be found in the [Content API](/dev-docs/api/content-apis) and [backend customization](/dev-docs/backend-customization) introductions.</Annotation> and used to perform CRUD ([create](#create), [retrieve](#findone), [update](#update), and [delete](#delete)) operations on **documents** <Annotation>A Document in Strapi v5 contains all the variations of a unique piece of content.<br /><br />More details can be found in the [Documents](/dev-docs/api/document) introduction.</Annotation>.

With the Document Service API, you can also [count](#count) documents and perform Strapi-specific features such as [publishing](#publish) and [unpublishing](#unpublish) documents and [discarding drafts](#discarddraft).

## `findOne()`

Find a document matching the id and parameters.

Syntax: `findOne(id: ID, parameters: Params) => Document`

### Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `locale`|  Locale of the documents to create. | Default Locale | string or undefined |
| `status` | Publication status, can be: <ul><li>published to find only published documents (default)</li><li>draft to find only draft documents</li></ul> | Published | `'published'` or `'draft'` |
| `fields` | | | |
| `populate` | | |

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

```json
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

```js
// This returns the published default locale
await documents(uid).findOne(id);

// Would be the same as this (en being the default locale)
await documents(uid).findOne(id, { locale: "en", status: "published" })
```

#### Find a specific locale of a document

```js
await documents(uid).findOne(id, { locale: 'fr' });
```

