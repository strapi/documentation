---
title: Server API - Strapi Developer Documentation
description: …
sidebarDepth: 3
---
<!-- TODO: update SEO -->

# Server API for plugins

A Strapi [plugin](/developer-docs/latest/development/local-plugins-customization.md) can interact with the back end or the front end of the Strapi app. The Server API is about the back end part.

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

This function is called as soon as a plugin is loaded, even before the app is actually [bootstrapped](#bootstrap), in order to register [permissions](/developer-docs/latest/development/plugins/users-permissions.html) or database migrations.

**Type**: `Function`

**Example:**

```js
// path ./strapi-server.js

module.exports = () => ({
  register() {
    // execute some register code
  },
});
```

### bootstrap()

The [bootstrap](/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap) function is called right after the plugin has [registered](#register).

**Type**: `Function`

**Example:**

```js
// path: ./strapi-server.js

module.exports = () => ({
  bootstrap() {
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
  destroy() {
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
    default: ({ env }) => { optionA: true },
    validator: (config) => { 
      if (typeof config.optionA !== boolean) {
        throw new Error('optionA has to be a boolean');
      }
    },
  },
});
```

## Backend customization

### Content-Types

An object with the [Content-Types](/developer-docs/latest/development/backend-customization.html#models) the plugin provides.
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
  contentTypeA, // should re-use the same
  contentTypeB,
];
```

```js
// path: ./content-types/content-type-a.js

module.exports = {
  info: {
    tableName: 'content-type',
    singularName: 'contentTypeA', // camel case mandatory
    pluralName: 'contentTypeAs', // camel case mandatory
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

An array of [route](/developer-docs/latest/development/backend-customization.html#routing) configuration.
<!-- TODO: update link to Backend customization > Routing once merged with database PR -->

**Type**: `Object[]`

**Example:**

```js
// path: ./strapi-server.js

const routes = require('./routes');

module.exports = () => ({
  routes,
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

An object with the [controllers](/developer-docs/latest/development/backend-customization.html#controllers) the plugin provides.
<!-- TODO: update link to Backend Customization > Controllers once merged with database PR -->

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

An object with the [services](/developer-docs/latest/development/backend-customization.html#services) the plugin provides.
<!-- TODO: update link to Backend Customization > Services once merged with database PR -->

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

An object with the [policies](/developer-docs/latest/development/backend-customization.html#policies) the plugin provides.
<!-- TODO: update link to Backend Customization > Policies once merged with the database PR -->

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

An object with the [middlewares](/developer-docs/latest/setup-deployment-guides/configurations.html#middlewares) the plugin provides.

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

module.exports = (strapi) => ({
  defaults: { enabled: true }, // default settings,
  beforeInitialize() {},
  initialize() {},
});
```

## Usage

Once a plugin is exported and loaded into Strapi, its features are accessible in the code through getters. The Strapi instance (`strapi`) exposes top-level getters and shortcut getters.

While top-level getters imply chaining functions, global getters are syntactic sugar shortcuts that allow direct access using a feature's uid:

```js
// Access an API or a plugin controller using a top-level getter 
strapi.api('apiName').controller('controllerName')
strapi.plugin('pluginName').controller('controllerName')

// Access an API or a plugin controller using a global getter
strapi.controller('api::apiName.controllerName')
strapi.controller('plugin::pluginName.controllerName')
```

:::details Top-level getter syntax examples

```js
strapi.plugin('pluginName').config
strapi.plugin('pluginName').routes
strapi.plugin('pluginName').controller('controllerName')
strapi.plugin('pluginName').service('serviceName')
strapi.plugin('pluginName').contentType('contentTypeName')
strapi.plugin('pluginName').policy('policyName')
strapi.plugin('pluginName').middleware('middlewareName')
```

:::

:::details Global getter syntax examples

```js
strapi.controller('plugin::pluginName.controllerName');
strapi.service('plugin::pluginName.serviceName');
strapi.contentType('plugin::pluginName.contentTypeName');
strapi.policy('plugin::pluginName.policyName');
strapi.middleware('plugin::pluginName.middlewareName');
```
:::
