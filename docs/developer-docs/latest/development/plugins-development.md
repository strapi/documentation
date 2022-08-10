---
title: Plugins development - Strapi Developer Docs
description: Strapi allows you to create your own custom local plugins that will work exactly the same as external ones.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/plugins-development.html
---

# Plugins development

Strapi allows the development of local plugins that work exactly like the external plugins available from the [Marketplace](https://market.strapi.io).

:::strapi Extending plugins
If you would rather extend an existing plugin than create a new one, see the [Plugins extension](/developer-docs/latest/development/plugins-extension.md) documentation.
:::

## Create a plugin

Strapi provides a [command line interface (CLI)](/developer-docs/latest/developer-resources/cli/CLI.md) for creating plugins. To create a plugin:

1. Navigate to the root of a Strapi project.
2. Run `yarn strapi generate` or `npm run strapi generate` in a terminal window to start the interactive CLI.
4. Choose "plugin" from the list, press Enter, and give the plugin a name in kebab-case (e.g. my-plugin-name)
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
 // path: ./config/plugins.ts

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

7. (*TypeScript-specific*) Run `npm run install` or `yarn install` in the newly-created plugin directory.
8. Run `yarn build` or `npm run build` to build the plugin.

Plugins created using the preceding directions are located in the `plugins` directory of the application (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

## Add features to a plugin

Strapi provides programmatic APIs for plugins to hook into some of Strapi's features.

Plugins can register with the server and/or the admin panel, by looking for entry point files at the root of the package:
  - `strapi-server.js` for the Server (see [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)),
  - `strapi-admin.js` for the admin panel (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md)).
