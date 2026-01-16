---
title: Favicon
description: Replace the favicon displayed in Strapi's admin panel.
displayed_sidebar: cmsSidebar
sidebar_label: Favicon
toc_max_heading_level: 4
tags:
- admin panel
- admin panel customization
---

# Favicon

Strapi's [admin panel](/cms/admin-panel-customization) displays its branding on various places, including the [logo](/cms/admin-panel-customization/logos) and the favicon. Replacing these images allows you to match the interface and application to your identity.

There are 2 approaches to replacing the favicon:

* Replace the `favicon.png` file at the root of a Strapi project
* Edit the [`strapi::favicon` middleware configuration](/cms/configurations/middlewares#favicon) with the following code:

  ```js title="/config/middlewares.js"
  // …
  {
    name: 'strapi::favicon',
    config: {
      path: 'my-custom-favicon.png',
    },
  },
  // …
  ```

Once done, rebuild, launch and revisit your Strapi app by running `yarn build && yarn develop` in the terminal.

:::caution
Make sure that the cached favicon is cleared. It can be cached in your web browser and also with your domain management tool like Cloudflare's CDN.
:::

