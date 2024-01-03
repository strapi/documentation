---
title: Plugin CLI (experimental)
description: Learn how to create a plugin with our new dedicated CLI commands
displayed_sidebar: devDocsSidebar
---

:::warning
The plugin CLI commands are considered experimental.
:::

The plugin CLI is set of commands orientated around developing plugins both locally (within your existing Strapi project) and externally e.g. if you intend to publish your plugin to NPM. To use the CLI you _do not_ need to set up a project with it, you can instead retrofit your existing plugin setup to utilise these commands. If you're doing this, jump to the [available commands](#available-commands) section.

## Getting started with the plugin CLI

:::note
To show the fully ability of the suite, this guide assumes you want to develop a plugin external to your strapi project. However, the steps largely remain the same if you want to develop a plugin within your existing project. If you're not using a monorepo the steps are exactly the same.
:::

### Creating the plugin

To create your plugin, ensure you're in the parent directory of where you want it to be created and run the following command

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn dlx @strapi/strapi plugin:init my-strapi-plugin
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npx @strapi/strapi plugin:init my-strapi-plugin
```

</TabItem>

</Tabs>

The path `my-strapi-plugin` can be replaced with whatever you want to call your plugin, including the path to where it should be created e.g. `code/strapi-plugins/my-new-strapi-plugin`.

You'll be ran through a series of prompts to help you setup your plugin so the plugin structure you're left with may not look exactly this, but if you selected yes to all options then it will look similar:

```shell
my-strapi-plugin/
├─ admin/
│  ├─ src/ # there's more in here, but we'll let you discover that!
│  ├─ custom.d.ts
│  ├─ tsconfig.build.json
│  ├─ tsconfig.json
├─ server/
│  ├─ src/ # there's more in here, but we'll let you discover that!
│  ├─ tsconfig.build.json
│  ├─ tsconfig.json
├─ .editorconfig
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ package.json
├─ README.md
├─ strapi-server.js
```

### Linking the plugin to your project

Now you've created your plugin, you'll want to register it with the [yalc](https://github.com/wclr/yalc) repository (it's local to your machine). To do this, run the following command:

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

This will then produce an output explaing how to then link your plugin to your strapi project. You'll want to do the next steps in a different terminal window.

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
In the above examples we use the name of the plugin when linking it to the project, this is the name of the package, not the name of the folder.
:::

Because this plugin is installed via `node_modules` you won't need to explicity add it to your `plugins` config file, so running the [`develop command`](../../cli.md#strapi-develop) will automatically pick up your plugin. However, to improve your experience we recommend you run strapi with the `--watch-admin` flag so that your admin panel is automatically rebuilt when you make changes to your plugin.

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

You're now ready to develop your plugin how you see fit! If you're making server changes, you will need to restart your server for them to take effect.

### Building the plugin for publishing

When you're ready to publish your plugin, you'll want to build it. To do this, run the following command:

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

If you're working with a monorepo environment to develop your plugin then you won't need to use the `link-watch` command because the monorepo workspace setup will handle the symlink. You can use the `watch` command instead. However, if you're writing admin code, you might adding an `alias` that targets the source code of your plugin to make it easier to work with within the context of the admin panel.

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

:::warning
Because the server looks at the `strapi-server.js` file to import your plugin code, you must use the `watch` command otherwise the code will not be transpiled and the server will not be able to find your plugin.
:::

## Available Commands

### strapi plugin:build

Bundle your strapi plugin for publishing.

```bash
strapi plugin:build
```

| Option         |  Type  | Description                                                                                                       |
| -------------- | :----: | ----------------------------------------------------------------------------------------------------------------- |
| `--force`      | string | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively. |
| `-d, --debug`  |   -    | Enable debugging mode with verbose logs (default: false)                                                          |
| `--silent`     |   -    | Don't log anything (default: false)                                                                               |
| `--minify`     |   -    | Minify the output (default: true)                                                                                 |
| `--sourcemaps` |   -    | Produce sourcemaps (default: false)                                                                               |

### strapi plugin:init

Create a new plugin at a given path.

```bash
strapi plugin:init <path>
```

| Arguments |  Type  | Description                                             |
| --------- | :----: | ------------------------------------------------------- |
| `path`    | string | path to the plugin (default: "./src/plugins/my-plugin") |

| Option        | Type | Description                                              |
| ------------- | :--: | -------------------------------------------------------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs (default: false) |
| `--silent`    |  -   | Don't log anything (default: false)                      |

### strapi plugin:link-watch

Recompiles your plugin automatically on changes and runs `yalc push --publish`.

```bash
strapi plugin:link-watch
```

| Option        | Type | Description                                              |
| ------------- | :--: | -------------------------------------------------------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs (default: false) |
| `--silent`    |  -   | Don't log anything (default: false)                      |

### strapi plugin:watch

Watch & compile your strapi plugin for local development.

```bash
strapi plugin:watch
```

| Option        | Type | Description                                              |
| ------------- | :--: | -------------------------------------------------------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs (default: false) |
| `--silent`    |  -   | Don't log anything (default: false)                      |

### strapi plugin:verify

Verify the output of your plugin before publishing it.

```bash
strapi plugin:verify
```

| Option        | Type | Description                                              |
| ------------- | :--: | -------------------------------------------------------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs (default: false) |
| `--silent`    |  -   | Don't log anything (default: false)                      |
