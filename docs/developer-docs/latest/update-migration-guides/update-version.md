---
title: Update Strapi version - Strapi Developer Docs
description: The following documentation covers how to upgrade your application to the latest version of Strapi.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/update-version.html
---

# Upgrade Strapi version

Strapi periodically releases code improvements through upgrades. Upgrades contain no breaking changes and are announced in both the terminal and in the administration panel. [Migration guides](/developer-docs/latest/update-migration-guides/migration-guides.md) are provided whenever a new Strapi version includes breaking changes.

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Step 1: Upgrade the dependencies

::: prerequisites

- Stop the server before starting the upgrade.
- Confirm there are no [migrations](/developer-docs/latest/update-migration-guides/migration-guides.md) between the current and ultimate Strapi versions.
:::

1. Upgrade all of the Strapi packages version numbers in `package.json` to the latest stable Strapi version:

    ```jsx
    // path: package.json

    {
      // ...
      "dependencies": {
        "@strapi/strapi": "4.5.3", 
        "@strapi/plugin-users-permissions": "4.5.3",
        "@strapi/plugin-i18n": "4.5.3",
        "better-sqlite3": "7.4.6"
        // ...
      }
    }

    ```

2. Save the edited `package.json` file.

3. !!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/Install-npm-yarn)!!!

## Step 2: Rebuild the application

Rebuild the administration panel:

<code-group>

<code-block title="NPM">
```sh
npm run build
```
</code-block>

<code-block title="YARN">
```sh
yarn build
```
</code-block>

</code-group>

## Step 3: Start the application

Start the application and ensure that everything is working as expected:

<code-group>

<code-block title="NPM">
```sh
npm run develop
```
</code-block>

<code-block title="YARN">
```sh
yarn develop
```
</code-block>

</code-group>
