---
title: Admin localization
description: Provide translations for your Strapi plugin's admin panel interface using registerTrads and react-intl.
pagination_prev: cms/plugins-development/admin-fetch-client
pagination_next: cms/plugins-development/server-api
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - admin panel customization
  - admin panel API
  - internationalization
  - plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'

# Admin Panel API: Localization

<Tldr>

Register translation files with `registerTrads`, prefix keys with your plugin ID to avoid conflicts, and use `react-intl`'s `useIntl` hook in components. Strapi merges plugin translations with core translations automatically.

</Tldr>

Plugins can provide translations for multiple languages to make the admin interface accessible to users worldwide. Strapi automatically loads and merges plugin translations with core translations, making them available throughout the admin panel.

<Prerequisite />

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

```json title="admin/src/translations/en.json"
{
  "plugin.name": "My Plugin",
  "plugin.description": "A custom Strapi plugin",
  "settings.title": "Settings",
  "settings.general": "General",
  "settings.advanced": "Advanced"
}
```

## The `registerTrads` function {#registertrads}

In Strapi plugins that have an admin part, `registerTrads()` is used to load translations for your plugin's UI labels and messages. If you don't need localization, you can omit it and the plugin can still run.

The `registerTrads()` function is an async function that loads translation files for all configured locales. Strapi calls this function during admin panel initialization to collect translations from all plugins.

### Basic implementation

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="admin/src/index.js"
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

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';
import { PLUGIN_ID } from './pluginId';
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'My Plugin',
    });
  },
  async registerTrads({ locales }: { locales: string[] }) {
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

</TabItem>
</Tabs>

### Function parameters

The `registerTrads` function receives an object with the following property:

| Parameter | Type | Description |
|---|---|---|
| `locales` | `string[]` | Array of locale codes configured in the admin panel (e.g., `['en', 'fr', 'de']`) |

### Return value

The function must return a `Promise` that resolves to an array of translation objects. Each object has the following structure:

```ts
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

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="admin/src/utils/prefixPluginTranslations.js"
const prefixPluginTranslations = (trad, pluginId) => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {});
};

export { prefixPluginTranslations };
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/utils/prefixPluginTranslations.ts"
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

</TabItem>
</Tabs>

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

### Missing translation files

The `registerTrads` function should gracefully handle missing translation files by returning an empty object for that locale. The `.catch()` handler in the example above ensures that if a translation file does not exist, the plugin still returns a valid translation object:

```js
.catch(() => {
  return {
    data: {},
    locale,
  };
});
```

This allows plugins to provide translations for only some locales (e.g., only English) without breaking the admin panel for other locales.

## Translations in components

To use translations in your React components, use the `useIntl` hook from `react-intl`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/pages/HomePage.jsx"
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

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="admin/src/pages/HomePage.tsx"
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

</TabItem>
</Tabs>

### Helper function for translation keys

To avoid repeating the plugin ID prefix, create a helper function:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="admin/src/utils/getTranslation.js"
import { PLUGIN_ID } from '../pluginId';

export const getTranslation = (id) => `${PLUGIN_ID}.${id}`;
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/utils/getTranslation.ts"
import { PLUGIN_ID } from '../pluginId';

export const getTranslation = (id: string) => `${PLUGIN_ID}.${id}`;
```

</TabItem>
</Tabs>

Then use it in components:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/pages/HomePage.jsx"
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

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="admin/src/pages/HomePage.tsx"
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

</TabItem>
</Tabs>

## Translations in configuration

Translation keys are also used when configuring menu links, settings sections, and other admin panel elements:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="admin/src/index.js"
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

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
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

</TabItem>
</Tabs>

## Plugin translation lifecycle

Strapi's admin panel automatically:

1. Calls `registerTrads` for all registered plugins during initialization
2. Merges translations from all plugins with core Strapi translations
3. Applies custom translations from the admin configuration (if any)
4. Makes translations available via `react-intl` throughout the admin panel

In practice, core admin translations are loaded first, plugin translations are merged on top, and project-level overrides in `config.translations` let you customize the labels displayed in the admin panel.

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
To see which locales are available in your Strapi instance, check the `config.locales` array in your `src/admin/app.ts` or `src/admin/app.js` file. For programmatic access at runtime, see [Accessing the Redux store](/cms/plugins-development/admin-redux-store) (note that internal store structure may change between versions).
:::