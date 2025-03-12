---
title: Admin panel deployment
description: Learn more about deploying Strapi's admin panel in various scenarios.
displayed_sidebar: cmsSidebar
sidebar_label: Deployment
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
- deployment
---

# Admin panel deployment

The front-end part of Strapi is called the admin panel. The admin panel presents a graphical user interface to help you structure and manage the content that will be accessible to your application's own front-end through Strapi's Content API.

The admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application.

The [back-end server](/cms/backend-customization) of Strapi serves the Content API which provides endpoints to your content.

By default, the back-end server and the admin panel server are deployed on the same server. But the admin panel and the back-end server are independent and can be deployed on different servers, which brings us to different scenarios:

- Deploy the entire project on the same server.
- Deploy the administration panel on a server (AWS S3, Azure, etc) different from the API server.

Build configurations differ for each case.

Before deployment, the admin panel needs to be built, by running the following command from the project's root directory:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn build
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm run build
```

</TabItem>

</Tabs>

This will replace the folder's content located at `./build`. Visit <ExternalLink to="http://localhost:1337/admin" text="http://localhost:1337/admin"/> to make sure customizations have been taken into account.

## Same server

Deploying the admin panel and the back end (API) of Strapi on the same server is the default behavior. The build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

:::tip
You might want to [change the path to access the administration panel](/cms/admin-panel-customization/host-port-path).
:::

## Different servers

To deploy the admin panel and the back end (API) of Strapi on different servers, use the following configuration:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  /**
   * Note: The administration will be accessible from the root of the domain 
   * (ex: http://yourfrontend.com/)
   */ 
  url: "/",
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  /**
   * Note: The administration will be accessible from the root of the domain 
   * (ex: http://yourfrontend.com/)
   */ 
  url: "/",
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>
</Tabs>

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your application. To do so, use a proxy server like Nginx (see [optional software deployment guides](/cms/deployment#additional-resources)).
:::
