---
title: REST API reference
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
displayed_sidebar: restApiSidebar
tags:
- API
- Content API
- documentId
- Documents
- plural API ID
- REST API
- singular API ID
---

# REST API reference

The REST API allows accessing the [content-types](/dev-docs/backend-customization/models) through API endpoints. Strapi automatically creates [API endpoints](#endpoints) when a content-type is created. [API parameters](/dev-docs/api/rest/parameters) can be used when querying API endpoints to refine the results.

This section of the documentation is for the REST API reference. We also have [guides](/dev-docs/api/rest/guides/intro) available for specific use cases.

:::prerequisites
All content types are private by default and need to be either made public or queries need to be authenticated with the proper permissions. See the [Quick Start Guide](/dev-docs/quick-start#step-3-set-roles--permissions), the user guide for the [Users & Permissions plugin](/user-docs/users-roles-permissions/configuring-end-users-roles), and [API tokens configuration documentation](/dev-docs/configurations/api-tokens) for more details.
:::

:::note
By default, the REST API responses only include top-level fields and does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](/dev-docs/api/rest/populate-select) to populate specific fields. Ensure that the find permission is given to the field(s) for the relation(s) you populate.
:::

:::strapi Upload plugin API
The Upload plugin (which handles media found in the [Media Library](/user-docs/media-library)) has a specific API described in the [Upload plugin documentation](/dev-docs/plugins/upload).
:::

## Endpoints

For each Content-Type, the following endpoints are automatically generated:

<details>
<summary>Plural API ID vs. Singular API ID:</summary>
In the following tables:

- `:singularApiId` refers to the value of the "API ID (Singular)" field of the content-type,
- and `:pluralApiId` refers to the value of the "API ID (Plural)" field of the content-type.

These values are defined when creating a content-type in the Content-Type Builder, and can be found while editing a content-type in the admin panel (see [User Guide](/user-docs/content-type-builder/creating-new-content-type)). For instance, by default, for an "Article" content-type:

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
| `GET`    | `/api/:pluralApiId`             | [Get a list of document](#get-documents) |
| `POST`   | `/api/:pluralApiId`             | [Create a document](#create-an-entry)   |
| `GET`    | `/api/:pluralApiId/:documentId` | [Get a document](#get-an-entry)         |
| `PUT`    | `/api/:pluralApiId/:documentId` | [Update a document](#update-an-entry)   |
| `DELETE` | `/api/:pluralApiId/:documentId` | [Delete a document](#delete-an-entry)   |

</TabItem>

<TabItem value="single" label="Single type">

| Method   | URL                   | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `GET`    | `/api/:singularApiId` | [Get a document](#get-an-entry)              |
| `PUT`    | `/api/:singularApiId` | [Update/Create a document](#update-an-entry) |
| `DELETE` | `/api/:singularApiId` | [Delete a document](#delete-an-entry)        |

</TabItem>

</Tabs>

<details>

<summary>Real-world examples of endpoints:</summary>

The following endpoint examples are taken from the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application.

<Tabs groupId="collection-single">

<TabItem value="collection" label="Collection type">

`Restaurant` **Content type**

| Method | URL                      | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/restaurants`       | Get a list of restaurants |
| POST   | `/api/restaurants`       | Create a restaurant       |
| GET    | `/api/restaurants/:documentId`   | Get a specific restaurant |
| DELETE | `/api/restaurants/:documentId`   | Delete a restaurant       |
| PUT    | `/api/restaurants/:documentId`   | Update a restaurant       |

</TabItem>

<TabItem value="single" label="Single type">

`Homepage` **Content type**

| Method | URL             | Description                        |
| ------ | --------------- | ---------------------------------- |
| GET    | `/api/homepage` | Get the homepage content           |
| PUT    | `/api/homepage` | Update/create the homepage content |
| DELETE | `/api/homepage` | Delete the homepage content        |

</TabItem>
</Tabs>
</details>

:::note
[Components](/dev-docs/backend-customization/models#components) don't have API endpoints.
:::

## Requests

:::strapi Strapi 5 vs. Strapi v4
Strapi 5's Content API includes 2 major differences with Strapi v4:

- The response format has been flattened, which means attributes are no longer nested in a `data.attributes` object and are directly accessible at the first level of the `data` object (e.g., a content-type's "title" attribute is accessed with `data.title`).
- Strapi 5 now uses **documents** <DocumentDefinition/> and documents are accessed by their `documentId`.
:::

Requests return a response as an object which usually includes the following keys:

- `data`: the response data itself, which could be:
  - a single document, as an object with the following keys:
    - `id` (integer)
    - `documentId` (string), which is the unique identifier to use when querying a given document,
    - the attributes (each attribute's type depends on the attribute, see [models attributes](/dev-docs/backend-customization/models#model-attributes) documentation for details)
    - `meta` (object)
  - a list of documents, as an array of objects
  - a custom response

- `meta` (object): information about pagination, publication state, available locales, etc.

- `error` (object, _optional_): information about any [error](/dev-docs/error-handling) thrown by the request

:::note
Some plugins (including Users & Permissions and Upload) may not follow this response format.
:::

<SideBySideContainer>

<SideBySideColumn>

### Get documents {#get-all}

Returns documents matching the query filters (see [API parameters](/dev-docs/api/rest/parameters) documentation).

:::tip Tip: Strapi 5 vs. Strapi 4
In Strapi 5 the response format has been flattened, and attributes are directly accessible from the `data` object instead of being nested in `data.attributes`.

You can pass an optional header while you're migrating to Strapi 5 (see the [related breaking change](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format)).
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request>

`GET http://localhost:1337/api/restaurants`

</Request>

<Response>

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "hgv1vny5cebq2l3czil1rpb3",
      "Name": "BMK Paris Bamako",
      "Description": null,
      "createdAt": "2024-03-06T13:42:05.098Z",
      "updatedAt": "2024-03-06T13:42:05.098Z",
      "publishedAt": "2024-03-06T13:42:05.103Z",
      "locale": "en"
    },
    {
      "id": 4,
      "documentId": "znrlzntu9ei5onjvwfaalu2v",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
            }
          ]
        }
      ],
      "createdAt": "2024-03-06T13:43:30.172Z",
      "updatedAt": "2024-03-06T13:43:30.172Z",
      "publishedAt": "2024-03-06T13:43:30.175Z",
      "locale": "en"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

</Response>

</ApiCall>

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>

<SideBySideColumn>

### Get a document {#get}

Returns a document by `documentId`.

:::strapi Strapi 5 vs. Strapi v4
In Strapi 5, a specific document is reached by its `documentId`.
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/restaurants/j964065dnjrdr4u89weh79xl`

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 6,
    "documentId": "znrlzntu9ei5onjvwfaalu2v",
    "Name": "Biscotte Restaurant",
    "Description": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine bassics, such as 4 Formaggi or Calzone, and our original creations such as Do Luigi or Nduja."
          }
        ]
      }
    ],
    "createdAt": "2024-02-27T10:19:04.953Z",
    "updatedAt": "2024-03-05T15:52:05.591Z",
    "publishedAt": "2024-03-05T15:52:05.600Z",
    "locale": "en"
  },
  "meta": {}
}

```

</Response>

</ApiCall>

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>

<SideBySideColumn>

### Create a document {#create}

Creates a document and returns its value.

If the [Internationalization (i18n) plugin](/dev-docs/i18n) is installed, it's possible to use POST requests to the REST API to [create localized documents](/dev-docs/i18n#creating-a-new-localized-entry).

:::note
While creating a document, you can define its relations and their order (see [Managing relations through the REST API](/dev-docs/api/rest/relations.md) for more details).
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`POST http://localhost:1337/api/restaurants`

```json
{ 
  "data": {
    "Name": "Restaurant D",
    "Description": [ // uses the "Rich text (blocks)" field type
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ]
  }
}
```

</Request>

<Response title="Example response">

```json
{
  "data": {
    "documentId": "bw64dnu97i56nq85106yt4du",
    "Name": "Restaurant D",
    "Description": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ],
    "createdAt": "2024-03-05T16:44:47.689Z",
    "updatedAt": "2024-03-05T16:44:47.689Z",
    "publishedAt": "2024-03-05T16:44:47.687Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer>


<SideBySideContainer>

<SideBySideColumn>

### Update a document {#update}

Partially updates a document by `id` and returns its value.

Send a `null` value to clear fields.

:::note NOTES
* Even unmodified fields must be included in the request's body.
* Even with the [Internationalization (i18n) plugin](/dev-docs/i18n) installed, it's currently not possible to [update the locale of a document](/dev-docs/i18n#rest-update).
* While updating a document, you can define its relations and their order (see [Managing relations through the REST API](/dev-docs/api/rest/relations) for more details).
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`PUT http://localhost:1337/api/restaurants/hgv1vny5cebq2l3czil1rpb3`

```json
{ 
  "data": {
    "Name": "BMK Paris Bamako", // we didn't change this field but still need to include it
    "Description": [ // uses the "Rich text (blocks)" field type
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ]
  }
}
```

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 9,
    "documentId": "hgv1vny5cebq2l3czil1rpb3",
    "Name": "BMK Paris Bamako",
    "Description": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ],
    "createdAt": "2024-03-06T13:42:05.098Z",
    "updatedAt": "2024-03-06T14:16:56.883Z",
    "publishedAt": "2024-03-06T14:16:56.895Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer >

<SideBySideContainer>

<SideBySideColumn>

### Delete a document {#delete}

Deletes a document.

`DELETE` requests only send a 204 HTTP status code on success and do not return any data in the response body.

</SideBySideColumn>

<SideBySideColumn>
<ApiCall>

<Request title="Example request">

`DELETE http://localhost:1337/api/restaurants/bw64dnu97i56nq85106yt4du`

</Request>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer>
