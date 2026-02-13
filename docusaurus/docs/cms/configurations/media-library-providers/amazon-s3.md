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

<Tldr>

The `@strapi/provider-upload-aws-s3` package lets you store Media Library assets on Amazon S3 or any S3-compatible service (Cloudflare R2, Scaleway, MinIO, etc.). This page covers provider configuration, required AWS setup (IAM, CORS, middleware), and extended options such as encryption, checksums, and signed URLs for private buckets.

</Tldr>

The [Media Library](/cms/features/media-library) feature is powered by a back-end server package called Upload which leverages the use of providers.

Strapi maintains 3 providers for the Media Library. The present page is about the Amazon S3 provider installation and configuration. It covers basic and private bucket configuration, required AWS setup (IAM, CORS, middleware), S3-compatible services, and extended options such as encryption and checksums. For other providers, please refer to the list in the [Media Library page](/cms/features/media-library#providers).

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

Providers configuration is defined in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist, create it first. The provider configuration accepts the following entries:

* `provider` to define the provider name (i.e., `amazon-s3`)
* `providerOptions` to define options that are passed down during the construction of the provider (see <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property" text="AWS documentation"/> for the full list of options)
* `actionOptions` to define options that are passed directly to the parameters to each method respectively. The official AWS documentation lists available options for <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property" text="upload/uploadStream"/> and <ExternalLink to="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property" text="delete"/>.

### Basic example

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

If you use the bucket as a CDN and deliver the content on a custom domain, you can use the `baseUrl` and `rootPath` properties. Use environment configurations to define how your asset URLs will be saved inside Strapi.

:::tip AWS SDK V3 URL format
The provider uses AWS SDK V3, which defaults to <ExternalLink to="https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted-style-access" text="virtual-hosted-style URIs"/> for S3 URLs. To use path-style URLs instead, set `baseUrl` explicitly:

```js
baseUrl: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET}`,
```

:::

<MediaLibProviderNotes/>

:::caution
To ensure the provider works correctly, you also need to configure IAM permissions, bucket CORS, and the Strapi security middleware. See [Required setup](#required-setup).
:::

### Private bucket and signed URLs

If your bucket is configured to be private, set the `ACL` option to `private` in the `params` object. This ensures file URLs are signed.

You can define the expiration time of the signed URL by setting the `signedUrlExpires` option in the `params` object. The default value is 15 minutes.

:::note
If you are using a CDN, the URLs will not be signed.
:::

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION'),
          params: {
            ACL: 'private', // <== set ACL to private
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

## Required setup

### IAM policy actions

The following are the minimum amount of permissions needed for the AWS S3 provider to work:

```json
"Action": [
  "s3:PutObject",
  "s3:GetObject",
  "s3:ListBucket",
  "s3:DeleteObject",
  "s3:PutObjectAcl"
],
```

### Bucket CORS configuration

To display thumbnails for GIFs and videos uploaded to S3, edit your bucket's CORS configuration so that thumbnails are properly shown in Strapi. To do so:

1. Open your bucket in the AWS console.
2. Navigate to the _Permissions_ tab.
3. Locate the _Cross-origin resource sharing (CORS)_ field.
4. Add the following CORS policy (or adapt it to your needs):

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

### Security middleware configuration

The default Strapi Security Middleware settings block S3 thumbnail previews in the Media Library. Modify the `contentSecurityPolicy` settings to allow loading media from your S3 bucket. Replace the `strapi::security` string with the following object (see [middleware configuration](/cms/configurations/middlewares) for details):

```js title="/config/middlewares.js"
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

If your bucket name contains dots and `forcePathStyle` is `false`, S3 uses directory-style URLs (e.g., `s3.yourRegion.amazonaws.com/your.bucket.name/image.jpg`). In this case, use `s3.yourRegion.amazonaws.com` (without the bucket name) for the `img-src` and `media-src` directives.

## S3-compatible services

This plugin works with S3-compatible services by using the `endpoint` option. The provider automatically constructs correct URLs for S3-compatible services that return incorrect `Location` formats for multipart uploads (e.g., IONOS, MinIO).

:::caution
Some providers require `forcePathStyle: true` in the `s3Options`. This option is needed when the provider does not support virtual-hosted-style URLs (e.g., `bucket.endpoint.com`), and instead uses path-style URLs (e.g., `endpoint.com/bucket`).
:::

| Provider            | `forcePathStyle` | `ACL`             | Notes                             |
| ------------------- | ---------------- | ----------------- | --------------------------------- |
| IONOS               | `true`           | Supported         | Multipart Location bug auto-fixed |
| MinIO               | `true`           | Supported         |                                   |
| Contabo             | `true`           | Supported         |                                   |
| Hetzner             | `true`           | Supported         |                                   |
| DigitalOcean Spaces | Not needed       | Supported         |                                   |
| Wasabi              | Not needed       | Supported         |                                   |
| Scaleway            | Not needed       | Supported         |                                   |
| Vultr               | Not needed       | Supported         |                                   |
| Backblaze B2        | Not needed       | Supported         |                                   |
| Cloudflare R2       | Not needed       | **Not supported** | Omit `ACL` from params            |

### Scaleway

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('SCALEWAY_ACCESS_KEY_ID'),
            secretAccessKey: env('SCALEWAY_ACCESS_SECRET'),
          },
          region: env('SCALEWAY_REGION'), // e.g "fr-par"
          endpoint: env('SCALEWAY_ENDPOINT'), // e.g. "https://s3.fr-par.scw.cloud"
          params: {
            Bucket: env('SCALEWAY_BUCKET'),
          },
        },
      },
    },
  },
  // ...
});
```

### IONOS / MinIO / Contabo

These providers require `forcePathStyle: true` because they use path-style URLs instead of virtual-hosted-style URLs.

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_ACCESS_SECRET'),
          },
          region: env('S3_REGION'),
          endpoint: env('S3_ENDPOINT'),
          forcePathStyle: true, // Required for these providers
          params: {
            Bucket: env('S3_BUCKET'),
          },
        },
      },
    },
  },
});
```

### Cloudflare R2

Cloudflare R2 does not support ACLs. Do not include the `ACL` parameter.

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('R2_ACCESS_KEY_ID'),
            secretAccessKey: env('R2_ACCESS_SECRET'),
          },
          region: 'auto',
          endpoint: env('R2_ENDPOINT'), // e.g. "https://<account-id>.r2.cloudflarestorage.com"
          params: {
            Bucket: env('R2_BUCKET'),
            // Do NOT set ACL - R2 does not support ACLs
          },
        },
      },
    },
  },
});
```

## Extended provider options

The `providerConfig` option inside `providerOptions` provides additional features for data integrity, security, and cost optimization.

### Checksum validation

Enable automatic checksum calculation to ensure data integrity during uploads. The SDK calculates a checksum on the client side, and S3 validates the checksum server-side.

```js
providerOptions: {
  s3Options: { /* ... */ },
  providerConfig: {
    checksumAlgorithm: 'CRC64NVME', // Options: 'CRC32', 'CRC32C', 'SHA1', 'SHA256', 'CRC64NVME'
  },
},
```

`CRC64NVME` is recommended for best performance on modern hardware.

### Conditional writes (prevent overwrites)

Prevent accidental file overwrites due to race conditions by enabling conditional writes. When enabled, uploads will fail if an object with the same key already exists.

```js
providerConfig: {
  preventOverwrite: true,
},
```

### Storage class (AWS S3 only)

Optimize storage costs by specifying a storage class for uploaded objects. Use lower-cost classes for infrequently accessed data.

:::note
Storage classes are AWS S3-specific. Other S3-compatible providers (MinIO, DigitalOcean Spaces, IONOS, Wasabi) will ignore this setting.
:::

```js
providerConfig: {
  storageClass: 'INTELLIGENT_TIERING', // Auto-optimizes costs
},
```

Available storage classes:

- `STANDARD` - Frequently accessed data (default)
- `INTELLIGENT_TIERING` - Automatic cost optimization
- `STANDARD_IA` - Infrequently accessed data
- `ONEZONE_IA` - Infrequently accessed, single AZ
- `GLACIER` - Archive storage
- `DEEP_ARCHIVE` - Long-term archive
- `GLACIER_IR` - Glacier Instant Retrieval

### Server-side encryption

Configure server-side encryption for compliance requirements (GDPR, HIPAA, etc.).

```js
providerConfig: {
  encryption: {
    type: 'AES256', // S3-managed encryption
  },
},
```

For KMS-managed encryption (AWS S3 only):

```js
providerConfig: {
  encryption: {
    type: 'aws:kms',
    kmsKeyId: env('AWS_KMS_KEY_ID'),
  },
},
```

Available encryption types:

- `AES256` - S3-managed keys (SSE-S3) — supported by most S3-compatible providers
- `aws:kms` - AWS KMS-managed keys (SSE-KMS) — AWS S3 only
- `aws:kms:dsse` - Dual-layer SSE with KMS — AWS S3 only

### Object tagging

Apply tags to uploaded objects for cost allocation, lifecycle policies, and organization.

```js
providerConfig: {
  tags: {
    project: 'website',
    environment: 'production',
    team: 'backend',
  },
},
```

### Multipart upload configuration

Configure multipart upload behavior for large files.

```js
providerConfig: {
  multipart: {
    partSize: 10 * 1024 * 1024, // 10MB per part
    queueSize: 4,               // Number of parallel uploads
    leavePartsOnError: false,   // Clean up on failure
  },
},
```

### Complete configuration example

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
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
            ACL: 'private',
            signedUrlExpires: 15 * 60,
            Bucket: env('AWS_BUCKET'),
          },
        },
        providerConfig: {
          checksumAlgorithm: 'CRC64NVME',
          preventOverwrite: true,
          storageClass: 'INTELLIGENT_TIERING',
          encryption: {
            type: 'aws:kms',
            kmsKeyId: env('AWS_KMS_KEY_ID'),
          },
          tags: {
            application: 'strapi',
            environment: env('NODE_ENV'),
          },
          multipart: {
            partSize: 10 * 1024 * 1024,
            queueSize: 4,
          },
        },
      },
    },
  },
});
```

## Custom provider override

For most private bucket use cases, setting `ACL: 'private'` in the provider configuration (see [Private bucket and signed URLs](#private-bucket-and-signed-urls)) is sufficient — the provider handles URL signing automatically.

However, if you need full control over the signing logic — for instance, custom expiration times per file, conditional access rules, or integration with an external authorization service — you can override the provider locally.

To create a custom `aws-s3` provider override:

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

:::tip Security best practices
For production deployments, consider enabling [server-side encryption](#server-side-encryption) for data at rest, [checksum validation](#checksum-validation) for upload integrity, and [conditional writes](#conditional-writes-prevent-overwrites) to prevent race conditions. Use `ACL: 'private'` with [signed URLs](#private-bucket-and-signed-urls) for sensitive content, and enable S3 bucket versioning for recovery from accidental deletions.
:::