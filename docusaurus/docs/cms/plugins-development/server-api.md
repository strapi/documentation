---
title: Server API for plugins
sidebar_label: Server API
displayed_sidebar: cmsSidebar
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

# Server API for plugins

A Strapi plugin can interact with both the back end and the [front end](/cms/plugins-development/admin-panel-api) of a Strapi application. The Server API is about the back-end part, i.e. how the plugin interacts with the server part of a Strapi application.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin).
:::

The Server API includes:

- an [entry file](#entry-file) which export the required interface,
- [lifecycle functions](#lifecycle-functions),
- a [configuration](#configuration) API,
- and the ability to [customize all elements of the back-end server](#backend-customization).

Once you have declared and exported the plugin interface, you will be able to [use the plugin interface](#usage).

:::note
The whole code for the server part of your plugin could live in the `/server/src/index.ts|js` file. However, it's recommended to split the code into different folders, just like the [structure](/cms/plugins-development/plugin-structure) created by the Plugin SDK.
:::

## Entry file

The `/src/server/index.js` file at the root of the plugin folder exports the required interface, with the following parameters available:

| Parameter type         | Available parameters                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle functions    | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li><li>[destroy](#destroy)</li></ul>                                                                                                           |
| Configuration          | <ul><li>[config](#configuration) object   </li></ul>                                                                                                                                                                             |
| Backend customizations | <ul><li>[contentTypes](#content-types)</li><li>[routes](#routes)</li><li>[controllers](#controllers)</li><li>[services](#services)</li><li>[policies](#policies)</li><li>[middlewares](#middlewares)</li></ul> |

## Lifecycle functions

<br/>

### register()

This function is called to load the plugin, before the application is [bootstrapped](#bootstrap), in order to register [permissions](/cms/features/users-permissions), the server part of [custom fields](/cms/features/custom-fields#registering-a-custom-field-on-the-server), or database migrations.

**Type**: `Function`

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/register.js"

'use strict';

const register = ({ strapi }) => {
  // execute some register code
};

module.exports = register;
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/register.ts"

import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // execute some register code
};

export default register;
```

</TabItem>

</Tabs>

### bootstrap()

The [bootstrap](/cms/configurations/functions#bootstrap) function is called right after the plugin has [registered](#register).

**Type**: `Function`

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.js"
'use strict';

const bootstrap = ({ strapi }) => {
  // execute some bootstrap code
};

module.exports = bootstrap;
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.ts"
import type { Core } from '@strapi/strapi';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // execute some bootstrap code
};

export default bootstrap;

```

</TabItem>

</Tabs>

### destroy()

The [destroy](/cms/configurations/functions#destroy) lifecycle function is called to cleanup the plugin (close connections, remove listeners, etc.) when the Strapi instance is destroyed.

**Type**: `Function`

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/destroy.js"
'use strict';

const destroy = ({ strapi }) => {
  // execute some destroy code
};

module.exports = destroy;
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/destroy.ts"
import type { Core } from '@strapi/strapi';

const destroy = ({ strapi }: { strapi: Core.Strapi }) => {
  // destroy phase
};

export default destroy;
```

</TabItem>
</Tabs>

## Configuration

`config` stores the default plugin configuration. It loads and validates the configuration inputted from the user within the [`./config/plugins.js` configuration file](/cms/configurations/plugins).

**Type**: `Object`

| Parameter   | Type                                           | Description                                                                                                                                              |
| ----------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Object, or Function that returns an Object | Default plugin configuration, merged with the user configuration                                                                                         |
| `validator` | Function                                       | <ul><li>Checks if the results of merging the default plugin configuration with the user configuration is valid</li><li>Throws errors when the resulting configuration is invalid</li></ul> |

**Example:**

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/config/index.js"

module.exports = {
  default: ({ env }) => ({ optionA: true }),
  validator: (config) => { 
    if (typeof config.optionA !== 'boolean') {
      throw new Error('optionA has to be a boolean');
    }
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/config/index.ts"

export default {
  default: ({ env }) => ({ optionA: true }),
  validator: (config) => { 
    if (typeof config.optionA !== 'boolean') {
      throw new Error('optionA has to be a boolean');
    }
  },
};
```

</TabItem>
</Tabs>

Once defined, the configuration can be accessed:

- with `strapi.plugin('plugin-name').config('some-key')` for a specific configuration property,
- or with `strapi.config.get('plugin.plugin-name')` for the whole configuration object.

:::tip
Run `yarn strapi console` or `npm run strapi console` to access the strapi object in a live console.
:::

## Backend customization

All elements of the back-end server of Strapi can be customized through a plugin using the Server API.

:::prerequisites
To better understand this section, ensure you have read through the [back-end customization](/cms/backend-customization) documentation of a Strapi application.
:::

### Content-types

An object with the [content-types](/cms/backend-customization/models) the plugin provides.

**Type**: `Object`

:::note
Content-Types keys in the `contentTypes` object should re-use the `singularName` defined in the [`info`](/cms/backend-customization/models#model-information) key of the schema.
:::

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/content-types/index.js"

'use strict';

const contentTypeA = require('./content-type-a');
const contentTypeB = require('./content-type-b');

module.exports = {
  'content-type-a': { schema: contentTypeA }, // should re-use the singularName of the content-type
  'content-type-b': { schema: contentTypeB },
};
```

```js title="/src/plugins/my-plugin/server/content-types/content-type-a.js"

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

</TabItem>
<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/content-types/index.ts"

const contentTypeA = require('./content-type-a');
const contentTypeB = require('./content-type-b');

module.exports = {
  'content-type-a': { schema: contentTypeA }, // should re-use the singularName of the content-type
  'content-type-b': { schema: contentTypeB },
};
```

```js title="/src/plugins/my-plugin/server/content-types/content-type-a.ts"

export default {
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

</TabItem>
</Tabs>

### Routes

An array of [routes](/cms/backend-customization/routes) configuration.

**Type**: `Object[]`

**Examples:**

<Tabs groupId="js-ts">

<TabItem value="content-api" label="Content API routes only">

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/index.js"

const routes = require('./routes');

module.exports = () => ({
  routes,
  type: 'content-api', // can also be 'admin' depending on the type of route
});
```

```js title="/src/plugins/my-plugin/server/routes/index.js"

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

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/index.ts"

const routes = require('./routes');

export default {
  routes,
  type: 'content-api', // can also be 'admin' depending on the type of route
};
```

```js title="/src/plugins/my-plugin/server/routes/index.ts"

export default [
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

</Tabs>

</TabItem>

<TabItem value="both" label="Content API and admin routes">

It is also possible to combine both admin and Content API routes if you need different policies on these: 

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

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

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/routes/index.ts"

export default {
  admin: require('./admin'),
  'content-api': require('./content-api'),
};
```

```js title="/src/plugins/my-plugin/server/routes/admin/index.ts"

export default {
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

```js title="./src/plugins/my-plugin/server/routes/content-api/index.ts"

export default {
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

</TabItem>
</Tabs>

### Controllers

An object with the [controllers](/cms/backend-customization/controllers) the plugin provides.

**Type**: `Object`

**Example:**

<Tabs groupdId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/index.js"

//…
const controllers = require('./controllers');
//…

module.exports = () => ({
  //…
  controllers,
  //…
});
```

```js title="/src/plugins/my-plugin/server/controllers/index.js"

const controllerA = require('./controller-a');
const controllerB = require('./controller-b');

module.exports = {
  controllerA,
  controllerB,
};
```

```js title="/src/plugins/my-plugin/server/controllers/controller-a.js"

'use strict';

const controllerA = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('my-strapi-plugin')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
});

module.exports = controllerA;

```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/index.ts"

import controllers from './controllers';

module.exports = () => ({
  controllers,
});
```

```js title="/src/plugins/my-plugin/server/controllers/index.ts"

import controllerA from './controller-a';
import controllerB from './controller-b';

export default {
  controllerA,
  controllerB,
};
```

```js title="/src/plugins/my-plugin/server/controllers/controller-a.ts"

import type { Core } from '@strapi/strapi';

const controllerA = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('my-strapi-plugin')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
});

export default controllerA;

```

</TabItem>

</Tabs>

### Services

An object with the [services](/cms/backend-customization/services) the plugin provides.

Services should be functions taking `strapi` as a parameter.

**Type**: `Object`

**Example:**

<Tabs groupdId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/index.js"

// …
const services = require('./services');
// …

module.exports = () => ({
  // …
  services,
  // …
});
```

```js title="/src/plugins/my-plugin/server/services/index.js"

const serviceA = require('./service-a');
const serviceB = require('./service-b');

module.exports = {
  serviceA,
  serviceB,
};
```

```js title="./src/plugins/my-plugin/server/services/service-a.js"

'use strict';

const service = ({ strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
});

module.exports = service;

```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/index.ts"

// …
import services from './services';
// …

export default {
  // …
  services,
  // …
};
```

```js title="/src/plugins/my-plugin/server/services/index.ts"

import serviceA from './service-a';
import serviceB from './service-b';

export default {
  serviceA,
  serviceB,
};
```

```js title="/src/plugins/my-plugin/server/services/service-a.ts"

import type { Core } from '@strapi/strapi';

const serviceA = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
});

export default serviceA;

```

</TabItem>

</Tabs>

### Policies

An object with the [policies](/cms/backend-customization/policies) the plugin provides.

**Type**: `Object`

**Example:**

<Tabs groupdId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/index.js"

"use strict";

//…
const policies = require('./policies');
//…

module.exports = {
  //…
  policies,
  //…
};
```

```js title="/src/plugins/my-plugin/server/policies/index.js"

const policyA = require('./policy-a');
const policyB = require('./policy-b');

module.exports = {
  policyA,
  policyB,
};
```

```js title="/src/plugins/my-plugin/server/policies/policy-a.js"

module.exports = (policyContext, config, { strapi }) => {
  if (ctx.state.user && ctx.state.user.isActive) {
    return true;
  }

  return false;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/index.ts"

//…
import policies from './policies';
//…

module.exports = {
  //…
  policies,
  //…
};
```

```js title="/src/plugins/my-plugin/server/policies/index.ts"

import policyA from './policy-a';
import policyB from './policy-b';

export default {
  policyA,
  policyB,
};
```

```js title="/src/plugins/my-plugin/server/policies/policy-a.ts"

export default (policyContext, config, { strapi }) => {
  if (ctx.state.user && ctx.state.user.isActive) {
    return true;
  }

  return false;
};
```

</TabItem>

</Tabs>

### Middlewares

An object with the [middlewares](/cms/configurations/middlewares) the plugin provides.

**Type**: `Object`

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/middlewares/your-middleware.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/middlewares/your-middleware.ts"

/** 
 * The your-middleware.js file 
 * declares a basic middleware function and exports it.
 */
const middleware = async (ctx, next) => {
  console.log("your custom logic")
  await next();
}

export default middleware;
```

```js title="./src/plugins/my-plugin/server/middlewares/index.ts"

/**
 * The middleware function previously created
 * is imported from its file and
 * exported by the middlewares index.
 */
import yourMiddleware from 'your-middleware';

export default {
  yourMiddleware
};
```

```js title="/src/plugins/my-plugin/server/register.ts"

/**
 * The middleware is called from 
 * the plugin's register lifecycle function.
 */
import type { Core } from '@strapi/strapi';
import middlewares from './middlewares';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.server.use(middlewares.yourMiddleware);
};

```

</TabItem>

</Tabs>

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
To interact with the content-types, use the [Document Service API](/cms/api/document-service).
:::
