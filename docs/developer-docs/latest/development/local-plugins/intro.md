---
title: Local plugins development - Strapi Developer Documentation
description: Strapi allows you to create your own custom local plugins that will work exactly the same as external ones.
---

# Local plugins development

Strapi allows you to create local plugins that work exactly like the external ones installed with npm or through the Marketplace.

## Generating a plugin

To create a plugin:

1. Create a new development project with `strapi new myDevelopmentProject`.
2. Start the project with `cd myDevelopmentProject && strapi develop`.
3. In a new terminal window, [generate a new plugin](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate-plugin) with `cd /path/to/myDevelopmentProject && strapi generate:plugin my-plugin`
4. Add the new plugin to the admin panel with `strapi build`.
<!-- ? is the strapi build required for every plugin, even the server-based-only ones? -->

Local plugins are located in the `./plugins` folder of the application.

<!-- ? is the generator code up-to-date yet? doesn't work for me -->

## Loading a plugin

### Plugins auto-discovery

<!-- TODO: add here or in Strapi plugins intro (docs/developer-docs/latest/development/plugin-customization.md) that plugins installed via npm also have this strapi.kind: "plugin" declaration -->

Strapi scans every `package.json` file of the project dependencies. A Strapi plugin is automatically detected and loaded when a `package.json` contains this declaration:

```json
"strapi": {
  "kind": "plugin"
}
```

Installed plugins can also be manually enabled or disabled.

### Manual enabling/disabling

By default, when Strapi detects and loads a plugin, `enabled: true` is added to the `.app/config/plugins.js` file. To disable a plugin without uninstalling it, switch `enabled` to `false`.

## Configuring a plugin

Plugin configurations are stored in `./app/config/plugins.js` using the following available parameters:

<!-- ? do we necessarily need to use path.resolve('…') for the `resolve` key? if yes, how to describe the type of this parameter in the table? -->

| Parameter                   | Type    | Description                                                                            |
| --------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `enabled`                   | Boolean | [Enable (`true`) or disable (`false`)](#manual-enabling-disabling) an installed plugin |
| `config`<br><br>_Optional_  | Object  | Default plugin configuration, will be merged with the default user configuration       |
| `resolve`<br><br>_Optional_ | String  | Path to the plugin's folder, useful for overriding an existing plugin                  |

<!-- ? can we use the `'plugin-name': true` shorthand or should we always use `plugin-name: { enabled: true }`? -->
:::tip
If no specific configuration is required, the plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::

Here's an example of plugins configuration file:

```js
// .app/config/plugins.js

module.exports = ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  'content-manager': true, // you must omit the 'strapi-plugin-' prefix

  // enable a custom plugin with a default config and the resolve option
  'my-plugin': {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: path.resolve('../my-local-plugin'),
    config: {
      // default plugin config goes here
    },
  },

  // disable a plugin
  'my-other-plugin': {
    enabled: false, // plugin installed but disabled
  },

  // override a standard plugin with your own
  'upload': {
    resolve: '@my-company/strapi-plugin-upload', // enable with options
  },
});
```

<!-- ? do we need to mention lodash defaultsDeep? -->
<!-- A plugin can provide a default configuration for its plugin that will be merged with the user configuration using lodash `defaultsDeep` function. -->
<!-- ? is the validator function implemented yet? -->
<!-- A plugin can provide a validator function that will validate the plugin configuration (result of user and default config merged). -->

## Adding features to a plugin

Strapi provides a programmatic API for your plugin to hook into some of Strapi's features:

- Plugins can register with the server and/or the admin panel, by looking for entry point files at the root of the package:
  - `strapi-server.js` for the `Server` (see [Server API](./server.md)),
  - `strapi-admin.js` for the `Admin panel` (see [Admin Panel API](./admin-panel.md)).
- Plugins can also extend other existing plugins with the [Extension API](./extension.md).
