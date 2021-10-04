---
title: Plugins development - Strapi Developer Documentation
description: Strapi allows you to create your own custom local plugins that will work exactly the same as external ones.
---

# Plugins development

Strapi allows you to create local plugins that work exactly like the external ones installed with npm or through the Marketplace.

:::strapi Extending plugins
If you would rather extend an existing plugin than create a new one, see the [Plugins extension](/developer-docs/latest/development/plugins-extension.md) documentation.
:::
## Generating a plugin

To create a plugin:

1. (_Optional_) If you don't already have an existing project: Create a new development project with `strapi new myDevelopmentProject`.
2. Start the project with `cd myDevelopmentProject && strapi develop`.
3. In a new terminal window, [generate a new plugin](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate-plugin) with `cd /path/to/myDevelopmentProject && strapi generate:plugin my-plugin`
4. Enable the plugin by adding the following in `./config/plugins.js`.

  ```js
  module.exports = {
    // ...
    'plugin-name': {
      enabled: true,
      resolve: './src/plugins/plugin-name'
    },
    // ...
  }
  ```
5. (_optional_) Remove unnecessary parts of the boilerplate code
<!-- TODO: explain -->
6. Run `strapi build` to build the plugin.

Local plugins are located in the `./plugins` folder of the application.

## Loading a plugin

### Plugins auto-discovery

<!-- TODO: add here or in Strapi plugins intro (docs/developer-docs/latest/development/plugin-customization.md) that plugins installed via npm also have this strapi.kind: "plugin" declaration -->

Strapi scans every `package.json` file of the project dependencies. A Strapi plugin is automatically detected and loaded when a `package.json` contains this declaration:

```json
"strapi": {
  "kind": "plugin"
}
```
<!-- ? is it still true? because I can't find the `strapi.kind` key in the [package.json](https://github.com/strapi/strapi/blob/releases/v4/examples/getstarted/plugins/myplugin/package.json) in our examples/getstarted folder? -->

Installed plugins can also be manually enabled or disabled.

### Manual enabling/disabling

<!-- TODO: 
* either: npm packages detected (disabled possible but enabled not added to config file)
* or: mandatory enable generated plugins -->
By default, when Strapi detects and loads a plugin, `enabled: true` is added to the `./config/plugins.js` file. To disable a plugin without uninstalling it, switch `enabled` to `false`.

## Configuring a plugin

<!-- TODO: move to backend customization > plugins -->
Plugin configurations are stored in `./config/plugins.js` using the following available parameters:

| Parameter                   | Type    | Description                                                                            |
| --------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `enabled`                   | Boolean | [Enable (`true`) or disable (`false`)](#manual-enabling-disabling) an installed plugin |
| `config`<br><br>_Optional_  | Object  | Used to override default plugin configuration (defined in strapi-server.js)
| `resolve`<br><br>_Optional_ | String  | Path to the local plugin's folder

:::tip
If no specific configuration is required, the plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::

Here's an example of plugins configuration file:

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  'i18n': true,

  // enable a custom plugin
  'my-plugin': {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/my-local-plugin',
    config: {
      // user plugin config goes here
    },
  },

  // disable a plugin
  'my-other-plugin': {
    enabled: false, // plugin installed but disabled
  },
});
```

## Adding features to a plugin

Strapi provides programmatic APIs for your plugin to hook into some of Strapi's features.

Plugins can register with the server and/or the admin panel, by looking for entry point files at the root of the package:
  - `strapi-server.js` for the Server (see [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)),
  - `strapi-admin.js` for the admin panel (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md)).
