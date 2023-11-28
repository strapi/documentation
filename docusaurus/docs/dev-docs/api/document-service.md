---
title: Document Service API
# description: todo
displayed_sidebar: devDocsSidebar
---

# Document Service API

The Document Service API is built on top of the [Query Engine API](/dev-docs/api/query-engine) and used to create, retrieve, delete, and update **documents** <Annotation>TODO: define a Document here + link to conceptual page</Annotation>.

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

