---
title: GraphQL API - Strapi Developer Documentation
description: Use a GraphQL endpoint in your Strapi project to fetch and mutate your content.
sidebarDepth: 3
---
<!-- TODO: update SEO -->

# GraphQL API

::: strapi GraphQL plugin required
To use the GraphQL API, install the [GraphQL](/developer-docs/latest/plugins/graphql.md) plugin.
:::

## Unified response format

Whatever the query, the response can contain the following fields:

- `data`: the response data itself, which could be:
  - a single entry, as an object with the following keys:
    - `id` (string|number)
    - `attributes` (object)
    - `meta` (object)
  - a list of entries, as an array of objects,
  - or a custom response

- `meta`(object): information about pagination, publication state, available locales…
<!-- TODO: create an entry in the docs to list all errors -->

## Queries

We assume that the [Shadow CRUD](/developer-docs/latest/plugins/graphql.md#shadow-crud) feature is enabled. For each model, the GraphQL plugin auto-generates queries and mutations that mimics basic CRUD operations (findMany, findOne, create, update, delete).

### Fetch a single entry

Single entries can be found by their `id`.

:::request Example query: Find the entry with id 1
```graphql
query {
  document(id: 1) {
    data {
      id
      attributes {
        title
        categories {
          data {
            id
            attributes {
              name
            }
          }
        }
      }
    }
  }
}

```

:::

### Fetch multiple entries

:::request Example query: Find all documents and populate 'categories' relation with the `name` attribute

```graphql
query {
  documents {
    data {
      id
      attributes {
        title
        categories {
          data {
            id
            attributes {
                name
            }
          }
        }
      }
    }
    meta {
      pagination {
        page
        pageSize
        total
        pageCount
      }
    }
  }
}

```

:::

<!-- ? is this part 👇 still relevant? -->
### Fetch dynamic zone data

Dynamic zones are union types in graphql so you need to use fragments to query the fields.

:::request Query
```graphql
query {
  restaurants {
    data {
      attributes {
        dynamiczone {
          __typename
          ...on ComponentDefaultClosingperiod {
            label
          }
        }
      }
    }
  }
}
```
:::

## Mutations

### Create a new entry

:::request Mutation

```graphql
mutation createArticle {
  createArticle(data: { title: "Hello"}) {
    data {
      id
      attributes {
        title
      }
    }
  }
}
```

:::

The implementation of the mutations also supports relational attributes. For example, you can create a new `User` and attach many `Restaurant` to it by writing your query like this:

:::request Mutation

```graphql
mutation {
  createUser(
    data: {
      username: "John"
      email: "john@doe.com"
      restaurants: ["1", "2"]
    }
  ) {
    data {
      id
      attributes {
        username
        email
        restaurants {
          data {
            id 
            attributes {
              name
              description
              price
            }
          }
        }
      }
    }
  }
}
```

:::

### Update an existing entry

:::request Mutation

```graphql
mutation updateArticle {
  updateArticle(id: "1", data: { title: "Hello" }) {
    data {
      id
      attributes {
        title
      }
    }
  }
}
```

:::

You can also update relational attributes by passing an ID or an array of IDs (depending on the relationship).

:::request Mutation
```graphql
mutation {
  updateRestaurant(
    id: "5b5b27f8164f75c29c728110"
    data: {
      chef: "1" // User ID
    }
  }) {
    data {
      id
      attributes {
        chef {
          data {
            attributes {
              username
              email
            }
          }
        }
      }
    }
  }
}
```
:::

### Delete an entry

:::request Mutation

```graphql
mutation deleteArticle {
  deleteArticle(id: 1) {
    data {
      id
      attributes {
        title
      }
    }
  }
}
```

:::

## Filters

Queries can accept a `filters` parameter with the following syntax:

`filters: { field: { operator: value } }`

Logical operators (`and`, `or`, `not`) can also be used and accept arrays of objects.

The following operators are available:

| Operator       | Description                        |
| -------------- | ---------------------------------- |
| `eq`           | Equal                              |
| `ne`           | Not equal                          |
| `lt`           | Less than                          |
| `lte`          | Less than or equal to              |
| `gt`           | Greater than                       |
| `gte`          | Greater than or equal to           |
| `in`           | Included in an array               |
| `notIn`        | Not included in an array           |
| `contains`     | Contains, case sensitive           |
| `notContains`  | Does not contain, case sensitive   |
| `containsi`    | Contains, case insensitive         |
| `notContainsi` | Does not contain, case insensitive |
| `null`         | Is null                            |
| `notNull`      | Is null                            |
| `between`      | Is between                         |
| `startsWith`   | Starts with                        |
| `endsWith`     | Ends with                          |
| `and`          | Logical `and`                      |
| `or`           | Logical `or`                       |
| `not`          | Logical `not`                      |

::: request Example query with filters

```graphql
{
  documents(filters: { name: { eq: "test" }, or: [{ price: { gt: 10 }}, { title: { startsWith: "Book" }}] }) {
    data {
      id
    }
  }
}
```

:::

## Sorting

Queries can accept a `sort` parameter with the following syntax:

- to sort based on a single value: `sort: "value"` 
- to sort based on multiple values: `sort: ["value1", "value2"]`

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).

::: request Example request: Sorting on title by ascending order

```graphql
{
  documents(sort: "title") {
    data {
      id
    }
  }
}
```

:::

::: request Example request: Sorting on title by descending order

```graphql
{
  documents(sort: "title:desc") {
    data {
      id
    }
  }
}
```

:::

::: request Example request: Sorting on title by ascending order, then on price by descending order

```graphql
{
  documents(sort: ["title:asc", "price:desc"]) {
    data {
      id
    }
  }
}
```

:::

## Pagination

Queries can accept a `pagination` parameter. Results can be paginated either by page or by offset.

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` **or** `start` with `limit`.
:::

### Pagination by page

| Parameter              | Description | Default |
| ---------------------- | ----------- | ------- |
| `pagination[page]`     | Page number | 1       |
| `pagination[pageSize]` | Page size   | 10      |

::: request Example query: Pagination by page

```graphql
{
  documents(pagination: { page: 1, pageSize: 10 }) {
    data {
      id
    }
    meta {
      pagination {
        page
        pageSize
        pageCount
        total
      }
    }
  }
}
```

:::

### Pagination by offset

| Parameter           | Description                  | Default | Maximum |
| ------------------- | ---------------------------- | ------- | ------- |
| `pagination[start]` | Start value                  | 0       | -       |
| `pagination[limit]` | Number of entities to return | 10      | -1      |

::: request Example query: Pagination by offset

```graphql
{
  documents(pagination: { start: 20, limit: 30 }) {
    data {
      id
    }
    meta {
      pagination {
        start
        limit
      }
    }
  }
}
```

:::

::: tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/plugins.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) file with the `graphql.config.defaultLimit` and `graphql.config.maxLimit` keys.
:::
<!-- TODO: update this comment: the link above won't work until the content is merged with the `dev/v4-split-configuration-docs-files` branch  -->
