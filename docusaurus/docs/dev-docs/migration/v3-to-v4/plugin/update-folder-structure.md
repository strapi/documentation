---
title: Updating the folder structure
description: Migrate the folder structure of a Strapi plugin from v3.6.x to v4.0.x with step-by-step instructions
displayed_sidebar: devDocsSidebar

---

import PluginMigrationIntro from '/docs/snippets/plugin-migration-intro.md'

# v4 plugin migration: Updating the folder structure

<PluginMigrationIntro components={props.components} />

:::strapi v3/v4 comparison
Strapi v3 plugins required a specific folder structure.

In Strapi v4, plugins are developed using a programmatic API, which gives flexibility in the folder structure.
:::

The folder structure of a Strapi v4 plugin should meet the following requirements:

- The root of the plugin folder should include:
  - a `strapi-server.js` entry file, if the plugin interacts with Strapi's back-end (see [Server API](/dev-docs/api/plugins/server-api.md))
  - a `strapi-admin.js` entry file, if the plugin interacts with Strapi's admin panel (see [Admin Panel API](/dev-docs/api/plugins/admin-panel-api.md)).

- `strapi-admin.js` and `strapi-server.js` should export the plugin's interface.

As long as these requirements are met, the rest of the folder structure is up to you.

<details>
<summary>Example of a Strapi v4 plugin structure</summary>

```jsx
my-plugin
├─ admin
│  └─ src
│     ├─ components
│     ├─ pages
│     ├─ // more folders and files
│     └─ index.js
├─ server
│  ├─ config
│  ├─ content-types
│  ├─ controllers
│  ├─ middlewares
│  ├─ policies
│  ├─ routes
│  ├─ services
│  ├─ bootstrap.js
│  ├─ destroy.js
│  ├─ register.js
│  ├─ // more folders and files
│  └─ index.js
├─ strapi-admin.js // require('./admin')
└─ strapi-server.js // require('./server')
```

</details>

The folder structure of a Strapi v3 plugin can be migrated to a v4 plugin either [automatically](#updating-folder-structure-automatically) or [manually](#updating-folder-structure-manually).

## Updating folder structure automatically

:::caution
The codemod creates a new Strapi v4 plugin, leaving the Strapi v3 plugin in place. We recommend confirming the v4 version of the plugin is working properly before deleting the v3 version.
:::

A codemod can be used to automatically update the folder structure of a plugin for Strapi v4. The codemod performs the following actions:

- creation of 2 entry files: `strapi-server.js` and `strapi-admin.js`,
- organization of files and folders into a `server` and an `admin` folders, respectively,
- conversion of `models` to `contentTypes`,
- and export of `services` as functions.

To execute the codemod, run the following commands in a terminal:

```sh
npx @strapi/codemods migrate:plugin <path-to-v3-plugin> [path-for-v4-plugin]
```

## Updating folder structure manually

Manually updating the folder structure requires moving and updating the content of multiple files and folders. These steps are described in the following subsections.

:::note
The folder structure is given as an example, and files and folders can be organized freely as long as `strapi-server.js` or `strapi-admin.js` exist and export the plugin interface.
:::

### Creating a `server` folder

The `server` folder includes all the code for the back end of the plugin. To create it at the root of the plugin folder, run the following command in a terminal:

```sh
cd <my-plugin-folder-name>
mkdir server
```

### Moving controllers, services, and middlewares

:::strapi v3/v4 comparison
In Strapi v3, controllers, services, and middlewares of a plugin must follow a strict folder structure convention.

In Strapi v4, the organization of files and folders for plugins is flexible. However, it is recommended to create dedicated folders for every type of back-end element (e.g. [controllers](/dev-docs/api/plugins/server-api.md#controllers), [services](/dev-docs/api/plugins/server-api.md#services), and [middlewares](/dev-docs/api/plugins/server-api.md#middlewares)) inside a `server` folder (see [project structure](/dev-docs/project-structure.md)).

:::

To update the controllers, services, and middlewares of a plugin to Strapi v4, create specific sub-folders in a `server` folder.

Plugin files and folders in Strapi v4 should meet 2 requirements:

- Each file in the `server/<subfolder-name>/<element-name>` (e.g. `server/controllers/my-controller.js`) should:
  * export a function taking the `strapi` instance (object) as a parameter
  * and return an object.
- Each of the `server/<subfolder-name>` folders should include an `index.js` file that exports all files in the folder.

<details>
<summary>Example of files and folder for Strapi v4 plugin controllers</summary>

```jsx title="./src/plugins/my-plugin/server/controllers/my-controllerA.js"

module.exports = ({ strapi }) => ({
  doSomething(ctx) {
    ctx.body = { message: "HelloWorld" };
  },
});
```

```jsx title="./src/plugins/my-plugin/server/controllers/index.js"

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};

```

</details>

### Moving the `bootstrap` function

:::strapi v3/v4 comparison
Strapi v3 has a dedicated `config/functions` folder for each plugin.

In Strapi v4, the `config` folder does not necessarily exist for a plugin and [the `bootstrap` function](/dev-docs/api/plugins/server-api.md#bootstrap) and other lifecycle functions can be declared elsewhere.
:::

To update the plugin's `bootstrap` function to Strapi v4:

- move the `bootstrap()` function from `server/config/functions/bootstrap.js` to `server/bootstrap.js`
- pass the `strapi` instance (object) as a parameter

```jsx title="./src/plugins/my-plugin/server/bootstrap.js"

"use strict";

module.exports = ({ strapi }) => ({
  // bootstrap the plugin
});
```

### Moving routes

:::strapi v3/v4 comparison
Strapi v3 declares routes for a plugin in a specific `config/routes.json` file.

In Strapi v4, the `config` folder does not necessarily exist for a plugin and [plugin routes](/dev-docs/api/plugins/server-api.md#routes) can be declared in a `server/routes/index.json` file.
:::

To update plugin routes to Strapi v4, move routes from `config/routes.json` to `server/routes/index.json`.

Routes in Strapi v4 should meet 2 requirements:

- Routes should return an array or an object specifying `admin` or `content-api` routes.
- Routes handler names should match the same casing as the controller exports.

<details>
<summary>Example of controllers export and routes in a Strapi v4 plugin</summary>

```jsx title="./src/plugins/my-plugin/server/controllers/index.js"

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};
```

```jsx title="./src/plugins/my-plugin/server/routes/index.js"

module.exports = [
  {
    method: "GET",
    path: "/my-controller-a",
    // Camel case handler to match export in server/controllers/index.js
    handler: "myControllerA.doSomething",
    config: { policies: [] },
  },
];
```

</details>

### Moving policies

:::strapi v3/v4 comparison
Strapi v3 declares policies for a plugin in a specific `config/policies` folder.

In Strapi v4, the `config` folder does not necessarily exist for a plugin and [plugin policies](/dev-docs/api/plugins/server-api.md#policies) can be declared in dedicated files found under `server/policies`.
:::

To update plugin policies to Strapi v4:

1. Move policies from `config/policies` to `server/policies/<policy-name>.js`

2. Add an `index.js` file to the `server/policies` folder and make sure it exports all files in the folder.

### Converting models to content-types

:::strapi v3/v4 comparison
Strapi v3 declares plugin models in `<model-name>.settings.json` files found in a `models` folder.

In Strapi v4, [plugin content-types](/dev-docs/api/plugins/server-api.md#content-types) are declared in `schema.json` files found in a `server/content-types/<contentTypeName>` folder. The `schema.json` files introduce some new properties (see [schema documentation](/dev-docs/backend-customization/models.md#model-schema)).
:::

To convert Strapi v3 models to v4 content-types:

1. Move the `models` folder under the `server` folder and rename `models` to `content-types`:

    ```sh
    mv models/ server/content-types/
    ```

2. Move/rename each model's `<modelName>.settings.json` file to `server/content-types/<contentTypeName>/schema.json` files.
3. In each `<contentTypeName>/schema.json` file, update [the `info` object](/dev-docs/backend-customization/models.md#model-information), which now requires declaring the 3 new `singularName`, `pluralName` and `displayName` keys and respecting some case-formatting conventions:

    ```json title="./src/plugins/my-plugin/content-types/<content-type-name>/schema.json"

    // ...
    "info": {
      "singularName": "content-type-name", // kebab-case required
      "pluralName": "content-type-names", // kebab-case required
      "displayName": "Content-type name",
      "name": "Content-type name",
    };
    // ...
    ```

4. (_optional_) If the Strapi v3 model uses lifecycle hooks found in `<model-name>.js`, move/rename the file to `server/content-types/<contentTypeName>/lifecycle.js`, otherwise delete the file.
5. Create an `index.js` file for each content-type to export the schema and, optionally, lifecycle hooks:

    ```jsx title="./src/plugins/my-plugin/server/content-types/<content-type-name>/index.js"

    const schema = require("./schema.json");
    const lifecycles = require("./lifecycles.js"); // optional

    module.exports = {
      schema,
      lifecycles, // optional
    };
    ```

6. Create a `server/content-types/index.js` file.
7. In `server/content-types/index.js`, export all content-types and make sure the key of each content-type matches the `singularName` found in the `info` object of the content-type’s `schema.json` file:

    ```json title="./src/plugins/my-plugin/server/content-types/content-type-a/schema.json"

    "info": {
      "singularName": "content-type-a", // kebab-case required
      "pluralName": "content-type-as", // kebab-case required
      "displayName": "Content-Type A",
      "name": "Content-Type A",
    };
    ```

    ```jsx title="./src/plugins/my-plugin/server/content-types/index.js"

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
Converting Strapi v3 models to v4 content-types also requires updating getters and, optionally, relations (see [plugin back end migration documentation](/dev-docs/migration/v3-to-v4/plugin/migrate-back-end.md)).
:::

### Creating entry files

:::strapi v3/v4 comparison
Strapi v3 plugins use a strict folder structure convention.

In Strapi v4, the folder structure for plugins is flexible. However, each plugin needs at least a `strapi-server.js` entry file or a `strapi-admin.js` entry file. The 2 entry files are used to take advantage of, respectively, the [Server API](/dev-docs/api/plugins/server-api.md) for the back end of the plugin and the [Admin Panel API](/dev-docs/api/plugins/admin-panel-api.md) for the front end of the plugin.
:::

To update the plugin to Strapi v4:

- If the plugin interacts with Strapi's backend, create the `strapi-server.js` back-end entry file at the root of the plugin folder. The file should require all necessary files and export the back-end plugin interface (see [migrating the back end of a plugin](/dev-docs/migration/v3-to-v4/plugin/migrate-back-end.md)). 

  <details>
  <summary>Example strapi-server.js and server/index.js entry files</summary>

    ```js title="./src/plugins/my-plugin/strapi-server.js"

    "use strict";

    module.exports = require('./server');
    ```

    ```js title="./src/plugins/my-plugin/server/index.js"

    "use strict";

    const register = require('./register');
    const bootstrap = require('./bootstrap');
    const destroy = require('./destroy');
    const config = require('./config');
    const contentTypes = require('./content-types');
    const controllers = require('./controllers');
    const routes = require('./routes');
    const middlewares = require('./middlewares');
    const policies = require('./policies');
    const services = require('./services');

    module.exports = {
      register,
      bootstrap,
      destroy,
      config,
      controllers,
      routes,
      services,
      contentTypes,
      policies,
      middlewares,
    };
    ```

  </details>

- If the plugin interacts with Strapi's admin panel, create the `strapi-admin.js` front-end entry file at the root of the plugin folder. The file should require all necessary files and export the front-end plugin interface (see [migrating the front end of a plugin](/dev-docs/migration/v3-to-v4/plugin/migrate-front-end.md)).

  <details>
  <summary>Example strapi-admin.js entry file</summary>

    ```jsx title="./src/plugins/my-plugin/strapi-admin.js"

    "use strict";

    module.exports = require("./admin/src").default;
    ```

  </details>
