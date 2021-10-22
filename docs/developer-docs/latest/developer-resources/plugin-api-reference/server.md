---
title: Server API - Strapi Developer Documentation
description: …
sidebarDepth: 3
---
<!-- TODO: update SEO -->

# Server API for plugins

A Strapi [plugin](/developer-docs/latest/plugins/plugins-intro.md) can interact with the back end or the [front end](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md) of the Strapi application. The Server API is about the back end part.

Creating and using a plugin interacting with the Server API consists in 2 steps:

1. Declare and export the plugin interface within the [`strapi-server.js` entry file](#entry-file)
2. [Use the exported interface](#usage)

<!-- TODO: add TIP with path to Github example here? -->

## Entry file

To tap into the Server API, create a `strapi-server.js` file at the root of the plugin package folder. This file exports the required interface, with the following parameters available:

| Parameter type         | Available parameters                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle functions    | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li><li>[destroy](#destroy)</li></ul>                                                                                                           |
| Configuration          | [config](#configuration) object                                                                                                                                                                                |
| Backend customizations | <ul><li>[contentTypes](#content-types)</li><li>[routes](#routes)</li><li>[controllers](#controllers)</li><li>[services](#services)</li><li>[policies](#policies)</li><li>[middlewares](#middlewares)</li></ul> |

<!-- TODO: update or remove the commented example as it's not super useful as-is: either add some example for every parameter (register, boostrap, routes, controllers…) or provide a link to Github (i18n or upload plugin?) -->
<!-- **Example:**

```js
// path: `./my-plugin/strapi-server.js`

module.exports = () => {
  return {
    register() {},
    bootstrap() {},
    destroy() {},
    config: {
      default: ({ env }) => ({ fizz: 'buzz' }),
      validator: (config) => {
        if (typeof config.fizz !== string) {
          throw new Error('fizz has to be a string');
        }
      },
    },
    routes: [],
    controllers: {},
    services: {
      serviceA: ({ strapi }) => ({
        functionA: () => {},
      });
    },
    policies: {},
    middlewares: {},
    contentTypes: [],
    hooks: {},
  };
};
``` -->

## Lifecycle functions

### register()

This function is called to load the plugin, even before the application is actually [bootstrapped](#bootstrap), in order to register [permissions](/developer-docs/latest/plugins/users-permissions.md) or database migrations.

**Type**: `Function`

**Example:**

```js
// path ./strapi-server.js

module.exports = () => ({
  register({ strapi }) {
    // execute some register code
  },
});
```

### bootstrap()

The [bootstrap](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md#bootstrap) function is called right after the plugin has [registered](#register).

**Type**: `Function`

**Example:**

```js
// path: ./strapi-server.js

module.exports = () => ({
  bootstrap({ strapi }) {
    // execute some bootstrap code
  },
});
```

### destroy()

This function is called to cleanup the plugin (close connections, remove listeners…) when the Strapi instance is destroyed.

**Type**: `Function`

**Example:**

```js
// path: ./strapi-server.js

module.exports = () => ({
  destroy({ strapi }) {
    // execute some destroy code
  },
});
```

## Configuration

`config` stores the default plugin configuration.

**Type**: `Object`

| Parameter   | Type                                           | Description                                                                                                                                              |
| ----------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Object, or Function that returns an Object | Default plugin configuration, merged with the user configuration                                                                                         |
| `validator` | Function                                       | <ul><li>Checks if the results of merging the default plugin configuration with the user configuration is valid</li><li>Throws errors when the resulting configuration is invalid</li></ul> |

**Example:**

```js
// path: ./strapi-server.js

const config = require('./config');

module.exports = () => ({
  config: {
    default: ({ env }) => ({ optionA: true }),
    validator: (config) => { 
      if (typeof config.optionA !== 'boolean') {
        throw new Error('optionA has to be a boolean');
      }
    },
  },
});
```

## Backend customization

### Content-Types

An object with the [Content-Types](/developer-docs/latest/development/backend-customization/models.md) the plugin provides.
<!-- TODO: update link to Backend customization > models once merged with database PR -->

**Type**: `Object`

<!-- ! The link to the `info` section below won't work in this PR, but will work once the content is merged with the database PR -->
:::note
Content-Types keys in the `contentTypes` object should re-use the `singularName` defined in the [`info`](/developer-docs/latest/development/backend-customization/models.md#model-information) key of the schema.
:::

**Example:**

```js
// path: ./strapi-server.js

const contentTypes = require('./content-types');

module.exports = () => ({
  contentTypes,
});
```

```js
// path: ./content-types/index.js

const contentTypeA = require('./content-type-a');
const contentTypeB = require('./content-type-b');

module.exports = [
  'content-type-a': contentTypeA, // should re-use the singularName of the content-type
  'content-type-b': contentTypeB, 
];
```

```js
// path: ./content-types/content-type-a.js

module.exports = {
  info: {
    tableName: 'content-type',
    singularName: 'content-type-a', // kebab-case mandatory
    pluralName: 'content-type-as', // kebab-case mandatory
    displayName: 'Content Type A',
    description: 'A regular content type'
    kind: 'collectionType'
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: false
    },
    'content-type-builder': {
      visible: false
    }
  },
  attributes: {
    name: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false
    },
  }
};
```

### Routes

<!-- ? Have we decided on/implemented routes behavior yet? -->
<!-- TODO: update once routing docs are updated -->

An array of [routes](/developer-docs/latest/development/backend-customization/routing.md) configuration.

**Type**: `Object[]`

**Example:**

```js
// path: ./strapi-server.js

const routes = require('./routes');

module.exports = () => ({
  routes,
  type: 'content-api' // can also be 'admin-api' depending on the type of route
});
```

```js
// path: ./routes/index.js

module.exports = [
  {
    method: 'GET',
    path: '/model',
    handler: 'controllerName.action',
    config: {
      policies: ['policyName'],
    },
  },
];
```

### Controllers

An object with the [controllers](/developer-docs/latest/development/backend-customization/controllers.md) the plugin provides.

**Type**: `Object`

**Example:**

```js
// path: ./strapi-server.js

const controllers = require('./controllers');

module.exports = () => ({
  controllers,
});
```

```js
// path: ./controllers/index.js

const controllerA = require('./controller-a');
const controllerB = require('./controller-b');

module.exports = {
  controllerA,
  controllerB,
};
```

```js
// path: ./controllers/controller-a.js

module.exports = {
  doSomething(ctx) {
    ctx.body = { message: 'HelloWorld' };
  },
};
```

### Services

An object with the [services](/developer-docs/latest/development/backend-customization/services.md) the plugin provides.

Services should be functions taking `strapi` as a parameter.

**Type**: `Object`

**Example:**

```js
// path: ./strapi-server.js

const services = require('./services');

module.exports = () => ({
  services,
});
```

```js
// path: ./services/index.js

const serviceA = require('./service-a');
const serviceB = require('./service-b');

module.exports = {
  serviceA,
  serviceB,
};
```

```js
// path: ./services/service-a.js

module.exports = ({ strapi }) => ({
  someFunction() {
    return [1, 2, 3];
  },
});
```

### Policies

<!-- ? are policies still implemented like described in the RFC? -->

An object with the [policies](/developer-docs/latest/development/backend-customization/policies.md) the plugin provides.

**Type**: `Object`

**Example:**

```js
// path: ./strapi-server.js

const policies = require('./policies');

module.exports = () => ({
  policies,
});
```

```js
// path: ./policies/index.js

const policyA = require('./policy-a');
const policyB = require('./policy-b');

module.exports = {
  policyA,
  policyB,
};
```
<!-- TODO: update example when policies docs are updated -->

```js
// path: ./policies/policy-a.js

module.exports = (ctx, next) => {
    if (ctx.state.user && ctx.state.user.isActive) {
      return next();
    }

    ctx.unauthorized('Unauthorized');
  },
};
```

### Middlewares

<!-- TODO: check if it should be updated after updating middleware docs -->

An object with the [middlewares](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md) the plugin provides.

**Type**: `Object`

**Example:**

```js
// path: ./strapi-server.js

const middlewares = require('./middlewares');
module.exports = () => ({
  middlewares,
});
```

```js
// path: ./middlewares/index.js

const middlewareA = require('./middleware-a');
const middlewareB = require('./middleware-b');

module.exports = {
  middlewareA,
  middlewareB,
};
```

```js
// path: ./middlewares/middleware-a.js

module.exports = (options, { strapi }) => {
 return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);

    strapi.log.http(`${ctx.method} ${ctx.url} (${delta} ms) ${ctx.status}`);
 };
};
```

## Usage

Once a plugin is exported and loaded into Strapi, its features are accessible in the code through getters. The Strapi instance (`strapi`) exposes top-level getters and global getters.

While top-level getters imply chaining functions, global getters are syntactic sugar that allow direct access using a feature's uid:

```js
// Access an API or a plugin controller using a top-level getter 
strapi.api('api-name').controller('controller-name')
strapi.plugin('plugin-name').controller('controller-name')

// Access an API or a plugin controller using a global getter
strapi.controller('api::api-name.controller-name')
strapi.controller('plugin::plugin-name.controller-name')
```

:::details Top-level getter syntax examples

```js
strapi.plugin('plugin-name').config
strapi.plugin('plugin-name').routes
strapi.plugin('plugin-name').controller('controller-name')
strapi.plugin('plugin-name').service('service-name')
strapi.plugin('plugin-name').contentType('content-type-name')
strapi.plugin('plugin-name').policy('policy-name')
strapi.plugin('plugin-name').middleware('middleware-name')
```

:::

:::details Global getter syntax examples

```js
strapi.controller('plugin::plugin-name.controller-name');
strapi.service('plugin::plugin-name.service-name');
strapi.contentType('plugin::plugin-name.content-type-name');
strapi.policy('plugin::plugin-name.policy-name');
strapi.middleware('plugin::plugin-name.middleware-name');
```

:::
