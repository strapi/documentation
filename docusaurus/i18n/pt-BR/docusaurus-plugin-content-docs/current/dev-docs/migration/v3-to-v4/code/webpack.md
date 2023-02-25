---
title:  Webpack configuration
displayed_sidebar: devDocsSidebar
description: Migrate webpack configuration from Strapi v3.6.x to v4.0.x with step-by-step instructions

---

# v4 code migration: Updating the webpack configuration

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x


:::strapi v3/v4 comparison
In both Strapi v3 and v4, the webpack configuration is customizable.

In Strapi v4, [webpack v5](https://webpack.js.org/migrate/5/) is used, and only `./src/admin/app.js` and the files under the `./src/admin/extensions` folder are being watched by the webpack dev server (see [admin panel customization](/dev-docs/admin-panel-customization#webpack-configuration) documentation).

:::

:::prerequisites
Make sure webpack plugins and loaders are upgraded to the latest version before migrating.
:::

To update the [webpack](https://webpack.js.org/) configuration to Strapi v4:

1. Rename the `./src/admin/webpack.config.example.js` to `./src/admin/webpack.config.js`.
2. Copy the content of `./admin/admin.config.js` from the Strapi v3 application to `./src/admin/webpack.config.js`.

<details> 
<summary>Example of a webpack configuration file in Strapi v4:</summary>

```js title="./src/admin/webpack.config.js"

'use strict';

// WARNING: the admin panel now uses webpack 5 to bundle the application.

module.exports = (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it
  // Perform customizations to webpack configuration
  config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));
  // Important: return the modified configuration
  return config;
};
```

</details>
