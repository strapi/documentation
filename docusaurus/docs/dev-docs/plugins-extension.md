---
title: Plugins extension
displayed_sidebar: devDocsSidebar
tags:
- bootstrap function
- controllers
- middlewares
- policies
- plugins
- plugins development
- register function 
- services
---

# Plugins extension

Strapi comes with [plugins](/dev-docs/plugins) that can be installed from the [Marketplace](/user-docs/plugins/installing-plugins-via-marketplace#installing-marketplace-plugins-and-providers) or as npm packages. You can also create your own plugins (see [plugins development](/dev-docs/plugins/developing-plugins)) or extend the existing ones.

:::warning
* Any plugin update could break this plugin's extensions.
* New versions of Strapi will be released with migration guides when required, but these guides never cover plugin extensions. Consider forking a plugin if extensive customizations are required.
* Currently, the admin panel part of a plugin can only be extended using [patch-package](https://www.npmjs.com/package/patch-package), but please consider that doing so might break your plugin in future versions of Strapi.
:::

Plugin extensions code is located in the `./src/extensions` folder (see [project structure](/dev-docs/project-structure)). Some plugins automatically create files there, ready to be modified.

<details> 
<summary>Example of extensions folder structure</summary>

```bash
/extensions
  /some-plugin-to-extend
    strapi-server.js|ts
    /content-types
      /some-content-type-to-extend
        model.json
      /another-content-type-to-extend
        model.json
  /another-plugin-to-extend
    strapi-server.js|ts
```
</details>

Plugins can be extended in 2 ways:

- [extending the plugin's content-types](#extending-a-plugins-content-types)
- [extending the plugin's interface](#extending-a-plugins-interface) (e.g. to add controllers, services, policies, middlewares and more)

## Extending a plugin's content-types

A plugin's Content-Types can be extended in 2 ways: using the programmatic interface within `strapi-server.js|ts` and by overriding the content-types schemas.

The final schema of the content-types depends on the following loading order:

1. the content-types of the original plugin,
2. the content-types overridden by the declarations in the [schema](/dev-docs/backend-customization/models#model-schema) defined in `./src/extensions/plugin-name/content-types/content-type-name/schema.json`
3. the content-types declarations in the [`content-types` key exported from `strapi-server.js|ts`](/dev-docs/plugins/server-api#content-types)
4. the content-types declarations in the [`register()` function](/dev-docs/configurations/functions#register) of the Strapi application

To overwrite a plugin's [content-types](/dev-docs/backend-customization/models):

1. _(optional)_ Create the `./src/extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Create a `content-types` subfolder.
4. Inside the `content-types` subfolder, create another subfolder with the same [singularName](/dev-docs/backend-customization/models#model-information) as the content-type to overwrite.
5. Inside this `content-types/name-of-content-type` subfolder, define the new schema for the content-type in a `schema.json` file (see [schema](/dev-docs/backend-customization/models#model-schema) documentation).
6. _(optional)_ Repeat steps 4 and 5 for each content-type to overwrite.

## Extending a plugin's interface

When a Strapi application is initializing, plugins, extensions and global lifecycle functions events happen in the following order:

1. Plugins are loaded and their interfaces are exposed.
2. Files in `./src/extensions` are loaded.
3. The `register()` and `bootstrap()` functions in `./src/index.js|ts` are called.

A plugin's interface can be extended at step 2 (i.e. within `./src/extensions`) or step 3 (i.e. inside `./src/index.js|ts`).

:::note
If your Strapi project is TypeScript-based, please ensure that the `index` file has a TypeScript extension (i.e., `src/index.ts`) otherwise it will not be compiled.
:::

### Within the extensions folder

To extend a plugin's server interface using the `./src/extensions` folder:

1. _(optional)_ Create the `./src/extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Create a `strapi-server.js|ts` file to extend a plugin's back end using the [Server API](/dev-docs/plugins/server-api).
4. Within this file, define and export a function. The function receives the `plugin` interface as an argument so it can be extended.

<details>
<summary>Example of backend extension</summary>

```js title="./src/extensions/some-plugin-to-extend/strapi-server.js|ts"

module.exports = (plugin) => {
  plugin.controllers.controllerA.find = (ctx) => {};

  plugin.policies[newPolicy] = (ctx) => {};

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/route-path',
    handler: 'controller.action',
  });

  return plugin;
};
```
</details>

### Within the register and bootstrap functions

To extend a plugin's interface within `./src/index.js|ts`, use the `bootstrap()` and `register()` [functions](/dev-docs/configurations/functions) of the whole project, and access the interface programmatically with [getters](/dev-docs/plugins/server-api#usage).

<details>
<summary>Example of extending a plugin's content-type within ./src/index.js|ts</summary>

```js title="./src/index.js|ts"

module.exports = {
  register({ strapi }) {
    const contentTypeName = strapi.contentType('plugin::my-plugin.content-type-name')  
    contentTypeName.attributes = {
      // Spread previous defined attributes
      ...contentTypeName.attributes,
      // Add new, or override attributes
      'toto': {
        type: 'string',
      }
    }
  },
  bootstrap({ strapi }) {},
};
```
</details>

