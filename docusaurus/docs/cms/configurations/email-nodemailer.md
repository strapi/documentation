---
title: Advanced Nodemailer configuration
displayed_sidebar: cmsSidebar
description: Configure OAuth2, connection pooling, DKIM signing, and rate limiting for the Nodemailer email provider in Strapi.
tags:
- email
- nodemailer
- providers
- features
---

# Advanced Nodemailer configuration

<Tldr>
The Nodemailer provider supports OAuth2 authentication, connection pooling, DKIM signing, and rate limiting. Each scenario adds specific keys to `providerOptions` on top of a standard SMTP configuration.
</Tldr>

This page covers production scenarios for the community `@strapi/provider-email-nodemailer` package that can be used with the [Email feature](/cms/features/email). For basic provider installation and SMTP setup, see [Configuring providers](/cms/features/email#configuring-providers).

:::info Supported providers
For the full list of supported `providerOptions`, refer to the <ExternalLink to="https://www.npmjs.com/package/@strapi/provider-email-nodemailer" text="provider README on npm"/>.
:::

## OAuth2 authentication

For services like Gmail or Outlook that require OAuth2 instead of a password:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        // highlight-start
        auth: {
          type: 'OAuth2',
          user: env('SMTP_USER'),
          clientId: env('OAUTH_CLIENT_ID'),
          clientSecret: env('OAUTH_CLIENT_SECRET'),
          refreshToken: env('OAUTH_REFRESH_TOKEN'),
        },
        // highlight-end
      },
      settings: {
        defaultFrom: env('SMTP_USER'),
        defaultReplyTo: env('SMTP_USER'),
      },
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        // highlight-start
        auth: {
          type: 'OAuth2',
          user: env('SMTP_USER'),
          clientId: env('OAUTH_CLIENT_ID'),
          clientSecret: env('OAUTH_CLIENT_SECRET'),
          refreshToken: env('OAUTH_REFRESH_TOKEN'),
        },
        // highlight-end
      },
      settings: {
        defaultFrom: env('SMTP_USER'),
        defaultReplyTo: env('SMTP_USER'),
      },
    },
  },
});
```

</TabItem>
</Tabs>

## Connection pooling

Use connection pooling to reuse SMTP connections and improve throughput when sending many emails:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 465,
        secure: true,
        // highlight-start
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        // highlight-end
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 465,
        secure: true,
        // highlight-start
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        // highlight-end
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
</Tabs>

## DKIM signing

Add DKIM signatures to improve deliverability and authenticate outbound mail:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 587,
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // highlight-start
        dkim: {
          domainName: 'example.com',
          keySelector: 'mail',
          privateKey: env('DKIM_PRIVATE_KEY'),
        },
        // highlight-end
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 587,
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // highlight-start
        dkim: {
          domainName: 'example.com',
          keySelector: 'mail',
          privateKey: env('DKIM_PRIVATE_KEY'),
        },
        // highlight-end
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
</Tabs>

## Rate limiting

Limit the number of messages sent per time interval to avoid triggering spam filters:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 465,
        secure: true,
        pool: true,
        // highlight-start
        rateLimit: 5,    // max messages per rateDelta
        rateDelta: 1000, // time interval in ms (1 second)
        // highlight-end
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: 465,
        secure: true,
        pool: true,
        // highlight-start
        rateLimit: 5,
        rateDelta: 1000,
        // highlight-end
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'hello@example.com',
        defaultReplyTo: 'hello@example.com',
      },
    },
  },
});
```

</TabItem>
</Tabs>

:::note Rate limiting requires connection pooling
`rateLimit` and `rateDelta` only take effect when `pool: true` is also set.
:::