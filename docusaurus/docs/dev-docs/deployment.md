---
title: Deployment
displayed_sidebar: devDocsSidebar
description: Learn how to develop locally with Strapi and deploy Strapi with various hosting options.
tags:
- database deployment
- deployment
- project creation
- hosting provider
- hosting server
---

import DatabaseRequire from '/docs/snippets/database-require.md'
import HardwareRequire from '/docs/snippets/hardware-require.md'
import OperatingSystemRequire from '/docs/snippets/operating-system-require.md'
import InstallPrereq from '/docs/snippets/installation-prerequisites.md'

# Deployment

Strapi provides many deployment options for your project or application. Your Strapi applications can be deployed on traditional hosting servers or your preferred hosting provider.

The following documentation covers the basics of how to prepare Strapi for deployment on with several common hosting options.

:::strapi Strapi Cloud
You can use [Strapi Cloud](/cloud/intro) to quickly deploy and host your project.
:::

:::tip
If you already created a data structure with the Content-Type Builder and added some data through the Content Manager to your local (development) Strapi instance, you can leverage the [data management system](/dev-docs/data-management) to transfer data from a Strapi instance to another one.

Another possible workflow is to first create the data structure locally, push your project to a git-based repository, deploy the changes to production, and only then add content to the production instance.
:::

## General guidelines

### Hardware and software requirements

To provide the best possible environment for Strapi the following requirements apply to development (local) and staging and production workflows.

<InstallPrereq />

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

```js title="/config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
});
```

Then you can create a `.env` file or directly set environment variables in your chosen deployment platform:

```
HOST=10.0.0.1
PORT=1338
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
strapi.createStrapi(/* {...} */).start();
```

:::caution

If you are developing a `TypeScript`-based project you must provide the `distDir` option to start the server.
For more information, consult the [TypeScript documentation](/dev-docs/typescript#use-the-strapi-factory).
:::

### Advanced configurations

If you want to host the administration on another server than the API, [please take a look at this dedicated section](/dev-docs/admin-panel-customization/deployment).

## Additional resources

:::prerequisites
* Your Strapi project is [created](/dev-docs/installation) and its code is hosted on GitHub.
* You have read the [general deployment guidelines](/dev-docs/deployment#general-guidelines).
:::

The [integrations page](https://strapi.io/integrations) of the Strapi website include information on how to integrate Strapi with many resources, including how to deploy Strapi on the following 3rd-party platforms:

<CustomDocCard emoji="🔗" small title="Deploy Strapi on AWS"  link="https://strapi.io/integrations/aws" />

<CustomDocCard emoji="🔗" small title="Deploy Strapi on Azure" link="https://strapi.io/integrations/azure" />

<CustomDocCard emoji="🔗" small title="Deploy Strapi on DigitalOcean App Platform"  link="https://strapi.io/integrations/digital-ocean" />

<CustomDocCard emoji="🔗" small title="Deploy Strapi on Heroku" link="https://strapi.io/integrations/heroku" />

<br/>

In addition, community-maintained guides for additional providers are available in the [Strapi Forum](https://forum.strapi.io/c/community-guides/28). This includes the following guides:

<CustomDocCard emoji="🔗" small title="Proxying with Caddy" link="https://forum.strapi.io/t/caddy-proxying-with-strapi/" />
<CustomDocCard emoji="🔗" small title="Proxying with HAProxy" link="https://forum.strapi.io/t/haproxy-proxying-with-strapi/" />
<CustomDocCard emoji="🔗" small title="Proxying with NGinx" link="https://forum.strapi.io/t/nginx-proxing-with-strapi/" />
<CustomDocCard emoji="🔗" small title="Using the PM2 process manager" link="https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/" />
