---
title: Sort & Pagination for REST API - Strapi Developer Docs
description: Use Strapi's REST API to sort or paginate your data.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html
---

# REST API: Sort & Pagination

The [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) by default does not populate any relations, media fields, components, or dynamic zones. It will return all fields for the model and while populating.

## Sorting

Queries can accept a `sort` parameter that allow sorting on one or multiple fields with the following syntax:

::::api-call
:::request Example request: Populate with Filtering

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['title', 'slug'],
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?sort[0]=title&sort[1]=slug
```

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        "slug": "test-article",
        // ...
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Test Article",
        "slug": "test-article-1",
        // ...
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

:::
::::

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).



::::api-call
:::request Example request: Populate with Filtering

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['title:asc', 'slug:desc'],
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?sort[0]=title%3Aasc&sort[1]=slug%3Adesc
```

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 2,
      "attributes": {
        "title": "Test Article",
        "slug": "test-article-1",
        // ...
      }
    },
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        "slug": "test-article",
        // ...
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

:::
::::

## Pagination

Queries can accept `pagination` parameters. Results can be paginated:

- either by page (i.e. specifying a page number and the number of entries per page)
- or by offset (i.e. specifying how many entries to skip and to return)

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

### Pagination by page

Use the following parameters:

| Parameter               | Type    | Description                                                               | Default |
| ----------------------- | ------- | ------------------------------------------------------------------------- | ------- |
| `pagination[page]`      | Integer | Page number                                                               | 1       |
| `pagination[pageSize]`  | Integer | Page size                                                                 | 25      |
| `pagination[withCount]` | Boolean | Adds the total numbers of entries and the number of pages to the response | True    |

:::: api-call

::: request Example request: Select only 10 entries on page 1

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    page: 1,
    pageSize: 10,
  },
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?pagination[page]=1&pagination[pageSize]=10
```

:::

::: response Example response

```json
{
  "data": [
    // ...
  ],
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

### Pagination by offset

Use the following parameters:

| Parameter               | Type    | Description                                                    | Default |
| ----------------------- | ------- | -------------------------------------------------------------- | ------- |
| `pagination[start]`     | Integer | Start value (first entry to return) value                      | 0       |
| `pagination[limit]`     | Integer | Number of entries to return                                    | 25      |
| `pagination[withCount]` | Boolean | Toggles displaying the total number of entries to the response | `true`  |

::: tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/api.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) file with the `api.rest.defaultLimit` and `api.rest.maxLimit` keys.
:::

:::: api-call

::: request Example request

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    start: 0,
    limit: 10,
  },
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?pagination[start]=0&pagination[limit]=10
```

:::

::: response Example response

```json
{
  "data": [
    // ...
  ],
  "meta": {
    "pagination": {
      "start": 0,
      "limit": 10,
      "total": 42
    }
  }
}
```

:::
::::
