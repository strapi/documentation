---
title: Routes - Strapi Developer Documentation
description: …
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Routes

Strapi runs an HTTP server. Requests sent to Strapi on any URL are handled by routes. By default, Strapi generates routes for all the content-types (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md)). But just like [all the other parts of the Strapi backend](/developer-docs/latest/development/backend-customization.md), routes can be customized. New routes [can be added](#implementation) and configured:

- with [policies](#policies), which are a way to block access to a route,
- and with [middlewares](#middlewares), which are a way to control and change the request flow and the request itself.

Once a route exists, reaching it executes some code handled by a controller (see [controllers](/developer-docs/latest/development/backend-customization/controllers.md) documentation).

## Implementation

Implementing a new route consists in defining it in a router file within the `.src/api/[apiName]/routes` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

A router file consists in an array of objects, each object being a route with the following parameters:

| Parameter                  | Description                                                                      | Type     |
| -------------------------- | -------------------------------------------------------------------------------- | -------- |
| `method`                   | Method associated to the route (i.e. `GET`, `POST`, `PUT`, `DELETE` or `PATCH`)  | `String` |
| `path`                     | URL to reach                                                                     | `String` |
| `handler`                  | Function to execute when the route is reached.<br>Should follow this syntax: `<controllerName>.<actionName>` | `String` |
| `config`<br><br>_Optional_ | Configuration to handle [policies](policies) and [middlewares](middlewares) applied to the route<br/><br/>           | `Object` |

**Example**: To handle any GET request on the `/articles` URL and call the `actionName` function on the `controllerName` [controller](#controllers):

```js
// path: .src/api/[apiName]/routes/[routerName].js (e.g '.src/api/blog/routes/articles.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'controllerName.actionName',
    },
  ],
};
```

The router used by Strapi allows the creation of dynamic routes, using parameters and simple regular expressions. These parameters will be exposed in the `ctx.params` object. For more details, please refer to the [PathToRegex](https://github.com/pillarjs/path-to-regexp) documentation.

::: details Example of routes using URL parameters and regular expressions
```js
// path: .src/api/[apiName]/routes/[routerName].js (e.g '.src/api/blog/routes/articles.js')

module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/restaurants/:category/:id",
      "handler": "Restaurant.findOneByCategory",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/restaurants/:region(\\d{2}|\\d{3})/:id", // Only match when the first parameter contains 2 or 3 digits.
      "handler": "Restaurant.findOneByRegion",
      "config": {
        "policies": []
      }
    }
  ]
}
```

:::

## Configuration

The optional configuration for a route is defined in its `config` object, which can be used to handle [policies](#policies) and [middlewares](#middlewares) or to [make the route public](#public-routes).

### Policies

Policies can be added to a route configuration:

- by pointing to a policy registered in `./src/policies`, with or without passing a custom configuration
- or by declaring the policy implementation directly, as a function that takes [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments
<!-- ? can we use `ctx`, `next`, and also `{ strapi }` here ? -->

```js
// path: .src/api/[apiName]/routes/[routerName].js (e.g '.src/api/blog/routes/articles.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'controllerName.actionName',
      config: {
        policies: [
          'policy-name', // point to a registered policy
          { name: 'policy-name', config: {} }, // point to a registered policy with some custom configuration
          // pass a policy implementation directly
          (ctx, { strapi }) => {
            return true;
          },
        ],
      },
    },
  ],
};
```

### Middlewares

Middlewares can be added to a route configuration:

- by pointing to a middleware registered in `./src/middlewares`, with or without passing a custom configuration
- or by declaring the middleware implementation directly, as a function that takes [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments:
<!-- ? can we use `ctx`, `next`, and also `{ strapi }` here ? -->

```js
// path: .src/api/[apiName]/routes/[routerName].js (e.g '.src/api/blog/routes/articles.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'controllerName.actionName',
      config: {
        middlewares: [
          'middleware-name', // point to a registered middleware
          { name: 'middleware-name', config: {} }, // point to a registered middleware with some custom configuration
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

### Public routes

By default, routes are protected by Strapi's authentication system, which is based on API tokens and/or the use of a plugin such as the [Users & Permissions plugin](/user-docs/latest/plugins/strapi-plugins.html#users-permissions-plugin).

In some scenarios, it can be useful to have a route publicly available, and control the access outside of the normal Strapi authentication system. This can be achieved by setting the `auth` configuration parameter of a route to `false`:

```js
// path: .src/api/[apiName]/routes/[routerName].js (e.g '.src/api/blog/routes/articles.js')

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'controllerName.actionName',
      config: {
        auth: false,
      },
    },
  ],
};
```

***


