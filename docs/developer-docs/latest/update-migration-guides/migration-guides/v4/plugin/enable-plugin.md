---
title: v4 plugin migration - Enabling a plugin - Strapi Developer Docs
description: Enable a Strapi plugin while migrating from v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl: http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.html
prev: /developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.md
---

# v4 plugin migration: Enabling a plugin

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!

::: strapi v3/v4 comparison
A Strapi v3 plugin was enabled if it was manually installed or found in the `plugins` directory.

In Strapi v4:

- Installed plugins following the [automatic plugins discovery](/developer-docs/latest/plugins/plugins-intro.md#automatic-plugins-discovery) pattern will automatically be enabled.
- While developing a local plugin, the plugin must explicitly be enabled in [the `./config/plugins.js` file](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) of the Strapi application.
:::

To enable a local plugin in v4 and define an optional configuration:

1. If it does not already exist, create the `./config/plugins.js` file.

2. In the `./config/plugins.js` file, export a function that:
    - returns an object
    - and can take the `{ env }` object as a parameter (see [Environment configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) documentation).

3. Within the object exported by `./config/plugins.js`, create a key with the name of the plugin (e.g. `"my-plugin"`). The value of this key is also an object.

4. Within the `"my-plugin"` object, set the `enabled` key value to `true` (boolean).

5. _(optional)_ Add a `resolve` key, whose value is the path of the plugin folder (as a string), and a `config` key (as an object) that can include additional configuration for the plugin (see [plugins configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) documentation).

::: details Example: Enabling and configuring a "my-plugin" plugin

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

:::note Plugins published on npm
If the plugin will be published on npm, the `package.json` file should include a `strapi.kind` key with a value set to `"plugin"` (i.e. `{ "strapi": { "kind": "plugin" } }`).
:::
