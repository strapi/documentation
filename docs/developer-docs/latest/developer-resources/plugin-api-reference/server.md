---
title: Server Plugin API - Strapi Developer Documentation
description: …
sidebarDepth: 3
---
<!-- TODO: update SEO -->

# Server Plugin API (`strapi-server.js`)

<!-- TODO: Add intro here -->

<!-- TODO: add TIP with path to Github example here? -->

## Entry file

The Server Plugin API entry file, `./strapi-server.js`, is located at the root of the package and exports the required interface.

It's a function that exports:
| Parameter type | Available parameters |
|---|---|
| Lifecycle hooks |  <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li><li>[destroy](#destroy)</li></ul> |
| Configuration | [config](#configuration) object |
| Backend customizations | <ul><li>[routes](#routes)</li><li>[controllers](#controllers)</li><li>[services](#services)</li><li>[policies](#policies)</li><li>[middlewares](#middlewares)</li></ul> |
| Content-Types | [`contentTypes` declared by the plugin](#content-types) | 
| Hooks | [`hooks` declared by the plugin](#content-types) |
<!-- TODO: add link to Hook API above -->

**Type**: `Function | AsyncFunction`

**Example**

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
```

## Lifecycles

### Register

Exposes the register function. This function will be called before bootstrap in order to register different things such as migrations or permissions.

**Type**: `Function`

**Example**

`./strapi-server.js`

```js
module.exports = () => ({
  register() {
    // execute some register code
  },
});
```

### Bootstrap

Exposes the [bootstrap](/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap) function.

**Type**: `Function`

**Example**

`./strapi-server.js`

```js
module.exports = () => ({
  bootstrap() {
    // execute some bootstrap code
  },
});
```

### Destroy

Exposes the destroy function. Similar to bootstrap this function will be called to cleanup the plugin (close connections / remove listeners ...) when the Strapi instance is destroyed.

**Type**: `Function`

**Example**

`./strapi-server.js`

```js
module.exports = () => ({
  destroy() {
    // execute some destroy code
  },
});
```

## Configuration

Default plugin configuration. A plain `Object`.

 - `default`: (Object or Function that returns a plain Object),  Default plugin configuration, merged with the user configuration
 - `validator`: a function that checks the results of merging the default plugin configuration to the user configuration is valid, and throws errors when the configuration is invalid

**Example**:

<!-- TODO: check if this config object has the same shape in strapi-server.js and in strapi-admin.js 👇 -->

<!-- TODO: merge the 2 examples -->

```js
// path: ./strapi-server.js

const config = require('./config');
module.exports = () => ({
  config: {
    default: ({ env }) => { optionA: true },
    validator: (config) => { /* throws if config is invalid */ }
  },
});
```

```js
config: {
      default: ({ env }) => ({ fizz: 'buzz' }),
      validator: (config) => {
        if (typeof config.fizz !== string) {
          throw new Error('fizz has to be a string');
        }
      },
    },
```

:::note
If you use a function, it will have the same behavior as the application configuration (see [formats](http://localhost:8080/documentation/developer-docs/latest/setup-deployment-guides/configurations.md#formats) documentation)
:::

## Backend customization

### Content-Types

An array with the [Content-Types]() the plugin provides.
<!-- TODO: add link to Backend customization > models once merged with database PR -->

**Type**: `Object[]`

**Example**

`./strapi-server.js`

```js
const contentTypes = require('./content-types');

module.exports = () => ({
  contentTypes,
});
```

`./content-types/index.js`

```js
const contentTypeA = require('./content-type-a');
const contentTypeB = require('./content-type-b');

module.exports = [
  contentTypeA,
  contentTypeB,
];
```

`./content-types/content-type-a.js`

```js
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

An array of [route]() configuration.
<!-- TODO: add link to Backend customization > Routing once merged with database PR -->

**Type**: `Object[]`

**Example**

`./strapi-server.js`

```js
const routes = require('./routes');

module.exports = () => ({
  routes,
});
```

`./routes/index.js`

```js
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

An object with the [controllers]() the plugin provides.
<!-- TODO: add link to Backend Customization > Controllers once merged with database PR -->

**Type**: `Object`

**Example**

`./strapi-server.js`

```js
const controllers = require('./controllers');

module.exports = () => ({
  controllers,
});
```

`./controllers/index.js`

```js
const controllerA = require('./controller-a');
const controllerB = require('./controller-b');

module.exports = {
  controllerA,
  controllerB,
};
```

`./controllers/controller-a.js`

```js
module.exports = {
  doSomething(ctx) {
    ctx.body = { message: 'HelloWorld' };
  },
};
```

### Services

An object with the [services]() the plugin provides.
<!-- TODO: add link to Backend Customization > Services once merged with database PR -->

**Type**: `Object`

**Example**

`./strapi-server.js`

```js
const services = require('./services');

module.exports = () => ({
  services,
});
```

`./services/index.js`

```js
const serviceA = require('./service-a');
const serviceB = require('./service-b');

module.exports = {
  serviceA,
  serviceB,
};
```

`./services/service-a.js`

```js
module.exports = ({ strapi }) => ({
  someFunction() {
    return [1, 2, 3];
  },
});
```

### Policies

An object with the [policies]() the plugin provides.
<!-- TODO: add link to Backend Customization > Policies once merged with the database PR -->

**Type**: `Object`

**Example**

`./strapi-server.js`

```js
const policies = require('./policies');

module.exports = () => ({
  policies,
});
```

`./policies/index.js`

```js
const policyA = require('./policy-a');
const policyB = require('./policy-b');

module.exports = {
  policyA,
  policyB,
};
```

`./policies/policy-a.js`

```js
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

**Example**

`./strapi-server.js`

```js
const middlewares = require('./middlewares');
module.exports = () => ({
  middlewares,
});
```

`./middlewares/index.js`

```js
const middlewareA = require('./middleware-a');
const middlewareB = require('./middleware-b');

module.exports = {
  middlewareA,
  middlewareB,
};
```

`./middlewares/middleware-a.js`

```js
module.exports = (strapi) => ({
  defaults: { enabled: true }, // default settings,
  beforeInitialize() {},
  initialize() {},
});
```

### Hooks

An `Object` with the [hooks]() the plugin provides.
<!-- TODO: link to Hook API section once documented -->

**Type**: `Object`

**Example**

`./strapi-server.js`

```js
const hooks = require('./hooks');
module.exports = () => ({
  hooks,
});
```

`./hooks/index.js`

```js
const hookA = require('./hook-a');
const hookB = require('./hook-b');

module.exports = {
  hookA,
  hookB,
};
```

`./hooks/hook-a.js`

```js
module.exports = (strapi) => ({
  defaults: { enabled: true }, // default settings,
  beforeInitialize() {},
  initialize() {},
});
```

## Usage

The plugin is exported and loaded into Strapi. Now a developper needs to be able to access those features to use them in the code.

### Top level getters

The Strapi instance will expose getters to easily access features in different places.

#### `api`

```js
const api = strapi.api('apiName');
```

#### `plugin`

```js
const plugin = strapi.plugin('pluginName');
```

### Plugin or Api getters

#### `config`

```js
plugin.config;
```

#### `routes`

```js
plugin.routes;
```

#### `controller`

```js
plugin.controller('controllerName');
```

#### `service`

```js
plugin.service('serviceName');
```

#### `contentType`

```js
plugin.contentType('contentTypeName');
```

#### `policy`

```js
plugin.policy('policyName');
```

#### `hook`

```js
plugin.hook('hookName');
```

#### `middleware`

```js
plugin.middleware('middlewareName');
```

### Shortcut getters

Having to call two functions to access a feature is not always the most efficient. To help with this we are going to provide global getters for each features.

> Following the naming convention RFC [here](https://github.com/strapi/rfcs/blob/master/rfcs/0002-global-naming-convention.md). we are going to use it to provide top level getter for plugin or api features.

#### `controller`

```js
strapi.controller('application::apiName.controllerName');
strapi.controller('plugins::pluginName.controllerName');
```

#### `service`

```js
strapi.service('application::apiName.serviceName');
strapi.service('plugins::pluginName.serviceName');
```

#### `contentType`

```js
strapi.contentType('application::apiName.contentTypeName');
strapi.contentType('plugins::pluginName.contentTypeName');
```

#### `policy`

```js
strapi.policy('application::apiName.policyName');
strapi.policy('plugins::pluginName.policyName');
```

#### `hook`

```js
strapi.hook('application::apiName.hookName');
strapi.hook('plugins::pluginName.hookName');
```

#### `middleware`

```js
strapi.middleware('application::apiName.middlewareName');
strapi.middleware('plugins::pluginName.middlewareName');
```



