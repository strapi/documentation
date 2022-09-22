---
title: Custom fields reference - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

::: callout 🚧  Pre-release feature
Custom fields are a pre-release feature. To create a new Strapi application with custom fields, run `npx create-strapi-app@beta --quickstart name-of-the-project`.
:::

Custom fields extend Strapi’s capabilities by adding new types of fields to content-types and components. Once created or installed, custom fields can be used in the Content-Type Builder and Content Manager just like built-in fields.

The present documentation is intended for custom field creators: it describes which APIs and functions developers must use to create a new custom field. The [user guide](/user-docs/latest/plugins/introduction-to-plugins.md#custom-fields) describes how to install and use custom fields from Strapi's admin panel.

<!-- TODO: uncomment and adjust content when blog post is ready -->
<!-- ::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see our [Creating a color custom field guide](#) page for step-by-step instructions on how to build your first custom field from scratch.
::: -->

It is recommended that you develop a dedicated [plugin](/developer-docs/latest/development/plugins-development.md) for custom fields. Custom-field plugins include both a server and admin panel part. The custom field must be registered in both parts before it is usable in Strapi's admin panel.

Once created and used, custom fields are defined like any other attribute in the model's schema. An attribute using a custom field will have its type represented as `customField` (i.e. `type: 'customField'`). Depending on the custom field being used a few additional properties may be present in the attribute's definition (see [models documentation](/developer-docs/latest/development/backend-customization/models.md#custom-fields)).

::: note NOTES
* Though the recommended way to add a custom field is through creating a plugin, app-specific custom fields can also be registered within the global `register` [function](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md) found in `src/index.js` and `src/admin/app/js` files.
* Custom fields can only be shared using plugins.
:::

## Registering a custom field on the server

::: prerequisites
!!!include(developer-docs/latest/development/snippets/custom-field-requires-plugin.md)!!!
:::

Strapi's server needs to be aware of all the custom fields to ensure that an attribute using a custom field is valid.

The `strapi.customFields` object exposes a `register()` method on the `Strapi` instance. This method is used to register custom fields on the server during the plugin's server [register lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#register).

`strapi.customFields.register()` registers one or several custom field(s) on the server by passing an object (or an array of objects) with the following parameters:

| Parameter                      | Description                                       | Type     |
| ------------------------------ | ------------------------------------------------- | -------- |
| `name`                         | The name of the custom field                      | `String` |
| `plugin`<br/><br/>(_optional_) | The name of the plugin creating the custom fields | `String` |
| `type`                         | The data type the custom field will use           | `String` |

::: note
Currently, custom fields cannot add new data types to Strapi and must use existing, built-in Strapi data types described in the [models' attributes](/developer-docs/latest/development/backend-customization/models.md#model-attributes) documentation. Special data types unique to Strapi, such as relation, media, component, or dynamic zone data types, cannot be used in custom fields.
:::

::: details Example: Registering an example "color" custom field on the server:

```js
// path: ./src/plugins/color-picker/strapi-server.js

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'color-picker',
      type: 'text',
    });
  },
};
```

:::

## Registering a custom field in the admin panel

::: prerequisites
!!!include(developer-docs/latest/development/snippets/custom-field-requires-plugin.md)!!!
:::

Custom fields must be registered in Strapi's admin panel to be available in the Content-type Builder and the Content Manager.

The `app.customFields` object exposes a `register()` method on the `StrapiApp` instance. This method is used to register custom fields in the admin panel during the plugin's admin [register lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#register).

`app.customFields.register()` registers one or several custom field(s) in the admin panel by passing an object (or an array of objects) with the following parameters:

| Parameter                        | Description                                                              | Type                  |
| -------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `name`                           | Name of the custom field                                             | `String`              |
| `pluginId`<br/><br/>(_optional_) | Name of the plugin creating the custom field                        | `String`              |
| `type`                           | Existing Strapi data type the custom field will use<br/><br/>❗️ Relations, media, components, or dynamic zones cannot be used.                  | `String`              |
| `icon`<br/><br/>(_optional_)     | Icon for the custom field                                            | `React.ComponentType` |
| `intlLabel`                      | Translation for the name                                             | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `intlDescription`                | Translation for the description                                      | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `components`                     | Components needed to display the custom field in the Content Manager (see [components](#components))            |
| `options`<br/><br/>(_optional_)  | Options to be used by the Content-type Builder (see [options](#options)) | `Object` |

::: details Example: Registering an example "color" custom field in the admin panel:

```jsx
// path: ./src/plugins/color-picker/strapi-admin.js

register(app) {
  app.customFields.register({
    name: "color",
    pluginId: "color-picker", // the custom field is created by a color-picker plugin
    type: "string", // the color will be stored as a string
    intlLabel: {
      id: "color-picker.color.label",
      defaultMessage: "Color",
    },
    intlDescription: {
      id: "color-picker.color.description",
      defaultMessage: "Select any color",
    },
    icon: ColorIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
    },
    options: {
      base: [
        /*
          Declare settings to be added to the "Base settings" section
          of the field in the Content-Type Builder
        */ 
        {
          sectionTitle: { // Add a "Format" settings section
            id: 'color-picker.color.section.format',
            defaultMessage: 'Format',
          },
          items: [ // Add settings items to the section
            {
              /*
                Add a "Color format" dropdown
                to choose between 2 different format options
                for the color value: hexadecimal or RGBA
              */
              intlLabel: {
                id: 'color-picker.color.format.label',
                defaultMessage: 'Color format',
              },
              name: 'options.format',
              type: 'select',
              value: 'hex', // option selected by default
              options: [ // List all available "Color format" options
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
      advanced: [
        /*
          Declare settings to be added to the "Advanced settings" section
          of the field in the Content-Type Builder
        */ 
      ],
      validator: args => ({
        format: yup.string().required({
          id: 'options.color-picker.format.error',
          defaultMessage: 'The color format is required',
        }),
      })
      }),
    },
  });
}
```

:::

### Components

`app.customFields.register()` must pass a `components` object with an `Input` React component to use in the Content Manager's edit view.

::: details Example: Registering an Input component

```js
// path: ./src/plugins/my-custom-field-plugin/strapi-admin.js

register(app) {
  app.customFields.register({
    // …
    components: {
      Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
    } 
    // …
  });
}
```

:::

::: tip
The `Input` React component receives several props. The [`ColorPickerInput` file](https://github.com/strapi/strapi/blob/features/custom-fields/examples/getstarted/src/plugins/mycustomfields/admin/src/components/ColorPicker/ColorPickerInput/index.js#L10-L21) in the Strapi codebase gives you an example of how they can be used.
:::


### Options

`app.customFields.register()` can pass an additional `options` object with the following parameters:

| Options parameter | Description                                                                     | Type                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `base`         | Settings available in the _Base settings_ tab of the field in the Content-type Builder       | `Object` or  `Array of Objects` |
| `advanced`     | Settings available in the _Advanced settings_ tab of the field in the Content-type Builder   | `Object` or  `Array of Objects` |
| `validator`    | Validator function returning an object, used to sanitize input. Uses a [`yup` schema object](https://github.com/jquense/yup/tree/pre-v1).  | `Function`              |

Both `base` and `advanced` settings accept an object or an array of objects, each object being a settings section. Each settings section could include:

- a `sectionTitle` to declare the title of the section as an [`IntlObject`](https://formatjs.io/docs/react-intl/)
- and a list of `items` as an array of objects.

Each object in the `items` array can contain the following parameters:

| Items parameter | Description                                                        | Type                                                 |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `name`          | Label of the input.<br/>Must use the `options.settingName` format. | `String`                                             |
| `description`   | Description of the input to use in the Content-type Builder        | `String`                                             |
| `intlLabel`     | Translation for the label of the input                             | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `type`          | Type of the input (e.g., `select`, `checkbox`)                     | `String`                                             |



::: details Example: Declaring options for an example "color" custom field:

```jsx
// path: ./src/plugins/my-custom-field-plugin/strapi-admin.js

register(app) {
  app.customFields.register({
    // …
    options: {
      base: [
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
              key: '__null_reset_value__',
              value: '',
              metadatas: {
                intlLabel: {
                  id: 'color-picker.color.format.placeholder',
                  defaultMessage: 'Select a format',
                },
                hidden: true,
              },
            },
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
      advanced: [
        {
          sectionTitle: {
            id: 'global.settings',
            defaultMessage: 'Settings',
          },
          items: [
            {
              name: 'required',
              type: 'checkbox',
              intlLabel: {
                id: 'form.attribute.item.requiredField',
                defaultMessage: 'Required field',
              },
              description: {
                id: 'form.attribute.item.requiredField.description',
                defaultMessage: "You won't be able to create an entry if this field is empty",
              },
            },
            {
              name: 'private',
              type: 'checkbox',
              intlLabel: {
                id: 'form.attribute.item.privateField',
                defaultMessage: 'Private field',
              },
              description: {
                id: 'form.attribute.item.privateField.description',
                defaultMessage: 'This field will not show up in the API response',
              },
            },
          ],
        },
      ],
      validator: args => ({
        format: yup.string().required({
          id: 'options.color-picker.format.error',
          defaultMessage: 'The color format is required',
        }),
      }),
    },
  });
}
```

:::

<!-- TODO: replace these tip and links by proper documentation of all the possible shapes and parameters for `options` -->
::: tip
The Strapi codebase gives an example of how settings objects can be described: check the [`baseForm.js`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/baseForm.js) file for the `base` settings and the [`advancedForm.js`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/advancedForm.js) file for the `advanced` settings. The base form lists the settings items inline but the advanced form gets the items from an [`attributeOptions.js`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/attributeOptions.js) file.
:::
