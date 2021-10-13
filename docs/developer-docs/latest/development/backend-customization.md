---
title: Backend customization - Strapi Developer Documentation
description: …
---

<!-- TODO: update SEO -->

# Backend customization

## Routes

Strapi runs an http server. Requests can be handled on any URL by adding routes to Strapi.

Routes can be defined as an array of objects, each object with a `method`, a `path` and `handler`:

**Example**: Handle any GET request on the `/articles` url and call the `actionName` function on the `controllerName` [controller](#controllers):

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

Using routes is the first step towards creating custom JSON APIs to be used later on in the client application.

### Configuration

Routes can be configured with policies and middlewares.

#### Policies

Policies are a way to block access to a route. They are usually used for authorization purposes or to check for some accessibility conditions.

Policies can be added to a route configuration:

- by pointing to a policy registered in `./src/policies`, with or without using some custom configuration
- or by declaring the policy as a function that takes [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments

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

You can read more about policies [here](/developer-docs/latest/development/backend-customization/policies.md).

#### Middlewares

Middlewares are a way to control the request flow and change it. The request can also be changed before moving forward. Usually middlewares are mostly used for logging, caching, debuging, error handling, and security purposes.

Middlewares can be added to a route configuration:

- by pointing to a middleware registered in `./src/middlewares`, with or without using some custom configuration
- or by declaring the middleware as a function that takes [Koa's context](https://koajs.com/#context) (`ctx`) and the `strapi` instance as arguments:

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

You can read more about policies [here](./middlewares.md)

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

## Controllers

Once a route has been created, it should execute some code handled by a controller.

A controller can be added like follows:

```js
// path: .src/api/[apiName]/controllers/[controllerName].js (e.g './src/api/blog/controllers/articles.js')

module.exports = {
  actionName(ctx) {
    ctx.send({
      data: [
        {
          id: 1,
          title: 'My Article',
        },
      ],
    });
  },
};
```

As the logic implemented in the controller becomes more complex, it's a good practice to move that logic into its own layer to be reused and reorganised, using [services](#services).

## Services

Services are a generic way to build business logic. They are made available through `strapi.service()` and can encapsulate any logic.

To create a service, export a factory function that returns the service implementation (i.e. an object with methods). This factory function receives the `strapi` instance:

```js
/**
 * @param {{ strapi: import('@strapi/strapi').Strapi }} opts
 */
module.exports = ({ strapi }) => {
  return {
    archiveArticles(ids) {
      // do some logic here
    },
  };
};
```

Once a service is created, it's accessible from controllers or from other services:

```js
// access an API service
strapi.service('api::apiName.serviceName');

// access a plugin service
strapi.service('plugin::pluginName.serviceName');
```

::: tip
To list all the available services, run `yarn strapi services:list`.
<!-- TODO: add this to CLI reference -->
:::

## Policies

Policies are a way to block access to a route. They are usually used for authorization purposes or to check for some accessibility conditions.

They work for both REST routes and GraphQL resolvers when using the [GraphQL plugin](/developer-docs/latest/plugins/graphql.md).

To create a policy, create a `.js` file in one of the following folders:

- `src/policies/policy.js`
- `src/api/apiName/policies/policy.js`

To point to them in your routes you will need to follow the naming convention:

- `src/policies/policy.js` will be available at `global::policy`
- `src/api/apiName/policies/policy.js` will be available at `api::apiName.policy`

Policies can also be added by plugins and some are added by the admin.

A policy can be created as follows:

```js
module.exports = (policyContext, { strapi }) => {
  if (!hasAccess) {
    return false; // or throw an Error
  }

  return true; // If you return nothing Strapi considers you didn't want to block the request and will let it pass
};
```

The `policyContext` is a wrapper arround the usual [controller](#controller) context. It adds some logic if you want to implement a policy for both REST and GraphQL. (look into graphQL doc for it)

::: tip
To list all the available policies, run `yarn strapi policies:list`.
<!-- TODO: add this to CLI reference -->
:::

## Middlewares

This middleware syntax only works in REST. You can create graphQL middlewares too with a different syntax (check gql doc).

To create a middleware you should create a js file in one of the following folders:

- `src/middlewares/middleware.js`
- `src/api/apiName/middlewares/middleware.js`

To point to them in your routes you will need to follow the naming convention:

- `src/middlewares/middleware.js` will be available at `global::middleware`
- `src/api/apiName/middlewares/middleware.js` will be available at `api::apiName.middleware`

Middlewares can also be added by plugins and some are added by the admin.

::: tip
To list the registered middlewares you can run `yarn strapi middlewares:list`
:::

```js
module.exports = (config) => {
  return (ctx, next) => {};
};
```
