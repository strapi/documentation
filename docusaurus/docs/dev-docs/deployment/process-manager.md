---
title: Process Manager
description: How to install and start a Strapi application using a process manager.
sidebarDepth: 2

---

# Process manager

Process managers allow you to keep your Strapi application running and to reload it without downtime. The following documentation uses the [PM2](https://pm2.keymetrics.io/) process manager and describes:

- installing PM2,
- starting Strapi using a `server.js` file,
- starting Strapi using the `strapi` command,
- starting and managing Strapi using an `ecosystem.config.js` file.

The appropriate procedure for starting PM2 depends on the hosting provider and your application configuration.

## Install PM2

Install PM2 globally:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn global add pm2
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install pm2 -g
```

</TabItem>

</Tabs>

## Start PM2 with a `server.js` file

The basic usage to start an application with PM2 is to run a command such as `pm2 start server.js`. To configure and run your application:

1. Create a `server.js` file at the application root.
2. Add the following code snippet to the `server.js` file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./server.js"

const strapi = require('@strapi/strapi');
strapi().start();
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./server.js"
const strapi = require("@strapi/strapi");
const app = strapi({ distDir: "./dist" });
app.start();
```

</TabItem>

</Tabs>

3. Start the server by running `pm2 start server.js` in the project root directory.

:::note
TypeScript projects require additional code in the `server.js` file to identify the correct directory. See the previous TypeScript code example or the [TypeScript documentation](/dev-docs/typescript#start-strapi-programmatically) for additional details.
:::

## Start PM2 with the `strapi` command - Production

To start PM2 and your application from a terminal you should start PM2 and pass the application name and start command as arguments:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
pm2 start yarn --name your-app-name -- start

```

</TabItem>

<TabItem value="npm" label="npm">

```bash
pm2 start npm --name your-app-name -- run start

```

</TabItem>

</Tabs>

## Start PM2 with the `strapi` command - Development

To start PM2 and your development application from a terminal you should start PM2 and pass the application name and start command as arguments:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
pm2 start yarn --name your-app-name -- develop

```

</TabItem>

<TabItem value="npm" label="npm">

```bash
pm2 start npm --name your-app-name -- run develop

```

</TabItem>

</Tabs>

## Start and configure PM2 with a `config.js` file

A PM2 configuration file allows you to save the information necessary to start your server properly at any time. This is commonly used for cloud hosting providers, where you might not have access to a terminal window to start the server. To use a configuration file:

1. Run `pm2 init` at the application root to create an `ecosystem.config.js` file.
2. Replace the `ecosystem.config.js` file content with the following code example:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```js title="path: ./ecosystem.config.js"
module.exports = {
      apps: [
        {
          name: 'app',
          script: 'yarn',
          args: 'start',
        },
      ],
    };
```

</TabItem>

<TabItem value="npm" label="npm">

```js title="path: ./ecosystem.config.js"
module.exports = {
      apps: [
        {
          name: 'app',
          script: 'npm',
          args: 'start',
        },
      ],
    };
```

</TabItem>

</Tabs>

3. Run `pm2 start ecosystem.config.js` to start the PM2 process.

:::note
The `ecosystem.config.js` code example is the minimum configuration. The [PM2 ecosystem file documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/) provides all of the configuration options.
:::
