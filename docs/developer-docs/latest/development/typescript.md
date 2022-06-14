---
title: Typescript - Strapi Developer Docs
description: Learn how you can use Typescript for your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/databases/typescript.html
---

# TypeScript development

::: callout 🚧  TypeScript documentation
This section is still a work in progress and will continue to be updated and improved. Migrating existing Strapi applications written in JavaScript is not currently recommended. In the meantime, feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io). Check the [beta documentation](docs-next.strapi.io) for faster access to TypeScript documentation.
:::

TypeScript adds an additional type system layer above JavaScript, which means that existing JavaScript code is also TypeScript code. Strapi supports TypeScript in new projects on v4.2.0 and above. TypeScript-enabled projects allow developing plugins with TypeScript as well as using TypeScript typings.

::: strapi Getting started with TypeScript
To start developing in TypeScript, use the [CLI documentation](/developer-docs/latest/setup-deployment-guides/installation/cli.md) to create a new TypeScript project. Additionally, the [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) and [TypeScript configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/typescript.md) sections have TypeScript-specific resources for understanding and configuring an application.
:::

## Start developing in TypeScript

Starting the development environment for a TypeScript-enabled project requires building the admin panel prior to starting the server. In development mode, the application source code is compiled to the `./dist/build` directory and recompiled with each change in the Content-type Builder. To start the application, run the following commands in the root directory:

<code-group>

<code-block title="NPM">

```sh
npm run build
npm run develop
```

</code-block>

 <code-block title="YARN">

```sh
yarn build
yarn develop
```

</code-block>

</code-group>

## Develop a plugin using TypeScript

New plugins can be generated following the [plugins development documentation](/developer-docs/latest/development/plugins-development.md). There are 2 important distinctions for TypeScript applications:

- After creating the plugin, run `yarn install` or `npm run install` in the plugin directory `src/admin/plugins/[my-plugin-name]` to install the dependencies for the plugin.
- Run `yarn build` or `npm run build` in the plugin directory `src/admin/plugins/[my-plugin-name]` to build the admin panel including the plugin.

::: note
It is not necessary to repeat the `yarn install` or `npm run install` command after the initial installation. The `yarn build` or `npm run build` command is necessary to implement any plugin development that affects the admin panel.
:::
