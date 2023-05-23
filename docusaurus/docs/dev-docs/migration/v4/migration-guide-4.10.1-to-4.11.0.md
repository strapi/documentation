---
title: Migrate from 4.7.1+ to 4.11.0
description: Learn how you can migrate your Strapi application from 4.7.1+ to 4.11.0.
displayed_sidebar: devDocsSidebar
---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# v4.10.1+ to v4.11.0 migration guide

The Strapi v4.10.1+ to v4.11.0 migration guide upgrades v4.10.1+ to v4.11.0.

Breaking change: Users and Permissions new user registration now only accepts email, username, and password fields unless additional fields are added to your configuration. If your application has additional fields added to User and Permissions users that are accepted during registration, please see the Users and Permissions -> Registration -> Configuration documentation for the necessary changes to your configuration.

The migration guide consists of:

- Upgrading the application dependencies
<!-- TODO add additional steps specific to this migration -->
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

<!-- TODO: update the title below 👇  -->
## (title for specific instructions goes here)

<!-- TODO: describe what needs to be done -->

<BuildCommand components={props.components} />
<DevelopCommand components={props.components} />
