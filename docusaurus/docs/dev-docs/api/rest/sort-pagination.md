---
title: Sort and Pagination
description: Use Strapi's REST API to sort or paginate your data.
sidebar_label: Sort & Pagination
sidebarDepth: 3
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- interactive query builder
- pagination
- pagination by page
- pagination by offset
- REST API
- sort
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: Sort & Pagination

Entries that are returned by queries to the [REST API](/dev-docs/api/rest) can be sorted and paginated.

:::tip

<QsIntroFull />

:::

## Sorting

Queries can accept a `sort` parameter that allows sorting on one or multiple fields with the following syntaxes:

- `GET /api/:pluralApiId?sort=value` to sort on 1 field
- `GET /api/:pluralApiId?sort[0]=value1&sort[1]=value2` to sort on multiple fields (e.g. on 2 fields)

The sorting order can be defined with:

- `:asc` for ascending order (default order, can be omitted)
- or `:desc` for descending order.


### Example: Sort using 2 fields

You can sort by multiple fields by passing fields in a `sort` array.

<br />

<ApiCall>
<Request title="Example request: Sort using 2 fields">

`GET /api/restaurants?sort[0]=Description&sort[1]=Name`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['Description', 'Name'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
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
      // …
    },
    {
      "id": 8,
      "documentId": "flzc8qrarj19ee0luix8knxn",
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
      // …
    },
   // … 
  ],
  "meta": {
    // …
  }
}
```

</Response>
</ApiCall>

### Example: Sort using 2 fields and set the order

Using the `sort` parameter and defining `:asc` or  `:desc` on sorted fields, you can get results sorted in a particular order.

<br />

<ApiCall>
<Request title="Example request: Sort using 2 fields and set the order">

`GET /api/restaurants?sort[0]=Description:asc&sort[1]=Name:desc`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  sort: ['Description:asc', 'Name:desc'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 8,
      "documentId": "flzc8qrarj19ee0luix8knxn",
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
      // …
    },
    {
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
      // …
    },
    // …
  ],
  "meta": {
    // …
  }
}
```

</Response>

</ApiCall>

## Pagination

Queries can accept `pagination` parameters. Results can be paginated:

- either by [page](#pagination-by-page) (i.e., specifying a page number and the number of entries per page)
- or by [offset](#pagination-by-offset) (i.e., specifying how many entries to skip and to return)

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

<ApiCall>
<Request title="Example request: Return only 10 entries on page 1">

`GET /api/articles?pagination[page]=1&pagination[pageSize]=10`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

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

</details>

<Response title="Example response">

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

</Response>
</ApiCall>

### Pagination by offset

To paginate results by offset, use the following parameters:

| Parameter               | Type    | Description                                                    | Default |
| ----------------------- | ------- | -------------------------------------------------------------- | ------- |
| `pagination[start]`     | Integer | Start value (i.e. first entry to return)                      | 0       |
| `pagination[limit]`     | Integer | Number of entries to return                                    | 25      |
| `pagination[withCount]` | Boolean | Toggles displaying the total number of entries to the response | `true`  |

:::tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/api.js`](/dev-docs/configurations/api) file with the `api.rest.defaultLimit` and `api.rest.maxLimit` keys.
:::

<ApiCall>
<Request title="Example request: Return only the first 10 entries using offset">

`GET /api/articles?pagination[start]=0&pagination[limit]=10`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

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

</details>

<Response title="Example response">

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

</Response>
</ApiCall>
