---
title: Email
displayed_sidebar: cmsSidebar
toc_max_heading_level: 5
description: Send email from your server or externals providers.
tags:
- admin panel
- controllers 
- email
- lifecycle hooks
- services
- features
---

# Email

<Tldr>
The Email feature sends transactional messages through local SMTP or external providers like SendGrid. Setup guidance in this documentation covers provider configuration and extending delivery via controllers or hooks.
</Tldr>

The Email feature enables Strapi applications to send emails from a server or an external provider.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Email > "send" permission for the user to send emails via the backend server</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

## Configuration

Most configuration options for the Email feature are handled via your Strapi project's code. The Email feature is not configurable in the admin panel, however users can test email delivery if it has been setup by an administrator.

### Admin panel settings

**Path to configure the feature:** <Icon name="gear-six" /> Settings > Email feature > Configuration

<ThemedImage
  alt="Email configuration"
  sources={{
    light: '/img/assets/settings/settings-email.png',
    dark: '/img/assets/settings/settings-email_DARK.png',
  }}
/>

In the Configuration interface, only the email address field under "Test email delivery" is modifiable by users. A **Send test email** button sends a test email.

This page is only visible if the current role has the "Access the Email Settings page" permission enabled (see [RBAC feature](/cms/features/rbac) documentation for more information):

<ThemedImage
  alt="Email configuration"
  sources={{
    light: '/img/assets/settings/settings-email-config-role.png',
    dark: '/img/assets/settings/settings-email-config-role_DARK.png',
  }}
/>

### Code-based configuration

The Email feature requires a provider and a provider configuration in the `config/plugins.js|ts` file. See [providers](#providers) for detailed installation and configuration instructions.

<ExternalLink to="https://www.npmjs.com/package/sendmail" text="Sendmail"/> is the default email provider in the Strapi Email feature. It provides functionality for the local development environment but is not production-ready in the default configuration. For production stage applications you need to further configure `Sendmail` or change providers.

#### Email configuration options

Plugins configuration are defined in the `config/plugins.js` file or `config/plugins.ts` file. Please refer to [providers](#providers) for detailed provider-specific installation and configuration instructions.

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
| `ratelimit.store`         | `object`        | Rate limiting storage location and for more information please see the <ExternalLink text="koa2-ratelimit documentation" to="https://www.npmjs.com/package/koa2-ratelimit"/>. | `MemoryStore`  | Optional |

#### Providers

The Email feature can be extended via the installation and configuration of additional providers.

Providers add an extension to the core capabilities of the plugin, for example to use Amazon SES for emails instead of Sendmail.

There are both official providers maintained by Strapi — discoverable via the [Marketplace](/cms/plugins/installing-plugins-via-marketplace) — and many community maintained providers available via <ExternalLink to="https://www.npmjs.com/" text="npm"/>.

A provider can be configured to be [private](#private-providers) to ensure asset URLs will be signed for secure access.

##### Installing providers

New providers can be installed using `npm` or `yarn` using the following format `@strapi/provider-<plugin>-<provider> --save`.

For example, to install the Sendgrid provider:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">


```bash
yarn add @strapi/provider-email-sendgrid
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm install @strapi/provider-email-sendgrid --save
```

</TabItem>

</Tabs>

##### Configuring providers

Newly installed providers are enabled and configured in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist you must create it.

Each provider will have different configuration settings available. Review the respective entry for that provider in the [Marketplace](/cms/plugins/installing-plugins-via-marketplace) or <ExternalLink to="https://www.npmjs.com/" text="npm"/> to learn more.

The following is an example configuration for the Sendgrid provider:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"

export default ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
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

</TabItem>

</Tabs>

:::note

* When using a different provider per environment, specify the correct configuration in `/config/env/${yourEnvironment}/plugins.js|ts` (See [Environments](/cms/configurations/environment)).
* Only one email provider will be active at a time. If the email provider setting isn't picked up by Strapi, verify the `plugins.js|ts` file is in the correct folder.
* When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template defaults to `no-reply@strapi.io` and needs to be updated according to your email provider, otherwise it will fail the test (See [Configure templates locally](/cms/features/users-permissions#templating-emails)).

:::

###### Configuration per environment

When configuring your provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `/config/env/{env}/plugins.js|ts` configuration file and it will be used to overwrite the default configuration.

##### Creating providers

To implement your own custom provider you must <ExternalLink to="https://docs.npmjs.com/creating-node-js-modules" text="create a Node.js module"/>.

The interface that must be exported depends on the plugin you are developing the provider for. The following is a template for the Email feature:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

</Tabs>

In the send function you will have access to:

* `providerOptions` that contains configurations written in `plugins.js|ts`
* `settings` that contains configurations written in `plugins.js|ts`
* `options` that contains options you send when you call the send function from the email plugin service

You can review the <ExternalLink to="https://github.com/strapi/strapi/tree/master/packages/providers" text="Strapi-maintained providers"/> for example implementations.

After creating your new provider you can <ExternalLink to="https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages" text="publish it to npm"/> to share with the community or [use it locally](#local-providers) for your project only.

###### Local providers

If you want to create your own provider without publishing it on npm you can follow these steps:

1. Create a `providers` folder in your application.
2. Create your provider (e.g. `/providers/strapi-provider-<plugin>-<provider>`)
3. Then update your `package.json` to link your `strapi-provider-<plugin>-<provider>` dependency to the <ExternalLink to="https://docs.npmjs.com/files/package.json#local-paths" text="local path"/> of your new provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-<plugin>-<provider>": "file:providers/strapi-provider-<plugin>-<provider>",
    ...
  }
}
```

4. Update your `/config/plugins.js|ts` file to [configure the provider](#configuring-providers).
5. Finally, run `yarn` or `npm install` to install your new custom provider.

###### Private providers

You can set up a private provider, meaning that every asset URL displayed in the Content Manager will be signed for secure access.

To enable private providers, you must implement the `isPrivate()` method and return `true`.

In the backend, Strapi generates a signed URL for each asset using the `getSignedUrl(file)` method implemented in the provider. The signed URL includes an encrypted signature that allows the user to access the asset (but normally only for a limited time and with specific restrictions, depending on the provider).

Note that for security reasons, the content API will not provide any signed URLs. Instead, developers using the API should sign the urls themselves.

## Usage

The Email feature uses the Strapi global API, meaning it can be called from anywhere inside a Strapi application, either from the back-end server itself through a [controller or service](#controller-service), or from the admin panel, for example in response to an event (using [lifecycle hooks](#lifecycle-hook)). 

### Sending emails with a controller or service {#controller-service}

The Email feature has an `email` [service](/cms/backend-customization/services) that contains 2 functions to send emails:

* `send()` directly contains the email contents,
* `sendTemplatedEmail()` consumes data from the Content Manager to populate emails, streamlining programmatic emails.

#### Using the `send()` function

To trigger an email in response to a user action add the `send()` function to a [controller](/cms/backend-customization/controllers) or [service](/cms/backend-customization/services). The send function has the following properties:

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

The following code example can be used in a controller or a service:

```js title="/src/api/my-api-name/controllers/my-api-name.ts|js (or /src/api/my-api-name/services/my-api-name.ts|js)"
await strapi.plugins['email'].services.email.send({
  to: 'valid email address',
  from: 'your verified email address', //e.g. single sender verification in SendGrid
  cc: 'valid email address',
  bcc: 'valid email address',
  replyTo: 'valid email address',
  subject: 'The Strapi Email feature worked successfully',
  text: 'Hello world!',
  html: 'Hello world!',
}),
```

#### Using the `sendTemplatedEmail()` function

The `sendTemplatedEmail()` function is used to compose emails from a template. The function compiles the email from the available properties and then sends the email.

To use the `sendTemplatedEmail()` function, define the `emailTemplate` object and add the function to a controller or service. The function calls the `emailTemplate` object, and can optionally call the `emailOptions` and `data` objects:

| Parameter       | Description                                                                                                                                | Type     | Default |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `emailOptions` <br/> Optional | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`                                                             | `object` | { }      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html` using <ExternalLink to="https://lodash.com/docs/4.17.15#template" text="Lodash string templates"/> | `object` | { }      |
| `data`  <br/> Optional          | Contains the data used to compile the templates                                                                                            | `object` | { }      |

The following code example can be used in a controller or a service:

```js title="/src/api/my-api-name/controllers/my-api-name.js (or ./src/api/my-api-name/services/my-api-name.js)"
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

### Sending emails from a lifecycle hook {#lifecycle-hook}

 To trigger an email based on administrator actions in the admin panel use [lifecycle hooks](/cms/backend-customization/models#lifecycle-hooks) and the [`send()` function](#using-the-send-function). 

 The following example illustrates how to send an email each time a new content entry is added in the Content Manager use the `afterCreate` lifecycle hook:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/src/api/my-api-name/content-types/my-content-type-name/lifecycles.js"

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
              subject: 'The Strapi Email feature worked successfully',
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

```ts title="/src/api/my-api-name/content-types/my-content-type-name/lifecycles.ts"

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
        subject: 'The Strapi Email feature worked successfully',
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
