---
title: Server API for plugins
sidebar_label: Server API
displayed_sidebar: devDocsSidebar
description: Strapi's Server API for plugins allows a Strapi plugin to customize the back end part (i.e. the server) of your application.
tags:
- plugin APIs
- lifecycle function
- register function
- bootstrap function
- destroy function
- configuration
- backend customization
- routes
- controllers
- services
- policies
- middlewares

---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Server API for plugins

<NotV5 />

A Strapi [plugin](/dev-docs/plugins) can interact with both the back end and the [front end](/dev-docs/plugins/admin-panel-api) of a Strapi application. The Server API is about the back-end part, i.e. how the plugin interacts with the server part of a Strapi application.

:::prerequisites
You have [created a Strapi plugin](/dev-docs/plugins/development/create-a-plugin).
:::

The Server API includes:

- an [entry file](#entry-file) which export the required interface,
- [lifecycle functions](#lifecycle-functions),
- a [configuration](#configuration) API,
- the ability to add [cron](#cron) jobs,
- and the ability to [customize all elements of the back-end server](#backend-customization).

Once you have declared and exported the plugin interface, you will be able to [use the plugin interface](#usage).

:::note
The whole code for the server part of your plugin could live in the `/strapi-server.js|ts` or `/server/index.js|ts` file. However, it's recommended to split the code into different folders, just like the [structure](/dev-docs/plugins/development/plugin-structure) created by the `strapi generate plugin` CLI generator command.
:::

## Entry file

To tap into the Server API, create a `strapi-server.js` file at the root of the plugin package folder. This file exports the required interface, with the following parameters available:

| Parameter type         | Available parameters                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle functions    | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li><li>[destroy](#destroy)</li></ul>                                                                                                           |
| Configuration          | <ul><li>[config](#configuration) object   </li></ul>                                                                                                                                                                             |
| Backend customizations | <ul><li>[contentTypes](#content-types)</li><li>[routes](#routes)</li><li>[controllers](#controllers)</li><li>[services](#services)</li><li>[policies](#policies)</li><li>[middlewares](#middlewares)</li></ul> |

## Lifecycle functions

### register()

This function is called to load the plugin, before the application is [bootstrapped](#bootstrap), in order to register [permissions](/dev-docs/plugins/users-permissions), the server part of [custom fields](/dev-docs/custom-fields#registering-a-custom-field-on-the-server), or database migrations.

**Type**: `Function`

**Example:**

```js title="./src/plugins/my-plugin/strapi-server.js"

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

```js title="./src/plugins/my-plugin/strapi-server.js"

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

```js title="./src/plugins/my-plugin/strapi-server.js"

module.exports = () => ({
  destroy({ strapi }) {
    // execute some destroy code
  },
});
```

## Configuration

`config` stores the default plugin configuration. It loads and validates the configuration inputted from the user within the [`./config/plugins.js` configuration file](/dev-docs/configurations/plugins).

**Type**: `Object`

| Parameter   | Type                                           | Description                                                                                                                                              |
| ----------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Object, or Function that returns an Object | Default plugin configuration, merged with the user configuration                                                                                         |
| `validator` | Function                                       | <ul><li>Checks if the results of merging the default plugin configuration with the user configuration is valid</li><li>Throws errors when the resulting configuration is invalid</li></ul> |

**Example:**

```js title="./src/plugins/my-plugin/strapi-server.js or ./src/plugins/my-plugin/server/index.js"

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

:::tip
Run `yarn strapi console` or `npm run strapi console` to access the strapi object in a live console.
:::

## Backend customization

All elements of the back-end server of Strapi can be customized through a plugin using the Server API.

:::prerequisites
To better understand this section, ensure you have read through the [back-end customization](/dev-docs/backend-customization) documentation of a Strapi application.
:::

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

**Examples:**

<Tabs>
<TabItem value="content-api" label="Content API routes only">

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

</TabItem>

<TabItem value="both" label="Content API and admin routes">

It is also possible to combine both admin and Content API routes if you need different policies on these: 

```js title="./src/plugins/my-plugin/server/routes/index.js"

module.exports = {
  admin: require('./admin'),
  'content-api': require('./content-api'),
};
```

```js title="./src/plugins/my-plugin/server/routes/admin/index.js"

module.exports = {
  type: 'admin',
  routes: [{
    method: 'GET',
    path: '/model',
    handler: 'controllerName.action',
    config: {
      policies: ['policyName'],
    },
  }],
};
```

```js title="./src/plugins/my-plugin/server/routes/content-api/index.js"

module.exports = {
  type: 'content-api',
  routes: [{
    method: 'GET',
    path: '/model',
    handler: 'controllerName.action',
    config: {
      policies: ['differentPolicyName'],
    },
  }],
};
```

</TabItem>
</Tabs>

### Controllers

An object with the [controllers](/dev-docs/backend-customization/controllers) the plugin provides.

**Type**: `Object`

**Example:**


```js title="./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="./src/plugins/my-plugin/server/index.js"

const controllers = require('./controllers');

module.exports = () => ({
  controllers,
});
```

```js title="./src/plugins/my-plugin/server/controllers/index.js"

const controllerA = require('./controller-a');
const controllerB = require('./controller-b');

module.exports = {
  controllerA,
  controllerB,
};
```

```js title="./src/plugins/my-plugin/server/controllers/controller-a.js"

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

```js title="./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="./src/plugins/my-plugin/server/index.js"

const services = require('./services');

module.exports = () => ({
  services,
});
```

```js title="./src/plugins/my-plugin/server/services/index.js"

const serviceA = require('./service-a');
const serviceB = require('./service-b');

module.exports = {
  serviceA,
  serviceB,
};
```

```js title="./src/plugins/my-plugin/server/services/service-a.js"

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

```js title="./src/plugins/my-plugin/strapi-server.js"

"use strict";

module.exports = require('./server');
```

```js title="./src/plugins/my-plugin/server/index.js"

const policies = require('./policies');

module.exports = () => ({
  policies,
});
```

```js title="./src/plugins/my-plugin/server/policies/index.js"

const policyA = require('./policy-a');
const policyB = require('./policy-b');

module.exports = {
  policyA,
  policyB,
};
```

```js title="./src/plugins/my-plugin/server/policies/policy-a.js"

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

```js title="./src/plugins/my-plugin/server/middlewares/your-middleware.js"

/** 
 * The your-middleware.js file 
 * declares a basic middleware function and exports it.
 */
'use strict';
module.exports = async (ctx, next) => {
  console.log("your custom logic")
  await next();
}
```

```js title="./src/plugins/my-plugin/server/middlewares/index.js"

/**
 * The middleware function previously created
 * is imported from its file and
 * exported by the middlewares index.
 */
'use strict';
const yourMiddleware = require('./your-middleware');

module.exports = {
  yourMiddleware
};
```

```js title="./src/plugins/my-plugin/server/register.js"

/**
 * The middleware is called from 
 * the plugin's register lifecycle function.
 */
'use strict';
const middlewares = require('./middlewares');

module.exports = ({ strapi }) => {
  strapi.server.use(middlewares.yourMiddleware);
};
```

## Usage

Once a plugin is exported and loaded into Strapi, its features are accessible in the code through getters. The Strapi instance (`strapi`) exposes both top-level getters and global getters:

- top-level getters imply chaining functions<br/>(e.g., `strapi.plugin('the-plugin-name').controller('the-controller-name'`),
- global getters are syntactic sugar that allows direct access using a feature's uid<br/>(e.g., `strapi.controller('plugin::plugin-name.controller-name')`).

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

:::strapi Document Service API
To interact with the content-types, use the [Document Service API](/dev-docs/api/document-service).
:::
