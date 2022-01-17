---
title: v4 Plugin Migration - Migrate back end - Strapi Developer Docs
description:
canonicalUrl:
---

<!-- TODO: update SEO -->

# v4 plugin migration: Migrate the front end

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!

## Register the plugin

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

## Add Menu Link

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

## Going Further

### All available actions

At this point a basic plugin with a single view should be migrated to v4. However, it is likely that you will want to customize your plugin further. Depending on the needs of your plugin you will have to look into the different API's available.

In addition to the [`register()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register), which is executed as soon as the plugin is loaded, there is also the [`bootstrap()` lifecycle function](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap) which executes after all plugins are loaded.

To add a settings link or section, use redux reducers, hook into other plugins, and modify the UI with injection zones, consult [this table](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#available-actions) for all available API's and their associated lifecycle functions.

### Register Translations

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

