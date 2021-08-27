---
title: Content API - Strapi Developer Documentation
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
sidebarDepth: 3
---

# Content API

## API Endpoints

Creating a Content-Type automatically create some **REST API endpoints** available to interact with it.

:::note
[Components](/developer-docs/latest/development/backend-customization.md#component-s-models) don't have API endpoints.
:::

<!-- ? is this part still useful? commenting it out because I don't see the point in it 🤷  -->
<!-- As an **example**, let's consider the following models:

**Content Types**:

- `Restaurant` (Collection Type)
- `Homepage` (Single Type)

**Components**:

- `Opening hours` (category: `restaurant`)
- `Title With Subtitle` (category: `content`)
- `Image With Description` (category: `content`)

---

:::: tabs card

::: tab Content Types

#### `Restaurant` Content Type

| Fields        | Type        | Description                          | Options              |
| :------------ | :---------- | :----------------------------------- | :------------------- |
| name          | string      | Restaurant's title                   |                      |
| slug          | uid         | Restaurant's slug                    | `targetField="name"` |
| cover         | media       | Restaurant's cover image             |                      |
| content       | dynamiczone | The restaurant profile content       |                      |
| opening_hours | component   | Restaurant's opening hours component | `repeatable`         |

---

#### `Homepage` Content Type

| Fields   | Type        | Description        | Options |
| :------- | :---------- | :----------------- | :------ |
| title    | string      | Homepage title     |         |
| subTitle | string      | Homepage sub title |         |
| content  | dynamiczone | Homepage content   |         |

:::

::: tab Components

#### `Opening hours` Component

| Fields       | Type   | Description         |
| :----------- | :----- | :------------------ |
| day_interval | string | Meta's day interval |
| opening_hour | string | Meta's opening hour |
| closing_hour | string | Meta's closing hour |

---

#### `Title With Subtitle` Component

| Fields   | Type   | Description   |
| :------- | :----- | :------------ |
| title    | string | The title     |
| subTitle | string | The sub title |

---

#### `Image With Description` Component

| Fields      | Type   | Description           |
| :---------- | :----- | :-------------------- |
| image       | media  | The image file        |
| title       | string | The image title       |
| description | text   | The image description |

:::

:::: -->

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
<!-- TODO add heading to migration plan: entry → entity -->

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
<!-- TODO add heading to migration plan: entry → entity -->

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
<!-- TODO add heading to migration plan: entry → entity -->

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
<!-- TODO add heading to migration plan: entry → entity -->

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
<!-- TODO add heading to migration plan: entry → entity -->

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
| `$between`    | Is between                       |

#### Examples

##### Find users having `John` as first name.

:::request Example request: Find users having 'John' as first name
`GET /api/users?filters[firstName][$eq]=John`
:::

##### Find restaurants having a price equal or greater than `3`

:::request Example request: Find restaurants having a price equal or greater than `3`
`GET /api/restaurants?filters[price][$gte]=3`
:::

##### Find multiple restaurant with id 3, 6, 8

:::request Example request: Find multiple restaurant with id 3, 6, 8
<!-- ? is it the correct syntax? this is what qs.stringify() returned but I'd have expected filters[id][$in][3,6,8] -->
`GET /api/restaurants?filters[id][$in][0]=3&filters[id][$in][1]=6&filters[id][$in][2]=8`
:::

<!-- TODO: check if it's relevant to remove this part commented out below -->
<!-- ##### Using `_where`

:::request Example requests: Using the _where filter
`GET /restaurants?filters[price][$gte] = 3'`

`GET /restaurants?_where[0][price_gte]=3&[0][price_lte]=7`
::: -->

#### Complex queries

<!-- TODO: review this whole part with a dev -->
<!-- ? can we still use `where`? -->
<!-- ? any update to deep filtering? -->

:::note
`OR` and `AND` operations are available starting from v3.1.0
:::

When building more complex queries you must use the `_where` query parameter in combination with the [`qs`](https://github.com/ljharb/qs) library.

We are taking advantage of the capability of `qs` to parse nested objects to create more complex queries.

This will give you full power to create complex queries with logical `AND` and `OR` operations.

:::caution
We strongly recommend using `qs` directly to generate complex queries instead of creating them manually.
:::

##### `AND` operator

The filtering implicitly supports the `AND` operation when specifying an array of expressions in the filtering.

**Examples**

Restaurants that have 1 `stars` and a `pricing` less than or equal to 20:

```js
const query = qs.stringify({
  _where: [{ stars: 1 }, { pricing_lte: 20 }],
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[0][stars]=1&_where[1][pricing_lte]=20
```

Restaurants that have a `pricing` greater than or equal to 20 and a `pricing` less than or equal to 50:

```js
const query = qs.stringify({
  _where: [{ pricing_gte: 20 }, { pricing_lte: 50 }],
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[0][pricing_gte]=20&_where[1][pricing_lte]=50
```

##### `OR` operator

To use the `OR` operation, you will need to use the `_or` filter and specify an array of expressions on which to perform the operation.

**Examples**

Restaurants that have 1 `stars` OR a `pricing` greater than 30:

```js
const query = qs.stringify({ _where: { _or: [{ stars: 1 }, { pricing_gt: 30 }] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[_or][0][stars]=1&_where[_or][1][pricing_gt]=30
```

Restaurants that have a `pricing` less than 10 OR greater than 30:

```js
const query = qs.stringify({ _where: { _or: [{ pricing_lt: 10 }, { pricing_gt: 30 }] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[_or][0][pricing_lt]=10&_where[_or][1][pricing_gt]=30
```

##### Implicit `OR` operator

The query engine implicitly uses the `OR` operation when you pass an array of values in an expression.

**Examples**

Restaurants that have 1 or 2 `stars`:

:::request Example request: Restaurants that have 1 or 2 `stars`
`GET /restaurants?stars=1&stars=2`
:::

or

```js
const query = qs.stringify({ _where: { stars: [1, 2] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[stars][0]=1&_where[stars][1]=2
```

:::note
When using the `in` and `nin` filters the array is not transformed into a OR.
:::

##### Combining AND and OR operators

Restaurants that have (2 `stars` AND a `pricing` less than 80) OR (1 `stars` AND a `pricing` greater than or equal to 50)

```js
const query = qs.stringify({
  _where: {
    _or: [
      [{ stars: 2 }, { pricing_lt: 80 }], // implicit AND
      [{ stars: 1 }, { pricing_gte: 50 }], // implicit AND
    ],
  },
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[_or][0][0][stars]=2&_where[_or][0][1][pricing_lt]=80&_where[_or][1][0][stars]=1&_where[_or][1][1][pricing_gte]=50
```

**This also works with deep filtering**

Restaurants that have (2 `stars` AND a `pricing` less than 80) OR (1 `stars` AND serves French food)

```js
const query = qs.stringify({
  _where: {
    _or: [
      [{ stars: 2 }, { pricing_lt: 80 }], // implicit AND
      [{ stars: 1 }, { 'categories.name': 'French' }], // implicit AND
    ],
  },
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[_or][0][0][stars]=2&_where[_or][0][1][pricing_lt]=80&_where[_or][1][0][stars]=1&_where[_or][1][1][categories.name]=French
```

:::caution
When creating nested queries, make sure the depth is less than 20 or the query string parsing will fail.
:::

#### Deep filtering


:::request Example request: Find restaurants owned by a chef who belongs to a restaurant with star equal to 5
`GET /restaurants?chef.restaurant.star=5`
:::

::: warning
Querying your API with deep filters may cause performance issues.
If one of your deep filtering queries is too slow, we recommend building a custom route with an optimized version of your query.
:::

::: tip
This feature doesn't allow you to filter nested models, e.g. `Find users and only return their posts older than yesterday`.

To achieve this, there are three options:

- Build a custom route.
- Modify your services.
- Use [GraphQL](/developer-docs/latest/development/plugins/graphql.md#query-api).
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
:::

:::request Example requests: Sort books using an array format

`GET /api/books?sort=title&sort[][author]=name`

`GET /api/books?sort[]=title&sort[][author]=name`

`GET /api/books?sort[0]=title&sort[1][author]=name`
:::

#### Programmatic usage

The [`qs`](https://github.com/ljharb/qs) library can also be used to sort:

```js
qs.stringify({
  sort: 'title,price',
});

// or
qs.stringify({
  sort: ['title', 'price'],
});
```

### Pagination

Queries can accept `pagination` parameters.

Pagination can be performed either by page or by offset. 

:::note
Pagination parameters can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::
#### Pagination by page

Use the following parameters:

  - `pagination[page]`: the page number (default: 1)
  <!-- ? is it 100 or 10 for default page size -->
  - `pagination[pageSize]`: the page size (default: 100)

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

- `pagination[start]`: offset value (default: 0)
- `pagination[limit]`: number of entities to return (limit: 100)

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

<!-- TODO: document -->
### Fields population

<!-- TODO: document -->

### Publication State

:::note
This parameter can only be used on models with the **Draft & Publish** feature activated
:::

Only select entries matching the publication state provided.

Handled states are:

- `live`: Return only published entries (default)
- `preview`: Return both draft entries & published entries

#### Example

##### Get published articles

:::request Example requests: Get published articles
`GET /articles`

or

`GET /articles?_publicationState=live`
:::

##### Get both published and draft articles

:::request Example request: Get both published and draft articles
`GET /articles?_publicationState=preview`
:::

:::note
If you only want to retrieve your draft entries, you can combine the `preview` mode and the `published_at` field.
`GET /articles?_publicationState=preview&published_at_null=true`
:::

### Locale

If the [Internationalization (i18n) plugin](/developer-docs/latest/development/plugins/i18n.md) is installed and [localization is enabled for the content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type), the `locale` API parameter can be used to [get entries from a specific locale](/developer-docs/latest/development/plugins/i18n.md#getting-localized-entries-with-the-locale-parameter).
