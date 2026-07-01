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

Use `addMenuLink` in `register` to add sidebar links. Use `addSettingsLink` to both create new settings sections (pass a section object as the first argument) and extend existing ones (pass a section id string). The legacy `createSettingSection` and `addSettingsLinks` methods are deprecated.

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
| `to` | `string` | ✅ | Path the link should point to (relative to the admin panel root) (see [additional information](#path-conventions-for-to)) |
| `icon` | `React.ElementType` | ✅ | React component for the icon to display in the navigation |
| `intlLabel` | `object` | ✅ | Label for the link, following the <ExternalLink to="https://formatjs.io/docs/react-intl" text="React Int'l"/> convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `permissions` | `Array<Permission>` | ✅ | Array of permission objects that control link visibility. Pass `[]` for no restrictions. |
| `Component` | `function` | ❌ | Function that returns a dynamic `import()` of the plugin's main page component. The page module must export the component as `default`. If omitted, no route is registered (label-only entry). |
| `position` | `number` | ❌ | Numeric position in the menu (lower numbers appear first) |
| `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`) |
| `target` | `string` | ❌ | Standard anchor `target` attribute (e.g. `_blank` for external links) |
| `notificationsCount` | `number` | ❌ | Badge count shown next to the menu label |
| `exact` | `boolean` | ❌ | Whether the active-link match should be exact |

:::note
The `intlLabel.id` values should correspond to keys in your translation files located at `admin/src/translations/[locale].json`. See [Admin localization](/cms/plugins-development/admin-localization) for details.
:::

:::caution
The `permissions` parameter only controls whether the link is visible in the navigation. It does not protect the page itself. A user who knows the URL can still access the page directly. To fully secure a plugin route, you must also check permissions inside your page component and register your RBAC actions on the server side with `actionProvider.registerMany`. See the [Admin permissions for plugins](/cms/plugins-development/guides/admin-permissions-for-plugins) guide for a complete walkthrough.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```jsx title="admin/src/index.js"
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    // highlight-start
    app.addMenuLink({
      to: `/plugins/my-plugin`,
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name',
        defaultMessage: 'My Plugin',
      },
      Component: () => import('./pages/App'),
      permissions: [], // Array of permission objects
      position: 3, // Position in the menu (lower numbers appear first)
      licenseOnly: false, // Set to true to show ⚡ icon for paid features
    });
    // highlight-end

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
    // highlight-start
    app.addMenuLink({
      to: `/plugins/my-plugin`,
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name',
        defaultMessage: 'My Plugin',
      },
      Component: () => import('./pages/App'),
      permissions: [], // Array of permission objects
      position: 3, // Position in the menu (lower numbers appear first)
      licenseOnly: false, // Set to true to show ⚡ icon for paid features
    });
    // highlight-end

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
</Tabs>

:::note
The page module referenced by `Component` must export the component as the **default export** (e.g. `export default App;` in `admin/src/pages/App.tsx`). Earlier versions of Strapi accepted an `async` callback that returned a named export, but this pattern is deprecated and logs a warning at runtime. Use `Component: () => import(path)` so the dynamic import directly resolves to the module's default export.
:::

## Settings

The Settings API allows plugins to create new settings sections or add links to existing sections. Settings sections are organized groups of configuration pages accessible from the <Icon name="gear-six"/> _Settings_ menu item in the navigation sidebar.

<!-- TODO: add screenshot to show what we are talking about with "Settings" -->

### Creating a new settings section

To create a new settings section, call `addSettingsLink()` with a section object (`{ id, intlLabel }`) as the first argument and an array of link objects as the second argument. This can be done in either the `register` or `bootstrap` lifecycle function:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```jsx title="admin/src/index.js"
export default {
  register(app) {
    // highlight-start
    app.addSettingsLink(
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
          Component: () => import('./pages/Settings/General'),
        },
        {
          intlLabel: {
            id: 'my-plugin.settings.advanced',
            defaultMessage: 'Advanced',
          },
          id: 'advanced',
          to: 'my-plugin/advanced',
          Component: () => import('./pages/Settings/Advanced'),
        },
      ],
    );
    // highlight-end

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
    // highlight-start
    app.addSettingsLink(
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
          Component: () => import('./pages/Settings/General'),
        },
        {
          intlLabel: {
            id: 'my-plugin.settings.advanced',
            defaultMessage: 'Advanced',
          },
          id: 'advanced',
          to: 'my-plugin/advanced',
          Component: () => import('./pages/Settings/Advanced'),
        },
      ],
    );
    // highlight-end

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

</TabItem>
</Tabs>

When used to create a new section, `addSettingsLink()` accepts the following parameters:

* the first argument is the section configuration:

  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `id` | `string` | ✅ | Unique identifier for the settings section |
  | `intlLabel` | `object` | ✅ | Localized label for the section, following the <ExternalLink to="https://formatjs.io/docs/react-intl" text="React Int'l"/> convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the section</li></ul> |

* the second argument is an array of link objects; each link object contains the following:

  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `id` | `string` | ✅ | Unique identifier for the settings link |
  | `to` | `string` | ✅ | Path relative to the settings route (do not include `settings/` prefix) (see [additional information](#path-conventions-for-to)) |
  | `intlLabel` | `object` | ✅ | Localized label object with `id` and `defaultMessage` |
  | `permissions` | `Array<Permission>` | ✅ | Array of permission objects that control link visibility. Pass `[]` for no restrictions. |
  | `Component` | `function` | ❌ | Function that returns a dynamic `import()` of the settings page component. The page module must export the component as `default`. If omitted, no route is registered (label-only entry). |
  | `position` | `number` | ❌ | Numeric position within the section (lower numbers appear first) |
  | `licenseOnly` | `boolean` | ❌ | If `true`, displays a ⚡ icon (default: `false`) |
  | `exact` | `boolean` | ❌ | Whether the active-link match should be exact |

:::caution Deprecated: `createSettingSection()`
The dedicated `app.createSettingSection(section, links)` method is deprecated. It still works (it delegates to `addSettingsLink` internally) but new code should call `addSettingsLink(section, links)` directly. See [Deprecated methods](#deprecated-methods).
:::

### Adding links to existing settings sections

To add links to an existing settings section, use `addSettingsLink()` in the `bootstrap()` lifecycle function with a section id string as the first argument. The second argument can be either a single link object or an array of link objects. Both forms are supported by the same method.

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
    // highlight-start
    app.addSettingsLink('global', {
      intlLabel: {
        id: 'my-plugin.settings.documentation',
        defaultMessage: 'Documentation',
      },
      id: 'documentation',
      to: 'my-plugin/documentation',
      Component: () => import('./pages/Settings/Documentation'),
      permissions: [],
      licenseOnly: false,
    });
    // highlight-end

    // Add multiple links at once to the global settings section
    // highlight-start
    app.addSettingsLink('global', [
      {
        intlLabel: {
          id: 'my-plugin.settings.general',
          defaultMessage: 'General',
        },
        id: 'general',
        to: 'my-plugin/general',
        Component: () => import('./pages/Settings/General'),
      },
      {
        intlLabel: {
          id: 'my-plugin.settings.advanced',
          defaultMessage: 'Advanced',
        },
        id: 'advanced',
        to: 'my-plugin/advanced',
        Component: () => import('./pages/Settings/Advanced'),
      },
    ]);
    // highlight-end
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
    // highlight-start
    app.addSettingsLink('global', {
      intlLabel: {
        id: 'my-plugin.settings.documentation',
        defaultMessage: 'Documentation',
      },
      id: 'documentation',
      to: 'my-plugin/documentation',
      Component: () => import('./pages/Settings/Documentation'),
      permissions: [],
      licenseOnly: false,
    });
    // highlight-end

    // Add multiple links at once to the global settings section
    // highlight-start
    app.addSettingsLink('global', [
      {
        intlLabel: {
          id: 'my-plugin.settings.general',
          defaultMessage: 'General',
        },
        id: 'general',
        to: 'my-plugin/general',
        Component: () => import('./pages/Settings/General'),
      },
      {
        intlLabel: {
          id: 'my-plugin.settings.advanced',
          defaultMessage: 'Advanced',
        },
        id: 'advanced',
        to: 'my-plugin/advanced',
        Component: () => import('./pages/Settings/Advanced'),
      },
    ]);
    // highlight-end
  },
};
```

</TabItem>
</Tabs>

`addSettingsLink` takes a `sectionId` string as the first argument (e.g., `'global'` or `'permissions'`). The second argument is either a single link object or an array of link objects, using the same properties as the `links` array in [Creating a new settings section](#creating-a-new-settings-section).

:::caution Deprecated: `addSettingsLinks()`
The plural `app.addSettingsLinks(sectionId, links)` method is deprecated. Call `addSettingsLink(sectionId, links)` (singular) with an array instead; it accepts both single links and arrays. See [Deprecated methods](#deprecated-methods).
:::

### Available settings sections

Strapi provides built-in settings sections that plugins can extend:

- `global`: General application settings
- `permissions`: Administration panel settings

:::note
Creating a new settings section is typically done in the `register` lifecycle function, while adding links to existing settings sections is done in `bootstrap` (because the target section may be registered by another plugin). Both forms call the same `addSettingsLink()` method, which is exposed on the `app` argument of `register` and as `addSettingsLink` in the `bootstrap` argument bag.
:::

### Path conventions for `to`

The `to` parameter behaves differently depending on the context:

| Context | `to` value | Final URL |
|---|---|---|
| `addMenuLink` | `/plugins/my-plugin` | `http://localhost:1337/admin/plugins/my-plugin` |
| `addSettingsLink` (with section object) | `my-plugin/general` | `http://localhost:1337/admin/settings/my-plugin/general` |
| `addSettingsLink` (with section id) | `my-plugin/documentation` | `http://localhost:1337/admin/settings/my-plugin/documentation` |

For menu links, the path is relative to the admin panel root (`/admin`). For settings links, the path is relative to the settings route (`/admin/settings`). Do not include the `settings/` prefix in settings link paths.

:::strapi Securing plugin routes
The `permissions` parameter on links only controls visibility in the navigation. To fully protect your plugin pages and register RBAC actions, see the [Admin permissions for plugins](/cms/plugins-development/guides/admin-permissions-for-plugins) guide.
:::

## Deprecated methods

The following methods on the `StrapiApp` instance are deprecated. They still work for backwards compatibility (both delegate to `addSettingsLink()` internally), but new code should use `addSettingsLink()` directly.

### `createSettingSection(section, links)`

Previously used to register a new settings section and its initial links in one call.

```js
// ❌ Deprecated
app.createSettingSection(
  { id: 'my-plugin', intlLabel: { id: 'my-plugin.settings.section-label', defaultMessage: 'My Plugin Settings' } },
  [{ id: 'general', to: 'my-plugin/general', intlLabel: { id: 'my-plugin.settings.general', defaultMessage: 'General' }, Component: () => import('./pages/Settings/General') }],
);

// ✅ Replacement: pass the section object as the first argument to addSettingsLink
app.addSettingsLink(
  { id: 'my-plugin', intlLabel: { id: 'my-plugin.settings.section-label', defaultMessage: 'My Plugin Settings' } },
  [{ id: 'general', to: 'my-plugin/general', intlLabel: { id: 'my-plugin.settings.general', defaultMessage: 'General' }, Component: () => import('./pages/Settings/General') }],
);
```

### `addSettingsLinks(sectionId, links)`

Previously used to add multiple links to an existing section in one call. The singular `addSettingsLink()` now accepts either a single link object or an array.

```js
// ❌ Deprecated
app.addSettingsLinks('global', [
  { id: 'general', to: 'my-plugin/general', intlLabel: { id: 'my-plugin.settings.general', defaultMessage: 'General' }, Component: () => import('./pages/Settings/General') },
  { id: 'advanced', to: 'my-plugin/advanced', intlLabel: { id: 'my-plugin.settings.advanced', defaultMessage: 'Advanced' }, Component: () => import('./pages/Settings/Advanced') },
]);

// ✅ Replacement: pass the array to addSettingsLink (singular)
app.addSettingsLink('global', [
  { id: 'general', to: 'my-plugin/general', intlLabel: { id: 'my-plugin.settings.general', defaultMessage: 'General' }, Component: () => import('./pages/Settings/General') },
  { id: 'advanced', to: 'my-plugin/advanced', intlLabel: { id: 'my-plugin.settings.advanced', defaultMessage: 'Advanced' }, Component: () => import('./pages/Settings/Advanced') },
]);
```

:::note
- `addSettingsLinks` is still exposed on the `bootstrap` argument bag (alongside `addSettingsLink`, `getPlugin`, and `registerHook`) for backwards compatibility.
- `createSettingSection` is only reachable via the full `app` instance passed to `register(app)`; it is not part of the `bootstrap` argument bag.
- Both delegate to `addSettingsLink()` internally and may be removed in a future major version. Migrate when convenient.
:::
