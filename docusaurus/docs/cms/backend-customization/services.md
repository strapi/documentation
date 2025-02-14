---
title: Services
description: Strapi services are a set of reusable functions, useful to simplify controllers logic.
displayed_sidebar: cmsSidebar
tags:
- backend customization
- backend server
- controllers
- createCoreService 
- services
- REST API 
---

# Services

Services are a set of reusable functions. They are particularly useful to respect the "don’t repeat yourself" (DRY) programming concept and to simplify [controllers](/cms/backend-customization/controllers.md) logic.

<figure style={{width: '100%', margin: '0'}}>
  <img src="/img/assets/backend-customization/diagram-controllers-services.png" alt="Simplified Strapi backend diagram with services highlighted" />
  <em><figcaption style={{fontSize: '12px'}}>The diagram represents a simplified version of how a request travels through the Strapi back end, with services highlighted. The backend customization introduction page includes a complete, <a href="/cms/backend-customization#interactive-diagram">interactive diagram</a>.</figcaption></em>
</figure>

## Implementation

Services can be [generated or added manually](#adding-a-new-service). Strapi provides a `createCoreService` factory function that automatically generates core services and allows building custom ones or [extend or replace the generated services](#extending-core-services).

### Adding a new service

A new service can be implemented:

- with the [interactive CLI command `strapi generate`](/cms/cli#strapi-generate)
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/cms/project-structure.md)):
  - `./src/api/[api-name]/services/` for API services
  - or `./src/plugins/[plugin-name]/services/` for [plugin services](/cms/plugins-development/server-api#services).

To manually create a service, export a factory function that returns the service implementation (i.e. an object with methods). This factory function receives the `strapi` instance:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/services/restaurant.js"

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
  async findOne(documentId, params = {}) {
    return strapi.documents('api::restaurant.restaurant').findOne(documentId, this.getFetchParams(params));
  }
}));
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/services/restaurant.ts"

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
  async findOne(documentId, params = {}) {
     return strapi.documents('api::restaurant.restaurant').findOne(documentId, this.getFetchParams(params));
  }
}));
```

</TabItem>
</Tabs>

:::strapi Document Service API
To get started creating your own services, see Strapi's built-in functions in the [Document Service API](/cms/api/document-service) documentation.
:::

<details>

<summary>Example of a custom email service (using Nodemailer)</summary>

The goal of a service is to store reusable functions. A `sendNewsletter` service could be useful to send emails from different functions in our codebase that have a specific purpose:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/services/restaurant.js"


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

module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) => ({
  sendNewsletter(from, to, subject, text) {
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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/services/restaurant.ts"


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
  sendNewsletter(from, to, subject, text) {
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

</TabItem>

</Tabs>

The service is now available through the `strapi.service('api::restaurant.restaurant').sendNewsletter(...args)` global variable. It can be used in another part of the codebase, like in the following controller:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // GET /hello
  async signup(ctx) {
    const { userData } = ctx.body;

    // Store the new user in database.
    const user = await strapi.service('plugin::users-permissions.user').add(userData);

    // Send an email to validate his subscriptions.
    strapi.service('api::restaurant.restaurant').sendNewsletter('welcome@mysite.com', user.email, 'Welcome', '...');

    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
}));
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"

export default factories.createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  // GET /hello
  async signup(ctx) {
    const { userData } = ctx.body;

    // Store the new user in database.
    const user = await strapi.service('plugin::users-permissions.user').add(userData);

    // Send an email to validate his subscriptions.
    strapi.service('api::restaurant.restaurant').sendNewsletter('welcome@mysite.com', user.email, 'Welcome', '...');

    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
}));
```

</TabItem>

</Tabs>

</details>

:::note
When a new [content-type](/cms/backend-customization/models.md#content-types) is created, Strapi builds a generic service with placeholder code, ready to be customized.
:::

### Extending core services

Core services are created for each content-type and could be used by [controllers](/cms/backend-customization/controllers.md) to execute reusable logic through a Strapi project. Core services can be customized to implement your own logic. The following code examples should help you get started.

:::tip
A core service can be replaced entirely by [creating a custom service](#adding-a-new-service) and naming it the same as the core service (e.g. `find`, `findOne`, `create`, `update`, or `delete`).
:::

<details>
<summary>Collection type examples</summary>

<Tabs groupdId="crud-methods">

<TabItem value="find" label="find()">

```js
async find(params) {
  // some logic here
  const { results, pagination } = await super.find(params);
  // some more logic

  return { results, pagination };
}
```

</TabItem>

<TabItem value="find-one" label="findOne()">

```js
async findOne(documentId, params) {
  // some logic here
  const result = await super.findOne(documentId, params);
  // some more logic

  return result;
}
```

</TabItem>

<TabItem value="create" label="create()">

```js
async create(params) {
  // some logic here
  const result = await super.create(params);
  // some more logic

  return result;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async update(documentId, params) {
  // some logic here
  const result = await super.update(documentId, params);
  // some more logic

  return result;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(documentId, params) {
  // some logic here
  const result = await super.delete(documentId, params);
  // some more logic

  return result;
}
```

</TabItem>
</Tabs>

</details>

<details>

<summary>Single type examples</summary>

<Tabs groupdId="crud-methods">

<TabItem value="find" label="find()">

```js
async find(params) {
  // some logic here
  const document = await super.find(params);
  // some more logic

  return document;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async createOrUpdate({ data, ...params }) {
  // some logic here
  const document = await super.createOrUpdate({ data, ...params });
  // some more logic

  return document;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(params) {
  // some logic here
  const document = await super.delete(params);
  // some more logic

  return document;
}
```

</TabItem>
</Tabs>

</details>

## Usage

Once a service is created, it's accessible from [controllers](/cms/backend-customization/controllers.md) or from other services:

```js
// access an API service
strapi.service('api::apiName.serviceName').FunctionName();
// access a plugin service
strapi.service('plugin::pluginName.serviceName').FunctionName();
```

In the syntax examples above, `serviceName` is the name of the service file for API services or the name used to export the service file to `services/index.js` for plugin services.

:::tip
To list all the available services, run `yarn strapi services:list`.
:::
