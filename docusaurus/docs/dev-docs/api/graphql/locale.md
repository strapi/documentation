# Use `locale` with the GraphQL API {#graphql}

The i18n feature adds new features to the [GraphQL API](/dev-docs/api/graphql):

- The `locale` field is added to the GraphQL schema.
- GraphQL can be used:
  - to query documents for a specific locale with the `locale` argument
  - for mutations to [create](#graphql-create), [update](#graphql-update), and [delete](#graphql-delete) documents for a specific locale

### Fetch all documents in a specific locale {#graphql-fetch-all}

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

### Fetch a document in a specific locale {#graphql-fetch}

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

### Create a new localized document {#graphql-create}

The `locale` field can be passed to create a localized document <DocumentDefinition/> for a specific locale (for more information about mutations with GraphQL, see [the GraphQL API documentation](/dev-docs/api/graphql#create-a-new-document)).

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

### Update a document for a specific locale {#graphql-update}

A `locale` argument can be passed in the mutation to update a document <DocumentDefinition/> for a given locale (for more information about mutations with GraphQL, see [the GraphQL API documentation](/dev-docs/api/graphql#update-an-existing-document)).

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

### Delete a locale for a document {#graphql-delete}

Pass the `locale` argument in the mutation to delete a specific localization for a document <DocumentDefinition/>:

```graphql
mutation DeleteRestaurant($documentId: ID!, $locale: I18NLocaleCode) {
  deleteRestaurant(documentId: "xzmzdo4k0z73t9i68a7yx2kk", locale: "fr") {
    documentId
  }
}
```
