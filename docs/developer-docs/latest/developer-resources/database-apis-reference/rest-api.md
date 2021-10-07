---
title: REST API - Strapi Developer Documentation
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
sidebarDepth: 3
---

# REST API

The REST API allows accessing the [content-types](/developer-docs/latest/development/backend-customization/models.md#content-types) through API endpoints that Strapi automatically creates. [API parameters](#api-parameters) can be used to refine the requests.

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

<!-- ? is `pluralApiId` the value declared with `info.pluralName` in the model? -->

| Method   | URL                             | Description                           |
| -------- | ------------------------------- | ------------------------------------- |
| `GET`    | `/api/:pluralApiId`             | [Get a list of entries](#get-entries) |
| `POST`   | `/api/:pluralApiId`             | [Create an entry](#create-an-entry)   |
| `GET`    | `/api/:pluralApiId/:documentId` | [Get an entry](#get-an-entry)         |
| `PUT`    | `/api/:pluralApiId/:documentId` | [Update an entry](#update-an-entry)   |
| `DELETE` | `/api/:pluralApiId/:documentId` | [Delete an entry](#delete-an-entry)   |
<!-- 
| `POST`   | `/api/:pluralApiId/actions/:action`             | Actions on the collection of documents (bulk actions, custom action…) |
| `POST`   | `/api/:pluralApiId/:documentId/actions/:action` | Actions on a specific document                                        | -->

<!-- TODO: uncomment & document actions once implemented -->

</div>

:::

::: tab Single Type

<div id="endpoint-table">

| Method   | URL                   | Description                         |
| -------- | --------------------- | ----------------------------------- |
| `GET`    | `/api/:singularApiId` | [Get an entry](#get-an-entry)       |
| `PUT`    | `/api/:singularApiId` | [Update/Create an entry](#update-an-entry) |
| `DELETE` | `/api/:singularApiId` | [Delete an entry](#delete-an-entry) |

<!-- | `POST`   | `/api/:singularApiId/actions/:action` | Actions on the single type (custom action…) | -->

<!-- TODO: uncomment & document actions once implemented -->
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
<!-- TODO: create an entry in the docs to list all errors -->

- `error` (object, _optional_): information about any error thrown by the request

### Get entries

Returns entries matching the query filters (see [parameters](#api-parameters) documentation).

:::: api-call

::: request Example request

`GET http://localhost:1337/api/restaurants`

:::

::: response Example response

<!-- TODO: update with FoodAdvisor? -->
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Restaurant A",
        "description": "Restaurant A's description",
        "categories": [
          {
            "id": 1,
            "attributes": {
              "name": "My category"
            },
            "meta": {
              "availableLocales": []
            }
          }
        ]
      },
      "meta": {
        "availableLocales": []
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Restaurant B",
        "description": "Restaurant B's description",
        "categories": [
          {
            "id": 1,
            "attributes": {
              "name": "My category"
            },
            "meta": {
              "availableLocales": []
            }
          }
        ]
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

<!-- TODO: update with FoodAdvisor? -->
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Restaurant A",
      "description": "Restaurant A's description",
      "categories": [
        {
          "id": 1,
          "attributes": {
            "name": "My category"
          },
          "meta": {
            "availableLocales": []
          }
        }
      ]
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

<!-- TODO: update with FoodAdvisor? -->
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

<!-- TODO: update with FoodAdvisor? -->
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

<!-- TODO: update with FoodAdvisor? -->
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

## API Parameters

Query parameters use the LHS bracket syntax (i.e. they are encoded using square brackets `[]`).

:::caution
<!-- ? is it still relevant? -->
By default, the filters can only be used from `find` endpoints generated by the Content-Types Builder and the CLI.
:::

### Filters

Queries can accept a `filters` parameter with the following syntax:

`GET /api/:pluralApiId?filters[field][operator]=value`

The following operators are available:

<!-- ? what's the difference: `contains` vs. `containsi`? is it really a case-sensitive thing? -->

| Operator      | Description                      |
| ------------- | -------------------------------- |
| `$eq`         | Equal                            |
| `$ne`         | Not equal                        |
| `$lt`         | Less than                        |
| `$lte`        | Less than or equal to            |
| `$gt`         | Greater than                     |
| `$gte`        | Greater than or equal to         |
| `$in`         | Included in an array             |
| `$notIn`      | Not included in an array         |
| `$contains`   | Contains                         |
| `$ncontains`  | Does not contain                 |
| `$containsi`  | Contains, case sensitive         |
| `$ncontainsi` | Does not contain, case sensitive |
| `$null`       | Is null                          |
| `$notNull`    | Is not null                      |
| `$between`    | Is between                       |
| `$startsWith` | Starts with                      |
| `$endsWith`   | Ends with                        |

:::request Example request: Find users having 'John' as first name
`GET /api/users?filters[firstName][$eq]=John`
:::

:::request Example request: Find restaurants having a price equal or greater than `3`
`GET /api/restaurants?filters[price][$gte]=3`
:::

:::request Example request: Find multiple restaurant with id 3, 6, 8
`GET /api/restaurants?filters[id][$in][0]=3&filters[id][$in][1]=6&filters[id][$in][2]=8`
:::

::::tip
Strapi takes advantage of the ability of [`qs`](https://github.com/ljharb/qs) to parse nested objects to create more complex queries.
Use `qs` directly to generate complex queries instead of creating them manually.

:::details Example

<!-- ? devs, could you please check that the generated URL and object syntax is correct? -->
```js
const qs = require('qs');
const query = qs.stringify({
  filters: {
    $or: [
      {
        date: {
          $eq: '2020-01-01'
        },
      },
      {
        date: {
          $eq: '2020-01-02'
        },
      }
    ],
    title: {
      $eq: 'hello'
    },
    author: {
      name: {
        $eq: 'Kai doe'
      },
    },
  },
}, {
  encodeValuesOnly: true, // prettify url
});

await request(`/api/books?${query}`);
// GET /api/books?filters[$or][0][date][$eq]=2020-01-01&filters[$or][1][date][$eq]=2020-01-02&filters[title][$eq]=hello&filters[author][name][$eq]=Kai%20doe
```

:::
::::

#### Deep filtering

Deep filtering is filtering on a relation's fields.

:::request Example request: Find restaurants owned by a chef who belongs to a 5-star restaurant
`GET /api/restaurants?filters[chef][restaurant][star][$eq]=5`
:::

::: caution

- Querying your API with deep filters may cause performance issues.  If one of your deep filtering queries is too slow, we recommend building a custom route with an optimized version of the query.
- Deep filtering isn't available for polymorphic relations.

:::

### Sort

Queries can accept a `sort` parameter with the following syntax:

`GET /api/:pluralApiId?sort=field1,field2`

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).

:::request Example requests: Sort users by email
`GET /api/users?sort=email` to sort by ascending order (default)

`GET /api/users?sort=email:desc` to sort by descending order
:::

:::request Example requests: Sort books on multiple fields
`GET /api/books?sort=title,price:desc`

`GET /api/books?sort=title,author.name`

`GET /api/books?sort[0]=title&sort[1][author]=name` using an array format

:::

### Pagination

Queries can accept `pagination` parameters. Results can be paginated:

- either by page (i.e. specifying a page number and the number of entries per page)
- or by offset (i.e. specifying how many entries to skip and to return)

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

#### Pagination by page

Use the following parameters:

<!-- ? is it 100 or 10 for default page size -->

| Parameter               | Type    | Description                                                               | Default |
| ----------------------- | ------- | ------------------------------------------------------------------------- | ------- |
| `pagination[page]`      | Integer | Page number                                                               | 1       |
| `pagination[pageSize]`  | Integer | Page size                                                                 | 100     |
| `pagination[withCount]` | Boolean | Adds the total numbers of entries and the number of pages to the response | True    |

:::: api-call

::: request Example request
`GET /api/:pluralApiId?pagination[page]=1&pagination[pageSize]=10`
:::

::: response Example response

```json
{
  "data": […],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 48
    }
  }
}
```

:::
::::

#### Pagination by offset

Use the following parameters:

| Parameter               | Type    | Description                                                    | Default |
| ----------------------- | ------- | -------------------------------------------------------------- | ------- |
| `pagination[start]`     | Integer | Start value (first entry to return) value                      | 0       |
| `pagination[limit]`     | Integer | Number of entries to return                                    | 25      |
| `pagination[withCount]` | Boolean | Toggles displaying the total number of entries to the response | `true`  |

::: tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/api.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) file with the `api.rest.defaultLimit` and `api.rest.maxLimit` keys.
:::
<!-- TODO: remove this comment: the link above won't work until the content is merged with the `dev/v4-split-configuration-docs-files` branch  -->

:::: api-call

::: request Example request
`GET /api/:pluralApiId?pagination[start]=20&pagination[limit]=30`

:::

::: response Example response

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "start": 0,
      "limit": 10,
      "total": 42,
    }
  }
}
```

:::
::::

### Fields selection

Queries can accept a `fields` parameter to select only some fields. Use one of the following syntaxes:

`GET /api/:pluralApiId?fields=field1,field2`
<br>or<br>
`GET /api/:pluralApiId?fields[0]=field1&fields[1]=field2`

To get all fields, use the `*` wildcard.

<!-- TODO: add response example and convert this to an api-call component -->
::: request Example request: Get only firstName and lastName of all users
`GET /api/users?fields=firstName,lastName`
:::

::: request Example request: Get all fields for all users
`GET /api/users?fields=*`
:::

### Relations population

By default, relations are not populated when fetching entries.

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax:

`GET /api/:pluralApiId?populate=field1,field2`

<!-- TODO: add an example response and convert this to an api-call component -->
::: request Example request: Get books and populate relations with the author's name and address
`GET /api/books?populate=author.name,author.address`
:::

For convenience, the `*` wildcard can be used:

::: request Example request: Get all books and populate all their first level relations
`GET /api/books?populate=*`
:::

::: request Example request: Get all books and populate with authors and all their relations
`GET /api/books?populate[author]=*`
:::

### Publication State

:::note
This parameter can only be used on models with the **Draft & Publish** feature activated.
:::

Queries can accept a `publicationState` parameter to fetch entries based on their publication state:

- `live`: returns only published entries (default)
- `preview`: returns both draft entries & published entries

:::request Example requests: Get published articles
`GET /api/articles`

or

`GET /api/articles?publicationState=live`
:::

:::request Example request: Get both published and draft articles
`GET /api/articles?publicationState=preview`
:::

:::tip
To retrieve only draft entries, combine the `preview` publication state and the `published_at` fields:

`GET /api/articles?publicationState=preview&published_at_null=true`
:::

### Locale

If the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md) is installed and [localization is enabled for the content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type), the `locale` API parameter can be used to [get entries from a specific locale](/developer-docs/latest/plugins/i18n.md#getting-localized-entries-with-the-locale-parameter).
