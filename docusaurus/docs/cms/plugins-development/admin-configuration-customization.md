---
title: Admin configuration & customization
description: Configure and customize Strapi plugins in the admin panel with registerPlugin, menu links, and settings sections.
pagination_prev: cms/plugins-development/admin-panel-api
pagination_next: cms/plugins-development/admin-localization
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - plugin configuration
  - plugin customization
  - registerPlugin
  - plugin lifecycle
  - plugins development
---

# Admin configuration & customization

<Tldr>

The admin entry file exports `register`, `bootstrap`, and `registerTrads`. Use `registerPlugin` for base setup, `addMenuLink` and `createSettingSection` for navigation. For localization, injection zones, and Redux store access, see the dedicated sub-pages.

</Tldr>

This section covers configuration and customization options for Strapi plugins in the admin panel. Learn how to configure plugins, manage initialization, and customize the admin interface.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin).
:::

## Overview

The admin panel entry file (`admin/src/index.ts`) exports an object with lifecycle functions that control how your plugin integrates with Strapi's admin interface. The entry file can export 3 functions:

| Function | Type | Description |
|---|---|---|
| `register` | Required | Called to load the plugin before the app is bootstrapped. Use it to register the plugin, add menu links, create settings sections, define [injection zones](/cms/plugins-development/admin-injection-zones), and [add reducers](/cms/plugins-development/admin-panel-api#reducers-api). |
| `bootstrap` | Optional | Executed after all plugins are registered. Use it to extend other plugins, [register hooks](/cms/plugins-development/admin-panel-api#hooks-api), add settings links, inject components into injection zones, and add [Content Manager actions](/cms/plugins-development/content-manager-apis). |
| `registerTrads` | Required | Async function to register translation files for all locales. See [Admin localization](/cms/plugins-development/admin-localization). |

## Base configuration

The `registerPlugin` method is the core function for registering a plugin in the admin panel. Call this method within the `register` lifecycle function of your plugin's entry file (`admin/src/index.ts`). It configures the main options to integrate the plugin with Strapi's admin interface.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="admin/src/index.js"
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
      isReady: false, // Plugin readiness status
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
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
      isReady: false, // Plugin readiness status
    });
  },
};
```

</TabItem>
</Tabs>

### Configuration options

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique plugin identifier |
| `name` | `string` | ✅ | Plugin display name |
| `apis` | `Record<string, unknown>` | ❌ | APIs exposed to other plugins |
| `initializer` | `React.ComponentType` | ❌ | Component for plugin initialization |
| `injectionZones` | `object` | ❌ | Available injection zones (see [Injection zones](/cms/plugins-development/admin-injection-zones)) |
| `isReady` | `boolean` | ❌ | Plugin readiness status (default: `true`) |

## Customizing menu and settings

Plugins can customize the admin panel's navigation sidebar and settings pages to provide access to their features.

### Navigation sidebar (menu links)

The navigation sidebar is the main menu on the left side of the admin panel. Plugins can add links to this sidebar using the `addMenuLink()` method in the `register` lifecycle function.

#### Adding a menu link

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/index.js"
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/my-plugin`,
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name',
        defaultMessage: 'My Plugin',
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
      permissions: [], // Array of permission objects
      position: 3, // Position in the menu (lower numbers appear first)
      licenseOnly: false, // Set to true to show ⚡ icon for paid features
    });

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import PluginIcon from './components/PluginIcon';
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `/plugins/my-plugin`,
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name',
        defaultMessage: 'My Plugin',
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
      permissions: [], // Array of permission objects
      position: 3, // Position in the menu (lower numbers appear first)
      licenseOnly: false, // Set to true to show ⚡ icon for paid features
    });

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
</Tabs>

#### Menu link parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `to` | `string` | ✅ | Path the link should point to (relative to the admin panel root) |
| `icon` | `React.Component` | ✅ | React component for the icon to display in the navigation |
| `intlLabel` | `object` | ✅ | Localized label object with `id` (translation key) and `defaultMessage` (fallback label) |
| `Component` | `async function` | ✅ | Async function that returns a dynamic import of the plugin's main page component |
| `permissions` | `Array<object>` | ❌ | Array of permission objects that control access to the link |
| `position` | `number` | ❌ | Numeric position in the menu (lower numbers appear first) |
| `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`) |

:::note
The `intlLabel.id` values should correspond to keys in your translation files located at `admin/src/translations/[locale].json`. See [Admin localization](/cms/plugins-development/admin-localization) for details.
:::

### Settings

The Settings API allows plugins to create new settings sections or add links to existing sections. Settings sections are organized groups of configuration pages accessible from the Settings menu item in the navigation sidebar.

#### Creating a new settings section

Use `createSettingSection()` in the `register` lifecycle function:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/index.js"
export default {
  register(app) {
    app.createSettingSection(
      {
        id: 'my-plugin',
        intlLabel: {
          id: 'my-plugin.settings.section-label',
          defaultMessage: 'My Plugin Settings',
        },
      },
      [
        {
          intlLabel: {
            id: 'my-plugin.settings.general',
            defaultMessage: 'General',
          },
          id: 'general',
          to: 'my-plugin/general',
          Component: async () => {
            const { GeneralSettings } =
              await import('./pages/Settings/General');
            return GeneralSettings;
          },
        },
        {
          intlLabel: {
            id: 'my-plugin.settings.advanced',
            defaultMessage: 'Advanced',
          },
          id: 'advanced',
          to: 'my-plugin/advanced',
          Component: async () => {
            const { AdvancedSettings } =
              await import('./pages/Settings/Advanced');
            return AdvancedSettings;
          },
        },
      ],
    );

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.createSettingSection(
      {
        id: 'my-plugin',
        intlLabel: {
          id: 'my-plugin.settings.section-label',
          defaultMessage: 'My Plugin Settings',
        },
      },
      [
        {
          intlLabel: {
            id: 'my-plugin.settings.general',
            defaultMessage: 'General',
          },
          id: 'general',
          to: 'my-plugin/general',
          Component: async () => {
            const { GeneralSettings } =
              await import('./pages/Settings/General');
            return GeneralSettings;
          },
        },
        {
          intlLabel: {
            id: 'my-plugin.settings.advanced',
            defaultMessage: 'Advanced',
          },
          id: 'advanced',
          to: 'my-plugin/advanced',
          Component: async () => {
            const { AdvancedSettings } =
              await import('./pages/Settings/Advanced');
            return AdvancedSettings;
          },
        },
      ],
    );

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
</Tabs>

#### `createSettingSection` parameters

**First argument** (`sectionConfig`):

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier for the settings section |
| `intlLabel` | `object` | ✅ | Localized label object with `id` (translation key) and `defaultMessage` (fallback label) |

**Second argument** (`links`), an array of link objects:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier for the settings link |
| `to` | `string` | ✅ | Path relative to the settings route (do not include `settings/` prefix) |
| `intlLabel` | `object` | ✅ | Localized label object with `id` and `defaultMessage` |
| `Component` | `async function` | ✅ | Async function that returns a dynamic import of the settings page component |
| `permissions` | `Array<object>` | ❌ | Array of permission objects that control access to the link |
| `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon (default: `false`) |

#### Adding links to existing settings sections

To add a single link to an existing settings section, use `addSettingsLink()` in the `bootstrap` lifecycle function. To add multiple links at once, use `addSettingsLinks()`.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/index.js"
export default {
  register(app) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app) {
    // Add a single link to the global settings section
    app.addSettingsLink('global', {
      intlLabel: {
        id: 'my-plugin.settings.documentation',
        defaultMessage: 'Documentation',
      },
      id: 'documentation',
      to: 'my-plugin/documentation',
      Component: async () => {
        const { DocumentationPage } =
          await import('./pages/Settings/Documentation');
        return DocumentationPage;
      },
      permissions: [],
      licenseOnly: false,
    });

    // Add multiple links at once to the global settings section
    app.addSettingsLinks('global', [
      {
        intlLabel: {
          id: 'my-plugin.settings.general',
          defaultMessage: 'General',
        },
        id: 'general',
        to: 'my-plugin/general',
        Component: async () => {
          const { GeneralSettings } =
            await import('./pages/Settings/General');
          return GeneralSettings;
        },
      },
      {
        intlLabel: {
          id: 'my-plugin.settings.advanced',
          defaultMessage: 'Advanced',
        },
        id: 'advanced',
        to: 'my-plugin/advanced',
        Component: async () => {
          const { AdvancedSettings } =
            await import('./pages/Settings/Advanced');
          return AdvancedSettings;
        },
      },
    ]);
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Add a single link to the global settings section
    app.addSettingsLink('global', {
      intlLabel: {
        id: 'my-plugin.settings.documentation',
        defaultMessage: 'Documentation',
      },
      id: 'documentation',
      to: 'my-plugin/documentation',
      Component: async () => {
        const { DocumentationPage } =
          await import('./pages/Settings/Documentation');
        return DocumentationPage;
      },
      permissions: [],
      licenseOnly: false,
    });

    // Add multiple links at once to the global settings section
    app.addSettingsLinks('global', [
      {
        intlLabel: {
          id: 'my-plugin.settings.general',
          defaultMessage: 'General',
        },
        id: 'general',
        to: 'my-plugin/general',
        Component: async () => {
          const { GeneralSettings } =
            await import('./pages/Settings/General');
          return GeneralSettings;
        },
      },
      {
        intlLabel: {
          id: 'my-plugin.settings.advanced',
          defaultMessage: 'Advanced',
        },
        id: 'advanced',
        to: 'my-plugin/advanced',
        Component: async () => {
          const { AdvancedSettings } =
            await import('./pages/Settings/Advanced');
          return AdvancedSettings;
        },
      },
    ]);
  },
};
```

</TabItem>
</Tabs>

#### `addSettingsLink` and `addSettingsLinks` parameters

Both functions take a `sectionId` string as the first argument (e.g., `'global'` or `'permissions'`). The second argument is a single link object for `addSettingsLink` or an array of link objects for `addSettingsLinks`, using the same properties as the `links` array in `createSettingSection` (see table above).

#### Available settings sections

Strapi provides built-in settings sections that plugins can extend:

- `global`: General application settings
- `permissions`: Administration panel settings

:::note
Creating a new settings section must be done in the `register` lifecycle function. Adding links to existing settings sections must be done in the `bootstrap` lifecycle function. The `to` path for settings links should be relative to the settings route (e.g., `'my-plugin/general'` not `'settings/my-plugin/general'`).
:::