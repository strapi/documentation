---
title: Amazon S3 provider credentials must be set under s3Options
description: In Strapi 5, Amazon S3 upload provider options must be nested under an s3Options object, and credentials should be wrapped in a credentials object.
sidebar_label: Amazon S3 provider credentials
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - providers
 - media library
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Amazon S3 provider credentials must be set under `s3Options`

<Tldr>

In Strapi 5, the Amazon S3 upload provider options must be nested under an `s3Options` object, and credentials should be passed inside a `credentials` object.

</Tldr>

In Strapi 5, the Amazon S3 provider (`@strapi/provider-upload-aws-s3`) uses AWS SDK v3, which changes where credentials and other client options are configured.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Options such as `accessKeyId`, `secretAccessKey`, `region` and `params` could be passed directly under `providerOptions`, with no `s3Options` key.

```js
providerOptions: {
  accessKeyId: env('AWS_ACCESS_KEY_ID'),
  secretAccessKey: env('AWS_ACCESS_SECRET'),
  region: env('AWS_REGION'),
  params: {
    Bucket: env('AWS_BUCKET'),
  },
},
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Those options must be nested inside an `s3Options` object, and credentials should be wrapped in a `credentials` object. Placing `accessKeyId`/`secretAccessKey` at the root of `s3Options` still works but triggers a deprecation warning.

```js
providerOptions: {
  s3Options: {
    credentials: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_ACCESS_SECRET'),
    },
    region: env('AWS_REGION'),
    params: {
      Bucket: env('AWS_BUCKET'),
    },
  },
},
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- See the [Amazon S3 provider](/cms/configurations/media-library-providers/amazon-s3) configuration documentation for complete examples.

### Manual procedure

If you are upgrading an Amazon S3 configuration from Strapi v4:

1. Nest `accessKeyId`, `secretAccessKey`, `region`, `params` (and any other S3 client options) inside an `s3Options` object under `providerOptions`.
2. Move `accessKeyId` and `secretAccessKey` into a `credentials` object within `s3Options`. Leaving them at the root of `s3Options` still works but is deprecated and triggers a warning.
