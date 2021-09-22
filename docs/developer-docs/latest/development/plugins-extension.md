# Plugins extension

Strapi comes with [plugins](/developer-docs/latest/plugins/plugins-intro.md) that can be installed from the Marketplace or as npm packages. You can also create your own plugins (see [plugins development](/developer-docs/latest/development/plugins-development.md)) or extend the existing ones.

Plugin extensions code sit in the `./extensions` folder. Some plugins automatically create files there, ready to be modified. You can also create files manually to add some custom configuration.
<!-- TODO: add link to new project structure when updated -->

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

- extending the plugin Content-Types
- extending the plugin interface (e.g. to add controllers, services, policies, middlewares and more)

:::warning
New versions of Strapi are released with [migration guides](/developer-docs/latest/update-migration-guides/migration-guides.md), but these guides might not cover unexpected breaking changes in your plugin extensions. Consider forking a plugin if extensive customizations are required.
:::

## Extending a plugin's Content-Types

To overwrite a plugin's [Content-Types](/developer-docs/latest/development/backend-customization/models.md):

1. _(optional)_ Create the `./extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Create a `content-types` subfolder.
4. Inside the `content-types` subfolder, create another subfolder with the same name as the Content-Type to overwrite.
5. Inside this `content-types/name-of-content-type` subfolder, define the new schema for the Content-Type in a `schema.json` file (see [schema](/developer-docs/latest/development/backend-customization/models.md#model-schema) documentation).
6. _(optional)_ Repeat steps 4 and 5 for each Content-Type to overwrite.
<!-- ! The link to the `schema` section above won't work in this PR, but will work once the content is merged with the database PR -->

## Extending a plugin's interface

A plugin's interface can be extended using Strapi's programmatic APIs such as the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md) and the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md).

To extend a plugin's interface:

1. _(optional)_ Create the `./extensions` folder at the root of the app, if the folder does not already exist.
2. Create a subfolder with the same name as the plugin to be extended.
3. Depending on what needs to be extended:
    * create a `strapi-server.js` file to extend a plugin's back end using the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md)
    * or create a  `strapi-admin.js` file to extend the admin panel with the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md).
4. Within this file, define and export a function.  The function receives the `plugin` interface as an argument so it can be extended.

::: details Example of backend extension

<!-- ? is it `pluginConfig` or just `plugin` in the example below? -->
```js
// path: ./extensions/some-plugin-to-extend/strapi-server.js

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

## Understanding the Content-Types loading order

A plugin's Content-Types can be extended in 2 ways: using the programmatic interface within `.strapi-server.js` and by overriding the Content-Types schemas.

The final schema of the Content-Types depends on the following loading order:

1. the Content-Types of the original plugin,
2. the Content-Types overriden by the declarations in the [schema](/developer-docs/latest/development/backend-customization/models.md#model-schema) defined in `./extensions/plugin-name/content-types/content-type-name/schema.json`
3. the Content-Types declarations in the [`content-types` key exported from `.strapi-server.js`](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#content-types)
<!-- ! The link to the `schema` section above won't work in this PR, but will work once the content is merged with the database PR -->
