### Sorting

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
