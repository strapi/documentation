---
title: Migrate from 4.7.1+ to 4.11.0
description: Learn how you can migrate your Strapi application from 4.7.1+ to 4.11.0.
displayed_sidebar: devDocsSidebar
---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# v4.10.1+ to v4.11.0 migration guide

The Strapi v4.10.1+ to v4.11.0 migration guide upgrades v4.10.1+ to v4.11.0.

:::note
This migration guide is optional and only concerns Strapi projects that are currently accepting additional, custom user fields (i.e., other than the email, username, and password fields) on their [Users and Permissions plugin](/dev-docs/plugins/users-permissions) registration system.
:::

In Strapi v4.11+, the new user registration system in the Users & Permissions plugin only accepts email, username, and password fields by default. If your Strapi application has added any other custom user fields that your new registration form needs to accept, you must add them to the `allowedFields` configuration.

The migration guide consists of:

- Upgrading the application dependencies
- Adding the additional custom fields to allow in the Users & Permissions plugin
- Reinitializing the application

## Upgrading the application dependencies to 4.11.0

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.11.0`:

   ```json title="package.json"

   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.11.0",
       "@strapi/plugin-users-permissions": "4.11.0",
       "@strapi/plugin-i18n": "4.11.0"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

:::tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Allow additional custom fields in the Users & Permissions plugin registration

The Users & Permissions plugin registration system in Strapi v4.11 only accepts email, username, and password fields by default. If additional fields were added to your user model and need to be accepted on registration, add these fields to the `allowedFields` in the `register` configuration option, otherwise the fields will be ignored.

For example, if you have added a field called `nickname` that you wish to accept from the user, update your configuration object as follows:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["nickname"],
      },
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"
export default ({ env }) => ({
  // ...
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["nickname"],
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application 

<DevelopCommand components={props.components} />
