---
title: Theming
displayed_sidebar: devDocsSidebar
description: Migrate theme customizations from Strapi v3.6.x to v4.0.x with step-by-step instructions

---

# v4 code migration: Updating theme customizations

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

:::strapi v3/v4 comparison
In Strapi v3, theme customization was not supported.

Strapi v4 introduces the [Strapi Design System](https://design-system.strapi.io/) with a brand new theme for the admin panel.

:::

To customize the theme in Strapi v4:

1. Rename the `./src/admin/app.example.js` file to `./src/admin/app.js`.
2. In `./src/admin/app.js`, declare new key/value pairs in the `config.theme` object, updating the design elements (e.g. colors, shadows, sizes) of the [default theme](https://github.com/strapi/design-system/tree/main/packages/strapi-design-system/src/themes/lightTheme).

<details>
<summary> Example of theme customization in Strapi v4:</summary>

```js title="./src/admin/app.js"

export default {
  config: {
    theme: {
      colors, shadows, sizes, …
    }
  },
  bootstrap() {},
};
```

</details>

:::tip Customization tips
* The [Strapi Design System](https://design-system.strapi.io/) is fully customizable.
* Strapi v4 supports light and dark modes. See [admin customization](/dev-docs/admin-panel-customization#theme-extension) documentation for more details.
:::
