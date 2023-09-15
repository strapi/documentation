---
title: Email Provider
displayed_sidebar: cloudSidebar
description: Configure Strapi Cloud to use a third-party email provider.
canonicalUrl: https://docs.strapi.io/cloud/advanced/email.html
---

# Email Provider

Strapi Cloud comes with a basic email provider out of the box. However, you can also configure it to utilize a third-party email provider, if needed.

:::caution
Please be advised that Strapi are unable to provide support for third-party email providers.

:::

:::prerequisites

- A local Strapi project running on `v4.8.2+`.
- Credentials for a third-party email provider (see [Strapi Market](https://market.strapi.io/providers)).

:::

## Configuration
To configure a third-party email provider, in your Strapi project, create a `./config/env/production/plugins.js` or `./config/env/production/plugins.ts` file with the following content:


<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=./config/env/production/plugins.js

module.exports = ({ env }) => ({
  // ...
  Required Email Provider Plugin Configuration
  // ...
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title=./config/env/production/plugins.ts

export default ({ env }) => ({
  // ...
  Required Email Provider Plugin Configuration
  // ...
});
```
</TabItem>

</Tabs>

Each provider will have different configuration settings available. Review the respective entry for that provider in the [Marketplace](https://market.strapi.io/providers).

Below are example configurations for the Email plugins.
<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">
<Tabs groupId="email-examples" >
<TabItem value="sendgrid" label="Sendgrid">

```js title=./config/env/production/plugins.js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem >
<TabItem value="amazon-ses" label="Amazon SES">

```js title=./config/env/production/plugins.js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'amazon-ses',
      providerOptions: {
        key: env('AWS_SES_KEY'),
        secret: env('AWS_SES_SECRET'),
        amazon: 'https://email.us-east-1.amazonaws.com',
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem>
<TabItem value="mailgun" label="Mailgun">

```js title=./config/env/production/plugins.js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'), // Required
        domain: env('MAILGUN_DOMAIN'), // Required
        url: env('MAILGUN_URL', 'https://api.mailgun.net'), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="ts" label="TypeScript">
<Tabs groupId="email-examples" >
<TabItem value="sendgrid" label="Sendgrid">

```ts title=./config/env/production/plugins.ts
export default ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem >
<TabItem value="amazon-ses" label="Amazon SES">

```ts title=./config/env/production/plugins.ts
export default ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'amazon-ses',
      providerOptions: {
        key: env('AWS_SES_KEY'),
        secret: env('AWS_SES_SECRET'),
        amazon: 'https://email.us-east-1.amazonaws.com',
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem>
<TabItem value="mailgun" label="Mailgun">

```ts title=./config/env/production/plugins.ts
export default ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'), // Required
        domain: env('MAILGUN_DOMAIN'), // Required
        url: env('MAILGUN_URL', 'https://api.mailgun.net'), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>


:::caution
The email provider must be installed as a package dependency in your Strapi project. For example, to use the Sendgrid email provider, install the `@strapi/provider-email-sendgrid` package.
:::

## Strapi Cloud Configuration
Before pushing changes to GitHub, add environment variables to the Strapi Cloud project:

1.  Log into Strapi Cloud and click on the corresponding project on the Projects page.
2.  Click on the **Settings** tab and choose **Variables** in the left menu.
3.  Add the required environment variables specific to the email provider.
4.  Click **Save**.

Below are the required environment variables for each email provider.clea

<Tabs groupId="env-var">
<TabItem value="sendgrid" label="SendGrid">

| Variable | Value |
| -------- | ----- |
| `SENDGRID_API_KEY` | your_sendgrid_api_key |


</TabItem>
<TabItem value="amazon-ses" label="Amazon SES">

| Variable | Value |
| -------- | ----- |
| `AWS_SES_KEY` | your_aws_ses_key |
| `AWS_SES_SECRET` | your_aws_ses_secret |

</TabItem>
<TabItem value="mailgun" label="Mailgun">

| Variable | Value |
| -------- | ----- |
| `MAILGUN_API_KEY` | your_mailgun_api_key |
| `MAILGUN_DOMAIN` | your_mailgun_domain |
| `MAILGUN_URL` | your_mailgun_url |

</TabItem>

</Tabs>



## Deployment

To deploy the project and utilize the third-party email provider, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi Cloud project.

Once the application finishes building, the project will use the new email provider.

:::strapi
For information on creating a custom email provider, see the [Providers](/dev-docs/providers#creating-providers) documentation.
:::