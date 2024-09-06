---
title: How to use the Plugin CLI to build and publish a Strapi plugin
description: Learn how to use the Plugin CLI to build and publish a Strapi plugin
sidebar_label: Use the Plugin CLI
displayed_sidebar: devDocsSidebar
tags:
  - guides
  - plugins
  - plugin CLI
  - plugins development guides
---

import NotV5 from '/docs/snippets/\_not-updated-to-v5.md'

# How to use the Plugin CLI to create and publish a Strapi plugin

The Plugin CLI is set of commands orientated around developing plugins to use them as local plugins or to publish them on NPM and/or submit them to the Marketplace.

As opposed to the `strapi generate plugin` command (see [plugin creation and setup](/dev-docs/plugins/development/create-a-plugin)) you do not need to set up a Strapi project to use the Plugin CLI.

The present guide covers creating a plugin from scratch, linking it to an existing Strapi project, and publishing the plugin. If you already have an existing plugin, you can instead retrofit the plugin setup to utilise the Plugin CLI commands (please refer to the [Plugin CLI reference](/dev-docs/plugins/development/plugin-cli) for a full list of available commands).

## Getting started with the Plugin CLI

:::note
This guide assumes you want to develop a plugin external to your Strapi project. However, the steps largely remain the same if you want to develop a plugin within your existing project. If you are not [using a monorepo](#working-with-the-plugin-cli-in-a-monorepo-environment) the steps are exactly the same.
:::

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

### Linking the plugin to your project

Once you created your plugin, you will want to register it with the [yalc](https://github.com/wclr/yalc) repository (it's local to your machine). To do this, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
cd my-strapi-plugin
yarn install
yarn link-watch
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
cd my-strapi-plugin
npm install
npm run link-watch
```

</TabItem>

</Tabs>

This will then produce an output explaing how to link your plugin to your Strapi project. Open a new terminal window to do the next steps:

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

Because this plugin is installed via `node_modules` you won't need to explicity add it to your `plugins` [configuration file](/dev-docs/configurations/plugins), so running the [`develop command`](../../cli.md#strapi-develop) will automatically pick up your plugin. However, to improve your experience we recommend you run Strapi with the `--watch-admin` flag so that your admin panel is automatically rebuilt when you make changes to your plugin:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn develop --watch-admin
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run develop --watch-admin
```

</TabItem>

</Tabs>

You are now ready to develop your plugin how you see fit! If you are making server changes, you will need to restart your server for them to take effect.

### Building the plugin for publishing

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

## Working with the plugin CLI in a monorepo environment

If you are working with a monorepo environment to develop your plugin, you don't need to use the `link-watch` command because the monorepo workspace setup will handle the symlink. You can use the `watch` command instead.

However, if you are writing admin code, you might add an `alias` that targets the source code of your plugin to make it easier to work with within the context of the admin panel:

```ts
import path from "node:path";

export default (config, webpack) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    "my-strapi-plugin": path.resolve(
      __dirname,
      // We've assumed the plugin is local.
      "../plugins/my-strapi-plugin/admin/src"
    ),
  };

  return config;
};
```

:::caution
Because the server looks at the `strapi-server.js` file to import your plugin code, you must use the `watch` command otherwise the code will not be transpiled and the server will not be able to find your plugin.
:::
