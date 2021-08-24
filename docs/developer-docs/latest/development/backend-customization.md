---
title: Backend customization - Strapi Developer Documentation
description: The backend of Strapi can be customized according to your needs, so you can create your own backend behavior.
---

# Backend customization

<!--- BEGINNING OF ROUTING --->

## Routing

`./api/**/config/routes.json` files define all available endpoints for the clients.

By default, Strapi generates endpoints for all your Content Types. More information is in the [Content API](/developer-docs/latest/developer-resources/content-api/content-api.md#api-endpoints) documentation.

### How to create a route?

You have to edit the `routes.json` file in one of your APIs folders (`./api/**/config/routes.json`) and manually add a new route object into the `routes` array.

**Path —** `./api/**/config/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/restaurants",
      "handler": "Restaurant.find",
      "config": {
        "policies": []
      }
    },
    {
      "method": "PUT",
      "path": "/restaurants/bulkUpdate",
      "handler": "Restaurant.bulkUpdate",
      "config": {
        "policies": []
      }
    },
    {
      "method": "POST",
      "path": "/restaurants/:id/reservation",
      "handler": "Restaurant.reservation",
      "config": {
        "policies": ["is-authenticated", "has-credit-card"]
      }
    }
  ]
}
```

- `method` (string): Method or array of methods to hit the route (e.g. `GET`, `POST`, `PUT`, `HEAD`, `DELETE`, `PATCH`).
- `path` (string): URL starting with `/` (e.g. `/restaurants`).
- `handler` (string): Action to execute when the route is hit following this syntax `<Controller>.<action>`.
- `config`
  - `policies` (array): Array of policy names or paths ([see more](#policies))

::: tip
You can exclude the entire `config` object if you do not want the route to be checked by the [Users & Permissions plugin](/developer-docs/latest/development/plugins/users-permissions.md).
:::

### Dynamic parameters

The router used by Strapi allows you to create dynamic routes where you can use parameters and simple regular expressions. These parameters will be exposed in the `ctx.params` object. For more details, please refer to the [PathToRegex](https://github.com/pillarjs/path-to-regexp) documentation.

```json
{
  "routes": [
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

#### Example

Route definition with URL params

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/restaurants/:id",
      "handler": "Restaurant.findOne",
      "config": {
        "policies": []
      }
    }
  ]
}
```

Get the URL param in the controller

```js
module.exports = {
  findOne: async ctx => {
    // const id = ctx.params.id;
    const { id } = ctx.params;
    return id;
  },
};
```

<!--- BEGINNING OF POLICIES --->

## Policies

Policies are functions which have the ability to execute specific logic on each request before it reaches the controller's action. They are mostly used for securing business logic easily.
Each route of the project can be associated to an array of policies. For example, you can create a policy named `isAdmin`, which obviously checks that the request is sent by an admin user, and use it for critical routes.

The policies are defined in each `./api/**/config/policies/` folders and plugins. They are respectively exposed through `strapi.api.**.config.policies` and `strapi.plugins.**.config.policies`. The global policies are defined at `./config/policies/` and accessible via `strapi.config.policies`.

### How to create a policy?

There are several ways to create a policy.

- Using the CLI `strapi generate:policy is-authenticated`.<br>Read the [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md) for more information.
- Manually create a JavaScript file named `is-authenticated.js` in `./config/policies/`.

**Path —** `./config/policies/is-authenticated.js`.

```js
module.exports = async (ctx, next) => {
  if (ctx.state.user) {
    // Go to next policy or will reach the controller's action.
    return await next();
  }

  ctx.unauthorized(`You're not logged in!`);
};
```

In this example, we are verifying that a session is open. If it is the case, we call the `next()` method that will execute the next policy or controller's action. Otherwise, a 401 error is returned.

### Usage

To apply policies to a route, you need to associate an array of policies to it. There are two kinds of policies: global and scoped.

:::caution
To apply policies with GraphQL please see the [following guide](/developer-docs/latest/development/plugins/graphql.md#execute-a-policy-before-a-resolver).
:::

#### Global policies

The global policies can be associated to any route in your project.

**Path —** `./api/restaurant/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/restaurants",
      "handler": "Restaurant.find",
      "config": {
        "policies": ["global::is-authenticated"]
      }
    }
  ]
}
```

Before executing the `find` action in the `Restaurant.js` controller, the global policy `is-authenticated` located in `./config/policies/is-authenticated.js` will be called.

::: tip
You can put as much policy as you want in this array. However be careful about the performance impact.
:::

#### Plugins policies

Plugins can add and expose policies into your app. For example, the plugin **Users & Permissions** comes with useful policies to ensure that the user is well authenticated or has the rights to perform an action.

**Path —** `./api/restaurant/config/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/restaurants",
      "handler": "Restaurant.find",
      "config": {
        "policies": ["plugins::users-permissions.isAuthenticated"]
      }
    }
  ]
}
```

The policy `isAuthenticated` located in the `users-permissions` plugin will be executed before the `find` action in the `Restaurant.js` controller.

#### API policies

The API policies can be associated to the routes defined in the API where they have been declared.

**Path —** `./api/restaurant/config/policies/isAdmin.js`.

```js
module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return await next();
  }

  ctx.unauthorized(`You're not allowed to perform this action!`);
};
```

**Path —** `./api/restaurant/config/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/restaurants",
      "handler": "Restaurant.find",
      "config": {
        "policies": ["isAdmin"]
      }
    }
  ]
}
```

The policy `isAdmin` located in `./api/restaurant/config/policies/isAdmin.js` will be executed before the `find` action in the `Restaurant.js` controller.

#### Using a policy outside its api

To use a policy in another api you can reference it with the following syntax: `{apiName}.{policyName}`.

**Path —** `./api/category/config/routes.json`.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/categories",
      "handler": "Category.find",
      "config": {
        "policies": ["restaurant.isAdmin"]
      }
    }
  ]
}
```

### Advanced usage

As it's explained above, the policies are executed before the controller's action. It looks like an action that you can make `before` the controller's action. You can also execute a logic `after`.

**Path —** `./config/policies/custom404.js`.

```js
module.exports = async (ctx, next) => {
  // Indicate to the server to go to
  // the next policy or to the controller's action.
  await next();

  // The code below will be executed after the controller's action.
  if (ctx.status === 404) {
    ctx.body = 'We cannot find the resource.';
  }
};
```

<!--- BEGINNING OF CONTROLLERS --->

## Controllers

Controllers are JavaScript files which contain a set of methods called **actions** reached by the client according to the requested route. It means that every time a client requests the route, the action performs the business logic code and sends back the response. They represent the _C_ in the _MVC_ pattern. In most cases, the controllers will contain the bulk of a project's business logic.

```js
module.exports = {
  // GET /hello
  async index(ctx) {
    return 'Hello World!';
  },
};
```

In this example, any time a web browser is pointed to the `/hello` URL on your app, the page will display the text: `Hello World!`.

The controllers are defined in each `./api/**/controllers/` folder. Every JavaScript file put in these folders will be loaded as a controller. They are also available through the `strapi.controllers` and `strapi.api.**.controllers` global variables.

### Core controllers

When you create a new `Content Type` you will see a new empty controller has been created. This is because Strapi builds a generic controller for your models by default and allows you to override and extend it in the generated files.

#### Extending a Model Controller

Here are the core methods (and their current implementation).
You can simply copy and paste this code in your own controller file to customize the methods.

:::caution
In the following example we will assume your controller, service and model are named `restaurant`.
:::

##### Utils

First require the utility functions

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
```

- `parseMultipartData`: This function parses Strapi's formData format.
- `sanitizeEntity`: This function removes all private fields from the model and its relations.

##### Collection Type

:::: tabs card

::: tab find

##### `find`

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

##### `findOne`

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

##### `count`

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

##### `create`

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

##### `update`

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

##### `delete`

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

##### Single Type

:::: tabs card

::: tab find

##### `find`

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

##### `update`

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

##### `delete`

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

### Custom controllers

You can also create custom controllers to build your own business logic and API endpoints.

There are two ways to create a controller:

- Using the CLI `strapi generate:controller restaurant`.<br>Read the [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate-controller) for more information.
- Manually create a JavaScript file in `./api/**/controllers`.

#### Adding Endpoints

Each controller’s action must be an `async` function.
Every action receives a `context` (`ctx`) object as first parameter containing the [request context](/developer-docs/latest/development/backend-customization.md#responses) and the [response context](/developer-docs/latest/development/backend-customization.md#responses).

#### Example

In this example, we are defining a specific route in `./api/hello/config/routes.json` that takes `Hello.index` as handler. For more information on routing, please see the [Routing documentation](#routing)

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

<!--- REQUESTS AND RESPONSES --->

## Requests & Responses

### Requests

The context object (`ctx`) contains all the requests related information. They are accessible through `ctx.request`, from [controllers](/developer-docs/latest/development/backend-customization.md#controllers) and [policies](/developer-docs/latest/development/backend-customization.md#policies).

Strapi passes the `body` on `ctx.request.body` and `files` through `ctx.request.files`

For more information, please refer to the [Koa request documentation](http://koajs.com/#request).

### Responses

The context object (`ctx`) contains a list of values and functions useful to manage server responses. They are accessible through `ctx.response`, from [controllers](/developer-docs/latest/development/backend-customization.md#controllers) and [policies](/developer-docs/latest/development/backend-customization.md#policies).

For more information, please refer to the [Koa response documentation](http://koajs.com/#response).

<!--- BEGINNING OF SERVICES --->

## Services

Services are a set of reusable functions. They are particularly useful to respect the DRY (don’t repeat yourself) programming concept and to simplify [controllers](#controllers) logic.

### Core services

When you create a new `Content Type` or a new model, you will see a new empty service has been created. It is because Strapi builds a generic service for your models by default and allows you to override and extend it in the generated files.

#### Extending a Model Service

Here are the core methods (and their current implementation).
You can simply copy and paste this code to your own service file to customize the methods.

You can read about `strapi.query` calls [here](#queries).

::: tip
In the following example your controller, service and model are named `restaurant`.
:::

#### Utils

If you're extending the `create` or `update` service, first require the following utility function:

```js
const { isDraft } = require('strapi-utils').contentTypes;
```

- `isDraft`: This function checks if the entry is a draft.


##### Collection Type

:::: tabs card

::: tab find

##### `find`

```js
module.exports = {
  /**
   * Promise to fetch all records
   *
   * @return {Promise}
   */
  find(params, populate) {
    return strapi.query('restaurant').find(params, populate);
  },
};
```

The `find` function accepts the following arguments:

- `params` (object): the filters for the find request,

  The object follows the URL query format (see [API parameters](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters)).

```json
{
  "name": "Tokyo Sushi"
}
// or
{
  "_limit": 20,
  "name_contains": "sushi"
}
```

- `populate` (array): the data to populate `["author", "author.name", "comment", "comment.content"]`

:::

::: tab findOne

##### `findOne`

```js
module.exports = {
  /**
   * Promise to fetch record
   *
   * @return {Promise}
   */

  findOne(params, populate) {
    return strapi.query('restaurant').findOne(params, populate);
  },
};
```

The `find` function accepts the following arguments:

- `params` (object): the filters for the find request.

  The object follows the URL query format (see [API parameters](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters)).

```json
{
  "name": "Tokyo Sushi"
}
// or
{
  "name_contains": "sushi"
}
```

- `populate` (array): the data to populate `["author", "author.name", "comment", "comment.content"]`

:::

::: tab count

##### `count`

```js
module.exports = {
  /**
   * Promise to count record
   *
   * @return {Promise}
   */

  count(params) {
    return strapi.query('restaurant').count(params);
  },
};
```

- `params` (object): this represent filters for your find request.<br>
  The object follow the URL query format, [refer to this documentation.](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters).

```json
{
  "name": "Tokyo Sushi"
}
// or
{
  "name_contains": "sushi"
}
```

:::

::: tab create

##### `create`

```js
const { isDraft } = require('strapi-utils').contentTypes;

module.exports = {
  /**
   * Promise to add record
   *
   * @return {Promise}
   */

  async create(data, { files } = {}) {
    const isDraft = isDraft(data, strapi.models.restaurant);
    const validData = await strapi.entityValidator.validateEntityCreation(
      strapi.models.restaurant,
      data,
      { isDraft }
    );

    const entry = await strapi.query('restaurant').create(validData);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'restaurant',
        // if you are using a plugin's model you will have to add the `source` key (source: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
};
```

:::

::: tab update

##### `update`

```js
const { isDraft } = require('strapi-utils').contentTypes;

module.exports = {
  /**
   * Promise to edit record
   *
   * @return {Promise}
   */

  async update(params, data, { files } = {}) {
    const existingEntry = await strapi.query('restaurant').findOne(params);

    const isDraft = isDraft(existingEntry, strapi.models.restaurant);
    const validData = await strapi.entityValidator.validateEntityUpdate(
      strapi.models.restaurant,
      data,
      { isDraft }
    );

    const entry = await strapi.query('restaurant').update(params, validData);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'restaurant',
        // if you are using a plugin's model you will have to add the `source` key (source: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
};
```

- `params` (object): it should look like this `{id: 1}`

:::

::: tab delete

##### `delete`

```js
module.exports = {
  /**
   * Promise to delete a record
   *
   * @return {Promise}
   */

  delete(params) {
    return strapi.query('restaurant').delete(params);
  },
};
```

- `params` (object): it should look like this `{id: 1}`

:::

::: tab search

##### `search`

```js
module.exports = {
  /**
   * Promise to search records
   *
   * @return {Promise}
   */

  search(params) {
    return strapi.query('restaurant').search(params);
  },
};
```

- `params` (object): this represent filters for your find request.<br>
  The object follow the URL query format, [refer to this documentation.](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters).

```json
{
  "name": "Tokyo Sushi"
}
// or
{
  "name_contains": "sushi"
}
```

:::

::: tab countSearch

##### `countSearch`

```js
module.exports = {
  /**
   * Promise to count searched records
   *
   * @return {Promise}
   */
  countSearch(params) {
    return strapi.query('restaurant').countSearch(params);
  },
};
```

- `params` (object): this represent filters for your find request.<br>
  The object follow the URL query format, [refer to this documentation.](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters).

```json
{
  "name": "Tokyo Sushi"
}
// or
{
  "name_contains": "sushi"
}
```

:::

::::

##### Single Type

:::: tabs card

::: tab find

##### `find`

```js
const _ = require('lodash');

module.exports = {
  /**
   * Promise to fetch the record
   *
   * @return {Promise}
   */
  async find(params, populate) {
    const results = await strapi.query('restaurant').find({ ...params, _limit: 1 }, populate);
    return _.first(results) || null;
  },
};
```

The `find` function accepts the following arguments:

- `params` (object): the filters for the find request.

  The object follows the URL query format (see [API parameters](/developer-docs/latest/developer-resources/content-api/content-api.md#api-parameters)).

- `populate` (array): the data to populate `["author", "author.name", "comment", "comment.content"]`

:::

::: tab createOrUpdate

##### `createOrUpdate`

```js
const _ = require('lodash');

module.exports = {
  /**
   * Promise to add/update the record
   *
   * @return {Promise}
   */

  async createOrUpdate(data, { files } = {}) {
    const results = await strapi.query('restaurant').find({ _limit: 1 });
    const entity = _.first(results) || null;

    let entry;
    if (!entity) {
      entry = await strapi.query('restaurant').create(data);
    } else {
      entry = await strapi.query('restaurant').update({ id: entity.id }, data);
    }

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'restaurant',
        // if you are using a plugin's model you will have to add the `plugin` key (plugin: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
};
```

:::

::: tab delete

##### `delete`

```js
module.exports = {
  /**
   * Promise to delete a record
   *
   * @return {Promise}
   */

  delete() {
    const results = await strapi.query('restaurant').find({ _limit: 1 });
    const entity = _.first(results) || null;

    if (!entity) return;

    return strapi.query('restaurant').delete({id: entity.id});
  },
};
```

:::

::::

### Custom services

You can also create custom services to build your own business logic.

There are two ways to create a service.

- Using the CLI `strapi generate:service restaurant`.<br>Read the [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md) for more information.
- Manually create a JavaScript file named in `./api/**/services/`.

#### Example

The goal of a service is to store reusable functions. An `email` service could be useful to send emails from different functions in our codebase:

**Path —** `./api/email/services/Email.js`.

```js
const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'user@gmail.com',
    pass: 'password',
  },
});

module.exports = {
  send: (from, to, subject, text) => {
    // Setup e-mail data.
    const options = {
      from,
      to,
      subject,
      text,
    };

    // Return a promise of the function that sends the email.
    return transporter.sendMail(options);
  },
};
```

::: tip
please make sure you installed `nodemailer` (`npm install nodemailer`) for this example.
:::

The service is now available through the `strapi.services` global variable. We can use it in another part of our codebase. For example a controller like below:

**Path —** `./api/user/controllers/User.js`.

```js
module.exports = {
  // GET /hello
  signup: async ctx => {
    // Store the new user in database.
    const user = await User.create(ctx.query);

    // Send an email to validate his subscriptions.
    strapi.services.email.send('welcome@mysite.com', user.email, 'Welcome', '...');

    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
};
```

<!--- BEGINNING OF QUERIES --->

## Queries

Strapi v4 provides a query engine to interact with the database layer.

You can just call `strapi.query('modelName', 'pluginName')` to access the query API for any model.

These queries handle for you specific Strapi features like `components`, `dynamic zones`, `filters` and `search`.

The query engine lets you perform many interactions with the database layer at a low level, for instance:

```js
qb.query('article').findMany({
  where: {
    title: {
      $startWith: '2021',
      $endsWith: 'v4',
    },
  },
  populate: {
    category: true,
  },
});
```

For more details, see the [Query Engine API](/developer-docs/latest/developer-resources/database-api-guides/query-engine-api.md) documentation.


<!--- BEGINNING OF MODELS --->

## Models

### Concepts

#### Content Type's models

Models are a representation of the database's structure. They are split into two separate files. A JavaScript file that contains the model options (e.g: lifecycle hooks), and a JSON file that represents the data structure stored in the database.

<!-- ? will the paths change: `/api/restaurant/models/lifecycles.js` and `/api/restaurant/models/schema.json maybe`? -->

**Path —** `./api/restaurant/models/Restaurant.js`.

```js
module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {},
    // Called after an entry is created
    afterCreate(result) {},
  },
};
```

**Path —** `./api/restaurant/models/Restaurant.settings.json`.
<!-- ? should we update the code example below to reflect what's currently in examples/getstarted?
  "cover": {
      "type": "media",
      "multiple": false,
      "required": false
    }, -->

```json
{
  "kind": "collectionType",
  "connection": "default",
  "info": {
    "name": "restaurant",
    "description": "This represents the Restaurant Model"
  },
  "attributes": {
    "cover": {
      "collection": "file",
      "via": "related",
      "plugin": "upload"
    },
    "name": {
      "default": "",
      "type": "string"
    },
    "description": {
      "default": "",
      "type": "text"
    }
  }
}
```

In this example, there is a `Restaurant` model which contains the attributes `cover`, `name` and `description`.

#### Component's models

Another type of model is named `components`. A component is a data structure that can be used in one or many other API's model. There is no lifecycle related, only a JSON file definition.

**Path —** `./components/default/basic.json`

```json
{
  "collectionName": "components_basic_simples",
  "info": {
    "name": "simple",
    "icon": "address-card"
  },
  "options": {},
  "attributes": {
    "name": {
      "type": "string"
    }
  }
}
```

<!-- ? why did we rename the component 'basic' (filepath, collectionName) but keep the "simple" name? isn't it easier to set everything either to "simple" or to "basic"? -->

In this example, there is a `Simple` component which contains the attribute `name`. And the component is in the category `default`.

#### Where are the models defined?

The **Content Types** models are defined in each `./api/**/models/` folder. Every JavaScript or JSON file in these folders will be loaded as a model. They are also available through the `strapi.models` and `strapi.api.**.models` global variables. Usable everywhere in the project, they contain the ORM model object that they refer to. By convention, a model's name should be written in lowercase.

The **Components** models are defined in the `./components` folder. Every component has to be inside a subfolder (the category name of the component).

### How to create a model?

::: tip
If you are just starting out it is very convenient to generate some models with the Content-Types Builder directly in the admin interface. You can then review the generated model mappings on the code level. The UI takes over a lot of validation tasks and gives you a feeling for available features.
:::

#### For Content Types models

Use the CLI and run the following command `strapi generate:model restaurant name:string description:text`.<br>Read the [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md) for more information.

This will create two files located at `./api/restaurant/models`:

- `Restaurant.settings.json`: contains the list of attributes and settings. The JSON format makes the file easily editable.
- `Restaurant.js`: imports `Restaurant.settings.json` and extends it with additional settings and life cycle callbacks.

::: tip
When you create a new API using the CLI (`strapi generate:api <name>`), a model is automatically created.
:::

#### For Components models

To create a component you will have to use the Content-Types Builder from the Admin panel, there is no CLI generator for components.

Or you can create your component manually by following the file path described previously and the file structure described below.

### Model settings

Additional settings can be set on models:

- `kind` (string) - Define if the model is a Collection Type (`collectionType`) of a Single Type (`singleType`) - _only for Content Types_
<!-- ? is `default` still the default connection value? or should we explicitly call it `sqlite`? -->
- `connection` (string) - Connection name which must be used. Default value: `default`.
- `collectionName` (string) - Collection name (or table name) in which the data should be stored.
- name fields for Collection Types:
<!-- ? do we define singularName/pluralName/displayName here or in the `info` object? -->
<!-- ? are singularName and pluralName only used for collection types? -->
  - `singularName` (string) - Singular form of the Collection Type name, used to generate the API routes and databases/tables collection
  - `pluralName` (string) -  Plural form of the Collection Type name
<!-- ? when is used displayName ? -->
  - `displayName` (string) -  Default name to use in the UI
- `globalId` (string) - Global variable name for this model (case-sensitive) - _only for Content Types_
- `attributes` (object) - Define the data structure of your model. Find available options [below](#define-the-attributes).

**Path —** `Restaurant.settings.json`.

```json
{
  "kind": "collectionType",
  "connection": "default",
  "collectionName": "Restaurants_v1",
  "displayName": "Restaurants",
  "singularName": "Restaurant",
  "pluralName": "Restaurants",
  "globalId": "Restaurants",
  "attributes": {}
}
```

In this example, the model `Restaurant` will be accessible through the `Restaurants` global variable. The data will be stored in the `Restaurants_v1` collection or table and the model will use the default (sqlite) connection defined in `./config/database.js` (see [database configuration](/developer-docs/latest/setup-deployment-guides/configurations.html#database) documentation).

:::caution
<!-- ? is this still the case? -->
If not set manually in the JSON file, Strapi will adopt the filename as `globalId`.
The `globalId` serves as a reference to your model within relations and Strapi APIs. If you chose to rename it (either by renaming your file or by changing the value of the `globalId`), you'd have to migrate your tables manually and update the references.
Please note that you should not alter the Strapi's models `globalId` (plugins and core models) since they are used directly within Strapi APIs and other models' relations.
:::

::: tip
The `connection` value can be changed whenever you want, but you should be aware that there is no automatic data migration process. Also if the new connection doesn't use the same ORM you will have to rewrite your queries.
:::

### Model information

The info key on the model-json states information about the model. This information is used in the admin interface, when showing the model.

- `name`: The name of the model, as shown in admin interface.
- `description`: The description of the model.
- `icon`: The fontawesome V5 name - _only for Components_

**Path —** `Restaurant.settings.json`.

```json
{
  "info": {
    "name": "restaurant",
    "description": ""
  }
}
```

### Model options

The options key on the model-json states.

- `timestamps`: This tells the model which attributes to use for timestamps. Accepts either `boolean` or `Array` of strings where first element is create date and second element is update date. Default value when set to `true` for Bookshelf is `["created_at", "updated_at"]`.

- `privateAttributes`: This configuration allows to treat a set of attributes as private, even if they're not actually defined as attributes in the model. Accepts an `Array` of strings. It could be used to remove from API responses timestamps. The set of `privateAttributes` defined in the model are merged with the `privateAttributes` defined in the global Strapi configuration.

- `populateCreatorFields`: Configure whether the API response should include `created_by` and `updated_by` fields or not. Accepts a `boolean`. The default value is `false`.

- `draftAndPublish`: Enable the draft and publish feature. Accepts a `boolean`. The default value is `false`.

**Path —** `Restaurant.settings.json`.

```json
{
  "options": {
    "timestamps": true,
    "privateAttributes": ["id", "created_at"],
    "populateCreatorFields": true,
    "draftAndPublish": false
  }
}
```

### Model attributes
<!-- TODO: add this to migration plan as the header title has changed from "Define the attributes" to "Model attributes" for consistency -->

#### Types

The following types are currently available:

- string types:
  - `string`
  - `text`
  - `richtext`
  - `enum`
  <!-- ? have we decided yet about how the `enum` will be handled in v4? -->
  - `email`
  - `password`
  - `uid`
- date types:
  - `date`
  - `time`
  - `datetime`
  - `timestamp`
- number types:
  - `integer`
  - `float`
  - `double`
  - `biginteger`
  <!-- ? it's actually a string in JS, should I move this to the string types? can we define a type as `biginteger` in Strapi v4 ? I found it in kitchensink.settings.json. -->
- `json`
- `boolean`
- `array`
- `media`
- types related to internationalization (see [i18n plugin](/developer-docs/latest/development/plugins/i18n.md)):
  - `locale`
  - `localizations`
- special types unique to Strapi:
  - [`relations`](#relations)
  - [`component`](#components)
  - [`dynamiczone`](#dynamic-zone)

#### Validations

If you need validations for SQL databases, you should use the native SQL constraints to apply them.

#### Exceptions

<!-- ? are these validation exceptions? -->

**uid**

- `targetField`(string) — The value is the name of an attribute that has `string` of the `text` type.
- `options` (string) — The value is a set of options passed to [the underlying `uid` generator](https://github.com/sindresorhus/slugify). A caveat is that the resulting `uid` must abide to the following RegEx `/^[A-Za-z0-9-_.~]*$`.

#### Example

**Path —** `Restaurant.settings.json`.

```json
{
  ...
  "attributes": {
    "title": {
      "type": "string",
      "min": 3,
      "max": 99,
      "unique": true
    },
    "description": {
      "default": "My description",
      "type": "text",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title"
    }
    ...
  }
}
```

### Relations

Relations let you create links (relations) between your Content Types.
They should be explicitly defined in the model's attributes:

- `type: 'relation'`: defines this field is a relation
- `relation`: the type of relation among these values:
  - `oneToOne`
  - `oneToMany`
  - `manyToOne`
  - `manyToMany`
  <!-- TODO: describe polymorphic relations once implemented -->
- `target` (string): the name of the target Content Type
<!-- ? which attribute exactly is used? is it `info.name` in the schema? -->
- `mappedBy` and `inversedBy` _(optional)_: in bidirectional relations, the owning side declares the `inversedBy` key while the inversed side declares the `mappedBy` key

::::: tabs card

:::: tab One-to-one

One-to-one relationships are useful to link one entry to another entry.

They can be unidirectional or bidirectional.
In unidirectional one-to-one relationships, only one of the models can be queried with its linked item.

#### Examples

Unidirectional:

<!-- ? are the new paths correct or do we stick with /api/article/models/article.settings.json ? -->

```js
// ./api/article/models/schema.json
const model = {
  attributes: {
    category: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'category',
    },
  },
};
```

Bidirectional:

```js
// ./api/article/models/schema.json
const model = {
  attributes: {
    category: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'category',
      inversedBy: 'article',
    },
  },
};

// ./api/category/models/schema.json
const model = {
  attributes: {
    article: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'article',
      mappedBy: 'category',
    },
  },
};

```

::::

:::: tab Many-to-One

Many-to-One relationships are useful to link one entry to many other entries.

They are always unidirectional, so only one of the models can be queried with its linked items.

#### Example

A book can be written by many authors.

```js
// .api/book/models/schema.json
const model = {
  attributes: {
    author: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'author',
    },
  },
};

```

::::

:::: tab One-to-many

One-to-Many relationships are useful when:

- an entry from a Content-Type A is linked to many entries of another Content-Type B,
- while an entry from Content-Type B is linked to only one entry of Content-Type A.

One-to-many relationships are always bidirectional.

#### Example

```js
// ./api/book/models/schema.json
const model = {
  attributes: {
    author: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'author',
      inversedBy: 'books',
    },
  },
};

// ./api/author/models/schema.json
const model = {
  attributes: {
    books: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'book',
      mappedBy: 'author',
    },
  },
};
```

::::

:::: tab Many-to-Many

Many-to-Many relationships are useful when:

- an entry from Content-Type A is linked to many entries of Content-Type B,
- and an entry from Content-Type B is also linked to many entries from Content-Type A.

Many-to-many relationships can be unidirectional or bidirectional.
#### Examples

Unidirectional:

```js
const model = {
  attributes: {
    categories: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'category',
    },
  },
};
```

Bidirectional: An `article` can have many `tags` and a `tag` can be assigned to many `articles`.

```js
// .api/article/models/schema.json
const model = {
  attributes: {
    tags: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'tag',
      inversedBy: 'articles',
    },
  },
};

// .api/tag/models/schema.json
const model = {
  attributes: {
    articles: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'article',
      mappedBy: 'tags',
    },
  },
};
```

Unidirectional:

```js
const model = {
  attributes: {
    categories: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'category',
    },
  },
};
```

<!-- ? not sure what to do with this note and the following example, that's why I commented them for now -->
<!-- :::tip NOTE
The `collectionName` key defines the name of the join table. It has to be specified once. If it is not specified, Strapi will use a generated default one. It is useful to define the name of the join table when the name generated by Strapi is too long for the database you use.
:::

**Path —** `./api/category/models/Category.settings.json`.

```js
{
  "attributes": {
    "products": {
      "collection": "product",
      "via": "categories"
    }
  }
}
``` -->

<!-- TODO: uncomment and update this part once polymorphic relations are implemented -->
<!-- :::: tab Polymorphic

Polymorphic relationships are the solution when you don't know which kind of model will be associated to your entry, or when you want to connect different types of models to a model.
A common use case is an `Image` model that can be associated to different types of models (Article, Product, User, etc.).

##### Single vs Many

Let's stay with our `Image` model which might belong to **a single `Article` or `Product` entry**.

**NOTE**:
In other words, it means that an `Image` entry can be associated to one entry. This entry can be a `Article` or `Product` entry.

Also our `Image` model might belong to **many `Article` or `Product` entries**.

**NOTE**:
In other words, it means that an `Article` entry can relate to the same image as a `Product` entry.

**Path —** `./api/image/models/Image.settings.json`.

```json
{
  "attributes": {
    "related": {
      "collection": "*",
      "filter": "field"
    }
  }
}
```

##### Filter

The `filter` attribute is optional (but we highly recommend to use it every time). If it's provided it adds a new match level to retrieve the related data.

For example, the `Product` model might have two attributes which are associated to the `Image` model. To distinguish which image is attached to the `cover` field and which images are attached to the `pictures` field, we need to save and provide this to the database.

**Path —** `./api/article/models/Product.settings.json`.

```json
{
  "attributes": {
    "cover": {
      "model": "image",
      "via": "related"
    },
    "pictures": {
      "collection": "image",
      "via": "related"
    }
  }
}
```

The value of the `filter` attribute is the name of the column where the information is stored.

##### Example

An `Image` model might belong to many `Article` models or `Product` models.

**Path —** `./api/image/models/Image.settings.json`.

```json
{
  "attributes": {
    "related": {
      "collection": "*",
      "filter": "field"
    }
  }
}
```

**Path —** `./api/article/models/Article.settings.json`.

```json
{
  "attributes": {
    "avatar": {
      "model": "image",
      "via": "related"
    }
  }
}
```

**Path —** `./api/article/models/Product.settings.json`.

```json
{
  "attributes": {
    "pictures": {
      "collection": "image",
      "via": "related"
    }
  }
}
```

:::: -->

:::::

### Components

Component fields let your create a relation between your Content Type and a Component structure.

##### Example

Lets say we created an `openinghours` component in `restaurant` category.

**Path —** `./api/restaurant/models/Restaurant.settings.json`.

```json
{
  "attributes": {
    "openinghours": {
      "type": "component",
      "repeatable": true,
      "component": "restaurant.openinghours"
    }
  }
}
```

- `repeatable` (boolean): Could be `true` or `false` that let you create a list of data.
- `component` (string): It follows this format `<category>.<componentName>`.

::::: tabs card

:::: tab Create

Create a restaurant with non-repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('POST', '/restaurants', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghour: {
      opening_at: '10am',
      closing_at: '6pm',
      day: 'monday',
    },
  })
);
```

Create a restaurant with repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('POST', '/restaurants', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghours: [
      {
        opening_at: '10am',
        closing_at: '6pm',
        day: 'monday',
      },
      {
        opening_at: '10am',
        closing_at: '6pm',
        day: 'tuesday',
      },
    ],
  })
);
```

::::

:::: tab Update

Update a restaurant with non-repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurants/1', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghour: {
      id: 1, // the ID of the entry
      opening_at: '11am',
      closing_at: '7pm',
      day: 'wednesday',
    },
  })
);
```

Update a restaurant with repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurants/2', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghours: [
      {
        "id": 1 // the ID of the entry you want to update
        "opening_at": "10am",
        "closing_at": "6pm",
        "day": "monday"
      },
      {
        "id": 2, // you also have to put the ID of entries you don't want to update
        "opening_at": "10am",
        "closing_at": "6pm",
        "day": "tuesday"
      }
    ]
  })
);
```

:::note
If you don't specify the `ID` it will delete and re-create the entry and you will see the `ID` value change.
:::

::::

:::: tab Delete

Delete a restaurant with non-repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurants/1', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghour: null,
  })
);
```

Delete a restaurant with repeatable component

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurants/2', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    openinghours: [
      {
        "id": 1 // the ID of the entry you want to keep
        "opening_at": "10am",
        "closing_at": "6pm",
        "day": "monday"
      }
    ]
  })
);
```

::::

:::::

### Dynamic Zone

Dynamic Zone fields let you create a flexible space in which to compose content, based on a mixed list of components.

##### Example

Lets say we created a `slider` and a `content` component in the `article` category.

**Path —** `./api/article/models/Article.settings.json`.

```json
{
  "attributes": {
    "body": {
      "type": "dynamiczone",
      "components": ["article.slider", "article.content"]
    }
  }
}
```

- `components` (array): Array of components that follows this format `<category>.<componentName>`.

::::: tabs card

:::: tab Create

```js
const xhr = new XMLHttpRequest();
xhr.open('POST', '/articles', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    body: [
      {
        __component: 'article.content',
        content: 'This is a content',
      },
      {
        __component: 'article.slider',
        name: 'Slider name',
      },
    ],
  })
);
```

::::

:::: tab Update

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurant/2', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    body: [
      {
        "id": 1 // the ID of the entry you want to update
        "__component": "article.content",
        "content": "This is an updated content",
      },
      {
        "id": 2, // you also have to put the ID of entries you don't want to update
        "__component": "article.slider",
        "name": "Slider name",
      }
    ]
  })
);
```

:::note
If you don't specify the `ID` it will delete and re-create the entry and you will see the `ID` value change.
:::

::::

:::: tab Delete

```js
const xhr = new XMLHttpRequest();
xhr.open('PUT', '/restaurant/2', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(
  JSON.stringify({
    body: [
      {
        "id": 1 // the ID of the entry you want to keep
        "__component": "article.content",
        "content": "This is an updated content",
      }
    ]
  })
);
```

::::

:::::

### Lifecycle hooks

The lifecycle hooks are functions that get triggered when the Strapi [`queries`](/developer-docs/latest/development/backend-customization.md#queries) are called. They will get triggered automatically when you manage your content in the Admin Panel or when you develop custom code using `queries`·

To configure a `ContentType` lifecycle hook you can set a `lifecycles` key in the `{modelName}.js` file located in the `./api/{apiName}/models` folder.

#### Available Lifecycle hooks

:::: tabs card

::: tab find

**`beforeFind(params, populate)`**

_Parameters:_

| Name   | Type   | Description                         |
| ------ | ------ | ----------------------------------- |
| params | Object | Find params _(e.g: limit, filters)_ |

---

**`afterFind(results, params, populate)`**

_Parameters:_

| Name     | Type          | Description                            |
| -------- | ------------- | -------------------------------------- |
| results  | Array{Object} | The results found for the `find` query |
| params   | Object        | Find params _(e.g: limit, filters)_    |
| populate | Array{string} | Populate specific relations            |

:::

::: tab findOne

**`beforeFindOne(params, populate)`**

_Parameters:_

| Name   | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| params | Object | Find params _(e.g: filters)_ |

---

**`afterFindOne(result, params, populate)`**

_Parameters:_

| Name     | Type          | Description                               |
| -------- | ------------- | ----------------------------------------- |
| result   | Object        | The results found for the `findOne` query |
| params   | Object        | Find params _(e.g: filters)_              |
| populate | Array{string} | Populate specific relations               |

:::

::: tab create

**`beforeCreate(data)`**

_Parameters:_

| Name | Type   | Description                              |
| ---- | ------ | ---------------------------------------- |
| data | Object | Input data to the entry was created with |

---

**`afterCreate(result, data)`**

_Parameters:_

| Name   | Type   | Description                              |
| ------ | ------ | ---------------------------------------- |
| result | Object | Created entry                            |
| data   | Object | Input data to the entry was created with |

:::

::: tab update

**`beforeUpdate(params, data)`**

_Parameters:_

| Name   | Type   | Description                              |
| ------ | ------ | ---------------------------------------- |
| params | Object | Find params _(e.g: filters)_             |
| data   | Object | Input data to the entry was created with |

---

**`afterUpdate(result, params, data)`**

_Parameters:_

| Name   | Type   | Description                              |
| ------ | ------ | ---------------------------------------- |
| result | Object | Updated entry                            |
| params | Object | Find params _(e.g: filters)_             |
| data   | Object | Input data to the entry was created with |

:::

::: tab delete

**`beforeDelete(params)`**

_Parameters:_

| Name   | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| params | Object | Find params _(e.g: filters)_ |

---

**`afterDelete(result, params)`**

_Parameters:_

| Name   | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| result | Object | Deleted entry                |
| params | Object | Find params _(e.g: filters)_ |

:::

::: tab count

**`beforeCount(params)`**

_Parameters:_

| Name   | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| params | Object | Find params _(e.g: filters)_ |

---

**`afterCount(result, params)`**

_Parameters:_

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| result | Integer | The count matching entries   |
| params | Object  | Find params _(e.g: filters)_ |

:::

::: tab search

**`beforeSearch(params, populate)`**

_Parameters:_

| Name     | Type          | Description                  |
| -------- | ------------- | ---------------------------- |
| params   | Object        | Find params _(e.g: filters)_ |
| populate | Array{string} | Populate specific relations  |

---

**`afterSearch(result, params)`**

_Parameters:_

| Name     | Type          | Description                  |
| -------- | ------------- | ---------------------------- |
| results  | Array{Object} | The entries found            |
| params   | Object        | Find params _(e.g: filters)_ |
| populate | Array{string} | Populate specific relations  |

:::

::: tab countSearch

**`beforeCountSearch(params)`**

_Parameters:_

| Name   | Type   | Description                  |
| ------ | ------ | ---------------------------- |
| params | Object | Find params _(e.g: filters)_ |

---

**`afterCountSearch(result, params)`**

_Parameters:_

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| result | Integer | The count matching entries   |
| params | Object  | Find params _(e.g: filters)_ |

:::

::::

#### Example

**Path —** `./api/restaurant/models/Restaurant.js`.

```js
module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      data.isTableFull = data.numOfPeople === 4;
    },
  },
};
```

::: tip
You can mutate one of the parameters to change its properties. Make sure not to reassign the parameter as it will have no effect:

This will work:

```js
module.exports = {
  lifecycles: {
    beforeCreate(data) {
      data.name = 'Some fixed name';
    },
  },
};
```

This will NOT work:

```js
module.exports = {
  lifecycles: {
    beforeCreate(data) {
      data = {
        ...data,
        name: 'Some fixed name',
      };
    },
  },
};
```

:::

#### Custom use

When you are building custom ORM specific queries the lifecycles will not be triggered. You can however call a lifecycle function directly if you wish.

**Bookshelf example**

**Path -** `./api/{apiName}/services/{serviceName}.js`

```js
module.exports = {
  async createCustomEntry() {
    const ORMModel = strapi.query(modelName).model;

    const newCustomEntry = await ORMModel.forge().save();

    // trigger manually
    ORMModel.lifecycles.afterCreate(newCustomEntry.toJSON());
  },
};
```

::: tip
When calling a lifecycle function directly, you will need to make sure you call it with the expected parameters.
:::

<!--- BEGINNING OF WEBHOOKS --->

## Webhooks

Webhook is a construct used by an application to notify other applications that an event occurred. More precisely, webhook is a user-defined HTTP callback. Using a webhook is a good way to tell third party providers to start some processing (CI, build, deployment ...).

The way a webhook works is by delivering information to a receiving application through HTTP requests (typically POST requests).

### User content type webhooks

To prevent from unintentionally sending any user's information to other applications, Webhooks will not work for the User content type.
If you need to notify other applications about changes in the Users collection, you can do so by creating [Lifecycle hooks](#lifecycle-hooks) inside the file `./extensions/users-permissions/models/User.js`.

### Available configurations

You can set webhook configurations inside the file `./config/server.js`.

- `webhooks`
  - `defaultHeaders`: You can set default headers to use for your webhook requests. This option is overwritten by the headers set in the webhook itself.

**Example configuration**

```js
module.exports = {
  webhooks: {
    defaultHeaders: {
      'Custom-Header': 'my-custom-header',
    },
  },
};
```

### Securing your webhooks

Most of the time, webhooks make requests to public URLs, therefore it is possible that someone may find that URL and send it wrong information.

To prevent this from happening you can send a header with an authentication token. Using the Admin panel you would have to do it for every webhook.
Another way is to define `defaultHeaders` to add to every webhook requests.

You can configure these global headers by updating the file at `./config/server.js`:

:::: tabs card

::: tab Simple token

```js
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: 'Bearer my-very-secured-token',
    },
  },
};
```

:::

::: tab Environment variable

```js
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
};
```

::::

If you are developing the webhook handler yourself you can now verify the token by reading the headers.

<!--- ### Usage

To access the webhook configuration panel, go to `Settings` > `Webhooks`.

![Webhooks home](../assets/concepts/webhooks/home.png)

#### Create a webhook

Click on `Add new webhook` and fill in the form.

![create](../assets/concepts/webhooks/create.png)

#### Trigger a webhook

You can test out a webhook with a test event: `trigger-test`. Open the webhook you want to trigger.

![Trigger ](../assets/concepts/webhooks/trigger_start.png)

Click on the `Trigger` button.

![Trigger pending](../assets/concepts/webhooks/trigger.png)

You will see the trigger request appear and get the result.

![Trigger result](../assets/concepts/webhooks/trigger_result.png)

#### Enable or disable a webhook

You can enable or disable a webhook from the list view directly.

![Disable webhook](../assets/concepts/webhooks/disable.png)

#### Update a webhook

You can edit any webhook by clicking on the `pen` icon in the webhook list view.

![Update webhook](../assets/concepts/webhooks/list.png)

#### Delete a webhook

You can delete a webhook by clicking on the `trash` icon.

![Delete webhook](../assets/concepts/webhooks/disable.png) --->

### Available events

By default Strapi webhooks can be triggered by the following events:

| Name              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `entry.create`    | Triggered when a Content Type entry is created.       |
| `entry.update`    | Triggered when a Content Type entry is updated.       |
| `entry.delete`    | Triggered when a Content Type entry is deleted.       |
| `entry.publish`   | Triggered when a Content Type entry is published.\*   |
| `entry.unpublish` | Triggered when a Content Type entry is unpublished.\* |
| `media.create`    | Triggered when a media is created.                    |
| `media.update`    | Triggered when a media is updated.                    |
| `media.delete`    | Triggered when a media is deleted.                    |

\*only when `draftAndPublish` is enabled on this Content Type.

### Payloads

:::tip NOTE
Private fields and passwords are not sent in the payload.
:::

#### Headers

When a payload is delivered to your webhook's URL, it will contain specific headers:

| Header           | Description                                |
| ---------------- | ------------------------------------------ |
| `X-Strapi-Event` | Name of the event type that was triggered. |

#### `entry.create`

This event is triggered when a new entry is created.

**Example payload**

```json
{
  "event": "entry.create",
  "created_at": "2020-01-10T08:47:36.649Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "created_at": "2020-01-10T08:47:36.264Z",
    "updated_at": "2020-01-10T08:47:36.264Z",
    "cover": null,
    "images": []
  }
}
```

#### `entry.update`

This event is triggered when an entry is updated.

**Example payload**

```json
{
  "event": "entry.update",
  "created_at": "2020-01-10T08:58:26.563Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "created_at": "2020-01-10T08:47:36.264Z",
    "updated_at": "2020-01-10T08:58:26.210Z",
    "cover": null,
    "images": []
  }
}
```

#### `entry.delete`

This event is triggered when an entry is deleted.

**Example payload**

```json
{
  "event": "entry.delete",
  "created_at": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "created_at": "2020-01-10T08:47:36.264Z",
    "updated_at": "2020-01-10T08:58:26.210Z",
    "cover": null,
    "images": []
  }
}
```

#### `entry.publish`

This event is triggered when an entry is published.

**Example payload**

```json
{
  "event": "entry.publish",
  "created_at": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "created_at": "2020-01-10T08:47:36.264Z",
    "updated_at": "2020-01-10T08:58:26.210Z",
    "published_at": "2020-08-29T14:20:12.134Z",
    "cover": null,
    "images": []
  }
}
```

#### `entry.unpublish`

This event is triggered when an entry is unpublished.

**Example payload**

```json
{
  "event": "entry.unpublish",
  "created_at": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "created_at": "2020-01-10T08:47:36.264Z",
    "updated_at": "2020-01-10T08:58:26.210Z",
    "published_at": null,
    "cover": null,
    "images": []
  }
}
```

#### `media.create`

This event is triggered when you upload a file on entry creation or through the media interface.

**Example payload**

```json
{
  "event": "media.create",
  "created_at": "2020-01-10T10:58:41.115Z",
  "media": {
    "id": 1,
    "name": "image.png",
    "hash": "353fc98a19e44da9acf61d71b11895f9",
    "sha256": "huGUaFJhmcZRHLcxeQNKblh53vtSUXYaB16WSOe0Bdc",
    "ext": ".png",
    "mime": "image/png",
    "size": 228.19,
    "url": "/uploads/353fc98a19e44da9acf61d71b11895f9.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2020-01-10T10:58:41.095Z",
    "updated_at": "2020-01-10T10:58:41.095Z",
    "related": []
  }
}
```

#### `media.update`

This event is triggered when you replace a media or update the metadata of a media through the media interface.

**Example payload**

```json
{
  "event": "media.update",
  "created_at": "2020-01-10T10:58:41.115Z",
  "media": {
    "id": 1,
    "name": "image.png",
    "hash": "353fc98a19e44da9acf61d71b11895f9",
    "sha256": "huGUaFJhmcZRHLcxeQNKblh53vtSUXYaB16WSOe0Bdc",
    "ext": ".png",
    "mime": "image/png",
    "size": 228.19,
    "url": "/uploads/353fc98a19e44da9acf61d71b11895f9.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2020-01-10T10:58:41.095Z",
    "updated_at": "2020-01-10T10:58:41.095Z",
    "related": []
  }
}
```

#### `media.delete`

This event is triggered only when you delete a media through the media interface.

**Example payload**

```json
{
  "event": "media.delete",
  "created_at": "2020-01-10T11:02:46.232Z",
  "media": {
    "id": 11,
    "name": "photo.png",
    "hash": "43761478513a4c47a5fd4a03178cfccb",
    "sha256": "HrpDOKLFoSocilA6B0_icA9XXTSPR9heekt2SsHTZZE",
    "ext": ".png",
    "mime": "image/png",
    "size": 4947.76,
    "url": "/uploads/43761478513a4c47a5fd4a03178cfccb.png",
    "provider": "local",
    "provider_metadata": null,
    "created_at": "2020-01-07T19:34:32.168Z",
    "updated_at": "2020-01-07T19:34:32.168Z",
    "related": []
  }
}
```
