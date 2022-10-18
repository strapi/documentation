---
title: Process Manager - Strapi Developer Docs
description: Learn in this guide how you can start a Strapi application using a process manager.
sidebarDepth: 2
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/process-manager.html
---

<!-- TO DO:
2. reorg 
3. proofread
4. test

-->

# Process manager

Start a Strapi application using a process manager. Process managers allow you to keep your Strapi application running and to reload it without downtime. [PM2](https://pm2.keymetrics.io/) is used in this example.

## Install PM2

Install PM2 globally:

<code-group>

<code-block title="YARN">
```sh
yarn global add pm2
```
</code-block>

<code-block title="NPM">
```sh
npm install pm2 -g
```
</code-block>

</code-group>

## Basic usage

There are multiple approaches to starting an application with the PM2 process manager. 

### Starting with server.js file

The basic usage to start an application with PM2 is to run a command such as `pm2 start server.js`. To configure and run your application:

1. Create a `server.js` file at the application root.
2. add the following code snippet to the `server.js` file:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: `./server.js`

const strapi = require('@strapi/strapi');
strapi().start();
```

</code-block>
<code-block title="TYPESCRIPT">

```js
// path: `./server.js`

const strapi = require('@strapi/strapi');
const app = strapi({ distDir: '<path_to_your_out_dir>' });
app.start();
```

</code-block>
</code-group>

::: note
TypeScript projects require additional code in the `server.js` file to identify the correct directory. See the previous TypeScript code example or the [TypeScript documentation](/developer-docs/latest/development/typescript.md#start-strapi-programmatically) for additional details.
:::

3. Start the server by running `pm2 start server.js` in the project root directory.

### Starting with strapi command

By default there are 2 important commands.

- `yarn develop` to start your project in development mode.
- `yarn start` to start your app for production.

You can also start your process manager using the `yarn start` command.

`pm2 start npm --name app -- run start`

## Using PM2 with cloud hosting providers

PM2 lets you create a config file to save all information to start your server properly at anytime.

By running `pm2 init` it will create an `ecosystem.config.js` in your application.

Then replace the content of this file by the following code.

```js
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

And then run `pm2 start ecosystem.config.js` to start the pm2 process.

The [PM2 ecosystem file documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/) provides all of the configuration options. 
