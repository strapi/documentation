---
title: Plugin migration guide for v4 - Strapi Developer Docs
description: Migrate your plugins from v3.6.8 to v4.0 with step-by-step instructions
canonicalUrl:
---

<!-- TODO: update SEO -->

# v4 Plugins Migration Guide

The goal of this guide is to get a v3 plugin up and running on v4 as fast as possible by resolving breaking changes. It is not an exhaustive resource for the v4 plugin APIs, which are described in the [Server API](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#server-api-for-plugins) and [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#admin-panel-api-for-plugins) documentations.

Updating a plugin consists in:

- [enabling the plugin](#enable-the-plugin)
- [updating the folder structure](#update-the-folder-structure)
- [migrating the front end](#migrate-the-front-end)
- [migrating the back end](#migrate-the-back-end)

Some of these steps can be performed by scripts that automatically modify code (codemods). The following table sums up the available options:

| Action                              | Migration type                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enable the plugin                   | [Manual](#enable-the-plugin)                                                                               |
| Update the folder structure         | [Automatic](#update-the-folder-structure-automatically) or [manual](#update-the-folder-structure-manually) |
| Migrate the back end of the plugin  | Partially automatic (see [Migrate the backend](#migrate-the-back-end))                                      |
| Migrate the front end of the plugin | [Manual](#migrate-the-front-end)                                                                      |

<br/>

::: prerequisites
To use the codemods, clone the [Strapi codemods repository](https://github.com/strapi/codemods) by running the following command in your terminal:

```bash
git clone https://github.com/strapi/codemods.git
```
:::

## Enable the plugin

A v3 plugin was enabled if it was manually installed or found in the `plugins` directory.

In Strapi v4:

- If a plugin is installed via the [automatic plugins discovery](/developer-docs/latest/plugins/plugins-intro.md#automatic-plugins-discovery) feature, it is automatically enabled.
- While developing a local plugin, the plugin must explicitly be enabled in [the `./config/plugins.js` file](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) of the Strapi application.

A `my-plugin` plugin is enabled with the following code:

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
:::tip
Disabling any plugin and adding additional configuration can be done here as well (see [plugins configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) documentation).
:::


## Update the folder structure

As opposed to v3 plugins, which required a specific folder structure, v4 plugins are developed using a programmatic API.

At the root of your plugin you must have the `strapi-server.js` and `strapi-admin.js` entry files. Otherwise, the folder structure is up to you. Here is an example:

```jsx
/plugin
-- /admin
---- /components
---- /pages
---- // etc...
---- index.js
-- /server
---- /config
---- /controllers
---- /routes
---- bootstrap.js
---- // etc...
---- index.js
-- strapi-server.js // require('./server')
-- strapi-admin.js // require('./admin')
```

### Update the folder structure automatically

To make this update, you can use the following codemod to move files and folders into a v4 plugin structure:

```jsx
node ./migration-helpers/update-plugin-folder-structure.js <path-to-v3-plugin> [path-for-v4-plugin]
```

<aside>
ℹ️ This codemod will create a new v4 plugin leaving your v3 plugin in place. We recommend confirming the v4 version of your plugin is working properly before deleting the v3 version.

</aside>

The codemod creates the two entry files `strapi-server.js` and `strapi-admin.js`, organizes files and folders into `/server` and `/admin` directories respectively, changes `models` to `contentTypes` , and exports `services` as functions.

<aside>
ℹ️ For a more detailed explanation of what the codemod does, consult the check list below

</aside>

### Update the folder structure manually

Manually updating the folder structure requires the following updates:

1. create a server directory
2. move controllers, services and middlewares to the server directory
3. move the bootstrap function
4. move the routes
5. move the policies
6. create strapi-server.js and strapi-admin entry files

If you prefer to make these changes yourself, you can use the checklist below to help migrate your plugin.

:::note
💡 This is only a suggested folder structure.  You can  organize the plugin however you want as long as everything is imported to `strapi-admin.js` and `strapi-server.js`
:::

#### Create a `server` directory

<!-- TODO: add explanations -->

#### Move controllers, services, and middlewares

Move `controllers`, `services` , and `middlewares` to `/server` . For each directory add an `index.js` file that exports all files in that folder. Make sure that each file in these directories exports a function taking `{strapi}` as a parameter and returns an object. For example the `controllers` directory would look like this:

```jsx
// server/controllers/my-controllerA

module.exports = ({ strapi }) => ({
  doSomething(ctx) {
    ctx.body = { message: "HelloWorld" };
  },
});
```

```jsx
// server/controllers/index.js

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};
```

#### Move the `bootstrap` function

Move bootstrap from `/server/config/functions/bootstrap.js` to `/server/bootstrap.js` and pass `{strapi}` as an argument:

```jsx
// server/bootstrap.js
"use strict";

module.exports = ({ strapi }) => ({
  // bootstrap!
});
```

#### Move routes

- Move routes from `/config/routes.json` to `/server/routes/index.json`. Your routes should return an array or an object specifying `admin` or `content-api` routes.
- Make sure your routes handler matches the same casing of your controller exports

```jsx
// server/controllers/index.js

"use strict";

const myControllerA = require("./my-controllerA");
const myControllerB = require("./my-controllerB");

module.exports = {
  myControllerA,
  myControllerB,
};
```

```jsx
// server/routes/index.js

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

#### Move policies

- Move policies from `/config/policies` to `/server/policies/<policyName>.js`, add an `index.js` file to the directory that exports all files in the folder.

#### Move & rename models to content-types

- Move / rename the `models` directory to `/server/content-types`

  - Move / rename each model's `<modelName>.settings.json` to `/server/content-types/<contentTypeName>/schema.json`

    - Update the info object on each `schema.json`

    ```json
    "info": {
      "singularName": "content-type-name", // kebab-case required
      "pluralName": "content-type-names", // kebab-case required
      "displayName": "Content-Type Name",
      "name": "Content-Type Name",
    };
    ```

    - If your model used lifecycle-hooks found in `<model-name>.js` move / rename this file `/server/content-types/<contentTypeName>/lifecycle.js`, otherwise delete the file.
    - Create an index file for each Content Type that exports the schema and lifecycles

    ```jsx
    // server/content-types/<content-type-name>/index.js

    const schema = require("./schema.json");
    const lifecycles = require("./lifecycles.js");

    module.exports = {
      schema,
      lifecycles,
    };
    ```

    - Create an index file for `server/content-types` and export all content-types
    - Make sure the key for your Content-Types matches the singular name on the Content-Type’s schema.json info object.

    ```json
    // server/content-types/content-type-a/schema.json

    "info": {
      "singularName": "content-type-a", // kebab-case required
      "pluralName": "content-type-as", // kebab-case required
      "displayName": "Content-Type A",
      "name": "Content-Type A",
    };
    ```

    ```jsx
    // server/content-types/index.js
    "use strict";

    const contentTypeA = require("./content-type-a");
    const contentTypeB = require("./content-type-b");

    module.exports = {
      "content-type-a": contentTypeA,
      "content-type-b": contentTypeB,
    };
    ```

#### Create entry files

- Create the server entry file at the root of your plugin: `strapi-server.js` and require all necessary files for your plugin. For example:

```jsx
// strapi-server.js
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

- Create the frontend entry file at the root of your project: `strapi-admin.js` For example:

```jsx
// strapi-admin.js
"use strict";

module.exports = require("./admin/src").default;
```

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
💡 To refactor further, check out the [new getters](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#usage) introduced in the Strapi v4 Plugin API
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
