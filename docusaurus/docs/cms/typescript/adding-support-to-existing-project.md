---
title: Adding TypeScript support 
description: Learn how to add TypeScript support to an existing Strapi project.
displayed_sidebar: cmsSidebar
pagination_previous: cms/typescript/development
tags:
- allowJs flag
- typescript
- tsconfig.json file
- project structure
---

# Adding TypeScript support to existing Strapi projects

Adding TypeScript support to an existing project requires adding 2 `tsconfig.json` files and rebuilding the admin panel. Additionally, the `eslintrc` and `eslintignore` files can be optionally removed.

The TypeScript flag `allowJs` should be set to `true` in the root `tsconfig.json` file to incrementally add TypeScript files to existing JavaScript projects. The `allowJs` flag allows `.ts` and `.tsx` files to coexist with JavaScript files.

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
        "**/*.test.ts",
        "src/plugins/**"
      ]
    
    }
    
  ```

2. Add a `tsconfig.json` file in the `./src/admin/` directory and copy the following code to the file:

  ```json title="./src/admin/tsconfig.json"

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

3. _(optional)_ Delete the `.eslintrc` and `.eslintignore` files from the project root.
4. Add an additional `'..'` to the `filename` property in the `database.ts` configuration file (only required for SQLite databases):

  ```js title="./config/database.ts"

  const path = require('path');

  module.exports = ({ env }) => ({
    connection: {
      client: 'sqlite',
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

  <TabItem value='yarn' label="Yarn">

    ```sh
    yarn build
    yarn develop
    ```

  </TabItem>

  <TabItem value='npm' label="NPM">

  ```sh
  npm run build
  npm run develop
  ```

  </TabItem>

  </Tabs>

A `dist` directory will be added at the project root (see [project structure](/cms/project-structure)) and the project has access to the same TypeScript features as a new TypeScript-supported Strapi project.
