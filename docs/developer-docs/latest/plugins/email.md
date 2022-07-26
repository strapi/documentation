---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send emails from a server or an external provider. The Email plugin uses the Strapi global API, meaning it can be called from anywhere inside a Strapi application. Two of the most common use cases are in the Strapi back end and in the admin panel. The following documentation describes how to use the Email plugin in a controller or service for back-end use cases and using a lifecycle hook for admin panel use cases.

::: prerequisites

The Email plugin requires a provider and a provider configuration in the `plugins.js` file. See the [Providers](/developer-docs/latest/development/providers.md) documentation for detailed installation and configuration instructions.

:::

::: note
[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi Email plugin. It provides functionality for the local development environment but is not production-ready in the default configuration. For production stage applications you need to further configure `Sendmail` or change providers. The [Providers](/developer-docs/latest/development/providers.md) documentation has instructions for changing providers, configuring providers, and creating a new email provider.
:::

## Sending emails with a controller or service

The Email plugin has an `email` [service](/developer-docs/latest/development/backend-customization/services.md#services) that contains 2 functions to send emails:

* `send()` directly contains the email contents,
* `sendTemplatedEmail()` consumes data from the Content Manager to populate emails, streamlining programmatic emails.

### Using the `send()` function

To trigger an email in response to a user action add the `send()` function to a [controller](/developer-docs/latest/development/backend-customization/controllers.md) or [service](/developer-docs/latest/development/backend-customization/services.md). The send function has the following properties:

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

```js

// This code example can be used in a controller or a service
// path: ./src/api/{api name}/controllers/{api name}.js or ./src/api/{api name}/services/{api name}.js 

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
| `emailOptions` <br><br> Optional | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | { }      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html` using [Lodash string templates](https://lodash.com/docs/4.17.15#template) | `object` | { }      |
| `data`  <br><br> Optional          | Contains the data used to compile the templates                                                                                            | `object` | { }      |

```js

// This code example can be used in a controller or a service
// path: ./src/api/{api name}/controllers/{api name}.js or ./src/api/{api name}/services/{api name}.js 

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

## Sending emails with a lifecycle hook

To install a new provider run:

<code-group>

<code-block title="NPM">
```sh
npm install @strapi/provider-email-sendgrid --save
```
</code-block>

<code-block title="YARN">
```sh
yarn add @strapi/provider-email-sendgrid --save
```
</code-block>

</code-group>

### Configure your provider

After installing your provider you will need to add some settings in `./config/plugins.js`. If this file doesn't exists, you'll need to create it. Check the README of each provider to know what configuration settings the provider needs.

::: note
When using community providers, pass the full package name to the `provider` key (e.g. `provider: 'strapi-provider-email-mandrill'`). Only Strapi-maintained providers can use the shortcode format (e.g. `provider: 'sendmail'`).
:::

Here is an example of a configuration made for the provider [@strapi/provider-email-sendgrid](https://www.npmjs.com/package/@strapi/provider-email-sendgrid).

**Path —** ``.

<code-group>

<code-block title="JAVASCRIPT">

```js
//path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'juliasedefdjian@strapi.io',
        defaultReplyTo: 'juliasedefdjian@strapi.io',
        testAddress: 'juliasedefdjian@strapi.io',
      },
    },
  },
  // ...
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
//path: ./config/plugins.ts

export default = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'juliasedefdjian@strapi.io',
        defaultReplyTo: 'juliasedefdjian@strapi.io',
        testAddress: 'juliasedefdjian@strapi.io',
      },
    },
  },
  // ...
});
```
</code-block>

</code-group>

::: tip
If you're using a different provider depending on your environment, you can specify the correct configuration in `./config/env/${yourEnvironment}/plugins.js`. More info here: [Environments](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
:::

::: tip
Only one email provider will be active at all time. If the email provider setting isn't picked up by strapi, verify you have put the file `plugins.js` in the correct folder, and with correct filename. The selection of email provider is done via configuration file only.  
:::

::: tip
When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template, with default no-reply@strapi.io need to be updated in according to your email provider, otherwise it will fail the test.
More info here: [Configure templates Locally](/user-docs/latest/settings/configuring-users-permissions-plugin-settings.md#configuring-email-templates)
:::

## Create new provider

Default template

<code-group>

<code-block title="JAVASCRIPT">

```js
//path: ./config/plugins.js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
//path: ./config/plugins.ts
export default {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</code-block>

</code-group>



In the `send` function you will have access to:

- `providerOptions` that contains configurations written in `plugins.js`
- `settings` that contains configurations written in `plugins.js`
- `options` that contains options you send when you call the `send` function from the email plugin service

To use it you will have to publish it on **npm**.

### Create a local provider

If you want to create your own provider without publishing it on **npm** you can follow these steps:

- Create a `providers` folder in your application.
- Create your provider (e.g. `./providers/strapi-provider-email-[...]/...`)
- Then update your `package.json` to link your `strapi-provider-email-[...]` dependency to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your new provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-email-[...]": "file:providers/strapi-provider-email-[...]",
    ...
  }
}
```

- Finally, run `yarn install` or `npm install` to install your new custom provider.

## Troubleshooting

You received an `Auth.form.error.email.invalid` error even though the email is valid and exists in the database.

Here is the error response you get from the API.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "messages": [
        {
          "id": "Auth.form.error.email.invalid"
        }
    }
}
```
