---
title: Code migration - WYSIWYG customization - Strapi Developer Docs
description: Migrate WYSIWYG customization from Strapi v3.6.8 to v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.html
---

<!-- TODO: update SEO -->

# v4 code migration: Updating the WYSIWYG customization

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, in order to change the WYSIWYG in your application you had to override the original component by using the file extensions.

In Strapi v4, file customisation is no longer supported so in order to change the default wysiwyg you have to use the new Field API.

:::

To update the WYSIWYG customizations to Strapi v4:

1. Create an extension folder in ./src/admin/extensions
2. Create a file called MyWysiwyg.js in ./src/admin/extensions and add your logic
3. Rename the ./src/admin/app.example.js to ./src/admin/app.js
4. Inject your new Wysiwyg using the field API

::: details Example of a custom WYSIWYG using the Field API in Strapi v4

```js
// path:src/admin/app.js

import MyNewWYSIGWYG from './extensions/components/MyNewWYSIGWYG'

export default {
  bootstrap(app) {
    app.addFields({ type: 'wysiwyg', Component: MyNewWYSIGWYG });
  },
};


// path: ./src/plugins/<my-plugin>/admin/...

import { useLibrary } from '@strapi/helper-plugin';


const MyCompo = (props) => {
  console.log(props);
  const { components, fields } = useLibrary();

  console.log(components); // media-library component available dy default
  console.log(fields); // media input component available by default

  return null;
}

:::
