---
title: GraphQL API
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- documentId
- filters
- GraphQL
- mutation
- pagination
- pagination by offset
- pagination by page
- plural API ID
- sort
---

import DeepFilteringBlogLink from '/docs/snippets/deep-filtering-blog.md'

# GraphQL API

The GraphQL API allows performing queries and mutations to interact with the [content-types](/cms/backend-customization/models#content-types) through Strapi's [GraphQL plugin](/cms/plugins/graphql). Results can be [filtered](#filters), [sorted](#sorting) and [paginated](#pagination).

:::prerequisites
To use the GraphQL API, install the [GraphQL](/cms/plugins/graphql) plugin:

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

Once installed, the GraphQL playground is accessible at the `/graphql` URL and can be used to interactively build your queries and mutations and read documentation tailored to your content-types:

<ThemedImage
  alt="GraphQL playground use example"
  sources={{
    light:'/img/assets/apis/use-graphql-playground.gif',
    dark:'/img/assets/apis/use-graphql-playground_DARK.gif',
  }}
/>

<br/>

The GraphQL plugin exposes only one endpoint that handles all queries and mutations. The default endpoint is `/graphql` and is defined in the [plugins configuration file](/cms/plugins/graphql#code-based-configuration):

```js title="/config/plugins.js|ts"
  export default {
    shadowCRUD: true,
    endpoint: '/graphql', // <— single GraphQL endpoint
    subscriptions: false,
    maxLimit: -1,
    apolloServer: {},
    v4CompatibilityMode: process.env.STRAPI_GRAPHQL_V4_COMPATIBILITY_MODE ?? false,
  };
```

:::note No GraphQL API to upload media files
The GraphQL API does not support media upload. Use the [REST API `POST /upload` endpoint](/cms/api/rest/upload) for all file uploads and use the returned info to link to it in content types. You can still update or delete uploaded files with the `updateUploadFile` and `deleteUploadFile` mutations using media files `id` (see [mutations on media files](#mutations-on-media-files)).
:::

:::caution `documentId` only
The GraphQL API exposes documents using only the `documentId` field. The previous numeric `id` is no longer available here, although it is still returned by the REST API for backward compatibility (see [breaking change](/cms/migration/v4-to-v5/breaking-changes/use-document-id) for details).
:::

## Queries

Queries in GraphQL are used to fetch data without modifying it.

When a content-type is added to your project, 2 automatically generated GraphQL queries are added to your schema, named after the content-type's singular and plural API IDs, as in the following example:

| Content-type display name | Singular API ID | Plural API ID |
|---------------------------|-----------------|---------------|
| Restaurant                | `restaurant`    | `restaurants` |

<details>
<summary>Singular API ID vs. Plural API ID:</summary>

Singular API ID and Plural API ID values are defined when creating a content-type in the Content-Type Builder, and can be found while editing a content-type in the admin panel (see [User Guide](/cms/features/content-type-builder#creating-content-types)). You can define custom API IDs while creating the content-type, but these can not modified afterwards.

<ThemedImage
alt="Screenshot of the Content-Type Builder to retrieve singular and plural API IDs"
sources={{
  light: '/img/assets/apis/singular-and-plural-api-ids.png',
  dark: '/img/assets/apis/singular-and-plural-api-ids_DARK.png',
}}
/>

</details>

### Fetch a single document

Documents <DocumentDefinition/> can be fetched by their `documentId`.

```graphql title="Example query: Find a restaurant with its documentId"
{
  restaurant(documentId: "a1b2c3d4e5d6f7g8h9i0jkl") {
    name
    description
  }
}
```

### Fetch multiple documents

To fetch multiple documents <DocumentDefinition/> you can use simple, flat queries or <ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> queries:

Flat queries return only the requested fields for each document. Relay-style queries end with `_connection` and return a `nodes` array together with a `pageInfo` object. Use Relay-style queries when you need pagination metadata.


<Tabs groupId="flat-relay">

<TabItem value="flat" label="Flat queries">

To fetch multiple documents you can use flat queries like the following:

```graphql title="Example query: Find all restaurants"
restaurants {
  documentId
  title
}
```

</TabItem>

<TabItem value="relay" label="Relay-style queries">

Relay-style queries can be used to fetch multiple documents and return meta information:

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

</TabItem>

</Tabs>

#### Fetch relations

You can ask to include relation data in your flat queries or in your <ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> queries:

<Tabs groupId="flat-relay">

<TabItem value="flat" label="Flat queries">

The following example fetches all documents from the "Restaurant" content-type, and for each of them, also returns some fields for the many-to-many relation with the "Category" content-type:

```graphql title="Example query: Find all restaurants and their associated categories"
{
  restaurants {
    documentId
    name
    description
    # categories is a many-to-many relation
    categories {
      documentId
      name
    }
  }
}
```

</TabItem>

<TabItem value="relay" label="Relay-style queries">

The following example fetches all documents from the "Restaurant" content-type using a Relay-style query, and for each restaurant, also returns some fields for the many-to-many relation with the "Category" content-type:

```graphql title="Example query: Find all restaurants and their associated categories"
{
  restaurants_connection {
    nodes {
      documentId
      name
      description
      # categories is a many-to-many relation
      categories_connection {
        nodes {
          documentId
          name
        } 
      }
    }
    pageInfo {
      page
      pageCount
      pageSize
      total
    }
  }
}
```

:::info
For now, `pageInfo` only works for documents at the first level. Future implementations of Strapi might implement `pageInfo` for relations.

<details>
<summary>Possible use cases for <code>pageInfo</code>:</summary>

<Columns>
<ColumnLeft>
This works:

```graphql
{
  restaurants_connection {
    nodes {
      documentId
      name
      description
      # many-to-many relation
      categories_connection {
        nodes {
          documentId
          name
        } 
      }
    }
    pageInfo {
      page
      pageCount
      pageSize
      total
    }
  }
}
```

</ColumnLeft>
<ColumnRight>
This does not work:

```graphql {13-19}
{
  restaurants_connection {
    nodes {
      documentId
      name
      description
      # many-to-many relation
      categories_connection {
        nodes {
          documentId
          name
        }
        # not supported
        pageInfo {
          page
          pageCount
          pageSize
          total
        }
      }
    }
    pageInfo {
      page
      pageCount
      pageSize
      total
    }
  }
}}
```

</ColumnRight>
</Columns>
</details>

:::

</TabItem>

</Tabs>

### Fetch media fields

Media fields content is fetched just like other attributes.

The following example fetches the `url` attribute value for each `cover` media field attached to each document from the "Restaurants" content-type:

```graphql
{
  restaurants {
    images {
      documentId
      url
    }
  }
}
```

For multiple media fields, you can use flat queries or <ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> queries:

<Tabs groupId="flat-relay">

<TabItem value="flat" label="Flat queries">

The following example fetches some attributes from the `images` multiple media field found in the "Restaurant" content-type:

```graphql
{
  restaurants {
    images_connection {
      nodes {
        documentId
        url
      }
    }
  }
}
```

</TabItem>

<TabItem value="relay" label="Relay-style queries">

The following example fetches some attributes from the `images` multiple media field found in the "Restaurant" content-type using a Relay-style query:

```graphql
{
  restaurants {
    images_connection {
      nodes {
        documentId
        url
      }
    }
  }
}
```

:::info
For now, `pageInfo` only works for documents. Future implementations of Strapi might implement `pageInfo` for the media fields `_connection` too.
:::

</TabItem>

</Tabs>

### Fetch components

Components content is fetched just like other attributes.

The following example fetches the `label`, `start_date`, and `end_date` attributes values for each `closingPeriod` component added to each document from the "Restaurants" content-type:

```graphql
{
  restaurants {
    closingPeriod {
      label
      start_date
      end_date
    }
  }
}
```

### Fetch dynamic zone data

Dynamic zones are union types in GraphQL so you need to use <ExternalLink to="https://www.apollographql.com/docs/react/data/fragments/" text="fragments"/> (i.e., with `...on`) to query the fields, passing the component name (with the `ComponentCategoryComponentname` syntax) to <ExternalLink to="https://www.apollographql.com/docs/apollo-server/schema/schema/#the-__typename-field" text="`__typename`"/>:

The following example fetches data for the `label` attribute of a "Closingperiod" component from the "Default" components category that can be added to the "dz" dynamic zone:

```graphql
{
  restaurants {
    dz {
      __typename
      ...on ComponentDefaultClosingperiod {
        # define which attributes to return for the component
        label
      }
    }
  }
}
```

### Fetch draft or published versions {#status}

If the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled for the content-type, you can add a `status` parameter to queries to fetch draft or published versions of documents <DocumentDefinition/>:

```graphql title="Example: Fetch draft versions of documents"
query Query($status: PublicationStatus) {
  restaurants(status: DRAFT) {
    documentId
    name
    publishedAt # should return null
  }
}
```

```graphql title="Example: Fetch published versions of documents"
query Query($status: PublicationStatus) {
  restaurants(status: PUBLISHED) {
    documentId
    name
    publishedAt
  }
}
```

## Aggregations {#aggregations}

Aggregations can be used to compute metrics such as counts, sums, or grouped totals without fetching every document individually. Aggregations are exposed through <ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> connection queries: every collection type includes an `aggregate` field under its `<plural>_connection` query.

```graphql title="Example: Total restaurants matching a filter"
{
  restaurants_connection(filters: { categories: { documentId: { eq: "food-trucks" } } }) {
    aggregate {
      count
    }
  }
}
```

Aggregations follow the same filters, locale, publication status, and permissions as the parent query. For example, setting `locale: "fr"` or `status: DRAFT` on the connection limits the aggregation to those documents, and users can only aggregate content they are allowed to read.

The table below lists all supported aggregation operators:

| Operator | Description | Supported field types |
| --- | --- | --- |
| `count` | Returns the number of documents that match the query. | All content-types |
| `avg` | Computes the arithmetic mean per numeric field. | Number, integer, decimal |
| `sum` | Computes the total per numeric field. | Number, integer, decimal |
| `min` | Returns the smallest value per field. | Number, integer, decimal, date, datetime |
| `max` | Returns the largest value per field. | Number, integer, decimal, date, datetime |
| `groupBy` | Buckets results by unique values and exposes nested aggregations for each bucket. | Scalar fields (string, number, boolean, date, datetime), relations |

:::note
Strapi ignores `null` values for `avg`, `sum`, `min`, and `max`. When aggregating relations, the operators run on the target documents and still respect their locales and permissions.
:::

:::info Performance & limits
Aggregations operate server-side, so they are generally faster than downloading and processing large result sets on the client. However, complex `groupBy` trees and wide projections can still be expensive. Use filters to restrict the data set and consider enabling [query depth or amount limits](/cms/plugins/graphql#rate-limiting-and-query-depth) to protect your API. Errors such as `You are not allowed to perform this action` usually mean the requester lacks the `Read` permission on the target collection.
:::

### Aggregate multiple metrics in one request

Aggregations can be combined so that one network round trip returns several metrics:

```graphql title="Example: Average delivery time and minimum price"
{
  restaurants_connection(filters: { takeAway: { eq: true } }) {
    aggregate {
      avg {
        delivery_time
      }
      min {
        price_range
      }
      max {
        price_range
      }
    }
  }
}
```

### Group results

Use `groupBy` to derive grouped metrics while optionally chaining further aggregations inside each group. Each group exposes the unique `key` and a nested connection that can be used for drilling down or counting the grouped items:

```graphql title="Example: Count restaurants per category"
{
  restaurants_connection {
    aggregate {
      groupBy {
        categories {
          key
          connection {
            aggregate {
              count
            }
          }
        }
      }
    }
  }
}
```

Groups inherit the top-level filters. To further refine a specific group, apply filters on the nested `connection`.

### Combine with pagination and sorting

Aggregations run on the entire result set that matches the query filters, not only on the current page. When a request includes pagination arguments and aggregations, the documents in `nodes` follow the pagination limits, but the values inside `aggregate` ignore `pageSize` or `limit` so they describe the whole set. You can still add sorting to order the documents returned with the aggregation results.

```graphql title="Example: Paginate takeaway restaurants and count all matches"
{
  restaurants_connection(
    filters: { takeAway: { eq: true } }
    pagination: { page: 2, pageSize: 5 }
    sort: "name:asc"
  ) {
    nodes {
      documentId
      name
      rating
    }
    pageInfo {
      page
      pageSize
      total
    }
    aggregate {
      count
      avg {
        rating
      }
    }
  }
}
```

## Mutations

Mutations in GraphQL are used to modify data (e.g. create, update, and delete data).

When a content-type is added to your project, 3 automatically generated GraphQL mutations to create, update, and delete documents <DocumentDefinition/> are added to your schema.

For instance, for a "Restaurant" content-type, the following mutations are generated:

| Use case                                    | Singular API ID     |
|---------------------------------------------|---------------------|
| Create a new "Restaurant" document          | `createRestaurant`  |
| Update an existing "Restaurant" restaurant  | `updateRestaurant`  |
| Delete an existing "Restaurant" restaurant  | `deleteRestaurant`  |

### Create a new document

When creating new documents, the `data` argument will have an associated input type that is specific to your content-type.

For instance, if your Strapi project contains the "Restaurant" content-type, you will have the following:

| Mutation           | Argument         | Input type         |
|--------------------|------------------|--------------------|
| `createRestaurant` | `data`           | `RestaurantInput!` |

The following example creates a new document for the "Restaurant" content-type and returns its `name` and `documentId`:

```graphql
mutation CreateRestaurant($data: RestaurantInput!) {
  createRestaurant(data: {
    name: "Pizzeria Arrivederci"
  }) {
    name
    documentId
  }
}
```

When creating a new document, a `documentId` is automatically generated.

The implementation of the mutations also supports relational attributes. For example, you can create a new "Category" and attach many "Restaurants" (using their `documentId`) to it by writing your query like follows:

```graphql
mutation CreateCategory {
  createCategory(data: { 
    Name: "Italian Food"
    restaurants: ["a1b2c3d4e5d6f7g8h9i0jkl", "bf97tfdumkcc8ptahkng4puo"]
  }) {
    documentId
    Name
    restaurants {
      documentId
      name
    }
  }
}
```

:::tip
If the Internationalization (i18n) feature is enabled for your content-type, you can create a document for a specific locale (see [create a new localized document](/cms/api/graphql#locale-create)).
:::

### Update an existing document

When updating an existing document <DocumentDefinition/>, pass the `documentId` and the `data` object containing new content. The `data` argument will have an associated input type that is specific to your content-type.

For instance, if your Strapi project contains the "Restaurant" content-type, you will have the following:

| Mutation           | Argument         | Input type         |
|--------------------|------------------|--------------------|
| `updateRestaurant` | `data`           | `RestaurantInput!` |

For instance, the following example updates an existing document from the "Restaurants" content-type and give it a new name:

```graphql
mutation UpdateRestaurant($documentId: ID!, $data: RestaurantInput!) {
  updateRestaurant(
    documentId: "bf97tfdumkcc8ptahkng4puo",
    data: { name: "Pizzeria Amore" }
  ) {
    documentId
    name
  }
}
```

:::tip
If the Internationalization (i18n) feature is enabled for your content-type, you can create a document for a specific locale (see [i18n documentation](/cms/api/graphql#locale-update)).
:::

#### Update relations

You can update relational attributes by passing a `documentId` or an array of `documentId` (depending on the relation type).

For instance, the following example updates a document from the "Restaurant" content-type and adds a relation to a document from the "Category" content-type through the `categories` relation field:

```graphql
mutation UpdateRestaurant($documentId: ID!, $data: RestaurantInput!) {
  updateRestaurant(
    documentId: "slwsiopkelrpxpvpc27953je",
    data: { categories: ["kbbvj00fjiqoaj85vmylwi17"] }
  ) {
    documentId
    name
    categories {
      documentId
      Name
    }
  }
}
```

### Delete a document

To delete a document <DocumentDefinition/>, pass its `documentId`:

```graphql
mutation DeleteRestaurant {
  deleteRestaurant(documentId: "a1b2c3d4e5d6f7g8h9i0jkl") {
    documentId
  }
}
```

:::tip
If the Internationalization (i18n) feature is enabled for your content-type, you can delete a specific localized version of a document (see [i18n documentation](/cms/api/graphql#locale-delete)).
:::

### Mutations on media files

:::caution
Currently, mutations on media fields use Strapi v4 `id`, not Strapi 5 `documentId`, as unique identifiers for media files.
:::

Media fields mutations use files `id`. However, GraphQL API queries in Strapi 5 do not return `id` anymore. Media files `id` can be found:

- either in the [Media Library](/cms/features/media-library) from the admin panel,

  <ThemedImage
    alt="Media Library screenshot highlighting how to find a media file id"
    sources={{
      light: '/img/assets/apis/media-field-id.png',
      dark: '/img/assets/apis/media-field-id.png'
    }}
  />

- or by sending REST API `GET` requests that [populate media files](/cms/api/rest/populate-select#population), because REST API requests currently return both `id` and `documentId` for media files.

#### Update an uploaded media file

When updating an uploaded media file, pass the media's `id` (not its `documentId`) and the `info` object containing new content. The `info` argument will has an associated input type that is specific to media files.

For instance, if your Strapi project contains the "Restaurant" content-type, you will have the following:

| Mutation           | Argument         | Input type         |
|--------------------|------------------|--------------------|
| `updateUploadFile` | `info`           | `FileInfoInput!`   |

For instance, the following example updates the `alternativeText` attribute for a media file whose `id` is 3:

```graphql
mutation Mutation($updateUploadFileId: ID!, $info: FileInfoInput) {
  updateUploadFile(
    id: 3,
    info: {
      alternativeText: "New alt text"
    }
  ) {
    documentId
    url
    alternativeText
  }
}
```

:::tip
If upload mutations return a forbidden access error, ensure proper permissions are set for the Upload plugin (see [User Guide](/cms/features/users-permissions#editing-a-role)).
:::

#### Delete an uploaded media file

When deleting an uploaded media file, pass the media's `id` (not its `documentId`).

```graphql title="Example: Delete the media file with id 4"
mutation DeleteUploadFile($deleteUploadFileId: ID!) {
  deleteUploadFile(id: 4) {
    documentId # return its documentId
  }
}
```

:::tip
If upload mutations return a forbidden access error, ensure proper permissions are set for the Upload plugin (see [User Guide](/cms/features/users-permissions#editing-a-role)).
:::

## Filters

Queries can accept a `filters` parameter with the following syntax:

`filters: { field: { operator: value } }`

Multiple filters can be combined together, and logical operators (`and`, `or`, `not`) can also be used and accept arrays of objects. When multiple field conditions are combined, they are implicitly joined with `and`.

:::tip
`and`, `or` and `not` operators can be nested inside one another.
:::

The following operators are available:

| Operator       | Description                        |
| -------------- | ---------------------------------- |
| `eq`           | Equal                              |
| `eqi`          | Equal, case insensitive            |
| `ne`           | Not equal                          |
| `nei`          | Not equal, case insensitive        |
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

<ExpandableContent>

```graphql title="Simple examples for comparison operators (eq, ne, lt, lte, gt, gte, between)"
# eq - returns restaurants with the exact name "Biscotte"
{
  restaurants(filters: { name: { eq: "Biscotte" } }) {
    name
  }
}

# eqi - returns restaurants whose name equals "Biscotte",
#       comparison is case-insensitive
{
  restaurants(filters: { name: { eqi: "Biscotte" } }) {
    name
  }
}

# ne - returns restaurants whose name is not "Biscotte"
{
  restaurants(filters: { name: { ne: "Biscotte" } }) {
    name
  }
}

# nei - returns restaurants whose name is not "Biscotte",
#       comparison is case-insensitive
{
  restaurants(filters: { name: { nei: "Biscotte" } }) {
    name
  }
}

# lt - returns restaurants with averagePrice less than 20
{
  restaurants(filters: { averagePrice: { lt: 20 } }) {
    name
  }
}

# lte - returns restaurants with averagePrice less than or equal to 20
{
  restaurants(filters: { averagePrice: { lte: 20 } }) {
    name
  }
}

# gt - returns restaurants with averagePrice greater than 20
{
  restaurants(filters: { averagePrice: { gt: 20 } }) {
    name
  }
}

# gte - returns restaurants with averagePrice greater than or equal to 20
{
  restaurants(filters: { averagePrice: { gte: 20 } }) {
    name
  }
}

# between - returns restaurants with averagePrice between 10 and 30
{
  restaurants(filters: { averagePrice: { between: [10, 30] } }) {
    name
  }
}
```

</ExpandableContent>

```graphql title="Simple examples for membership operators (in, notIn)"
# in - returns restaurants with category either "pizza" or "burger"
{
  restaurants(filters: { category: { in: ["pizza", "burger"] } }) {
    name
  }
}

# notIn - returns restaurants whose category is neither "pizza" nor "burger"
{
  restaurants(filters: { category: { notIn: ["pizza", "burger"] } }) {
    name
  }
}
```

<ExpandableContent>

```graphql title="Simple examples for string matching operators (contains, notContains, containsi, notContains, startsWith, endsWith)"
# contains - returns restaurants whose name contains "Pizzeria"
{
  restaurants(filters: { name: { contains: "Pizzeria" } }) {
    name
  }
}

# notContains - returns restaurants whose name does NOT contain "Pizzeria"
{
  restaurants(filters: { name: { notContains: "Pizzeria" } }) {
    name
  }
}

# containsi - returns restaurants whose name contains "pizzeria" (case‑insensitive)
{
  restaurants(filters: { name: { containsi: "pizzeria" } }) {
    name
  }
}

# notContainsi - returns restaurants whose name does NOT contain "pizzeria" (case‑insensitive)
{
  restaurants(filters: { name: { notContainsi: "pizzeria" } }) {
    name
  }
}

# startsWith - returns restaurants whose name starts with "Pizza"
{
  restaurants(filters: { name: { startsWith: "Pizza" } }) {
    name
  }
}

# endsWith - returns restaurants whose name ends with "Inc"
{
  restaurants(filters: { name: { endsWith: "Inc" } }) {
    name
  }
}
```

</ExpandableContent>

```graphql title="Simple examples for null checks operators (null, notNull)"
# null - returns restaurants where description is null
{
  restaurants(filters: { description: { null: true } }) {
    name
  }
}

# notNull - returns restaurants where description is not null
{
  restaurants(filters: { description: { notNull: true } }) {
    name
  }
}
```

```graphql title="Simple examples for logical operators (and, or, not)"
# and - both category must be "pizza" AND averagePrice must be < 20
{
  restaurants(filters: {
    and: [
      { category: { eq: "pizza" } },
      { averagePrice: { lt: 20 } }
    ]
  }) {
    name
  }
}

# or - category is "pizza" OR category is "burger"
{
  restaurants(filters: {
    or: [
      { category: { eq: "pizza" } },
      { category: { eq: "burger" } }
    ]
  }) {
    name
  }
}

# not - category must NOT be "pizza"
{
  restaurants(filters: {
    not: { category: { eq: "pizza" } }
  }) {
    name
  }
}
```

```graphql title="Example with nested logical operators: use and, or, and not to find pizzerias under 20 euros"
{
  restaurants(
    filters: {
      and: [
        { not: { averagePrice: { gte: 20 } } }
        {
          or: [
            { name: { eq: "Pizzeria" } }
            { name: { startsWith: "Pizzeria" } }
          ]
        }
      ]
    }
  ) {
    documentId
    name
    averagePrice
  }
}
```

<DeepFilteringBlogLink />

## Sorting

Queries can accept a `sort` parameter with the following syntax:

- to sort based on a single value: `sort: "value"` 
- to sort based on multiple values: `sort: ["value1", "value2"]`

The sorting order can be defined with `:asc` (ascending order, default, can be omitted) or `:desc` (for descending order).

```graphql title="Example: Fetch and sort on name by ascending order"
{
  restaurants(sort: "name") {
    documentId
    name
  }
}
```

```graphql title="Example: Fetch and sort on average price by descending order"
{
  restaurants(sort: "averagePrice:desc") {
    documentId
    name
    averagePrice
  }
}
```

```graphql title="Example: Fetch and sort on title by ascending order, then on average price by descending order"
{
  restaurants(sort: ["name:asc", "averagePrice:desc"]) {
    documentId
    name
    averagePrice
  }
}
```

## Pagination

<ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> queries can accept a `pagination` parameter. Results can be paginated either by page or by offset.

:::note
Pagination methods can not be mixed. Always use either `page` with `pageSize` or `start` with `limit`.
:::

### Pagination by page

| Parameter              | Description | Default |
| ---------------------- | ----------- | ------- |
| `pagination.page`      | Page number | 1       |
| `pagination.pageSize`  | Page size   | 10      |

```graphql title="Example query: Pagination by page"
{
  restaurants_connection(pagination: { page: 1, pageSize: 10 }) {
    nodes {
      documentId
      name
    }
    pageInfo {
      page
      pageSize
      pageCount
      total
    }
  }
}
```

### Pagination by offset

| Parameter          | Description                  | Default | Maximum |
| ------------------ | ---------------------------- | ------- | ------- |
| `pagination.start` | Start value                  | 0       | -       |
| `pagination.limit` | Number of entities to return | 10      | -1      |

```graphql title="Example query: Pagination by offset"
{
  restaurants_connection(pagination: { start: 10, limit: 19 }) {
    nodes {
      documentId
      name
    }
    pageInfo {
      page
      pageSize
      pageCount
      total
    }
  }
}
```

:::tip
The default and maximum values for `pagination.limit` can be [configured in the `./config/plugins.js`](/cms/plugins/graphql#code-based-configuration) file with the `graphql.config.defaultLimit` and `graphql.config.maxLimit` keys.
:::

## `locale` {#locale}

The [Internationalization (i18n)](/cms/features/internationalization) feature adds new features to the GraphQL API:

- The `locale` field is added to the GraphQL schema.
- GraphQL can be used:
  - to query documents for a specific locale with the `locale` argument
  - for mutations to [create](#locale-create), [update](#locale-update), and [delete](#locale-delete) documents for a specific locale

### Fetch all documents in a specific locale {#locale-fetch-all}

To fetch all documents <DocumentDefinition/> for a specific locale, pass the `locale` argument to the query:

<ApiCall>

<Request> 

```graphql
query {
  restaurants(locale: "fr") {
    documentId
    name
    locale
  }
}
```

</Request>

<Response>

```json
{
  "data": {
    "restaurants": [
      {
        "documentId": "a1b2c3d4e5d6f7g8h9i0jkl",
        "name": "Restaurant Biscotte",
        "locale": "fr"
      },
      {
        "documentId": "m9n8o7p6q5r4s3t2u1v0wxyz",
        "name": "Pizzeria Arrivederci",
        "locale": "fr"
      },
    ]
  }
}
```

</Response>

</ApiCall>

### Fetch a document in a specific locale {#locale-fetch}

To fetch a documents <DocumentDefinition/> for a specific locale, pass the `documentId` and the `locale` arguments to the query:

<ApiCall>

<Request title="Example query"> 

```graphql
query Restaurant($documentId: ID!, $locale: I18NLocaleCode) {
  restaurant(documentId: "a1b2c3d4e5d6f7g8h9i0jkl", locale: "fr") {
    documentId
    name
    description
    locale
  }
}
```

</Request>

 <Response title="Example response"> 

```json
{
  "data": {
    "restaurant": {
      "documentId": "lviw819d5htwvga8s3kovdij",
      "name": "Restaurant Biscotte",
      "description": "Bienvenue au restaurant Biscotte!",
      "locale": "fr"
    }
  }
}
```

</Response>
</ApiCall>

### Create a new localized document {#locale-create}

The `locale` field can be passed to create a localized document <DocumentDefinition/> for a specific locale (for more information about mutations with GraphQL, see [the GraphQL API documentation](/cms/api/graphql#create-a-new-document)).

```graphql title="Example: Create a new restaurant for the French locale"
mutation CreateRestaurant($data: RestaurantInput!, $locale: I18NLocaleCode) {
  createRestaurant(
    data: {
      name: "Brasserie Bonjour",
      description: "Description in French goes here"
    },
    locale: "fr"
  ) {
  documentId
  name
  description
  locale
}
```

### Update a document for a specific locale {#locale-update}

A `locale` argument can be passed in the mutation to update a document <DocumentDefinition/> for a given locale (for more information about mutations with GraphQL, see [the GraphQL API documentation](/cms/api/graphql#update-an-existing-document)).

```graphql title="Example: Update the description field of restaurant for the French locale"
mutation UpdateRestaurant($documentId: ID!, $data: RestaurantInput!, $locale: I18NLocaleCode) {
  updateRestaurant(
    documentId: "a1b2c3d4e5d6f7g8h9i0jkl"
    data: {
      description: "New description in French"
    },
    locale: "fr"
  ) {
  documentId
  name
  description
  locale
}
```

### Delete a locale for a document {#locale-delete}

Pass the `locale` argument in the mutation to delete a specific localization for a document <DocumentDefinition/>:

```graphql
mutation DeleteRestaurant($documentId: ID!, $locale: I18NLocaleCode) {
  deleteRestaurant(documentId: "xzmzdo4k0z73t9i68a7yx2kk", locale: "fr") {
    documentId
  }
}
```

## Advanced use cases

Click on the following cards for short guides on more advanced use cases leveraging the GraphQL API and Strapi features: 

<CustomDocCardsWrapper>
  <CustomDocCard emoji="🖼️" title="Advanced queries" description="View examples of multi-level queries and custom resolver chains for the GraphQL API." link="/cms/api/graphql/advanced-queries" />
  <CustomDocCard emoji="🖼️" title="Advanced policies" description="View examples of advanced policies such as conditional visibility and group membership for the GraphQL API." link="/cms/api/graphql/advanced-policies" />
</CustomDocCardsWrapper>