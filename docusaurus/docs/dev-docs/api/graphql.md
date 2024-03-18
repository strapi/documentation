---
title: GraphQL API
displayed_sidebar: devDocsSidebar
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
const captionStyle = {fontSize: '12px'}
const imgStyle = {width: '100%', margin: '0' }

# GraphQL API

<NotV5 />

:::prerequisites
To use the GraphQL API, install the [GraphQL](/dev-docs/plugins/graphql.md) plugin:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```sh
yarn add @strapi/plugin-graphql
```

</TabItem>
<TabItem value="npm" label="NPM">

```sh
npm install @strapi/plugin-graphql
```

</TabItem>

</Tabs>
:::

The GraphQL API allows performing queries and mutations to interact with the [content-types](/dev-docs/backend-customization/models#content-types) through Strapi's [GraphQL plugin](/dev-docs/plugins/graphql.md). Results can be [filtered](#filters), [sorted](#sorting) and [paginated](#pagination).

## Queries

When a content-type is added to your project, 2 generated GraphQL queries are added to your schema, named after the content-type's singular and plural API IDs, as in the following example:

| Content-type display name | Singular API ID | Plural API ID |
|---------------------------|-----------------|---------------|
| Restaurant                | `restaurant`    | `restaurants` |

<details>
<summary>How to find a content-type's singular and plural API IDs:</summary>

<figure style={imgStyle}>
  <img src="/img/assets/apis/singular-and-plural-api-ids.png" alt="Screenshot of Content-Type Builder showing how to find the singular and plural API IDs for a content-type" />
  <em><figcaption style={captionStyle}>Singular and plural API IDs for a content-type are, by default, derived from its display name and can be found in the <a href="/user-docs/content-type-builder/creating-new-content-type">Content-Type Builder</a> when creating or editing a content-type. You can define custom API IDs while creating the content-type, but these can not modified afterwards.</figcaption></em>
</figure>

</details>

### Fetch a single entry

Documents <DocumentDefinition/> can be fetched by their `documentId`.

```graphql title="Example query: Find a restaurant with its documentId"
{
  restaurant(documentId: "a1b2c3d4e5d6f7g8h9i0jkl") {
    name
    description
  }
}
```

### Fetch multiple entries

To fetch multiple entries you can use simple flat queries or [Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries:

<Tabs groupId="simple-relay">

<Tab value="simple" label="Simple queries">

To fetch multiple entries you can use simple queries like the following:

```graphql title="Example query: Find all restaurants"
restaurants {
  documentId
  title
}
```

</Tab>

<Tab value="flat" label="Relay-style queries">

Relay-style queries can be used to fetch multiple entries and return meta information:

```graphql title="Example query: Find all restaurants"
{
  restaurants_connection {
    nodes {
      documentId
      name
    }
    pageInfo {
      pageSize
      page
      pageCount
      total
    }
  }
}
```

</Tab>

</Tabs>


### Fetch dynamic zone data

Dynamic zones are union types in graphql so you need to use fragments to query the fields.

```graphql
{
  restaurants {
    dynamiczone {
      __typename
      ...on ComponentDefaultClosingperiod {
        label
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
  createArticle({ title: "Hello"}) {
    documentId
    title
  }
}
```

The implementation of the mutations also supports relational attributes. For example, you can create a new `User` and attach many `Restaurant` to it by writing your query like this:

```graphql
mutation {
  createUser(
    username: "John"
    email: "john@doe.com"
    restaurants: ["a1b2c3d4e5d6f7g8h9i0jkl", "m9n8o7p6q5r4s3t2u1v0wxyz"]
  ) {
  documentId
  username
  email
  restaurants {
    documentId 
    name
    description
    price
  }
}
```

### Update an existing entry

```graphql
mutation updateArticle {
  updateArticle(documentId: "a1b2c3d4e5d6f7g8h9i0jkl", { title: "Hello" }) {
    documentId
    title
  }
}
```

You can also update relational attributes by passing an ID or an array of IDs (depending on the relationship).

```graphql
mutation {
  updateRestaurant(
    documentId: "a1b2c3d4e5d6f7g8h9i0jkl"
    chef: "m9n8o7p6q5r4s3t2u1v0wxyz1" // User ID
  }) {
  id
  chef {
    username
    email
  }
}
```

### Delete an entry

```graphql
mutation deleteArticle {
  deleteArticle(documentId: a1b2c3d4e5d6f7g8h9i0jkl) {
    documentId
    title
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
    documentId
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
    documentId
  }
}
```

```graphql title="Example request: Sorting on title by descending order"
{
  documents(sort: "title:desc") {
    documentId
  }
}
```

```graphql title="Example request: Sorting on title by ascending order, then on price by descending order"
{
  documents(sort: ["title:asc", "price:desc"]) {
    documentId
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
    documentId
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
    documentId
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
