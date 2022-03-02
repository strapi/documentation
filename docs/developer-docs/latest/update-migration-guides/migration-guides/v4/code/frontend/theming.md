---
title: Code migration - Theming - Strapi Developer Docs
description: Migrate theme customizations from Strapi v3.6.8 to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.html
---

# v4 code migration: Updating theme customizations

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, theme customization is not properly supported.

Strapi v4 introduces the [Strapi Design System](https://design-system.strapi.io/) with a brand new theme which is fully customisable.

:::

To customize the theme in Strapi v4:

1. Rename the `./src/admin/app.example.js` file to `./src/admin/app.js`.
2. In `./src/admin/app.js`, declare new key/value pairs in the `config.theme` object, updating the design elements (e.g. colors, shadows, sizes) of the [default theme](https://github.com/strapi/design-system/blob/main/packages/strapi-design-system/src/themes/light-theme.js).


::: details Example of theme customization in Strapi v4

```js
// path: ./src/admin/app.js

export default {
  config: {
    theme: {
      colors, shadows, sizes, …
    }
  },
  bootstrap() {},
};
```

:::

::: tip Customization tips
The [Strapi Design System](https://design-system.strapi.io/) is fully customizable.
:::

<!-- TODO: add conclusion or next steps -->
