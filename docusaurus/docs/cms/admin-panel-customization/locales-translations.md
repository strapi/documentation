---
title: Locales & translations
description: Learn how to update locales and extend translations in the Strapi admin panel.
displayed_sidebar: cmsSidebar
sidebar_label: Locales & translations
toc_max_heading_level: 4
tags:
- admin panel
- admin panel customization
---

# Locales & translations

<Tldr>
Configure the admin panel languages by updating the `config.locales` array and override default or plugin strings with `config.translations` or custom translation files.
</Tldr>

The Strapi [admin panel](/cms/admin-panel-customization) ships with English strings and supports adding other locales so your editorial team can work in their preferred language. Locales determine which languages appear in the interface, while translations provide the text displayed for each key in a locale.

This guide targets project maintainers customizing the admin experience from the application codebase. All examples modify the configuration exported from `/src/admin/app`file, which Strapi loads when the admin panel builds. You'll learn how to declare additional locales and how to extend Strapi or plugin translations when a locale is missing strings.

## Defining locales

To update the list of available locales in the admin panel, set the `config.locales` array in `src/admin/app.[jt]s`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/src/admin/app.js"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="/src/admin/app.ts"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

:::note Notes

- The `en` locale cannot be removed from the build as it is both the fallback (i.e. if a translation is not found in a locale, the `en` will be used) and the default locale (i.e. used when a user opens the administration panel for the first time).
- The full list of available locales is accessible on <ExternalLink to="https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json" text="Strapi's Github repo"/>.

:::

## Extending translations

Translation key/value pairs are declared in `@strapi/admin/admin/src/translations/[language-name].json` files.

These keys can be extended through the `config.translations` key in `src/admin/app.[jt]s`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/admin/app.js"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/admin/app.ts"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

A plugin's key/value pairs are declared independently in the plugin's files at `/admin/src/translations/[language-name].json`. These key/value pairs can similarly be extended in the `config.translations` key by prefixing the key with the plugin's name (i.e. `[plugin name].[key]: 'value'`) as in the following example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/admin/app.js"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        // Translate a plugin's key/value pair by adding the plugin's name as a prefix
        // In this case, we translate the "plugin.name" key of plugin "content-type-builder"
        "content-type-builder.plugin.name": "Constructeur de Type-Contenu",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/admin/app.ts"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        // Translate a plugin's key/value pair by adding the plugin's name as a prefix
        // In this case, we translate the "plugin.name" key of plugin "content-type-builder"
        "content-type-builder.plugin.name": "Constructeur de Type-Contenu",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

If you need to ship additional translation JSON files—for example to organize large overrides or to support a locale not bundled with Strapi—place them in the `/src/admin/extensions/translations` folder and ensure the locale code is listed in `config.locales`.
