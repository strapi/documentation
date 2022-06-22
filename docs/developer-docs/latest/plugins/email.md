---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send email from a server or [external providers](/developer-docs/latest/development/using-providers.md). Successful use of the plugin requires the plugin configuration in a `plugins.js` file and an event that triggers an email, such as a custom controller for external requests or a lifecycle hook for requests inside the admin panel. Data from the Content Manager can also be populated into email templates using `sendTemplatedEmail` to streamline programatic emails. The documentation provides examples for how to configure the email plugin and examples of controllers and lifecycle hooks to implement programmatic email.

[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi email plugin. It provides functionality for the local development environment but is not production-ready in the provided configuration. Another provider is likely preferable. The [provider documentation](/developer-docs/latest/development/using-providers.md) has instructions for changing providers or creating a new email provider.

## Send an email using custom a controller or service

To trigger an email in response to a user input add the following function to a custom controller or service. The function will utilize the email provider enabled in the `plugins.js` configuration file.

<!--TO DO: test the code here -->

```js
//path: ./src/api/{api name}/controllers/{api name}.js

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::restaurant.restaurant', ({ strapi }) =>  ({
  await strapi.plugins['email'].services.email.send({
    to: 'paulbocuse@strapi.io',
    from: 'joelrobuchon@strapi.io',
    cc: 'helenedarroze@strapi.io',
    bcc: 'ghislainearabian@strapi.io',
    replyTo: 'annesophiepic@strapi.io',
    subject: 'The Strapi email provider worked successfully',
    text: 'Hello world!',
    html: 'Hello world!',
  }),
});
```

## Send an email using a template

The email plugin provides the function `sendTemplatedEmail` to compose email from a template. The function compiles the email from the available properties and then sends the email. The function has the following parameters:

| Parameter       | Description                                                                     | Type     | Default |
|-----------------|---------------------------------------------------------------------------------|----------|---------|
| `emailOptions`  | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`.  | `object` | {}      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html`.                | `object` | {}      |
| `data`          | Contains the data used to compile the templates.                                 | `object` | {}      |

To use the `sendTemplatedEmail` function add a constant `emailTemplate` above the function.
 <!--TO DO: this would be better with the options and data objects incorporated-->

```js
const emailTemplate = {
  subject: 'Welcome <%= user.firstname %>',
  text: `Welcome to mywebsite.fr!
    Your account is now linked with: <%= user.email %>.`,
  html: `<h1>Welcome to mywebsite.fr!</h1>
    <p>Your account is now linked with: <%= user.email %>.<p>`,
};

await strapi.plugins['email'].services.email.sendTemplatedEmail(
  {
    to: user.email,
    // from: is not specified, so it's the defaultFrom that will be used instead
  },
  emailTemplate,
  {
    user: _.pick(user, ['username', 'email', 'firstname', 'lastname']),
  }
);
```

## Send email using lifecycle hooks

[Lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks) can be used to trigger an email based on administrator actions in the admin panel. For example, an editor can receive an email each time an author submits new content.

```jsx

//path: ./src/api/[api-name]]/content-types/[content-type-name]/lifecycles.js

module.exports = {
    async afterCreate(event) {
        const { result } = event;

        try{
            await strapi.plugins['email'].services.email.send({
                to: 'kai@strapi.io',
                from: 'kai@strapi.io',
                subject: 'test',
                text: '${alertMessage}'
            })
        } 
    }
}
```

## Find other email documentation
