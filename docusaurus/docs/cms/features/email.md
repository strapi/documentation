---
title: Email
displayed_sidebar: cmsSidebar
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

The Email feature requires a provider and a provider configuration in the `config/plugins.js` file or `config/plugins.ts` file. See the [Providers](/cms/providers) documentation for detailed installation and configuration instructions.

<CustomDocCardsWrapper>
<CustomDocCard icon="plugs" title="Providers" description="Learn more about configuring and creating providers for the Email and Media Library features." link="/cms/providers"/>
</CustomDocCardsWrapper>

<ExternalLink to="https://www.npmjs.com/package/sendmail" text="Sendmail"/> is the default email provider in the Strapi Email feature. It provides functionality for the local development environment but is not production-ready in the default configuration. For production stage applications you need to further configure `Sendmail` or change providers.

#### Email Configuration Options

Plugins configuration are defined in the `config/plugins.js` file or `config/plugins.ts` file. For provider specific configuration please see the [Providers](/cms/providers) documentation for detailed installation and configuration instructions.

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
