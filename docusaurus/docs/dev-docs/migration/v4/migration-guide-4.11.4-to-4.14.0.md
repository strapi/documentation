---
title: Migrate from 4.11.4 to 4.14.0
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.14.0 to 4.14.0.
---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.11.4 to v4.14.0 migration guide

The Strapi v4.11.4 to v4.14.0 migration guide upgrades v4.11.4 to v4.14.0. Strapi v4.14.0 migrated the `strapi/strapi` package to TypeScript and introduced a new `@strapi/typings` package. This migration is required if you have used TypeScript in your project prior to 4.14.0. The migration guide consists of:

- Upgrading the application dependencies
- Generating your TypeScript typings
- Reinitializing the application

<PluginsCaution components={props.components} />


## Upgrading the application dependencies to 4.14.0

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.14.0`:

   ```json title="path: package.json"
   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.14.0",
       "@strapi/plugin-users-permissions": "4.14.0",
       "@strapi/plugin-i18n": "4.14.0"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run the install command:
   <InstallCommand components={props.components} />

## Generate TypeScript typings

Generate your TypeScript typings by running the following command in the terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi ts:generate-types
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi ts:generate-types
```

</TabItem>

</Tabs>

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
