---
title: REST API - Strapi Developer Docs
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html
---

# REST API

The REST API allows accessing the [content-types](/developer-docs/latest/development/backend-customization/models.md) through API endpoints. Strapi automatically creates [API endpoints](#endpoints) when a content-type is created. [API parameters](/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.md) can be used when querying API endpoints to refine the results.

::: note
The REST API by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md) to populate specific fields.
:::

## Endpoints

For each Content-Type, the following endpoints are automatically generated:

<style lang="stylus">
#endpoint-table
  table
    display table
    width 100%

  tr
    border none
    &:nth-child(2n)
      background-color white

  tbody
    tr
      border-top 1px solid #dfe2e5

  th, td
    border none
    padding 1.2em 1em
    border-right 1px solid #dfe2e5
    &:last-child
      border-right none

</style>

:::: tabs card

::: tab Collection type

<div id="endpoint-table">

| Method   | URL                             | Description                           |
| -------- | ------------------------------- | ------------------------------------- |
| `GET`    | `/api/:pluralApiId`             | [Get a list of entries](#get-entries) |
| `POST`   | `/api/:pluralApiId`             | [Create an entry](#create-an-entry)   |
| `GET`    | `/api/:pluralApiId/:documentId` | [Get an entry](#get-an-entry)         |
| `PUT`    | `/api/:pluralApiId/:documentId` | [Update an entry](#update-an-entry)   |
| `DELETE` | `/api/:pluralApiId/:documentId` | [Delete an entry](#delete-an-entry)   |

</div>

:::

::: tab Single type

<div id="endpoint-table">

| Method   | URL                   | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `GET`    | `/api/:singularApiId` | [Get an entry](#get-an-entry)              |
| `PUT`    | `/api/:singularApiId` | [Update/Create an entry](#update-an-entry) |
| `DELETE` | `/api/:singularApiId` | [Delete an entry](#delete-an-entry)        |

</div>

:::

::::

::::: details Examples:

:::: tabs card

::: tab Collection type

`Restaurant` **Content type**

<div id="endpoint-table">

| Method | URL                      | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/restaurants`       | Get a list of restaurants |
| POST   | `/api/restaurants`       | Create a restaurant       |
| GET    | `/api/restaurants/:id`   | Get a specific restaurant |
| DELETE | `/api/restaurants/:id`   | Delete a restaurant       |
| PUT    | `/api/restaurants/:id`   | Update a restaurant       |

</div>

:::

::: tab Single type

`Homepage` **Content type**

<div id="endpoint-table">

| Method | URL             | Description                        |
| ------ | --------------- | ---------------------------------- |
| GET    | `/api/homepage` | Get the homepage content           |
| PUT    | `/api/homepage` | Update/create the homepage content |
| DELETE | `/api/homepage` | Delete the homepage content        |

</div>

:::
::::
:::::

::: note
[Components](/developer-docs/latest/development/backend-customization/models.md#components) don't have API endpoints.
:::

## Requests

Requests return a response as an object which usually includes the following keys:

- `data`: the response data itself, which could be:
  - a single entry, as an object with the following keys:
    - `id` (number)
    - `attributes` (object)
    - `meta` (object)
  - a list of entries, as an array of objects
  - a custom response

- `meta` (object): information about pagination, publication state, available locales, etc.

- `error` (object, _optional_): information about any [error](/developer-docs/latest/developer-resources/error-handling.md) thrown by the request

::: note
Some plugins (including Users & Permissions and Upload) may not follow this response format.
:::
### Get entries

Returns entries matching the query filters (see [API parameters](/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.md) documentation).

:::: api-call

::: request Example request

`GET http://localhost:1337/api/restaurants`

:::

::: response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Restaurant A",
        "description": "Restaurant A's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Restaurant B",
        "description": "Restaurant B's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
  ],
  "meta": {}
}

```

:::

::::

### Get an entry

Returns an entry by `id`.

:::: api-call

::: request Example request

`GET http://localhost:1337/api/restaurants/1`

:::

::: response Example response

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Restaurant A",
      "description": "Restaurant A's description"
    },
    "meta": {
      "availableLocales": []
    }
  },
  "meta": {}
}

```

:::

::::

### Create an entry

Creates an entry and returns its value.

If the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed, it's possible to use POST requests to the REST API to [create localized entries](/developer-docs/latest/plugins/i18n.md#creating-a-new-localized-entry).

:::: api-call

::: request Example request

`POST http://localhost:1337/api/restaurants`

```json
{
  "data": {
    "title": "Hello",
    "relation": 2,
    "relations": [2, 4],
    "link": {
      "id": 1,
      "type": "abc"
    }
  }
}
```

:::

::: response Example response

```json
{
  "data": {
    "id": 1,
    "attributes": { … },
    "meta": {}
  },
  "meta": {}
}
```

:::

::::

### Update an entry

Partially updates an entry by `id` and returns its value.

Fields that aren't sent in the query are not changed in the database. Send a `null` value to clear fields.

:::: api-call

::: request Example request

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  "data": {
    "title": "Hello",
    "relation": 2,
    "relations": [2, 4],
  }
}
```

:::

::: response Example response

```json
{
  "data": {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

::::

:::note
Even with the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) installed, it's currently not possible to [update the locale of an entry](/developer-docs/latest/plugins/i18n.md#updating-an-entry).
:::

### Delete an entry

Deletes an entry by `id` and returns its value.

:::: api-call

::: request Example request

`DELETE http://localhost:1337/api/restaurants/1`

:::

::: response Example response

```json
{
  "data": {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

:::
::::
