# Controllers

## Concept

Controllers are JavaScript files which contain a set of methods called **actions** reached by the client according to the requested route. It means that every time a client requests the route, the action performs the business logic coded and sends back the response. They represent the _C_ in the _MVC_ pattern. In most cases, the controllers will contain the bulk of a project's business logic.

```js
module.exports = {
  // GET /hello
  async index(ctx) {
    return 'Hello World!';
  },
};
```

In this example, any time a web browser is pointed to the `/hello` URL on your app, the page will display the text: `Hello World!`.

### Where are the controllers defined?

The controllers are defined in each `./api/**/controllers/` folder. Every JavaScript file put in these folders will be loaded as a controller. They are also available through the `strapi.controllers` and `strapi.api.**.controllers` global variables.

## Core controllers

When you create a new `Content Type` you will see a new empty controller has been created. This is because Strapi builds a generic controller for your models by default and allows you to override and extend it in the generated files.

### Extending a Model Controller

Here are the core methods (and their current implementation).
You can simply copy and paste this code in your own controller file to customize the methods.

::: warning
In the following example we will assume your controller, service and model are named `restaurant`
:::

#### Utils

First require the utility functions

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
```

- `parseMultipartData`: This function parses Strapi's formData format.
- `sanitizeEntity`: This function removes all private fields from the model and its relations.

#### Collection Type

:::: tabs

::: tab find

#### `find`

```js
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.restaurant.search(ctx.query);
    } else {
      entities = await strapi.services.restaurant.find(ctx.query);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.restaurant }));
  },
};
```

:::

::: tab findOne

#### `findOne`

```js
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.restaurant.findOne({ id });
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::: tab count

#### `count`

```js
module.exports = {
  /**
   * Count records.
   *
   * @return {Number}
   */

  count(ctx) {
    if (ctx.query._q) {
      return strapi.services.restaurant.countSearch(ctx.query);
    }
    return strapi.services.restaurant.count(ctx.query);
  },
};
```

:::

::: tab create

#### `create`

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.restaurant.create(data, { files });
    } else {
      entity = await strapi.services.restaurant.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::: tab update

#### `update`

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Update a record.
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.restaurant.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.restaurant.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::: tab delete

#### `delete`

```js
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Delete a record.
   *
   * @return {Object}
   */

  async delete(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.restaurant.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::::

#### Single Type

:::: tabs

::: tab find

#### `find`

```js
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Retrieve the record.
   *
   * @return {Object}
   */

  async find(ctx) {
    const entity = await strapi.services.restaurant.find();
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::: tab update

#### `update`

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Update the record.
   *
   * @return {Object}
   */

  async update(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.restaurant.createOrUpdate(data, {
        files,
      });
    } else {
      entity = await strapi.services.restaurant.createOrUpdate(ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::: tab delete

#### `delete`

```js
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Delete the record.
   *
   * @return {Object}
   */

  async delete(ctx) {
    const entity = await strapi.services.restaurant.delete();
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
```

:::

::::

## Custom controllers

You can also create custom controllers to build your own business logic and API endpoints.

### How to create a custom controller

There are two ways to create a controller:

- Using the CLI `strapi generate:controller restaurant`.<br>Read the [CLI documentation](../cli/CLI.md#strapi-generatecontroller) for more information.
- Manually create a JavaScript file in `./api/**/controllers`.

### Adding Endpoints

Each controller’s action must be an `async` function.
Every action receives a `context` (`ctx`) object as first parameter containing the [request context](./requests-responses.md) and the [response context](./requests-responses.md).

### Example

In this example, we are defining a specific route in `./api/hello/config/routes.json` that takes `Hello.index` as handler. For more information on routing, please see the [Routing documentation](./routing.md)

It means that every time a request `GET /hello` is sent to the server, Strapi will call the `index` action in the `Hello.js` controller.
Our `index` action will return `Hello World!`. You can also return a JSON object.

**Path —** `./api/hello/config/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/hello",
      "handler": "Hello.index",
      "config": {
        "policies": []
      }
    }
  ]
}
```

**Path —** `./api/hello/controllers/Hello.js`.

```js
module.exports = {
  // GET /hello
  async index(ctx) {
    ctx.send('Hello World!');
  },
};
```

::: tip
A route handler can only access the controllers defined in the `./api/**/controllers` folders.
:::
