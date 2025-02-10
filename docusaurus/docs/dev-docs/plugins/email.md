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

## Email Configuration Options

Plugins configuration are defined in the `config/plugins.js` file or `config/plugins.ts` file. For provider specific configuration please see the [Providers](/dev-docs/providers) documentation for detailed installation and configuration instructions.

| Option                    | Type            | Description                                                                                                                                            | Default Value  | Notes    |
|---------------------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|----------|
| `provider`                | `string`        | The email provider to use.                                                                                                                             | `sendmail`     | Required |
| `providerOptions`         | `object`        | The email provider options.                                                                                                                            | `{}`           | Optional |
| `providerOptions.apiKey`  | `string`        | The API key for the email provider.                                                                                                                    | `''`           | Optional |
| `settings`                | `object`        | The email settings.                                                                                                                                    | `{}`           | Optional |
| `settings.defaultFrom`    | `string`        | The default email address to use as the sender.                                                                                                        | `''`           | Optional |
| `settings.defaultReplyTo` | `string`        | The default email address to use as the reply-to address.                                                                                              | `''`           | Optional |
| `ratelimit`               | `object`        | The email rate limit settings.                                                                                                                         | `{}`           | Optional |
| `ratelimit.enabled`       | `boolean`       | Whether to enable rate limiting.                                                                                                                       | `true`         | Optional |
| `ratelimit.interval`      | `string`        | The interval for rate limiting in minutes.                                                                                                             | `5`            | Optional |
| `ratelimit.max`           | `number`        | The maximum number of requests allowed during the interval.                                                                                            | `5`            | Optional |
| `ratelimit.delayAfter`    | `number`        | The number of requests allowed before rate limiting is applied.                                                                                        | `1`            | Optional |
| `ratelimit.timeWait`      | `number`        | Time to wait before responding to a request (in milliseconds).                                                                                         | `1`            | Optional |
| `ratelimit.prefixKey`     | `string`        | The prefix for the rate limit key.                                                                                                                     | `${userEmail}` | Optional |
| `ratelimit.whitelist`     | `array(string)` | Array of IP addresses to whitelist from rate limiting.                                                                                                 | `[]`           | Optional |
| `ratelimit.store`         | `object`        | Rate limiting storage location and for more information please see the [`koa2-ratelimit documentation`](https://www.npmjs.com/package/koa2-ratelimit). | `MemoryStore`  | Optional |

### Using the `sendTemplatedEmail()` function

The `sendTemplatedEmail()` function is used to compose emails from a template. The function compiles the email from the available properties and then sends the email. To use the `sendTemplatedEmail()` function, define the `emailTemplate` object and add the function to a controller or service. The function calls the `emailTemplate` object, and can optionally call the `emailOptions` and `data` objects:

| Parameter                     | Description                                                                                                                                | Type     | Default |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `emailOptions` <br/> Optional | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | { }     |
| `emailTemplate`               | Contains email content properties: `subject`, `text`, and `html` using [Lodash string templates](https://lodash.com/docs/4.17.15#template) | `object` | { }     |
| `data`  <br/> Optional        | Contains the data used to compile the templates                                                                                            | `object` | { }     |

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
