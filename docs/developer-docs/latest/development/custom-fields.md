---
title: Custom fields - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

Custom fields are a way to extend Strapi’s capabilities by adding new types of fields to content-types. Custom fields are essentially [plugins](/developer-docs/latest/development/plugins-development.md) and should be registered in both the Strapi admin panel and the server to be accessible from the Content-Type Builder and the Content Manager.

<!-- TODO: add links to user guide section(s) somewhere -->
The present documentation acts as a reference documentation for how custom fields work and can be created from a developer point of view, while the [User Guide](#) gives a quick overview on how to use custom fields from Strapi's admin panel.

::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see the "Creating a color custom field guide" page for step-by-step instructions on how to build your first custom field from scratch.
:::

<!-- ? should we document this? this was described in the [technical RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#motivation) but I'm unsure about what to do with it -->
<!-- ::: caution
Currently, custom fields can not be used to register new database types in the Strapi backend.
::: -->

::: details Example of adding a "color" custom field type to Strapi:

To add a "color" type to the list of existing fields available in the [Content-Type Builder](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#configuring-fields-for-content-types), you can create a “color” custom field. This would require:

1. creating a "color-picker" plugin (see [plugin creation documentation](/developer-docs/latest/development/plugins-development.md#create-a-plugin)),
2. registering a new custom field on the server using `strapi-server.js`,
3. and registering a new custom field on the front-end part of Strapi using `strapi-admin.js`.

To register the custom field in the back end of Strapi, you can use the following example:

```js
// path: ./src/plugins/color-picker/strapi-server.js

module.exports = {
  register({ strapi }) {
  // Registering the custom field in the back-end of Strapi
    strapi.customFields.register({
      name: 'color',
      plugin: 'color-picker',
      type: 'text',
    });
  },
};
```

Then, to register the "color" custom field on the front-end (i.e. admin panel) part of Strapi, you could use the following code example. The codes provides the components, the name of the field and its underlying data type. For more control, the code also adds an option to let the developer select the color format in the base options of the custom field plugin:

```jsx
// path: ./src/plugins/color-picker/strapi-admin.js

register(app) {
  // Registering the custom field in the back-end of Strapi
  app.customFields.register({
    name: "color",
    pluginId: "color-picker",
    type: "text", // store the color as a text 
    intlLabel: {
      id: "color-picker.color.label",
      defaultMessage: "Color",
    },
    intlDescription: {
      id: "color-picker.color.description",
      defaultMessage: "Select any color",
    } 
    icon: ColorIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
      View: async () => import(/* webpackChunkName: "view-component" */ "./View"),
    } 
    options: {
      base: [
        {
          sectionTitle: {
            id: 'color-picker.color.section.format',
            defaultMessage: 'Format',
          },
          items: [
            {
              intlLabel: {
                id: 'color-picker.color.format.label',
                defaultMessage: 'Color format',
              },
              name: 'options.format',
              type: 'select',
              value: 'hex',
              options: [
                {
                  key: 'hex',
                  value: 'hex',
                  metadatas: {
                    intlLabel: {
                      id: 'color-picker.color.format.hex',
                      defaultMessage: 'Hexadecimal',
                    },
                  },
                },
                {
                  key: 'rgba',
                  value: 'rgba',
                  metadatas: {
                    intlLabel: {
                      id: 'color-picker.color.format.rgba',
                      defaultMessage: 'RGBA',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      advanced: [],
      validator: (args) => ({
        'color-picker': yup.object().shape({
          format: yup.string().oneOf(['hex', 'rgba']),
        }),
      }),
    },
  });
}
```

When someone adds an attribute to a content type using our “color” custom field, the `schema.json` looks like the following:

<!-- TODO: add the proper path to this example -->
```json
// path:  

{
  "attributes": {
    "attributeName": {
      "type": "customField",
      "customField": "plugin::color-picker.color",
      "options": {
        "format": "hex"
      }
    }
  }
}
```

:::
