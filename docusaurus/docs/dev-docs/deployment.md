---
title: Deployment
displayed_sidebar: devDocsSidebar
description: Learn how to develop locally with Strapi and deploy Strapi with various hosting options.

---
import DatabaseRequire from '/docs/snippets/database-require.md'
import HardwareRequire from '/docs/snippets/hardware-require.md'
import OperatingSystemRequire from '/docs/snippets/operating-system-require.md'

# Deployment

Strapi provides many deployment options for your project or application. Your Strapi applications can be deployed on traditional hosting servers or your preferred hosting provider. 

The following documentation covers how to develop locally with Strapi and deploy Strapi with several common hosting options.

:::callout ☁️ Strapi Cloud
Don't want to deploy Strapi by yourself? <a href="https://strp.cc/3rywrsu" target="_blank" id="deployment-section-cloud-link">Join the cloud waitlist</a> to soon get access to a platform to easily deploy and host your project.
:::

:::strapi Community Guides
In addition to the official deployment guides maintained by Strapi that are found here, community-maintained guides for additional providers are available in the [Strapi Forum](https://forum.strapi.io/c/community-guides/28).
:::

## General guidelines

### Hardware and software requirements

To provide the best possible environment for Strapi the following requirements apply to development (local) and staging and production workflows.

- Node LTS (v14 or v16) **Odd-number releases of Node are not supported (e.g. v13, v15).**
- NPM v6 (or the version shipped with the LTS Node versions)
- Standard build tools for your OS (the `build-essentials` package on most Debian-based systems)
- Hardware specifications for your server (CPU, RAM, storage):

<HardwareRequire components={props.components} />

- A supported database version:
<DatabaseRequire components={props.components} />

:::strapi Database deployment
Deploying databases along with Strapi is covered in the [databases guide](/dev-docs/configurations/database#databases-installation-guides).
:::

- A supported operating system:

<OperatingSystemRequire components={props.components} />

### Application Configuration

#### 1. Configure

We recommend using environment variables to configure your application based on the environment, for example:

```js
// Path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('APP_HOST', '0.0.0.0'),
  port: env.int('NODE_PORT', 1337),
});
```

Then you can create a `.env` file or directly set environment variables in your chosen deployment platform:

```
APP_HOST=10.0.0.1
NODE_PORT=1338
```

:::tip
To learn more about configuration details, see the [configurations](/dev-docs/configurations) documentation.
:::

#### 2. Launch the server

Before running your server in production you need to build your admin panel for production:

<Tabs groupId="yarn-npm-windows">

<TabItem value="yarn" label="yarn">

```bash
NODE_ENV=production yarn build
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
NODE_ENV=production npm run build
```

</TabItem>

<TabItem value="windows" label="windows">

```bash
npm install cross-env
```

Then in your `package.json` scripts section:

```bash
"build:win": "cross-env NODE_ENV=production npm run build",
```

And run:

```bash
npm run build:win
```

</TabItem>
</Tabs>

Run the server with the `production` settings:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
NODE_ENV=production yarn start
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
NODE_ENV=production npm run start
```

</TabItem>

<TabItem value="windows" label="windows">

```bash
npm install cross-env
```

Then in your `package.json` scripts section:

```bash
"start:win": "cross-env NODE_ENV=production npm start",
```

And run:

```bash
npm run start:win
```

</TabItem>

</Tabs>

:::caution
We highly recommend using [pm2](https://github.com/Unitech/pm2/) to manage your process.
:::

If you need a server.js file to be able to run `node server.js` instead of `npm run start` then create a `./server.js` file as follows:

```js title="path: ./server.js"

const strapi = require('@strapi/strapi');
strapi(/* {...} */).start();
```

:::caution

If you are developing a `TypeScript`-based project you must provide the `distDir` option to start the server.
For more information, consult the [TypeScript documentation](/dev-docs/typescript#use-the-strapi-factory).
:::

### Advanced configurations

If you want to host the administration on another server than the API, [please take a look at this dedicated section](/dev-docs/admin-panel-customization#deployment).

## Deployment Guides

Manual guides for deployment and optional software:

<DocCardList />
