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

To replace the favicon:

1. Create a `/src/admin/extensions/` folder if the folder does not already exist.
2. Upload your favicon into `/src/admin/extensions/`.
3. Replace the existing **favicon.png|ico** file at the Strapi application root with a custom `favicon.png|ico` file.
4. Update `/src/admin/app.[tsx|js]` with the following:

   ```js title="./src/admin/app.js"
   import favicon from "./extensions/favicon.png";

   export default {
     config: {
       // replace favicon with a custom icon
       head: {
         favicon: favicon,
       },
     },
   };
   ```

5. Rebuild, launch and revisit your Strapi app by running `yarn build && yarn develop` in the terminal.

:::tip
This same process may be used to replace the login logo (i.e. `AuthLogo`) and menu logo (i.e. `MenuLogo`) (see [logos customization documentation](#logos)).
:::

:::caution
Make sure that the cached favicon is cleared. It can be cached in your web browser and also with your domain management tool like Cloudflare's CDN.
:::

