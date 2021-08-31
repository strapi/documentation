---
title: REST API - Strapi Developer Documentation
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
sidebarDepth: 3
---

# REST API

## API Endpoints

Creating a Content-Type automatically create some **REST API endpoints** available to interact with it.

:::note
[Components](/developer-docs/latest/development/backend-customization.md#component-s-models) don't have API endpoints.
:::

### Endpoints

Here is the list of endpoints generated for each of your Content-Types:

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

<!-- ? what exactly is a document and what is an entity? because I can see different namings in the tables and the headings -->
<!-- TODO make sure descriptions in the tables and headings are consistent -->

<!-- ? is `pluralApiId` the value declared with `info.pluralName` in the model? -->
<!-- TODO: document actions -->
| Method   | URL                                             | Description                                                           |
| -------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/:pluralApiId`                             | [Find a list of documents](#get-entities)                             |
| `POST`   | `/api/:pluralApiId`                             | [Create a document](#create-an-entity)                                |
| `GET`    | `/api/:pluralApiId/:documentId`                 | [Find a document](#get-an-entity)                                     |
| `PUT`    | `/api/:pluralApiId/:documentId`                 | [Update a document](#update-an-entity)                                |
| `DELETE` | `/api/:pluralApiId/:documentId`                 | [Delete a document](#delete-an-entity)                                |
| `POST`   | `/api/:pluralApiId/actions/:action`             | Actions on the collection of documents (bulk actions, custom action…) |
| `POST`   | `/api/:pluralApiId/:documentId/actions/:action` | Actions on a specific document                                        |

</div>

:::

::: tab Single Type

<div id="endpoint-table">

<!-- ? do we use singularApiId for Single Types? -->
<!-- TODO: document actions -->
| Method   | URL                                 | Description                                 |
| -------- | ----------------------------------- | ------------------------------------------- |
| `GET`    | `/api/:pluralApiId`                 | [Find document](#get-an-entity)             |
| `PUT`    | `/api/:pluralApiId`                 | [Set/Update document](#update-an-entity)    |
| `DELETE` | `/api/:pluralApiId`                 | [Delete document](#delete-an-entity)        |
| `POST`   | `/api/:pluralApiId/actions/:action` | Actions on the single type (custom action…) |

</div>

:::

::::

#### Examples

::::: details Click to display some example routes

:::: tabs card

::: tab Collection Type

`Restaurant` **Content Type**

<div id="endpoint-table">

| Method | URL                      | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/restaurants`       | Get a list of restaurants |
| GET    | `/api/restaurants/:id`   | Get a specific restaurant |
| POST   | `/api/restaurants`       | Create a restaurant       |
| DELETE | `/api/restaurants/:id`   | Delete a restaurant       |
| PUT    | `/api/restaurants/:id`   | Update a restaurant       |

</div>

:::

::: tab Single Type

`Homepage` **Content Type**

<div id="endpoint-table">

| Method | URL             | Description                 |
| ------ | --------------- | --------------------------- |
| GET    | `/api/homepage` | Get the homepage content    |
| PUT    | `/api/homepage` | Update the homepage content |
| DELETE | `/api/homepage` | Delete the homepage content |

</div>

:::
::::
:::::

### Unified response format

Whatever the query, the response is always an object with the following keys:

- `data`: the response data itself, which could be:
  - a single entity, as an object with the following keys:
    - `id` (number)
    - `attributes` (object)
    - `meta` (object)
  - a list of entities, as an array of objects
  - a custom response

- `meta`(object): information about pagination, publication state, available locales…
<!-- TODO: create an entry in the docs to list all errors -->

- `error` (object, _optional_): information about any error thrown by the request

### Get entities

Returns entities matching the query filters (see [parameters](#api-parameters) documentation).

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

### Get an entity

Returns an entity by id.

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

### Create an entity

Creates an entity and returns its value.

If the [Internationalization (i18n) plugin](/developer-docs/latest/development/plugins/i18n.md) is installed, it's possible to use POST requests to the Content API to [create localized entities](/developer-docs/latest/development/plugins/i18n.md#creating-a-new-localized-entity).

:::: api-call

::: request Example request

`POST http://localhost:1337/api/restaurants`

<!-- TODO: update with FoodAdvisor? -->
```json
{
  "data" {
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
  "data" {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

:::

::::

### Update an entity

Partially updates an entity by `id` and returns its value.
Fields that aren't sent in the query are not changed in the database. Send a `null` value if you want to clear them.

:::note
It's currently not possible to [update the locale of an entity](/developer-docs/latest/development/plugins/i18n.md#updating-an-entity).
:::

:::: api-call

::: request Example request

`PUT http://localhost:1337/api/restaurants/1`

<!-- TODO: update with FoodAdvisor? -->
```json
{
  "data" {
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
  "data" {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

:::

::::

### Delete an entity

Deletes an entity by id and returns its value.

:::: api-call

::: request Example request

`DELETE http://localhost:1337/api/restaurants/1`

:::

::: response Example response

<!-- TODO: update with FoodAdvisor? -->
```json
{
  "data" {
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

:::caution
<!-- ? is it still relevant? (at least, the `count` endpoint has been removed) -->
By default, the filters can only be used from `find` and `count` endpoints generated by the Content-Types Builder and the [CLI](../cli/CLI.md).
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
| `$notNull`    | Is null                          |
| `$between`    | Is between                       |
| `$startsWith` | Starts with                      |
| `$endsWith`   | Ends with                        |

#### Examples

:::request Example request: Find users having 'John' as first name
`GET /api/users?filters[firstName][$eq]=John`
:::

:::request Example request: Find restaurants having a price equal or greater than `3`
`GET /api/restaurants?filters[price][$gte]=3`
:::

:::request Example request: Find multiple restaurant with id 3, 6, 8
<!-- ? is it the correct syntax? this is what qs.stringify() returned but I'd have expected filters[id][$in][3,6,8] -->
`GET /api/restaurants?filters[id][$in][0]=3&filters[id][$in][1]=6&filters[id][$in][2]=8`
:::

#### Deep filtering

:::request Example request: Find restaurants owned by a chef who belongs to a restaurant with star equal to 5
<!-- ? how should I update this request example (filters syntax)? -->
`GET /api/restaurants?filters[chef.restaurant.star][$eq]=5`
:::

::: caution
Querying your API with deep filters may cause performance issues.
If one of your deep filtering queries is too slow, we recommend building a custom route with an optimized version of your query.
:::

:::caution
This feature isn't available for polymorphic relations. This relation type is used in `media`, `component` and `dynamic zone` fields.
:::

### Sort

Queries can accept a `sort` parameter with the following syntax:

`GET /api/:pluralApiId?sort=field1,field2`

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).

#### Examples

:::request Example requests: Sort users by email
`GET /api/users?sort=email` to sort by ascending order (default)

`GET /api/users?sort=email:desc` to sort by descending order
:::

<!-- ? why do we specify `:asc`? if we write `title,price:desc`, is it equivalent to  `title:asc,price:desc`? -->
:::request Example requests: Sort books on multiple fields
`GET /api/books?sort=title,price:asc`

`GET /api/books?sort=title,author.name`

`GET /api/books?sort[0]=title&sort[1][author]=name` using an array format

:::

### Pagination

Queries can accept `pagination` parameters. Results can be paginated either by page or by offset.

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

#### Pagination by page

Use the following parameters:

<!-- ? is it 100 or 10 for default page size -->

| Parameter              | Description | Default |
| ---------------------- | ----------- | ------- |
| `pagination[page]`     | Page number | 1       |
| `pagination[pageSize]` | Page size   | 100     |

:::: api-call

::: request Example request
`GET /api/:pluralApiId?pagination[page]=1&pagination[pageSize]=10`
:::

::: response Example response

```json
{
  "data": [],
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

<!-- ? is there a default for pagination[limit] ? -->
<!-- ? is there a max for pagination[start] ? -->

| Parameter           | Description                  | Default | Maximum |
| ------------------- | ---------------------------- | ------- | ------- |
| `pagination[start]` | Start value                  | 0       | -       |
| `pagination[limit]` | Number of entities to return | -       | 100     |

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
      "limit": 10
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

#### Example

<!-- TODO: add response example and convert this to an api-call component -->
::: request Example request: Get only firstName and lastName of all users
`GET /api/users?fields=firstName,lastName`
:::

### Relations population

By default, relations are not populated when fetching entities.

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax:

`GET /api/:pluralApiId?populate=field1,field2`
<!-- ? should I add these syntaxes and are they correct: `GET /api/:pluralApiId?populate[]=field1,field2` and `GET /api/pluralApiId?populate[0]=field1&populate[1]=field2` -->

#### Example

<!-- TODO: add an example response and convert this to an api-call component -->
::: request Example request: Get books and populate relations with the author's name and address
`GET /api/books?populate=author.name,author.address`
:::

### Publication State

<!-- ? is it still working or should we filter by `meta.publicationState`? -->
:::note
This parameter can only be used on models with the **Draft & Publish** feature activated
:::

Queries can accept a `publicationState` parameter to fetch entities based on their publication state:

- `live`: returns only published entries (default)
- `preview`: returns both draft entries & published entries

#### Examples

##### Get published articles

:::request Example requests: Get published articles
`GET /api/articles`

or

`GET /api/articles?publicationState=live`
:::

##### Get both published and draft articles

:::request Example request: Get both published and draft articles
`GET /api/articles?publicationState=preview`
:::

:::note
If you only want to retrieve your draft entries, you can combine the `preview` mode and the `published_at` field.
`GET /api/articles?publicationState=preview&published_at_null=true`
:::

### Locale

If the [Internationalization (i18n) plugin](/developer-docs/latest/development/plugins/i18n.md) is installed and [localization is enabled for the content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type), the `locale` API parameter can be used to [get entities from a specific locale](/developer-docs/latest/development/plugins/i18n.md#getting-localized-entities-with-the-locale-parameter).
