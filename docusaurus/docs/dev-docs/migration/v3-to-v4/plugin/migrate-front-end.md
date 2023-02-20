---
title: Migrating the front end
description: Migrate the front end of a Strapi plugin from v3.6.x to v4.0.x with step-by-step instructions
displayed_sidebar: devDocsSidebar

# pagination_next: ./enable-plugin.md
---

import PluginMigrationIntro from '/docs/snippets/plugin-migration-intro.md'

# v4 plugin migration: Migrating the front end

<PluginMigrationIntro components={props.components} />

Migrating the front end of a plugin to Strapi v4 might require:

- updating how the plugin's front-end is [registered](#registering-the-plugin-with-the-admin-panel)
- updating how the plugin is [added to the amin panel menu](#adding-a-menu-link)
- updating how the plugin [adds settings to the admin panel](#adding-settings)
- updating how the plugin [adds reducers](#adding-reducers)
- updating how the plugin [injects components to the Content Manager](#adding-injection-zones)
- updating how the plugin [uses the admin panel `Initializer` component](#using-the-initializer-component)
- [registering translations](#registering-translations)

Migrating the front end of a plugin to Strapi v4 should be done entirely manually.

:::strapi Going further with the new Admin Panel APIs
Following this guide should help you migrate a basic plugin with a single view. However, the [Admin Panel APIs](/dev-docs/api/plugins/admin-panel-api.md) introduced in Strapi v4 allow for further customization.

In addition to the [`register()` lifecycle function](/dev-docs/api/plugins/admin-panel-api.md#register), which is executed as soon as the plugin is loaded, a [`bootstrap()` lifecycle function](/dev-docs/api/plugins/admin-panel-api.md#bootstrap) executes after all plugins are loaded.

To add a settings link or section, use Redux reducers, hook into other plugins, and modify the user interface with injection zones, consult [the "available actions" table](/dev-docs/api/plugins/admin-panel-api.md#available-actions) for all available APIs and their associated lifecycle functions.
:::

## Registering the plugin with the admin panel

:::strapi v3/v4 comparison
A Strapi v3 plugin is registered with the admin panel by using the `strapi.registerPlugin()` function in the `<my-plugin-name>/admin/src/index.js` file.

In Strapi v4, the plugin is registered within the [`register()` lifecycle function](/dev-docs/api/plugins/admin-panel-api.md#register).
:::

To update the front-end registration of a plugin to Strapi v4:

1. If it does not already exist, create an `admin/src/index.js` file at the root of the plugin folder.
2. In the `<plugin-name>/admin/src/index.js` file, export a function that calls the `register()` lifecycle function, passing the current Strapi application instance as an argument.
3. Inside the `register()` lifecycle function body, call [the `registerPlugin()` function](/dev-docs/api/plugins/admin-panel-api.md#registerplugin) on the application instance, grabbing the `name` and `id` keys from the Strapi v3 configuration object.
4. Make sure that Strapi is aware of the plugin's front-end interface exported from `admin/src/index.js` by adding the following line to the `<plugin-name>/strapi-admin.js` entry file:

    ```jsx
    module.exports = require('./admin/src').default;
    ```

<details>
<summary>Example of a Strapi v4 plugin registration</summary>

  ```jsx title="./src/plugins/my-plugin/admin/src/index.js"

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

  ```jsx title=".src/plugins/my-plugin/strapi-admin.js"

  module.exports = require('./admin/src').default;
  ```

</details>

## Adding a menu link

:::strapi v3/v4 comparison
A Strapi v3 plugin adds a link to the menu in the admin panel by exporting a `menu` object during the plugin registration.

In Strapi v4, a plugin adds a link to the menu programmatically with the [`addMenuLink()` function](/dev-docs/api/plugins/admin-panel-api.md#menu-api) called in the `register` lifecycle. 
:::

To migrate to Strapi v4, pass the `menu` key from the Strapi v3 configuration object to `app.addMenuLink()` with the following properties updated:

| Property name and type in v3                      | Equivalent in v4             |
| ------------------------------------------------- | ---------------------------- |
| `destination` (String)                            | `to` (String)                |
| `label` (String)                                  | `intlLabel` (String)   |
| `icon` (String)<br/><br/>`mainComponent` (String) | `<Icon />` (React component) |

The React-based icon component can be created in a separate file.

<details>
<summary>Example of an PluginIcon component</summary>

```jsx title="./src/plugins/my-plugin/admin/src/components/PluginIcon/index.js"

import React from "react";
import { Icon } from "@strapi/parts/Icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PluginIcon = () => (
  <Icon as={() => <FontAwesomeIcon icon="paint-brush" />} width="16px" />
);

export default PluginIcon;
```

</details>

In Strapi v3 the icon component is specified on the `mainComponent` key, in Strapi v4 the component is passed as a dynamic import to the `app.addMenuLink()` function.

<details>
<summary>Example of adding a menu link with a custom plugin icon component</summary>

```jsx title="./src/plugins/my-plugin/admin/src/index.js"

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

</details>

## Adding settings

:::strapi v3/v4 comparison

A Strapi v3 plugin adds a settings section by exporting a `settings` property during the plugin registration.

In Strapi v4, a plugin adds a settings section programmatically using the [Settings API](/dev-docs/api/plugins/admin-panel-api.md#settings-api).
:::

To migrate to Strapi v4, depending on what your Strapi v3 plugin does, use the following table to find the appropriate Settings API method to use, and click on the method name to go to its dedicated documentation:

| Action     | Method |
|-----|----|
| Create a new settings section<br/> and define new links to include in this section | [`createSettingsSection()`](/dev-docs/api/plugins/admin-panel-api.md#createsettingsection) |
| Add link(s) to an existing settings section:<ul><li>a single link</li><li>multiple links</li></ul> | <br/><ul><li>[`addSettingsLink()`](/dev-docs/api/plugins/admin-panel-api.md#addsettingslink)</li><li>[`addSettingsLinks()`](/dev-docs/api/plugins/admin-panel-api.md#addsettingslinks)</li></ul> |

<details>
<summary>Example of creating a new settings section</summary>

```js title="./src/plugins/my-plugin/admin/src/index.js"

import getTrad from './utils/getTrad';

register(app) {
  // Create the plugin's settings section
  app.createSettingSection(
    // created section
    {
      id: pluginId,
      intlLabel: {
        id: getTrad('Settings.section-label'),
        defaultMessage: 'My plugin settings',
      },
    },
    // links
    [
      {
        intlLabel: {
          id: 'settings.page',
          defaultMessage: 'Setting page 1',
        },
        id: 'settings',
        to: `/settings/my-plugin/`,
        Component: async () => {
          const component = await import(
            /* webpackChunkName: "my-plugin-settings-page" */ './pages/Settings'
          );

          return component;
        },
        permissions: [],
      },

    ]
  );

  app.registerPlugin({
    id: pluginId,
    name,
  });
},
```

</details>

## Adding reducers

:::strapi v3/v4 comparison

A Strapi v3 plugin adds reducers by exporting a `reducers` property during the plugin registration.

In Strapi v4, a plugin adds reducers programmatically using the [Reducers API](/dev-docs/api/plugins/admin-panel-api.md#reducers-api).
:::

To migrate to Strapi v4, make sure reducers are added programmatically with the `addReducers()` method.

<details>
<summary>Example of adding reducers</summary>

```js title="./src/plugins/my-plugin/admin/src/index.js"

import myReducer from './components/MyCompo/reducer';
import myReducer1 from './components/MyCompo1/reducer';
import pluginId from './pluginId';

const reducers = {
  [`${pluginId}_reducer`]: myReducer,
  [`${pluginId}_reducer1`]: myReducer1,
};

export default {
  register(app) {
    app.addReducers(reducers);

    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
 }
}
```

</details>

## Adding injection zones

:::strapi v3/v4 comparison
A Strapi v3 plugin can inject components into the Content Manager's Edit view, using the `registerField()` method or the `useStrapi` hook within the `Initializer` component.

In Strapi v4, a plugin can inject components into several locations of the Content Manager using the [Injection Zones API](/dev-docs/api/plugins/admin-panel-api.md#injection-zones-api).
:::

To migrate to Strapi v4, make sure components are injected using Strapi v4 [Injection Zones API](/dev-docs/api/plugins/admin-panel-api.md#injection-zones-api). Depending on where the component should be injected, use:

- either the `injectContentManagerComponent()` method to inject into [predefined injection zones](/dev-docs/api/plugins/admin-panel-api.md#using-predefined-injection-zones) of the Content Manager
- or the `injectComponent()` method to inject into [custom zones](/dev-docs/api/plugins/admin-panel-api.md#creating-a-custom-injection-zone)

<details>
<summary>Example of injecting a component into the Content Manager's Edit view</summary>

```jsx title=" ./src/plugins/my-plugin/admin/src/index.js"

import pluginId from './pluginId;
import Link from './components/Link'

export default {
  bootstrap(app){
    // insert a link in the 'right-links' zone of the Content Manager's edit view
    app.injectContentManagerComponent('editView', 'right-links', {
      name: `${pluginId}-link`,
      Component: Link,
    });
  }
}
```

</details>

## Using the `Initializer` component

:::strapi v3/v4 comparison
In both Strapi v3 and v4, the `Initializer` component is generated by default when a plugin is created. `Initializer` could be used to execute some logic when the application is loading, for instance to dispatch an action after the user logs in into the admin panel.

In Strapi v4, the `Initializer` component code has changed and uses the `useRef` and `useEffect`  React hooks to dispatch actions.
:::

The Initializer component is useful to store a global state in the application, which will be loaded before the application is rendered using Redux. To make sure the Initializer component is mounted in the application, set the `isReady` key to `false` when registering the plugin with `registerPlugin()`.

To migrate to Strapi v4, make sure the plugin uses the latest `Initializer` code, which can be copied and pasted from the following code example:

```jsx title="./src/plugins/my-plugin/admin/src/components/Initializer/index.js"

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

const Initializer = ({ setPlugin }) => {
  const ref = useRef();
  ref.current = setPlugin;

  useEffect(() => {
    ref.current(pluginId);
  }, []);

  return null;
};

Initializer.propTypes = {
  setPlugin: PropTypes.func.isRequired,
};

export default Initializer;
```

<details>
<summary>Example of registering a plugin that uses the new Initializer component</summary>

```js title="./src/plugins/my-plugin/admin/src/index.js"

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false, // ensures the Initializer component is mounted in the application
      name,
    });
  },
 }
}
```

</details>

## Registering translations

In Strapi v4, the front-end plugin interface can export an [asynchronous `registerTrads()` function](/dev-docs/api/plugins/admin-panel-api.md#async-function) for registering translation files.

<details>
<summary>Example of translation registration</summary>

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

</details>
