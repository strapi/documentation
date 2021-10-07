---
title: Plugins extension - Strapi Developer Docs
description: …
sidebarDepth: 2
---

<!-- TODO: update SEO -->

# Plugins extension

Strapi comes with [plugins](/developer-docs/latest/plugins/plugins-intro.md) that can be installed from the Marketplace or as npm packages. You can also create your own plugins (see [plugins development](/developer-docs/latest/development/plugins-development.md)) or extend the existing ones.

Plugin extensions code is located in the `/src/extensions` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)). Some plugins automatically create files there, ready to be modified.

:::details Example of extensions folder structure:

```bash
/extensions
  /some-plugin-to-extend
    strapi-admin.js
    strapi-server.js
    /content-types
      /some-content-type-to-extend
        model.json
      /another-content-type-to-extend
        model.json
  /another-plugin-to-extend
    strapi-admin.js
```

:::

Plugins can be extended in 2 ways:

- [extending the plugin's Content-Types](#extending-a-plugin-s-content-types)
- [extending the plugin's interface](#extending-a-plugin-s-interface) (e.g. to add controllers, services, policies, middlewares and more)

A plugin's Content-Types can be extended in 2 ways: using the programmatic interface within `strapi-server.js` and by overriding the content-types schemas.

The final schema of the content-types depends on the following loading order:

1. the content-types of the original plugin,
2. the content-types overriden by the declarations in the [schema](/developer-docs/latest/development/backend-customization/models.md#model-schema) defined in `./src/extensions/plugin-name/content-types/content-type-name/schema.json`
3. the content-types declarations in the [`content-types` key exported from `strapi-server.js`](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#content-types)
4. the content-types declarations in the [`register()` function](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md#register) of the Strapi application

:::warning
New versions of Strapi are released with [migration guides](/developer-docs/latest/update-migration-guides/migration-guides.md), but these guides might not cover unexpected breaking changes in your plugin extensions. Consider forking a plugin if extensive customizations are required.
:::

## Extending a plugin's Content-Types

To overwrite a plugin's [Content-Types](/developer-docs/latest/development/backend-customization/models.md):

1. _(optional)_ Create the `/src/extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Create a `content-types` subfolder.
4. Inside the `content-types` subfolder, create another subfolder with the same [singularName](/developer-docs/latest/development/backend-customization/models.md#model-information) as the content-type to overwrite.
5. Inside this `content-types/name-of-content-type` subfolder, define the new schema for the Content-Type in a `schema.json` file (see [schema](/developer-docs/latest/development/backend-customization/models.md#model-schema) documentation).
6. _(optional)_ Repeat steps 4 and 5 for each Content-Type to overwrite.
<!-- TODO: remove this comment — The links to the models section above won't work in this PR, but will work once the content is merged with the database PR -->

## Extending a plugin's interface

When a Strapi application is initializing, plugins, extensions and global lifecycle functions events happen in the following order:

1. Plugins are loaded and their interfaces are exposed.
2. Files in `src/extensions` are loaded.
3. The `register()` and `bootstrap()` functions in `src/index.js` are called.

A plugin's interface can be extended at step 2 (i.e. within `src/extensions`) or step 3 (i.e. inside `src/index.js`).

### Within the `src/extensions` folder

To extend a plugin's interface using the `src/extensions` folder:

1. _(optional)_ Create the `/src/extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Depending on what needs to be extended:
    * create a `strapi-server.js` file to extend a plugin's back end using the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)
    * or create a  `strapi-admin.js` file to extend the admin panel with the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md).
4. Within this file, define and export a function.  The function receives the `plugin` interface as an argument so it can be extended.

::: details Example of backend extension

<!-- ? is it `pluginConfig` or just `plugin` in the example below? -->
```js
// path: /extensions/some-plugin-to-extend/strapi-server.js

module.exports = (plugin, strapi) => {
  pluginConfig.controllers.controllerA.find = (ctx) => {};

  pluginConfig.policies[newPolicy] = (ctx) => {};

  pluginConfig.routes.push({
    method: 'GET',
    path: '/route-path',
    handler: 'controller.action',
  });
};
```

:::

### Within the `src/index.js` file

To extend a plugin's interface within `src/index.js`, use its `bootstrap()` and `register()` [functions]((/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md)), and access the interface programmatically with [getters](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#usage).
<!-- TODO: remove this comment — link above won't work until merged with the "Reworked configurations" PR -->

::: details Example of extending a plugin's content-type within src/index.js

```js
// path: src/index.js

module.exports = {
  register({ strapi }) {
    strapi.contentType('plugin::my-plugin.content-type-name') = {
      attributes: {
        'toto': {
          type: 'string',
        }
      }
    }
  },
  bootstrap({ strapi }),
};
```

:::

## Understanding the Content-Types loading order


<!-- ! The link to the `schema` section above won't work in this PR, but will work once the content is merged with the database PR -->
