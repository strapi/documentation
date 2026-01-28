---
title: Amazon S3 provider
description: Learn how to configure the Amazon S3 provider for the Media Library 
displayed_sidebar: cmsSidebar
tags:
- media library
- configurations
- providers
---

import MediaLibProviderNotes from '/docs/snippets/media-library-providers-notes.md' 

# Amazon S3 provider

The [Media Library](/cms/features/media-library) feature is powered by a back-end server package called Upload which leverages the use of providers.

Strapi maintains 3 providers for the Media Library. The present page is about the Amazon S3 provider installation and configuration. For other providers, please refer to the list in the [Media Library page](/cms/features/media-library#providers).

## Installation

To install the official Strapi-maintained AWS S3 provider, run the following command in a terminal:

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

## Configuration

Providers configuration are defined in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist, you must create it. The provider configuration accepts the following entries:

* `provider` to define the provider name (i.e., `amazon-s3`)
* `providerOptions` to define options that are passed down during the construction of the provider (see <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property" text="AWS documentation"/> for the full list of options)
* `actionOptions` to define options that are passed directly to the parameters to each method respectively. The Official AWS documentation lists available options for <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property" text="upload/uploadStream"/> and <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property" text="delete"/>.

The following is an example configuration:

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

</Tabs>

If you're using the bucket as a CDN and deliver the content on a custom domain, you can get use of the `baseUrl` and `rootPath` properties and use environment configurations to define how your assets URLs will be saved inside Strapi.

<MediaLibProviderNotes/>

### Bucket CORS configuration

If you are planning on uploading content like GIFs and videos to your S3 bucket, you will want to edit its CORS configuration so that thumbnails are properly shown in Strapi. To do so, open your Bucket on the AWS console and locate the _Cross-origin resource sharing (CORS)_ field under the _Permissions_ tab, then amend the policies by writing your own JSON configuration, or copying and pasting the following one:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["YOUR STRAPI URL"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### Required AWS policy actions

The following are the minimum amount of permissions needed for AWS S3 provider to work:

```json
"Action": [
  "s3:PutObject",
  "s3:GetObject",
  "s3:ListBucket",
  "s3:DeleteObject",
  "s3:PutObjectAcl"
],
```

## Private AWS S3 provider

You can set up a private provider, meaning that every asset URL displayed in the Content Manager will be signed for secure access.

To create a private `aws-s3` provider:

1. Create a `/providers/aws-s3` folder in your application (see [local providers](/cms/configurations/media-library-providers#local-providers) for more information).
2. Implement the `isPrivate()` method in the `aws-s3` provider to return `true`.
3. Implement the `getSignedUrl(file)` method in the `aws-s3` provider to generate a signed URL for the given file.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/providers/aws-s3/index.js"
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
