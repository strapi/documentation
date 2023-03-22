---
title: GraphQL
displayed_sidebar: devDocsSidebar
toc_max_heading_level: 5
description: Use a GraphQL endpoint in your Strapi project to fetch and mutate your content.

---


# GraphQL

By default Strapi create [REST endpoints](/dev-docs/api/rest#endpoints) for each of your content-types. With the GraphQL plugin, you will be able to add a GraphQL endpoint to fetch and mutate your content.

:::strapi Looking for the GraphQL API documentation?
The [GraphQL API reference](/dev-docs/api/graphql) describes queries, mutations and parameters you can use to interact with your API using Strapi's GraphQL plugin.
:::

## Usage

To get started with GraphQL in your application, please install the plugin first. To do that, open your terminal and run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi install graphql
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi install graphql
```

</TabItem>

</Tabs>

Then, start your app and open your browser at [http://localhost:1337/graphql](http://localhost:1337/graphql). You should now be able to access the **GraphQL Playground** that will help you to write your GraphQL queries and mutations.

:::note
The GraphQL Playground is enabled by default for both the development and staging environments, but disabled in production environments. Set the `playgroundAlways` configuration option to `true` to also enable the GraphQL Playground in production environments (see [plugins configuration documentation](/dev-docs/configurations/plugins#graphql-configuration)).
:::

## Configuration

Plugins configuration are defined in the `config/plugins.js` file. This configuration file can include a `graphql.config` object to define specific configurations for the GraphQL plugin (see [plugins configuration documentation](/dev-docs/configurations/plugins#graphql-configuration)).

[Apollo Server](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver) options can be set with the `graphql.config.apolloServer` [configuration object](/dev-docs/configurations/plugins#graphql-configuration). Apollo Server options can be used for instance to enable the [tracing feature](https://www.apollographql.com/docs/federation/metrics/), which is supported by the GraphQL playground to track the response time of each part of your query. From `Apollo Server` version 3.9 default cache option is `cache: 'bounded'`. You can change it in the `apolloServer` configuration. For more information visit [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/performance/cache-backends/).

:::caution
The maximum number of items returned by the response is limited to 100 by default. This value can be changed using the `amountLimit` configuration option, but should only be changed after careful consideration: a large query can cause a DDoS (Distributed Denial of Service) and may cause abnormal load on your Strapi server, as well as your database server.
:::

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

module.exports = {
  //
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default {
  //
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
};
```

</TabItem>

</Tabs>

## Shadow CRUD

To simplify and automate the build of the GraphQL schema, we introduced the Shadow CRUD feature. It automatically generates the type definitions, queries, mutations and resolvers based on your models.

**Example:**

If you've generated an API called `Document` using [the interactive `strapi generate` CLI](/dev-docs/cli#strapi-generate) or the administration panel, your model looks like this:

```json title="./src/api/[api-name]/content-types/document/schema.json"

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

<details> 
<summary>Generated GraphQL type and queries</summary>

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

input DocumentInput {
  name: String
  description: String
  locked: Boolean
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}

type Document {
  name: String
  description: String
  locked: Boolean
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime
}

type DocumentEntity {
  id: ID
  attributes: Document
}

type DocumentEntityResponse {
  data: DocumentEntity
}

type DocumentEntityResponseCollection {
  data: [DocumentEntity!]!
  meta: ResponseCollectionMeta!
}

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

</details>

## Customization

Strapi provides a programmatic API to customize GraphQL, which allows:

* disabling some operations for the [Shadow CRUD](#shadow-crud)
* [using getters](#using-getters) to return information about allowed operations
* registering and using an `extension` object to [extend the existing schema](#extending-the-schema) (e.g. extend types or define custom resolvers, policies and middlewares)

<details> 
<summary>Example of GraphQL customizations</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./src/index.js"

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');
    
    extensionService.shadowCRUD('api::restaurant.restaurant').disable();
    extensionService.shadowCRUD('api::category.category').disableQueries();
    extensionService.shadowCRUD('api::address.address').disableMutations();
    extensionService.shadowCRUD('api::document.document').field('locked').disable();
    extensionService.shadowCRUD('api::like.like').disableActions(['create', 'update', 'delete']);
    
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
          onAfterBuild(schema) {
            console.log(schema);
          },
        }),
      ],
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
      resolversConfig: {
        'Query.address': {
          auth: false,
        },
      },
    });
    extensionService.use(extension);
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./src/index.ts"

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');
    
    extensionService.shadowCRUD('api::restaurant.restaurant').disable();
    extensionService.shadowCRUD('api::category.category').disableQueries();
    extensionService.shadowCRUD('api::address.address').disableMutations();
    extensionService.shadowCRUD('api::document.document').field('locked').disable();
    extensionService.shadowCRUD('api::like.like').disableActions(['create', 'update', 'delete']);
    
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
          onAfterBuild(schema) {
            console.log(schema);
          },
        }),
      ],
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
      resolversConfig: {
        'Query.address': {
          auth: false,
        },
      },
    });
    extensionService.use(extension);
  },
};
```

</TabItem>

</Tabs>



</details>

### Disabling operations in the Shadow CRUD

The `extension` [service](/dev-docs/backend-customization/services) provided with the GraphQL plugin exposes functions that can be used to disable operations on Content-Types:

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

This extension, defined either as an object or a function returning an object, will be used by the `use()` function exposed by the `extension` [service](/dev-docs/backend-customization/services) provided with the GraphQL plugin.

The object describing the extension accepts the following parameters:

| Parameter         | Type   | Description                                                                                  |
| ----------------- | ------ | -------------------------------------------------------------------------------------------- |
| `types`           | Array  | Allows extending the schema types using [Nexus](https://nexusjs.org/)-based type definitions |
| `typeDefs`        | String | Allows extending the schema types using [GraphQL SDL](https://graphql.org/learn/schema/)     |
| `plugins`         | Array  | Allows extending the schema using Nexus [plugins](https://nexusjs.org/docs/plugins)          |
| `resolvers`       | Object | Defines custom resolvers                                                                     |
| `resolversConfig` | Object | Defines [configuration options for the resolvers](#custom-configuration-for-resolvers), such as [authorization](#authorization-configuration), [policies](#policies) and [middlewares](#middlewares) |

:::tip
The `types` and `plugins` parameters are based on [Nexus](https://nexusjs.org/). To use them, register the extension as a function that takes `nexus` as a parameter:

<details>
<summary> Example: </summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./src/index.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./src/index.ts"

export default {
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

</TabItem>

</Tabs>

</details>
:::

#### Custom configuration for resolvers

A resolver is a GraphQL query or mutation handler (i.e. a function, or a collection of functions, that generate(s) a response for a GraphQL query or mutation). Each field has a default resolver.

When [extending the GraphQL schema](#extending-the-schema), the `resolversConfig` key can be used to define a custom configuration for a resolver, which can include:

* [authorization configuration](#authorization-configuration) with the `auth` key
* [policies with the `policies`](#policies) key
* and [middlewares with the `middlewares`](#middlewares) key

##### Authorization configuration

By default, the authorization of a GraphQL request is handled by the registered authorization strategy that can be either [API token](/dev-docs/configurations/api-tokens) or through the [Users & Permissions plugin](#usage-with-the-users--permissions-plugin). The Users & Permissions plugin offers a more granular control.

<details>
<summary> Authorization with the Users & Permissions plugin</summary>

With the Users & Permissions plugin, a GraphQL request is allowed if the appropriate permissions are given.

For instance, if a 'Category' content-type exists and is queried through GraphQL with the `Query.categories` handler, the request is allowed if the appropriate `find` permission for the 'Categories' content-type is given.

To query a single category, which is done with the `Query.category` handler, the request is allowed if the the `findOne` permission is given.

Please refer to the user guide on how to [define permissions with the Users & Permissions plugin](/user-docs/users-roles-permissions/configuring-administrator-roles#editing-a-role).
</details>

To change how the authorization is configured, use the resolver configuration defined at `resolversConfig.[MyResolverName]`. The authorization can be configured:

* either with `auth: false` to fully bypass the authorization system and allow all requests,
* or with a `scope` attribute that accepts an array of strings to define the permissions required to authorize the request.

<details>
<summary> Examples of authorization configuration</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./src/index.js"

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
          auth: {
            scope: ['api::address.address.find']
          }
        },
      }
    })
  }
}

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./src/index.ts"

export default {
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
          auth: {
            scope: ['api::address.address.find']
          }
        },
      }
    })
  }
}

```

</TabItem>

</Tabs>
</details>

##### Policies

[Policies](/dev-docs/backend-customization/policies) can be applied to a GraphQL resolver through the `resolversConfig.[MyResolverName].policies` key.

The `policies` key is an array accepting a list of policies, each item in this list being either a reference to an already registered policy or an implementation that is passed directly (see [policies configuration documentation](/dev-docs/backend-customization/routes#policies)).

Policies directly implemented in `resolversConfig` are functions that take a `context` object and the `strapi` instance as arguments.
The `context` object gives access to:

* the `parent`, `args`, `context` and `info` arguments of the GraphQL resolver,
* Koa's [context](https://koajs.com/#context) with `context.http` and [state](https://koajs.com/#ctx-state) with `context.state`.

<details>
<summary> Example of a custom GraphQL policy applied to a resolver </summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./src/index.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./src/index.ts"

export default {
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

</TabItem>

</Tabs>

</details>

#### Middlewares

[Middlewares](/dev-docs/backend-customization/middlewares) can be applied to a GraphQL resolver through the `resolversConfig.[MyResolverName].middlewares` key.

The `middlewares` key is an array accepting a list of middlewares, each item in this list being either a reference to an already registered policy or an implementation that is passed directly (see [middlewares configuration documentation](/dev-docs/backend-customization/routes#middlewares)).

Middlewares directly implemented in `resolversConfig` can take the GraphQL resolver's [`parent`, `args`, `context` and `info` objects](https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments) as arguments.

:::tip
Middlewares with GraphQL can even act on nested resolvers, which offer a more granular control than with REST.
:::

<details>
<summary> Examples of custom GraphQL middlewares applied to a resolver</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title"./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Query.categories': {
          middlewares: [
            /**
             * Basic middleware example #1
             * Log resolving time in console
             */
            async (next, parent, args, context, info) => {
              console.time('Resolving categories');
              
              // call the next resolver
              const res = await next(parent, args, context, info);
              
              console.timeEnd('Resolving categories');

              return res;
            },
            /**
             * Basic middleware example #2
             * Enable server-side shared caching
             */
            async (next, parent, args, context, info) => {
              info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
              return next(parent, args, context, info);
            },
            /**
             * Basic middleware example #3
             * change the 'name' attribute of parent with id 1 to 'foobar'
             */
            (resolve, parent, ...rest) => {
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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title"./src/index.ts"

export default {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      resolversConfig: {
        'Query.categories': {
          middlewares: [
            /**
             * Basic middleware example #1
             * Log resolving time in console
             */
            async (next, parent, args, context, info) => {
              console.time('Resolving categories');
              
              // call the next resolver
              const res = await next(parent, args, context, info);
              
              console.timeEnd('Resolving categories');

              return res;
            },
            /**
             * Basic middleware example #2
             * Enable server-side shared caching
             */
            async (next, parent, args, context, info) => {
              info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
              return next(parent, args, context, info);
            },
            /**
             * Basic middleware example #3
             * change the 'name' attribute of parent with id 1 to 'foobar'
             */
            (resolve, parent, ...rest) => {
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

</TabItem>

</Tabs>

</details>

## Usage with the Users & Permissions plugin

The [Users & Permissions plugin](/dev-docs/plugins/users-permissions) is an optional plugin that allows protecting the API with a full authentication process.

### Registration

Usually you need to sign up or register before being recognized as a user then perform authorized requests.


<Request title="Mutation">

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

</Request>

You should see a new user is created in the `Users` collection type in your Strapi admin panel.

### Authentication

To perform authorized requests, you must first get a JWT:

<Request title="Mutation">

```graphql
mutation {
  login(input: { identifier: "email", password: "password" }) {
    jwt
  }
}
```

</Request>

Then on each request, send along an `Authorization` header in the form of `{ "Authorization": "Bearer YOUR_JWT_GOES_HERE" }`. This can be set in the HTTP Headers section of your GraphQL Playground.


## API tokens

To use API tokens for authentication, pass the token in the `Authorization` header using the format `Bearer your-api-token`.

:::note
Using API tokens in the the GraphQL playground requires adding the authorization header with your token in the `HTTP HEADERS` tab:

```http
{
  "Authorization" : "Bearer <TOKEN>"
}
```

Replace `<TOKEN>` with your API token generated in the Strapi Admin panel.
:::

## Security

As GraphQL is a query language, it allows users to use a wider pannel of inputs than traditional REST APIs.

Due to this feature, GraphQL APIs are inherently prone to various security risks, but they can be reduced by taking appropriate precautions.
Neglecting them can expose the API to vulnerabilities like credential leakage or denial of service attacks.

### Disable introspection and playground in production

In production, it is recommended to disable the GraphQL Playground and the introspection query.
If you havent edited the [configuration file](/dev-docs/configurations/plugins#graphql-configuration), it must be already disabled.

### Limit max depth and complexity

The depth limit is the maximum number of nested fields that can be queried in a single request.
During your test and depending on your use case, you can set the `depthLimit` option to a higher value.

But a malicious user could send a query with a very high depth, which could your server to stop responding or crash.

Review the [configuration file](/dev-docs/configurations/plugins#graphql-configuration) to set this options.

### Install graphql armor

[Graphql armor](https://github.com/Escape-Technologies/graphql-armor) is a GraphQL middleware that protects your GraphQL API from malicious queries.
Installing it is simple and it prevent the most common attacks.

Here is a configuration example to protect your GraphQL API :

```js
const armor = require('@escape.tech/graphql-armor');
// GraphQL Armor installed via :
//   npm install @escape.tech/graphql-armor

const ApolloArmor = new armor.ApolloArmor();
module.exports = {
  graphql: {
    config: {
      apolloServer: {
        introspection: false,     // <-- your custom config
        ...ApolloArmor.protect()  // <-- add armor protection
      },
    },
  },
};
```

Read more about graphql armor on the [dev documentation of armor](https://escape.tech/graphql-armor/docs/getting-started).

### Continuous security testing

One of the best way to stop wondering about security for your API is to be able to scan it each time you deploy it into
staging or production environments. As you run your unit tests in your CI/CD pipeline, you can bullet-proof your GraphQL
application before it even reaches a production environment.

#### graphql.security

[graphql.security](https://graphql.security/) is a free, quick graphql security testing tool, allowing you to quickly assess the most common vulnerabilities in your application.

#### Escape

[Escape](https://escape.tech/) is a GraphQL security SaaS platform running an automated pentest tool.

You can effortlessly incorporate this platform into your current CI/CD pipeline such as Github Actions or Gitlab CIs
which makes it convenient to set up.

The security notifications will be automatically communicated to your CI/CD platform, enabling you to promptly attend to them.
