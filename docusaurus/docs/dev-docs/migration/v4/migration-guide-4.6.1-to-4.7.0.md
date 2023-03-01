---
title: Migrate from 4.6.1+ to 4.7.0
description: Learn how you can migrate your Strapi application from 4.6.1+ to 4.7.0.
displayed_sidebar: devDocsSidebar
---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# v4.6.1+ to v4.7.0 migration guide

The Strapi v4.6.1+ to v4.7.0 migration guide upgrades v4.6.1+ to v4.7.0. We [describe in 1-2 sentences what we introduced in 4.7.0 and why the migration is needed] 
<!-- TODO: fill sentence above -->

The migration guide consists of:

<!-- TODO: describe "additional steps" below -->
- Upgrading the application dependencies
- additional step 1 specific to this migration_
- additional step 2 specific to this migration_
- …
- Reinitializing the application

## Upgrading the application dependencies to 4.7.0

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.7.0`:

   ```json title="package.json"

   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.7.0",
       "@strapi/plugin-users-permissions": "4.7.0",
       "@strapi/plugin-i18n": "4.7.0"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

:::tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

<!-- TODO: update title -->
## Enabling the Data Transfer Features

In order to enable the new data transfer features (remote data transfer, transfer tokens), a transfer token salt needs to be defined in your admin config.

1. Add a new configuration property to your `config/admin.(js|ts)` file under the path `transfer.token.salt` with the value being `env('TRANSFER_TOKEN_SALT')`
2. Generate a new token salt (string). For instance, you can generate one using Node with `crypto.randomBytes(16).toString('base64')`
3. Don't forget to add your generated token to your environment

```jsx title="/config/admin.js"
module.exports = ({ env }) => ({
  // ...
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});


<!-- If you need tabs (JS and TS code examples, see example syntax in next section) -->

## Heading title for additional step 2, if any

<!-- TODO: fill in this section if needed -->
<!-- use the same structure as with previous section: quick description, procedure, code example. -->

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/plugins.js"

```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/plugins.ts"

```

</TabItem>

</Tabs>

<BuildCommand components={props.components} />
<DevelopCommand components={props.components} />
