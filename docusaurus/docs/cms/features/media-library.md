---
title: Media Library
sidebar_position: 1
description: Learn to use the Media Library which allows to display and manage all assets uploaded in the application.
toc_max_heading_level: 5
tags:
- admin panel
- features
- media library
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Media Library

The <Icon name="images" /> Media Library is the Strapi feature that displays all assets uploaded in the Strapi application and allows users to manage them.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Minimum "Access the Media Library" permission in Roles > Plugins - Upload</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="mk6z26zaqp" darkId="9r2m74otok"/>

## Configuration

Some configuration options for the Media Library are available in the admin panel, and some are handled via your Strapi project's code.

### Admin panel configuration

In the admin panel, some Media Library settings are available via the Global Settings to manage the format, file size, and orientation of uploaded assets. It is also possible, directly via the Media Library to configure the view.

#### Configuring settings

**Path to configure the feature:** <Icon name="gear-six" /> Settings > Global Settings > Media Library.

1. Define your chosen new Media Library settings:
    | Setting name   | Instructions   | Default value |
    | -------------------------- | ----------------------- |---------------|
    | Responsive friendly upload | Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset.<br/>Default sizes for each format can be [configured through the code](#responsive-images). | True          |
    | Size optimization          | Enabling this option will reduce the image size and slightly reduce its quality.                     | True          |
    | Auto orientation           | Enabling this option will automatically rotate the image according to EXIF orientation tag.          | False         |
2. Click on the **Save** button.

<ThemedImage
  alt="Media Library settings"
  sources={{
    light: '/img/assets/settings/settings_media-library.png',
    dark: '/img/assets/settings/settings_media-library_DARK.png',
  }}
/>

#### Configuring the view

**Path to configure the feature:** <Icon name="images" /> Media Library

1. Click on the <Icon name="gear-six" /> button just above the list of folders and assets, on the right side of the interface.
2. Configure the Media Library view, following the instructions below:
    | Setting name              | Instructions                                                              |
    | ------------------------- | ------------------------------------------------------------------------- |
    | Entries per page          | Use the dropdown to define the number of assets displayed by default per page. |
    | Default sort order        | Use the dropdown to define the default order in which assets are displayed. This can be overriden when sorting assets in the Media Library. |

:::note
Both settings are used as the defaults in the Media Library and in the Content Manager's media upload modal. These settings are global across the entire Strapi project for all users.
:::

<ThemedImage
  alt="Configure the view"
  sources={{
    light: '/img/assets/media-library/media-library_configure-the-view.png',
    dark: '/img/assets/media-library/media-library_configure-the-view_DARK.png',
  }}
/>

### Code-based configuration

The Media Library is powered in the backend server by the Upload package, which can be configured and extended through providers.

#### Additional providers

By default Strapi provides a provider that uploads files to a local `public/uploads/` directory in your Strapi project. Additional providers are available should you want to upload your files to another location.

The providers maintained by Strapi are the following. Clicking on a card will redirect you to their Strapi Marketplace or npm page:

<CustomDocCardsWrapper>
<CustomDocCard 
  icon="shopping-cart" 
  title="Amazon S3" 
  description="Official provider for file uploads to Amazon S3."
  link="https://market.strapi.io/providers/@strapi-provider-upload-aws-s3"
/>
<CustomDocCard 
  icon="shopping-cart" 
  title="Cloudinary" 
  description="Official provider for media management with Cloudinary."
  link="https://market.strapi.io/providers/@strapi-provider-upload-cloudinary"
/>
<CustomDocCard 
  icon="shopping-cart" 
  title="Local" 
  description="Default provider for storing files locally on the server."
  link="https://www.npmjs.com/package/@strapi/provider-upload-local"
/>
</CustomDocCardsWrapper>

:::info
Code-based configuration instructions on the present page detail options for the default upload provider. If using another provider, please refer to the available configuration parameters in that provider's documentation.
:::

Providers add an extension to the core capabilities of the plugin, for example to upload media files to AWS S3 instead of the local server, or using Amazon SES for emails instead of Sendmail.

There are both official providers maintained by Strapi — discoverable via the [Marketplace](/cms/plugins/installing-plugins-via-marketplace) — and many community maintained providers available via <ExternalLink to="https://www.npmjs.com/" text="npm"/>.

A provider can be configured to be [private](#private-providers) to ensure asset URLs will be signed for secure access.

##### Installing providers

New providers can be installed using `npm` or `yarn` using the following format `@strapi/provider-<plugin>-<provider> --save`.

For example, to install the AWS S3 provider for the Upload (Media Library) feature::

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

##### Configuring providers

Newly installed providers are enabled and configured in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist you must create it.

Each provider will have different configuration settings available. Review the respective entry for that provider in the [Marketplace](/cms/plugins/installing-plugins-via-marketplace) or <ExternalLink to="https://www.npmjs.com/" text="npm"/> to learn more.

The following is an example configuration for an AWS S3 Media Library provider:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL'),
        rootPath: env('CDN_ROOT_PATH'),
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION'),
          params: {
            ACL: env('AWS_ACL', 'public-read'),
            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
            Bucket: env('AWS_BUCKET'),
          },
        },
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
      provider: 'aws-s3', // For community providers pass the full package name (e.g. provider: 'strapi-provider-upload-google-cloud-storage')
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          ACL: env('AWS_ACL', 'public-read'), // 'private' if you want to make the uploaded files private
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

:::note Notes
* Strapi has a default [`security` middleware](/cms/configurations/middlewares#security) that has a very strict `contentSecurityPolicy` that limits loading images and media to `"'self'"` only, see the example configuration on the <ExternalLink to="https://www.npmjs.com/package/@strapi/provider-upload-aws-s3" text="provider page"/> or the [middleware documentation](/cms/configurations/middlewares#security) for more information.
* When using a different provider per environment, specify the correct configuration in `/config/env/${yourEnvironment}/plugins.js|ts` (See [Environments](/cms/configurations/environment)).
* Only one email provider will be active at a time. If the email provider setting isn't picked up by Strapi, verify the `plugins.js|ts` file is in the correct folder.
* When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template defaults to `no-reply@strapi.io` and needs to be updated according to your email provider, otherwise it will fail the test (See [Configure templates locally](/cms/features/users-permissions#templating-emails)).

:::

###### Configuration per environment

When configuring your provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `/config/env/{env}/plugins.js|ts` configuration file and it will be used to overwrite the default configuration.

##### Creating providers

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

You can review the <ExternalLink to="https://github.com/strapi/strapi/tree/master/packages/providers" text="Strapi-maintained providers"/> for example implementations.

After creating your new provider you can <ExternalLink to="https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages" text="publish it to npm"/> to share with the community or [use it locally](#local-providers) for your project only.

###### Local providers

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

###### Private providers

You can set up a private provider, meaning that every asset URL displayed in the Content Manager will be signed for secure access.

To enable private providers, you must implement the `isPrivate()` method and return `true`.

In the backend, Strapi generates a signed URL for each asset using the `getSignedUrl(file)` method implemented in the provider. The signed URL includes an encrypted signature that allows the user to access the asset (but normally only for a limited time and with specific restrictions, depending on the provider).

Note that for security reasons, the content API will not provide any signed URLs. Instead, developers using the API should sign the urls themselves.

**Example**

To create a private `aws-s3` provider:

1. Create a `/providers/aws-s3` folder in your application. See [Local Providers](#local-providers) for more information.
2. Implement the `isPrivate()` method in the `aws-s3` provider to return `true`.
3. Implement the `getSignedUrl(file)` method in the `aws-s3` provider to generate a signed URL for the given file.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/providers/aws-s3/index.js"
// aws-s3 provider

module.exports = {
  init: (config) => {
    const s3 = new AWS.S3(config);

    return {
      async upload(file) {
        // code to upload file to S3
      },

      async delete(file) {
        // code to delete file from S3
      },

      async isPrivate() {
        return true;
      },

      async getSignedUrl(file) {
        const params = {
          Bucket: config.params.Bucket,
          Key: file.path,
          Expires: 60, // URL expiration time in seconds
        };

        const signedUrl = await s3.getSignedUrlPromise("getObject", params);
        return { url: signedUrl };
      },
    };
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/providers/aws-s3/index.ts"
// aws-s3 provider

export = {
  init: (config) => {
    const s3 = new AWS.S3(config);

    return {
      async upload(file) {
        // code to upload file to S3
      },

      async delete(file) {
        // code to delete file from S3
      },

      async isPrivate() {
        return true;
      },

      async getSignedUrl(file) {
        const params = {
          Bucket: config.params.Bucket,
          Key: file.path,
          Expires: 60, // URL expiration time in seconds
        };

        const signedUrl = await s3.getSignedUrlPromise("getObject", params);
        return { url: signedUrl };
      },
    };
  },
};
```

</TabItem>

</Tabs>

#### Available options

When using the default upload provider, the following specific configuration options can be declared in an `upload.config` object within [the `config/plugins` file](/cms/configurations/plugins). All parameters are optional:

| Parameter                                   | Description                                                                                                         | Type    | Default |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `providerOptions.localServer`        | Options that will be passed to <ExternalLink to="https://github.com/koajs/static" text="koa-static"/> upon which the Upload server is build (see [local server configuration](#local-server)) | Object  | -       |
| `sizeLimit`                                  | Maximum file size in bytes (see [max file size](#max-file-size)) | Integer | `209715200`<br/><br/>(200 MB in bytes, i.e., 200 x 1024 x 1024 bytes) |
| `breakpoints`             | Allows to override the breakpoints sizes at which responsive images are generated when the "Responsive friendly upload" option is set to `true` (see [responsive images](#responsive-images)) | Object | `{ large: 1000, medium: 750, small: 500 }` |

:::note
The Upload request timeout is defined in the server options, not in the Upload plugin options, as it's not specific to the Upload plugin but is applied to the whole Strapi server instance (see [upload request timeout](#upload-request-timeout)).
:::

#### Example custom configuration

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

#### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for <ExternalLink to="https://github.com/koajs/static" text="koa-static"/>.

You can provide them by creating or editing [the `/config/plugins` file](/cms/configurations/plugins). The following example sets the `max-age` header:

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
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
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

#### Max file size

The Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 200MB. This must be done in addition to provider options passed to the Upload package for `sizeLimit`.

:::caution
You may also need to adjust any upstream proxies, load balancers, or firewalls to allow for larger file sizes. For instance, <ExternalLink to="http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size" text="Nginx"/> has a configuration setting called `client_max_body_size` that must be adjusted, since its default is only 1mb.
:::

The middleware used by the Upload package is [the `body` middleware](/cms/configurations/middlewares#body). You can pass configuration to the middleware directly by setting it in the `/config/middlewares` file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/middlewares.js"
module.exports = [
  // ...
  {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: 250 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  // ...
];
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/middlewares.ts"
export default [
  // ...
  {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: 250 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  // ...
];
```

</TabItem>

</Tabs>

In addition to the middleware configuration, you can pass the `sizeLimit`, which is an integer in bytes, in the [/config/plugins file](/cms/configurations/plugins):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
    }
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/plugins.ts"
export default {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
    }
  }
};
```

</TabItem>

</Tabs>

#### Upload request timeout

By default, the value of `strapi.server.httpServer.requestTimeout` is set to 330 seconds. This includes uploads.

To make it possible for users with slow internet connection to upload large files, it might be required to increase this timeout limit. The recommended way to do it is by setting the `http.serverOptions.requestTimeout` parameter in [the `config/servers` file](/cms/configurations/server).

An alternate method is to set the `requestTimeout` value in [the `bootstrap` function](/cms/configurations/functions#bootstrap) that runs before Strapi gets started. This is useful in cases where it needs to change programmatically—for example, to temporarily disable and re-enable it:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/index.js"
module.exports = {

  //...

  bootstrap({ strapi }) {
    // Set the requestTimeout to 1,800,000 milliseconds (30 minutes):
    strapi.server.httpServer.requestTimeout = 30 * 60 * 1000;
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/index.ts"
export default {

  //...

  bootstrap({ strapi }) {
    // Set the requestTimeout to 1,800,000 milliseconds (30 minutes):
    strapi.server.httpServer.requestTimeout = 30 * 60 * 1000;
  },
};
```

</TabItem>

</Tabs>

#### Responsive Images

When the [`Responsive friendly upload` admin panel setting](#admin-panel-configuration) is enabled, the plugin will generate the following responsive image sizes:

| Name    | Largest dimension |
| :------ | :--------- |
| large   | 1000px     |
| medium  | 750px      |
| small   | 500px      |

These sizes can be overridden in `/config/plugins`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  upload: {
    config: {
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

```js title="/config/plugins.ts"
export default ({ env }) => ({
  upload: {
    config: {
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

</Tabs>

:::caution
Breakpoint changes will only apply to new images, existing images will not be resized or have new sizes generated.
:::

## Usage

**Path to use the feature:** <Icon name="images" /> Media Library

The Media Library displays all assets uploaded in the application, either via the <Icon name="images" /> Media Library itself or via the <Icon name="feather" /> Content Manager when managing a media field.

Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/cms/features/content-manager#creating--writing-content).

<ThemedImage
  alt="Media Library overview, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_overview2.png',
    dark: '/img/assets/media-library/media-library_overview2_DARK.png',
  }}
/>

From the Media Library, it is possible to:

- upload a new asset (see [adding assets](/cms/features/media-library#adding-assets)) or create a new folder (see [organizing assets with folders](/cms/features/media-library#organizing-assets-with-folders)) <ScreenshotNumberReference number="1" />,
- sort the assets and folders or set filters <ScreenshotNumberReference number="2" /> to find assets and folders more easily,
- toggle between the list view <Icon name="list" classes="ph-bold"/> and the grid view <Icon name="squares-four"/> to display assets, access settings <Icon name="gear-six" /> to [configure the view](#configuring-the-view), and make a textual search <Icon name="magnifying-glass" classes="ph-bold" /> <ScreenshotNumberReference number="3" /> to find a specific asset or folder,
- and view, navigate through, and manage folders <ScreenshotNumberReference number="4" />.

:::tip
Click the search icon <Icon name="magnifying-glass" classes="ph-bold" /> on the right side of the user interface to use a text search and find one of your assets or folders more quickly!
:::

<!--
### Filtering assets

Right above the list of folders and assets, on the left side of the interface, a !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button is displayed. It allows setting one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the assets that match all the conditions will be displayed).

<ThemedImage
  alt="Filters"
  sources={{
    light: '/img/assets/media-library/media-library_filters.png',
    dark: '/img/assets/media-library/media-library_filters_DARK.png',
  }}
/>

To set a new filter:

1. Click on the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. For conditions based on the type of asset to filter, click on the 3rd drop-down list and choose a file type to include or exclude. For conditions based on date and time (i.e. _createdAt_ or _updatedAt_ fields), click on the left field to select a date and click on the right field to select a time.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button. They can be removed by clicking on the delete icon <Icon name="x" />.
:::
-->

<!--
### Sorting assets

<ThemedImage
  alt="Sort"
  sources={{
    light: '/img/assets/media-library/media-library_sort.png',
    dark: '/img/assets/media-library/media-library_sort_DARK.png',
  }}
/>

Just above the list of folders and assets and next to the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button, on the left side of the interface, a drop-down button is displayed. It allows to sort the assets by upload date, alphabetical order or date of update. Click on the drop-down button and select an option in the list to automatically display the sorted assets.
-->

### Adding assets

<details>
<summary>List of media types and extensions supported by the Media Library</summary>

| Media type | Supported extensions                                            |
| ---------- | --------------------------------------------------------------- |
| Image      | - JPEG<br />- PNG<br />- GIF<br />- SVG<br />- TIFF<br />- ICO<br />- DVU   |
| Video      | - MPEG<br />- MP4<br />- MOV (Quicktime)<br />- WMV<br />- AVI<br />- FLV |
| Audio      | - MP3<br />- WAV<br />- OGG                                         |
| File       | - CSV<br />- ZIP<br />- PDF<br />- XLS, XLSX<br />- JSON                |
<br/>

</details>

1. Click the **Add new assets** button in the upper right corner of the Media Library.
2. Choose whether you want to upload the new asset from your computer or from an URL:
    - from the computer, either drag & drop the asset directly or browse files on your system,
    - from an URL, type or copy and paste an URL(s) in the _URL_ field, making sure multiple URLs are separated by carriage returns, then click **Next**.
3. (optional) Click the edit button <Icon name="pencil-simple" /> to view asset metadata and define a _File name_, _Alternative text_ and a _Caption_ for the asset (see [Managing individual assets](#managing-assets)).
4. (optional) Add more assets by clicking **Add new assets** and going back to step 2.
5. Click on **Upload assets to the library**.

<ThemedImage
  alt="Add new assets window"
  sources={{
    light: '/img/assets/media-library/media-library_add-new-assets.png',
    dark: '/img/assets/media-library/media-library_add-new-assets_DARK.png',
  }}
/>

### Managing individual assets {#managing-assets}

The Media Library allows managing assets, which includes modifying assets' file details and location, downloading and copying the link of the assets file, and deleting assets. Image files can also be cropped.

#### Editing assets

Click on the edit <Icon name="pencil-simple" /> button of an asset to open up the "Details" window, where all the available asset management options are available.

<ThemedImage
  alt="Annotated asset details window screenshot"
  sources={{
    light: '/img/assets/media-library/media-library_asset-details.png',
    dark: '/img/assets/media-library/media-library_asset-details_DARK.png',
  }}
/>

- On the left, above the preview of the asset, control buttons <ScreenshotNumberReference number="1" /> allow performing various actions:
  - click on the delete button <Icon name="trash" /> to delete the asset,
  - click on the download button <Icon name="download-simple"  /> to download the asset,
  - click on the copy link button <Icon name="link" classes="ph-bold" /> to copy the asset's link to the clipboard,
  - optionally, click on the crop button <Icon name="crop" classes="ph-bold" /> to enter cropping mode for the image (see [Cropping images](#cropping-images)).
- On the right, meta data for the asset is displayed at the top of the window <ScreenshotNumberReference number="2" /> and the fields below can be used to update the _File name_, _Alternative text_, _Caption_ and _Location_ (see [Organizing assets with folders](#organizing-assets-with-folders)) for the asset <ScreenshotNumberReference number="3" />.
- At the bottom, the **Replace Media** button <ScreenshotNumberReference number="4" /> can be used to replace the asset file but keep the existing content of the other editable fields, and the **Finish** button is used to confirm any updates to the fields.

#### Moving assets

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be moved.
2. In the window that pops up, click the _Location_ field and choose a different folder from the drop-down list.
3. Click **Save** to confirm.

:::note
Assets can also be moved to other folders from the main view of the Media Library (see [Organizing assets with folders](#organizing-assets-with-folders)). This includes the ability to move several assets simultaneously.
:::

#### Cropping images

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be cropped.
2. In the window that pops up, click the crop button <Icon name="crop" classes="ph-bold" /> to enter cropping mode.
3. Crop the image using handles in the corners to resize the frame. The frame can also be moved by drag & drop.
4. Click the crop <Icon name="check" classes="ph-bold" /> button to validate the new dimensions, and choose either to **crop the original asset** or to **duplicate & crop the asset** (i.e. to create a copy with the new dimensions while keeping the original asset untouched). Alternatively, click the stop cropping <Icon name="x" classes="ph-bold" /> button to cancel and quit cropping mode.
<!-- TODO: ask devs because there seems to be a bug/unintuitive behavior:  choosing crop the original asset does not quit cropping mode 😅  -->
5. Click **Finish** to save changes to the file.

#### Deleting assets

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be deleted.
2. In the window that pops up, click the delete button <Icon name="trash" /> in the control buttons bar above the asset's preview.
3. Click **Confirm**.

:::tip
Assets can also be deleted individually or in bulk from the main view of the Media Library. Select assets by clicking on their checkbox in the top left corner, then click the Delete icon <Icon name="trash" /> at the top of the window, below the filters and sorting options.
:::

### Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. Folders sit at the top of the Media Library view or are accessible from the Media field popup when using the [Content Manager](/cms/features/content-manager).

From the Media Library, it is possible to view the list of folders and browse a folder's content, create new folders, edit an existing folder, move assets to a folder, and delete a folder.

:::note
Folders follow the permission system of assets (see [Users & Permissions feature](/cms/features/users-permissions)). It is not yet possible to define specific permissions for a folder.
:::

By default, the Media Library displays folders and assets created at the root level. Clicking a folder navigates to this folder, and displays the following elements:

- the folder title and breadcrumbs to navigate to a parent folder <ScreenshotNumberReference number="1" />
- the subfolders <ScreenshotNumberReference number="2" /> the current folder contains
- all assets <ScreenshotNumberReference number="3" /> from this folder

<ThemedImage
  alt="Media library one folder deep, with back button and updated folder title"
  sources={{
    light: '/img/assets/media-library/media-library_folder-content.png',
    dark: '/img/assets/media-library/media-library_folder-content_DARK.png',
  }}
/>

From this dedicated folder view, folders and assets can be managed, filtered, sorted and searched just like from the main Media Library.

To navigate back to the parent folder, one level up, use the **Back** button at the top of the interface.

:::tip
The breadcrumb navigation can also be used to go back to a parent folder: click on a folder name to directly jump to it or click on the 3 dots `/img.` and select a parent folder from the drop-down list.
:::

#### Adding folders

1. Click on **Add new folder** in the upper right of the Media Library interface.
2. In the window that pops up, type a name for the new folder in the _Name_ field.
3. (optional) In the _Location_ drop-down list, choose a location for the new folder. The default location is the active folder.
4. Click **Create**.

:::note
There is no limit to how deep your folders hierarchy can go, but bear in mind it might take some effort to reach a deeply nested subfolder, as the Media Library currently has no visual hierarchy indication. Searching for files using the <Icon name="magnifying-glass" classes="ph-bold" /> on the right side of the user interface might be a faster alternative to finding the asset you are looking for.
:::

#### Moving assets to a folder

Assets and folders can be moved to another folder from the root view of the Media Library or from any view for a dedicated folder.

1. Select assets and folder to be moved, by clicking the checkbox on the left of the folder name or clicking the asset itself.
2. Click the <Icon name="folder" /> **Move** button at the top of the interface.
3. In the _Move elements to_ pop-up window, select the new folder from the _Location_ drop-down list.
4. Click **Move**.

<ThemedImage
  alt="'Move elements to' popup"
  sources={{
    light: '/img/assets/media-library/media-library_move-assets.png',
    dark: '/img/assets/media-library/media-library_move-assets_DARK.png',
  }}
/>

#### Editing folders

Once created, a folder can be renamed, moved or deleted.

1. In the Folders part of the Media library, hover the folder to be edited and click its edit button <Icon name="pencil-simple" />.
2. In the window that pops up, update the name and location with the _Name_ field and _Location_ drop-down list, respectively.
3. Click **Save**.

#### Deleting folders

Deleting a folder can be done either from the list of folders of the Media Library, or when editing a single folder.

1. Click the checkbox on the left of the folder name. Multiple folders can be selected.
2. Click the <Icon name="trash" /> **Delete** button above the Folders list.
3. In the _Confirmation_ dialog, click **Confirm**.

:::note
A single folder can also be deleted when editing it: hover the folder, click on its edit icon <Icon name="pencil-simple" />, and in the window that pops up, click the **Delete folder** button and confirm the deletion.
:::

### Usage with the REST API

The Media Library feature has some endpoints that can accessed through Strapi's REST API:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Upload with the REST API" description="Learn how to use the Strapi's REST API to upload files through your code." link="/cms/api/rest/upload"/>
</CustomDocCardsWrapper>
