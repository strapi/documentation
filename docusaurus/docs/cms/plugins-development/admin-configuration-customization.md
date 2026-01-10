---
title: Admin Configuration & Customization
pagination_prev: cms/plugins-development/plugin-sdk
pagination_next: cms/plugins-development/admin-panel-api
toc_max_heading_level: 4
tags:
  - admin panel
  - plugin configuration
  - plugin customization
  - registerPlugin
  - plugin APIs
  - plugin lifecycle
  - plugins development
---

# Admin Configuration & Customization

This section covers advanced configuration and customization options for Strapi plugins in the admin panel. Learn how to configure plugins, expose APIs, manage initialization, and customize the admin interface.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin).
:::

## Overview

The admin panel entry file (`admin/src/index.ts`) exports an object with lifecycle functions that control how your plugin integrates with Strapi's admin interface. The entry file can export three functions:

### Available Exports

| Function        | Type     | Description                                                                                                                                                                                                  |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `register`      | Required | Lifecycle function called to load the plugin before the app is bootstrapped. Use this to register the plugin, add menu links, create settings sections, define injection zones, and add reducers.            |
| `bootstrap`     | Optional | Lifecycle function executed after all plugins are registered. Use this to extend other plugins, register hooks, add settings links, inject components into injection zones, and add Content Manager actions. |
| `registerTrads` | Required | Async function to register translation files for all locales. This creates separate chunks for application translations to reduce build size.                                                                |

## Base Configuration

The `registerPlugin` method is the core function for registering a plugin in the admin panel. This method is called within the `register` lifecycle function of your plugin's entry file (`admin/src/index.ts`) and configures the main options to integrate the plugin with Strapi's admin interface.

```typescript
// admin/src/index.ts
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

### Configuration Options

| Parameter        | Type                      | Required | Description                               |
| ---------------- | ------------------------- | -------- | ----------------------------------------- |
| `id`             | `string`                  | ✅       | Unique plugin identifier                  |
| `name`           | `string`                  | ✅       | Plugin display name                       |
| `apis`           | `Record<string, unknown>` | ❌       | APIs exposed to other plugins             |
| `initializer`    | `React.ComponentType`     | ❌       | Component for plugin initialization       |
| `injectionZones` | `object`                  | ❌       | Available injection zones                 |
| `isReady`        | `boolean`                 | ❌       | Plugin readiness status (default: `true`) |

## Admin Localization

Plugins can provide translations for multiple languages to make the admin interface accessible to users worldwide. Strapi automatically loads and merges plugin translations with core translations, making them available throughout the admin panel.

### Translation File Structure

Translation files are stored in the `admin/src/translations/` directory, with one JSON file per locale:

```
admin/src/translations/
  ├── en.json
  ├── fr.json
  ├── de.json
  └── ...
```

Each translation file contains key-value pairs where keys are translation identifiers and values are the translated strings:

```json
// admin/src/translations/en.json
{
  "plugin.name": "My Plugin",
  "plugin.description": "A custom Strapi plugin",
  "settings.title": "Settings",
  "settings.general": "General",
  "settings.advanced": "Advanced"
}
```

### The `registerTrads` Function

The `registerTrads` function is a required lifecycle function that loads translation files for all configured locales. Strapi calls this function during the admin panel initialization to collect translations from all plugins.

#### Basic Implementation

```typescript
// admin/src/index.ts
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'My Plugin',
    });
  },
  async registerTrads({ locales }) {
    const importedTranslations = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, PLUGIN_ID),
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

    return importedTranslations;
  },
};
```

#### Function Parameters

The `registerTrads` function receives an object with the following property:

| Parameter | Type       | Description                                                                      |
| --------- | ---------- | -------------------------------------------------------------------------------- |
| `locales` | `string[]` | Array of locale codes configured in the admin panel (e.g., `['en', 'fr', 'de']`) |

#### Return Value

The function must return a `Promise` that resolves to an array of translation objects. Each object has the following structure:

```typescript
{
  data: Record<string, string>; // Translation key-value pairs
  locale: string; // Locale code (e.g., 'en', 'fr')
}
```

#### Translation Key Prefixing

**Important**: Translation keys must be prefixed with your plugin ID to avoid conflicts with other plugins and core Strapi translations. For example, if your plugin ID is `my-plugin`, a key like `plugin.name` should become `my-plugin.plugin.name`.

Use the `prefixPluginTranslations` utility function to automatically prefix all keys:

```typescript
// admin/src/utils/prefixPluginTranslations.ts
type TradOptions = Record<string, string>;

const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string
): TradOptions => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {} as TradOptions);
};

export { prefixPluginTranslations };
```

**Example**: If your translation file contains:

```json
{
  "plugin.name": "My Plugin",
  "settings.title": "Settings"
}
```

After prefixing with plugin ID `my-plugin`, these become:

- `my-plugin.plugin.name`
- `my-plugin.settings.title`

#### Handling Missing Translation Files

The `registerTrads` function should gracefully handle missing translation files by returning an empty object for that locale. The `.catch()` handler in the example above ensures that if a translation file doesn't exist, the plugin still returns a valid translation object:

```typescript
.catch(() => {
  return {
    data: {},
    locale,
  };
});
```

This allows plugins to provide translations for only some locales (e.g., only English) without breaking the admin panel for other locales.

### Using Translations in Components

To use translations in your React components, use the `useIntl` hook from `react-intl`:

```typescript
// admin/src/pages/HomePage.tsx
import { useIntl } from 'react-intl';
import { PLUGIN_ID } from '../pluginId';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <h1>
        {formatMessage({
          id: `${PLUGIN_ID}.plugin.name`,
          defaultMessage: 'My Plugin',
        })}
      </h1>
      <p>
        {formatMessage({
          id: `${PLUGIN_ID}.plugin.description`,
          defaultMessage: 'A custom Strapi plugin',
        })}
      </p>
    </div>
  );
};

export default HomePage;
```

#### Helper Function for Translation Keys

To avoid repeating the plugin ID prefix, create a helper function:

```typescript
// admin/src/utils/getTranslation.ts
import { PLUGIN_ID } from '../pluginId';

export const getTranslation = (id: string) => `${PLUGIN_ID}.${id}`;
```

Then use it in components:

```typescript
// admin/src/pages/HomePage.tsx
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <h1>
        {formatMessage({
          id: getTranslation('plugin.name'),
          defaultMessage: 'My Plugin',
        })}
      </h1>
    </div>
  );
};
```

### Using Translations in Configuration

Translation keys are also used when configuring menu links, settings sections, and other admin panel elements:

```typescript
// admin/src/index.ts
export default {
  register(app) {
    app.addMenuLink({
      to: '/plugins/my-plugin',
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name', // Prefixed translation key
        defaultMessage: 'My Plugin', // Fallback if translation missing
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });
  },
};
```

### How Strapi Integrates Plugin Translations

Strapi's admin panel automatically:

1. **Calls `registerTrads`** for all registered plugins during initialization
2. **Merges translations** from all plugins with core Strapi translations
3. **Applies custom translations** from the admin configuration (if any)
4. **Makes translations available** via `react-intl` throughout the admin panel

The merge order ensures that:

- Core Strapi translations are loaded first
- Plugin translations are merged on top
- Custom translations from admin config override both (allowing users to customize translations)

### Best Practices

1. **Always prefix translation keys**: Use `prefixPluginTranslations` or manually prefix keys with your plugin ID to avoid conflicts.

2. **Provide default messages**: Always include `defaultMessage` when using `formatMessage` as a fallback if translations are missing.

3. **Handle missing translations gracefully**: The `registerTrads` function should return empty objects for missing locales rather than throwing errors.

4. **Use descriptive key names**: Choose clear, hierarchical key names (e.g., `settings.general.title` rather than `title1`).

5. **Support at least English**: While not required, providing English translations ensures your plugin works out of the box.

6. **Test with multiple locales**: Verify that your plugin works correctly when different locales are selected in the admin panel.

:::note
The `en` locale is always available in Strapi and serves as the fallback locale. If a translation is missing for a selected locale, Strapi will use the English translation.
:::

:::tip
To see which locales are available in your Strapi instance, check the `config.locales` array in your `src/admin/app.ts` or `src/admin/app.js` file. You can also access available locales from the Redux store using `useSelector((state) => state.admin_app?.language?.localeNames)`.
:::

## Customizing Menu and Settings

Plugins can customize the admin panel's navigation sidebar and settings pages to provide easy access to their features. This section covers how to add menu links to the main navigation and how to create or extend settings sections.

### Navigation Sidebar (Menu Links)

The navigation sidebar is the main menu on the left side of the admin panel. Plugins can add links to this sidebar using the `addMenuLink()` method, which should be called within the `register` lifecycle function.

#### Adding a Menu Link

```typescript
// admin/src/index.ts
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

#### Menu Link Parameters

| Parameter     | Type              | Required | Description                                                                                                                                                     |
| ------------- | ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`          | `string`          | ✅       | Path the link should point to (relative to the admin panel root)                                                                                                |
| `icon`        | `React.Component` | ✅       | React component for the icon to display in the navigation                                                                                                       |
| `intlLabel`   | `object`          | ✅       | Localized label object with:<ul><li>`id`: Translation key used in translation files</li><li>`defaultMessage`: Default label if translation is missing</li></ul> |
| `Component`   | `async function`  | ✅       | Async function that returns a dynamic import of the plugin's main page component                                                                                |
| `permissions` | `Array<object>`   | ❌       | Array of permission objects that control access to the link                                                                                                     |
| `position`    | `number`          | ❌       | Numeric position in the menu (lower numbers appear first)                                                                                                       |
| `licenseOnly` | `boolean`         | ❌       | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`)                                                                |

:::note
The `intlLabel.id` values should correspond to keys in your translation files located at `admin/src/translations/[locale].json`.
:::

### Settings

The Settings API allows plugins to create new settings sections or add links to existing sections. Settings sections are organized groups of configuration pages accessible from the Settings menu item in the navigation sidebar.

#### Creating a New Settings Section

To create a new settings section with multiple links, use `createSettingSection()` in the `register` lifecycle function:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { PERMISSIONS } from './constants';

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
            const { GeneralSettings } = await import(
              './pages/Settings/General'
            );
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
            const { AdvancedSettings } = await import(
              './pages/Settings/Advanced'
            );
            return AdvancedSettings;
          },
        },
      ]
    );

    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
};
```

#### createSettingSection Parameters

**Function Signature:**

```typescript
createSettingSection(
  sectionConfig: { id: string; intlLabel: { id: string; defaultMessage: string } },
  links: Array<LinkConfig>
)
```

**First Argument - `sectionConfig` (object):**

| Parameter   | Type     | Required | Description                                                                                                                                                                       |
| ----------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `string` | ✅       | Unique identifier for the settings section                                                                                                                                        |
| `intlLabel` | `object` | ✅       | Localized label object with:<ul><li>`id` (string): Translation key used in translation files</li><li>`defaultMessage` (string): Default label if translation is missing</li></ul> |

**Second Argument - `links` (array):**

An array of link configuration objects, where each object has the following properties:

| Parameter     | Type             | Required | Description                                                                                      |
| ------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `id`          | `string`         | ✅       | Unique identifier for the settings link                                                          |
| `to`          | `string`         | ✅       | Path relative to the settings route (should not include `settings/` prefix)                      |
| `intlLabel`   | `object`         | ✅       | Localized label object with `id` and `defaultMessage`                                            |
| `Component`   | `async function` | ✅       | Async function that returns a dynamic import of the settings page component                      |
| `permissions` | `Array<object>`  | ❌       | Array of permission objects that control access to the link                                      |
| `licenseOnly` | `boolean`        | ❌       | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`) |

#### Adding Links to Existing Settings Sections

To add links to existing settings sections (like the "Global" section), use `addSettingsLink()` in the `bootstrap` lifecycle function:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Add a link to the global settings section
    app.addSettingsLink('global', {
      intlLabel: {
        id: 'my-plugin.settings.documentation',
        defaultMessage: 'Documentation',
      },
      id: 'documentation',
      to: 'my-plugin/documentation',
      Component: async () => {
        const { DocumentationPage } = await import(
          './pages/Settings/Documentation'
        );
        return DocumentationPage;
      },
      permissions: [],
      licenseOnly: false,
    });
  },
};
```

#### addSettingsLink Parameters

**Function Signature:**

```typescript
addSettingsLink(
  sectionId: string,
  linkConfig: LinkConfig
)
```

**First Argument - `sectionId` (string):**

The ID of the existing settings section to extend (e.g., `'global'` or `'permissions'`).

**Second Argument - `linkConfig` (object):**

A link configuration object with the following properties:

| Parameter     | Type             | Required | Description                                                                                      |
| ------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `id`          | `string`         | ✅       | Unique identifier for the settings link                                                          |
| `to`          | `string`         | ✅       | Path relative to the settings route (should not include `settings/` prefix)                      |
| `intlLabel`   | `object`         | ✅       | Localized label object with `id` and `defaultMessage`                                            |
| `Component`   | `async function` | ✅       | Async function that returns a dynamic import of the settings page component                      |
| `permissions` | `Array<object>`  | ❌       | Array of permission objects that control access to the link                                      |
| `licenseOnly` | `boolean`        | ❌       | If `true`, displays a ⚡ icon to indicate the feature requires a paid license (default: `false`) |

#### Available Settings Sections

Strapi provides several built-in settings sections that plugins can extend:

- **`global`**: General application settings
- **`permissions`**: Administration panel settings

:::note

- Creating a new settings section must be done in the `register` lifecycle function
- Adding links to existing settings sections must be done in the `bootstrap` lifecycle function
- The `to` path for settings links should be relative to the settings route (e.g., `'my-plugin/general'` not `'settings/my-plugin/general'`)
  :::

## Customizing Existing Admin Sections

Plugins can extend and customize existing admin panel sections, such as the Content Manager's List and Edit views, by injecting custom React components into predefined areas. This allows you to add functionality to Strapi's built-in interfaces without modifying core code.

### What are Injection Zones?

Injection zones are the mechanism that enables this customization. They are predefined areas in a plugin's UI where other plugins can inject custom React components.

:::note
Injection zones are defined in the `register` lifecycle function, but components are injected in the `bootstrap` lifecycle function.
:::

### Predefined Injection Zones

Strapi's Content Manager provides predefined injection zones that plugins can use to add components to the Content Manager interface:

| View      | Injection Zone         | Location                                            |
| --------- | ---------------------- | --------------------------------------------------- |
| List view | `listView.actions`     | Between the Filters and the cogs icon               |
| Edit view | `editView.right-links` | Between the "Configure the view" and "Edit" buttons |
| Preview   | `preview.actions`      | In the preview view action area                     |

#### Injecting into Content Manager Zones

To inject a component into a Content Manager injection zone, use `getPlugin('content-manager').injectComponent()` in the `bootstrap` lifecycle of your plugin:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { MyCustomButton } from './components/MyCustomButton';
import { PreviewAction } from './components/PreviewAction';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Inject a button into the Edit view's right-links zone
    app
      .getPlugin('content-manager')
      .injectComponent('editView', 'right-links', {
        name: 'my-plugin-custom-button',
        Component: MyCustomButton,
      });

    // Inject a component into the List view's actions zone
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: 'my-plugin-list-action',
      Component: () => <button>Custom List Action</button>,
    });

    // Inject a component into the Preview view's actions zone
    app.getPlugin('content-manager').injectComponent('preview', 'actions', {
      name: 'my-plugin-preview-action',
      Component: PreviewAction,
    });
  },
};
```

### Creating Custom Injection Zones

Plugins can define their own injection zones to allow other plugins to extend their UI. Injection zones are declared in the `registerPlugin` configuration:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'dashboard',
      name: 'Dashboard',
      injectionZones: {
        'dashboard.main': {
          top: [], // Components injected at the top
          middle: [], // Components injected in the middle
          bottom: [], // Components injected at the bottom
        },
        'dashboard.sidebar': {
          before: [], // Components injected before sidebar content
          after: [], // Components injected after sidebar content
        },
      },
    });
  },
};
```

#### Using Injection Zones in Components

To render injected components in your plugin's UI, use the `<InjectionZone />` component from `@strapi/helper-plugin`:

```typescript
// admin/src/pages/Dashboard.tsx
import { InjectionZone } from '@strapi/helper-plugin';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render components injected into the top zone */}
      <InjectionZone area="dashboard.main.top" />

      <div className="main-content">{/* Main dashboard content */}</div>

      {/* Render components injected into the bottom zone */}
      <InjectionZone area="dashboard.main.bottom" />
    </div>
  );
};

export default Dashboard;
```

#### Injecting into Custom Zones

Other plugins can inject components into your custom injection zones using the `injectComponent()` method in their `bootstrap` lifecycle:

```typescript
// Another plugin's admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { Widget } from './components/Widget';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'widget-plugin',
      name: 'Widget Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Get the dashboard plugin and inject a widget
    const dashboardPlugin = app.getPlugin('dashboard');

    if (dashboardPlugin) {
      dashboardPlugin.injectComponent('dashboard.main', 'top', {
        name: 'widget-plugin-statistics',
        Component: Widget,
      });
    }
  },
};
```

### Injection Component Parameters

The `injectComponent()` method accepts the following parameters:

| Parameter   | Type     | Description                                                                                                                                                                   |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `view`      | `string` | The view name where the component should be injected                                                                                                                          |
| `zone`      | `string` | The zone name within the view where the component should be injected                                                                                                          |
| `component` | `object` | Component configuration object with:<ul><li>`name` (string): Unique name for the component</li><li>`Component` (React.ComponentType): The React component to inject</li></ul> |

### Accessing Content Manager Data

When injecting components into Content Manager injection zones, you can access the Edit View data using the `useCMEditViewDataManager` hook:

```typescript
// admin/src/components/MyCustomButton.tsx
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

export const MyCustomButton = () => {
  const {
    slug, // Content type slug (e.g., 'api::article.article')
    modifiedData, // Current form data
    initialData, // Original data
    isCreatingEntry, // Whether creating a new entry
    layout, // Content type layout
    onPublish, // Function to publish the entry
    onChange, // Function to update field values
  } = useCMEditViewDataManager();

  const handleCustomAction = () => {
    // Access and modify the entry data
    onChange({ target: { name: 'customField', value: 'new value' } });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
};
```

### Best Practices

1. **Use descriptive zone names**: Choose clear, descriptive names for your injection zones (e.g., `top`, `bottom`, `before`, `after`)

2. **Check plugin availability**: Always verify that a plugin exists before injecting components into its zones:

   ```typescript
   bootstrap(app: StrapiApp) {
     const targetPlugin = app.getPlugin('target-plugin');
     if (targetPlugin) {
       targetPlugin.injectComponent('view', 'zone', {
         name: 'my-component',
         Component: MyComponent,
       });
     }
   }
   ```

3. **Use unique component names**: Ensure component names are unique to avoid conflicts with other plugins

4. **Handle missing zones gracefully**: Components should handle cases where injection zones might not be available

5. **Document your injection zones**: Clearly document which injection zones your plugin provides and their intended use

## Accessing the Redux Store

Strapi's admin panel uses a global Redux store to manage application state. Plugins can access this store to read state, dispatch actions, and subscribe to state changes. This enables plugins to interact with core admin functionality like theme settings, language preferences, and authentication state.

### Store Overview

The Redux store is automatically provided to all plugin components through React Redux's `Provider`. The store contains several slices:

- **`admin_app`**: Core admin state including theme, language, permissions, and authentication token
- **`adminApi`**: RTK Query API state for admin endpoints
- **Plugin-specific slices**: Additional reducers added by plugins

### Reading State with `useSelector`

The most common way to access Redux state in your plugin components is using the `useSelector` hook from `react-redux`:

```typescript
// admin/src/pages/HomePage.tsx
import { useSelector } from 'react-redux';

const HomePage = () => {
  // Read current theme
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );

  // Read current locale
  const currentLocale = useSelector(
    (state: any) => state.admin_app?.language?.locale
  );

  // Read authentication status
  const isAuthenticated = useSelector((state: any) => !!state.admin_app?.token);

  // Read available locales
  const availableLocales = useSelector(
    (state: any) => state.admin_app?.language?.localeNames || {}
  );

  return (
    <div>
      <p>Current Theme: {currentTheme}</p>
      <p>Current Locale: {currentLocale}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

#### Available State Properties

The `admin_app` slice contains the following state properties:

| Property                | Type             | Description                                        |
| ----------------------- | ---------------- | -------------------------------------------------- |
| `theme.currentTheme`    | `string`         | Current theme (`'light'`, `'dark'`, or `'system'`) |
| `theme.availableThemes` | `string[]`       | Array of available theme names                     |
| `language.locale`       | `string`         | Current locale code (e.g., `'en'`, `'fr'`)         |
| `language.localeNames`  | `object`         | Object mapping locale codes to display names       |
| `token`                 | `string \| null` | Authentication token                               |
| `permissions`           | `object`         | User permissions object                            |

### Dispatching Actions

To update the Redux store, use the `useDispatch` hook to dispatch actions:

```typescript
// admin/src/pages/HomePage.tsx
import { useDispatch } from 'react-redux';

const HomePage = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );

  const handleToggleTheme = () => {
    // Dispatch action using Redux Toolkit action type format
    const newTheme =
      currentTheme === 'light'
        ? 'dark'
        : currentTheme === 'dark'
        ? 'system'
        : 'light';
    dispatch({
      type: 'admin/setAppTheme',
      payload: newTheme,
    } as any);
  };

  const handleChangeLocale = (locale: string) => {
    dispatch({
      type: 'admin/setLocale',
      payload: locale,
    } as any);
  };

  return (
    <div>
      <button onClick={handleToggleTheme}>
        Toggle Theme (Current: {currentTheme})
      </button>
      <button onClick={() => handleChangeLocale('en')}>Set English</button>
    </div>
  );
};
```

#### Available Actions

The `admin_app` slice provides the following actions:

| Action Type         | Payload Type                           | Description                                        |
| ------------------- | -------------------------------------- | -------------------------------------------------- |
| `admin/setAppTheme` | `string`                               | Set the theme (`'light'`, `'dark'`, or `'system'`) |
| `admin/setLocale`   | `string`                               | Set the locale (e.g., `'en'`, `'fr'`)              |
| `admin/setToken`    | `string \| null`                       | Set the authentication token                       |
| `admin/login`       | `{ token: string, persist?: boolean }` | Login action with token and persistence option     |
| `admin/logout`      | `void`                                 | Logout action (no payload)                         |

:::note
When dispatching actions, use the Redux Toolkit action type format: `'sliceName/actionName'`. The admin slice is named `'admin'`, so actions follow the pattern `'admin/actionName'`.
:::

### Accessing the Store Instance

For advanced use cases, you can access the store instance directly using the `useStore` hook:

```typescript
// admin/src/pages/App.tsx
import { useStore } from 'react-redux';
import { useEffect } from 'react';

const App = () => {
  const store = useStore();

  useEffect(() => {
    // Get current state
    const state = store.getState();
    console.log('Redux Store State:', state);

    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      const currentState = store.getState();
      console.log('Store state changed:', {
        theme: currentState.admin_app?.theme?.currentTheme,
        locale: currentState.admin_app?.language?.locale,
        timestamp: new Date().toISOString(),
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [store]);

  return <div>My Plugin</div>;
};
```

### Complete Example

Here's a complete example demonstrating all three Redux store access patterns:

```typescript
// admin/src/pages/HomePage.tsx
import { Main } from '@strapi/design-system';
import { Button, Box, Typography, Flex } from '@strapi/design-system';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const dispatch = useDispatch();
  const store = useStore();

  // Example 1: Reading state from Redux store using useSelector
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );
  const currentLocale = useSelector(
    (state: any) => state.admin_app?.language?.locale
  );
  const isAuthenticated = useSelector((state: any) => !!state.admin_app?.token);
  const availableLocales = useSelector(
    (state: any) => state.admin_app?.language?.localeNames || {}
  );

  // Example 2: Dispatching actions to update the store
  const handleToggleTheme = () => {
    const newTheme =
      currentTheme === 'light'
        ? 'dark'
        : currentTheme === 'dark'
        ? 'system'
        : 'light';
    dispatch({
      type: 'admin/setAppTheme',
      payload: newTheme,
    } as any);
  };

  const handleChangeLocale = (locale: string) => {
    dispatch({
      type: 'admin/setLocale',
      payload: locale,
    } as any);
  };

  // Example 3: Subscribing to store changes
  const [storeChangeCount, setStoreChangeCount] = useState(0);
  const [lastChange, setLastChange] = useState<string>('');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      setStoreChangeCount((prev) => prev + 1);
      setLastChange(new Date().toLocaleTimeString());

      console.log('Store state changed:', {
        theme: state.admin_app?.theme?.currentTheme,
        locale: state.admin_app?.language?.locale,
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      unsubscribe();
    };
  }, [store]);

  return (
    <Main>
      <Box padding={8}>
        <Typography variant="alpha" as="h1">
          Redux Store Examples
        </Typography>

        <Flex direction="column" gap={4} paddingTop={6}>
          {/* Example 1: Reading State */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Example 1: Reading State
            </Typography>
            <Flex direction="column" gap={2}>
              <Typography variant="omega">
                Current Theme: <strong>{currentTheme || 'system'}</strong>
              </Typography>
              <Typography variant="omega">
                Current Locale: <strong>{currentLocale || 'en'}</strong>
              </Typography>
              <Typography variant="omega">
                Authentication Status:{' '}
                <strong>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </strong>
              </Typography>
            </Flex>
          </Box>

          {/* Example 2: Dispatching Actions */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Example 2: Dispatching Actions
            </Typography>
            <Flex direction="row" gap={2} wrap="wrap">
              <Button onClick={handleToggleTheme} variant="secondary">
                Toggle Theme
              </Button>
              {Object.keys(availableLocales).map((locale) => (
                <Button
                  key={locale}
                  onClick={() => handleChangeLocale(locale)}
                  variant={currentLocale === locale ? 'default' : 'tertiary'}
                >
                  Set {availableLocales[locale] || locale}
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Example 3: Subscribing to Store Changes */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Example 3: Subscribing to Store Changes
            </Typography>
            <Flex direction="column" gap={2}>
              <Typography variant="omega">
                Store has changed <strong>{storeChangeCount}</strong> time(s)
              </Typography>
              {lastChange && (
                <Typography variant="omega">
                  Last change at: <strong>{lastChange}</strong>
                </Typography>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
};

export { HomePage };
```

### Best Practices

1. **Use `useSelector` for reading state**: Prefer `useSelector` over direct store access for reading state, as it automatically subscribes to updates and re-renders components when the selected state changes.

2. **Clean up subscriptions**: Always unsubscribe from store subscriptions in `useEffect` cleanup functions to prevent memory leaks.

3. **Type safety**: For better TypeScript support, consider creating typed selectors or using the typed hooks from `@strapi/admin` if available.

4. **Avoid unnecessary dispatches**: Only dispatch actions when you need to update state. Reading state doesn't require dispatching actions.

5. **Respect core state**: Be careful when modifying core admin state (like theme or locale) as it affects the entire admin panel. Consider whether your plugin should modify global state or maintain its own local state.

:::tip
For plugins that need to add their own state to the Redux store, use the `addReducers` method in the `register` lifecycle function to inject custom reducers. See the [Admin Panel API documentation](/cms/plugins-development/admin-panel-api) for more details.
:::
