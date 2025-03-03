---
title: Admin panel customization - URL, host, and path configuration
description: Learn more about configuring the URL, host, and path to access Strapi's admin panel.
displayed_sidebar: cmsSidebar
sidebar_label: URL, host, and port configuration
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization

---

# Admin panel customization: Host, port, and path configuration

By default, Strapi's [admin panel](/cms/admin-panel-customization) is exposed via <ExternalLink to="http://localhost:1337/admin" text="http://localhost:1337/admin"/>. For security reasons, the host, port, and path can be updated.

## Update the admin panel's path only

Unless you chose to deploy Strapi's back-end server and admin panel server on different servers (see [deployment](/cms/admin-panel-customization/deployment)), by default:

- The back-end server and the admin panel server of Strapi both run on the same host and port, which is `http://localhost:1337/`.
- The admin panel is accessible at the `/admin` path while the back-end server is accessible at the `/api` path.

To make the admin panel accessible at another path, for instance at `http://localhost:1337/dashboard`, define or update the `url` property in the [admin panel configuration file](/cms/configurations/admin-panel) as follows:

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  // … other configuration properties
  url: "/dashboard",
});
```

Since by default the back-end server and the admin panel server run on the same host and port, only updating the `config/admin.[ts|js]` file should work if you left the `host` and `port` property values untouched in the [server configuration](/cms/configurations/server) file, which should be as follows:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

</TabItem>
</Tabs>

## Update the admin panel's host and port

If the admin panel and the back-end server of Strapi are not hosted on the same server (see [deployment](/cms/admin-panel-customization/deployment)), you will need to update the host and port of the admin panel.

This is done in the admin panel configuration file, for example to host the admin panel on `my-host.com:3000` properties should be updated follows:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  host: "my-host.com",
  port: 3000,
  // Additionally you can define another path instead of the default /admin one 👇
  // url: '/dashboard' 
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/admin.ts"
export default ({ env }) => ({
  host: "my-host.com",
  port: 3000,
  // Additionally you can define another path instead of the default /admin one 👇
  // url: '/dashboard'
});
```

</TabItem>
</Tabs>

<br/>

:::strapi Other admin panel configurations
The `/config/admin.[ts|js]` file can be used to configure many other aspects. Please refer to the [admin panel configuration](/cms/configurations/admin-panel) documentation for details.
:::
