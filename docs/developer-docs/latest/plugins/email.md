---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send emails from a server or [external providers](/developer-docs/latest/development/using-providers.md). Successful use of the plugin requires a provider configuration in a `plugins.js` file and an event that triggers an email, such as a custom controller for external requests or a lifecycle hook for requests inside the admin panel. Data from the Content Manager can also be populated into email templates using the function `sendTemplatedEmail` to streamline programmatic emails. This documentation provides examples of how to use the email plugin to send emails using controllers and lifecycle hooks.

[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi email plugin. It provides functionality for the local development environment but is not production-ready in the provided configuration. Another provider is likely preferable. The [provider documentation](/developer-docs/latest/development/using-providers.md) has instructions for changing providers, creating a new email provider, and configuring the `plugins.js` file.

## Send an email using custom a controller or service

To trigger an email in response to a user action add the following function to a [controller](/developer-docs/latest/development/backend-customization/controllers.md) or [service](/developer-docs/latest/development/backend-customization/services.md). The function utilizes the email provider enabled in the `plugins.js` configuration file. The function can be used by extending a core controller/service or developing a custom controller/service.

```js

//path: ./src/api/{api name}/controllers/{api name}.js

  await strapi.plugins['email'].services.email.send({
    to: 'valid email address',
    from: 'your verified email address', //e.g. single sender verification in SendGrid
    cc: 'valid email address',
    bcc: 'valid email address',
    replyTo: 'valid email address',
    subject: 'The Strapi email plugin worked successfully',
    text: 'Hello world!',
    html: 'Hello world!',
  }),
```

## Send an email using a template

The email plugin provides the function `sendTemplatedEmail` to compose emails from a template. The function compiles the email from the available properties and then sends the email. The function has the following parameters:

| Parameter       | Description                                                                                                                                | Type     | Default |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `emailOptions`  | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | {}      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html` using [Lodash string templates](https://lodash.com/docs/4.17.15#template) | `object` | {}      |
| `data`          | Contains the data used to compile the templates                                                                                            | `object` | {}      |

To use the `sendTemplatedEmail` function define the `emailTemplate` object and add the function to a controller or service. The function calls the `emailTemplate` object, and can optionally call the `emailOptions` and `data` objects.

```js

//path: ./src/api/{api name}/controllers/{api name}.js

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
    // from: is not specified, the defaultFrom is used.
  },
    emailTemplate,
  {
    user: _.pick(user, ['username', 'email', 'firstname', 'lastname']),
  }
);
```

## Send an email using a lifecycle hook

[Lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks) can be used to trigger an email based on administrator actions in the admin panel. For example, an editor can receive an email each time an author creates a new content entry in the Content Manager. The following code example illustrates a lifecycle hook on the **Save** event when adding a new entry to the specified collection type.

```js

//path: ./src/api/[api-name]]/content-types/[content-type-name]/lifecycles.js

module.exports = {
    async afterCreate(event) {
        const { result } = event;

        try{
            await strapi.plugins['email'].services.email.send({
                to: 'kai@strapi.io',
                from: 'kai@strapi.io',
                subject: 'New content posted',
                text: '${alertMessage}'
            })
        } 
    }
}
```
