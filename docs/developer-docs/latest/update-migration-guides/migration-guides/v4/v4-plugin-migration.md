---
title: Plugin migration guide for v4 - Strapi Developer Docs
description: Migrate your plugins from v3.6.8 to v4.0 with step-by-step instructions
sidebarDepth: 2
canonicalUrl:
---

<!-- TODO: update SEO -->

# v4 Plugin Migration Guide

The goal of this guide is to get a v3 plugin up and running on v4 as fast as possible by resolving breaking changes. It is not an exhaustive resource for the v4 plugin APIs, which are described in the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#server-api-for-plugins) and [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#admin-panel-api-for-plugins) documentations.

Migrating a plugin from Strapi v3.6.8 to v4.0.4 consists in:

- [enabling the plugin](#enable-the-plugin)
- [updating the folder structure](#update-the-folder-structure)
- [migrating the front end](#migrate-the-front-end)
- [migrating the back end](#migrate-the-back-end)

Some actions required for plugin migration can be performed by scripts that automatically modify code (codemods). The following table sums up the available options:

| Action                              | Migration type                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enable the plugin                   | [Manual](#enable-the-plugin)                                                                               |
| Update the folder structure         | [Automatic](#update-the-folder-structure-automatically) or [manual](#update-the-folder-structure-manually) |
| Migrate the back end of the plugin  | Partially automatic (see [Migrate the backend](#migrate-the-back-end))                                      |
| Migrate the front end of the plugin | [Manual](#migrate-the-front-end)                                                                      |

::: prerequisites
To use the codemods for automatic migration, the [Strapi codemods repository](https://github.com/strapi/codemods) should be cloned by running the following command in a terminal:

```bash
git clone https://github.com/strapi/codemods.git
```

:::

## Enable the plugin

A v3 plugin was enabled if it was manually installed or found in the `plugins` directory.

In v4:

- If a plugin is installed via the [automatic plugins discovery](/developer-docs/latest/plugins/plugins-intro.md#automatic-plugins-discovery) feature, it is automatically enabled.
- While developing a local plugin, the plugin must explicitly be enabled in [the `./config/plugins.js` file](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) of the Strapi application.

<br/>

Enabling a plugin in v4 should be done manually with the following procedure:

1. _(optional)_ Create the `./config/plugins.js` file if it does not already exist. This JavaScript file should export an object and can take the `{ env }` object as an input (see [Environment configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) documentation).
2. Within the object exported by `./config/plugins.js`, create a key with the name of the plugin (e.g. `"my-plugin"`). The value of this key is also an object.
3. Within the `"my-plugin"` object, set the `enabled` key value to `true` (boolean).
4. _(optional)_ Add a `resolve` key, whose value is the path of the plugin folder (as a string), and a `config` key (as an object) that can include additional configuration for the plugin (see [plugins configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) documentation).

::: details Example: Enabling a "my-plugin" plugin

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  "my-plugin": {
    enabled: true,
    resolve: "./path-to-my-plugin",
    config: {
      // additional configuration goes here
    },
  },
});
```

:::

## Update the folder structure

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

### Update the folder structure automatically

A [codemod](https://github.com/strapi/codemods/blob/main/migration-helpers/update-plugin-folder-structure.js) can be used to update the folder structure of a plugin for v4.

::: caution
This codemod creates a new v4 plugin, leaving the v3 plugin in place. We recommend confirming the v4 version of the plugin is working properly before deleting the v3 version.
:::

To execute the codemod, run the following commands in a terminal:

```sh
cd <the-folder-where-the-codemods-repo-was-cloned>
node ./migration-helpers/update-plugin-folder-structure.js <path-to-v3-plugin> <path-for-v4-plugin>
```

<br/>

The codemod:

- creates 2 entry files: `strapi-server.js` and `strapi-admin.js`,
- organizes files and folders into a `/server` and an `/admin` folders, respectively,
- changes `models` to `contentTypes` and reorganizes the schema declarations,
- and exports `services` as functions.

:::note
The [manual update section](#update-the-folder-structure-manually) details what the codemod is actually doing.
:::

### Update the folder structure manually

Manually updating the folder structure requires the following updates:

1. [create a `server` directory](#create-a-server-directory)
2. [move controllers, services and middlewares](#move-controllers-services-and-middlewares) to the `server` directory
3. [move the `bootstrap` function](#move-the-bootstrap-function)
4. [move the routes](#move-routes)
5. [move the policies](#move-policies)
6. [move models to a content-types folder and update their schemas](#update-models-to-content-types)
7. [create entry files](#create-entry-files) (i.e. `strapi-server.js` and `strapi-admin.js`)

These different steps are detailed in the following subsections.

:::note
The folder structure is given as an example, and files and folders can be organized freely as long as `strapi-server.js` and `strapi-admin.js` exist and import all the required files.
:::

#### Create a `server` directory

The `server` folder includes all the code for the back end of the plugin. To create it at the root of the plugin folder, run the following command in a terminal:

```sh
cd <my-plugin-folder-name>
mkdir server
```

#### Move controllers, services, and middlewares

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

#### Move the `bootstrap` function

Strapi v3 has a dedicated `/config/functions` folder for each plugin.

In v4, the `config/` folder does not necessarily exist for a plugin and [the `bootstrap` function](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#bootstrap) and other life cycle functions can be declared elsewhere.

<br/>

To update the plugin's `bootstrap` function to v4:

- move the `bootstrap()` function from `/server/config/functions/bootstrap.js` to `/server/bootstrap.js`
- pass the `strapi` instance (object) as an argument

```jsx
// path: ./src/plugins/my-plugin/server/bootstrap.js

"use strict";

module.exports = ({ strapi }) => ({
  // bootstrap the plugin
});
```

<!-- ? If we keep it this way, we should probably extend the code examples with another block, showing that strapi-server.js needs to import bootstrap.js. Or is any "bootstrap" file automatically imported? -->

#### Move routes

Strapi v3 declares routes for a plugin in a specific `/config/routes.json` file.

In v4, the `config/` folder does not necessarily exist for a plugin and [plugin routes](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#routes) can be declared in a `routes/index.json` file.

<br />

To update plugin routes to v4, move routes from `/config/routes.json` to `/server/routes/index.json`.

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

#### Move policies

Strapi v3 declares policies for a plugin in a specific `/config/policies` folder.

In v4, the `config/` folder does not necessarily exist for a plugin and [plugin policies](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#policies) can be declared in dedicated files found under `/server/policies`.

<br/>

To update plugin policies to v4:

- move policies from `/config/policies` to `/server/policies/<policyName>.js`
- add an `index.js` file to the folder and make sure it exports all files in the folder.

#### Update models to content-types

Strapi v3 declares plugin content-types in a `models/` folder.

In v4, [plugin content-types](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#content-types) should be declared in a `/server/content-types` folder and [schemas](/developer-docs/latest/development/backend-customization/models.md#model-schema) need to be updated with some new keys.

<br/>

To update content-types to v4:

1. Move/rename the `models` folder to `/server/content-types`.
2. Move/rename each model's `<modelName>.settings.json` file to `/server/content-types/<contentTypeName>/schema.json`.
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

4. (_optional_) If the v3 model uses life cycle hooks found in `<model-name>.js`, move/rename the file to `/server/content-types/<contentTypeName>/lifecycle.js`, otherwise delete the file.
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

6. Create a `/server/content-types/index.js` file.
7. In `/server/content-types/index.js`, export all content-types and make sure the key of each content-type matches the `singularName` found in the `info` object of the content-type’s `schema.json` file:

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

#### Create entry files

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

## Migrate the back end

### Update imports

Strapi has now moved to scoped imports. All Strapi imports will need to be updated from `strapi-package-name` to `@strapi/package-name`.

**Migrate with codemod**

To update your `package.json` you can use the following codemod:

```jsx
node ./migration-helpers/update-package-dependencies.js <path-to-plugin>
```

<aside>
⚠️ This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your v3 plugin, and you are on a new branch.

</aside>

To update any files importing Strapi packages you can run:

```jsx
npx jscodeshift -t ./transforms/update-scoped-imports.js <path-to-file | path-to-folder>
```

<aside>
⚠️ This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your plugin to GitHub, and you are on a new branch.

</aside>

**Migrate by hand**

If you prefer to make this change yourself, you just need to find any imports of Strapi packages and rename them to `@strapi/package-name`

### Update Models to Content-Types

#### Update Getters

If your plugin has models (contentTypes) you will need to make the following changes.

Models are now called ContentTypes. All getters like `strapi.models` will need to be updated to `strapi.contentTypes`

##### Automatic migration with codemod

You can use the following codemod to replace all instances of `strapi.models` with `strapi.contentTypes`

```jsx
npx jscodeshift -t ./transforms/change-model-getters-to-content-types.js <path-to-file | path-to-folder>
```

<aside>
⚠️ This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your plugin to GitHub, and you are on a new branch.

</aside>

##### Manual migration

If you prefer to do this yourself, you just need to replace any instance of `.models` with `.contentTypes`

:::tip
💡 To refactor further, check out the [new getters](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#usage) introduced in the v4 Plugin API
:::

#### Update relations

If your plugin has contentTypes with relations, those attributes will have to be updated manually depending on the relation. Here's an example of all possible relations between an `article` and an `author`

```json
// article attributes
"articleHasOneAuthor": {
  "type": "relation",
  "relation": "oneToOne",
  "target": "api::author.author"
},
"articleHasAndBelongsToOneAuthor": {
  "type": "relation",
  "relation": "oneToOne",
  "target": "api::author.author",
  "inversedBy": "article"
},
"articleBelongsToManyAuthors": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::author.author",
  "mappedBy": "article"
},
"authorHasManyArticles": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::author.author",
  "inversedBy": "articles"
},
"articlesHasAndBelongsToManyAuthors": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::author.author",
  "inversedBy": "articles"
},
"articleHasManyAuthors": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::author.author"
}

// author attributes
"article": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::article.article",
  "inversedBy": "articleBelongsToManyAuthors"
},
"articles": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::article.article",
  "inversedBy": "articlesHasAndBelongsToManyAuthors"
}
```

### Update configuration

If you have any default configuration it should be exported as an object on the `[config` property](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#configuration). This object expects a `default` property storing the default plugin configuration, and a `validator` function that takes the `config` as an argument. For example:

```jsx
// strapi-server.js

module.exports = () => {
// ...bootstrap, routes, controllers, etc...
config: {
    default: { optionA: true },
    validator: (config) => {
      if (typeof config.optionA !== 'boolean') {
        throw new Error('optionA has to be a boolean');
      }
    },
  },
}
```

## Migrate the front end

### Register the plugin

A v3 plugin exports its configurations as an object passed to `registerPlugin(config)`, like this:

```jsx
export default (strapi) => {
  const pluginDescription =
    pluginPkg.strapi.description || pluginPkg.description;
  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;
  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    pluginLogo,
    preventComponentRendering: false,
    reducers,
    trads,
    menu: {
      pluginsSectionLinks: [
        {
          destination: `/plugins/${pluginId}`,
          icon,
          label: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: "My Plugin",
          },
          name,
          permissions: pluginPermissions.main,
        },
      ],
    },
  };

  return strapi.registerPlugin(plugin);
};
```

To migrate this to v4 we will need to export a function that calls the [`register()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register), passing the current strapi app as an argument:

```jsx
export default {
  register(app) {
    // executes as soon as the plugin is loaded
  },
};
```

Here we can go ahead and register our plugin by grabbing the `name` and `id` keys from the old configuration object:

```jsx
import pluginId from './pluginId';

const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const name = pluginPkg.strapi.name;

export default {
  register(app) {
      app.registerPlugin({
        id: pluginId
        name,
      })
    }
  }
```

### Add Menu Link

To add a link to your plugin in the Strapi Admin, use the [`addMenuLink()` function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#menu-api) called in the `register` lifecycle. The `menu` key from the v3 config object can be passed to `app.addMenuLink()` with the following properties changed:

- `destination` ⇒ `to`
- `label` ⇒ `intlLabel`
- `icon` is no longer a string, it's now a React component. You can create it in a separate file like this:

```jsx
import React from "react";
import { Icon } from "@strapi/parts/Icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PluginIcon = () => (
  <Icon as={() => <FontAwesomeIcon icon="paint-brush" />} width="16px" />
);

export default PluginIcon;
```

In v3 the component would be specified on the `mainComponent` key, in v4 the component is passed as a dynamic import to the `app.addMenuLink()` function.

```jsx
import pluginId from './pluginId';
import pluginPermissions from './permissions';
import PluginIcon from './PluginIcon'

const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My Plugin',
      },
      permissions: pluginPermissions.main,
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin-page" */ './pages/PluginPage');

        return component;
      },
    });

    app.registerPlugin({
      description: pluginDescription,
      icon,
      id: pluginId
      name
    });
  }
}
```

### Going Further

#### All available actions

At this point a basic plugin with a single view should be migrated to v4. However, it is likely that you will want to customize your plugin further. Depending on the needs of your plugin you will have to look into the different API's available.

In addition to the [`register()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register), which is executed as soon as the plugin is loaded, there is also the [`bootstrap()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap) which executes after all plugins are loaded.

To add a settings link or section, use redux reducers, hook into other plugins, and modify the UI with injection zones, consult [this table](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#available-actions) for all available API's and their associated lifecycle functions.

#### Register Translations

The plugin interface can also export an [asynchronous `registerTrads()` function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#async-function) for registering translation files. You can use the following function:

```jsx
import { prefixPluginTranslations } from "@strapi/helper-plugin";

export default {
  register(app) {
    // register code...
  },
  bootstrap(app) {
    // bootstrap code...
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "[pluginId]-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
```

::: strapi Codemods support & community contributions
If you have any issues with the codemods or would like to contribute to the project please [create an issue](https://github.com/strapi/codemods/issues) or [open a pull request](https://github.com/strapi/codemods/pulls).
:::
