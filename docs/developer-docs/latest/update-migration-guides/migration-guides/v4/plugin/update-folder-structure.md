---
title: v4 Plugin Migration - Update folder structure - Strapi Developer Docs
description:
canonicalUrl:
sidebarDepth: 2
---

<!-- TODO: update SEO -->

# v4 plugin migration: Update the folder structure

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!

<br/>

v3 plugins required a specific folder structure.

In v4, plugins are developed using a programmatic API, which gives flexibility in the folder structure.

<br/>

The folder structure of a v4 plugin should meet 2 requirements:

- The root of the plugin folder should include a `strapi-server.js` and a `strapi-admin.js` entry files, for the [Server API](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) and [Admin Panel API](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md), respectively.

- `strapi-admin.js` and `strapi-server.js` should import other files and folders.

As long as these requirements are met, the rest of the folder structure is up to you.

::: details Example of a v4 plugin structure

```jsx
my-plugin
├─ admin
│  ├─ components
│  ├─ pages
│  ├─ // more folders and files
│  └─ index.js
├─ server
│  ├─ config
│  ├─ controllers
│  ├─ middlewares
│  ├─ policies
│  ├─ routes
│  ├─ bootstrap.js
│  ├─ // more folders and files
│  └─ index.js
├─ strapi-admin.js // require('./admin')
└─ strapi-server.js // require('./server')
```

:::
<br/>

The folder structure of a v3 plugin can be migrated to a v4 plugin either [automatically](#update-the-folder-structure-automatically) or [manually](#update-the-folder-structure-manually).

## Update the folder structure automatically

:::prerequisites
!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/codemod-prerequisites.md)!!!
:::

The [`update-plugin-folder-structure` codemod](https://github.com/strapi/codemods/blob/main/migration-helpers/update-plugin-folder-structure.js) can be used to automatically update the folder structure of a plugin for v4. The codemod:

- creates 2 entry files: `strapi-server.js` and `strapi-admin.js`,
- organizes files and folders into a `server` and an `admin` folders, respectively,
- converts `models` to `contentTypes`,
- and exports `services` as functions.

::: caution
This codemod creates a new v4 plugin, leaving the v3 plugin in place. We recommend confirming the v4 version of the plugin is working properly before deleting the v3 version.
:::

To execute the codemod, run the following commands in a terminal:

```sh
!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/cd-codemod-folder.md)!!!
node ./migration-helpers/update-plugin-folder-structure.js <path-to-v3-plugin> <path-for-v4-plugin>
```

## Update the folder structure manually

Manually updating the folder structure requires the following updates:

1. [create a `server` folder](#create-a-server-folder)
2. [move controllers, services and middlewares](#move-controllers-services-and-middlewares) to the `server` directory
3. [move the `bootstrap` function](#move-the-bootstrap-function)
4. [move the routes](#move-routes)
5. [move the policies](#move-policies)
6. [convert models to content-types](#convert-models-to-content-types)
7. [create entry files](#create-entry-files) (i.e. `strapi-server.js` and `strapi-admin.js`)

These different steps are detailed in the following subsections.

:::note
The folder structure is given as an example, and files and folders can be organized freely as long as `strapi-server.js` and `strapi-admin.js` exist and import all the required files.
:::

### Create a `server` folder

The `server` folder includes all the code for the back end of the plugin. To create it at the root of the plugin folder, run the following command in a terminal:

```sh
cd <my-plugin-folder-name>
mkdir server
```

### Move controllers, services, and middlewares

In Strapi v3, controllers, services, and middlewares of a plugin should follow a strict folder structure convention.

In v4, the organization of files and folders for plugins is flexible. However, it is recommended to create dedicated folders for [controllers](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#controllers), [services](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#services), and [middlewares](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#middlewares) inside a `server` folder.

<br />

To update the controllers, services, and middlewares of a plugin to v4, create specific subfolders in a `server` folder.

Plugin files and folders in v4 should meet 2 requirements:

- Each file in the `server/<subfolder-name>` should export a function taking the `strapi` instance (object) as a parameter and returning an object.
- Each of the `server/<subfolder-name>` folders should include an `index.js` file that exports all files in the folder.

::: details Example of files and folder for v4 plugin controllers

```jsx
// path: ./src/plugins/my-plugin/server/controllers/my-controllerA.js

module.exports = ({ strapi }) => ({
  doSomething(ctx) {
    ctx.body = { message: "HelloWorld" };
  },
});
```

```jsx
// path: ./src/plugins/my-plugin/server/controllers/index.js

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};

```

:::

### Move the `bootstrap` function

Strapi v3 has a dedicated `config/functions` folder for each plugin.

In v4, the `config` folder does not necessarily exist for a plugin and [the `bootstrap` function](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#bootstrap) and other life cycle functions can be declared elsewhere.

<br/>

To update the plugin's `bootstrap` function to v4:

- move the `bootstrap()` function from `server/config/functions/bootstrap.js` to `server/bootstrap.js`
- pass the `strapi` instance (object) as an argument

```jsx
// path: ./src/plugins/my-plugin/server/bootstrap.js

"use strict";

module.exports = ({ strapi }) => ({
  // bootstrap the plugin
});
```

<!-- ? If we keep it this way, we should probably extend the code examples with another block, showing that strapi-server.js needs to import bootstrap.js. Or is any "bootstrap" file automatically imported? -->

### Move routes

Strapi v3 declares routes for a plugin in a specific `config/routes.json` file.

In v4, the `config` folder does not necessarily exist for a plugin and [plugin routes](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#routes) can be declared in a `routes/index.json` file.

<br />

To update plugin routes to v4, move routes from `config/routes.json` to `server/routes/index.json`.

Routes in v4 should meet 2 requirements:

- Routes should return an array or an object specifying `admin` or `content-api` routes.
- Routes handler names should match the same casing as the controller exports.

::: details Example of controllers export and routes in a v4 plugin

```jsx
// path: ./src/plugins/my-plugin/server/controllers/index.js

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};
```

```jsx
// path: ./src/plugins/my-plugin/server/routes/index.js

module.exports = [
  {
    method: "GET",
    path: "/my-controller-a/",
    // Camel case handler to match export in server/controllers/index.js
    handler: "myControllerA.index",
    config: { policies: [] },
  },
];
```

:::

### Move policies

Strapi v3 declares policies for a plugin in a specific `/config/policies` folder.

In v4, the `config` folder does not necessarily exist for a plugin and [plugin policies](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#policies) can be declared in dedicated files found under `server/policies`.

<br/>

To update plugin policies to v4:

1. Move policies from `config/policies` to `server/policies/<policyName>.js`

2. Add an `index.js` file to the `server/policies` folder and make sure it exports all files in the folder.

### Convert models to content-types

Strapi v3 declares plugin models in `<model-name>.settings.json` files found in a `models` folder.

In v4, [plugin content-types](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#content-types) are declared in `schema.json` files found in a `server/content-types/<contentTypeName>` folder. The `schema.json` files introduce some new properties (see [schema documentation](/developer-docs/latest/development/backend-customization/models.md#model-schema)).

<br/>

To convert v3 models to v4 content-types:

1. Move/rename the `models` folder to `server/content-types`.
2. Move/rename each model's `<modelName>.settings.json` file to `server/content-types/<contentTypeName>/schema.json`.
3. In each `<contentTypeName>/schema.json` file, update [the `info` object](/developer-docs/latest/development/backend-customization/models.md#model-information), which now requires declaring the 3 new `singularName`, `pluralName` and `displayName` keys and respecting some case-formatting conventions:

    ```json
    // path: ./src/plugins/my-plugin/content-types/<content-type-name>/schema.json

    // ...
    "info": {
      "singularName": "content-type-name", // kebab-case required
      "pluralName": "content-type-names", // kebab-case required
      "displayName": "Content-type name",
      "name": "Content-type name",
    };
    // ...
    ```

4. (_optional_) If the v3 model uses life cycle hooks found in `<model-name>.js`, move/rename the file to `server/content-types/<contentTypeName>/lifecycle.js`, otherwise delete the file.
5. Create an `index.js` file for each content-type to export the schema and, optionally, life cycle hooks:

    ```jsx
    // path: ./src/plugins/my-plugin/server/content-types/<content-type-name>/index.js

    const schema = require("./schema.json");
    const lifecycles = require("./lifecycles.js"); // optional

    module.exports = {
      schema,
      lifecycles, // optional
    };
    ```

6. Create a `server/content-types/index.js` file.
7. In `server/content-types/index.js`, export all content-types and make sure the key of each content-type matches the `singularName` found in the `info` object of the content-type’s `schema.json` file:

    ```json
    // path: ./src/plugins/my-plugin/server/content-types/content-type-a/schema.json

    "info": {
      "singularName": "content-type-a", // kebab-case required
      "pluralName": "content-type-as", // kebab-case required
      "displayName": "Content-Type A",
      "name": "Content-Type A",
    };
    ```

    ```jsx
    // path: ./src/plugins/my-plugin/server/content-types/index.js

    "use strict";

    const contentTypeA = require("./content-type-a");
    const contentTypeB = require("./content-type-b");

    module.exports = {
      // Key names should match info.singularName key values found in corresponding schema.json files
      "content-type-a": contentTypeA,
      "content-type-b": contentTypeB,
    };
    ```

:::note
Converting v3 models to v4 content-types also requires updating getters and, optionally, relations (see [plugin back end migration documentation](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.md)).
:::

### Create entry files

Strapi v3 plugins use a strict folder structure convention.

In v4, the folder structure for plugins is flexible. However, each plugin needs at least a `strapi-server.js` entry file and, optionally, a `strapi-admin.js` entry file. The 2 entry files are used to take advantage of, respectively, the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.html) for the back end of the plugin and the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html) for the front end of the plugin, if interactions with the admin panel are required.

<br />

To update a plugin to v4:

- Create the `strapi-server.js` back-end entry file at the root of the plugin folder. The file should require all necessary files and export the back-end plugin interface.

  ::: details Example strapi-server.js entry file

    ```jsx
    // path: ./src/plugins/my-plugin/strapi-server.js

    "use strict";

    const bootstrap = require("./server/bootstrap");
    const contentTypes = require("./server/contentTypes");
    const controllers = require("./server/contentTypes");
    const services = require("./server/services");
    const routes = require("./server/routes");

    module.exports = {
      bootstrap,
      contentTypes,
      controllers,
      services,
      routes,
    };
    ```

  :::

- (_optional_) Create the `strapi-admin.js` front-end entry file at the root of the plugin folder. The file should require all necessary files and export the front-end plugin interface.

  ::: details Example strapi-admin.js entry file

    ```jsx
    // path: ./src/plugins/my-plugin/strapi-admin.js

    "use strict";

    module.exports = require("./admin/src").default;
    ```

  :::
