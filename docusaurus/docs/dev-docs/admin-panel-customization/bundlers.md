---
title: Admin panel bundlers
description: Learn more about configuring Vite and webpack with Strapi 5.
sidebar_label: Bundlers
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
- webpack
- Vite
---

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'

Strapi's admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application. 2 different bundlers can be used with your Strapi 5 application, [Vite](#vite) (the default one) and [webpack](#webpack). Both bundlers can be configured to suit your needs.

:::info
For simplification, the following documentation mentions the `strapi develop` command, but in practice you will probably use its alias by running either `yarn develop` or `npm run develop` depending on your package manager of choice.
:::

## Vite

In Strapi 5, [Vite](https://vitejs.dev/) is the default bundler that Strapi uses to build the admin panel. Vite will therefore be used by default when you run the `strapi develop` command.

To extend the usage of Vite, define a function that extends its configuration inside `/src/admin/vite.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/admin/vite.config.js"
const { mergeConfig } = require("vite");

module.exports = (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/admin/vite.config.ts"
import { mergeConfig } from "vite";

export default (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
```

</TabItem>
</Tabs>

## Webpack

In Strapi 5, the default bundler is Vite. To use [webpack](https://webpack.js.org/) as a bundler you will need to pass it as an option to the `strapi develop` command:

```bash
strapi develop --bundler=webpack
```

:::prerequisites
Make sure to rename the default `webpack.config.example.js` file into `webpack.config.[js|ts]` before customizing webpack.
:::

In order to extend the usage of webpack v5, define a function that extends its configuration inside `/src/admin/webpack.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/admin/webpack.config.js"
module.exports = (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it

  // Perform customizations to webpack config
  config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

  // Important: return the modified config
  return config;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/admin/webpack.config.ts"
export default (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it

  // Perform customizations to webpack config
  config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

  // Important: return the modified config
  return config;
};
```

</TabItem>
</Tabs>

