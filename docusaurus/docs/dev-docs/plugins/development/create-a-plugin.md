---
title: Plugin creation & setup
description: Learn how to use the Plugin SDK to build and publish a Strapi plugin
pagination_next: dev-docs/plugins/development/plugin-structure
tags:
  - guides
  - plugins
  - Plugin SDK
  - plugins development
---

# Plugin creation

There are many ways to create a Strapi 5 plugin, but the fastest and recommended way is to use the Plugin SDK.

The Plugin SDK is a set of commands orientated around developing plugins to use them as local plugins or to publish them on NPM and/or submit them to the Marketplace.

With the Plugin SDK, you do not need to set up a Strapi project before creating a plugin.

The present guide covers creating a plugin from scratch, linking it to an existing Strapi project, and publishing the plugin. If you already have an existing plugin, you can instead retrofit the plugin setup to utilise the Plugin SDK commands (please refer to the [Plugin SDK reference](/dev-docs/plugins/development/plugin-sdk) for a full list of available commands).

:::note
This guide assumes you want to develop a plugin external to your Strapi project. However, the steps largely remain the same if you want to develop a plugin within your existing project. If you are not [using a monorepo](#working-with-the-plugin-cli-in-a-monorepo-environment) the steps are exactly the same.
:::

## Getting started with the Plugin SDK

The Plugin SDK helps you creating a plugin, linking it to an existing Strapi project, and building it for publishing.

### Creating the plugin

To create your plugin, ensure you are in the parent directory of where you want it to be created and run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn dlx @strapi/sdk-plugin init my-strapi-plugin
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npx @strapi/sdk-plugin:init my-strapi-plugin
```

</TabItem>

</Tabs>

The path `my-strapi-plugin` can be replaced with whatever you want to call your plugin, including the path to where it should be created (e.g., `code/strapi-plugins/my-new-strapi-plugin`).

You will be ran through a series of prompts to help you setup your plugin. If you selected yes to all options the final structure will be similar to the default [plugin structure](/dev-docs/plugins/development/plugin-structure).

### Commands

Inside the plugin code, several commands are available to work with the plugin.

Make sure to start by moving to the plugin folder `cd my-strapi-plugin`

#### `build`

This will build the plugin an make it ready for release

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn build
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run build
```

</TabItem>
</Tabs>

#### `watch`

This will watch the plugin source code for any change and rebuild it everytime. _This can be usefull when you are implementing your plugin and testing it in an application_

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn watch
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run watch
```

</TabItem>

</Tabs>

#### `watch:link`

For testing purposes it is very convenient to link your plugin to an existing application to experiment with it in real condition. This command is made to help you streamline this process.

##### Requirements

- [yalc](https://www.npmjs.com/package/yalc) must be installed globally

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn watch:link
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run watch:link
```

</TabItem>

</Tabs>

#### `verify`

Verifies the plugin is ready to be published

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn verify
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run verify
```

</TabItem>

</Tabs>

## Testing your plugin in a Strapi project

In order to test your plugin during it's development, the recommended approach is to link it to a Strapi project.

Start by running the [`watch:link`](#watchlink) command. _The command will output explanations on how to link your plugin to a Strapi project._

Open a new terminal window and follow the next steps:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
cd /path/to/strapi/project
yarn dlx yalc add --link my-strapi-plugin && yarn install
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
cd /path/to/strapi/project
npx yalc add --link my-strapi-plugin && npm run install
```

</TabItem>

</Tabs>

:::note
In the above examples we use the name of the plugin when linking it to the project. This is the name of the package, not the name of the folder.
:::

Because this plugin is installed via `node_modules` you won't need to explicity add it to your `plugins` [configuration file](/dev-docs/configurations/plugins), so running the [`develop command`](../../cli.md#strapi-develop) will automatically pick up your plugin.

In the Strapi application you can now run

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn develop
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run develop
```

</TabItem>

</Tabs>

You are now ready to develop your plugin how you see fit! If you are making server changes, you will need to restart your server for them to take effect.

## Building the plugin for publishing

When you are ready to publish your plugin, you will need to build it. To do this, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn build && yarn verify
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run build && npm run verify
```

</TabItem>

</Tabs>

The above commands will not only build the plugin, but also verify that the output is valid and ready to be published. You can then publish your plugin to NPM as you would any other package.

## Working with the Plugin SDK in a monorepo environment

If you are working with a monorepo environment to develop your plugin, you don't need to use the `watch:link` command because the monorepo workspace setup will handle the symlink. You can use the `watch` command instead.

However, if you are writing admin code, you might add an `alias` that targets the source code of your plugin to make it easier to work with within the context of the admin panel:

```ts
import path from 'node:path';

export default (config, webpack) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    'my-strapi-plugin': path.resolve(
      __dirname,
      // We've assumed the plugin is local.
      '../plugins/my-strapi-plugin/admin/src'
    ),
  };

  return config;
};
```

:::caution
Because the server looks at the `server/src/index.ts|js` file to import your plugin code, you must use the `watch` command otherwise the code will not be transpiled and the server will not be able to find your plugin.
:::
