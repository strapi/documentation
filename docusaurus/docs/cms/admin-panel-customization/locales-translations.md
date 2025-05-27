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
## Locales

To update the list of available locales in the admin panel, use the `config.locales` array:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./my-app/src/admin/app.js"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="./my-app/src/admin/app.ts"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

:::note NOTES

- The `en` locale cannot be removed from the build as it is both the fallback (i.e. if a translation is not found in a locale, the `en` will be used) and the default locale (i.e. used when a user opens the administration panel for the first time).
- The full list of available locales is accessible on <ExternalLink to="https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json" text="Strapi's Github repo"/>.

:::

### Extending translations

Translation key/value pairs are declared in `@strapi/admin/admin/src/translations/[language-name].json` files. These keys can be extended through the `config.translations` key:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/app.js"
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

```js title="./my-app/src/admin/app.ts"
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

A plugin's key/value pairs are declared independently in the plugin's files at `./admin/src/translations/[language-name].json`. These key/value pairs can similarly be extended in the `config.translations` key by prefixing the key with the plugin's name (i.e. `[plugin name].[key]: 'value'`) as in the following example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/app.js"
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

```js title="./my-app/src/admin/app.ts"
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

If more translations files should be added, place them in `./src/admin/extensions/translations` folder.

