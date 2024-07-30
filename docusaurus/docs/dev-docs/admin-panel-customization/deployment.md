---
title: Admin panel deployment
# description: todo
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
- deployment

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

## Deployment

The administration is a React front-end application calling an API. The front end and the back end are independent and can be deployed on different servers, which brings us to different scenarios:

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

<TabItem value="strapi-cli" label="Strapi CLI">

```sh
strapi build
```

</TabItem>

</Tabs>

This will replace the folder's content located at `./build`. Visit [http://localhost:1337/admin](http://localhost:1337/admin) to make sure customizations have been taken into account.

### Same server

Deploying the admin panel and the API on the same server is the default behavior. The build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

:::tip
You might want to [change the path to access the administration panel](#access-url).
:::

### Different servers

To deploy the front end and the back end on different servers, use the following configuration:

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
  url: "/", // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
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
  url: "/", // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>
</Tabs>

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your app. To do so, use a proxy server like Nginx (see [optional software guides](/dev-docs/deployment#optional-software-guides)).
:::
