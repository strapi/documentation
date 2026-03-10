---
title: Server configuration
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/server-lifecycle
pagination_next: cms/plugins-development/server-routes
toc_max_heading_level: 4
description: Define default plugin options, validate user-provided values, and read plugin configuration at runtime.
tags:
  - plugin APIs
  - configuration
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Configuration

<Tldr>
Expose a `config` object with a `default` property and a `validator` function. Strapi deep-merges the defaults with the user's `config/plugins` file, then runs validation before the plugin loads. Read configuration at runtime with `strapi.plugin('my-plugin').config('key')`.
</Tldr>

A plugin can expose a `config` object from its [server entry file](/cms/plugins-development/server-api#entry-file). This object defines default configuration values and validates any user-provided overrides loaded from the application's `config/plugins.js|ts` file.

<Prerequisite />

## Configuration shape

The `config` object accepts two properties:

| Property | Type | Description |
| --- | --- | --- |
| `default` | Object, or Function returning an Object | Default configuration values for the plugin. Merged with the user configuration using a deep merge (user values take precedence). |
| `validator` | Function | Receives the merged configuration object and must throw an error if the result is invalid. |

## Configuration loading

When Strapi loads a plugin, it applies the following sequence:

| Step | What Strapi does | Notes |
| --- | --- | --- |
| 1 | Compute the default config | If `default` is a function, it is called with `{ env }`. Otherwise the object is used directly. |
| 2 | Deep-merge with user config | Values from `config/plugins.js\|ts` take precedence over defaults. |
| 3 | Run `validator(mergedConfig)` | Throws a contextualized error if validation fails, stopping startup. |
| 4 | Store the final config | Available on the plugin instance via `strapi.plugin('my-plugin').config('key')`. |

:::note
The `{ env }` argument passed to the `default` function is the same `env` utility used across Strapi configuration files. It reads `process.env` values and supports type casting: `env('MY_VAR')`, `env.int('PORT', 3000)`, `env.bool('ENABLED', true)`, etc.
:::

## Configuration example

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/config/index.js"
'use strict';

module.exports = {
  // highlight-start
  default: ({ env }) => ({
    enabled: true,
    maxItems: env.int('MY_PLUGIN_MAX_ITEMS', 10),
    endpoint: env('MY_PLUGIN_ENDPOINT', 'https://api.example.com'),
  }),
  // highlight-end
  validator: (config) => {
    if (typeof config.enabled !== 'boolean') {
      throw new Error('"enabled" must be a boolean');
    }
    if (typeof config.maxItems !== 'number' || config.maxItems < 1) {
      throw new Error('"maxItems" must be a positive number');
    }
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/config/index.ts"
export default {
  // highlight-start
  default: ({ env }: { env: any }) => ({
    enabled: true,
    maxItems: env.int('MY_PLUGIN_MAX_ITEMS', 10),
    endpoint: env('MY_PLUGIN_ENDPOINT', 'https://api.example.com'),
  }),
  // highlight-end
  validator: (config: { enabled: unknown; maxItems: unknown }) => {
    if (typeof config.enabled !== 'boolean') {
      throw new Error('"enabled" must be a boolean');
    }
    if (typeof config.maxItems !== 'number' || config.maxItems < 1) {
      throw new Error('"maxItems" must be a positive number');
    }
  },
};
```

</TabItem>
</Tabs>

A user can override these values in the application's plugin configuration file:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = {
  'my-plugin': {
    enabled: true,
    config: {
      maxItems: 25,
      endpoint: 'https://api.production.example.com',
    },
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default {
  'my-plugin': {
    enabled: true,
    config: {
      maxItems: 25,
      endpoint: 'https://api.production.example.com',
    },
  },
};
```

</TabItem>
</Tabs>

After deep-merging defaults with user overrides, the final config is `{ enabled: true, maxItems: 25, endpoint: 'https://api.production.example.com' }`.

## Runtime access

Once the plugin is loaded, its configuration is available anywhere the `strapi` object is accessible:

```js
// Read one key
const maxItems = strapi.plugin('my-plugin').config('maxItems');

// Read the entire plugin config object
const pluginConfig = strapi.config.get('plugin::my-plugin');
```

Both `strapi.plugin().config()` and `strapi.config.get()` are typically used inside lifecycle functions, controllers, or services.

:::tip
Use `yarn strapi console` or `npm run strapi console` to inspect the live configuration of a running Strapi instance.
:::

## Best practices

- **Always provide a `default`.** A plugin with no defaults forces every user to supply all configuration values, which creates friction. Make every option optional with a sensible default.

- **Use the function form of `default` for environment-aware config.** The `({ env }) => ({...})` form lets users drive configuration from environment variables without any extra setup. The plain object form is fine for truly static defaults.

- **Keep validation simple and explicit.** The `validator` runs at startup, before any request is served. Throw descriptive errors so the operator knows exactly what is wrong. For example, `'"maxItems" must be a positive number'` is more useful than `'Invalid config'`.

- **Do not store secrets in plugin config.** Plugin configuration is accessible server-side via `strapi.config` and can be exposed unintentionally through logs, debug tooling, or custom endpoints if mishandled. Use environment variables directly in services, or read those values via the `env` helper in `default`, rather than embedding raw credentials in the config object.

- **Read config in services, not inline.** Accessing `strapi.plugin('my-plugin').config('key')` inside a service method rather than at module load time ensures the value is always the final merged value, not a snapshot taken before user overrides are applied.