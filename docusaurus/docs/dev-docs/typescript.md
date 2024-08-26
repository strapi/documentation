---
title: TypeScript
displayed_sidebar: devDocsSidebar
description: Learn how you can use TypeScript for your Strapi application.
---

# TypeScript development

TypeScript adds an additional type system layer above JavaScript, which means that existing JavaScript code is also TypeScript code. Strapi supports TypeScript in new projects on v4.3.0 and above. Existing JavaScript projects can [add TypeScript support](#add-typescript-support-to-an-existing-strapi-project) through a conversion procedure. TypeScript-enabled projects allow developing plugins with TypeScript as well as using TypeScript typings.

:::strapi Getting started with TypeScript
To start developing in TypeScript, use the [CLI installation documentation](/dev-docs/installation/cli) to create a new TypeScript project. For existing projects, [TypeScript support can be added](#add-typescript-support-to-an-existing-strapi-project) with the provided conversion steps. Additionally, the [project structure](/dev-docs/project-structure) and [TypeScript configuration](/dev-docs/configurations/typescript) sections have TypeScript-specific resources for understanding and configuring an application.
:::

## Start developing in TypeScript

Starting the development environment for a TypeScript-enabled project requires building the admin panel prior to starting the server. In development mode, the application source code is compiled to the `./dist/build` directory and recompiled with each change in the Content-type Builder. To start the application, run the following commands in the root directory:

<Tabs groupId="yarn-npm">

<TabItem value="npm">

```sh
npm run build
npm run develop
```

</TabItem>

 <TabItem value="yarn">

```sh
yarn build
yarn develop
```

</TabItem>

</Tabs>

## Use TypeScript typings

Strapi provides typings on the `Strapi` class to improve the TypeScript developing experience. These typings come with an autocomplete feature that automatically offers suggestions while developing.

To experience TypeScript-based autocomplete while developing Strapi applications, you could try the following:

1. From your code editor, open the `./src/index.ts` file.
2. In the `register` method, declare the `strapi` argument as of type `Strapi`:

   ```js title=" ./src/index.ts"
   import { Strapi } from "@strapi/strapi";

   export default {
     register({ strapi }: { strapi: Strapi }) {
       // ...
     },
   };
   ```

3. Within the body of the `register` method, start typing `strapi.` and use keyboard arrows to browse the available properties.
4. Choose `runLifecyclesfunctions` from the list.
5. When the `strapi.runLifecyclesFunctions` method is added, a list of available lifecycle types (i.e. `register`, `bootstrap` and `destroy`) are returned by the code editor. Use keyboard arrows to choose one of the lifecycles and the code will autocomplete.

## Generate typings for project schemas

To generate typings for your project schemas use the [`ts:generate-types` CLI command](/dev-docs/cli#strapi-tsgenerate-types). The `ts:generate-types` command creates the folder `types`, at the project root, which stores the typings for your project. The optional `--debug` flag returns a detailed table of the generated schemas.

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

:::tip Tip: Types generation for JavaScript projects
For JavaScript projects, automatic types generation can be turned off (see [`config/typescript.js` documentation](/dev-docs/configurations/typescript#strapi-specific-configuration-for-typescript)).
:::

:::tip Tip: Using types in your front-end application
To use Strapi types in your front-end application, you can [use a workaround](https://github.com/strapi-community/strapi-typed-fronend) until Strapi implements an official solution, and you will find additional information in [this blog article](https://strapi.io/blog/improve-your-frontend-experience-with-strapi-types-and-type-script).
:::

### Fix build issues with the Generated Types

The generated types can be excluded so that the Entity Service doesn't use them and falls back on looser types that don't check the actual properties available in the content types.

To do that, edit the `tsconfig.json` of the Strapi project and add `types/generated/**` to the `exclude` array.

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

However, if you still want to use the generated types on your project but don't want Strapi to use them, a workaround could be to copy those generated types and paste them outside of the `generated` directory (so that they
aren't overwritten when the types are regenerated) and remove the `declare module '@strapi/types'` on the bottom of the file.

:::warning
Types should only be imported from `@strapi/strapi` to avoid breaking changes. The types in `@strapi/types` are for internal use only and may change without notice.
:::

## Develop a plugin using TypeScript

New plugins can be generated following the [plugins development documentation](/dev-docs/plugins-development). There are 2 important distinctions for TypeScript applications:

- After creating the plugin, run `yarn` or `npm install` in the plugin directory `src/admin/plugins/[my-plugin-name]` to install the dependencies for the plugin.
- Run `yarn build` or `npm run build` in the plugin directory `src/admin/plugins/[my-plugin-name]` to build the admin panel including the plugin.

:::note
It is not necessary to repeat the `yarn` or `npm install` command after the initial installation. The `yarn build` or `npm run build` command is necessary to implement any plugin development that affects the admin panel.
:::

## Start Strapi programmatically

To start Strapi programmatically in a TypeScript project the Strapi instance requires the compiled code location. This section describes how to set and indicate the compiled code directory.

### Use the `strapi()` factory

Strapi can be run programmatically by using the `strapi()` factory. Since the code of TypeScript projects is compiled in a specific directory, the parameter `distDir` should be passed to the factory to indicate where the compiled code should be read:

```js title="./server.js"
const strapi = require("@strapi/strapi");
const app = strapi({ distDir: "./dist" });
app.start();
```

### Use the `strapi.compile()` function

The `strapi.compile()` function should be mostly used for developing tools that need to start a Strapi instance and detect whether the project includes TypeScript code. `strapi.compile()` automatically detects the project language. If the project code contains any TypeScript code, `strapi.compile()` compiles the code and returns a context with specific values for the directories that Strapi requires:

```js
const strapi = require("@strapi/strapi");

strapi.compile().then((appContext) => strapi(appContext).start());
```

## Add TypeScript support to an existing Strapi project

Adding TypeScript support to an existing project requires adding 2 `tsconfig.json` files and rebuilding the admin panel. Additionally, the `eslintrc` and `eslintignore` files can be optionally removed. The TypeScript flag `allowJs` should be set to `true` in the root `tsconfig.json` file to incrementally add TypeScript files to existing JavaScript projects. The `allowJs` flag allows `.ts` and `.tsx` files to coexist with JavaScript files.

TypeScript support can be added to an existing Strapi project using the following procedure:

1. Add a `tsconfig.json` file at the project root and copy the following code, with the `allowJs` flag, to the file:

```json title="./tsconfig.json"
{
  "extends": "@strapi/typescript-utils/tsconfigs/server",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "allowJs": true //enables the build without .ts files
  },
  "include": ["./", "src/**/*.json"],
  "exclude": [
    "node_modules/",
    "build/",
    "dist/",
    ".cache/",
    ".tmp/",
    "src/admin/",
    "**/*.test.ts",
    "src/plugins/**"
  ]
}
```

2. Add a `tsconfig.json` file in the `./src/admin/` directory and copy the following code to the file:

```json title="./src/admin/tsconfig.json"
{
  "extends": "@strapi/typescript-utils/tsconfigs/admin",
  "include": ["../plugins/**/admin/src/**/*", "./"],
  "exclude": ["node_modules/", "build/", "dist/", "**/*.test.ts"]
}
```

3. (optional) Delete the `.eslintrc` and `.eslintignore` files from the project root.
4. Add an additional `'..'` to the `filename` property in the `database.ts` configuration file (only required for SQLite databases):

```js title="./config/database.ts"
const path = require("path");

module.exports = ({ env }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: path.join(
        __dirname,
        "..",
        "..",
        env("DATABASE_FILENAME", ".tmp/data.db")
      ),
    },
    useNullAsDefault: true,
  },
});
```

5. Rebuild the admin panel and start the development server:

<Tabs groupId="yarn-npm">
<TabItem value='npm'>

```sh
npm run build
npm run develop
```

</TabItem>

<TabItem value='yarn'>

```sh
yarn build
yarn develop
```

</TabItem>
</Tabs>

After completing the preceding procedure a `dist` directory will be added at the project root and the project has access to the same TypeScript features as a new TypeScript-supported Strapi project.
