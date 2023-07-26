---
title: Migrate from 4.6.1+ to 4.7.0
description: Learn how you can migrate your Strapi application from 4.6.1+ to 4.7.0.
displayed_sidebar: devDocsSidebar
---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# v4.6.1+ to v4.7.0 migration guide

The Strapi v4.6.1+ to v4.7.0 migration guide upgrades v4.6.1+ to v4.7.0. We added a [data management system](/dev-docs/data-management) to v4.7 that allows transferring data from a Strapi instance to another instance. The data transfer features require generating transfer tokens that use a salt which need to be manually added when you migrate from a previous version of Strapi.

The migration guide consists of:

- Upgrading the application dependencies
- Enabling the data transfer feature
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

## Enabling the data transfer features

In order to enable the new data transfer features (remote data transfer, transfer tokens), a transfer token salt needs to be defined in your [admin panel configuration file](/dev-docs/configurations/admin-panel):

1. Add a new configuration property to your `config/admin.(js|ts)` file under the path `transfer.token.salt` with the value being `env('TRANSFER_TOKEN_SALT')`.
2. Generate a new token salt, which is a string. For instance, you can generate a random string using Node in your terminal: Run `node` to enter the [Node REPL](https://nodejs.dev/en/learn/how-to-use-the-nodejs-repl/) and run the following command `crypto.randomBytes(16).toString('base64')`, then copy the generated random string (without the single quotes), and finally press Ctrl-C twice to quit the Node REPL.
3. Add the generated token to your environment variables.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```jsx title="/config/admin.js"
module.exports = ({ env }) => ({
  // ...
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="/config/admin.js"
export default ({ env }) => ({
  // ...
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});

```

</TabItem>
</Tabs>

<BuildCommand components={props.components} />
<DevelopCommand components={props.components} />
