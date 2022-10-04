---
title: Code migration - WYSIWYG customizations - Strapi Developer Docs
description: Migrate WYSIWYG customizations from Strapi v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.html
---

# v4 code migration: Updating WYSIWYG customizations

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, the WYSIWYG is customized by overriding the original component and replacing the file.

In Strapi v4, file replacement is no longer supported. To customize the default WYSIWYG, the new `addFields()` method should be used with the [extensions system](/developer-docs/latest/development/admin-customization.md#extension).

:::

To migrate WYSIWYG customizations to Strapi v4:

1. Create the `./src/admin/extensions` folder.

2. In `./src/admin/extensions`, create a new `components` subfolder.

3. In `./src/admin/extensions/components`, create a new component file (e.g. `MyNewWysiwyg.js`) and add your logic here. This file will be used to replace the default WYSIWYG editor.

4. Rename the `./src/admin/app.example.js` file from Strapi v3 to `./src/admin/app.js`.

5. Update `./src/admin/app.js` with the following modifications:

    * Import the new WYSIWYG component created at step 3.
    * Inject the new WYSIWYG component by using the `addFields()` method inside the `bootstrap` lifecycle of the application. `addFields()` accepts an object with 2 properties: set `type` to `'wysiwyg'` and `Component` to the name of the imported WYSIWYG component.

    ```js
    // path: ./src/admin/app.js

    import MyNewWysiwyg from './extensions/components/MyNewWysiwyg'

    export default {
      bootstrap(app) {
        app.addFields({ type: 'wysiwyg', Component: MyNewWysiwyg });
      },
    };
    ```

:::tip Customization tip
The WYSIWYG can also be replaced by creating a plugin that adds new fields (see [step-by-step guide using CKEditor](/developer-docs/latest/guides/registering-a-field-in-admin.md)).
:::
