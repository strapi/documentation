---
sidebarDepth: 3
---

# Content API

## API Endpoints

When you create a `Content Type` you will have a certain number of **REST API endpoints** available to interact with it.

::: warning
Components don't have API endpoints
:::

As an **example**, let's consider the following models:

**Content Types**:

- `Restaurant` (Collection Type)
- `Homepage` (Single Type)

**Components**:

- `Opening hours` (category: `restaurant`)
- `Title With Subtitle` (category: `content`)
- `Image With Description` (category: `content`)

---

:::: tabs

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

::::

### Endpoints

Here is the list of endpoints generated for each of your **Content Types**.

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

:::: tabs

::: tab Collection Type

<div id="endpoint-table">

| Method | Path                    | Description                          |
| :----- | :---------------------- | :----------------------------------- |
| GET    | `/{content-type}`       | Get a list of {content-type} entries |
| GET    | `/{content-type}/:id`   | Get a specific {content-type} entry  |
| GET    | `/{content-type}/count` | Count {content-type} entries         |
| POST   | `/{content-type}`       | Create a {content-type} entry        |
| DELETE | `/{content-type}/:id`   | Delete a {content-type} entry        |
| PUT    | `/{content-type}/:id`   | Update a {content-type} entry        |

</div>

:::

::: tab Single Type

<div id="endpoint-table">

| Method | Path              | Description                       |
| :----- | :---------------- | :-------------------------------- |
| GET    | `/{content-type}` | Get the {content-type} content  |
| PUT    | `/{content-type}` | Update the {content-type} content |
| DELETE | `/{content-type}` | Delete the {content-type} content |

</div>

:::

::::

#### Examples

Here are some Content Type examples

##### Single Types

:::: tabs

::: tab Homepage

`Homepage` **Content Type**

<div id="endpoint-table">

| Method | Path        | Description                 |
| :----- | :---------- | :-------------------------- |
| GET    | `/homepage` | Get the homepage content    |
| PUT    | `/homepage` | Update the homepage content |
| DELETE | `/homepage` | Delete the homepage content |

</div>

:::

::: tab Contact

`Contact` **Content Type**

<div id="endpoint-table">

| Method | Path       | Description                |
| :----- | :--------- | :------------------------- |
| GET    | `/contact` | Get the contact content    |
| PUT    | `/contact` | Update the contact content |
| DELETE | `/contact` | Delete the contact content |

</div>

:::

::::

##### Collection Types

:::: tabs

::: tab Restaurant

`Restaurant` **Content Type**

<div id="endpoint-table">

| Method | Path                 | Description               |
| :----- | :------------------- | :------------------------ |
| GET    | `/restaurants`       | Get a list of restaurants |
| GET    | `/restaurants/:id`   | Get a specific restaurant |
| GET    | `/restaurants/count` | Count restaurants         |
| POST   | `/restaurants`       | Create a restaurant       |
| DELETE | `/restaurants/:id`   | Delete a restaurant       |
| PUT    | `/restaurants/:id`   | Update a restaurant       |

</div>

:::

::: tab Article

`Article` **Content Type**

<div id="endpoint-table">

| Method | Path              | Description            |
| :----- | :---------------- | :--------------------- |
| GET    | `/articles`       | Get a list of articles |
| GET    | `/articles/:id`   | Get a specific article |
| GET    | `/articles/count` | Count articles         |
| POST   | `/articles`       | Create a article       |
| DELETE | `/articles/:id`   | Delete a article       |
| PUT    | `/articles/:id`   | Update a article       |

</div>

:::

::: tab Product

`Product` **Content Type**

<div id="endpoint-table">

| Method | Path              | Description            |
| :----- | :---------------- | :--------------------- |
| GET    | `/products`       | Get a list of products |
| GET    | `/products/:id`   | Get a specific product |
| GET    | `/products/count` | Count products         |
| POST   | `/products`       | Create a product       |
| DELETE | `/products/:id`   | Delete a product       |
| PUT    | `/products/:id`   | Update a product       |

</div>

:::

::: tab Category

`Category` **Content Type**

<div id="endpoint-table">

| Method | Path                | Description              |
| :----- | :------------------ | :----------------------- |
| GET    | `/categories`       | Get a list of categories |
| GET    | `/categories/:id`   | Get a specific category  |
| GET    | `/categories/count` | Count categories         |
| POST   | `/categories`       | Create a category        |
| DELETE | `/categories/:id`   | Delete a category        |
| PUT    | `/categories/:id`   | Update a category        |

</div>

:::

::: tab Tag

`Tag` **Content Type**

<div id="endpoint-table">

| Method | Path          | Description        |
| :----- | :------------ | :----------------- |
| GET    | `/tags`       | Get a list of tags |
| GET    | `/tags/:id`   | Get a specific tag |
| GET    | `/tags/count` | Count tags         |
| POST   | `/tags`       | Create a tag       |
| DELETE | `/tags/:id`   | Delete a tag       |
| PUT    | `/tags/:id`   | Update a tag       |

</div>

:::

::::

### Get entries

Returns entries matching the query filters. You can read more about parameters [here](#api-parameters).

:::: tabs

::: tab Request

**Example request**

```js
GET http://localhost:1337/restaurants
```

:::

::: tab Response

**Example response**

```json
[
  {
    "id": 1,
    "name": "Restaurant 1",
    "cover": {
      "id": 1,
      "name": "image.png",
      "hash": "123456712DHZAUD81UDZQDAZ",
      "sha256": "v",
      "ext": ".png",
      "mime": "image/png",
      "size": 122.95,
      "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
      "provider": "local",
      "provider_metadata": null,
      "created_at": "2019-12-09T00:00:00.000Z",
      "updated_at": "2019-12-09T00:00:00.000Z"
    },
    "content": [
      {
        "__component": "content.title-with-subtitle",
        "id": 1,
        "title": "Restaurant 1 title",
        "subTitle": "Cozy restaurant in the valley"
      },
      {
        "__component": "content.image-with-description",
        "id": 1,
        "image": {
          "id": 1,
          "name": "image.png",
          "hash": "123456712DHZAUD81UDZQDAZ",
          "sha256": "v",
          "ext": ".png",
          "mime": "image/png",
          "size": 122.95,
          "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
          "provider": "local",
          "provider_metadata": null,
          "created_at": "2019-12-09T00:00:00.000Z",
          "updated_at": "2019-12-09T00:00:00.000Z"
        },
        "title": "Amazing photography",
        "description": "This is an amazing photography taken..."
      }
    ],
    "opening_hours": [
      {
        "id": 1,
        "day_interval": "Tue - Sat",
        "opening_hour": "7:30 PM",
        "closing_hour": "10:00 PM"
      }
    ]
  }
]
```

:::

::::

### Get an entry

Returns an entry by id.

:::: tabs

::: tab Request

**Example request**

```js
GET http://localhost:1337/restaurants/1
```

:::

::: tab Response

**Example response**

```json
{
  "id": 1,
  "title": "Restaurant 1",
  "cover": {
    "id": 1,
    "name": "image.png",
    "hash": "123456712DHZAUD81UDZQDAZ",
    "sha256": "v",
    "ext": ".png",
    "mime": "image/png",
    "size": 122.95,
    "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2019-12-09T00:00:00.000Z",
    "updated_at": "2019-12-09T00:00:00.000Z"
  },
  "content": [
    {
      "__component": "content.title-with-subtitle",
      "id": 1,
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "id": 1,
      "image": {
        "id": 1,
        "name": "image.png",
        "hash": "123456712DHZAUD81UDZQDAZ",
        "sha256": "v",
        "ext": ".png",
        "mime": "image/png",
        "size": 122.95,
        "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
        "provider": "local",
        "provider_metadata": null,
        "created_at": "2019-12-09T00:00:00.000Z",
        "updated_at": "2019-12-09T00:00:00.000Z"
      },
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      "id": 1,
      "day_interval": "Tue - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::::

### Count entries

Returns the count of entries matching the query filters. You can read more about parameters [here](#api-parameters).

:::: tabs

::: tab Request

**Example request**

```js
GET http://localhost:1337/restaurants/count
```

:::

::: tab Response

**Example response**

```
1
```

:::

::::

### Create an entry

Creates an entry and returns its value.

:::: tabs

::: tab Request

**Example request**

```js
POST http://localhost:1337/restaurants
```

```json
{
  "title": "Restaurant 1",
  "cover": 1,
  "content": [
    {
      "__component": "content.title-with-subtitle",
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "image": 1, // user form data to upload the file or an id to reference an exisiting image
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      "day_interval": "Tue - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::: tab Response

**Example response**

```json
{
  "id": 1,
  "title": "restaurant 1",
  "cover": {
    "id": 1,
    "name": "image.png",
    "hash": "123456712DHZAUD81UDZQDAZ",
    "sha256": "v",
    "ext": ".png",
    "mime": "image/png",
    "size": 122.95,
    "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2019-12-09T00:00:00.000Z",
    "updated_at": "2019-12-09T00:00:00.000Z"
  },
  "content": [
    {
      "__component": "content.title-with-subtitle",
      "id": 1,
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "id": 1,
      "image": {
        "id": 1,
        "name": "image.png",
        "hash": "123456712DHZAUD81UDZQDAZ",
        "sha256": "v",
        "ext": ".png",
        "mime": "image/png",
        "size": 122.95,
        "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
        "provider": "local",
        "provider_metadata": null,
        "created_at": "2019-12-09T00:00:00.000Z",
        "updated_at": "2019-12-09T00:00:00.000Z"
      },
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      "id": 1,
      "day_interval": "Tue - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::::

### Update an entry

Partially updates an entry by id and returns its value.
Fields that aren't sent in the query are not changed in the db. Send a `null` value if you want to clear them.

:::: tabs

::: tab Request

**Example request**

```js
PUT http://localhost:1337/restaurants/1
```

```json
{
  "title": "Restaurant 1",
  "content": [
    {
      "__component": "content.title-with-subtitle",
      // editing one of the previous item by passing its id
      "id": 2,
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "image": 1, // user form data to upload the file or an id to reference an exisiting image
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      // adding a new item
      "day_interval": "Sun",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    },
    {
      // editing one of the previous item by passing its id
      "id": 1,
      "day_interval": "Mon - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::: tab Response

**Example response**

```json
{
  "id": 1,
  "title": "Restaurant 1",
  "cover": {
    "id": 1,
    "name": "image.png",
    "hash": "123456712DHZAUD81UDZQDAZ",
    "sha256": "v",
    "ext": ".png",
    "mime": "image/png",
    "size": 122.95,
    "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2019-12-09T00:00:00.000Z",
    "updated_at": "2019-12-09T00:00:00.000Z"
  },
  "content": [
    {
      "__component": "content.title-with-subtitle",
      "id": 1,
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "id": 2,
      "image": {
        "id": 1,
        "name": "image.png",
        "hash": "123456712DHZAUD81UDZQDAZ",
        "sha256": "v",
        "ext": ".png",
        "mime": "image/png",
        "size": 122.95,
        "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
        "provider": "local",
        "provider_metadata": null,
        "created_at": "2019-12-09T00:00:00.000Z",
        "updated_at": "2019-12-09T00:00:00.000Z"
      },
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      "id": 1,
      "day_interval": "Mon - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    },
    {
      "id": 2,
      "day_interval": "Sun",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::::

### Delete an entry

Deletes an entry by id and returns its value.

:::: tabs

::: tab Request

**Example request**

```js
DELETE http://localhost:1337/restaurants/1
```

:::

::: tab Response

**Example response**

```json
{
  "id": 1,
  "title": "Restaurant 1",
  "cover": {
    "id": 1,
    "name": "image.png",
    "hash": "123456712DHZAUD81UDZQDAZ",
    "sha256": "v",
    "ext": ".png",
    "mime": "image/png",
    "size": 122.95,
    "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2019-12-09T00:00:00.000Z",
    "updated_at": "2019-12-09T00:00:00.000Z"
  },
  "content": [
    {
      "__component": "content.title-with-subtitle",
      "id": 1,
      "title": "Restaurant 1 title",
      "subTitle": "Cozy restaurant in the valley"
    },
    {
      "__component": "content.image-with-description",
      "id": 2,
      "image": {
        "id": 1,
        "name": "image.png",
        "hash": "123456712DHZAUD81UDZQDAZ",
        "sha256": "v",
        "ext": ".png",
        "mime": "image/png",
        "size": 122.95,
        "url": "http://localhost:1337/uploads/123456712DHZAUD81UDZQDAZ.png",
        "provider": "local",
        "provider_metadata": null,
        "created_at": "2019-12-09T00:00:00.000Z",
        "updated_at": "2019-12-09T00:00:00.000Z"
      },
      "title": "Amazing photography",
      "description": "This is an amazing photography taken..."
    }
  ],
  "opening_hours": [
    {
      "id": 1,
      "day_interval": "Mon - Sat",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    },
    {
      "id": 2,
      "day_interval": "Sun",
      "opening_hour": "7:30 PM",
      "closing_hour": "10:00 PM"
    }
  ]
}
```

:::

::::


## API Parameters

<!-- See the [parameter concepts](../concepts/parameters.md) for details. -->
<!-- The links in comments lines 810 and 818 are broken, so this file was to the checklinksIgnoredFiles in config.js to prevent false positives when checking for broken links-->

::: warning
By default, the filters can only be used from `find` and `count` endpoints generated by the Content Type Builder and the [CLI](../cli/CLI.md).
:::

<!-- This sentance belongs in the above warning block but was removed and commented until new docs can be written -->
<!-- If you need to implement a filter system somewhere else, read the [programmatic usage](../concepts/parameters.md) section. -->

### Available operators

The available operators are separated in five different categories:

- [Filters](#filters)
- [Sort](#sort)
- [Limit](#limit)
- [Start](#start)
- [Publication State](#publication-state)

### Filters

When using filters you can either pass simple filters in the root of the query parameters or pass them in a `_where` parameter.

Filters are used as a suffix of a field name:

| Filter            | Description                     |
| :---------------- | :------------------------------ |
| No suffix or `eq` | Equal                           |
| `ne`              | Not equal                       |
| `lt`              | Less than                       |
| `gt`              | Greater than                    |
| `lte`             | Less than or equal to           |
| `gte`             | Greater than or equal to        |
| `in`              | Included in an array            |
| `nin`             | Not included in an array        |
| `contains`        | Contains                        |
| `ncontains`       | Doesn't contain                 |
| `containss`       | Contains, case sensitive        |
| `ncontainss`      | Doesn't contain, case sensitive |
| `null`            | Is null or not null             |

#### Examples

##### Find users having `John` as first name.

`GET /users?firstName=John`
or
`GET /users?firstName_eq=John`

##### Find restaurants having a price equal or greater than `3`.

`GET /restaurants?price_gte=3`

##### Find multiple restaurant with id 3, 6, 8.

`GET /restaurants?id_in=3&id_in=6&id_in=8`

##### Using `_where`

`GET /restaurants?_where[price_gte]=3`

`GET /restaurants?_where[0][price_gte]=3&[0][price_lte]=7`

### Complex queries

::: tip NOTE
`OR` and `AND` operations are available starting from v3.1.0
:::

When building more complex queries you must use the `_where` query parameter in combination with the [`qs`](https://github.com/ljharb/qs) library.

We are taking advantage of the capability of `qs` to parse nested objects to create more complex queries.

This will give you full power to create complex queries with logical `AND` and `OR` operations.

::: tip NOTE
We strongly recommend using `qs` directly to generate complex queries instead of creating them manually.
:::

#### `AND` operator

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

#### `OR` operator

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

#### Implicit `OR` operator

The query engine implicitly uses the `OR` operation when you pass an array of values in an expression.

**Examples**

Restaurants that have 1 or 2 `stars`:

`GET /restaurants?stars=1&stars=2`

or

```js
const query = qs.stringify({ _where: { stars: [1, 2] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[stars][0]=1&_where[stars][1]=2
```

::: tip NOTE
When using the `in` and `nin` filters the array is not transformed into a OR.
:::

#### Combining AND and OR operators

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

::: warning
When creating nested queries, make sure the depth is less than 20 or the query string parsing will fail for now.
:::

### Deep filtering

Find restaurants owned by a chef who belongs to a restaurant with star equal to 5
`GET /restaurants?chef.restaurant.star=5`

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

::: warning
This feature isn't available for **polymorphic** relations. This relation type is used in `media`, `component` and `dynamic zone` fields.
:::

### Sort

Sort according to a specific field.

#### Example

##### Sort users by email.

- ASC: `GET /users?_sort=email:ASC`
- DESC: `GET /users?_sort=email:DESC`

##### Sorting on multiple fields

- `GET /users?_sort=email:asc,dateField:desc`
- `GET /users?_sort=email:DESC,username:ASC`

### Limit

Limit the size of the returned results.

The default limit is `100`

#### Example

##### Limit the result length to 30.

`GET /users?_limit=30`

You can require the full data set by passing a limit equal to `-1`.

### Start

Skip a specific number of entries (especially useful for pagination).

#### Example

##### Get the second page of results.

`GET /users?_start=10&_limit=10`

### Publication State

::: tip NOTE
This parameter can only be used on models with the **Draft & Publish** feature activated
:::

Only select entries matching the publication state provided.

Handled states are:

- `live`: Return only published entries (default)
- `preview`: Return both draft entries & published entries

#### Example

##### Get published articles

`GET /articles`
OR
`GET /articles?_publicationState=live`

##### Get both published and draft articles

`GET /articles?_publicationState=preview`

::: tip NOTE
If you only want to retrieve your draft entries, you can combine the `preview` mode and the `published_at` field.
`GET /articles?_publicationState=preview&published_at_null=true`
:::
