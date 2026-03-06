---
title: Admin navigation & settings
description: Add menu links, create settings sections, and configure settings links for your Strapi plugin in the admin panel.
pagination_prev: cms/plugins-development/admin-panel-api
pagination_next: cms/plugins-development/content-manager-apis
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - admin panel customization
  - admin panel API
  - menu links
  - settings
  - plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'

# Admin Panel API: Navigation & settings

<Tldr>

Use `addMenuLink` in `register` to add sidebar links, `createSettingSection` in `register` to create settings groups, and `addSettingsLink`/`addSettingsLinks` in `bootstrap` to extend existing settings sections.

</Tldr>

Plugins can customize the admin panel's navigation sidebar and settings pages to provide access to their features. All functions described on this page are called within the [`register`](/cms/plugins-development/admin-panel-api#register) or [`bootstrap`](/cms/plugins-development/admin-panel-api#bootstrap) lifecycle functions of your plugin's entry file.

<Prerequisite />

## Navigation sidebar (menu links)

The navigation sidebar is the main menu on the left side of the admin panel. Plugins can add links to this sidebar using the `addMenuLink()` method in the `register` lifecycle function.

### Adding a menu link

Adding a link to the navigation sidebar is done with the `addMenuLink()` function, which should be registered through the `register()` lifecycle function of your plugin.

<!-- TODO: add screenshot to show where menu links are added -->

A menu link accepts the following parameters:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `to` | `string` | ✅ | Path the link should point to (relative to the admin panel root) |
| `icon` | `React.Component` | ✅ | React component for the icon to display in the navigation |
| `intlLabel` | `object` | ✅ | Label for the link, following the <ExternalLink to="https://formatjs.io/docs/react-intl" text="React Int'l"/> convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `Component` | `async function` | ✅ | Async function that returns a dynamic import of the plugin's main page component |
| `permissions` | `Array<object>` | ❌ | Array of permission objects that control access to the link |
| `position` | `number` | ❌ | Numeric position in the menu (lower numbers appear first) |
| `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`) |

:::note
The `intlLabel.id` values should correspond to keys in your translation files located at `admin/src/translations/[locale].json`. See [Admin localization](/cms/plugins-development/admin-localization) for details.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

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

## Settings

The Settings API allows plugins to create new settings sections or add links to existing sections. Settings sections are organized groups of configuration pages accessible from the <Icon name="gear-six"/> _Settings_ menu item in the navigation sidebar.

<!-- TODO: add screenshot to show what we are talking about with "Settings" -->

### Creating a new settings section

Use `createSettingSection()` in the `register` lifecycle function:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

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

The `createSettingSection()` function accepts the following parameters:

* the first argument is the section configuration:

  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `id` | `string` | ✅ | Unique identifier for the settings section |
  | `intlLabel` | `object` | ✅ | Localized label for the section, following the <ExternalLink to="https://formatjs.io/docs/react-intl" text="React Int'l"/> convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the section</li></ul> |

* the second argument is an array of link objects; each link object contains the following:

  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `id` | `string` | ✅ | Unique identifier for the settings link |
  | `to` | `string` | ✅ | Path relative to the settings route (do not include `settings/` prefix) |
  | `intlLabel` | `object` | ✅ | Localized label object with `id` and `defaultMessage` |
  | `Component` | `async function` | ✅ | Async function that returns a dynamic import of the settings page component |
  | `permissions` | `Array<object>` | ❌ | Array of permission objects that control access to the link |
  | `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon (default: `false`) |

### Adding links to existing settings sections

To add a single link to an existing settings section, use `addSettingsLink()` in the `bootstrap()` lifecycle function. To add multiple links at once, use `addSettingsLinks()`.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

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

`addSettingsLink` and `addSettingsLinks` both take a `sectionId` string as the first argument (e.g., `'global'` or `'permissions'`). The second argument is a single link object for `addSettingsLink` or an array of link objects for `addSettingsLinks`, using the same properties as the `links` array in [`createSettingSection()` (see table above)](#creating-a-new-settings-section).

### Available settings sections

Strapi provides built-in settings sections that plugins can extend:

- `global`: General application settings
- `permissions`: Administration panel settings

:::note
Creating a new settings section must be done in the `register` lifecycle function. Adding links to existing settings sections must be done in the `bootstrap` lifecycle function. The `to` path for settings links should be relative to the settings route (e.g., `'my-plugin/general'` not `'settings/my-plugin/general'`).
:::