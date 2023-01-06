---
title: Sort & Pagination for REST API - Strapi Developer Docs
description: Use Strapi's REST API to sort or paginate your data.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html
---

# REST API: Sort & Pagination

Entries that are returned by queries to the [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) can be sorted and paginated.

:::: tip

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-intro-full.md)!!!

::::

## Sorting

Queries can accept a `sort` parameter that allows sorting on one or multiple fields with the following syntaxes:

- `GET /api/:pluralApiId?sort=value` to sort on 1 field
- `GET /api/:pluralApiId?sort[0]=value1&sort[1]=value2` to sort on multiple fields (e.g. on 2 fields)

The sorting order can be defined with:

- `:asc` for ascending order (default order, can be omitted)
- or `:desc` for descending order.

::::api-call
:::request Example request: Sort using 2 fields

`GET /api/articles?sort[0]=title&sort[1]=slug`

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

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['title', 'slug'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

:::

::::api-call
:::request Example request: Sort using 2 fields and set the order

`GET /api/articles?sort[0]=title%3Aasc&sort[1]=slug%3Adesc`

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

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['title:asc', 'slug:desc'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

:::

## Pagination

Queries can accept `pagination` parameters. Results can be paginated:

- either by page (i.e. specifying a page number and the number of entries per page)
- or by offset (i.e. specifying how many entries to skip and to return)

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

### Pagination by page

To paginate results by page, use the following parameters:

| Parameter               | Type    | Description                                                               | Default |
| ----------------------- | ------- | ------------------------------------------------------------------------- | ------- |
| `pagination[page]`      | Integer | Page number                                                               | 1       |
| `pagination[pageSize]`  | Integer | Page size                                                                 | 25      |
| `pagination[withCount]` | Boolean | Adds the total numbers of entries and the number of pages to the response | True    |

:::: api-call
::: request Example request: Return only 10 entries on page 1

`GET /api/articles?pagination[page]=1&pagination[pageSize]=10`

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

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    page: 1,
    pageSize: 10,
  },
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

:::

### Pagination by offset

To paginate results by offset, use the following parameters:

| Parameter               | Type    | Description                                                    | Default |
| ----------------------- | ------- | -------------------------------------------------------------- | ------- |
| `pagination[start]`     | Integer | Start value (i.e. first entry to return)                      | 0       |
| `pagination[limit]`     | Integer | Number of entries to return                                    | 25      |
| `pagination[withCount]` | Boolean | Toggles displaying the total number of entries to the response | `true`  |

::: tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/api.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) file with the `api.rest.defaultLimit` and `api.rest.maxLimit` keys.
:::

:::: api-call
::: request Example request: Return only the first 10 entries using offset

`GET /api/articles?pagination[start]=0&pagination[limit]=10`


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

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

```js
const qs = require('qs');
const query = qs.stringify({
  pagination: {
    start: 0,
    limit: 10,
  },
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```
:::
