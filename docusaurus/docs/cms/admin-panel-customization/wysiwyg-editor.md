---
title: Customizing the WYSIWYG editor
description: Learn more about the various strategies available to customize the WYSIWYG editor in Strapi's admin panel.
displayed_sidebar: cmsSidebar
sidebar_label: Rich text editor
tags:
- admin panel 
- admin panel customization
- WYSIWYG editor
---

# Change the default WYSIWYG editor

Strapi's [admin panel](/cms/admin-panel-customization) comes with a built-in rich text editor. To change the default editor, several options are at your disposal:

- You can install a third-party plugin, such as one for CKEditor, by visiting <ExternalLink to="https://market.strapi.io/" text="Strapi's Marketplace"/>.
- You can create your own plugin to create and register a fully custom WYSIWYG field (see [custom fields documentation](/cms/features/custom-fields)).
- You can take advantage of Strapi's admin panel [extensions](/cms/admin-panel-customization/extension) system and leverage the [bootstrap lifecycle function](/cms/plugins-development/admin-panel-api#bootstrap) of the admin panel.

If you choose to use the extensions system, create your WYSIWYG component in the `/src/admin/extensions` folder and import it in the admin panel's `/src/admin/app.[tsx|js]` entry point file, then declare the new field with the `app.addFields()` function as follows:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/admin/app.js"
// The following file contains the logic for your new WYSIWYG editor👇
import MyNewWYSIGWYG from "./extensions/components/MyNewWYSIGWYG";

export default {
  bootstrap(app) {
    app.addFields({ type: "wysiwyg", Component: MyNewWYSIGWYG });
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/admin/app.tsx"
// The following file contains the logic for your new WYSIWYG editor👇
import MyNewWYSIGWYG from "./extensions/components/MyNewWYSIGWYG";

export default {
  bootstrap(app) {
    app.addFields({ type: "wysiwyg", Component: MyNewWYSIGWYG });
  },
};
```

</TabItem>
</Tabs>
