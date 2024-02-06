---
title: Migrate from 4.15.5 to 4.19.2
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.15.5 to 4.19.2.
---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.15.5 to 4.19.2 migration guide

The present migration guide upgrades Strapi v4.15.5 to v4.19.2. Strapi v4.19.2 … 
<!-- TODO please continue the sentence to describe what happened in Strapi that requires a migration -->
 
 The migration guide consists of:
- Upgrading the application dependencies
<!-- TODO - please add a short description of the migration step(s) here; could be the same as the h2 -->
- Reinitializing the application

<PluginsCaution components={props.components} />

## Upgrading the application dependencies to 4.19.2

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to 4.19.2:

   ```json title="path: package.json"
   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.19.2",
       "@strapi/plugin-users-permissions": "4.19.2",
       "@strapi/plugin-i18n": "4.19.2"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run the install command:
   <InstallCommand components={props.components} />

<!-- TODO: please update the h2 below -->
## (title for the required migration step)

<!-- TODO: Please describe what users should do -->

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
