---
title: Plugins configuration
sidebar_label: Plugins
displayed_sidebar: cmsSidebar
description: Strapi plugins have a single entry point file to define their configurations.
tags:
- additional configuration
- configuration
- GraphQL
- GraphQL configuration
- plugins
- Upload configuration
- Upload plugin

---

# Plugins configuration

> `/config/plugins` enables or disables plugins and overrides their settings, with examples for local plugin development.
<br/>

Plugin configurations are stored in `/config/plugins.js|ts` (see [project structure](/cms/project-structure)). Each plugin can be configured with the following available parameters:

| Parameter                  | Description                                                                                                                                                            | Type    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `enabled`                  | Enable (`true`) or disable (`false`) an installed plugin                                                                                                               | Boolean |
| `config`<br/><br/>_Optional_ | Used to override default plugin configuration ([defined in strapi-server.js](/cms/plugins-development/server-api#configuration)) | Object  |
| `resolve`<br/> _Optional, only required for local plugins_             | Path to the plugin's folder                                                                                                                                            | String  |

:::note
Some features of Strapi are provided by plugins and the following plugins can also have specific configuration options: the [GraphQL](/cms/plugins/graphql#code-based-configuration) plugin and the [Upload](/cms/features/media-library#available-options) package which powers the Media Library.
:::

**Basic example custom configuration for plugins:**

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

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
  'my-other-plugin': {
    enabled: false, // plugin installed but disabled
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default ({ env }) => ({
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
  'my-other-plugin': {
    enabled: false, // plugin installed but disabled
  },
});
```

</TabItem>

</Tabs>

:::tip
If no specific configuration is required, a plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::
