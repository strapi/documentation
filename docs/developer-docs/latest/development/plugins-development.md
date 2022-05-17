---
title: Plugins development - Strapi Developer Docs
description: Strapi allows you to create your own custom local plugins that will work exactly the same as external ones.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/plugins-development.html
---

# Plugins development

Strapi allows you to create local plugins that work exactly like the external ones installed with npm or through the Marketplace.

:::strapi Extending plugins
If you would rather extend an existing plugin than create a new one, see the [Plugins extension](/developer-docs/latest/development/plugins-extension.md) documentation.
:::

## Creating a plugin

To create a plugin, use Strapi CLI tools:

1. (_Optional_) If you don't already have an existing project, create a new development project with `strapi new myDevelopmentProject`.
2. Start the project with `cd myDevelopmentProject && strapi develop`.
3. In a new terminal window, run `cd /path/to/myDevelopmentProject && strapi generate` to launch the interactive `strapi generate` CLI.
4. Choose "plugin" from the list, press Enter, and give the plugin a name.
5. Choose either `JavaScript` or `TypeScript` for the plugin language.
6. Enable the plugin by adding it to the [plugins configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) file:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

    module.exports = {
      // ...
      'my-plugin': {
        enabled: true,
        resolve: './src/plugins/my-plugin' // path to plugin folder
      },
      // ...
    }
```
</code-block>

<code-block title="TYPESCRIPT">

```js
 //path: ./config/plugins.ts

    export default {
      // ...
      'my-plugin': {
        enabled: true,
        resolve: './src/plugins/my-plugin' // path to plugin folder
      },
      // ...
    }


```
</code-block>

</code-group>
 
::: caution
The plugin name must be kebab-case.
    Example: an-example-of-kebab-case.
:::

7. For TypeScript applications, run `npm run install` or `yarn install` in the plugin directory.
8. Run `yarn build` or `npm run build` to build the plugin.

Plugins created this way are located in the `plugins` folder of the application (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

## Adding features to a plugin

Strapi provides programmatic APIs for your plugin to hook into some of Strapi's features.

Plugins can register with the server and/or the admin panel, by looking for entry point files at the root of the package:
  - `strapi-server.js` for the Server (see [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)),
  - `strapi-admin.js` for the admin panel (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md)).
