---
title: TypeScript development
description: Learn more about TypeScript usage with Strapi 5
displayed_sidebar: cmsSidebar
tags:
- strapi() factory
- strapi.compile() function
- typescript
- plugins development
---

# TypeScript Development with Strapi 

While developing a [TypeScript](/cms/typescript)-based application with Strapi, you can:

- access [typings for the `Strapi`](#use-strapi-typescript-typings) class with autocompletion,
- [generate typings](#generate-typings-for-content-types-schemas) for your project's content-types,
- [start Strapi programmatically](#start-strapi-programmatically),
- and follow some TypeScript-specific instructions for [plugins development](#develop-a-plugin-using-typescript).

## Use `Strapi` TypeScript typings

Strapi provides typings on the `Strapi` class to enhance the TypeScript development experience. These typings come with an autocomplete feature that automatically offers suggestions while developing.

To experience TypeScript-based autocomplete while developing Strapi applications, you could try the following:

1. Open the `./src/index.ts` file from your code editor.
2. Declare the `strapi` argument as type `Strapi` within the global `register` method:

    ```typescript title="./src/index.ts"
    import { Strapi } from '@strapi/strapi';

    export default {
      register({ strapi }: { strapi: Strapi }) {
        // ...
      },
    };
    ```

3. Within the body of the `register` method, start typing `strapi.` and use keyboard arrows to browse the available properties.

4. Choose `runLifecyclesFunctions` from the list.

5. When the `strapi.runLifecyclesFunctions` method is added, a list of available lifecycle types (i.e. `register`, `bootstrap` and `destroy`) are returned by the code editor. Use keyboard arrows to choose one of the lifecycles and the code will autocomplete.

## Generate typings for content-types schemas

To generate typings for your project schemas use the [`ts:generate-types` CLI command](/cms/cli#strapi-ts). The `ts:generate-types` command creates the folder `types`, at the project root, which stores the typings for your project. The optional `--debug` flag returns a detailed table of the generated schemas.

To use `ts:generate-types`run the following code in a terminal at the project root:

<Tabs groupId="yarn-npm">
<TabItem value="npm">

```sh
npm run strapi ts:generate-types --debug #optional flag to display additional logging
```

</TabItem>

<TabItem value="yarn">

```sh
yarn strapi ts:generate-types --debug #optional flag to display additional logging
```

</TabItem>
</Tabs>

:::tip Tip: Automatically generate types
Types can be automatically generated on server restart by adding `autogenerate: true` to [the `config/typescript.js|ts` configuration file](/cms/configurations/typescript#strapi-specific-configuration-for-typescript).
:::

:::tip Tip: Using types in your front-end application
To use Strapi types in your front-end application, you can [use a workaround](https://github.com/strapi-community/strapi-typed-fronend) until Strapi implements an official solution.
:::

### Fix build issues with the generated types

The generated types can be excluded so that the Entity Service doesn't use them and falls back on looser types that don't check the actual properties available in the content types.

To do that, edit the `tsconfig.json` of the Strapi project and add `types/generated/**` to the `exclude` array:

```json title="./tsconfig.json"
  // ...
  "exclude": [
    "node_modules/",
    "build/",
    "dist/",
    ".cache/",
    ".tmp/",
    "src/admin/",
    "**/*.test.ts",
    "src/plugins/**",
    "types/generated/**"
  ]
  // ...
```

However, if you still want to use the generated types on your project, but don't want Strapi to use them, a workaround could be to copy those generated types and paste them outside of the `generated` directory (so that they aren't overwritten when the types are regenerated) and remove the `declare module '@strapi/types'` from the bottom of the file.

:::warning
Types should only be imported from `@strapi/strapi` to avoid breaking changes. The types in `@strapi/types` are for internal use only and may change without notice.
:::

## Start Strapi programmatically

To start Strapi programmatically in a TypeScript project the Strapi instance requires the compiled code location. This section describes how to set and indicate the compiled code directory.

### Use the `strapi()` factory {#use-the-createstrapi-factory}

Strapi can be run programmatically by using the `strapi()` factory. Since the code of TypeScript projects is compiled in a specific directory, the parameter `distDir` should be passed to the factory to indicate where the compiled code should be read:

```js title="./server.js"

const strapi = require('@strapi/strapi');
const app = strapi({ distDir: './dist' });
app.start(); 
```

### Use the `strapi.compile()` function

The `strapi.compile()` function should be mostly used for developing tools that need to start a Strapi instance and detect whether the project includes TypeScript code. `strapi.compile()` automatically detects the project language. If the project code contains any TypeScript code, `strapi.compile()` compiles the code and returns a context with specific values for the directories that Strapi requires:

```js
const strapi = require('@strapi/strapi');

strapi.compile().then(appContext => strapi(appContext).start());
```

## Develop a plugin using TypeScript

New plugins can be generated following the [plugins development documentation](/cms/plugins-development/developing-plugins), ensuring you select "TypeScript" when prompted by the CLI tool.

There are 2 important distinctions for TypeScript applications:

- After creating the plugin, run `yarn` or `npm install` in the plugin directory `src/admin/plugins/[my-plugin-name]` to install the dependencies for the plugin.
- Run `yarn build` or `npm run build` in the plugin directory `src/admin/plugins/[my-plugin-name]` to build the admin panel including the plugin.

:::note
It is not necessary to repeat the `yarn` or `npm install` command after the initial installation. The `yarn build` or `npm run build` command is necessary to implement any plugin development that affects the admin panel.
:::
