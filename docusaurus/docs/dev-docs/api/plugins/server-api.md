---
title: Server API for plugins
displayed_sidebar: devDocsSidebar
description: Strapi's Server API for plugins allows a Strapi plugin to customize the back end part (i.e. the server) of your application.
sidebarDepth: 3

---

# Server API for plugins

A Strapi [plugin](/dev-docs/plugins) can interact with the backend or the [frontend](/dev-docs/api/plugins/admin-panel-api) of the Strapi application. The Server API is about the backend part.

Creating and using a plugin interacting with the Server API consists of 2 steps:

1. Declare and export the plugin interface within the [`strapi-server.js` entry file](#entry-file)
2. [Use the exported interface](#usage)

## Entry file

To tap into the Server API, create a `strapi-server.js` file at the root of the plugin package folder. This file exports the required interface, with the following parameters available:

| Parameter type         | Available parameters                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle functions    | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li><li>[destroy](#destroy)</li></ul>                                                                                                           |
| Configuration          | <ul><li>[config](#configuration) object   </li> <li>[Cron](#cron)</li></ul>                                                                                                                                                                             |
| Backend customizations | <ul><li>[contentTypes](#content-types)</li><li>[routes](#routes)</li><li>[controllers](#controllers)</li><li>[services](#services)</li><li>[policies](#policies)</li><li>[middlewares](#middlewares)</li></ul> |

## Lifecycle functions

### register()

This function is called to load the plugin, before the application is [bootstrapped](#bootstrap), in order to register [permissions](/dev-docs/plugins/users-permissions), the server part of [custom fields](/dev-docs/custom-fields#registering-a-custom-field-on-the-server), or database migrations.

**Type**: `Function`

**Example:**

```js title="path ./src/plugins/my-plugin/strapi-server.js"

module.exports = () => ({
  register({ strapi }) {
    // execute some register code
  },
});
```

### bootstrap()

The [bootstrap](/dev-docs/configurations/functions#bootstrap) function is called right after the plugin has [registered](#register).

**Type**: `Function`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

module.exports = () => ({
  bootstrap({ strapi }) {
    // execute some bootstrap code
  },
});
```

### destroy()

The [destroy](/dev-docs/configurations/functions#destroy) lifecycle function is called to cleanup the plugin (close connections, remove listeners, etc.) when the Strapi instance is destroyed.

**Type**: `Function`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

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

```js title="path: ./src/plugins/my-plugin/strapi-server.js or ./src/plugins/my-plugin/server/index.js"

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

Once defined, the configuration can be accessed:

- with `strapi.plugin('plugin-name').config('some-key')` for a specific configuration property,
- or with `strapi.config.get('plugin.plugin-name')` for the whole configuration object.

## Cron

The `cron` object allows you to add cron jobs to the Strapi instance.

```js title="path: ./src/plugins/my-plugin/strapi-server.js"
module.exports = () => ({
  bootstrap({ strapi }) {
    strapi.cron.add({
      // runs every second
      myJob: {
        task: ({ strapi }) => {
          console.log("hello from plugin");
        },
        options: {
          rule: "* * * * * *",
        },
      },
    });
  },
});
```

To remove a CRON job you can call the remove function on the `strapi.cron` object and pass in the key corresponding to the CRON job you want to remove.

:::note
Cron jobs that are using the key as the rule can not be removed.
:::

```js
strapi.cron.remove("myJob");
```

### List cron jobs

To list all the cron jobs that are currently running you can call the `jobs` array on the `strapi.cron` object.

```js
strapi.cron.jobs
```

## Backend customization

### Content-types

An object with the [content-types](/dev-docs/backend-customization/models) the plugin provides.

**Type**: `Object`

:::note
Content-Types keys in the `contentTypes` object should re-use the `singularName` defined in the [`info`](/dev-docs/backend-customization/models#model-information) key of the schema.
:::

**Example:**

```js title="./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const contentTypes = require('./content-types');

module.exports = () => ({
  contentTypes,
});
```

```js title="path: ./src/plugins/my-plugin/server/content-types/index.js"

const contentTypeA = require('./content-type-a');
const contentTypeB = require('./content-type-b');

module.exports = {
  'content-type-a': { schema: contentTypeA }, // should re-use the singularName of the content-type
  'content-type-b': { schema: contentTypeB },
};
```

```js title="path: ./src/plugins/my-plugin/server/content-types/content-type-a.js"

module.exports = {
  kind: 'collectionType',
  collectionName: 'content-type',
  info: {
    singularName: 'content-type-a', // kebab-case mandatory
    pluralName: 'content-type-as', // kebab-case mandatory
    displayName: 'Content Type A',
    description: 'A regular content-type',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    }
  },
  attributes: {
    name: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false,
    },
  }
};
```

### Routes

An array of [routes](/dev-docs/backend-customization/routes) configuration.

**Type**: `Object[]`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const routes = require('./routes');

module.exports = () => ({
  routes,
  type: 'content-api', // can also be 'admin' depending on the type of route
});
```

```js title="path: ./src/plugins/my-plugin/server/routes/index.js"

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

An object with the [controllers](/dev-docs/backend-customization/controllers) the plugin provides.

**Type**: `Object`

**Example:**


```js title="path: ./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const controllers = require('./controllers');

module.exports = () => ({
  controllers,
});
```

```js title="path: ./src/plugins/my-plugin/server/controllers/index.js"

const controllerA = require('./controller-a');
const controllerB = require('./controller-b');

module.exports = {
  controllerA,
  controllerB,
};
```

```js title="path: ./src/plugins/my-plugin/server/controllers/controller-a.js"

module.exports = ({ strapi }) => ({
  doSomething(ctx) {
    ctx.body = { message: 'HelloWorld' };
  },
});
```

### Services

An object with the [services](/dev-docs/backend-customization/services) the plugin provides.

Services should be functions taking `strapi` as a parameter.

**Type**: `Object`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const services = require('./services');

module.exports = () => ({
  services,
});
```

```js title="path: ./src/plugins/my-plugin/server/services/index.js"

const serviceA = require('./service-a');
const serviceB = require('./service-b');

module.exports = {
  serviceA,
  serviceB,
};
```

```js title="path: ./src/plugins/my-plugin/server/services/service-a.js"

module.exports = ({ strapi }) => ({
  someFunction() {
    return [1, 2, 3];
  },
});
```

### Policies

An object with the [policies](/dev-docs/backend-customization/policies) the plugin provides.

**Type**: `Object`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const policies = require('./policies');

module.exports = () => ({
  policies,
});
```

```js title="path: ./src/plugins/my-plugin/server/policies/index.js"

const policyA = require('./policy-a');
const policyB = require('./policy-b');

module.exports = {
  policyA,
  policyB,
};
```

```js title="path: ./src/plugins/my-plugin/server/policies/policy-a.js"

module.exports = (policyContext, config, { strapi }) => {
    if (ctx.state.user && ctx.state.user.isActive) {
      return true;
    }

    return false;
};
```

### Middlewares

An object with the [middlewares](/dev-docs/configurations/middlewares) the plugin provides.

**Type**: `Object`

**Example:**

```js title="path: ./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="path: ./src/plugins/my-plugin/server/index.js"

const middlewares = require('./middlewares');
module.exports = () => ({
  middlewares,
});
```

```js title="path: ./src/plugins/my-plugin/server/middlewares/index.js"

const middlewareA = require('./middleware-a');
const middlewareB = require('./middleware-b');

module.exports = {
  middlewareA,
  middlewareB,
};
```

```js title="path: ./src/plugins/my-plugin/server/middlewares/middleware-a.js"

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

While top-level getters imply chaining functions, global getters are syntactic sugar that allows direct access using a feature's uid:

```js
// Access an API or a plugin controller using a top-level getter 
strapi.api['api-name'].controller('controller-name')
strapi.plugin('plugin-name').controller('controller-name')

// Access an API or a plugin controller using a global getter
strapi.controller('api::api-name.controller-name')
strapi.controller('plugin::plugin-name.controller-name')
```

<details>
<summary> Top-level getter syntax examples</summary>

```js
strapi.plugin('plugin-name').config
strapi.plugin('plugin-name').routes
strapi.plugin('plugin-name').controller('controller-name')
strapi.plugin('plugin-name').service('service-name')
strapi.plugin('plugin-name').contentType('content-type-name')
strapi.plugin('plugin-name').policy('policy-name')
strapi.plugin('plugin-name').middleware('middleware-name')
```

</details>

<details>
<summary> Global getter syntax examples</summary>

```js
strapi.controller('plugin::plugin-name.controller-name');
strapi.service('plugin::plugin-name.service-name');
strapi.contentType('plugin::plugin-name.content-type-name');
strapi.policy('plugin::plugin-name.policy-name');
strapi.middleware('plugin::plugin-name.middleware-name');
```

</details>

:::strapi Entity Service API
To interact with the content-types, use the [Entity Service API](/dev-docs/api/entity-service).
:::
