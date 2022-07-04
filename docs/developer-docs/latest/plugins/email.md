---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send emails from a server or external providers. The Email plugin uses the Strapi global API, meaning it can be called from anywhere inside a Strapi application. Two of the most common use cases are in the Strapi back end and in the admin panel. The following documentation describes how to use the Email plugin in a controller or service for back-end use cases or using a lifecycle hook for admin panel use cases.

::: prerequisite

The Email plugin requires a provider and a provider configuration in the `plugins.js` file. See the[ Using providers](/developer-docs/latest/development/using-providers.md) documentation for detailed installation and configuration instructions.

:::

<!--note to self: discuss moving this to providers with Gabriel-->
[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi Email plugin. It provides functionality for the local development environment but is not production-ready in the provided configuration. Another provider is likely preferable for production stage applications. The [provider documentation](/developer-docs/latest/development/using-providers.md) has instructions for changing providers, creating a new email provider, and configuring the `plugins.js` file.

## Sending emails

The functions `send` and `sendTemplatedEmail` are available to send emails. The `send` function directly contains the email contents, while the `sendTemplatedEmail` function consumes data from the Content Manager to populate emails, streamlining programmatic emails.

### Using the `send` function in the back end

To trigger an email in response to a user action add the following function to a [controller](/developer-docs/latest/development/backend-customization/controllers.md) or [service](/developer-docs/latest/development/backend-customization/services.md). The function utilizes the email provider enabled in the `plugins.js` configuration file. The function can be used by extending a core controller/service or developing a custom controller/service.

```js

// e.g. path: ./src/api/{api name}/controllers/{api name}.js

  await strapi.plugins['email'].services.email.send({
    to: 'valid email address',
    from: 'your verified email address', //e.g. single sender verification in SendGrid
    cc: 'valid email address',
    bcc: 'valid email address',
    replyTo: 'valid email address',
    subject: 'The Strapi Email plugin worked successfully',
    text: 'Hello world!',
    html: 'Hello world!',
  }),
```

### Using the Send templated email function in the back end

The Email plugin provides the function `sendTemplatedEmail` to compose emails from a template. The function compiles the email from the available properties and then sends the email. To use the `sendTemplatedEmail` function define the `emailTemplate` object and add the function to a controller or service. The function calls the `emailTemplate` object, and can optionally call the `emailOptions` and `data` objects.

| Parameter       | Description                                                                                                                                | Type     | Default |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `emailOptions`  | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | {}      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html` using [Lodash string templates](https://lodash.com/docs/4.17.15#template) | `object` | {}      |
| `data`          | Contains the data used to compile the templates                                                                                            | `object` | {}      |

```js

// e.g. path: ./src/api/{api name}/controllers/{api name}.js

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

## Using a lifecycle hook to send email from the admin panel

 Another use case for the Email plugin is to trigger an email based on administrator actions in the admin panel using [Lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks). For example, an editor can receive an email each time an author creates a new content entry in the Content Manager.

 The following code example illustrates a lifecycle hook that runs when a new entry is created in the specified collection type.

 - The `afterCreate` lifecycle event is initiated when an administrator clicks the **Save** button in the Content Manager. 
 - The `send` function is identical to the [back end example](#using-the-send-function-in-the-back-end), with the same available properties.
 - Fields from the new content entry can be included in the email using the `text` property and the value `${fieldName}` to indicate which field should be included.

```js

// e.g. path: ./src/api/{api-name}/content-types/{content-type-name}/lifecycles.js

module.exports = {
    async afterCreate(event) {
        const { result } = event;

        try{
            await strapi.plugins['email'].services.email.send({
                to: 'a valid email address',
                from: 'a valid email address',
                subject: 'A new content entry',
                text: '${welcomeMessage}'
            })
        } catch(err) {
            console.log(err);
        }
    }
}
```
