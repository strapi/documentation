---
title: Code migration - Translations - Strapi Developer Docs
description: Migrate translations from Strapi v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.html
---

# v4 code migration: Updating translations

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, file replacement is supported to customize the front end of a Strapi application. To modify the translations of an application, original core files can be directly replaced with custom files.

In Strapi v4, file replacement is no longer supported. To extend translations, [dedicated extension APIs](/developer-docs/latest/development/admin-customization.md#configuration-options) should be used.
:::

To update translations to Strapi v4:

1. Rename the `./src/admin/app.example.js` to `./src/admin/app.js`.
2. In the `config.locales` array, add the locales the application should support.
3. In the `config.translations.<your-translation>` object, add the missing keys.

<!-- ? when can we use a simple key name (without quotes) and when should we use quotes? (see code example below) where's is the list of all the available keys? -->

::: details Example: Adding translations to Strapi v4

```js
// path: ./src/admin/app.js

export default {
  config: {
    // Add another locale
    locales: ['fr'],
    translations: {
      // Add missing keys in the FR locale
      fr: {
        'Auth.form.email.label': 'test',
        Users: 'Utilisateurs',
        City: 'CITY (FRENCH)',
        // Customize the label of the Content-Manager table.
        Id: 'ID french',
      },
    },
  },
  bootstrap() {},
};

```
