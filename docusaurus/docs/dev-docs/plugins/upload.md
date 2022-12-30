---
title: Upload
displayed_sidebar: devDocsSidebar
description: Upload any kind of file on your server or external providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/upload.html
---

# Upload

The Upload plugin is the backend powering the Media Library plugin available by default in the Strapi admin panel. Using either the Media Library from the admin panel or the upload API directly, you can upload any kind of file for use in your Strapi application.

By default Strapi provides a [provider](/dev-docs/providers) that uploads files to a local directory. Additional providers are available should you want to upload your files to another location.

The providers maintained by Strapi include:

- [Amazon S3](https://market.strapi.io/providers/@strapi-provider-upload-aws-s3)
- [Cloudinary](https://market.strapi.io/providers/@strapi-provider-upload-cloudinary)
- [Local](https://www.npmjs.com/package/@strapi/provider-upload-local)

## Configuration

This section details configuration options for the default upload provider. If using another provider (e.g. AWS S3 or Cloudinary), see the available configuration parameters in that provider's documentation.

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for [koa-static](https://github.com/koajs/static).

You can provide them by creating or editing the `./config/plugins.js` file. The following example sets the `max-age` header.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

module.exports = ({ env })=>({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  },
});
```

</TabItem>

</Tabs>

### Max file size

Currently the Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 200MB in addition to provider options passed to the upload plugin for sizeLimit.

:::caution
You may also need to adjust any upstream proxies, load balancers, or firewalls to allow for larger file sizes.<br/>
(e.g. [Nginx](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size) has a config setting called `client_max_body_size` that will need to be adjusted since it's default is only 1mb.)
:::
