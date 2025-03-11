---
title: Upload Provider
displayed_sidebar: cloudSidebar
description: Configure Strapi Cloud to use a third-party upload provider.
canonicalUrl: https://docs.strapi.io/cloud/advanced/upload.html
tags:
- configuration
- upload provider
- provider
- plugins
- middlewares
- Strapi Cloud
- Strapi Cloud configuration
- Strapi Cloud project
---

# Upload Provider

Strapi Cloud comes with a local upload provider out of the box. However, it can also be configured to utilize a third-party upload provider, if needed.

:::caution
Please be advised that Strapi are unable to provide support for third-party upload providers.
:::

:::prerequisites

- A local Strapi project running on `v4.8.2+`.
- Credentials for a third-party upload provider (see <ExternalLink to="https://market.strapi.io/providers" text="Strapi Market"/>).

:::

## Configuration

Configuring a third-party upload provider for use with Strapi Cloud requires 4 steps:

1. Install the provider plugin in your local Strapi project.
2. Configure the provider in your local Strapi project.
3. Configure the Security Middleware in your local Strapi project.
4. Add environment variables to the Strapi Cloud project.

### Install the Provider Plugin

Using either `npm` or `yarn`, install the provider plugin in your local Strapi project as a package dependency by following the instructions in the respective entry for that provider in the <ExternalLink to="https://market.strapi.io/providers" text="Marketplace"/>.

### Configure the Provider

To configure a 3rd-party upload provider in your Strapi project, create or edit the plugins configuration file for your production environment `./config/env/production/plugins.js|ts` by adding upload configuration options as follows:

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

:::caution
The file structure must match the above path exactly, or the configuration will not be applied to Strapi Cloud.
:::

Each provider will have different configuration settings available. Review the respective entry for that provider in the <ExternalLink to="https://market.strapi.io/providers" text="Marketplace"/>.

**Example:**
<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">
<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```js title=./config/env/production/plugins.js
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

```js title=./config/env/production/plugins.js
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
</TabItem>
<TabItem value="ts" label="TypeScript">
<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```ts title=./config/env/production/plugins.ts
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

</TabItem >
<TabItem value="amazon-s3" label="Amazon S3">

```ts title=./config/env/production/plugins.ts
export default ({ env }) => ({
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
</TabItem>
</Tabs>

### Configure the Security Middleware

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library.

To do this in your Strapi project:

1. Navigate to `./config/middleware.js` or `./config/middleware.ts` in your Strapi project.
2. Replace the default `strapi::security` string with the object provided by the upload provider.

**Example:**
<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">
<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```js title=./config/middleware.js
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
            'res.cloudinary.com'
          ],
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

```js title=./config/middleware.js
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
</TabItem>
<TabItem value="ts" label="TypeScript">
<Tabs groupId="upload-examples" >
<TabItem value="cloudinary" label="Cloudinary">

```ts title=./config/middleware.ts
export default [
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
            'res.cloudinary.com'
          ],
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

```ts title=./config/middleware.ts
export default [
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
</TabItem>
</Tabs>

:::tip
Before pushing the above changes to GitHub, add environment variables to the Strapi Cloud project to prevent triggering a rebuild and new deployment of the project before the changes are complete.
:::

### Strapi Cloud Configuration

1. Log into Strapi Cloud and click on the corresponding project on the Projects page.
2. Click on the **Settings** tab and choose **Variables** in the left menu.
3. Add the required environment variables specific to the upload provider.
4. Click **Save**.

**Example:**

<Tabs groupId="env-var">
<TabItem value="cloudinary" label="Cloudinary">

| Variable            | Value                   |
|---------------------|-------------------------|
| `CLOUDINARY_NAME`   | your_cloudinary_name    |
| `CLOUDINARY_KEY`    | your_cloudinary_api_key |
| `CLOUDINARY_SECRET` | your_cloudinary_secret  |

</TabItem>
<TabItem value="amazon-s3" label="Amazon S3">

| Variable            | Value                  |
|---------------------|------------------------|
| `AWS_ACCESS_KEY_ID` | your_aws_access_key_id |
| `AWS_ACCESS_SECRET` | your_aws_access_secret |
| `AWS_REGION`        | your_aws_region        |
| `AWS_BUCKET`        | your_aws_bucket        |
| `CDN_URL`           | your_cdn_url           |
| `CDN_ROOT_PATH`     | your_cdn_root_path     |

</TabItem>
</Tabs>

## Deployment

To deploy the project and utilize the third-party upload provider, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi Cloud project.

Once the application finishes building, the project will use the new upload provider.

:::strapi Custom Provider
If you want to create a custom upload provider, please refer to the [Providers](/cms/providers#creating-providers) documentation in the Developer Documentation.
:::
