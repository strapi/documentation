---
title: Local upload provider
description: Learn how to configure the Local upload provider for the Media Library 
displayed_sidebar: cmsSidebar
tags:
- media library
- configurations
- providers
---

import MediaLibProviderNotes from '/docs/snippets/media-library-providers-notes.md' 

# Local Upload provider

The [Media Library](/cms/features/media-library) feature is powered by a back-end server package called Upload which leverages the use of providers.

Strapi maintains 3 providers for the Media Library. The present page is about the local Upload provider installation and configuration. For other providers, please refer to the list in the [Media Library page](/cms/features/media-library#providers).

## Installation

To install the provider, run the following command in a terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn add @strapi/provider-upload-local
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm install @strapi/provider-upload-local --save
```

</TabItem>

</Tabs>

## Configuration

Providers configuration are defined in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist, you must create it.  The provider configuration accepts the following entries:

* `provider` to define the provider name (i.e., `local`)
* `providerOptions` to define options that are passed down during the construction of the provider.

For the local Upload provider, `providerOptions` accepts only one parameter: `sizeLimit`, which must be a number. Be aware that the unit is in bytes, and the default is 1000000. When setting this value high, you should make sure to also configure the body parser middleware `maxFileSize` so the file can be sent and processed (see [Media Library documentation](/cms/features/media-library#max-file-size) for details).

The following is an example configuration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
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
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

As opposed to the AWS S3 and Cloudinary providers, special configuration of the security middleware is not required on the local Upload provider, since the default configuration allows loading images and media from `self`.
