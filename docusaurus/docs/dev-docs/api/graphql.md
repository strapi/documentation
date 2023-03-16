---
title: GraphQL API
displayed_sidebar: devDocsSidebar
---

# GraphQL API

:::prerequisites
To use the GraphQL API, install the [GraphQL](/dev-docs/plugins/graphql.md) plugin.
:::

The GraphQL API allows performing queries and mutations to interact with the [content-types](/dev-docs/backend-customization/models#content-types) through Strapi's [GraphQL plugin](/dev-docs/plugins/graphql.md). Results can be [filtered](#filters), [sorted](#sorting) and [paginated](#pagination).

## Unified response format

Responses are unified with the GraphQL API in that:

- queries and mutations that return information for a single entry mainly use a `XxxEntityResponse` type
- queries and mutations that return i️nformation for multiple entries mainly use a `XxxEntityResponseCollection` type, which includes `meta` information (with [pagination](#pagination)) in addition to the data itself

Responses can also include an `error` (see [error handling documentation](/dev-docs/error-handling.md)).


```graphql title="Example: Response formats for queries and mutations with an example 'Article' content-type"
type ArticleEntityResponse {
    data: ArticleEntity
}

type ArticleEntityResponseCollection {
    data: [ArticleEntityResponse!]!
    meta: ResponseCollectionMeta!
}

query {
    article(...): ArticleEntityResponse # find one
    articles(...): ArticleEntityResponseCollection # find many
}

mutation {
    createArticle(...): ArticleEntityResponse # create
    updateArticle(...): ArticleEntityResponse # update
    deleteArticle(...): ArticleEntityResponse # delete
}
```

## Queries

Queries in GraphQL are used to fetch data without modifying it.

We assume that the [Shadow CRUD](/dev-docs/plugins/graphql#shadow-crud) feature is enabled. For each model, the GraphQL plugin auto-generates queries and mutations that mimics basic CRUD operations (findMany, findOne, create, update, delete).

### Fetch a single entry

Single entries can be found by their `id`.


```graphql title="Example query: Find the entry with id 1"
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

### Fetch multiple entries

```graphql title="Example query: Find all documents and populate 'categories' relation with the 'name' attribute"
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

### Fetch dynamic zone data

Dynamic zones are union types in graphql so you need to use fragments to query the fields.

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

## Mutations

Mutations in GraphQL are used to modify data (e.g. create, update, delete data).

### Create a new entry

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

The implementation of the mutations also supports relational attributes. For example, you can create a new `User` and attach many `Restaurant` to it by writing your query like this:

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

### Update an existing entry

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

You can also update relational attributes by passing an ID or an array of IDs (depending on the relationship).

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

### Delete an entry

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
| `notNull`      | Is not null                        |
| `between`      | Is between                         |
| `startsWith`   | Starts with                        |
| `endsWith`     | Ends with                          |
| `and`          | Logical `and`                      |
| `or`           | Logical `or`                       |
| `not`          | Logical `not`                      |


```graphql title="Example query with filters"
{
  documents(filters: { name: { eq: "test" }, or: [{ price: { gt: 10 }}, { title: { startsWith: "Book" }}] }) {
    data {
      id
    }
  }
}
```

## Sorting

Queries can accept a `sort` parameter with the following syntax:

- to sort based on a single value: `sort: "value"` 
- to sort based on multiple values: `sort: ["value1", "value2"]`

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).

```graphql title="Example request: Sorting on title by ascending order"
{
  documents(sort: "title") {
    data {
      id
    }
  }
}
```

```graphql title="Example request: Sorting on title by descending order"
{
  documents(sort: "title:desc") {
    data {
      id
    }
  }
}
```

```graphql title="Example request: Sorting on title by ascending order, then on price by descending order"
{
  documents(sort: ["title:asc", "price:desc"]) {
    data {
      id
    }
  }
}
```

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

```graphql title="Example query: Pagination by page"
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

### Pagination by offset

| Parameter           | Description                  | Default | Maximum |
| ------------------- | ---------------------------- | ------- | ------- |
| `pagination[start]` | Start value                  | 0       | -       |
| `pagination[limit]` | Number of entities to return | 10      | -1      |

```graphql title="Example query: Pagination by offset"
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

:::tip
The default and maximum values for `pagination[limit]` can be [configured in the `./config/plugins.js`](/dev-docs/configurations/plugins#graphql-configuration) file with the `graphql.config.defaultLimit` and `graphql.config.maxLimit` keys.
:::
