---
title: Typescript - Strapi Developer Docs
description: Learn how you can use Typescript for your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/typescript.html
---

# TypeScript development

::: callout 🚧  TypeScript documentation
This section is still a work in progress and will continue to be updated and improved. Migrating existing Strapi applications written in JavaScript is not currently recommended. In the meantime, feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
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

## Use TypeScript typings

Strapi provides typings on the `Strapi` class to improve the TypeScript developing experience. These typings come with an autocomplete feature that automatically offers suggestions while developing.

To experience TypeScript-based autocomplete while developing Strapi applications, you could try the following:

1. From your code editor, open the `./src/index.ts` file.
2. In the `register` method, declare the `strapi` argument as of type `Strapi`:

    ```js
    // path: ./src/index.ts

    import '@strapi/strapi';

    export default {
      register( { strapi }: { strapi: Strapi }) {
        // ...
      },
    };
    ```

2. Within the body of the `register` method, start typing `strapi.` and use keyboard arrows to browse the available properties.
3. Choose `runLifecyclesfunction` from the list.
4. When the `strapi.runLifecyclesFunctions` method is added, a list of available lifecycle types (i.e. `register`, `bootstrap` and `destroy`) are returned by the code editor. Use keyboard arrows to choose one of the lifecycles and the code will autocomplete.

## Generate typings for project schemas

To generate typings for your project schemas use the Strapi CLI and the command `content-types:generate-types`. The `content-types:generate-types` command creates the file `schemas.d.ts`, at the project root, which stores the schema typings. The optional `--verbose` flag returns the project type definitions in the terminal.

To use `content-types:generate-types`run the following code in a terminal at the project root:

<code-group>
<code-block title="NPM">

```sh
npm run strapi content-types:generate-types --verbose #optional flag

```

</code-block>

<code-block title="YARN">

```sh
yarn strapi content-types:generate-types --verbose #optional flag

```

</code-block>
</code-group>

## Develop a plugin using TypeScript

New plugins can be generated following the [plugins development documentation](/developer-docs/latest/development/plugins-development.md). There are 2 important distinctions for TypeScript applications:

- After creating the plugin, run `yarn` or `npm install` in the plugin directory `src/admin/plugins/[my-plugin-name]` to install the dependencies for the plugin.
- Run `yarn build` or `npm run build` in the plugin directory `src/admin/plugins/[my-plugin-name]` to build the admin panel including the plugin.

::: note
It is not necessary to repeat the `yarn` or `npm install` command after the initial installation. The `yarn build` or `npm run build` command is necessary to implement any plugin development that affects the admin panel.
:::

## Start Strapi programmatically

To start Strapi programmatically in a TypeScript project the Strapi instance requires the compiled code location. This section describes how to set and indicate the compiled code directory.

### Use the `strapi()` factory

Strapi can be run programmatically by using the `strapi()` factory. Since the code of TypeScript projects is compiled in a specific directory, the parameter `distDir` should be passed to the factory to indicate where the compiled code should be read:

```js
// path: ./src/plugins/<plugin-name>/server/index.js 

const strapi = require('@strapi/strapi');

const app = await strapi({ distDir: './dist' });
```

### Use the `strapi.compile()` function

The `strapi.compile()` function should be mostly used for developing tools that need to start a Strapi instance and detect whether the project includes TypeScript code. `strapi.compile()` automatically detects the project language. If the project code contains any TypeScript code, `strapi.compile()` compiles the code and returns a context with specific values for the directories that Strapi requires:

```js

const strapi = require('@strapi/strapi');

const appContext = await strapi.compile();
const app = await strapi(appContext);

```
