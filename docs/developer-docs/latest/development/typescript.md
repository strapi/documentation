---
title: Typescript - Strapi Developer Docs
description: Learn how you can use Typescript for your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/typescript.html
---

# TypeScript development

TypeScript adds an additional type system layer above JavaScript, which means that existing JavaScript code is also TypeScript code. Strapi supports TypeScript in new projects on v4.3.0 and above. Existing JavaScript projects can [add TypeScript support](#add-typescript-support-to-an-existing-strapi-project) through a conversion procedure. TypeScript-enabled projects allow developing plugins with TypeScript as well as using TypeScript typings.

::: strapi Getting started with TypeScript
To start developing in TypeScript, use the [CLI installation documentation](/developer-docs/latest/setup-deployment-guides/installation/cli.md) to create a new TypeScript project. For existing projects, [TypeScript support can be added](#add-typescript-support-to-an-existing-strapi-project) with the provided conversion steps. Additionally, the [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) and [TypeScript configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/typescript.md) sections have TypeScript-specific resources for understanding and configuring an application.
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

    import { Strapi } from '@strapi/strapi';

    export default {
      register( { strapi }: { strapi: Strapi }) {
        // ...
      },
    };
    ```

2. Within the body of the `register` method, start typing `strapi.` and use keyboard arrows to browse the available properties.
3. Choose `runLifecyclesfunction` from the list.
4. When the `strapi.runLifecyclesFunctions` method is added, a list of available lifecycle types (i.e. `register`, `bootstrap` and `destroy`) are returned by the code editor. Use keyboard arrows to choose one of the lifecycles and the code will autocomplete.


:::details You can also create a helper function to automaticaly type strapi parameter:

```ts
// path: ./src/utils.ts

import { Strapi } from '@strapi/strapi';

export function withStrapi<T>(fn: (ctx: { strapi: Strapi }) => T) {
  return fn;
}
```

```js
// path: ./src/index.ts

import { withStrapi } from './utils';

export default {
  register: withStrapi({ strapi } => {
    // ...
  }),
};
```
:::


## Generate typings for project schemas

To generate typings for your project schemas use the [`ts:generate-types` CLI command](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-ts-generate-types). The `ts:generate-types` command creates the file `schemas.d.ts`, at the project root, which stores the schema typings. The optional `--verbose` flag returns a detailed table of the generated schemas.

To use `ts:generate-types`run the following code in a terminal at the project root:

<code-group>
<code-block title="NPM">

```sh
npm run strapi ts:generate-types --verbose #optional flag

```

</code-block>

<code-block title="YARN">

```sh
yarn strapi ts:generate-types --verbose #optional flag

```

</code-block>
</code-group>


## Extends global strapi typings

You can extends the Strapi interface that define the global `strapi` instance via the [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

This is a basic example to provide typing for two services: `strapi.service('api::apiName.myService')` and `strapi.service('api::apiName.mySecondService')`

```ts
// file: shims-strapi-services.d.ts

interface MyService {
  findBySlug: (slug?: string) => Promise<void>
}
interface MySecondService {
  getSlugStats: (slug?: string) => Promise<void>
}

declare module '@strapi/strapi/lib/types/core/strapi' {
  export interface Strapi {
    // everything added here will be available on:
    // - global strapi instances
    // - import('@strapi/strapi).Strapi base class typing

    service(name: 'api::apiName.myService'): MyService;
    service(name: 'api::apiName.mySecondService'): MySecondService;
  }
}

// this export is required unless we use import statement
export {};
```

::: note
You should avoid declaring interface for your controllers, interfaces, utils and let typescript infer them
:::

This is a more complete example on how to infer typing for an embeded plugin.

1. Assume we have a plugin with services defined
 
    ```ts
    // file: ./src/plugins/my-custom-plugin/server/services/index.ts

    import slug from './slug'

    export default {
      slug,
      anotherService: {
        anotherAction() {
          // { ... }
        }
      }
    }
    ```

    ```ts
    // file: ./src/plugins/my-custom-plugin/server/services/slug.ts

    import { Strapi } from '@strapi/strapi';

    export default ({ strapi }: { strapi: Strapi }) => ({
      async getSlugStats(slug?: string) {
        // { ... }
      }
    })
    ```

1. We can then infer the services instead of declaring an interface

    ```ts
    // file: shims-strapi-plugin-custom.d.ts

    import Services from './src/plugins/my-custom-plugin/server/services';

    type ServicesType = typeof Services;

    interface MyCustomPlugin {
      service<T extends keyof ServicesType>(
        service: T
      ): ServicesType[T] extends (...args: any) => any
        ? ReturnType<ServicesType[T]>
        : ServicesType[T];

    }

    declare module '@strapi/strapi/lib/types/core/strapi' {
      export interface Strapi {
        plugin(name: 'my-custom-plugin'): MyCustomPlugin;
      }
    }

    export {};

    ```

You will now have typechecking on `strapi.plugin('my-custom-plugin').service('slug').getSlugStats()` and `strapi.plugin('my-custom-plugin').service('anotherService').anotherAction()`
    


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
// path: ./server.js 

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

## Add TypeScript support to an existing Strapi project

You can migrate an existing JavaScript project to TypeScript with incremental steps without needing complete refactor.

The first step is to create new content in TypeScript beside existing JavaScript. 
Then we can start to enable typechecking on specific JavaScript files, when we are done we can enable JavaScript check on the entire project.
This will give us time to migrate all JavaScript content over the time 

### Add TypeScript Compiler, with `allowJs`

Adding TypeScript support to an existing project requires adding 2 `tsconfig.json` files and rebuilding the admin panel. Additionally, the `eslintrc` and `eslintignore` files can be optionally removed. The TypeScript flag `allowJs` should be set to `true` in the root `tsconfig.json` file to incrementally add TypeScript files to existing JavaScript projects. The `allowJs` flag allows `.ts` and `.tsx` files to coexist with JavaScript files.

TypeScript support can be added to an existing Strapi project using the following procedure:

1. Add a `tsconfig.json` file at the project root and copy the following code, with the `allowJs` flag, to the file:

    ```json
    // path: ./tsconfig.json
    
    {
        "extends": "@strapi/typescript-utils/tsconfigs/server",
        "compilerOptions": {
          "outDir": "dist",
          "rootDir": ".",
          "allowJs": true, // copy *.js files in outDir
          "checkJs": false, // do not validate *.js files for now
          "paths": {
            "~": [
              "."
            ],
            "~/*": [
              "./*"
            ]
          }
        },
        "include": [
          "./",
          "src/**/*.json"
        ],
        "exclude": [
          "node_modules/",
          "build/",
          "dist/",
          ".cache/",
          ".tmp/",
          "src/admin/",
          "**/*.test.ts"
        ]
       
      }
      
    ```

    ::: note
    The `@strapi/typescript-utils/tsconfigs/server` use node 14 as default target. You can override with your own, depending on your environment, more info in the         [typescript wiki](https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping)
    :::

2. Add a `tsconfig.json` file in the `./src/admin/` directory and copy the following code to the file:

    ```json
    // path: ./src/admin/tsconfig.json
    
    {
        "extends": "@strapi/typescript-utils/tsconfigs/admin",
        "include": [
          "../plugins/**/admin/src/**/*",
          "./"
        ],
        "exclude": [
          "node_modules/",
          "build/",
          "dist/",
          "**/*.test.ts"
        ]
      }
      
    ```

3. (optional) Delete the `.eslintrc` and `.eslintignore` files from the project root. Alternatively, you can use [`@strapi-community`](https://github.com/strapi-community/eslint-config) configuration which allows both typescript and javascript.
4. Add an additional `'..'` to the `filename` property in the `database.ts` configuration file (only required for SQLite databases):

    ```js
    //path: ./config/database.ts
    
    const path = require('path');
    
    module.exports = ({ env }) => ({
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..','..', env('DATABASE_FILENAME', '.tmp/data.db')),
        },
        useNullAsDefault: true,
      },
    });
    
    ```

5. Map your custom plugins server entrypoint to compiled typesript output `src/plugins/**/strapi-server.js`:

    ```js
    'use strict';
    
    const { join } = require('node:path');
    module.exports = require(join(strapi.dirs.dist.src, 'plugins/<xxx>/server'));
    ```


6. Rebuild the admin panel and start the development server:

    <code-group>
    <code-block title='NPM'>

    ```sh
    npm run build
    npm run develop
    ```

    </code-block>

    <code-block title='YARN'>
    
    ```sh
    yarn build
    yarn develop
    ```
    
    </code-block>
    </code-group>


After completing the preceding procedure a `dist` directory will be added at the project route and the project has access to the same TypeScript features as a new TypeScript-supported Strapi project.


### Enable typechecking in JavaScript

TypeScript compiler can be enabled on a specific file by adding `// @ts-check` content on the first line of a JavaScript file.

We can then use JSDoc to anotate the JavaScript:

```js
// @ts-check

'use strict';

/**
 * @param {{ strapi: import('@strapi/strapi').Strapi }} options
 */
module.exports = ({ strapi }) => ({
  myServiceAction() {
    // ...
  },
});
```


Once you are ready, you can allow TypeScript compiler to check typing in  `*.js` files. This can be done for all JavaScript files in the project in the `tsconfig.json`. 

```json
{
  "compilerOptions": {
    "checkJs": true, // validate all *.js files
  }
}
```

