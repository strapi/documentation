---
title: Custom fields example - Strapi Developer Docs
description: Learn how to build a custom field for Strapi using the color picker example
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

<!-- TODO: find a better title, and make it consistent with TOC entry -->
# Creating a color picker custom field

This guide describes step-by-step instructions on how to create a color picker custom field that can be used in Strapi's admin panel. For a more complete description of the APIs, please refer to the [custom fields reference documentation](/developer-docs/latest/development/custom-fields/reference.md).

To add a "color" type to the list of existing fields available in the [Content-Type Builder](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#configuring-fields-for-content-types), you can create a “color” custom field. This would require:

1. creating a "color-picker" plugin,
2. registering a new "color" custom field on the back-end of Strapi using `strapi-server.js`,
3. and registering this new "color" custom field on the front-end part of Strapi using `strapi-admin.js`, passing a few components and options to be used in the admin panel.

<!-- TODO: add sub-sections? -->

## Creating a "color-picker" plugin

Custom fields are plugins. Before registering our color picker custom field, use the [Create a plugin](/developer-docs/latest/development/plugins-development.md#create-a-plugin) section from the plugins development documentation to create and enable a plugin named "color-picker".

Once the plugin is created and enabled, you should see a `color-picker` folder at `./src/plugins` and it should include at least a `strapi-admin.js` and a `strapi-server.js` file.

## Registering the custom field on the server

To register the color picker custom field on the Strapi server, replace the content of the `strapi-server.js` file of the `color-picker` plugin (created as a prerequisite to this guide) with the following code example:

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

## Registering the custom field in the admin panel

To register the "color" custom field in the admin panel of Strapi, we will replace the content of the `strapi-admin.js` file of the `color-picker` plugin (created as a prerequisite to this guide).

The example code provides the components, the name of the field and its underlying data type. For more control, the code also adds an option to let the developer select the color format in the base options of the custom field plugins.

To create components to be used by the custom field in the Content Manager, and registering the custom field in the admin panel:

1. Create a `./src/plugins/color-picker/admin/src/Input.js` file and copy and paste the following code example in this file:

    ```jsx
    // TODO: ask devs for the Input component code
    ```

2. Create a `./src/plugins/color-picker/admin/src/View.js` file and copy and paste the following code example in this file:

    ```jsx
    // TODO: ask devs for the View component code
    ```

3. Register the custom field, its components and options in Strapi's admin panel by replacing the content of `./src/plugins/color-picker/strapi-admin.js` with the following code:

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

::: tip
To make the custom field available to the community, it can be turned into an npm package (see [turning a plugin as a npm package](/developer-docs/latest/development/plugins-development.md#converting-a-plugin-as-a-npm-package)).
<!-- TODO: add this # to the plugins development instructions -->
:::
