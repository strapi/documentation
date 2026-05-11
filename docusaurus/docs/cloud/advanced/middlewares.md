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
On Strapi Cloud, middleware customizations must go in `config/env/production/middlewares.ts` — changes to the global config file are overwritten on deploy.
</Tldr>

:::prerequisites

- A local Strapi project running on `v4.8.2+`.
- A Strapi Cloud project (see [Getting Started](/cloud/getting-started/deployment)).

:::

On Strapi Cloud, `NODE_ENV` is always set to `production`. The platform injects its own middleware configuration at the production environment level, which means any customizations placed in the global `config/middlewares.ts` (or `.js`) file will be overwritten after deploy and will not take effect.

To apply custom middleware configuration on Strapi Cloud, place your changes in:

```
config/env/production/middlewares.ts
```

:::note
You can keep your existing `config/middlewares.ts` file as-is — it will not cause conflicts. The production-specific file takes precedence on Strapi Cloud.
:::

## Common use cases

### Custom Content Security Policy (CSP)

If you use an external upload provider (such as Cloudflare R2, AWS S3, or any custom domain), you need to allow those domains in the CSP directives. Without this, the Strapi Admin panel will block images and media from those sources.

Create or update `config/env/production/middlewares.ts`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=./config/env/production/middlewares.js
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

```ts title=./config/env/production/middlewares.ts
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

### Custom CORS headers

If your frontend sends custom request headers (e.g. for authorization flows), you need to explicitly allow them in the CORS configuration. Placing this in the global `config/middlewares.ts` will not work on Strapi Cloud — it must be in `config/env/production/middlewares.ts`.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=./config/env/production/middlewares.js
module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [process.env.CLIENT_URL],
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

```ts title=./config/env/production/middlewares.ts
export default [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [process.env.CLIENT_URL],
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

## Important notes

:::caution
Both CSP and CORS can be combined in a single `config/env/production/middlewares.ts` file. Make sure to include the full middleware array — partial configs may cause other middlewares to be dropped.
:::

:::note
Upload size limits on Strapi Cloud are enforced at the infrastructure level (Cloudflare gateway) and cannot be overridden via the `strapi::body` config. See [Upload Provider Configuration](/cloud/advanced/upload) for guidance on using external providers to handle larger file sizes.
:::

This behavior applies to all Strapi Cloud plans and to both Strapi v4 and v5.

## See also

- [Middlewares configuration](/cms/configurations/middlewares) — full reference for all available middleware options, including `strapi::security` and `strapi::cors` parameters.
- [Upload Provider Configuration for Strapi Cloud](/cloud/advanced/upload) — configure an external upload provider and the associated CSP settings.
