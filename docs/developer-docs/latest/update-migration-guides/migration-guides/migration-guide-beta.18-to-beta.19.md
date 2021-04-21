---
title: Migrate from beta.18.x to beta.19 - Strapi Developer Documentation
description: Learn how you can migrate your Strapi application from beta.18.x to beta.19.
---

# Migration guide from beta.18.x to beta.19

Upgrading your Strapi application to `v3.0.0-beta.19`.

**Make sure your server is not running until the end of the migration**

## Upgrading your dependencies

Start by upgrading your dependencies. Make sure to use exact versions.

Update your package.json accordingly:

```json
{
  //...
  "dependencies": {
    "strapi": "3.0.0-beta.19",
    "strapi-admin": "3.0.0-beta.19",
    "strapi-connector-bookshelf": "3.0.0-beta.19",
    "strapi-plugin-content-manager": "3.0.0-beta.19",
    "strapi-plugin-content-type-builder": "3.0.0-beta.19",
    "strapi-plugin-email": "3.0.0-beta.19",
    "strapi-plugin-graphql": "3.0.0-beta.19",
    "strapi-plugin-upload": "3.0.0-beta.19",
    "strapi-plugin-users-permissions": "3.0.0-beta.19",
    "strapi-utils": "3.0.0-beta.19"
  }
}
```

Then run either `yarn install` or `npm install`.

## Policies syntax change

We decided to change the policies naming convention to match the future naming convention we will be using throughout the project.

**Before**

- Global policy: `global.{policy}`.
- Plugin policy: `plugins.{pluginName}.{policy}`.

**After**

- Global policy: `global::{policy}`.
- Plugin policy: `plugins::{pluginName}.{policy}`.

We are also introducing application naming so you can access an api policy more easily or reference it absolutely when the context otherwise wouldn't allow to find it directly.

You can now reference a policy located at `./api/{apiName}/config/policies/{policy}` with the following syntax: `{apiName}.{policy}`.

Although we do not recommend it (as it is error prone), you can still access a given local policy with the syntax `{policy}`. This syntax will only allow access to a policy declared in the scope of the api you are referencing it from (e.g, a given policy within the `restaurant` api and a route within the `restaurant` api only).

## Rebuilding your administration panel

Now delete the `.cache` and `build` folders. Then run `yarn develop`.

::: warning NOTE

If you have modified the `admin/src/config.js` file you need to update its content with:

```
export const LOGIN_LOGO = null;
export const SHOW_TUTORIALS = false;
export const SETTINGS_BASE_URL = '/settings';
```

:::
