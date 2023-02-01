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
4. Choose "plugin" from the list, press Enter, and give the plugin a name in kebab-case (e.g. `my-plugin`)
5. Choose either `JavaScript` or `TypeScript` for the plugin language.
6. Create a plugins configuration file if one does not already exist: `./config/plugins.js` or `./config/plugins.ts` for TypeScript projects.
7. Enable the plugin by adding it to the [plugins configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) file:

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

7. (*TypeScript-specific*) Run `npm install` or `yarn` in the newly-created plugin directory.
8. (*TypeScript-specific*) Run `yarn build` or `npm run build` in the plugin directory. This step transpiles the TypeScript files and outputs the JavaScript files to a `dist` directory that is unique to the plugin.
9. Run `yarn build` or `npm run build` at the project root.
10. Run `yarn develop` or `npm run develop` at the project root.

Plugins created using the preceding directions are located in the `plugins` directory of the application (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

::: note
During plugin development it is helpful to use the `--watch-admin` flag to toggle hot reloading of the admin panel. See the [Admin panel customization](/developer-docs/latest/development/admin-customization.md) documentation for more details. (TypeScript specific) While developing your plugin, you can run `yarn develop` or `npm run develop` in the plugin directory to watch the changes to the TypeScript server files.
:::

::: tip
Check [this blog post](https://strapi.io/blog/how-to-create-a-strapi-v4-plugin-publish-on-npm-6-6) to learn how to publish your Strapi plugin on npm.
:::

## Add features to a plugin

Strapi provides programmatic APIs for plugins to hook into some of Strapi's features.

Plugins can register with the server and/or the admin panel, by looking for entry point files at the root of the package:
  - `strapi-server.js` for the Server (see [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)),
  - `strapi-admin.js` for the admin panel (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md)).

::: strapi Custom fields plugins
Plugins can also be used to add [custom fields](/developer-docs/latest/development/custom-fields.md) to Strapi.
:::

