---
title: Upload Provider
displayed_sidebar: cloudSidebar
description: Configure Strapi Cloud to use a third-party upload provider.
canonicalUrl: https://docs.strapi.io/cloud/advanced/upload.html
---

# Upload Provider

Strapi Cloud comes with a local upload provider out of the box. However, it can also be configured to utilize a third-party upload provider, if needed.

:::caution
Please be advised that Strapi are unable to provide support for third-party upload providers.
:::

:::prerequisites
- A local Strapi project running on `v4.8.2+`.
- Credentials for a third-party upload provider (see [Strapi Market](https://market.strapi.io/providers)).

:::
## Configuration

Configuring a third-party upload provider for use with Strapi Cloud requires three steps:

1.  Install the provider plugin in your local Strapi project.
2.  Configure the provider in your local Strapi project.
3.  Add environment variables to the Strapi Cloud project.

### Install the Provider Plugin
Using either `npm` or `yarn`, install the provider plugin in your local Strapi project as a package dependency by following the instructions in the respective entry for that provider in the [Marketplace](https://market.strapi.io/providers).


### Configure the Provider
>To configure a 3rd-party upload provider in your Strapi project, create or edit the plugins configuration file for your production environment `./config/env/production/plugins.js|ts` by adding upload configuration options as follows:



<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=./config/env/production/plugins.js

module.exports = ({ env }) => ({
// … some unrelated plugins configuration options
// highlight-start
upload: {
   config: {
      // … provider-specific upload configuration options go here
   }
// highlight-end
// … some other unrelated plugins configuration options
}
});
```
</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title=./config/env/production/plugins.ts

export default ({ env }) => ({
// … some unrelated plugins configuration options
// highlight-start
upload: {
   config: {
      // … provider-specific upload configuration options go here
   }
// highlight-end
// … some other unrelated plugins configuration options
}
});
```

</TabItem>
</Tabs>


Each provider will have different configuration settings available. Review the respective entry for that provider in the [Marketplace](https://market.strapi.io/providers).

Below are example configurations for the Upload plugins.

<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```js
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
</TabItem >
<TabItem value="amazon-s3" label="Amazon S3">

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL'),
        rootPath: env('CDN_ROOT_PATH'),
        s3Options: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
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
</Tabs>

## Security Middleware Configuration
Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library.

To do this in your Strapi project:
1. Navigate to `./config/middleware.js` or `./config/middleware.ts` in your Strapi project.
2. Replace the default `strapi::security` string with the object provided by the upload provider.

Examples of configuring the `contentSecurityPolicy` depending on upload provider:

<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```
</TabItem>
<TabItem value="amazon-s3" label="Amazon S3">

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```
</TabItem>
</Tabs>





:::caution
The upload provider must be installed as a package dependency in your Strapi project. For example, to use the Cloudinary upload provider, install the `@strapi/provider-upload-cloudinary` package.

For specific configuration information, see the [Marketplace](https://market.strapi.io/providers) entry for that provider.
:::



## Strapi Cloud Configuration
Before pushing changes to GitHub, add environment variables to the Strapi Cloud project:

1.  Log into Strapi Cloud and click on the corresponding project on the Projects page.
2.  Click on the **Settings** tab and choose **Variables** in the left menu.
3.  Add the required environment variables specific to the upload provider.
4.  Click **Save**.

### Cloudinary Example:

| Variable | Value |
| -------- | ----- |
| `CLOUDINARY_NAME` | your_cloudinary_name |
| `CLOUDINARY_KEY` | your_cloudinary_api_key |
| `CLOUDINARY_SECRET` | your_cloudinary_secret|

## Deployment

To deploy the project and utilize the third-party upload provider, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi Cloud project.

Once the application finishes building, the project will use the new upload provider.

:::strapi
For information on creating a custom upload provider, see the [Providers](/dev-docs/providers#creating-providers) documentation.
:::