---
title: REST API - Strapi Developer Docs
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html
---

# REST API

The REST API allows accessing the [content-types](/developer-docs/latest/development/backend-customization/models.md#content-types) through API endpoints that Strapi automatically creates.

[API parameters](#api-parameters) can be used to [filter](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#filtering), [sort](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#sorting), and [paginate](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#pagination) results and to [select fields](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection) and relations to [populate](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#population)). Additionally, specific parameters related to optional Strapi features can be used, like [publication state](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#publication-state) and [locale](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#locale).

## API Parameters

Query parameters use the LHS bracket syntax (i.e. they are encoded using square brackets `[]`).

The following parameters are available:

| Operator           | Type          | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| `sort`             | String/Array  | [Sorting the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html#sorting) |
| `filters`          | Object        | [Filtering the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#filtering) |
| `populate`         | String/Object | [Populate relations, components, or dynamic zones](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#population) |
| `fields`           | Array         | [Select only specific fields to display](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection) |
| `pagination`       | Object        | [Page through entries](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html#pagination) |
| `publicationState` | String        | [Select the draft & publish state: `live` or `preview`](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#publication-state) |
| `locale`           | String/Array  | [Select one ore multiple locales: `en`, `fr`, ect](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#locale) |

::::tip
Strapi takes advantage of the ability of [`qs`](https://github.com/ljharb/qs) to parse nested objects to create more complex queries.
Use `qs` directly to generate complex queries instead of creating them manually.

:::details Example using qs

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['title:asc'],
  filters: {
    title: {
      $eq: 'hello'
    },
  },
  populate: '*',
  fields: ['title'],
  pagination: {
    pageSize: 10,
    page: 1
  },
  publicationState: 'live',
  locale: ['en']
}, {
  encodeValuesOnly: true, // prettify url
});

await request(`/api/books?${query}`);
// GET /api/books?sort[0]=title%3Aasc&filters[title][$eq]=hello&populate=%2A&fields[0]=title&pagination[pageSize]=10&pagination[page]=1&publicationState=live&locale[0]=en
```

:::
::::

## API Endpoints

Creating a content-type automatically creates some REST API endpoints available to interact with it.

:::note
[Components](/developer-docs/latest/development/backend-customization/models.md#components) don't have API endpoints.
:::

### Endpoints

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

::: tab Collection Type

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

::: tab Single Type

<div id="endpoint-table">

| Method   | URL                   | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `GET`    | `/api/:singularApiId` | [Get an entry](#get-an-entry)              |
| `PUT`    | `/api/:singularApiId` | [Update/Create an entry](#update-an-entry) |
| `DELETE` | `/api/:singularApiId` | [Delete an entry](#delete-an-entry)        |

</div>

:::

::::

::::: details Examples

:::: tabs card

::: tab Collection Type

`Restaurant` **Content Type**

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

::: tab Single Type

`Homepage` **Content Type**

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

### Unified response format

Whatever the query, the response is always an object with the following keys:

- `data`: the response data itself, which could be:
  - a single entry, as an object with the following keys:
    - `id` (number)
    - `attributes` (object)
    - `meta` (object)
  - a list of entries, as an array of objects
  - a custom response

- `meta`(object): information about pagination, publication state, available locales, etc.

- `error` (object, _optional_): information about any [error](/developer-docs/latest/developer-resources/error-handling.md) thrown by the request

### Get entries

Returns entries matching the query filters (see [parameters](#api-parameters) documentation).

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

Returns an entry by id.

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

If the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed, it's possible to use POST requests to the Content API to [create localized entries](/developer-docs/latest/plugins/i18n.md#creating-a-new-localized-entry).

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
Fields that aren't sent in the query are not changed in the database. Send a `null` value if you want to clear them.

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

:::

::::

:::note
If the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed, it's currently not possible to [update the locale of an entry](/developer-docs/latest/plugins/i18n.md#updating-an-entry).
:::

### Delete an entry

Deletes an entry by id and returns its value.

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
