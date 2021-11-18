---
title: Routes - Strapi Developer Documentation
description: …
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Routes

Requests sent to Strapi on any URL are handled by routes. By default, Strapi generates routes for all the content-types (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md)). Routes can be [added](#implementation) and configured:

- with [policies](#policies), which are a way to block access to a route,
- and with [middlewares](#middlewares), which are a way to control and change the request flow and the request itself.

Once a route exists, reaching it executes some code handled by a controller (see [controllers](/developer-docs/latest/development/backend-customization/controllers.md) documentation).

## Implementation

Implementing a new route consists in defining it in a router file within the `.src/api/[apiName]/routes` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

There are two different router file structures depending on if you are configuring the core routers or creating your own custom routers. Strapi provides a `createCoreRouter` factory function that automatically generates and allows for configuration of the core routers.

### Core Routers

For core routers (`find`, `findOne`, `create`, `update`, and `delete`), a default file is created that allows passing in some configuration options to each router and allowing you to disable certain core routers so you can create your own custom ones. The core router file structure has the following parameters:

| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| `prefix`  | Allows passing in a custom prefix to add to all routers for this model (e.g. `/test`)        | `String` |
| `only`    | Array of core routes that will only be loaded, anything not in this array is ignored         | `Array` |
| `except`  | Array of core routes that should not be loaded, functionally the opposite of the only option | `Array` |
| `config`  | Configuration to handle [policies](policies), [middlewares](middlewares) and [public availability](#public-routes) for the route | `Object` |

Full Core Router configuration example:

```js
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  prefix: '',
  only: ['find', 'findOne'],
  except: [],
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});
```

Generic implementation example:

To only allow a `GET` request on the `/restaurants` path from the core `find` [controller](/developer-docs/latest/development/backend-customization/controllers.md) without authentication, use the following code:

::: details Example of disabling authentication on a core route
```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/restaurant.js')

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  only: ['find'],
  config: {
    find: {
      auth: false
      policies: [],
      middlewares: [],
    }
  }
});
```

:::

### Custom Routers

For custom routers you will need to generate another router file that doesn't use the `createCoreRouter` factory this router file consists of an array of objects, each object being a route with the following parameters:

| Parameter                  | Description                                                                      | Type     |
| -------------------------- | -------------------------------------------------------------------------------- | -------- |
| `method`                   | Method associated to the route (i.e. `GET`, `POST`, `PUT`, `DELETE` or `PATCH`)  | `String` |
| `path`                     | Path to reach, starting with a forward-leading slash (e.g. `/articles`)| `String` |
| `handler`                  | Function to execute when the route is reached.<br>Should follow this syntax: `<controllerName>.<actionName>` | `String` |
| `config`<br><br>_Optional_ | Configuration to handle [policies](policies), [middlewares](middlewares) and [public availability](#public-routes) for the route<br/><br/>           | `Object` |

Generic implementation example:

The router used by Strapi allows the creation of dynamic routes, using parameters and regular expressions. These parameters will be exposed in the `ctx.params` object. For more details, please refer to the [PathToRegex](https://github.com/pillarjs/path-to-regexp) documentation.

::: details Example of routes using URL parameters and regular expressions
```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/custom-restaurant.js')

module.exports = {
  routes: [
    { // Path defined with a URL parameter
      method: 'GET',
      path: '/restaurants/:category/:id',
      handler: 'Restaurant.findOneByCategory',
    },
    { // Path defined with a regular expression
      method: 'GET',
      path: '/restaurants/:region(\\d{2}|\\d{3})/:id', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'Restaurant.findOneByRegion',
    }
  ]
}
```

:::

## Configuration

Both the core routers and any custom routers you define in additional files have the same configuration options and is defined in its `config` object, which can be used to handle [policies](#policies) and [middlewares](#middlewares) or to [make the route public](#public-routes).

### Policies

[Policies](/developer-docs/latest/development/backend-customization/policies.md) can be added to a route configuration:

- by pointing to a policy registered in `./src/policies`, with or without passing a custom configuration
- or by declaring the policy implementation directly, as a function that takes `policyContext` to extend [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments (see [policies documentation](/developer-docs/latest/development/backend-customization/routes.md))

:::: tabs

::: tab Core Router - Policy

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/restaurant.js')

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      policies: [
        // point to a registered policy
        'policy-name',

        // point to a registered policy with some custom configuration
        { name: 'policy-name', config: {} }, 
        
        // pass a policy implementation directly
        (policyContext, config, { strapi }) => {
          return true;
        },
      ]
    }
  }
});
```

:::

::: tab Custom Router - Policy

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/custom-restaurant.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'controllerName.actionName',
      config: {
        policies: [
          // point to a registered policy
          'policy-name',

          // point to a registered policy with some custom configuration
          { name: 'policy-name', config: {} }, 

          // pass a policy implementation directly
          (policyContext, config, { strapi }) => {
            return true;
          },
        ]
      },
    },
  ],
};
```

:::

::::

### Middlewares

[Middlewares](/developer-docs/latest/development/backend-customization/middlewares.md) can be added to a route configuration:

- by pointing to a middleware registered in `./src/middlewares`, with or without passing a custom configuration
- or by declaring the middleware implementation directly, as a function that takes [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments:

:::: tabs

::: tab Core Router - Middleware

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/restaurant.js')

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      middlwares: [
        // point to a registered middleware
        'middleware-name', 

        // point to a registered middleware with some custom configuration
        { name: 'middleware-name', config: {} }, 

        // pass a middleware implementation directly
        (ctx, next) => {
          return next();
        },
      ]
    }
  }
});
```

:::

::: tab Custom Router - Middleware

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/custom-restaurant.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'controllerName.actionName',
      config: {
        middlewares: [
          // point to a registered middleware
          'middleware-name', 

          // point to a registered middleware with some custom configuration
          { name: 'middleware-name', config: {} }, 

          // pass a middleware implementation directly
          (ctx, next) => {
            return next();
          },
        ],
      },
    },
  ],
};
```

:::

::::

### Public routes

By default, routes are protected by Strapi's authentication system, which is based on [API tokens](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md#api-tokens) or the use of a plugin such as the [Users & Permissions plugin](/user-docs/latest/plugins/strapi-plugins.md#users-permissions-plugin).

In some scenarios, it can be useful to have a route publicly available and control the access outside of the normal Strapi authentication system. This can be achieved by setting the `auth` configuration parameter of a route to `false`:

:::: tabs

::: tab Core Router - Public

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/restaurant.js')

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      auth: false
    }
  }
});
```

:::

::: tab Custom Router - Public

```js
// path: ./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/custom-restaurant.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'controllerName.actionName',
      config: {
        auth: false,
      },
    },
  ],
};
```

:::

::::
