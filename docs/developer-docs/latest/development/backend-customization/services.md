---
title: Services - Strapi Developer Docs
description: Strapi services are a set of reusable functions, useful to simplify controllers logic.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/services.html
---

# Services

Services are a set of reusable functions. They are particularly useful to respect the DRY (don’t repeat yourself) programming concept and to simplify [controllers](/developer-docs/latest/development/backend-customization/controllers.md) logic.

## Implementation

A new service can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate)
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):
  - `./src/api/[api-name]/services/` for API services
  - or `./src/plugins/[plugin-name]/services/` for [plugin services](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#services).

To manually create a service, export a factory function that returns the service implementation (i.e. an object with methods). This factory function receives the `strapi` instance:

```js
/**
 * @param {{ strapi: import('@strapi/strapi').Strapi }} opts
 */
module.exports = ({ strapi }) => {
  return {
    archiveArticles(ids) {
      // do some logic here
    },
  };
};
```

::: strapi Entity Service API
To get started creating your own services, see Strapi's built-in functions in the [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) documentation.
:::

:::: details Example of an email service

The goal of a service is to store reusable functions. An `email` service could be useful to send emails from different functions in our codebase:

```js
// path: ./src/api/email/services/email.js

const nodemailer = require('nodemailer'); // Requires nodemailer to be installed (npm install nodemailer)

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

The service is now available through the `strapi.services` global variable. It can be used in another part of the codebase, like in the following controller:

```js
// path: ./src/api/user/controllers/user.js

module.exports = {
  // GET /hello
  signup: async ctx => {
    // Store the new user in database.
    const user = await User.create(ctx.query);

    // Send an email to validate his subscriptions.
    strapi.service('api::email.send')('welcome@mysite.com', user.email, 'Welcome', '...');


    // Send response to the server.
    ctx.send({
      ok: true,
    });
  },
};
```

::::

::: note
When a new [content-type](/developer-docs/latest/development/backend-customization/models.md#content-types) is created, Strapi builds a generic service with placeholder code, ready to be customized.
:::

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
