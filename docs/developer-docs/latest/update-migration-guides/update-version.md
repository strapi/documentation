---
title: Update Strapi version - Strapi Developer Docs
description: The following documentation covers how to upgrade your application to the latest version of Strapi.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/update-version.html
---

# Update Strapi version

In this guide you will learn how to upgrade your application to the latest version of Strapi.

:::note
When a new version of Strapi is available, you will be notified both in your terminal, and in the admin panel. <br>
Also note that you can check the **Settings > Global settings - Application** section of the admin panel to have more information on:

- The versions of Strapi and Node you are currently using.
- If relevant, the versions we recommend you to upgrade to.

:::

:::caution
Before you start, make sure your server is not running until the end of the guide!
:::

## Upgrade your dependencies

Start by upgrading all your Strapi packages in your `package.json`.<br>
For example upgrading from `4.0.0` to `4.0.1`:

:::: tabs card

::: tab 4.0.0

```json
{
  //...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.0",
    "@strapi/plugin-i18n": "4.0.0",
    "@strapi/plugin-users-permissions": "4.0.0",
    "@strapi/strapi": "4.0.0"
    //...
  }
}
```

:::

::: tab 4.0.1

```json
{
  //...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.1",
    "@strapi/plugin-i18n": "4.0.1",
    "@strapi/plugin-users-permissions": "4.0.1",
    "@strapi/strapi": "4.0.1"
    //...
  }
}
```

:::

::::

After editing the file run either `yarn install` or `npm install` to install the specified version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again..
:::

## Rebuild your administration panel

New releases can introduce changes to the administration panel that require a rebuild.
Rebuild the admin panel with one of the following commands:

<code-group>

<code-block title="NPM">
```sh
npm run build -- --clean
```
</code-block>

<code-block title="YARN">
```sh
yarn build --clean
```
</code-block>

</code-group>

## Extensions

If you are using [extensions](/developer-docs/latest/development/plugins-extension.md) to create custom code or modify existing code, you will need to update your code and compare your version to the new changes on the repository. Not updating your extensions can **break your app** in unexpected ways we cannot predict.

## Migration guides

Sometimes Strapi introduces **breaking changes** that need more than just the previous steps.
That is the reason for the [Migration guides](/developer-docs/latest/update-migration-guides/migration-guides.md) page.
Just make sure when you update your version that a migration guide exists or not.

## Start your application

If you have followed the information above, you can start your application with:

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

🎉 Congrats, your application has been migrated!
