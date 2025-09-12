---
title: Features configuration
sidebar_label: Features
description: Enable experimental Strapi features
displayed_sidebar: cmsSidebar
tags:
- additional configuration
- configuration
- features configuration
- future flag
---

# Features configuration

<Tldr>
Future flags in `/config/features` toggle experimental Strapi features, allowing early testing at your own risk.
</Tldr>

The `config/features.js|ts` file is used to enable feature flags. Currently this file only includes a `future` object used to enable experimental features through **future flags**.

Some incoming Strapi features are not yet ready to be shipped to all users, but Strapi still offers community users the opportunity to provide early feedback on these new features or changes. With these experimental features, developers have the flexibility to choose and integrate new features and changes into their Strapi applications as they become available in the current major version as well as assist us in shaping these new features.

Such experimental features are indicated by a <FeatureFlagBadge /> badge throughout the documentation, where the name of the feature flag to use is included in the badge (e.g., <FeatureFlagBadge feature="FeatureFlagName" />). Enabling these features requires enabling the corresponding future flags. Future flags differ from features that are in alpha in that future flags are disabled by default.

:::danger
Enable future flags at your own risk. Experimental features may be subject to change or removal, may contain breaking changes, may be unstable or not fully ready for use, and some parts may still be under development or using mock data.
:::

<!-- ! Commented out as not relevant for now -->
<!-- Future flags can also be utilized for enabling coming breaking changes in upcoming versions (when prefixed by `vX`, with 'X' being the target version). In this scenario, if you decide to enable a future flag for a breaking change, you will need to migrate your application to adapt to this breaking change. The benefit of this approach however, is that changes can be adopted incrementally as opposed to one large migration when the next major release occurs. Some of these flags may have started out as regular unstable but development showed the need for breaking changes. Finally, the aim of this is to empower developers to be able to smoothly transition to new major versions without the need to modify their existing application code where possible. -->

## Enabling a future flag

To enable a future flag:

1. (_optional_) If the server is running, stop it with `Ctrl-C`.
2. Open the `config/features.js|ts` file or create it if the file does not exist yet. The file will export a `future` object with all the future flags to enable.
3. To enable a future flag, add its property name (see [full list](#available-future-flags)) to the `future` object and ensure the property's value is set to `true`. The following example shows how to enable the `experimental_firstPublishedAt` future flag:

  <Tabs groupId='js-ts'>

  <TabItem value="js" label="JavaScript">

  ```ts title="/config/features.ts"
  module.exports = ({ env }) => ({
    future: {
      experimental_firstPublishedAt: env.bool('STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT', false),
    },
  })

  ```

  This example assumes that you have an `.env` environment file at the root of your application and that the file includes the following line:

  ```json title=".env"
  STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT=true
  ```

  If your environment file does not include this value, the `experimental_firstPublishedAt` future flag property value will default to `false` and the experimental feature will not be enabled.

  </TabItem>

  <TabItem value="ts" label="TypeScript">

  ```ts title="/config/features.ts"
  export default {
    future: {
      experimental_firstPublishedAt: env.bool('STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT', false),
    },
  };
  ```

  This example assumes that you have an `.env` environment file at the root of your application and that the file includes the following line:

  ```json title=".env"
  STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT=true
  ```

  If your environment file does not include this value, the `experimental_firstPublishedAt` future flag property value will default to `false` and the experimental feature will not be enabled.

  </TabItem>
  </Tabs>

4. Rebuild the admin panel and restart the server:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">
  
    ```sh
      yarn develop
    ```
  </TabItem>
  <TabItem value="npm" label="NPM">

    ```sh
      npm run develop
    ```

  </TabItem>
  </Tabs>

## Future flags API

Developers can use the following APIs to interact with future flags:

- Features configuration is part of the `config` object and can be read with `strapi.config.get('features')` or with `strapi.features.config`.

- `strapi.features.future` returns the `isEnabled()` that can be used to determine if a future flag is enabled, using the following method: `strapi.features.future.isEnabled('featureName')`.

## Available future flags

| Property name | Related feature | Suggested environment variable name |
| ------------- | --------------- | ---------------------------------- |
| `experimental_firstPublishedAt` | [Draft & Publish](/cms/features/draft-and-publish#recording-the-first-publication-date) | `STRAPI_FUTURE_EXPERIMENTAL_FIRST_PUBLISHED_AT` |
