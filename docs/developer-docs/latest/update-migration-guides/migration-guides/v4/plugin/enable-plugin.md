---
title: v4 plugin migration - Enable a plugin - Strapi Developer Docs
description:
canonicalUrl:
prev: /developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.md
---

<!-- TODO: update SEO -->

# v4 plugin migration: Enable a plugin

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!

<br/>

A v3 plugin was enabled if it was manually installed or found in the `plugins` directory.

In v4:

- If a plugin is installed via the [automatic plugins discovery](/developer-docs/latest/plugins/plugins-intro.md#automatic-plugins-discovery) feature, it is automatically enabled.
- While developing a local plugin, the plugin must explicitly be enabled in [the `./config/plugins.js` file](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) of the Strapi application.

<br/>

Enabling a plugin in v4 should be done manually with the following procedure:

1. _(optional)_ Create the `./config/plugins.js` file if it does not already exist. This JavaScript file should export an object and can take the `{ env }` object as an input (see [Environment configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) documentation).
2. Within the object exported by `./config/plugins.js`, create a key with the name of the plugin (e.g. `"my-plugin"`). The value of this key is also an object.
3. Within the `"my-plugin"` object, set the `enabled` key value to `true` (boolean).
4. _(optional)_ Add a `resolve` key, whose value is the path of the plugin folder (as a string), and a `config` key (as an object) that can include additional configuration for the plugin (see [plugins configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) documentation).

::: details Example: Enabling a "my-plugin" plugin

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  "my-plugin": {
    enabled: true,
    resolve: "./path-to-my-plugin",
    config: {
      // additional configuration goes here
    },
  },
});
```

:::
