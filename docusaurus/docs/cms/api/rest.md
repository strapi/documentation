---
title: REST API reference
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- documentId
- Documents
- plural API ID
- REST API
- singular API ID
---

import Endpoint from '@site/src/components/ApiReference/Endpoint';

# REST API reference

The REST API allows accessing the [content-types](/cms/backend-customization/models) through API endpoints. Strapi automatically creates [API endpoints](#endpoints) when a content-type is created. [API parameters](/cms/api/rest/parameters) can be used when querying API endpoints to refine the results.

This section of the documentation is for the REST API reference for content-types. We also have [guides](/cms/api/rest/guides/intro) available for specific use cases.

:::prerequisites
All content types are private by default and need to be either made public or queries need to be authenticated with the proper permissions. See the [Quick Start Guide](/cms/quick-start#step-4-set-roles--permissions), the user guide for the [Users & Permissions feature](/cms/features/users-permissions#roles), and [API tokens configuration documentation](/cms/features/api-tokens) for more details.
:::

:::note
By default, the REST API responses only include top-level fields and does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](/cms/api/rest/populate-select) to populate specific fields. Ensure that the find permission is given to the field(s) for the relation(s) you populate.
:::

:::strapi Strapi Client
The [Strapi Client](/cms/api/client) library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content.
:::

## Endpoints

For each Content-Type, the following endpoints are automatically generated:

<details>
<summary>Plural API ID vs. Singular API ID:</summary>

In the following tables:

- `:singularApiId` refers to the value of the "API ID (Singular)" field of the content-type,
- and `:pluralApiId` refers to the value of the "API ID (Plural)" field of the content-type.

These values are defined when creating a content-type in the Content-Type Builder, and can be found while editing a content-type in the admin panel (see [User Guide](/cms/features/content-type-builder#creating-content-types)). For instance, by default, for an "Article" content-type:

- `:singularApiId` will be `article`
- `:pluralApiId` will be `articles`

<ThemedImage
alt="Screenshot of the Content-Type Builder to retrieve singular and plural API IDs"
sources={{
  light: '/img/assets/rest-api/plural-api-id.png',
  dark: '/img/assets/rest-api/plural-api-id_DARK.png'
}}
/>

</details>

<Tabs groupId="collection-single">
<TabItem value="collection" label="Collection type">

| Method   | URL                             | Description                           |
| -------- | ------------------------------- | ------------------------------------- |
| `GET`    | `/api/:pluralApiId`             | [Get a list of documents](#get-all)   |
| `POST`   | `/api/:pluralApiId`             | [Create a document](#create)          |
| `GET`    | `/api/:pluralApiId/:documentId` | [Get a document](#get)                |
| `PUT`    | `/api/:pluralApiId/:documentId` | [Update a document](#update)          |
| `DELETE` | `/api/:pluralApiId/:documentId` | [Delete a document](#delete)          |

</TabItem>
<TabItem value="single" label="Single type">

| Method   | URL                   | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `GET`    | `/api/:singularApiId` | [Get a document](#get)                     |
| `PUT`    | `/api/:singularApiId` | [Update/Create a document](#update)        |
| `DELETE` | `/api/:singularApiId` | [Delete a document](#delete)               |

</TabItem>
</Tabs>

:::strapi Upload API
The Upload package (which powers the [Media Library feature](/cms/features/media-library)) has a specific API accessible through its [`/api/upload` endpoints](/cms/api/rest/upload).
:::

:::note
[Components](/cms/backend-customization/models#components-json) don't have API endpoints.
:::

## Requests

:::strapi Strapi 5 vs. Strapi v4
Strapi 5's Content API includes 2 major differences with Strapi v4:

- The response format has been flattened, which means attributes are no longer nested in a `data.attributes` object and are directly accessible at the first level of the `data` object (e.g., a content-type's "title" attribute is accessed with `data.title`).
- Strapi 5 now uses **documents** <DocumentDefinition/> and documents are accessed by their `documentId` (see [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/use-document-id) for details)
:::

Requests return a response as an object which usually includes the following keys:

- `data`: the response data itself, which could be:
  - a single document, as an object with the following keys:
    - `id` (integer)
    - `documentId` (string), which is the unique identifier to use when querying a given document,
    - the attributes (each attribute's type depends on the attribute, see [models attributes](/cms/backend-customization/models#model-attributes) documentation for details)
    - `meta` (object)
  - a list of documents, as an array of objects
  - a custom response

- `meta` (object): information about pagination, publication state, available locales, etc.

- `error` (object, _optional_): information about any [error](/cms/error-handling) thrown by the request

:::note
Some plugins (including Users & Permissions and Upload) may not follow this response format.
:::

### Get documents {#get-all}

:::tip Tip: Strapi 5 vs. Strapi 4
In Strapi 5 the response format has been flattened, and attributes are directly accessible from the `data` object instead of being nested in `data.attributes`.

You can pass an optional header while you're migrating to Strapi 5 (see the [related breaking change](/cms/migration/v4-to-v5/breaking-changes/new-response-format)).
:::

<Endpoint
  id="get-all-endpoint"
  method="GET"
  path="/api/:pluralApiId"
  title="List documents"
  description="Returns a paginated list of documents. Supports filtering, sorting, field selection, and relation population."
  paramTitle="Query Parameters"
  params={[
    { name: 'sort', type: 'string | string[]', required: false, description: 'Sort by field. Use <code>field:asc</code> or <code>field:desc</code>' },
    { name: 'filters', type: 'object', required: false, description: 'Filter with operators: <code>$eq</code>, <code>$contains</code>, <code>$gt</code>, <code>$lt</code>. See <a href="/cms/api/rest/filters">filtering</a>.' },
    { name: 'populate', type: 'string | object', required: false, description: 'Relations and components to include. Use <code>*</code> for all. See <a href="/cms/api/rest/populate-select">populate</a>.' },
    { name: 'fields', type: 'string[]', required: false, description: 'Select specific fields to return. See <a href="/cms/api/rest/populate-select#field-selection">field selection</a>.' },
    { name: 'pagination[page]', type: 'integer', required: false, description: 'Page number. Default: <code>1</code>' },
    { name: 'pagination[pageSize]', type: 'integer', required: false, description: 'Items per page. Default <code>25</code>, max <code>100</code>' },
    { name: 'locale', type: 'string', required: false, description: 'Locale of the documents to fetch. See <a href="/cms/api/rest/locale">locale</a>.' },
    { name: 'status', type: 'string', required: false, description: '<code>published</code> or <code>draft</code>. See <a href="/cms/api/rest/status">status</a>.' },
  ]}
  codePath="/api/restaurants"
  codePathHighlights={['restaurants']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl 'http://localhost:1337/api/restaurants' \\
  -H 'Authorization: Bearer <token>'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants',
  {
    headers: {
      Authorization: 'Bearer <token>',
    },
  }
);
const data = await response.json();`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      time: '23ms',
      body: JSON.stringify({
        data: [
          {
            id: 2,
            documentId: "hgv1vny5cebq2l3czil1rpb3",
            Name: "BMK Paris Bamako",
            Description: null,
            createdAt: "2024-03-06T13:42:05.098Z",
            updatedAt: "2024-03-06T13:42:05.098Z",
            publishedAt: "2024-03-06T13:42:05.103Z",
            locale: "en"
          },
          {
            id: 4,
            documentId: "znrlzntu9ei5onjvwfaalu2v",
            Name: "Biscotte Restaurant",
            Description: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers." }]
              }
            ],
            createdAt: "2024-03-06T13:43:30.172Z",
            updatedAt: "2024-03-06T13:43:30.172Z",
            publishedAt: "2024-03-06T13:43:30.175Z",
            locale: "en"
          }
        ],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 2 }
        }
      }, null, 2),
    },
  ]}
/>

### Get a document {#get}

:::strapi Strapi 5 vs. Strapi v4
In Strapi 5, a specific document is reached by its `documentId`.
:::

<Endpoint
  id="get-endpoint"
  method="GET"
  path="/api/:pluralApiId/:documentId"
  title="Get a document"
  description="Returns a single document by its documentId. Supports field selection and relation population."
  paramTitle="Path Parameters"
  params={[
    { name: 'pluralApiId', type: 'string', required: true, description: 'Plural API ID of the content-type (e.g. <code>restaurants</code>)' },
    { name: 'documentId', type: 'string', required: true, description: 'Unique document identifier' },
  ]}
  codePath="/api/restaurants/znrlzntu9ei5onjvwfaalu2v"
  codePathHighlights={['restaurants', 'znrlzntu9ei5onjvwfaalu2v']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl 'http://localhost:1337/api/restaurants/znrlzntu9ei5onjvwfaalu2v' \\
  -H 'Authorization: Bearer <token>'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants/znrlzntu9ei5onjvwfaalu2v',
  {
    headers: {
      Authorization: 'Bearer <token>',
    },
  }
);
const data = await response.json();`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      time: '12ms',
      body: JSON.stringify({
        data: {
          id: 6,
          documentId: "znrlzntu9ei5onjvwfaalu2v",
          Name: "Biscotte Restaurant",
          Description: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products." }]
            }
          ],
          createdAt: "2024-02-27T10:19:04.953Z",
          updatedAt: "2024-03-05T15:52:05.591Z",
          publishedAt: "2024-03-05T15:52:05.600Z",
          locale: "en"
        },
        meta: {}
      }, null, 2),
    },
    {
      status: 404,
      statusText: 'Not Found',
      body: JSON.stringify({
        error: { status: 404, name: 'NotFoundError', message: 'Document not found' }
      }, null, 2),
    },
  ]}
/>

### Create a document {#create}

:::note
While creating a document, you can define its relations and their order (see [Managing relations through the REST API](/cms/api/rest/relations.md) for more details).
:::

<Endpoint
  id="create-endpoint"
  method="POST"
  path="/api/:pluralApiId"
  title="Create a document"
  description="Creates a new document and returns it. Send field values inside a data object in the request body."
  paramTitle="Body Parameters"
  params={[
    { name: 'data', type: 'object', required: true, description: 'Object containing the field values for the new document' },
  ]}
  codePath="/api/restaurants"
  codePathHighlights={['restaurants']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl -X POST \\
  'http://localhost:1337/api/restaurants' \\
  -H 'Authorization: Bearer <token>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "data": {
      "Name": "Restaurant D",
      "Description": [
        {
          "type": "paragraph",
          "children": [{ "type": "text", "text": "A very short description goes here." }]
        }
      ]
    }
  }'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants',
  {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'Restaurant D',
        Description: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'A very short description goes here.' }],
          },
        ],
      },
    }),
  }
);
const data = await response.json();`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      time: '45ms',
      body: JSON.stringify({
        data: {
          documentId: "bw64dnu97i56nq85106yt4du",
          Name: "Restaurant D",
          Description: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "A very short description goes here." }]
            }
          ],
          createdAt: "2024-03-05T16:44:47.689Z",
          updatedAt: "2024-03-05T16:44:47.689Z",
          publishedAt: "2024-03-05T16:44:47.687Z",
          locale: "en"
        },
        meta: {}
      }, null, 2),
    },
  ]}
/>

### Update a document {#update}

:::note NOTES
* Even with the [Internationalization (i18n) plugin](/cms/features/internationalization) installed, it's currently not possible to [update the locale of a document](/cms/api/rest/locale#rest-update).
* While updating a document, you can define its relations and their order (see [Managing relations through the REST API](/cms/api/rest/relations) for more details).
:::

<Endpoint
  id="update-endpoint"
  method="PUT"
  path="/api/:pluralApiId/:documentId"
  title="Update a document"
  description="Partially updates a document by documentId and returns its value. Send a null value to clear fields."
  paramTitle="Body Parameters"
  params={[
    { name: 'data', type: 'object', required: true, description: 'Object containing the field values to update' },
  ]}
  codePath="/api/restaurants/hgv1vny5cebq2l3czil1rpb3"
  codePathHighlights={['restaurants', 'hgv1vny5cebq2l3czil1rpb3']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl -X PUT \\
  'http://localhost:1337/api/restaurants/hgv1vny5cebq2l3czil1rpb3' \\
  -H 'Authorization: Bearer <token>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "data": {
      "Name": "BMK Paris Bamako",
      "Description": [
        {
          "type": "paragraph",
          "children": [{ "type": "text", "text": "A very short description goes here." }]
        }
      ]
    }
  }'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants/hgv1vny5cebq2l3czil1rpb3',
  {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'BMK Paris Bamako',
        Description: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'A very short description goes here.' }],
          },
        ],
      },
    }),
  }
);
const data = await response.json();`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      time: '34ms',
      body: JSON.stringify({
        data: {
          id: 9,
          documentId: "hgv1vny5cebq2l3czil1rpb3",
          Name: "BMK Paris Bamako",
          Description: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "A very short description goes here." }]
            }
          ],
          createdAt: "2024-03-06T13:42:05.098Z",
          updatedAt: "2024-03-06T14:16:56.883Z",
          publishedAt: "2024-03-06T14:16:56.895Z",
          locale: "en"
        },
        meta: {}
      }, null, 2),
    },
  ]}
/>

### Delete a document {#delete}

<Endpoint
  id="delete-endpoint"
  method="DELETE"
  path="/api/:pluralApiId/:documentId"
  title="Delete a document"
  description="Permanently deletes a document by documentId. This action is irreversible."
  paramTitle="Path Parameters"
  params={[
    { name: 'pluralApiId', type: 'string', required: true, description: 'Plural API ID (e.g. <code>restaurants</code>)' },
    { name: 'documentId', type: 'string', required: true, description: 'Document ID of the entry to delete' },
  ]}
  codePath="/api/restaurants/bw64dnu97i56nq85106yt4du"
  codePathHighlights={['restaurants', 'bw64dnu97i56nq85106yt4du']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl -X DELETE \\
  'http://localhost:1337/api/restaurants/bw64dnu97i56nq85106yt4du' \\
  -H 'Authorization: Bearer <token>'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants/bw64dnu97i56nq85106yt4du',
  {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer <token>',
    },
  }
);`,
    },
  ]}
  responses={[]}
  isLast
/>
