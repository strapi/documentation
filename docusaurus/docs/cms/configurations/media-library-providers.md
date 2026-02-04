---
title: Media Library providers
description: Learn how to configure 3rd-party providers for the Media Library feature, or create your own.
displayed_sidebar: cmsSidebar
tags:
- media library
- customization
---

import MediaLibProvidersList from '/docs/snippets/media-library-providers-list.md'
import MediaLibProvidersNotes from '/docs/snippets/media-library-providers-notes.md'

# Media Library providers

The [Media Library](/cms/features/media-library) feature is powered by a back-end server package called Upload which leverages the use of providers.

By default Strapi provides a provider that uploads files to a local `public/uploads/` directory in your Strapi project. Additional providers are available and add an extension to the core capabilities of the plugin. Use them to upload your files to another location, such as AWS S3 or Cloudinary.

Strapi maintains official providers, discoverable via the <ExternalLink text="Marketplace" to="https://market.strapi.io/?types=provider"/>. Community-maintained providers are also available via <ExternalLink to="https://www.npmjs.com/search?q=strapi%20provider" text="npm"/>.

A provider can be configured to be [private](#private-providers) to ensure asset URLs will be signed for secure access.

## Installing providers

New providers can be installed using NPM or Yarn using the following format `@strapi/provider-<plugin>-<provider> --save`.

For example, to install the AWS S3 provider for the Media Library feature:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn add @strapi/provider-upload-aws-s3
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm install @strapi/provider-upload-aws-s3 --save
```

</TabItem>

</Tabs>

## Configuring providers

Newly installed providers are enabled and configured in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist, create it first.

Each provider will have different configuration settings available. Please review the respective entry for that provider on dedicated pages below for the Strapi-maintained providers, or on the provider's <ExternalLink text="Marketplace" to="https://market.strapi.io/?types=provider"/> page.

<MediaLibProvidersList />
<MediaLibProvidersNotes />


### Configuration per environment

When configuring your provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `/config/env/{env}/plugins.js|ts` configuration file and it will be used to overwrite the default configuration.

## Creating providers

To implement your own custom provider you must <ExternalLink to="https://docs.npmjs.com/creating-node-js-modules" text="create a Node.js module"/>.

The interface that must be exported depends on the plugin you are developing the provider for. The following are templates for the Upload (Media Library) and Email features:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        // delete the file in the provider
      },
      checkFileSize(file, { sizeLimit }) {
        // (optional)
        // implement your own file size limit logic
      },
      getSignedUrl(file) {
        // (optional)
        // Generate a signed URL for the given file.
        // The signed URL allows secure access to the file.
        // Only Content Manager assets will be signed.
        // Returns an object {url: string}.
      },
      isPrivate() {
        // (optional)
        // if it is private, file urls will be signed
        // Returns a boolean
      },
    };
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        // delete the file in the provider
      },
      checkFileSize(file, { sizeLimit }) {
        // (optional)
        // implement your own file size limit logic
      },
      getSignedUrl(file) {
        // (optional)
        // Generate a signed URL for the given file.
        // The signed URL allows secure access to the file.
        // Only Content Manager assets will be signed.
        // Returns an object {url: string}.
      },
      isPrivate() {
        // (optional)
        // if it is private, file urls will be signed
        // Returns a boolean
      },
    };
  },
};
```

</TabItem>

</Tabs>

In the send function you will have access to:

* `providerOptions` that contains configurations written in `plugins.js|ts`
* `settings` that contains configurations written in `plugins.js|ts`
* `options` that contains options you send when you call the send function from the email plugin service

You can review the <ExternalLink to="https://github.com/strapi/strapi/tree/main/packages/providers" text="Strapi-maintained providers"/> for example implementations.

After creating your new provider you can <ExternalLink to="https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages" text="publish it to npm"/> to share with the community or [use it locally](#local-providers) for your project only.

### Local providers

If you want to create your own provider without publishing it on npm you can follow these steps:

1. Create a `providers` folder in your application.
2. Create your provider (e.g. `/providers/strapi-provider-<plugin>-<provider>`)
3. Then update your `package.json` to link your `strapi-provider-<plugin>-<provider>` dependency to the <ExternalLink to="https://docs.npmjs.com/files/package.json#local-paths" text="local path"/> of your new provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-<plugin>-<provider>": "file:providers/strapi-provider-<plugin>-<provider>",
    ...
  }
}
```

4. Update your `/config/plugins.js|ts` file to [configure the provider](#configuring-providers).
5. Finally, run `yarn` or `npm install` to install your new custom provider.

### Private providers

You can set up a private provider, meaning that every asset URL displayed in the Content Manager will be signed for secure access.

To enable private providers, you must implement the `isPrivate()` method and return `true`.

In the backend, Strapi generates a signed URL for each asset using the `getSignedUrl(file)` method implemented in the provider. The signed URL includes an encrypted signature that allows the user to access the asset (but normally only for a limited time and with specific restrictions, depending on the provider).

Note that for security reasons, the content API will not provide any signed URLs. Instead, developers using the API should sign the urls themselves.

:::tip Private AWS S3 provider
You can find a short guide on how to create a private Amazon AWS S3 provider in the [dedicated documentation](/cms/configurations/media-library-providers/amazon-s3#private-aws-s3-provider).
:::
