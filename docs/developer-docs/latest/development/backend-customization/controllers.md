---
title: Backend customization - Controllers - Strapi Developer Docs
description: Strapi controllers are files that contain a set of methods reached by the client according to the requested route and can be customized according to your needs.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/controllers.html
---

# Controllers

Controllers are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](/developer-docs/latest/development/backend-customization/routes.md). Whenever a client requests the route, the action performs the business logic code and sends back the [response](/developer-docs/latest/development/backend-customization/requests-responses.md#responses). Controllers represent the C in the model-view-controller (MVC) pattern.

In most cases, the controllers will contain the bulk of a project's business logic. But as a controller's logic becomes more and more complicated, it's a good practice to use [services](/developer-docs/latest/development/backend-customization/services.md) to organize the code into re-usable parts.

## Implementation

Controllers can be [generated or added manually](#adding-a-new-controller). Strapi provides a `createCoreController` factory function that automatically generates core controllers and allows building custom ones or [extend or replace the generated controllers](#extending-core-controllers).

### Adding a new controller

A new controller can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate)
- or manually by creating a JavaScript file:
  - in `./src/api/[api-name]/controllers/` for API controllers (this location matters as controllers are auto-loaded by Strapi from there)
  - or in a folder like `./src/plugins/[plugin-name]/server/controllers/` for plugin controllers, though they can be created elsewhere as long as the plugin interface is properly exported in the `strapi-server.js` file (see [Server API for Plugins documentation](/developer-docs/latest/developer-resources/plugin-api-reference/server.md))

<code-group>
<code-block title=JAVASCRIPT>

```js
// path: ./src/api/restaurant/controllers/restaurant.js

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely custom action
  async exampleAction(ctx) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' }
    
    // Calling the default core action
    const { data, meta } = await super.find(ctx);

    // some more custom logic
    meta.date = Date.now()

    return { data, meta };
  },

  // Method 3: Replacing a core action
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::restaurant.restaurant').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  }
}));
```

</code-block>

<code-block title=TYPESCRIPT>

```js
// path: ./src/api/restaurant/controllers/restaurant.ts

import { factories } from '@strapi/strapi'; 

export default factories.createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely custom action
  async exampleAction(ctx) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' }
    
    // Calling the default core action
    const { data, meta } = await super.find(ctx);

    // some more custom logic
    meta.date = Date.now()

    return { data, meta };
  },

  // Method 3: Replacing a core action
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::restaurant.restaurant').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  }
}));
```


</code-block>
</code-group>




Each controller action can be an `async` or `sync` function.
Every action receives a context object (`ctx`) as a parameter. `ctx` contains the [request context](/developer-docs/latest/development/backend-customization/requests-responses.md#requests) and the [response context](/developer-docs/latest/development/backend-customization/requests-responses.md#responses).

::: details Example: GET /hello route calling a basic controller

A specific `GET /hello` [route](/developer-docs/latest/development/backend-customization/routes.md) is defined, the name of the router file (i.e. `index`) is used to call the controller handler (i.e. `index`). Every time a `GET /hello` request is sent to the server, Strapi calls the `index` action in the `hello.js` controller, which returns `Hello World!`:

<code-group>
<code-block title=JAVASCRIPT>

```js
// path: ./src/api/hello/routes/hello.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/hello',
      handler: 'hello.index',
    }
  ]
}
```

```js
// path: ./src/api/hello/controllers/hello.js

module.exports = {
  async index(ctx, next) { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

</code-block>

<code-block title=TYPESCRIPT>

```js
// path: ./src/api/hello/routes/hello.ts

export default {
  routes: [
    {
      method: 'GET',
      path: '/hello',
      handler: 'hello.index',
    }
  ]
}
```

```js
// path: ./src/api/hello/controllers/hello.ts

export default {
  async index(ctx, next) { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

</code-block>
</code-group>

:::

::: note
When a new [content-type](/developer-docs/latest/development/backend-customization/models.md#content-types) is created, Strapi builds a generic controller with placeholder code, ready to be customized.
:::

### Extending core controllers

Default controllers and actions are created for each content-type. These default controllers are used to return responses to API requests (e.g. when `GET /api/articles/3` is accessed, the `findOne` action of the default controller for the "Article" content-type is called). Default controllers can be customized to implement your own logic. The following code examples should help you get started.

:::tip
An action from a core controller can be replaced entirely by [creating a custom action](#adding-a-new-controller) and naming the action the same as the original action (e.g. `find`, `findOne`, `create`, `update`, or `delete`).
:::

::::: details Collection type examples

:::: tabs card

::: tab find()

```js
async find(ctx) {
  // some logic here
  const { data, meta } = await super.find(ctx);
  // some more logic

  return { data, meta };
}
```

:::

::: tab findOne()

```js
async findOne(ctx) {
  // some logic here
  const response = await super.findOne(ctx);
  // some more logic

  return response;
}
```

:::

::: tab create()

```js
async create(ctx) {
  // some logic here
  const response = await super.create(ctx);
  // some more logic

  return response;
}
```

:::

::: tab update()

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

:::

::: tab delete()

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

:::
::::
:::::

::::: details Single type examples
:::: tabs card

::: tab find()

```js
async find(ctx) {
  // some logic here
  const response = await super.find(ctx);
  // some more logic

  return response;
}
```

:::

::: tab update()

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

:::

::: tab delete()

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

:::
::::
:::::

## Usage

Controllers are declared and attached to a route. Controllers are automatically called when the route is called, so controllers usually do not need to be called explicitly. However, [services](/developer-docs/latest/development/backend-customization/services.md) can call controllers, and in this case the following syntax should be used:

```js
// access an API controller
strapi.controller('api::api-name.controller-name');
// access a plugin controller
strapi.controller('plugin::plugin-name.controller-name');
```

::: tip
To list all the available controllers, run `yarn strapi controllers:list`.
:::
