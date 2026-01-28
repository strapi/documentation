---
title: Cloudinary provider
description: Learn how to configure the Cloudinary provider for the Media Library 
displayed_sidebar: cmsSidebar
tags:
- media library
- configurations
- providers
---

import MediaLibProviderNotes from '/docs/snippets/media-library-providers-notes.md' 

# Cloudinary provider

The [Media Library](/cms/features/media-library) feature is powered by a back-end server package called Upload which leverages the use of providers.

Strapi maintains 3 providers for the Media Library. The present page is about the <ExternalLink to="https://cloudinary.com/" text="Cloudinary" /> provider installation and configuration. For other providers, please refer to the list in the [Media Library page](/cms/features/media-library#providers).

## Installation

To install the official Strapi-maintained Cloudinary provider, run the following command in a terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn add @strapi/provider-upload-cloudinary
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm install @strapi/provider-upload-cloudinary --save
```

</TabItem>

</Tabs>

## Configuration

Providers configuration is defined in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist, create it first. The provider configuration accepts the following entries:

* `provider` to define the provider name (i.e., `cloudinary`)
* `providerOptions` to define options that are passed down during the construction of the provider (see <ExternalLink to="https://cloudinary.com/documentation/cloudinary_sdks#configuration_parameters" text="Cloudinary documentation"/> for the full list of options)
* `actionOptions` to define options that are passed directly to the parameters to each method respectively. The official Cloudinary documentation lists available options for <ExternalLink to="https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters" text="upload/uploadStream"/> and <ExternalLink to="https://cloudinary.com/documentation/image_upload_api_reference#destroy_optional_parameters" text="delete"/>.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

<MediaLibProviderNotes />
