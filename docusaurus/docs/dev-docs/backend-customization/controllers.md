# Controllers

Controllers are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](/dev-docs/backend-customization/routes). Whenever a client requests the route, the action performs the business logic code and sends back the [response](/dev-docs/backend-customization/requests-responses). Controllers represent the C in the model-view-controller (MVC) pattern.

In most cases, the controllers will contain the bulk of a project's business logic. But as a controller's logic becomes more and more complicated, it's a good practice to use [services](/dev-docs/backend-customization/services) to organize the code into re-usable parts.

## Implementation

Controllers can be [generated or added manually](#adding-a-new-controller). Strapi provides a `createCoreController` factory function that automatically generates core controllers and allows building custom ones or [extend or replace the generated controllers](#extending-core-controllers).

### Adding a new controller

A new controller can be implemented:

- with the [interactive CLI command `strapi generate`](/dev-docs/cli)
- or manually by creating a JavaScript file:
  - in `./src/api/[api-name]/controllers/` for API controllers (this location matters as controllers are auto-loaded by Strapi from there)
  - or in a folder like `./src/plugins/[plugin-name]/server/controllers/` for plugin controllers, though they can be created elsewhere as long as the plugin interface is properly exported in the `strapi-server.js` file (see [Server API for Plugins documentation](/dev-docs/api/plugins/server-api))

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"

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

  // Method 3: Replacing a core action with proper sanitization
  async find(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service(api::restaurant.restaurant).find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"

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

  // Method 3: Replacing a core action with proper sanitization
  async find(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service(api::restaurant.restaurant).find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

</TabItem>
</Tabs>

Each controller action can be an `async` or `sync` function.
Every action receives a context object (`ctx`) as a parameter. `ctx` contains the [request context](/dev-docs/backend-customization/requests-responses#requests) and the [response context](/dev-docs/backend-customization/requests-responses#responses).

<details>
<summary>Example: GET /hello route calling a basic controller</summary>

A specific `GET /hello` [route](/dev-docs/backend-customization/routes) is defined, the name of the router file (i.e. `index`) is used to call the controller handler (i.e. `index`). Every time a `GET /hello` request is sent to the server, Strapi calls the `index` action in the `hello.js` controller, which returns `Hello World!`:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js "title="./src/api/hello/routes/hello.js"

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

```js "title="./src/api/hello/controllers/hello.js"

module.exports = {
  async index(ctx, next) { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js "title="./src/api/hello/routes/hello.ts"

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

```js title="./src/api/hello/controllers/hello.ts"

export default {
  async index(ctx, next) { // called by GET /hello 
    ctx.body = 'Hello World!'; // we could also send a JSON
  },
};
```

</TabItem>

</Tabs>

</details>

:::note
When a new [content-type](/dev-docs/backend-customization/models#content-types) is created, Strapi builds a generic controller with placeholder code, ready to be customized.
:::

### Sanitization in controllers

:::warning
As of Strapi v4.8.0 and greater it's strongly recommended you sanitize your incoming request query and parameters utilizing the new `sanitizeQuery` function to prevent leaking of private data.
:::

#### Sanitization when utilizing controller factories

Within the Strapi factories there are 2 functions exposed that can be used for sanitization:

| Function Name    | Parameters                 | Description                                                                          |
|------------------|----------------------------|--------------------------------------------------------------------------------------|
| `sanitizeQuery`  | `ctx`                      | Sanitizes the request query                                                          |
| `sanitizeOutput` | `entity`/`entities`, `ctx` | Sanitizes the output data where entity/entities should be an object or array of data |
| `sanitizeInput`  | `data`, `ctx`              | Sanitizes the input data                                                             |

These functions automatically inherit the sanitization settings from the model and sanitize the data accordingly based on the content-type schema and any of the content API authentication strategies, such as the Users & Permissions plugin or API tokens.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  async findOne(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service(api::restaurant.restaurant).find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"

import { factories } from '@strapi/strapi'; 

export default factories.createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  async findOne(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service(api::restaurant.restaurant).find(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  }
}));
```

</TabItem>
</Tabs>

#### Sanitization when building custom controllers

Within custom controllers, there are 3 primary functions exposed via the `@strapi/utils` package that can be used for sanitization:

| Function Name       | Parameters                    | Description                                                                                                                            |
|---------------------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `contentAPI.input`  | `data`, `schema`, `auth`      | Sanitizes the request input including non-writable fields, removing restricted relations, and other nested "visitors" added by plugins |
| `contentAPI.output` | `data`, `schema`, `auth`      | Sanitizes the response output including restricted relations, private fields, passwords, and other nested "visitors" added by plugins  |
| `contentAPI.params` | `ctx.query`, `schema`, `auth` | Sanitizes the request params and query including filters, sort, fields, and populate                                                   |

:::note
Depending on the complexity of your custom controllers, you may need additional sanitization that Strapi cannot currently account for especially when combining the data from multiple sources.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"

const { sanitize } = require('@strapi/utils')
const { contentAPI } = sanitize;

module.exports = {
  async findCustom(ctx) {
    const contentType = strapi.contentType('api::test.test')
    const sanitizedQueryParams = await contentAPI.params(ctx.query, contentType, ctx.state.auth)

    const entities = await strapi.entityService.findMany(contentType.uid, sanitizedQueryParams)

    return await contentAPI.output(entities, contentType, ctx.state.auth);
  }
}
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"

import { sanitize } from '@strapi/utils';
const { contentAPI } = sanitize;

export default {
  async findCustom(ctx) {
    const contentType = strapi.contentType('api::test.test')
    const sanitizedQueryParams = await contentAPI.params(ctx.query, contentType, ctx.state.auth)

    const entities = await strapi.entityService.findMany(contentType.uid, sanitizedQueryParams)

    return await contentAPI.output(entities, contentType, ctx.state.auth);
  }
}
```

</TabItem>
</Tabs>

### Extending core controllers

Default controllers and actions are created for each content-type. These default controllers are used to return responses to API requests (e.g. when `GET /api/articles/3` is accessed, the `findOne` action of the default controller for the "Article" content-type is called). Default controllers can be customized to implement your own logic. The following code examples should help you get started.

:::tip
An action from a core controller can be replaced entirely by [creating a custom action](#adding-a-new-controller) and naming the action the same as the original action (e.g. `find`, `findOne`, `create`, `update`, or `delete`).
:::

:::tip
When extending a core controller, you do not need to re-implement any sanitization as it will already be handled by the core controller you are extending. Where possible it's strongly recommended to extend the core controller instead of creating a custom controller.
:::

<details>
<summary>Collection type examples</summary>

<Tabs>
<TabItem value="find" label="`find()`">

```js
async find(ctx) {
  // some logic here
  const { data, meta } = await super.find(ctx);
  // some more logic

  return { data, meta };
}
```

</TabItem>

<TabItem value="findOne" label="findOne()">

```js
async findOne(ctx) {
  // some logic here
  const response = await super.findOne(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="create" label="create()">

```js
async create(ctx) {
  // some logic here
  const response = await super.create(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

</TabItem>
</Tabs>
</details>

<details>
<summary>Single type examples</summary>
<Tabs>

<TabItem value="find" label="find()">

```js
async find(ctx) {
  // some logic here
  const response = await super.find(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

</TabItem>
</Tabs>
</details>

## Usage

Controllers are declared and attached to a route. Controllers are automatically called when the route is called, so controllers usually do not need to be called explicitly. However, [services](/dev-docs/backend-customization/services) can call controllers, and in this case the following syntax should be used:

```js
// access an API controller
strapi.controller('api::api-name.controller-name');
// access a plugin controller
strapi.controller('plugin::plugin-name.controller-name');
```

:::tip
To list all the available controllers, run `yarn strapi controllers:list`.
:::
