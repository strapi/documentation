---
title: Middleware Configuration for Strapi Cloud
displayed_sidebar: cloudSidebar
description: Configure custom middlewares for your Strapi Cloud production environment.
canonicalUrl: https://docs.strapi.io/cloud/advanced/middlewares.html
tags:
- configuration
- middlewares
- CORS
- Content Security Policy
- CSP
- production
- Strapi Cloud
- Strapi Cloud configuration
- Strapi Cloud project
---

# Middleware Configuration for Strapi Cloud

<Tldr>
On Strapi Cloud, middleware customizations must go in `config/env/production/middlewares`. Changes to the global config file are overwritten on deploy.
</Tldr>

:::prerequisites

- A local Strapi project.
- A Strapi Cloud project (see [Getting Started](/cloud/getting-started/deployment)).

:::

On Strapi Cloud, `NODE_ENV` is always set to `production`. The platform applies its own production-level middleware configuration on deploy. Any changes to the global `config/middlewares` file are overwritten and will not take effect. For available middleware options, see [Middlewares configuration](/cms/configurations/middlewares).

To apply custom middleware configuration on Strapi Cloud, place your changes in:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```
config/env/production/middlewares.js
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```
config/env/production/middlewares.ts
```

</TabItem>
</Tabs>

:::caution
The `config/env/production/middlewares` file **fully replaces** the global middleware array. Your file must include the complete list:

- `strapi::errors`
- `strapi::security`
- `strapi::cors`
- `strapi::poweredBy`
- `strapi::logger`
- `strapi::query`
- `strapi::body`
- `strapi::session`
- `strapi::favicon`
- `strapi::public`

Both CSP and CORS customizations can be combined in the same file.
:::

:::note
- You can keep your existing `config/middlewares` file as-is as it will not cause conflicts. The production-specific file takes precedence on Strapi Cloud.
- Upload size limits on Strapi Cloud are enforced at the infrastructure level and cannot be overridden via the `strapi::body` config.
- For per-plan values and the memory-based recommendation for image uploads, see [Upload size limits for Strapi Cloud](/cloud/advanced/upload-size-limits). For external storage options, see [Upload Provider Configuration](/cloud/advanced/upload).
:::

## Custom Content Security Policy (CSP)

If you use an external upload provider, allow its domain in the CSP directives. Without this, the Strapi Admin panel will block images and media from those sources.

Create or update `config/env/production/middlewares`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="config/env/production/middlewares.js"
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'your-custom-domain.com', // replace with your provider domain
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'your-custom-domain.com', // replace with your provider domain
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="config/env/production/middlewares.ts"
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'your-custom-domain.com', // replace with your provider domain
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'your-custom-domain.com', // replace with your provider domain
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

</TabItem>
</Tabs>

:::tip
For a full list of upload providers and their required domains, see the <ExternalLink to="https://market.strapi.io/providers" text="Strapi Market"/>.
:::

## Custom CORS headers

If your frontend sends custom request headers (e.g. for authorization flows), you need to explicitly allow them in the CORS configuration. Placing this in the global `config/middlewares` file will not work on Strapi Cloud. Place it in `config/env/production/middlewares` instead.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="config/env/production/middlewares.js"
module.exports = ({ env }) => [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [env('CLIENT_URL')],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With',
        'your-custom-header', // add any custom headers your frontend sends
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="config/env/production/middlewares.ts"
export default ({ env }) => [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [env('CLIENT_URL')],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With',
        'your-custom-header', // add any custom headers your frontend sends
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

</TabItem>
</Tabs>
