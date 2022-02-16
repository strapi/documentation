---
title: Update Strapi version - Strapi Developer Docs
description: The following documentation covers how to upgrade your application to the latest version of Strapi.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/update-version.html
---

## Upgrade Strapi version

Strapi periodically releases code improvements through upgrades. Upgrades contain no breaking changes and are announced in both the terminal and in the administration panel.  

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code, will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

### Upgrading the dependencies

::: prerequisites
- Stop the server before starting the upgrade.
- Confirm there are no [migrations](/developer-docs/latest/update-migration-guides/migration-guides.md) between the current and ultimate Strapi versions. 
:::


1. Upgrade all of the Strapi packages in the `package.json`.

```jsx
// path: package.json
{
  // ...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.7",
    "@strapi/plugin-i18n": "4.0.7",
    "@strapi/plugin-users-permissions": "4.0.7",
    "@strapi/strapi": "4.0.7"
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the upgraded version.

::: tip
If the operation does not work, try removing the `yarn.lock` or `package-lock.json` files. If that does not work, remove the `node_modules` folder and try again.
:::

### Reinitializing the application 
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
