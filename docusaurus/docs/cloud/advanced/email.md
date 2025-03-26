---
title: Email Provider
displayed_sidebar: cloudSidebar
description: Configure Strapi Cloud to use a third-party email provider.
canonicalUrl: https://docs.strapi.io/cloud/advanced/email.html
tags:
- configuration
- email provider
- provider
- plugins
- Strapi Cloud
- Strapi Cloud project
---

# Email Provider

Strapi Cloud comes with a basic email provider out of the box. However, it can also be configured to utilize another email provider, if needed.

:::caution
Please be advised that Strapi are unable to provide support for third-party email providers.

:::

:::prerequisites

- A local Strapi project running on `v4.8.2+`.
- Credentials for another email provider (see <ExternalLink to="https://market.strapi.io/providers" text="Strapi Market"/>).

:::

## Configuration

Configuring another email provider for use with Strapi Cloud requires 3 steps:

1. Install the provider plugin in your local Strapi project.
2. Configure the provider in your local Strapi project.
3. Add environment variables to the Strapi Cloud project.

### Install the Provider Plugin

Using either `npm` or `yarn`, install the provider plugin in your local Strapi project as a package dependency by following the instructions in the respective entry for that provider in the <ExternalLink to="https://market.strapi.io/providers" text="Marketplace"/>.

### Configure the Provider

In your Strapi project, create a `./config/env/production/plugins.js` or `./config/env/production/plugins.ts` file with the following content:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=./config/env/production/plugins.js

module.exports = ({ env }) => ({
  // … some unrelated plugins configuration options
  // highlight-start
  email: {
    config: {
        // … provider-specific upload configuration options go here
    }
  // highlight-end
  // … some other unrelated plugins configuration options
  }
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title=./config/env/production/plugins.ts

export default ({ env }) => ({
  // … some unrelated plugins configuration options
  // highlight-start
  email: {
    config: {
        // … provider-specific upload configuration options go here
    }
  // highlight-end
  // … some other unrelated plugins configuration options
  }
});
```

</TabItem>

</Tabs>

:::caution
The file structure must match the above path exactly, or the configuration will not be applied to Strapi Cloud.
:::

Each provider will have different configuration settings available. Review the respective entry for that provider in the <ExternalLink to="https://market.strapi.io/providers" text="Marketplace"/>.

**Example:**
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

:::tip
Before pushing the above changes to GitHub, add environment variables to the Strapi Cloud project to prevent triggering a rebuild and new deployment of the project before the changes are complete.
:::

### Strapi Cloud Configuration

1. Log into Strapi Cloud and click on the corresponding project on the Projects page.
2. Click on the **Settings** tab and choose **Variables** in the left menu.
3. Add the required environment variables specific to the email provider.
4. Click **Save**.

**Example:**

<Tabs groupId="env-var">
<TabItem value="sendgrid" label="SendGrid">

| Variable           | Value                 |
|--------------------|-----------------------|
| `SENDGRID_API_KEY` | your_sendgrid_api_key |

</TabItem>
<TabItem value="amazon-ses" label="Amazon SES">

| Variable         | Value               |
|------------------|---------------------|
| `AWS_SES_KEY`    | your_aws_ses_key    |
| `AWS_SES_SECRET` | your_aws_ses_secret |

</TabItem>
<TabItem value="mailgun" label="Mailgun">

| Variable          | Value                |
|-------------------|----------------------|
| `MAILGUN_API_KEY` | your_mailgun_api_key |
| `MAILGUN_DOMAIN`  | your_mailgun_domain  |
| `MAILGUN_URL`     | your_mailgun_url     |

</TabItem>

</Tabs>

## Deployment

To deploy the project and utilize another party email provider, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi Cloud project.

Once the application finishes building, the project will use the new email provider.

:::strapi Custom Provider
If you want to create a custom email provider, please refer to the [Providers](/cms/providers#creating-providers) documentation in the CMS Documentation.
:::
