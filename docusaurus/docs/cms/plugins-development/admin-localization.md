---
title: Admin localization
description: Provide translations for your Strapi plugin's admin panel interface using registerTrads and react-intl.
pagination_prev: cms/plugins-development/admin-configuration-customization
pagination_next: cms/plugins-development/admin-injection-zones
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - localization
  - translations
  - registerTrads
  - react-intl
  - plugins development
---

# Admin localization

<Tldr>

Register translation files with `registerTrads`, prefix keys with your plugin ID to avoid conflicts, and use `react-intl`'s `useIntl` hook in components. Strapi merges plugin translations with core translations automatically.

</Tldr>

Plugins can provide translations for multiple languages to make the admin interface accessible to users worldwide. Strapi automatically loads and merges plugin translations with core translations, making them available throughout the admin panel.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and are familiar with the [admin entry file lifecycle](/cms/plugins-development/admin-configuration-customization#overview).
:::

## Translation file structure

Translation files are stored in the `admin/src/translations/` directory, with 1 JSON file per locale:

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

## The `registerTrads` function

The `registerTrads` function is a required lifecycle function that loads translation files for all configured locales. Strapi calls this function during admin panel initialization to collect translations from all plugins.

### Basic implementation

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
      }),
    );

    return importedTranslations;
  },
};
```

### Function parameters

The `registerTrads` function receives an object with the following property:

| Parameter | Type | Description |
|---|---|---|
| `locales` | `string[]` | Array of locale codes configured in the admin panel (e.g., `['en', 'fr', 'de']`) |

### Return value

The function must return a `Promise` that resolves to an array of translation objects:

```typescript
{
  data: Record<string, string>; // Translation key-value pairs
  locale: string; // Locale code (e.g., 'en', 'fr')
}
```

### Translation key prefixing

:::caution
Translation keys must be prefixed with your plugin ID to avoid conflicts with other plugins and core Strapi translations. For example, if your plugin ID is `my-plugin`, a key like `plugin.name` should become `my-plugin.plugin.name`.
:::

Use the `prefixPluginTranslations` utility function to automatically prefix all keys:

```typescript
// admin/src/utils/prefixPluginTranslations.ts
type TradOptions = Record<string, string>;

const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string,
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

For instance, if your translation file contains:

```json
{
  "plugin.name": "My Plugin",
  "settings.title": "Settings"
}
```

After prefixing with plugin ID `my-plugin`, these become:

- `my-plugin.plugin.name`
- `my-plugin.settings.title`

### Handling missing translation files

The `registerTrads` function should gracefully handle missing translation files by returning an empty object for that locale. The `.catch()` handler in the example above ensures that if a translation file does not exist, the plugin still returns a valid translation object:

```typescript
.catch(() => {
  return {
    data: {},
    locale,
  };
});
```

This allows plugins to provide translations for only some locales (e.g., only English) without breaking the admin panel for other locales.

## Using translations in components

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

### Helper function for translation keys

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

## Using translations in configuration

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

See [Customizing menu and settings](/cms/plugins-development/admin-configuration-customization#customizing-menu-and-settings) for more configuration examples.

## How Strapi integrates plugin translations

Strapi's admin panel automatically:

1. Calls `registerTrads` for all registered plugins during initialization
2. Merges translations from all plugins with core Strapi translations
3. Applies custom translations from the admin configuration (if any)
4. Makes translations available via `react-intl` throughout the admin panel

The merge order ensures that core Strapi translations are loaded first, plugin translations are merged on top, and custom translations from admin config override both (allowing users to customize translations).

## Best practices

- **Always prefix translation keys.** Use `prefixPluginTranslations` or manually prefix keys with your plugin ID to avoid conflicts.
- **Provide default messages.** Always include `defaultMessage` when using `formatMessage` as a fallback if translations are missing.
- **Handle missing translations gracefully.** The `registerTrads` function should return empty objects for missing locales rather than throwing errors.
- **Use descriptive key names.** Choose clear, hierarchical key names (e.g., `settings.general.title` rather than `title1`).
- **Support at least English.** Providing English translations ensures your plugin works out of the box.
- **Verify behavior with multiple locales.** Test that your plugin works correctly when different locales are selected in the admin panel.

:::note
The `en` locale is always available in Strapi and serves as the fallback locale. If a translation is missing for a selected locale, Strapi uses the English translation.
:::

:::tip
To see which locales are available in your Strapi instance, check the `config.locales` array in your `src/admin/app.ts` or `src/admin/app.js` file. You can also access available locales from the Redux store using `useSelector((state) => state.admin_app?.language?.localeNames)` (see [Accessing the Redux store](/cms/plugins-development/admin-redux-store)).
:::
