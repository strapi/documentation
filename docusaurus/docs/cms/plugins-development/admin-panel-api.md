---
title: Admin Panel API overview
pagination_prev: cms/plugins-development/plugin-sdk
pagination_next: cms/plugins-development/admin-navigation-settings
toc_max_heading_level: 4
tags:
- admin panel
- admin panel customization
- admin panel API
- plugin APIs
- lifecycle function
- plugins
- plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite.md'

# Admin Panel API for plugins: An overview

<Tldr>
The Admin Panel API exposes `register`, `bootstrap`, and `registerTrads` hooks to inject React components and translations into Strapi's UI. Menu, settings, injection zone, reducer, and hook APIs let plugins add navigation, configuration panels, or custom actions.
</Tldr>

A Strapi plugin can interact with both the back end and the front end of a Strapi application. The Admin Panel API is about the front end part, i.e. it allows a plugin to customize Strapi's [admin panel](/cms/intro).

For more information on how plugins can interact with the back end part of Strapi, see [Server API](/cms/plugins-development/server-api).

## General considerations

The admin panel of Strapi is a <ExternalLink to="https://reactjs.org/" text="React"/> application that can embed other React applications. These other React applications are the admin parts of each Strapi feature or plugin.

To customize the admin panel of Strapi, you can use plugins and tap into the Admin Panel API. This consists in editing an [entry file](#entry-file) to export all the required interface, and choosing which [actions](#available-actions) you want to perform.

<Prerequisite />

## Entry file

The entry file for the Admin Panel API is `[plugin-name]/admin/src/index.js`. This file exports the required interface, with the following functions available:

| Function type      | Available functions                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| Lifecycle functions | <ul><li> [`register()`](#register)</li><li>[`bootstrap()`](#bootstrap)</li></ul> |
| Async function      | `registerTrads()` (see [admin localization](/cms/plugins-development/admin-localization) for details)                                          |

:::note
The whole code for the admin panel part of your plugin could live in the `/strapi-admin.js|ts` or `/admin/src/index.js|ts` file. However, it's recommended to split the code into different folders, just like the [structure](/cms/plugins-development/plugin-structure) created by the `strapi generate plugin` CLI generator command.
:::

### register() {#register}

**Type:** `Function`

This function is called to load the plugin, even before the app is actually [bootstrapped](#bootstrap). It takes the running Strapi application as an argument (`app`).

Within the register function, a plugin can:

* register itself through the [`registerPlugin`](#registerplugin) function so the plugin is available in the admin panel
* add a new link to the main navigation (see [Admin navigation & settings](/cms/plugins-development/admin-navigation-settings#navigation-sidebar-menu-links))
* [create a new settings section](/cms/plugins-development/admin-navigation-settings#creating-a-new-settings-section)
* define [injection zones](/cms/plugins-development/admin-injection-zones)
* [add reducers](/cms/plugins-development/admin-redux-store#adding-custom-reducers)

**Example:**

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="my-plugin/admin/src/index.js"
// Auto-generated component
import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId'

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin" */ './pages/App');

        return component;
      },
      permissions: [], // array of permissions (object), allow a user to access a plugin depending on its permissions
    });
    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId';
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin" */ './pages/App');

        return component;
      },
      permissions: [], // array of permissions (object), allow a user to access a plugin depending on its permissions
    });
    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
};
```

</TabItem>
</Tabs>

#### registerPlugin() {#registerplugin}

**Type:** `Function`

Registers the plugin to make it available in the admin panel. This function is called within the [`register()`](#register) lifecycle function and returns an object with the following parameters:

| Parameter        | Type                     | Description                                                                                        |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `id`             | String                   | Plugin id                                                                                          |
| `name`           | String                   | Plugin name                                                                                        |
| `apis`           | `Record<string, unknown>` | APIs exposed to other plugins                                                                      |
| `initializer`    | `React.ComponentType`   | Component for plugin initialization                                                                |
| `injectionZones` | Object                   | Declaration of available [injection zones](/cms/plugins-development/admin-injection-zones)          |
| `isReady`        | Boolean                  | Plugin readiness status (default: `true`)                                                          |

:::note
Some parameters can be imported from the `package.json` file.
:::

**Example:**

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="my-plugin/admin/src/index.js"
export default {
  register(app) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
      apis: {
        // APIs exposed to other plugins
      },
      initializer: MyInitializerComponent,
      injectionZones: {
        // Areas where other plugins can inject components
      },
      isReady: false,
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
      apis: {
        // APIs exposed to other plugins
      },
      initializer: MyInitializerComponent,
      injectionZones: {
        // Areas where other plugins can inject components
      },
      isReady: false,
    });
  },
};
```

</TabItem>
</Tabs>

### bootstrap() {#bootstrap}

**Type**: `Function`

Exposes the bootstrap function, executed after all the plugins are [registered](#register).

Within the bootstrap function, a plugin can, for instance:

* extend another plugin, using `getPlugin('plugin-name')`,
* register hooks (see [Hooks](/cms/plugins-development/admin-hooks)),
* [add links to a settings section](/cms/plugins-development/admin-navigation-settings#adding-links-to-existing-settings-sections),
* add actions and options to the Content Manager's List view and Edit view (see details on the [Content Manager APIs page](/cms/plugins-development/content-manager-apis)).

**Example:**

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="my-plugin/admin/src/index.js"
module.exports = () => {
  return {
    // ...
    bootstrap(app) {
      // execute some bootstrap code
      app.getPlugin('content-manager').injectComponent('editView', 'right-links', { name: 'my-compo', Component: () => 'my-compo' })
    },
  };
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  // ...
  bootstrap(app: StrapiApp) {
    // execute some bootstrap code
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', { name: 'my-compo', Component: () => 'my-compo' })
  },
};
```

</TabItem>
</Tabs>

## Available actions

The Admin Panel API allows a plugin to take advantage of several small APIs to perform actions that will modify the user interface, user experience, or behavior of the admin panel. 

Use the following table as a reference to know which API and function to use, and where to declare them, and click on any function name to learn more:

| Action                                   | Function to use                                   | Related lifecycle function  |
| ---------------------------------------- | ------------------------------------------------- | --------------------------- |
| Add a new link to the main navigation    | [`addMenuLink()`](/cms/plugins-development/admin-navigation-settings#navigation-sidebar-menu-links)                      | [`register()`](#register)   |
| Create a new settings section            | [`createSettingSection()`](/cms/plugins-development/admin-navigation-settings#creating-a-new-settings-section) | [`register()`](#register)   |
| Add a single link to a settings section  | [`addSettingsLink()`](/cms/plugins-development/admin-navigation-settings#adding-links-to-existing-settings-sections)             | [`bootstrap()`](#bootstrap) |
| Add multiple links to a settings section | [`addSettingsLinks()`](/cms/plugins-development/admin-navigation-settings#adding-links-to-existing-settings-sections)           | [`bootstrap()`](#bootstrap) |
| Add panels, options, and actions to the Content Manager's Edit view and List view | <ul><li>[`addEditViewSidePanel()`](/cms/plugins-development/content-manager-apis#addeditviewsidepanel)</li><li>[`addDocumentAction()`](/cms/plugins-development/content-manager-apis#adddocumentaction)</li><li>[`addDocumentHeaderAction()`](/cms/plugins-development/content-manager-apis#adddocumentheaderaction)</li><li>[`addBulkAction()`](/cms/plugins-development/content-manager-apis#addbulkaction)</li></ul> | [`bootstrap()`](#bootstrap) |
| Declare an injection zone                | [`registerPlugin()`](#registerplugin)             | [`register()`](#register)   |
| Inject a component in an injection zone  | [`injectComponent()`](/cms/plugins-development/admin-injection-zones)           | [`bootstrap()`](#bootstrap)  |
| Add a reducer                            | [`addReducers()`](/cms/plugins-development/admin-redux-store#adding-custom-reducers)                      | [`register()`](#register)   |
| Create a hook                          | [`createHook()`](/cms/plugins-development/admin-hooks)                    | [`register()`](#register)   |
| Register a hook                          | [`registerHook()`](/cms/plugins-development/admin-hooks)                    | [`bootstrap()`](#bootstrap)   |
| Provide translations for your plugin's admin interface | [`registerTrads()`](/cms/plugins-development/admin-localization#registertrads) | _(Handled in the async `registerTrads()` function itself)_ |

<br/>
Click on any of the following cards to get more details about a specific topic:

<CustomDocCardsWrapper>
<CustomDocCard icon="wrench" title="Navigation & settings" description="Add menu links and configure settings sections for your plugin." link="/cms/plugins-development/admin-navigation-settings" />
<CustomDocCard icon="layout" title="Content Manager APIs" description="Add panels, actions, and options to the Content Manager List and Edit views." link="/cms/plugins-development/content-manager-apis" />
<CustomDocCard icon="syringe" title="Injection zones" description="Inject React components into predefined or custom areas of the admin panel." link="/cms/plugins-development/admin-injection-zones" />
<CustomDocCard icon="database" title="Redux store & reducers" description="Add custom reducers, read state, dispatch actions, and subscribe to changes in the Redux store." link="/cms/plugins-development/admin-redux-store" />
<CustomDocCard icon="git-branch" title="Hooks" description="Create and register hooks to let other plugins add personalized behavior." link="/cms/plugins-development/admin-hooks" />
<CustomDocCard icon="globe" title="Localization" description="Provide translations for your plugin's admin interface using registerTrads and react-intl." link="/cms/plugins-development/admin-localization" />
</CustomDocCardsWrapper>

:::tip Replacing the WYSIWYG
The WYSIWYG editor can be replaced by taking advantage of [custom fields](/cms/features/custom-fields), for instance using the <ExternalLink to="https://market.strapi.io/plugins/@ckeditor-strapi-plugin-ckeditor" text="CKEditor custom field plugin"/>.
:::

:::info
The admin panel supports dotenv variables.

All variables defined in a `.env` file and prefixed by `STRAPI_ADMIN_` are available while customizing the admin panel through `process.env`.
:::