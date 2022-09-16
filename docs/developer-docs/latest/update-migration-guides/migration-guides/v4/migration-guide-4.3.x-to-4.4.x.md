---
title: Migrate from 4.3.x to 4.4.x - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.3.x to 4.4.x.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.3.x+-to-4.4.x.html
---

# v4.3.x to v4.4.x migration guide

The Strapi v4.3.x to v4.4.x migration guide upgrades versions of v4.3.x and above to v4.4.x. This migration guide is needed for all users who were limiting media size for the local upload provider. The migration to 4.4.x consists of 3 steps:

- Upgrading the application dependencies
- Updating the local upload provider sizeLimit
- Reinitializing the application

## Upgrading the application dependencies to 4.4.x (x is the latest minor version of v4.4)

:::prerequisites
Stop the server before starting the upgrade. At the time of writing this, the latest version of Strapi is v4.4.0.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.4.0`:

```jsx
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.4.0",
    "@strapi/plugin-users-permissions": "4.4.0",
    "@strapi/plugin-i18n": "4.4.0",
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Updating the sizeLimit provider configuration

This step is only required if you were using the [sizeLimit configuration](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#max-file-size) for your upload provider.

:::caution
The docs required the sizeLimit to be in bytes, but it was actually in kilobytes. This is now fixed, and the limit will be interpreted as bytes.

If you, for some reason, were limiting the file size to kilobytes, you should update the value to be in bytes.
:::

We recommend to move the sizeLimit outside the provider options like the following, as it will be deprecated in the next major version.
<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

module.exports = {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // Now
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // Before
      }
    }
  }
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

export default {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // Now
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // Before
      }
    }
  }
};
```

</code-block>

</code-group>


To change the script:

1. In the `./config/plugins.js` file, Identify the upload configuration if you have one.
2. Move your sizeLimit, if you have one, one level above providerOptions.


!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
