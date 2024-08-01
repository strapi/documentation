---
title: Admin panel customization - URL, host, and port
# description: todo
sidebar_label: URL, host, and port
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization

---

# Admin panel customization: Access URL, host, and port

By default, the administration panel is exposed via [http://localhost:1337/admin](http://localhost:1337/admin). For security reasons, this path can be updated.

**Example:**

To make the admin panel accessible from `http://localhost:1337/dashboard`, use this in the [server configuration](/dev-docs/configurations/server) file:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  url: "/dashboard",
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  url: "/dashboard",
});
```

</TabItem>
</Tabs>

:::strapi Advanced settings
For more advanced settings please see the [admin panel configuration](/dev-docs/configurations/admin-panel) documentation.
:::

#### Host and port

:::note
From 4.15.1 this is now deprecated. The strapi server now supports the live updating of the admin panel in development mode.
:::

By default, the front end development server runs on `localhost:8000` but this can be modified:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  host: "my-host",
  port: 3000,
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  host: "my-host",
  port: 3000,
});
```

</TabItem>
</Tabs>
