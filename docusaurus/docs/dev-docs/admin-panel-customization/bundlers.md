---
title: Admin panel bundlers
# description: todo
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
- webpack
- vite

---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
const captionStyle = {fontSize: '12px'}
const imgStyle = {width: '100%', margin: '0' }

<NotV5 />

The admin panel is a React-based single-page application. It encapsulates all the installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

To start your strapi instance with hot reloading while developing, run the following command:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop
```

:::note
In Strapi 5, the server runs in `watch-admin` mode by default, so the admin panel auto-reloads whenever you change its code. This simplifies admin panel and front-end plugins development. To disable this, run `strapi develop --no-watch-admin` (see [CLI reference](/dev-docs/cli#strapi-develop)).
:::

## Bundlers

2 different bundlers can be used with your Strapi application, [vite](#vite) (the default one) and [webpack](#webpack).

### Vite

In Strapi 5, Vite is the default bundler that Strapi uses to build the admin panel. `vite` will therefore be used by default when you run the `strapi develop` command.

To extend the usage of `vite`, define a function that extends its configuration inside `./my-app/src/admin/vite.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/vite.config.js"
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

```ts title="./my-app/src/admin/vite.config.ts"
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

### Webpack

In Strapi 5, the default bundler is Vite. To use `webpack` as a bundler you will need to pass it as an option to the `strapi develop` command:

```bash
strapi develop --bundler=webpack
```

:::prerequisites
Make sure to rename the default `webpack.config.example.js` file into `webpack.config.[js|ts]` before customizing webpack.
:::

In order to extend the usage of webpack v5, define a function that extends its configuration inside `./my-app/src/admin/webpack.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/webpack.config.js"
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

```ts title="./my-app/src/admin/webpack.config.ts"
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

