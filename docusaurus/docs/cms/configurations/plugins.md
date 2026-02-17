---
title: Plugins configuration
sidebar_label: Plugins and providers
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

<Tldr>
`/config/plugins` enables or disables plugins and overrides their settings, with examples for local plugin development.
</Tldr>

Plugin configurations are stored in `/config/plugins.js|ts` (see [project structure](/cms/project-structure)). Each plugin can be configured with the following available parameters:

| Parameter                  | Description                                                                                                                                                            | Type    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `enabled`                  | Enable (`true`) or disable (`false`) an installed plugin                                                                                                               | Boolean |
| `config`<br/><br/>_Optional_ | Used to override default plugin configuration ([defined in strapi-server.js](/cms/plugins-development/server-api#configuration)) | Object  |
| `resolve`<br/> _Optional, only required for local plugins_             | Path to the plugin's folder                                                                                                                                            | String  |

:::note Configurations for core features and providers
* Some core features of Strapi have historically been implemented as core plugins. This explains that their configuration is still defined in the `/config/plugins` file despite not technically being plugins in Strapi 5 anymore. This includes:
  - the [Upload configuration](/cms/features/media-library#available-options) for the package which powers the Media Library, 
  - and the [Users & Permissions configuration](/cms/features/users-permissions#code-based-configuration).

  The detailed [GraphQL plugin configuration](/cms/plugins/graphql#code-based-configuration) is also documented in its dedicated plugin page.

* Additionally, providers configuration for the Media Library and the Email features are also defined in `/config/plugins`. Their configurations are detailed in the [Upload providers configuration](/cms/features/media-library#code-based-configuration) and the [Email providers configuration](/cms/features/email#providers).
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
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
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

export default config;
```

</TabItem>

</Tabs>

:::tip
If no specific configuration is required, a plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::