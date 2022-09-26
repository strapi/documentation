---
title: Process Manager - Strapi Developer Docs
description: Learn in this guide how you can start a Strapi application using a process manager.
sidebarDepth: 2
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/process-manager.html
---

# Process manager

!!!include(developer-docs/latest/guides/snippets/guide-not-updated.md)!!!

In this guide we will see how you can start a Strapi application using a process manager. We will use [PM2](https://pm2.keymetrics.io/) in this example.

## Install PM2

PM2 allows you to keep your Strapi project alive and to reload it without downtime.

You will install PM2 globally

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

### Starting with server.js file

The basic usage to start an application with PM2 will be to run a command like this `pm2 start server.js`.

But here we are facing an issue. In your project you don't have a `.js` file to run your Strapi application.

So first let's create a `server.js` file that will let you run the `pm2` command.
::: note
TypeScript projects require additional code in the `server.js` file to identify the correct directory. See the following TypeScript code example or the [TypeScript documentation](/developer-docs/latest/development/typescript.md#start-strapi-programmatically) for additional details.
:::

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

Now you will be able to start your server by running `pm2 start server.js`.

### Starting with strapi command

By default there are 2 important commands.

- `yarn develop` to start your project in development mode.
- `yarn start` to start your app for production.

You can also start your process manager using the `yarn start` command.

`pm2 start npm --name app -- run start`

## Configuration file

PM2 lets you create a config file to save all information to start your server properly at anytime.

By running `pm2 init` it will init an `ecosystem.config.js` in your application.

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

You can see the full documentation of available configuration in the [PM2 ecosystem file documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/).
