---
title: Server configuration
displayed_sidebar: cmsSidebar
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

## How Strapi loads plugin configuration

When Strapi loads a plugin, it applies the following sequence:

1. Compute the default config: if `default` is a function, call it with `{ env }` to support environment-aware defaults; otherwise use the object as-is.
2. Deep-merge the default config with the user config from `config/plugins.js|ts` (user values take precedence).
3. Call `validator(mergedConfig)` and throw a contextualized error if it throws.
4. Store the final config on the plugin instance.

:::note Runtime behavior
The `{ env }` argument passed to the `default` function is the same `env` utility used across Strapi configuration files. It reads `process.env` values and supports type casting: `env('MY_VAR')`, `env.int('PORT', 3000)`, `env.bool('ENABLED', true)`, etc.
:::

## Example

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/config/index.js"
'use strict';

module.exports = {
  default: ({ env }) => ({
    enabled: true,
    maxItems: env.int('MY_PLUGIN_MAX_ITEMS', 10),
    endpoint: env('MY_PLUGIN_ENDPOINT', 'https://api.example.com'),
  }),
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
  default: ({ env }: { env: any }) => ({
    enabled: true,
    maxItems: env.int('MY_PLUGIN_MAX_ITEMS', 10),
    endpoint: env('MY_PLUGIN_ENDPOINT', 'https://api.example.com'),
  }),
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

The resulting merged config would be `{ enabled: true, maxItems: 25, endpoint: 'https://api.production.example.com' }`.

## Read configuration at runtime

Once the plugin is loaded, its configuration is available anywhere the `strapi` object is accessible:

```js
// Read one key
const maxItems = strapi.plugin('my-plugin').config('maxItems');

// Read the entire plugin config object
const pluginConfig = strapi.config.get('plugin::my-plugin');
```

Both forms are typically used inside lifecycle functions, controllers, or services.

:::tip
Use `yarn strapi console` or `npm run strapi console` to inspect the live configuration of a running Strapi instance.
:::

## Best practices

- **Always provide a `default`.** A plugin with no defaults forces every user to supply all configuration values, which creates friction. Make every option optional with a sensible default.

- **Use the function form of `default` for environment-aware config.** The `({ env }) => ({...})` form lets users drive configuration from environment variables without any extra plumbing. The plain object form is fine for truly static defaults.

- **Keep validation simple and explicit.** The `validator` runs at startup, before any request is served. Throw descriptive errors so the operator knows exactly what is wrong: `'"maxItems" must be a positive number'` is far more useful than `'Invalid config'`.

- **Do not store secrets in plugin config.** Plugin configuration is serialized and accessible via `strapi.config`. Use environment variables directly in services, or read them via the `env` helper in `default`, rather than embedding raw credentials in the config object.

- **Read config in services, not inline.** Accessing `strapi.plugin('my-plugin').config('key')` inside a service method rather than at module load time ensures the value is always the final merged value, not a snapshot taken before user overrides are applied.