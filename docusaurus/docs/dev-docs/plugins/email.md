---
title: Email plugin
displayed_sidebar: devDocsSidebar
description: Send email from your server or externals providers.
tags:
- admin panel
- controllers 
- email plugin
- lifecycle hooks
- plugins 
- services
- send() function
- sendTemplatedEmail() function
---

# Email plugin

The Email plugin enables applications to send emails from a server or an external provider. The Email plugin uses the Strapi global API, meaning it can be called from anywhere inside a Strapi application. Two of the most common use cases are in the Strapi back end and in the admin panel. The following documentation describes how to use the Email plugin in a controller or service for back-end use cases and using a lifecycle hook for admin panel use cases.

:::prerequisites

The Email plugin requires a provider and a provider configuration in the `config/plugins.js` file or `config/plugins.ts` file. See the [Providers](/dev-docs/providers) documentation for detailed installation and configuration instructions.

:::

:::note
[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi Email plugin. It provides functionality for the local development environment but is not production-ready in the default configuration. For production stage applications you need to further configure `Sendmail` or change providers. The [Providers](/dev-docs/providers) documentation has instructions for changing providers, configuring providers, and creating a new email provider.
:::

## Sending emails with a controller or service

The Email plugin has an `email` [service](/dev-docs/backend-customization/services) that contains 2 functions to send emails:

* `send()` directly contains the email contents,
* `sendTemplatedEmail()` consumes data from the Content Manager to populate emails, streamlining programmatic emails.

### Using the `send()` function

To trigger an email in response to a user action add the `send()` function to a [controller](/dev-docs/backend-customization/controllers) or [service](/dev-docs/backend-customization/services). The send function has the following properties:

| Property  | Type     | Format        | Description                                           |
|-----------|----------|---------------|-------------------------------------------------------|
| `from`    | `string` | email address | If not specified, uses `defaultFrom` in `plugins.js`. |
| `to`      | `string` | email address | Required                                              |
| `cc`      | `string` | email address | Optional                                              |
| `bcc`     | `string` | email address | Optional                                              |
| `replyTo` | `string` | email address | Optional                                              |
| `subject` | `string` | -             | Required                                              |
| `text`    | `string` | -             | Either `text` or `html` is required.                  |
| `html`    | `string` | HTML          | Either `text` or `html` is required.                  |

```js title="This code example can be used in a controller or a service path: ./src/api/{api name}/controllers/{api name}.js or ./src/api/{api name}/services/{api name}.js"

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

### Using the `sendTemplatedEmail()` function

The `sendTemplatedEmail()` function is used to compose emails from a template. The function compiles the email from the available properties and then sends the email. To use the `sendTemplatedEmail()` function, define the `emailTemplate` object and add the function to a controller or service. The function calls the `emailTemplate` object, and can optionally call the `emailOptions` and `data` objects:

| Parameter       | Description                                                                                                                                | Type     | Default |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `emailOptions` <br/> Optional | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | { }      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html` using [Lodash string templates](https://lodash.com/docs/4.17.15#template) | `object` | { }      |
| `data`  <br/> Optional          | Contains the data used to compile the templates                                                                                            | `object` | { }      |

```js title="This code example can be used in a controller or a service path: ./src/api/{api name}/controllers/{api name}.js or ./src/api/{api name}/services/{api name}.js"


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

## Sending emails from a lifecycle hook

 To trigger an email based on administrator actions in the admin panel use [lifecycle hooks](/dev-docs/backend-customization/models#lifecycle-hooks) and the [`send()` function](#using-the-send-function). For example, to send an email each time a new content entry is added in the Content Manager use the `afterCreate` lifecycle hook:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./src/api/{api-name}/content-types/{content-type-name}/lifecycles.js"

module.exports = {
    async afterCreate(event) {    // Connected to "Save" button in admin panel
        const { result } = event;

        try{
            await strapi.plugin('email').service('email').send({ // you could also do: await strapi.service('plugin:email.email').send({
              to: 'valid email address',
              from: 'your verified email address', // e.g. single sender verification in SendGrid
              cc: 'valid email address',
              bcc: 'valid email address',
              replyTo: 'valid email address',
              subject: 'The Strapi Email plugin worked successfully',
              text: '${fieldName}', // Replace with a valid field ID
              html: 'Hello world!', 
                
            })
        } catch(err) {
            console.log(err);
        }
    }
}
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./src/api/{api-name}/content-types/{content-type-name}/lifecycles.js"

export default {
    async afterCreate(event) {    // Connected to "Save" button in admin panel
        const { result } = event;

        try{
            await strapi.plugins['email'].services.email.send({
              to: 'valid email address',
              from: 'your verified email address', // e.g. single sender verification in SendGrid
              cc: 'valid email address',
              bcc: 'valid email address',
              replyTo: 'valid email address',
              subject: 'The Strapi Email plugin worked successfully',
              text: '${fieldName}', // Replace with a valid field ID
              html: 'Hello world!', 
                
            })
        } catch(err) {
            console.log(err);
        }
    }
}

```

</TabItem>

</Tabs>
