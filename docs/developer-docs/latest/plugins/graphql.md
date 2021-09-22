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

## Registration

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

You should see a new user is created in `Users` collection type in your Strapi admin panel.

## Authentication

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

## Configurations

By default, the [Shadow CRUD](#shadow-crud) feature is enabled and the GraphQL is set to `/graphql`. The Playground is enabled by default for both the development and staging environments, however it is disabled in production. By changing the config option `playgroundAlways` to true, you can enable it.

Security limits on maximum number of items in your response by default is limited to 100, however you can change this on the following config option `amountLimit`. This should only be changed after careful consideration of the drawbacks of a large query which can cause what would basically be a DDoS (Distributed Denial of Service). And may cause abnormal load on your Strapi server, as well as your database server.

You can also setup any [Apollo Server options](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver) with the `apolloServer` option. For example, you can enable the tracing feature, which is supported by the playground to track the response time of each part of your query. To enable this feature just change/add the `"tracing": true` option in the GraphQL settings file. You can read more about the tracing feature from Apollo [here](https://www.apollographql.com/docs/apollo-server/federation/metrics/).

You can edit these configurations by creating following file.

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

To simplify and automate the build of the GraphQL schema, we introduced the Shadow CRUD feature. It automatically generates the type definition, queries, mutations and resolvers based on your models. The feature also lets you make complex query with many arguments such as `limit`, `sort`, `start` and `where`.

:::note
If you use a local plugin, the controller methods of your plugin are not created by default. In order for the Shadow CRUD to work you have to define them in your controllers for each of your models. You can find examples of controllers `findOne`, `find`, `create`, `update` and `delete` there : [Core controllers](/developer-docs/latest/development/backend-customization/controllers.md).
:::

**Example:**

If you've generated an API called `Restaurant` using the CLI `strapi generate:api restaurant` or the administration panel, your model looks like this:

```json
// path: ./api/[api-name]/content-types/restaurant/schema.json

{
  "connection": "default",
  "options": {
    "timestamps": true
  },
  "attributes": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "text"
    },
    "open": {
      "type": "boolean"
    }
  }
}
```

The generated GraphQL type and queries will be:

```graphql
// Restaurant's Type definition
type Restaurant {
  _id: String
  created_at: String
  updated_at: String
  name: String
  description: String
  open: Boolean
}

// Queries to retrieve one or multiple restaurants.
type Query {
  restaurants(sort: String, limit: Int, start: Int, where: JSON): [Restaurant]
  restaurant(id: String!): Restaurant
}

// Mutations to create, update or delete a restaurant.
type Mutation {
  createRestaurant(input: createRestaurantInput): createRestaurantPayload!
  updateRestaurant(input: updateRestaurantInput): updateRestaurantPayload!
  deleteRestaurant(input: deleteRestaurantInput): deleteRestaurantPayload!
}
```

The queries and mutations will use the generated controller's actions as resolvers. It means that the `restaurants` query will execute the `Restaurant.find` action, the `restaurant` query will use the `Restaurant.findOne` action and the `createRestaurant` mutation will use the `Restaurant.create` action, etc.

## Customization

Strapi provides a programmatic API to customize GraphQL, which allows:

* disabling some operations through the [Shadow CRUD](#shadow-crud)
* registering and using an `extension` object to extend the existing schema (e.g. extend types or  define custom resolvers)

::: details Example of a full GraphQL customization file:
```js
// path: /config/functions/register.js

'use strict';
​
/**
 * An asynchronous register function that runs before
 * your application is loaded.
 *
 * This gives you an opportunity to extend code.
 */
​
module.exports = ({ strapi }) => {
  const extensionService = strapi.plugin('graphql').service('extension');
​
  extensionService.shadowCRUD('api::restaurant.restaurant').disable();
  extensionService.shadowCRUD('api::category.category').disableQueries();
  extensionService.shadowCRUD('api::address.address').disableMutations();
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
};
```

:::

### Disabling operations in the Shadow CRUD

The `extension` [service](/developer-docs/latest/development/backend-customization/services.md) provided with the GraphQL plugin exposes functions that can be used to disable some actions on Content-Types:

| Function             | Description                                    | Argument type    | Possible argument values |
| -------------------- | ---------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `disable()`          | Fully disable the Content-Type                 | -                | -                                                                                                          |
| `disableQueries()`   | Only disable queries for the Content-Type      | -                | -                                                                                                          |
| `disableMutations()` | Only disable mutations for the Content-Type    | -                | -                                                                                                          |
| `disableAction()`    | Disable a specific action for the Content-Type | String           | One value from the list:<ul><li>`create`</li><li>`read`</li><li>`update`</li><li>`delete`</li></ul>   |
| `disableActions()`    | Disable specific actions for the Content-Type  | Array of Strings | Multiple values from the list: <ul><li>`create`</li><li>`read`</li><li>`update`</li><li>`delete`</li></ul> |

**Example:**

To disable the read operation on the "restaurant" Content-Type in the "restaurant" API, use:

```js
strapi.plugin('graphql').service('extension').shadowCRUD('api::restaurant.restaurant').disableAction('read')
```

### Extending the schema

The schema generated by the Content API can be extended by registering an extension.

This extension, defined either as an object or a function returning an object, will be used by the `use()` function exposed by the `extension` [service](/developer-docs/latest/development/backend-customization/services.md) provided with the GraphQL plugin.

The object describing the extension accepts the following parameters:

| Parameter         | Type   | Description                                                                                  |
| ----------------- | ------ | -------------------------------------------------------------------------------------------- |
| `types`           | Array  | Allows extending the schema types using [Nexus](https://nexusjs.org/)-based type definitions |
| `plugins`         | Array  | Allows extending the schema using Nexus [plugins](https://nexusjs.org/docs/plugins)          |
| `typeDefs`        | String | Allows extending the schema types using [GraphQL SDL](https://graphql.org/learn/schema/)     |
| `resolvers`       | Object | Defines custom resolvers                                                                     |
| `resolversConfig` | Object | Defines configuration options for the resolver                                               |

::::tip
The `types` and `plugins` parameters are based on [Nexus](https://nexusjs.org/). To use them, register the extension as a function returning an object to allow access to the `nexus` library.

::: details Example:
```js
// path: /config/functions/register.js

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
```
:::
::::

<!-- ## Customize the GraphQL schema

TODO: update this part — not sure if it's implemented yet / I don't have dev draft

If you want to define a new scalar, input or enum types, this section is for you. To do so, you will have to create a `schema.graphql.js` file. This file has to be placed into the config folder of each API `./api/*/config/schema.graphql.js` or plugin `./extensions/*/config/schema.graphql.js`.

**Structure —** `schema.graphql.js`.

```js
module.exports = {
  definition: ``,
  query: ``,
  type: {},
  resolver: {
    Query: {},
  },
};
```

- `definition` (string): lets you define new type, input, etc.
- `query` (string): where you add custom query.
- `mutation` (string): where you add custom mutation.
- `type` (object): allows you to add description, deprecated field or disable the [Shadow CRUD](#shadow-crud) feature on a specific type.
- `resolver` (object):
  - `Query` (object): lets you define custom resolver, policies for a query.
  - `Mutation` (object): lets you define custom resolver, policies for a mutation.

### Example

Let say we are using the same previous `Restaurant` model.

**Path —** `./api/restaurant/config/schema.graphql.js`

```js
module.exports = {
  definition: `
    enum RestaurantStatusInput {
      work
      open
      closed
    }
  `,
  query: `
    restaurantsByChef(id: ID, status: RestaurantStatusInput, limit: Int): [Restaurant]!
  `,
  mutation: `
    attachRestaurantToChef(id: ID, chefID: ID): Restaurant!
  `,
  resolver: {
    Query: {
      restaurant: {
        description: 'Return a single restaurant',
        policies: ['plugins::users-permissions.isAuthenticated', 'isOwner'], // Apply the 'isAuthenticated' policy of the `Users & Permissions` plugin, then the 'isOwner' policy before executing the resolver.
      },
      restaurants: {
        description: 'Return a list of restaurants', // Add a description to the query.
        deprecated:
          'This query should not be used anymore. Please consider using restaurantsByChef instead.',
      },
      restaurantsByChef: {
        description: 'Return the restaurants open by the chef',
        resolver: 'application::restaurant.restaurant.findByChef',
      },
      restaurantsByCategories: {
        description: 'Return the restaurants open by the category',
        resolverOf: 'application::restaurant.restaurant.findByCategories', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, { context }) => {
          // context is the context of the Koa request.
          await strapi.controllers.restaurants.findByCategories(context);

          return context.body.restaurants || `There is no restaurant.`;
        },
      },
    },
    Mutation: {
      attachRestaurantToChef: {
        description: 'Attach a restaurant to an chef',
        policies: ['plugins::users-permissions.isAuthenticated', 'isOwner'],
        resolver: 'application::restaurant.restaurant.attachToChef',
      },
    },
  },
};
```

### Define a new type

Edit the `definition` attribute in one of the `schema.graphql.js` files of your project by using the GraphQL Type language string.

::: tip
The easiest way is to create a new model using the CLI `strapi generate:model category --api restaurant`, so you don't need to customize anything.
:::

```js
module.exports = {
  definition: `
    type Person {
      id: Int!
      firstname: String!
      lastname: String!
      age: Int
      children: [Person]
    }
  `,
};
```

To explore the data of the new type `Person`, you need to define a query and associate a resolver to this query.

```js
module.exports = {
  definition: `
    type Person {
      id: Int!
      firstname: String!
      lastname: String!
      age: Int
      children: [Person]
    }
  `,
  query: `
    person(id: Int!): Person
  `,
  type: {
    Person: {
      _description: 'The Person type description', // Set the description for the type itself.
      firstname: 'The firstname of the person',
      lastname: 'The lastname of the person',
      age: {
        description: 'The age of the person',
        deprecated: 'We are not using the age anymore, we can find it thanks to our powerful AI'
      },
      children: 'The children of the person'
    }
  }
  resolver: {
    Query: {
      person: {
        description: 'Return a single person',
        resolver: 'application::person.person.findOne' // It will use the action `findOne` located in the `Person.js` controller.
      }
    }
  }
};
```

::: tip
The resolver parameter also accepts an object as a value to target a controller located in a plugin.
:::

```js
module.exports = {
  ...
  resolver: {
    Query: {
      person: {
        description: 'Return a single person',
        resolver: 'plugins::users-permissions.user.findOne'
      }
    }
  }
};
```

### Add description and deprecated reason

One of the most powerful features of GraphQL is the auto-documentation of the schema. The GraphQL plugin allows you to add a description to a type, a field and a query. You can also deprecate a field or a query.

**Path —** `./api/restaurant/models/Restaurant.settings.json`

```json
{
  "connection": "default",
  "info": {
    "description": "The Restaurant type description"
  },
  "options": {
    "timestamps": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "description": "The name of the restaurant",
      "deprecated": "We are not using the name anymore, it is auto-generated thanks to our powerful AI"
    },
    "description": {
      "type": "text",
      "description": "The description of the restaurant."
    },
    "open": {
      "type": "boolean",
      "description": "Is the restaurant open or not. Yes = true."
    }
  }
}
```

It might happen that you want to add a description to a query or deprecate it. To do that, you need to use the `schema.graphql.js` file.

:::caution
The `schema.graphql.js` file has to be placed into the config folder of each API `./api/*/config/schema.graphql.js` or plugin `./extensions/*/config/schema.graphql.js`.
:::

**Path —** `./api/restaurant/config/schema.graphql.js`

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants', // Add a description to the query.
        deprecated:
          'This query should not be used anymore. Please consider using restaurantsByChef instead.', // Deprecate the query and explain the reason why.
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        deprecated: 'Please use the dashboard UI instead',
      },
    },
  },
};
```

### Execute a policy before a resolver

Sometimes a query needs to be only accessible to authenticated user. To handle this, Strapi provides a solid policy system. A policy is a function executed before the final action (the resolver). You can define an array of policy that will be executed in order.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants',
        policies: [
          'plugins::users-permissions.isAuthenticated',
          'isOwner', // will try to find the policy declared in the same api as this schema file.
          'application::otherapi.isMember',
          'global::logging',
        ],
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        policies: ['plugins::users-permissions.isAuthenticated', 'global::logging'],
      },
    },
  },
};
```

In this example, the policy `isAuthenticated` located in the `users-permissions` plugin will be executed first. Then, the `isOwner` policy located in the `Restaurant` API `./api/restaurant/config/policies/isOwner.js`. Next, it will execute the `logging` policy located in `./config/policies/logging.js`. Finally, the resolver will be executed.

::: tip
There is no custom resolver in that case, so it will execute the default resolver (Restaurant.find) provided by the Shadow CRUD feature.
:::

### Link a query or mutation to a controller action

By default, the plugin will execute the actions located in the controllers that have been generated via the Content-Type Builder plugin or the CLI. For example, the query `restaurants` is going to execute the logic inside the `find` action in the `Restaurant.js` controller. It might happen that you want to execute another action or a custom logic for one of your queries.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolver: 'application::restaurant.restaurant.findByChef',
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        resolver: 'application::restaurant.restaurant.customCreate',
      },
    },
  },
};
```

In this example, it will execute the `findByChef` action of the `Restaurant` controller. It also means that the resolver will apply on the `restaurants` query the permissions defined on the `findByChef` action (through the administration panel).

::: tip
The `obj` parameter is available via `ctx.params` and the `options` are available via `ctx.query` in the controller's action.
:::

The same process is also applied for the `createRestaurant` mutation. It will execute the `customCreate` action of the `Restaurant` controller.

::: tip
The `where` parameter is available via `ctx.params` and the `data` are available via `ctx.request.body` in the controller's action.
:::

### Define a custom resolver

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolver: (obj, options, { context }) => {
          // You can return a raw JSON object or a promise.

          return [
            {
              name: 'My first blog restaurant',
              description: 'Whatever you want...',
            },
          ];
        },
      },
    },
    Mutation: {
      updateRestaurant: {
        description: 'Update an existing restaurant',
        resolver: async (obj, options, { context }) => {
          // The `where` and `data` parameters passed as arguments
          // of the GraphQL mutation are available via the `context` object.
          const where = context.params;
          const data = context.request.body;

          return await strapi.api.restaurant.services.restaurant.addRestaurant(data, where);
        },
      },
    },
  },
};
```

You can also execute a custom logic like above. However, the roles and permissions layers won't work.

### Apply permissions on a query

It might happen that you want to apply our permissions layer on a query. That's why, we created the `resolverOf` attribute. This attribute defines which are the permissions that should be applied to this resolver. By targeting an action it means that you're able to edit permissions for this resolver directly from the administration panel.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolverOf: 'application::restaurant.restaurant.find', // Will apply the same policy on the custom resolver as the controller's action `find` located in `Restaurant.js`.
        resolver: (obj, options, { context }) => {
          // You can return a raw JSON object or a promise.

          return [
            {
              name: 'My first blog restaurant',
              description: 'Whatever you want...',
            },
          ];
        },
      },
    },
    Mutation: {
      updateRestaurant: {
        description: 'Update an existing restaurant',
        resolverOf: 'application::restaurant.restaurant.update', // Will apply the same policy on the custom resolver than the controller's action `update` located in `Restaurant.js`.
        resolver: async (obj, options, { context }) => {
          const where = context.params;
          const data = context.request.body;

          return await strapi.api.restaurant.services.restaurant.addRestaurant(data, where);
        },
      },
    },
  },
};
```

### Disable a query or a type

To do that, we need to use the `schema.graphql.js` like below:

```js
module.exports = {
  type: {
    Restaurant: false, // The Restaurant type won't be "queryable" or "mutable".
  },
  resolver: {
    Query: {
      restaurants: false, // The `restaurants` query will no longer be in the GraphQL schema.
    },
    Mutation: {
      createRestaurant: false,
      deletePOst: false,
    },
  },
};
```

### Disable a type attribute

To do that, we need to use the `schema.graphql.js` like below:

```js
module.exports = {
  type: {
    Restaurant: {
      name: false, // The Restaurant's name won't be "queryable" or "mutable".
    }
  },
  resolver: {
    Query: {
      // ...
    },
    Mutation: {
      // ...
    },
  },
};
``` -->

## FAQ

**How are the types name defined?**

The type name is the global ID of the model. You can find the global ID of a model like that `strapi.models[xxx].globalId` or `strapi.plugins[xxx].models[yyy].globalId`.

**Where should I put the field description and deprecated reason?**

We recommend putting the field description and deprecated reason in the model. Right now, the GraphQL plugin is the only which uses these fields. Another plugin could use this description in the future as well. However, sometimes you don't have the choice, especially when you're defining a custom type.

:::note
It's not a bad practice to put the description and deprecated attribute in the `schema.graphql.js`, though.
:::

**Why are the "createdAt" and "updatedAt" field added to my type?**

The plugin detects if the `timestamps` option is set to `true` in the model. By default, when you generate an API this option is checked. Set it to `false` in your model to remove these fields.
