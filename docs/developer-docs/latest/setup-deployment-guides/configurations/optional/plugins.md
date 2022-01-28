---
title: Plugins configuration - Strapi Developer Docs
description: Strapi plugins have a single entry point file to define their configurations.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html
---

# Plugins configuration

The configurations for all plugins are stored in `./config/plugins.js` (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)). Each plugin can be configured with the following available parameters:

| Parameter                  | Description                                                                                                                                                            | Type    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `enabled`                  | Enable (`true`) or disable (`false`) an installed plugin                                                                                                               | Boolean |
| `config`<br><br>_Optional_ | Used to override default plugin configuration ([defined in strapi-server.js](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#configuration)) | Object  |
| `resolve`<br> _Optional, only required for local plugins_             | Path to the plugin's folder                                                                                                                                            | String  |

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  i18n: true,

  // enable a custom plugin
  myplugin: {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/my-local-plugin',
    config: {
      // user plugin config goes here
    },
  },

  // disable a plugin
  myotherplugin: {
    enabled: false, // plugin installed but disabled
  },
});
```

:::tip
If no specific configuration is required, a plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::

## GraphQL configuration

The [GraphQL plugin](/developer-docs/latest/plugins/graphql.md) has the following specific configuration options:

| Parameter      | Description                                                                                                                                                                     | Type      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `defaultLimit` | Default value for [the `pagination[limit]` parameter](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#pagination-by-offset) used in API calls | `Integer` |
| `maxLimit`     | Maximum value for [the `pagination[limit]` parameter](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#pagination-by-offset) used in API calls | `Integer` |

```js
// path: ./config/plugins.js

module.exports = () => ({
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 10,
      maxLimit: 20
    }
})
```
