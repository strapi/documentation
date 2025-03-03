---
title: Routes
description: Strapi routes handle requests to your content and are auto-generated for your content-types. Routes can be customized according to your needs.
displayed_sidebar: cmsSidebar
tags:
- backend customization
- backend server
- controllers
- core routers
- custom routers
- ctx
- middlewares
- policies
- public routes
- REST API 
- routes
---

# Routes

Requests sent to Strapi on any URL are handled by routes. By default, Strapi generates routes for all the content-types (see [REST API documentation](/cms/api/rest)). Routes can be [added](#implementation) and configured:

- with [policies](#policies), which are a way to block access to a route,
- and with [middlewares](#middlewares), which are a way to control and change the request flow and the request itself.

Once a route exists, reaching it executes some code handled by a controller (see [controllers documentation](/cms/backend-customization/controllers)). To view all existing routes and their hierarchal order, you can run `yarn strapi routes:list` (see [CLI reference](/cms/cli)).

<figure style={{width: '100%', margin: '0'}}>
  <img src="/img/assets/backend-customization/diagram-routes.png" alt="Simplified Strapi backend diagram with routes highlighted" />
  <em><figcaption style={{fontSize: '12px'}}>The diagram represents a simplified version of how a request travels through the Strapi back end, with routes highlighted. The backend customization introduction page includes a complete, <a href="/cms/backend-customization#interactive-diagram">interactive diagram</a>.</figcaption></em>
</figure>

## Implementation

Implementing a new route consists in defining it in a router file within the `./src/api/[apiName]/routes` folder (see [project structure](/cms/project-structure)).

There are 2 different router file structures, depending on the use case:

- configuring [core routers](#configuring-core-routers)
- or creating [custom routers](#creating-custom-routers).

### Configuring core routers

Core routers (i.e. `find`, `findOne`, `create`, `update`, and `delete`) correspond to [default routes](/cms/api/rest#endpoints) automatically created by Strapi when a new [content-type](/cms/backend-customization/models#model-creation) is created.

Strapi provides a `createCoreRouter` factory function that automatically generates the core routers and allows:

- passing in configuration options to each router
- and disabling some core routers to [create custom ones](#creating-custom-routers).

A core router file is a JavaScript file exporting the result of a call to `createCoreRouter` with the following parameters:

| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| `prefix`  | Allows passing in a custom prefix to add to all routers for this model (e.g. `/test`)        | `String` |
| `only`    | Core routes that will only be loaded<br /><br/>Anything not in this array is ignored.        | `Array` | -->
| `except`  | Core routes that should not be loaded<br/><br />This is functionally the opposite of the `only` parameter. | `Array` |
| `config`  | Configuration to handle [policies](#policies), [middlewares](#middlewares) and [public availability](#public-routes) for the route | `Object` |

<br/>

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/[apiName]/routes/[routerName].js (e.g './src/api/restaurant/routes/restaurant.js')"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/[apiName]/routes/[routerName].ts (e.g './src/api/restaurant/routes/restaurant.ts')"

import { factories } from '@strapi/strapi'; 

export default factories.createCoreRouter('api::restaurant.restaurant', {
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

</TabItem>
</Tabs>

<br />

Generic implementation example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/restaurant.js"

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  only: ['find'],
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    }
  }
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/restaurant.ts"

import { factories } from '@strapi/strapi'; 

export default factories.createCoreRouter('api::restaurant.restaurant', {
  only: ['find'],
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    }
  }
});
```

</TabItem>
</Tabs>

This only allows a `GET` request on the `/restaurants` path from the core `find` [controller](/cms/backend-customization/controllers) without authentication.

### Creating custom routers

Creating custom routers consists in creating a file that exports an array of objects, each object being a route with the following parameters:

| Parameter                  | Description                                                                      | Type     |
| -------------------------- | -------------------------------------------------------------------------------- | -------- |
| `method`                   | Method associated to the route (i.e. `GET`, `POST`, `PUT`, `DELETE` or `PATCH`)  | `String` |
| `path`                     | Path to reach, starting with a forward-leading slash (e.g. `/articles`)| `String` |
| `handler`                  | Function to execute when the route is reached.<br/>Should follow this syntax: `<controllerName>.<actionName>` | `String` |
| `config`<br /><br />_Optional_ | Configuration to handle [policies](#policies), [middlewares](#middlewares) and [public availability](#public-routes) for the route<br/><br/>           | `Object` |

<br/>

Dynamic routes can be created using parameters and regular expressions. These parameters will be exposed in the `ctx.params` object. For more details, please refer to the <ExternalLink to="https://github.com/pillarjs/path-to-regexp" text="PathToRegex"/> documentation.

:::caution
Routes files are loaded in alphabetical order. To load custom routes before core routes, make sure to name custom routes appropriately (e.g. `01-custom-routes.js` and `02-core-routes.js`).
:::

<details>

<summary>Example of a custom router using URL parameters and regular expressions for routes</summary>

In the following example, the custom routes file name is prefixed with `01-` to make sure the route is reached before the core routes.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/01-custom-restaurant.js"

module.exports = {
  routes: [
    { // Path defined with an URL parameter
      method: 'POST',
      path: '/restaurants/:id/review', 
      handler: 'restaurant.review',
    },
    { // Path defined with a regular expression
      method: 'GET',
      path: '/restaurants/:category([a-z]+)', // Only match when the URL parameter is composed of lowercase letters
      handler: 'restaurant.findByCategory',
    }
  ]
}
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/01-custom-restaurant.ts"

export default {
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

</TabItem>
</Tabs>

</details>

## Configuration

Both [core routers](#configuring-core-routers) and [custom routers](#creating-custom-routers) have the same configuration options. The routes configuration is defined in a `config` object that can be used to handle [policies](#policies) and [middlewares](#middlewares) or to [make the route public](#public-routes).

### Policies

[Policies](/cms/backend-customization/policies) can be added to a route configuration:

- by pointing to a policy registered in `./src/policies`, with or without passing a custom configuration
- or by declaring the policy implementation directly, as a function that takes `policyContext` to extend <ExternalLink to="https://koajs.com/#context" text="Koa's context"/> (`ctx`) and the `strapi` instance as arguments (see [policies documentation](/cms/backend-customization/routes))

<Tabs groupId="core-vs-custom-router">

<TabItem value="core-router" label="Core router policy">

<Tabs  groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/restaurant.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/restaurant.ts"

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::restaurant.restaurant', {
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

</TabItem>
</Tabs>

</TabItem>

<TabItem value="custom-router" label="Custom router policy">

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/custom-restaurant.js"

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/custom-restaurant.ts"

export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
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

</TabItem>
</Tabs>

</TabItem>

</Tabs>

### Middlewares

[Middlewares](/cms/backend-customization/middlewares) can be added to a route configuration:

- by pointing to a middleware registered in `./src/middlewares`, with or without passing a custom configuration
- or by declaring the middleware implementation directly, as a function that takes <ExternalLink to="https://koajs.com/#context" text="Koa's context"/> (`ctx`) and the `strapi` instance as arguments:

<Tabs groupId="core-vs-custom-router">

<TabItem value="core-router" label="Core router middleware">

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/restaurant.js"

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      middlewares: [
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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/restaurant.ts"

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      middlewares: [
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

</TabItem>
</Tabs>

</TabItem>

<TabItem value="custom-router" label="Custom router middleware">

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/custom-restaurant.js"

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/custom-restaurant.ts"

export default  {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
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

</TabItem>
</Tabs>

</TabItem>

</Tabs>

### Public routes

By default, routes are protected by Strapi's authentication system, which is based on [API tokens](/cms/features/api-tokens) or on the use of the [Users & Permissions plugin](/cms/features/users-permissions).

In some scenarios, it can be useful to have a route publicly available and control the access outside of the normal Strapi authentication system. This can be achieved by setting the `auth` configuration parameter of a route to `false`:

<Tabs groupId="core-vs-custom-router">

<TabItem value="core-router" label="Core router with a public route">

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/restaurant.js"

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      auth: false
    }
  }
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/restaurant.ts"

import { factories } from '@strapi/strapi';

export default  factories.createCoreRouter('api::restaurant.restaurant', {
  config: {
    find: {
      auth: false
    }
  }
});
```

</TabItem>
</Tabs>

</TabItem>

<TabItem value="custom-router" label="Custom router with a public route">

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/custom-restaurant.js"

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
      config: {
        auth: false,
      },
    },
  ],
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/routes/custom-restaurant.ts"

export default  {
  routes: [
    {
      method: 'GET',
      path: '/articles/customRoute',
      handler: 'api::api-name.controllerName.functionName', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
      config: {
        auth: false,
      },
    },
  ],
};
```

</TabItem>
</Tabs>

</TabItem>

</Tabs>
