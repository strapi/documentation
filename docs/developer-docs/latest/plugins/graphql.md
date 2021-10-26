---
title: GraphQL - Strapi Developer Documentation
description: Use a GraphQL endpoint in your Strapi project to fetch and mutate your content.
sidebarDepth: 3
---

# GraphQL

By default Strapi create [REST endpoints](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#api-endpoints) for each of your content types. With the GraphQL plugin, you will be able to add a GraphQL endpoint to fetch and mutate your content.

:::strapi Looking for the GraphQL API documentation?
The [GraphQL API reference](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md) describes queries, mutations and parameters you can use to interact with your API using Strapi's GraphQL plugin.
:::

## Usage

To get started with GraphQL in your app, please install the plugin first. To do that, open your terminal and run the following command:

<code-group>

<code-block title="NPM">
```sh
npm run strapi install graphql
```
</code-block>

<code-block title="YARN">
```sh
yarn strapi install graphql
```
</code-block>

</code-group>

Then, start your app and open your browser at [http://localhost:1337/graphql](http://localhost:1337/graphql). You should see the interface (**GraphQL Playground**) that will help you to write GraphQL query to explore your data.

## Configurations

By default, the [Shadow CRUD](#shadow-crud) feature is enabled and the GraphQL path is set to `/graphql`. The Playground is enabled by default for both the development and staging environments, however it is disabled in production. By changing the config option `playgroundAlways` to true, you can enable it.

<!-- TODO: update these paragraphs 👇 (format as a table — check with JS) -->

Security limits on maximum number of items in your response by default is limited to 100, however you can change this on the following config option `amountLimit`. This should only be changed after careful consideration of the drawbacks of a large query which can cause what would basically be a DDoS (Distributed Denial of Service). And may cause abnormal load on your Strapi server, as well as your database server.

You can also setup any [Apollo Server options](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver) with the `apolloServer` option. For example, you can enable the tracing feature, which is supported by the playground to track the response time of each part of your query. To enable this feature just change/add the `"tracing": true` option in the GraphQL settings file. You can read more about the tracing feature from Apollo [here](https://www.apollographql.com/docs/apollo-server/federation/metrics/).

You can edit these configurations by creating the following file.

:::caution
Please note the setting for GraphQL `tracing` as changed and has been moved to `apolloServer.tracing`
:::

<!-- TODO: add link to plugin configuration (in "plugins development") once merged with Plugin API PR -->
```js
// path: ./config/plugins.js

module.exports = {
  //
  graphql: {
    endpoint: '/graphql',
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
    apolloServer: {
      tracing: false,
    },
  },
};
```

## Shadow CRUD

To simplify and automate the build of the GraphQL schema, we introduced the Shadow CRUD feature. It automatically generates the type definitions, queries, mutations and resolvers based on your models.

**Example:**

If you've generated an API called `Restaurant` using the CLI `strapi generate:api restaurant` or the administration panel, your model looks like this:

```json
// path: ./src/api/[api-name]/content-types/restaurant/schema.json

{
  "kind": "collectionType",
  "collectionName": "documents",
  "info": {
    "singularName": "document",
    "pluralName": "documents",
    "displayName": "document",
    "name": "document"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "richtext"
    },
    "locked": {
      "type": "boolean"
    }
  }
}
```

::: details Generated GraphQL type and queries

```graphql
# Document's Type definition
input DocumentFiltersInput {
  name: StringFilterInput
  description: StringFilterInput
  locked: BooleanFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  publishedAt: DateTimeFilterInput
  and: [DocumentFiltersInput]
  or: [DocumentFiltersInput]
  not: DocumentFiltersInput
}
​
input DocumentInput {
  name: String
  description: String
  locked: Boolean
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}
​
type Document {
  name: String
  description: String
  locked: Boolean
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}
​
type DocumentEntity {
  id: ID
  attributes: Document
}
​
type DocumentEntityResponse {
  data: DocumentEntity
}
​
type DocumentEntityResponseCollection {
  data: [DocumentEntity!]!
  meta: ResponseCollectionMeta!
}
​
type DocumentRelationResponseCollection {
  data: [DocumentEntity!]!
}

# Queries to retrieve one or multiple restaurants.
type Query  {
  document(id: ID): DocumentEntityResponse
  documents(
    filters: DocumentFiltersInput
    pagination: PaginationArg = {}
    sort: [String] = []
    publicationState: PublicationState = LIVE
):DocumentEntityResponseCollection
}

# Mutations to create, update or delete a restaurant.
type Mutation {
  createDocument(data: DocumentInput!): DocumentEntityResponse
  updateDocument(id: ID!, data: DocumentInput!): DocumentEntityResponse
  deleteDocument(id: ID!): DocumentEntityResponse
}
```

:::

## Customization

Strapi provides a programmatic API to customize GraphQL, which allows:

* disabling some operations for the [Shadow CRUD](#shadow-crud)
* [using getters](#using-getters) to return information about allowed operations
* registering and using an `extension` object to [extend the existing schema](#extending-the-schema) (e.g. extend types or define custom resolvers)

::: details Example of GraphQL customizations

```js
// path: /src/index.js
​
module.exports = {
/**
 * An asynchronous register function that runs before
 * your application is initialized.
 *
 * This gives you an opportunity to extend code.
 */
  register({ strapi }) => {
    const extensionService = strapi.plugin('graphql').service('extension');
  ​
    extensionService.shadowCRUD('api::restaurant.restaurant').disable();
    extensionService.shadowCRUD('api::category.category').disableQueries();
    extensionService.shadowCRUD('api::address.address').disableMutations();
    extensionService.shadowCRUD('api::document.document').field('locked').disable();
    extensionService.shadowCRUD('api::like.like').disableActions(['create', 'update', 'delete']);
  ​
    const extension = ({ nexus }) => ({
      // Nexus
      types: [
        nexus.objectType({
          name: 'Book',
          definition(t) {
            t.string('title');
          },
        }),
      ],
      plugins: [
        nexus.plugin({
          name: 'MyPlugin',
  ​
          onAfterBuild(schema) {
            console.log(schema);
          },
        }),
      ],
  ​
      // GraphQL SDL
      typeDefs: `
          type Article {
              name: String
          }
      `,
      resolvers: {
        Query: {
          address: {
            resolve() {
              return { value: { city: 'Montpellier' } };
            },
          },
        },
      },
  ​
      resolversConfig: {
        'Query.address': {
          auth: false,
        },
      },
    });
  ​
    extensionService.use(extension);
  },
};
```

:::

### Disabling operations in the Shadow CRUD

The `extension` [service](/developer-docs/latest/development/backend-customization/services.md) provided with the GraphQL plugin exposes functions that can be used to disable operations on Content-Types:

| Content-type function | Description                                    | Argument type    | Possible argument values |
| --------------------  | ---------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `disable()`           | Fully disable the Content-Type                 | -                | -                                                                                                          |
| `disableQueries()`    | Only disable queries for the Content-Type      | -                | -                                                                                                          |
| `disableMutations()`  | Only disable mutations for the Content-Type    | -                | -                                                                                                          |
| `disableAction()`     | Disable a specific action for the Content-Type | String           | One value from the list:<ul><li>`create`</li><li>`find`</li><li>`findOne`</li><li>`update`</li><li>`delete`</li></ul>   |
| `disableActions()`    | Disable specific actions for the Content-Type  | Array of Strings | Multiple values from the list: <ul><li>`create`</li><li>`find`</li><li>`findOne`</li><li>`update`</li><li>`delete`</li></ul>  |

Actions can also be disabled at the field level, with the following functions:

| Field function     | Description                      |
| ------------------ | -------------------------------- |
| `disable()`        | Fully disable the field          |
| `disableOutput()`  | Disable the output on a field    |
| `disableInput()`   | Disable the input on a field     |
| `disableFilters()` | Disable filters input on a field |

**Examples:**

```js
// Disable the 'find' operation on the 'restaurant' content-type in the 'restaurant' API
strapi
  .plugin('graphql')
  .service('extension')
  .shadowCRUD('api::restaurant.restaurant')
  .disableAction('find')

// Disable the 'name' field on the 'document' content-type in the 'document' API
strapi
  .plugin('graphql')
  .service('extension')
  .shadowCRUD('api::document.document')
  .field('name')
  .disable()
```

### Using getters

The following getters can be used to retrieve information about operations allowed on content-types:

| Content-type getter        | Description                                                       | Argument type | Possible argument values                                                                                              |
| -------------------------- | ----------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `isEnabled()`              | Returns whether a content-type is enabled                         | -             | -                                                                                                                     |
| `isDisabled()`             | Returns whether a content-type is disabled                        | -             | -                                                                                                                     |
| `areQueriesEnabled()`      | Returns whether queries are enabled on a content-type             | -             | -                                                                                                                     |
| `areQueriesDisabled()`     | Returns whether queries are disabled on a content-type            | -             | -                                                                                                                     |
| `areMutationsEnabled()`    | Returns whether mutations are enabled on a content-type           | -             | -                                                                                                                     |
| `areMutationsDisabled()`   | Returns whether mutations are disabled on a content-type          | -             | -                                                                                                                     |
| `isActionEnabled(action)`  | Returns whether the passed `action` is enabled on a content-type  | String        | One value from the list:<ul><li>`create`</li><li>`find`</li><li>`findOne`</li><li>`update`</li><li>`delete`</li></ul> |
| `isActionDisabled(action)` | Returns whether the passed `action` is disabled on a content-type | String        | One value from the list:<ul><li>`create`</li><li>`find`</li><li>`findOne`</li><li>`update`</li><li>`delete`</li></ul> |

The following getters can be used to retrieve information about operations allowed on fields:

| Field getter          | Description                                   |
| --------------------- | --------------------------------------------- |
| `isEnabled()`         | Returns whether a field is enabled            |
| `isDisabled()`        | Returns whether a field is disabled           |
| `hasInputEnabled()`   | Returns whether a field has input enabled     |
| `hasOutputEnabled()`  | Returns whether a field has output enabled    |
| `hasFiltersEnabled()` | Returns whether a field has filtering enabled |

### Extending the schema

The schema generated by the Content API can be extended by registering an extension.

<!-- TODO: rephrase -->
This extension, defined either as an object or a function returning an object, will be used by the `use()` function exposed by the `extension` [service](/developer-docs/latest/development/backend-customization/services.md) provided with the GraphQL plugin.

The object describing the extension accepts the following parameters:

| Parameter         | Type   | Description                                                                                  |
| ----------------- | ------ | -------------------------------------------------------------------------------------------- |
| `types`           | Array  | Allows extending the schema types using [Nexus](https://nexusjs.org/)-based type definitions |
| `typeDefs`        | String | Allows extending the schema types using [GraphQL SDL](https://graphql.org/learn/schema/)     |
| `plugins`         | Array  | Allows extending the schema using Nexus [plugins](https://nexusjs.org/docs/plugins)          |
| `resolvers`       | Object | Defines custom resolvers                                                                     |
| `resolversConfig` | Object | Defines configuration options for the resolvers                                              |

::::tip
The `types` and `plugins` parameters are based on [Nexus](https://nexusjs.org/). To use them, register the extension as a function that takes `nexus` as a parameter:

::: details Example:

```js

// path: ./src/index.js

module.exports = {
  register({ strapi }) {
    const extension = ({ nexus }) => ({
      types: [
        nexus.objectType({
          …
        }),
      ],
      plugins: [
        nexus.plugin({
          …
        })
      ]
    })

    strapi.plugin('graphql').service('extension').use(extension)
  }
}
```

:::
::::

#### Custom configuration for resolvers

A resolver is a GraphQL query handler (i.e. a function, or a collection of functions, that generate(s) a response for a GraphQL query). Each field has a default resolver.

When [extending the GraphQL schema](#extending-the-schema), the `resolversConfig` key can be used to define a custom configuration for a resolver, which can include:

* [authorization configuration](#authorization-with-auth) with the `auth` key
* [policies with the `policies`](#policies) key
* and [middlewares with the `middlewares`](#middlewares) key

##### Authorization configuration

By default, the authorization of a GraphQL request is handled through the [Users & Permissions plugin](#usage-with-the-users-permissions-plugin). A request is allowed if the appropriate permissions are given: for instance, if a 'Category' content-type exists and is queried through GraphQL with the `Query.categories` handler, the request is allowed if the appropriate `find` and/or `findOne` permission(s) for the 'Categories' content-type are given.

To change how this authorization is configured, use the `resolversConfig.auth` key that accepts:

* either `false` to fully bypass the authorization system and allow all requests,
* or a `scope`, as an array of strings, to define the scopes (i.e. permissions) that the request needs to have to be allowed.

::: details Examples of authorization configuration

```js

// path: .src/index.js

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Query.categories': {
          /**
           * Querying the Categories content-type
           * bypasses the authorization system.
           */ 
          auth: false
        },
        'Query.restaurants': {
          /**
           * Querying the Restaurants content-type
           * requires the find permission
           * on the 'Address' content-type
           * of the 'Address' API
           */
          scope: ['api::address.address.find']
        },
      }
    })
  }
}

```

:::

##### Policies

[Policies](/developer-docs/latest/development/backend-customization/policies.md) can be applied to a GraphQL resolver through the `resolversConfig.policies` key.

The `resolversConfig.policies` key is an array accepting a list of policies, each item in this list being either a reference to an already registered policy or an implementation that is passed directly (see [policies configuration documentation](/developer-docs/latest/development/backend-customization/routes.md#policies])).
<!-- TODO: remove this comment — the link won't work until merged with PR #450 -->

Policies directly implemented in `resolversConfig` are functions that take a `context` object and the `strapi` instance as arguments.
The `context` object gives access to:

* the `parent`, `args`, `context` and `info` arguments of the GraphQL resolver,
* Koa's [context](https://koajs.com/#context) with `context.http` and [state](https://koajs.com/#ctx-state) with `context.state`.

::: details Example of a custom GraphQL policy applied to a resolver

```js

// path: ./src/index.js

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Query.categories': {
          policies: [
            (context, { strapi }) => {
              console.log('hello', context.parent)
              /**
               * If 'categories' have a parent, the function returns true,
               * so the request won't be blocked by the policy.
               */ 
              return context.parent !== undefined;
            }
          ],
          auth: false,
        },
      }
    })
  }
}
```

:::

#### Middlewares

[Middlewares](/developer-docs/latest/development/backend-customization/middlewares.md) can be applied to a GraphQL resolver through the `resolversConfig.middlewares` key.

The `resolversConfig.middlewares` key is an array accepting a list of middlewares, each item in this list being either a reference to an already registered policy or an implementation that is passed directly (see [middlewares configuration documentation](/developer-docs/latest/development/backend-customization/routes.md#middlewares])).
<!-- TODO: remove this comment — the link won't work until merged with PR #450 -->

Middlewares directly implemented in `resolversConfig` can take the GraphQL resolver's `parent`, `args`, `context` and `info` objects as arguments.

:::tip
Middlewares with GraphQL can even act on nested resolvers, which offer a more granular control than with REST.
:::

:::details Examples of custom GraphQL middlewares applied to a resolver

```js

// path: ./src/index.js

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Query.categories': {
          middlewares: [
            /**
             * Basic middleware example #1
             * publish categories by changing publicationState values
             */
            async (next, parent, args, context, info ) => {
              console.time('Start resolving categories');
              if (args.publicationState) {
                args.publicationState = 'LIVE';
              }
              const res = await next(parent, args, context, info);
              console.timeEnd('Stop resolving categories');

              return res;
            },
            /**
             * Basic middleware example #2
             * change the 'name' attribute of parent with id 1 to 'foobar'
             */
            (resolve, parent, ...rest) => {
              console.log(parent);
              if (parent.id === 1) {
                return resolve({...parent, name: 'foobar' }, ...rest);
              }

              return resolve(parent, ...rest);
            }
          ],
          auth: false,
        },
      }
    })
  }
}
```

:::

## Usage with the Users & Permissions plugin

The [Users & Permissions plugin](/developer-docs/latest/plugins/users-permissions.md) is an optional plugin that allows protecting the API with a full authentication process.

### Registration

Usually you need to sign up or register before being recognized as a user then perform authorized requests.

:::request Mutation
```graphql
mutation {
  register(input: { username: "username", email: "email", password: "password" }) {
    jwt
    user {
      username
      email
    }
  }
}
```
:::

You should see a new user is created in the `Users` collection type in your Strapi admin panel.

### Authentication

To perform authorized requests, you must first get a JWT:

:::request Mutation

```graphql
mutation {
  login(input: { identifier: "email", password: "password" }) {
    jwt
  }
}
```

:::

Then on each request, send along an `Authorization` header in the form of `{ "Authorization": "Bearer YOUR_JWT_GOES_HERE" }`. This can be set in the HTTP Headers section of your GraphQL Playground.
