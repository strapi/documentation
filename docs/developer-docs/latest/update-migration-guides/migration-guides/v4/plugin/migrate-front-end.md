---
title: v4 Plugin Migration - Migrating the front end - Strapi Developer Docs
description: Migrate the front end of a Strapi plugin from v3.6.8 to v4.0.x with step-by-step instructions
canonicalUrl: http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.html
next: ./enable-plugin.md
---

# v4 plugin migration: Migrating the front end

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!

Migrating the front end of a plugin to Strapi v4 requires:

- updating how the plugin's front-end is [registered](#registering-the-plugin-with-the-admin-panel)
- updating how the plugin is [added to the amin panel menu](#adding-a-menu-link)
- optionally, [registering translations](#registering-translations)

Migrating the front end of a plugin to Strapi v4 should be done entirely manually.

:::strapi Going further with the new Admin Panel APIs
Following this guide should help you migrate a basic plugin with a single view. However, the [Admin Panel APIs](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md) introduced in Strapi v4 allow for further customization.

In addition to the [`register()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register), which is executed as soon as the plugin is loaded, a [`bootstrap()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap) executes after all plugins are loaded.

To add a settings link or section, use Redux reducers, hook into other plugins, and modify the user interface with injection zones, consult [the "available actions" table](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#available-actions) for all available APIs and their associated lifecycle functions.
:::

## Registering the plugin with the admin panel

::: strapi v3/v4 comparison
A Strapi v3 plugin is registered with the admin panel by using the `strapi.registerPlugin()` function in the `<my-plugin-name>/admin/src/index.js` file.

In Strapi v4, the plugin is registered within the [`register()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register).
:::

To update the front-end registration of a plugin to Strapi v4:

1. If it does not already exist, create an `admin/src/index.js` file at the root of the plugin folder.
2. In the `<plugin-name>/admin/src/index.js` file, export a function that calls the `register()` lifecycle function, passing the current Strapi application instance as an argument.
3. Inside the `register()` lifecycle function body, call [the `registerPlugin()` function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#registerplugin) on the application instance, grabbing the `name` and `id` keys from the Strapi v3 configuration object.
4. Make sure that Strapi is aware of the plugin's front-end interface exported from `admin/src/index.js` by adding the following line to the `<plugin-name>/strapi-admin.js` entry file:

    ```jsx
    module.exports = require('./admin/src').default;
    ```

::: details Example of a Strapi v4 plugin registration

  ```jsx
  // path: ./src/plugins/my-plugin/admin/src/index.js

  import pluginId from './pluginId';

  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const { name } = pluginPkg.strapi;

  export default {
    register(app) {
        // executes as soon as the plugin is loaded
        app.registerPlugin({
          id: pluginId
          name,
        })
      }
    }
  ```

  ```jsx
  // path: .src/plugins/my-plugin/strapi-admin.js

  module.exports = require('./admin/src').default;
  ```

:::

## Adding a menu link

::: strapi v3/v4 comparison
A Strapi v3 plugin adds a link to the menu in the admin panel by exporting a `menu` object during the plugin registration.

In Strapi v4, a plugin adds a link to the menu with the [`addMenuLink()` function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#menu-api) called in the `register` lifecycle. 
:::

To migrate to Strapi v4, pass the `menu` key from the Strapi v3 configuration object to `app.addMenuLink()` with the following properties updated:

| Property name and type in v3                      | Equivalent in v4             |
| ------------------------------------------------- | ---------------------------- |
| `destination` (String)                            | `to` (String)                |
| `label` (String)                                  | `intlLabel` (String)   |
| `icon` (String)<br/><br/>`mainComponent` (String) | `<Icon />` (React component) |

The React-based icon component can be created in a separate file.

::: details Example of an PluginIcon component

```jsx
// path: ./src/plugins/my-plugin/admin/src/components/PluginIcon/index.js

import React from "react";
import { Icon } from "@strapi/parts/Icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PluginIcon = () => (
  <Icon as={() => <FontAwesomeIcon icon="paint-brush" />} width="16px" />
);

export default PluginIcon;
```

:::

In Strapi v3 the icon component is specified on the `mainComponent` key, in Strapi v4 the component is passed as a dynamic import to the `app.addMenuLink()` function.

::: details Example of adding a menu link with a custom plugin icon component

```jsx
// path: ./src/plugins/my-plugin/admin/src/index.js

import pluginId from './pluginId';
import pluginPermissions from './permissions';
import PluginIcon from './PluginIcon'

const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const { name } = pluginPkg.strapi;

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
      id: pluginId
      name
    });
  }
}
```

:::

## Registering translations

In Strapi v4, the front-end plugin interface can export an [asynchronous `registerTrads()` function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#async-function) for registering translation files.

::: details Example of translation registration

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

:::
