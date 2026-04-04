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

## Configuration

The `documents.strictParams` option enables strict validation of parameters passed to Document Service methods such as `findMany` and `findOne`. Configure it in the [API configuration](/cms/configurations/api) file (`./config/api.js` or `./config/api.ts`). See the [API configuration](/cms/configurations/api) table for details on `documents.strictParams`.

## Document objects

Document methods return a document object or a list of document objects, which represent a version of a content entry grouped under a stable `documentId`. Returned objects typically include:

- `documentId`: Persistent identifier for the entry across locales and draft/published versions.
- `id`: Database identifier for the specific locale/version record.
- model fields: All fields defined in the content-type schema. Relations, components, and dynamic zones are not populated unless you opt in with `populate` (see [Populating fields](/cms/api/document-service/populate)) or limit fields with `fields` (see [Selecting fields](/cms/api/document-service/fields)).
- metadata: `publishedAt`, `createdAt`, `updatedAt`, and `createdBy`/`updatedBy` when available.

Optionally, document objects can also include a `status` and `locale` property if [Draft & Publish](/cms/features/draft-and-publish) and [Internationalization](/cms/features/internationalization) are enabled for the content-type.

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

<Endpoint
  id="findone"
  method="GET"
  path="strapi.documents().findOne()"
  title="findOne()"
  description="Find a document matching the passed documentId and parameters. If only a documentId is passed without any other parameters, findOne() returns the draft version of a document in the default locale. Returns the matching document if found, otherwise returns null."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the document to find. Defaults to the default locale. <a href="/cms/api/document-service/locale#find-one">See locale docs</a>.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: publication status. Can be <code>published</code> or <code>draft</code>. Default: <code>draft</code>. <a href="/cms/api/document-service/status#find-one">See status docs</a>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#findone">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm'
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        name: "Biscotte Restaurant",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
  ]}
/>

### `findFirst()`

Find the first document matching the parameters.

Syntax:  `findFirst(parameters: Params) => Document`

<Endpoint
  id="findfirst"
  method="GET"
  path="strapi.documents().findFirst()"
  title="findFirst()"
  description="Find the first document matching the parameters. By default, findFirst() returns the draft version, in the default locale, of the first document for the passed unique identifier (collection type id or single type id)."
  paramTitle="Parameters"
  params={[
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the documents to find. Defaults to the default locale. <a href="/cms/api/document-service/locale#find-first">See locale docs</a>.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: publication status. Can be <code>published</code> or <code>draft</code>. Default: <code>draft</code>. <a href="/cms/api/document-service/status#find-first">See status docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#findfirst">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Generic example',
      code: `await strapi.documents('api::restaurant.restaurant').findFirst()`,
    },
    {
      label: 'With filters',
      code: `await strapi.documents('api::restaurant.restaurant').findFirst(
  {
    filters: {
      name: {
        $startsWith: "Pizzeria"
      }
    }
  }
)`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'Generic',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        name: "Restaurant Biscotte",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
    {
      status: 200,
      statusText: 'With filters',
      body: JSON.stringify({
        documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
        name: "Pizzeria Arrivederci",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
  ]}
>

If no `locale` or `status` parameters are passed, results return the draft version for the default locale.

</Endpoint>

### `findMany()`

Find documents matching the parameters.

Syntax: `findMany(parameters: Params) => Document[]`

<Endpoint
  id="findmany"
  method="GET"
  path="strapi.documents().findMany()"
  title="findMany()"
  description="Find documents matching the parameters. When no parameter is passed, findMany() returns the draft version in the default locale for each document."
  paramTitle="Parameters"
  params={[
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the documents to find. Defaults to the default locale. <a href="/cms/api/document-service/locale#find-many">See locale docs</a>.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: publication status. Can be <code>published</code> or <code>draft</code>. Default: <code>draft</code>. <a href="/cms/api/document-service/status#find-many">See status docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#findmany">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
    { name: 'pagination', type: 'Object', required: false, description: '<a href="/cms/api/document-service/sort-pagination#pagination">Paginate</a> results.' },
    { name: 'sort', type: 'Object', required: false, description: '<a href="/cms/api/document-service/sort-pagination#sort">Sort</a> results.' },
  ]}
  codeTabs={[
    {
      label: 'Generic example',
      code: `await strapi.documents('api::restaurant.restaurant').findMany()`,
    },
    {
      label: 'With filters',
      code: `await strapi.documents('api::restaurant.restaurant').findMany(
  {
    filters: {
      name: {
        $startsWith: 'Pizzeria'
      }
    }
  }
)`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'Generic',
      body: JSON.stringify([
        {
          documentId: "a1b2c3d4e5f6g7h8i9j0klm",
          name: "Biscotte Restaurant",
          publishedAt: null,
          locale: "en",
        },
        {
          documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
          name: "Pizzeria Arrivederci",
          publishedAt: null,
          locale: "en",
        },
      ], null, 2),
    },
    {
      status: 200,
      statusText: 'With filters',
      body: JSON.stringify([
        {
          documentId: "j9k8l7m6n5o4p3q2r1s0tuv",
          name: "Pizzeria Arrivederci",
          locale: "en",
          publishedAt: null,
        },
      ], null, 2),
    },
  ]}
>

Available filters are detailed in the [filters](/cms/api/document-service/filters) page of the Document Service API reference.

If no `locale` or `status` parameters are passed, results return the draft version for the default locale.

</Endpoint>

### `create()`

Creates a drafted document and returns it.

Pass fields for the content to create in a `data` object.

Syntax: `create(parameters: Params) => Document`

<Endpoint
  id="create"
  method="POST"
  path="strapi.documents().create()"
  title="create()"
  description="Create a new document. If no locale parameter is passed, create() creates the draft version of the document for the default locale."
  paramTitle="Parameters"
  params={[
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the document to create. Defaults to the default locale. <a href="/cms/api/document-service/locale#create">See locale docs</a>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#create">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'status', type: "'published'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: can be set to <code>published</code> to automatically publish the draft version of a document while creating it. <a href="/cms/api/document-service/status#create">See status docs</a>.' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').create({
  data: {
    name: 'Restaurant B'
  }
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "ln1gkzs6ojl9d707xn6v86mw",
        name: "Restaurant B",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
  ]}
>

:::tip
If the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled on the content-type, you can automatically publish a document while creating it (see [`status` documentation](/cms/api/document-service/status#create)).
:::

</Endpoint>

### `update()`

Updates document versions and returns them.

Syntax: `update(parameters: Params) => Promise<Document>`

<Endpoint
  id="update"
  method="PUT"
  path="strapi.documents().update()"
  title="update()"
  description="Update a document by documentId. If no locale parameter is passed, update() updates the document for the default locale."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: 'String or null', required: false, description: 'Locale of the document to update. Defaults to the default locale. <a href="/cms/api/document-service/locale#update">See locale docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#update">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'status', type: "'published'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: can be set to <code>published</code> to automatically publish the draft version of a document while updating it. <a href="/cms/api/document-service/status#update">See status docs</a>.' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').update({
    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
    data: { name: "New restaurant name" }
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        name: "New restaurant name",
        locale: "en",
        publishedAt: null,
      }, null, 2),
    },
  ]}
>

:::tip
Published versions are read-only, so you can not technically update the published version of a document.
To update a document and publish the new version right away, you can:

- update its draft version with `update()`, then [publish it](#publish) with `publish()`,
- or directly add `status: 'published'` along with the other parameters passed to `update()` (see [`status` documentation](/cms/api/document-service/status#update)).
:::

:::caution
It's not recommended to update repeatable components with the Document Service API (see the related [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/do-not-update-repeatable-components-with-document-service-api.md) for more details).
:::

</Endpoint>

### `delete()`

Deletes one document, or a specific locale of it.

Syntax: `delete(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

<Endpoint
  id="delete"
  method="DELETE"
  path="strapi.documents().delete()"
  title="delete()"
  description="Delete a document or a specific locale version. If no locale parameter is passed, delete() only deletes the default locale version of a document. This deletes both the draft and published versions."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: "String, '*', or null", required: false, description: 'Locale version of the document to delete. Default: <code>null</code> (deletes only the default locale). <a href="/cms/api/document-service/locale#delete">See locale docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#delete">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').delete({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        entries: [
          {
            documentId: "a1b2c3d4e5f6g7h8i9j0klm",
            name: "Biscotte Restaurant",
            publishedAt: "2024-03-14T18:30:48.870Z",
            locale: "en",
          }
        ]
      }, null, 2),
    },
  ]}
/>

### `publish()`

Publishes one or multiple locales of a document.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `publish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

<Endpoint
  id="publish"
  method="PUT"
  path="strapi.documents().publish()"
  title="publish()"
  description="Publish the draft version of a document. This method is only available if Draft & Publish is enabled on the content-type. If no locale parameter is passed, publish() only publishes the default locale version of the document."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: "String, '*', or null", required: false, description: 'Locale of the documents to publish. Default: only the default locale. <a href="/cms/api/document-service/locale#publish">See locale docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#publish">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').publish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        entries: [
          {
            documentId: "a1b2c3d4e5f6g7h8i9j0klm",
            name: "Biscotte Restaurant",
            publishedAt: "2024-03-14T18:30:48.870Z",
            locale: "en",
          }
        ]
      }, null, 2),
    },
  ]}
/>

### `unpublish()`

Unpublishes one or all locale versions of a document, and returns how many locale versions were unpublished.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `unpublish(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

<Endpoint
  id="unpublish"
  method="PUT"
  path="strapi.documents().unpublish()"
  title="unpublish()"
  description="Move a published document back to draft. This method is only available if Draft & Publish is enabled on the content-type. If no locale parameter is passed, unpublish() only unpublishes the default locale version of the document."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: "String, '*', or null", required: false, description: 'Locale of the documents to unpublish. Default: only the default locale. <a href="/cms/api/document-service/locale#unpublish">See locale docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#unpublish">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').unpublish({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm'
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "lviw819d5htwvga8s3kovdij",
        entries: [
          {
            documentId: "lviw819d5htwvga8s3kovdij",
            name: "Biscotte Restaurant",
            publishedAt: null,
            locale: "en",
          }
        ]
      }, null, 2),
    },
  ]}
/>

### `discardDraft()`

Discards draft data and overrides it with the published version.

This method is only available if [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content-type.

Syntax: `discardDraft(parameters: Params): Promise<{ documentId: ID, entries: Number }>`

<Endpoint
  id="discarddraft"
  method="PUT"
  path="strapi.documents().discardDraft()"
  title="discardDraft()"
  description="Drop draft data and keep only the published version. This method is only available if Draft & Publish is enabled on the content-type. If no locale parameter is passed, discardDraft() discards draft data and overrides it with the published version only for the default locale."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: "String, '*', or null", required: false, description: 'Locale of the documents to discard. Default: only the default locale. <a href="/cms/api/document-service/locale#discard-draft">See locale docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#discarddraft">Select fields</a> to return. Defaults to all fields (except those not populated by default).' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `strapi.documents.discardDraft({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
});`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "lviw819d5htwvga8s3kovdij",
        entries: [
          {
            documentId: "lviw819d5htwvga8s3kovdij",
            name: "Biscotte Restaurant",
            publishedAt: null,
            locale: "en",
          }
        ]
      }, null, 2),
    },
  ]}
/>

### `count()`

Count the number of documents that match the provided parameters.

Syntax: `count(parameters: Params) => number`

<Endpoint
  id="count"
  method="GET"
  path="strapi.documents().count()"
  title="count()"
  description="Count how many documents match the parameters. If no parameter is passed, the count() method returns the total number of documents for the default locale."
  paramTitle="Parameters"
  params={[
    { name: 'locale', type: 'String or null', required: false, description: 'Locale of the documents to count. Defaults to the default locale. <a href="/cms/api/document-service/locale#count">See locale docs</a>.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: publication status. <code>published</code> to count only published documents, <code>draft</code> to count draft documents (returns all documents). Default: <code>draft</code>. <a href="/cms/api/document-service/status#count">See status docs</a>.' },
    { name: 'filters', type: 'Object', required: false, description: '<a href="/cms/api/document-service/filters">Filters</a> to use. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Generic example',
      code: `await strapi.documents('api::restaurant.restaurant').count()`,
    },
    {
      label: 'Count published',
      code: `strapi.documents('api::restaurant.restaurant').count({ status: 'published' })`,
    },
    {
      label: 'With filters',
      code: `/**
 * Count number of draft documents (default if status is omitted)
 * in English (default locale)
 * whose name starts with 'Pizzeria'
 */
strapi.documents('api::restaurant.restaurant').count({ filters: { name: { $startsWith: "Pizzeria" }}})`,
    },
  ]}
  isLast={true}
>

:::note
Since published documents necessarily also have a draft counterpart, a published document is still counted as having a draft version.

This means that counting with the `status: 'draft'` parameter still returns the total number of documents matching other parameters, even if some documents have already been published and are not displayed as "draft" or "modified" in the Content Manager anymore. There currently is no way to prevent already published documents from being counted.
:::

</Endpoint>
