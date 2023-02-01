---
title: Migrate from 4.5.1+ to 4.6.1 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.5.1+ to 4.6.1.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.5.1-to-4.6.1.html
---

# v4.5.1+ to v4.6.1 migration guide

The Strapi v4.5.1+ to v4.6.1 migration guide upgrades v4.5.1+ to v4.6.1. We introduced a configuration for webhooks to receive populated relations. Also, this migration guide is needed for all users who were limiting media size for the local upload provider.

The migration guide consists of:

- Upgrading the application dependencies
- Changing the webhooks configuration (optional)
- Updating the local upload provider `sizeLimit`
- Reinitializing the application

## Upgrading the application dependencies to 4.6.1

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.6.1`:

   ```json
   // path: package.json

   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.6.1",
       "@strapi/plugin-users-permissions": "4.6.1",
       "@strapi/plugin-i18n": "4.6.1"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Changing the webhooks configuration (optional)

By default, and for backward compatibility reasons, webhooks will receive the entity with its relations populated again. We do recommend to disable this behavior if you were not using it, as it may cause performance issues when having many relations. If you need populated relations in your webhook, we recommend doing a separate query in your webhook listener to fetch the entity only with the necessary data.

If you want to change this behavior, you can do so by editing the `./config/server.js` file (or `./config/server.ts` if you are using TypeScript) and add the following configuration:

```jsx
'use strict';

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://localhost:1337',
  webhooks: {
    // Add this to not receive populated relations in webhooks
    populateRelations: false,
  },
});
```

With this, you will no longer receive populated relations in webhooks, and **response times on the Content Manager will be shorter**.

You can see more of the available configuration options in the [server configuration documentation](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md).

## Updating the sizeLimit provider configuration

This step is only required if you were using the [`sizeLimit` configuration](/developer-docs/latest/plugins/upload.md#max-file-size) for your upload provider.

:::caution
The documentation required the `sizeLimit` to be in bytes, but it was actually in kilobytes. This is now fixed, and the limit will be interpreted as bytes.

If you, for some reason, were limiting the file size to kilobytes, you should update the value to be in bytes.
:::

We recommend to move the `sizeLimit` outside the provider options like the following, as it will be deprecated in the next major version.
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

1. In the `./config/plugins.js` file, identify the upload configuration if you have one.
2. (_optional_) If you have a `sizeLimit`, move it one level above `providerOptions`.

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Rebuild-and-start-snippet.md)!!!
