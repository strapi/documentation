---
title: Plugin SDK
description: Reference documentation for Strapi's Plugin SDK commands
displayed_sidebar: devDocsSidebar
tags:
  - backend server
  - Plugin SDK
  - plugins
  - plugins development
---

# Plugin SDK reference

The Plugin SDK is set of commands provided by the package [@strapi/sdk-plugin](https://github.com/strapi/sdk-plugin) orientated around developing plugins to use them as local plugins or to publish them on NPM and/or submit them to the Marketplace.

The present documentation lists the available Plugin SDK commands. The [associated guide](/dev-docs/plugins/development/create-a-plugin) illustrates how to use these commands to create a plugin from scratch, link it to an existing project, and publish it.

## npx @strapi/sdk-plugin init

Create a new plugin at a given path.

```bash
npx @strapi/sdk-plugin init /path/to/my-plugin
```

| Arguments |  Type  | Description        | Default                   |
| --------- | :----: | ------------------ | ------------------------- |
| `path`    | string | Path to the plugin | `./src/plugins/my-plugin` |

| Option        | Type | Description                             | Default |
| ------------- | :--: | --------------------------------------- | ------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs | false   |
| `--silent`    |  -   | Do not log anything                     | false   |

## strapi-plugin build

Bundle the Strapi plugin for publishing.

```bash
strapi-plugin build
```

| Option         |  Type  | Description                                                                                                       | Default |
| -------------- | :----: | ----------------------------------------------------------------------------------------------------------------- | ------- |
| `--force`      | string | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively. | -       |
| `-d, --debug`  |   -    | Enable debugging mode with verbose logs                                                                           | false   |
| `--silent`     |   -    | Do not log anything                                                                                               | false   |
| `--minify`     |   -    | Minify the output                                                                                                 | true    |
| `--sourcemaps` |   -    | Produce sourcemaps                                                                                                | false   |

## strapi-plugin watch:link

Recompiles the plugin automatically on changes and runs `yalc push --publish`.

For testing purposes, it is very convenient to link your plugin to an existing application to experiment with it in real condition. This command is made to help you streamline this process.

```bash
strapi-plugin watch:link
```

| Option        | Type | Description                             | Default |
| ------------- | :--: | --------------------------------------- | ------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs | false   |
| `--silent`    |  -   | Do not log anything                     | false   |

## strapi-plugin watch

Watch the plugin source code for any change and rebuild it everytime. Useful when implementing your plugin and testing it in an application.

```bash
strapi-plugin watch
```

| Option        | Type | Description                             | Default |
| ------------- | :--: | --------------------------------------- | ------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs | false   |
| `--silent`    |  -   | Do not log anything                     | false   |

## strapi-plugin verify

Verify the output of the plugin before publishing it.

```bash
strapi-plugin verify
```

| Option        | Type | Description                             | Default |
| ------------- | :--: | --------------------------------------- | ------- |
| `-d, --debug` |  -   | Enable debugging mode with verbose logs | false   |
| `--silent`    |  -   | Do not log anything                     | false   |
