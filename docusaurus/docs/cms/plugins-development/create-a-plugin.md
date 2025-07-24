---
title: Plugin creation & setup
description: Learn how to use the Plugin SDK to build and publish a Strapi plugin
pagination_next: cms/plugins-development/plugin-structure
tags:
  - guides
  - plugins
  - Plugin SDK
  - plugins development
---

# Plugin creation

This guide walks you through the complete process of creating, developing, and publishing Strapi 5 plugins that can be used locally or distributed via NPM and the Marketplace. The Plugin SDK is the recommended way to build plugins, providing a comprehensive toolkit from initial setup to publishing.

The complete list of commands and their parameters are available in the [Plugin SDK reference](/cms/plugins-development/plugin-sdk). This page will guide you through using the main ones.

Before proceeding with plugin development, it's important to understand the difference between local and external plugins:

- **Local plugins**: Plugins that are developed within your Strapi project (typically in a `plugins` folder).
- **External plugins**: Plugins that are developed outside your Strapi project (in a separate directory).

The Plugin SDK can create both types of plugins. If you run the Plugin SDK command from within an existing Strapi project, it will create a local plugin. If you run it from outside a Strapi project, it will create an external plugin. The development process differs slightly between the two approaches, as outlined in the sections below.

In addition to the plugin location, your Strapi project and plugin can be organized in different repository setups, which affects the development workflow:

- **Separate repositories**: Your Strapi project and plugin are in different repositories. This is common for external plugins that you plan to publish or share across multiple projects.
- **Monorepo setup**: Your Strapi project and plugin are in the same repository, often using workspace management tools like Yarn workspaces or npm workspaces. This is useful when you want to maintain everything in one place.

The development workflow and commands you use will vary based on both the plugin type (local vs external) and the repository setup (separate vs monorepo), as detailed in the sections below.

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
npx @strapi/sdk-plugin init my-strapi-plugin
```

</TabItem>

</Tabs>

The path `my-strapi-plugin` can be replaced with whatever you want to call your plugin, including the path to where it should be created (e.g., `code/strapi-plugins/my-new-strapi-plugin`).

You will be guided through a series of prompts to help you set up your plugin. If you select "yes" to all options, the final structure will be similar to the default [plugin structure](/cms/plugins-development/plugin-structure).

### Developing local plugins

If you run the Plugin SDK command from within an existing Strapi project, the plugin will be created in a `plugins` folder within that project. If a `plugins` folder already exists, the new plugin code will be placed there. This allows you to develop plugins locally within your project structure.

When developing your plugin locally, you also need to add the following configuration to your plugins configuration file:

```js title="/config/plugins.js|ts"
myplugin: {
  enabled: true,
  resolve: `./src/plugins/local-plugin`,
},
```

:::note
This setup can sometimes lead to errors such as:

```js
Error: 'X must be used within StrapiApp';
```

This error often occurs when your plugin attempts to import core Strapi functionality, for example using:

```js
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
```

To resolve this issue, remove `@strapi/strapi` as a dev dependency from your plugin. This ensures that your plugin uses the same instance of Strapi's core modules as the main application, preventing conflicts and the associated errors.
:::

Use the `watch` command in your plugin folder to start development mode:

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

Then run `yarn develop` or `npm run develop` in your Strapi project to start the application with your local plugin.

### External plugins development

:::prerequisites
<ExternalLink to="https://www.npmjs.com/package/yalc" text="yalc"/> must be installed globally (with `npm install -g yalc` or `yarn global add yalc`).

**Why yalc?** `yalc` is a local package manager that enables efficient plugin development by allowing you to test your plugin in a real Strapi project without publishing it to npm first. It provides reliable linking between your plugin and Strapi project for immediate testing during development.
:::

For external plugins (plugins that don't sit within your Strapi project), you need to link them to a Strapi project for testing during development. This is done using the `watch:link` command in your plugin folder, which will output explanations on how to link your plugin to a Strapi project.

First, in your plugin folder, run the `watch:link` command:

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

Then, in a new terminal window, run the following commands in your Strapi project:

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
npx yalc add --link my-strapi-plugin && npm install
```

</TabItem>

</Tabs>

:::note
In the above examples, we use the name of the plugin (`my-strapi-plugin`) when linking it to the project. This is the name of the package, not the name of the folder.
:::

:::note
If you're working in a monorepo environment, you don't need `yalc` because the monorepo workspace setup handles the symlinking automatically.
:::

Because this plugin is installed via `node_modules`, you won't need to explicitly add it to your `plugins` configuration file as we would do for a local plugin. Running the `develop` command to start your Strapi project will automatically pick up your plugin.

Now that your plugin is linked to a project, run `yarn develop` or `npm run develop` to start the Strapi application.

You are now ready to develop your plugin as needed! If you are making server changes, you will need to restart your server for them to take effect.

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

These commands will not only build the plugin but also verify that the output is valid and ready to be published. You can then publish your plugin to NPM as you would any other package.

## Admin panel development

If you are writing admin code, you might add an `alias` that targets the source code of your plugin to make it easier to work with within the context of the admin panel:

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
