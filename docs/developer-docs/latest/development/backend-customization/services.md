---
title: Backend customization - Services - Strapi Developer Docs
description: Strapi services are a set of reusable functions, useful to simplify controllers logic.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/services.html
---

# Services

Services are a set of reusable functions. They are particularly useful to respect the "don’t repeat yourself" (DRY) programming concept and to simplify [controllers](/developer-docs/latest/development/backend-customization/controllers.md) logic.

## Implementation

Services can be [generated or added manually](#adding-a-new-service). Strapi provides a `createCoreService` factory function that automatically generates core services and allows building custom ones or [extend or replace the generated services](#extending-core-services).

### Adding a new service

A new service can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate)
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):
  - `./src/api/[api-name]/services/` for API services
  - or `./src/plugins/[plugin-name]/services/` for [plugin services](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#services).

To manually create a service, export a factory function that returns the service implementation (i.e. an object with methods). This factory function receives the `strapi` instance:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/restaurant/services/restaurant.js

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely new custom service
  async exampleService(...args) {
    let response = { okay: true }

    if (response.okay === false) {
      return { response, error: true }
    }

    return response
  },

  // Method 2: Wrapping a core service (leaves core logic in place)
  async find(...args) {  
    // Calling the default core controller
    const { results, pagination } = await super.find(...args);

    // some custom logic
    results.forEach(result => {
      result.counter = 1;
    });

    return { results, pagination };
  },

  // Method 3: Replacing a core service
  async findOne(entityId, params = {}) {
    return strapi.entityService.findOne('api::restaurant.restaurant', entityId, this.getFetchParams(params));
  }
}));
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./src/api/restaurant/services/restaurant.ts

import { factories } from '@strapi/strapi'; 

export default factories.createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  // Method 1: Creating an entirely custom service
  async exampleService(...args) {
    let response = { okay: true }

    if (response.okay === false) {
      return { response, error: true }
    }

    return response
  },

  // Method 2: Wrapping a core service (leaves core logic in place)
  async find(...args) {  
    // Calling the default core controller
    const { results, pagination } = await super.find(...args);

    // some custom logic
    results.forEach(result => {
      result.counter = 1;
    });

    return { results, pagination };
  },

  // Method 3: Replacing a core service
  async findOne(entityId, params = {}) {
    return strapi.entityService.findOne('api::restaurant.restaurant', entityId, this.getFetchParams(params));
  }
}));
```

</code-block>
</code-group>

::: strapi Entity Service API
To get started creating your own services, see Strapi's built-in functions in the [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) documentation.
:::

:::: details Example of an email service

The goal of a service is to store reusable functions. An `email` service could be useful to send emails from different functions in our codebase:

<code-group>
<code-block title=JAVASCRIPT>

```js
// path: ./src/api/email/services/email.js


const { createCoreService } = require('@strapi/strapi').factories;
const nodemailer = require('nodemailer'); // Requires nodemailer to be installed (npm install nodemailer)

// Create reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'user@gmail.com',
    pass: 'password',
  },
});

module.exports = createCoreService('api::email.email', ({ strapi }) => ({
  send(from, to, subject, text) {
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
}));
```

</code-block>
<code-block title=TYPESCRIPT>

```js
// path: ./src/api/email/services/email.ts


import { factories } from '@strapi/strapi'; 
const nodemailer = require('nodemailer'); // Requires nodemailer to be installed (npm install nodemailer)

// Create reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'user@gmail.com',
    pass: 'password',
  },
});

export default factories.createCoreService('api::restaurant.restaurant', ({ strapi }) => ({
  send(from, to, subject, text) {
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
}));
```

</code-block>
</code-group>

The service is now available through the `strapi.service('api::email.email').send(...args)` global variable. It can be used in another part of the codebase, like in the following controller:

<code-group>
<code-block title=JAVASCRIPT>

```js
// path: ./src/api/user/controllers/user.js

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // GET /hello
  async signup(ctx) {
    const { userData } = ctx.body;

    // Store the new user in database.
    const user = await strapi.service('plugin::users-permissions.user').add(userData);

    // Send an email to validate his subscriptions.
    strapi.service('api::email.email').send('welcome@mysite.com', user.email, 'Welcome', '...');

    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
}));
```

</code-block>

<code-block title=TYPESCRIPT>

```js
// path: ./src/api/user/controllers/user.ts

export default factories.createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // GET /hello
  async signup(ctx) {
    const { userData } = ctx.body;

    // Store the new user in database.
    const user = await strapi.service('plugin::users-permissions.user').add(userData);

    // Send an email to validate his subscriptions.
    strapi.service('api::email.email').send('welcome@mysite.com', user.email, 'Welcome', '...');

    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
}));
```

</code-block>
</code-group>

::::

::: note
When a new [content-type](/developer-docs/latest/development/backend-customization/models.md#content-types) is created, Strapi builds a generic service with placeholder code, ready to be customized.
:::

### Extending core services

Core services are created for each content-type and could be used by [controllers](/developer-docs/latest/development/backend-customization/controllers.md) to execute reusable logic through a Strapi project. Core services can be customized to implement your own logic. The following code examples should help you get started.

:::tip
A core service can be replaced entirely by [creating a custom service](#adding-a-new-service) and naming it the same as the core service (e.g. `find`, `findOne`, `create`, `update`, or `delete`).
:::

::::: details Collection type examples

:::: tabs card

::: tab find()

```js
async find(params) {
  // some logic here
  const { results, pagination } = await super.find(params);
  // some more logic

  return { results, pagination };
}
```

:::

::: tab findOne()

```js
async findOne(entityId, params) {
  // some logic here
  const result = await super.findOne(entityId, params);
  // some more logic

  return result;
}
```

:::

::: tab create()

```js
async create(params) {
  // some logic here
  const result = await super.create(params);
  // some more logic

  return result;
}
```

:::

::: tab update()

```js
async update(entityId, params) {
  // some logic here
  const result = await super.update(entityId, params);
  // some more logic

  return result;
}
```

:::

::: tab delete()

```js
async delete(entityId, params) {
  // some logic here
  const result = await super.delete(entityId, params);
  // some more logic

  return result;
}
```

:::
::::
:::::

::::: details Single type examples
:::: tabs card

::: tab find()

```js
async find(params) {
  // some logic here
  const entity = await super.find(params);
  // some more logic

  return entity;
}
```

:::

::: tab update()

```js
async createOrUpdate({ data, ...params }) {
  // some logic here
  const entity = await super.createOrUpdate({ data, ...params });
  // some more logic

  return entity;
}
```

:::

::: tab delete()

```js
async delete(params) {
  // some logic here
  const entity = await super.delete(params);
  // some more logic

  return entity;
}
```

:::
::::
:::::

## Usage

Once a service is created, it's accessible from [controllers](/developer-docs/latest/development/backend-customization/controllers.md) or from other services:

```js
// access an API service
strapi.service('api::apiName.serviceName');
// access a plugin service
strapi.service('plugin::pluginName.serviceName');
```

::: tip
To list all the available services, run `yarn strapi services:list`.
:::

:::
