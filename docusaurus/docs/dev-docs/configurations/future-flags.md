---
title: Future flags
description: Enable experimental Strapi features
# displayed_sidebar: devDocsConfigSidebar
---

# Future flags

Some incoming Strapi features are not yet ready to be shipped to all users, but we want to offer community users the opportunity to provide early feedback on these new features or changes.

Such experimental features are indicated by a <FutureBadge /> throughout the documentation and are named **future flags**.
:::danger
Enable and use future flags at your own risk. These features may be subject to change or removal, may contain breaking changes, may be unstable or not fully ready for use, and some parts may still be under development or using mock data.
:::

Future flags can also be utilized for enabling coming breaking changes in upcoming versions (when prefixed by `vX`, with 'X' being the target version). In this scenario, if you decide to enable a future flag for a breaking change, you will need to migrate your application to adapt to this breaking change.

## Enabling a future flag

To enable a future flag:

1. Open the `config/features.js|ts` file or create it if the file does not exist yet.
2. Export the `futur`, set the value of its property name (see [full list](#available-future-flags)) to `true` in the `future` object of the `config/features` file:

<Tabs groupId='js-ts'>

<Tab value="js" label="JavaScript">

```ts title="/config/features.ts"
module.export = ({ env }) => ({
  future: {
    contentReleases: env.bool('STRAPI_FEATURES_FUTURE_CONTENT_RELEASES', false),
  },
})

```

This example assumes that you have an `.env` environment file at the root of your application and that the file includes the following line:

```json title=".env"
STRAPI_FEATURES_FUTURE_CONTENT_RELEASES=true
```

If your environment file does not include this value, the `contentReleases` future flag property value  will default to `false` and the experimental feature will not be enabled.

</Tab>

<Tab value="ts" label="TypeScript">

```ts title="/config/features.ts"

export default {
  future: {
    contentReleases: env.bool('STRAPI_FEATURES_FUTURE_CONTENT_RELEASES', false),
  },
};
```

This example assumes that you have an `.env` environment file at the root of your application and that the file includes the following line:

```json title=".env"
STRAPI_FEATURES_FUTURE_CONTENT_RELEASES=true
```

If your environment file does not include this value, the `contentReleases` future flag property value will default to `false` and the experimental feature will not be enabled.

</Tab>
</Tabs>

## Future flags API

- Features configuration is part of the `config` object and can be accessed with `strapi.config.get('features')`.

- The `strapi` object provides an API to check if a future flag is enabled. You can do this using the following method: `strapi.future.isEnabled('featureName')`.

## Available future flags

The following future flags are currently available and can be used in the `future` object of the `config/features` configuration file:

| Property name     | Related feature                              | Suggested environment variable name       |
| ----------------- | -------------------------------------------- | ----------------------------------------- |
| `contentReleases` | [Releases](/user-docs/releases/introduction) | `STRAPI_FEATURES_FUTURE_CONTENT_RELEASES` |


