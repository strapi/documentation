---
title: GraphQL API
displayed_sidebar: devDocsSidebar
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

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# GraphQL API

The GraphQL API allows performing queries and mutations to interact with the [content-types](/dev-docs/backend-customization/models#content-types) through Strapi's [GraphQL plugin](/dev-docs/plugins/graphql.md). Results can be [filtered](#filters), [sorted](#sorting) and [paginated](#pagination).

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

Once installed, the GraphQL playground is accessible at the `/graphql` URL and can be used to interactively build your queries and mutations and read documentation tailored to your content-types:

<ThemedImage
  alt="GraphQL playground use example"
  sources={{
    light:'/img/assets/apis/use-graphql-playground.gif',
    dark:'/img/assets/apis/use-graphql-playground_DARK.gif',
  }}
/>

<br/>

:::note No GraphQL API to upload media files
The GraphQL API does not support media upload. Use the [REST API `POST /upload` endpoint](/dev-docs/plugins/upload#endpoints) for all file uploads and use the returned info to link to it in content types. You can still update or delete uploaded files with the `updateUploadFile` and `deleteUploadFile` mutations using media files `id` (see [mutations on media files](#mutations-on-media-files)).
:::

## Queries

Queries in GraphQL are used to fetch data without modifying it.

When a content-type is added to your project, 2 automatically generated GraphQL queries are added to your schema, named after the content-type's singular and plural API IDs, as in the following example:

| Content-type display name | Singular API ID | Plural API ID |
|---------------------------|-----------------|---------------|
| Restaurant                | `restaurant`    | `restaurants` |

<details>
<summary>Singular API ID vs. Plural API ID:</summary>

Singular API ID and Plural API ID values are defined when creating a content-type in the Content-Type Builder, and can be found while editing a content-type in the admin panel (see [User Guide](/user-docs/content-type-builder/creating-new-content-type)). You can define custom API IDs while creating the content-type, but these can not modified afterwards.

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

To fetch multiple documents <DocumentDefinition/> you can use simple, flat queries or [Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries:

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

You can ask to include relation data in your flat queries or in your [Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries:

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

For multiple media fields, you can use flat queries or [Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries:

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

Dynamic zones are union types in GraphQL so you need to use [fragments](https://www.apollographql.com/docs/react/data/fragments/) (i.e., with `...on`) to query the fields, passing the component name (with the `ComponentCategoryComponentname` syntax) to [`__typename`](https://www.apollographql.com/docs/apollo-server/schema/schema/#the-__typename-field):

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

If the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature is enabled for the content-type, you can add a `status` parameter to queries to fetch draft or published versions of documents <DocumentDefinition/>:

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

When creating new documents <DocumentDefinition/>, the `data` argument will have an associated input type that is specific to your content-type.

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
If the Internationalization (i18n) feature is enabled for your content-type, you can create a document for a specific locale (see [i18n documentation](/dev-docs/i18n#graphl-create)).
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
If the Internationalization (i18n) feature is enabled for your content-type, you can create a document for a specific locale (see [i18n documentation](/dev-docs/i18n#graphql-update)).
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
If the Internationalization (i18n) feature is enabled for your content-type, you can delete a specific localized version of a document (see [i18n documentation](/dev-docs/i18n#graphql-delete)).
:::

### Mutations on media files

:::caution
Currently, mutations on media fields use Strapi v4 `id`, not Strapi 5 `documentId`, as unique identifiers for media files.
:::

Media fields mutations use files `id`. However, GraphQL API queries in Strapi 5 do not return `id` anymore. Media files `id` can be found:

- either in the [Media Library](/user-docs/media-library) from the admin panel,

  <ThemedImage
    alt="Media Library screenshot highlighting how to find a media file id"
    sources={{
      light: '/img/assets/apis/media-field-id.png',
      dark: '/img/assets/apis/media-field-id.png'
    }}
  />

- or by sending REST API `GET` requests that [populate media files](/dev-docs/api/rest/populate-select#relations--media-fields), because REST API requests currently return both `id` and `documentId` for media files.

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
If upload mutations return a forbidden access error, ensure proper permissions are set for the Upload plugin (see [User Guide](/user-docs/users-roles-permissions/configuring-end-users-roles#editing-a-role)).
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
If upload mutations return a forbidden access error, ensure proper permissions are set for the Upload plugin (see [User Guide](/user-docs/users-roles-permissions/configuring-end-users-roles#editing-a-role)).
:::

## Filters

<!-- TODO: create examples for every filter and expand this into a section -->
Queries can accept a `filters` parameter with the following syntax:

`filters: { field: { operator: value } }`

Multiple filters can be combined together, and logical operators (`and`, `or`, `not`) can also be used and accept arrays of objects.

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

```graphql title="Example with advanced filters: Fetch pizzerias with an averagePrice lower than 20"
{
  restaurants(
    filters: { 
      averagePrice: { lt: 20 },
      or: [
        { name: { eq: "Pizzeria" }}
        { name: { startsWith: "Pizzeria" }}
      ]}
    ) {
    documentId
    name
    averagePrice
  }
}
```

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

[Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries can accept a `pagination` parameter. Results can be paginated either by page or by offset.

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
The default and maximum values for `pagination.limit` can be [configured in the `./config/plugins.js`](/dev-docs/configurations/plugins#graphql-configuration) file with the `graphql.config.defaultLimit` and `graphql.config.maxLimit` keys.
:::
