---
title: Migrate from 4.4.3 to 4.4.5
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.4.3 to 4.4.5.

---
import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.4.3 to v4.4.5 migration guide

The Strapi v4.4.3 to v4.4.5 migration guide upgrades v4.4.3 to v4.4.5. The migration changes the name of the favicon from `favicon.ico` to `favicon.png`.

:::caution
This migration guide skips v4.4.4, which introduced a problem in `koa/cors` due to a missing dependency update.
:::

<PluginsCaution components={props.components} />

## Upgrading the application dependencies

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.4.5`:

    ```json title="path: ./package.json"

    {
      // ...
      "dependencies": {
        "@strapi/strapi": "4.4.5",
        "@strapi/plugin-users-permissions": "4.4.5",
        "@strapi/plugin-i18n": "4.4.5",
        // ...
      }
    }
    ```

2. Save the edited `package.json` file.

3. Replace the existing `favicon.ico` with [`favicon.png`](https://user-images.githubusercontent.com/8593673/198366643-7261700d-c8c4-4ebb-83c8-792a330ab4a5.png):

4. Run the install command:
<InstallCommand components={props.components} />

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
