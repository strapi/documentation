---
title: Plugins configuration
sidebar_label: Plugins
displayed_sidebar: devDocsSidebar
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

Plugin configurations are stored in `/config/plugins.js|ts` (see [project structure](/dev-docs/project-structure)). Each plugin can be configured with the following available parameters:

| Parameter                  | Description                                                                                                                                                            | Type    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `enabled`                  | Enable (`true`) or disable (`false`) an installed plugin                                                                                                               | Boolean |
| `config`<br/><br/>_Optional_ | Used to override default plugin configuration ([defined in strapi-server.js](/dev-docs/plugins/server-api#configuration)) | Object  |
| `resolve`<br/> _Optional, only required for local plugins_             | Path to the plugin's folder                                                                                                                                            | String  |

:::note
Some features of Strapi are provided by plugins and the following plugins can also have specific configuration options: [GraphQL](#graphql) and [Upload](#upload).
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

## GraphQL configuration {#graphql}

The GraphQL plugin configuration is described in its [dedicated documentation](/dev-docs/plugins/graphql#configuration).

## Upload configuration {#upload}

The [Upload plugin](/dev-docs/plugins/upload) handles the [Media Library](/user-docs/media-library). When using the default upload provider, the following specific configuration options can be declared in an `upload.config` object within the `config/plugins` file. All parameters are optional:

| Parameter                                   | Description                                                                                                         | Type    | Default |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `providerOptions.localServer`        | Options that will be passed to [koa-static](https://github.com/koajs/static) upon which the Upload server is build.<br/><br/>(See [local server configuration](/dev-docs/plugins/upload#local-server) in Upload documentation for additional details) | Object  | -       |
| `sizeLimit`                                  | Maximum file size in bytes.<br/><br/>(See [max file size configuration](/dev-docs/plugins/upload#max-file-size) in Upload plugin documentation for additional information) | Integer | `209715200`<br/><br/>(200 MB in bytes, i.e., 200 x 1024 x 1024 bytes) |
| `breakpoints`             | Allows to override the breakpoints sizes at which responsive images are generated when the "Responsive friendly upload" option is set to `true`.<br/><br/>(See [responsive images configuration](/dev-docs/plugins/upload#responsive-images) in Upload plugin documentation for additional information) | Object | `{ large: 1000, medium: 750, small: 500 }` |

:::note Notes
* Some configuration options can also be set directly from the Admin Panel (see [User Guide](/user-docs/settings/media-library-settings)).
* The Upload request timeout is defined in the server options, not in the Upload plugin options, as it's not specific to the Upload plugin but is applied to the whole Strapi server instance. See [upload request timeout configuration](/dev-docs/plugins/upload#upload-request-timeout) in the Upload documentation for additional details.
* When using a different upload provider, additional configuration options might be available. For Upload providers maintained by Strapi, see the [Amazon S3 provider](https://market.strapi.io/providers/@strapi-provider-upload-aws-s3) and [Cloudinary provider](https://market.strapi.io/providers/@strapi-provider-upload-cloudinary) documentations for additional information about available options.
:::

**Example custom configuration**:

The following is an example of a custom configuration for the Upload plugin when using the default upload provider:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

module.exports = ({ env })=>({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"

export default () => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
    },
  },
})
```

</TabItem>

</Tabs>
