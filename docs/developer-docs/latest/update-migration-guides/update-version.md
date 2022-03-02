---
title: Update Strapi version - Strapi Developer Documentation
description: The following documentation covers how to upgrade your application to the latest version of Strapi.
---

# Upgrade Strapi version

Strapi periodically releases code improvements through upgrades. Upgrades contain no breaking changes and are announced in both the terminal and in the administration panel. [Migration guides](/developer-docs/latest/update-migration-guides/migration-guides.md) are provided whenver a new Strapi version includes breaking changes.

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Upgrading the dependencies

1. Upgrade all of the Strapi packages in the `package.json`.

```jsx

  // path: package.json

  //...
  "dependencies": {
    "strapi": "3.6.9",
    "strapi-admin": "3.6.9",
    "strapi-connector-bookshelf": "3.6.9",
    "strapi-plugin-content-manager": "3.6.9",
    "strapi-plugin-content-type-builder": "3.6.9",
    "strapi-plugin-email": "3.6.9",
    "strapi-plugin-graphql": "3.6.9",
    "strapi-plugin-upload": "3.6.9",
    "strapi-plugin-users-permissions": "3.6.9",
    "strapi-utils": "3.6.9"
    //...
  }

```

2. Save the edited `package.json` file.
3. After editing the file run either `yarn install` or `npm install` to install the specified version.

::: tip
If the operation does not work try removing the `yarn.lock` or `package-lock.json` files. If the operation is still not successful, remove the `node_modules` folder and try again.
:::

## Reinitializing the Strapi application

Rebuild the administration panel and start the application:

<code-group>

<code-block title="NPM">
```sh
npm run build
npm run develop
```
</code-block>

<code-block title="YARN">
```sh
yarn build
yarn develop
```
</code-block>

</code-group>
