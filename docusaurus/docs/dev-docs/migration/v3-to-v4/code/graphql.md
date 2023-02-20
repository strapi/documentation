---
title: GraphQL resolvers
displayed_sidebar: devDocsSidebar
description: Migrate GraphQL resolvers from Strapi v3.6.x to v4.0.x with step-by-step instructions

sidebarDepth: 3
---

# v4 code migration: Updating GraphQL resolvers

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

:::strapi v3/v4 comparison

In Strapi v3, GraphQL resolvers are either automatically bound to REST controllers (from the core API) or customized using the `./api/<api-name>/config/schema.graphql.js` files.

In Strapi v4, [GraphQL](/dev-docs/plugins/graphql) dedicated core resolvers are automatically created for the basic CRUD operations for each API. Additional resolvers can be [customized programmatically](/dev-docs/plugins/graphql#customization) using GraphQL’s extension service, accessible using `strapi.plugin(’graphql’).service(’extension’)`.

:::

Migrating GraphQL resolvers to Strapi v4 requires:

* moving the Strapi v3 logic, found in `./api/<api-name>/config/schema.graphql.js` files, to [the `register` method](/dev-docs/configurations/functions#register) found in the `./src/index.js` file of Strapi v4
* and adapting the existing Strapi v3 code to take advantage of the GraphQL extension service introduced in Strapi v4, accessible through `strapi.plugin(’graphql’).service(’extension’)`.

:::note
The entire logic for Strapi v4 GraphQL resolvers doesn’t need to be in the `register` method of `./src/index.js` but it should be referenced from there.
:::

The following documentation provides use case examples of transforming Strapi v3 code to Strapi v4 code that uses the GraphQL extension service. The GraphQL extension service allows adding new definitions for types, queries, and mutations, replacing resolvers, disabling APIs and fields from APIs, and adding policies, middlewares and authorization.

## Adding new definitions

Adding new [types](#types), [queries](#queries) or [mutations](#mutations) definitions in Strapi v4 is done through the `use()` method of the [GraphQL extension service](/dev-docs/plugins/graphql#extending-the-schema).

### Types

**Strapi v3**:

The following code example adds a new `MyEnum` type definition to Strapi v3:

```jsx title="path: ./api/foo/config/schema.graphql.js"

module.exports = {
  definition: `
    enum MyEnum {
      a
      b
      c
    }
  `,
}
```

**Strapi v4**:

The Strapi v3 code example above should be replaced by the following code in Strapi v4:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => {
      const MyEnum = nexus.enumType({
        name: 'MyEnum',
        members: ['a', 'b', 'c'],
      });

      return { types: [MyEnum] };
    });
  }
}
```

:::note
It's recommended to use the [nexus](https://nexusjs.org/) definition instead of raw [SDL](https://graphql.org/learn/schema/), but it’s still possible to use `typeDefs` to write raw SDL.
:::

### Queries

**Strapi v3**:

The following code example adds a new query definition to Strapi v3:

```jsx title="path: ./api/foo/config/schema.graphql.js"

module.exports = {
  query: `
    myQuery(id: ID, status: MyInput, limit: Int): [MyQuery]!
  `,
  resolver: {
    Query: {
      myQuery: {
        resolver: 'application::api-name.content-type-name.customFind',
        // OR
        resolver: async (obj, options, { context }) => {
          await strapi.controllers.content-type-name.customFind(context);

          return context.body.myQuery || [];
        }
      }
    }
  },
}
```

**Strapi v4**:

The Strapi v3 code example above should be replaced by the following code in Strapi v4:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => {
      const myQuery = nexus.extendType({
        type: 'Query',
        definition(t) {
          //  myQuery definition
          t.field('myQuery', {
            // Response type
            type: nexus.nonNull(nexus.list('MyQuery')),

            // Args definition
            args: { id: 'ID', status: 'MyInput', limit: 'Int' },

            // Resolver definition
            resolve(parent, args, context) {
              const { id, status, limit } = args;
      
              return strapi.service('api::api-name.content-type-name').customFind(id, status, limit);
            }
          });
        }
      });

      return { types: [myQuery] };
    });
  }
}
```

:::note NOTES

* In Strapi v4, REST controllers and GraphQL resolvers are not coupled anymore. The business logic is implemented in services and called either from the controller or the resolver. This approach keeps the business logic in one place so both REST and GraphQL can be customized the way you want.

* In Strapi v4, it’s not recommended to reference a REST controller directly from the GraphQL resolver. However, you can still call it programmatically from the resolver definition.
:::

:::tip
The service that Strapi provides to perform queries is called the [Entity Service](/dev-docs/api/entity-service) and is available with `strapi.entityService`. It can be used to create queries or mutations.
:::

### Mutations

**Strapi v3**:

The following code example adds a new mutation definition to Strapi v3:

```jsx title="path: ./api/foo/config/schema.graphql.js"

module.exports = {
  mutation: `
    sendItemByEmail(itemID: ID!, email: String!): Boolean!
  `,
  resolver: {
    Mutation: {
      attachRestaurantToChef: {
        resolver: 'application::api-name.content-type-name.sendItemByEmail',
        // OR
        resolver: async (obj, options, { context }) {
          await strapi.controllers.content-type-name.sendItemByEmail(context);

          return context.body || false;
        }
      },
    },
  }
}
```

**Strapi v4**:

The Strapi v3 code example above should be replaced by the following code in Strapi v4:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => {
      const sendItemByEmailMutation = nexus.extendType({
        type: 'Mutation',
        definition(t) {
          // "sendItemByEmail" query definition
          t.field('sendItemByEmail', {
            // Response type
            type: nexus.nonNull('Boolean'),

            // Args definition
            args: { ItemID: nexus.nonNull('ID'), email: nexus.nonNull('String') },

            // Resolver definition
            resolve(parent, args, context) {
              const { ItemID, email } = args;
              
              return strapi.service('api::api-name.content-type-name').sendItemByEmail(itemID, email);
            }
          });
        }
      });

      return { types: [sendItemByEmailMutation] };
    });
  }
}
```

:::tip
The service that Strapi provides to perform queries is called the [Entity Service](/dev-docs/api/entity-service) and is available with `strapi.entityService`. It can be used to create queries or mutations.
:::

## Replacing resolvers

**Strapi v3**:

Strapi v3 offers 2 ways of replacing the behavior of a query or mutation resolver: have the resolver point to a REST controller, or create a new custom GraphQL resolver then associate the resolver to an existing query or mutation.

  <details>
  <summary> Example of a Strapi v3 resolver pointing to a REST controller</summary>

  ```jsx title="path: ./api/<content-type-name>/config/schema.graphql.js"

  module.exports = {
    query: `
      testQuery: myQuery
    `,
    resolver: {
      Query: {
        testQuery: {
          resolver: 'application::api-name.content-type-name.find',
        },
      },
    },
  };
  ```

  </details>

  <details>
  <summary> Example of creating a new custom resolver and associating it to an existing query in Strapi v3</summary>

  ```jsx title="path: ./api/<content-type-name>/config/schema.graphql.js"

  module.exports = {
    query: `
      testQuery: myQuery
    `,
    resolver: {
      Query: {
        testQuery: {
          resolver: async (obj, args) => {
            // custom logic here
            // ... 
  
            // Return response.
            return { myResult: 'some data' };
          },
        },
      },
    },
  };
  ```

  </details>

**Strapi v4**:

In Strapi v4, the recommended way to replace or customize a resolver is to use [the `resolvers` field](/dev-docs/plugins/graphql#extending-the-schema) of the new GraphQL extension service:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => ({
      resolvers: {
        Query: {
          testQuery: async (obj, args) => {
          // custom logic here
          // ... 

          // return response
          return { myResult: 'some data' };
        },
      }
    });
  }
}
```

## Disabling APIs and fields from APIs

**Strapi v3**:

In Strapi v3, a query resolver, a mutation resolver or a field is disabled by setting it to `false`:

```jsx title="path: ./api/<content-type-name>/config/schema.graphql.js"

module.exports = {
  // disable a query resolver
  resolver: {
    Query: {
      myQuery: false,
    },
  },
  // disable a field
  type: {
    myTypeQuery: {
      myField: false,
    },
  },
};
```

**Strapi v4**:

Strapi v4 uses programmatic APIs to [disable queries, mutation, actions or fields](/dev-docs/plugins/graphql#disabling-operations-in-the-shadow-crud). The Strapi v3 code example above should be replaced by the following code in Strapi v4:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // disable an action on a query
    extensionService.shadowCRUD('api::api-name.content-type-name').disableAction('find');
    // disable a field
    extensionService.shadowCRUD('api::api-name.content-type-name').field('myField').disable();
  }
}
```

***

## Adding policies

**Strapi v3**:

In Strapi v3, policies applied to a resolver are defined either for the REST controller or in the `schema.graphql.js` customization file:

```jsx title="path: ./api/foo/config/schema.graphql.js"

module.exports = {
  resolver: {
    Query: {
      findItems: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  },
};
```

**Strapi v4**:

In Strapi v4, policies applied to a resolver are explicitly defined in a `resolversConfig` object (see [GraphQL policies documentation](/dev-docs/plugins/graphql#policies)) and applied through the GraphQL extension service. The Strapi v3 code example above should be replaced by the following code in Strapi v4:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => ({
      resolversConfig: {
        'Query.findItems': {
          policies: ['admin::isAuthenticatedAdmin']
        }
      }
    }));
  }
}
```

:::note
Strapi v4 policies are not inherited from controllers anymore since the resolvers are stand-alone.
:::

## Adding middlewares

In Strapi v3, middlewares applied to a resolver are inherited from middlewares associated to the REST controller.

In Strapi v4, middlewares applied to a resolver are explicitly [defined in a `resolversConfig` object](/dev-docs/plugins/graphql#middlewares) and applied through the GraphQL extension service:

```jsx title="./src/index.js"

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(({ nexus }) => ({
      resolversConfig: {
        'Query.findItems': {
          middlewares: [
            (resolve, ...args) => {
              console.log("We're in a middleware");
              return resolve(...args);
            }
          ]
        }
      }
    }));
  }
}
```

## Adding authorization

The resolvers automatically generated in Strapi v4 are protected by authorization strategies. The actions can be customized and the authorization can be disabled through the `resolversConfig` object (see [GraphQL authorization documentation](/dev-docs/plugins/graphql#authorization-configuration)).
