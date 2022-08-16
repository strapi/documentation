---
title: Custom fields reference - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

<!-- TODO: add links to user guide section(s) somewhere -->
Custom fields extend Strapi’s capabilities by adding new types of fields to content-types. Once created or installed, custom fields can be used in the Content-Types Builder and Content Manager just like built-in fields.

The present documentation is intended for custom field creators: it describes which APIs and functions developers must use to create a new custom field. The [user guide](#) describes how to install and use custom fields from Strapi's admin panel.

<!-- TODO: uncomment and adjust content when blog post is ready -->
<!-- ::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see our [Creating a color custom field guide](#) page for step-by-step instructions on how to build your first custom field from scratch.
::: -->

It is recommended that you develop a dedicated [plugin](/developer-docs/latest/development/plugins-development.md) for custom fields. Custom-field plugins include both a server and admin panel part. The custom field must be registered in both parts before it is usable in Strapi's admin panel.

Once created and used, custom fields are defined like any other attribute in the model's `schema.json`. An attribute using a custom field will have its type represented as `customField` (i.e. `type: 'customField'`). Depending on the custom field being used a few additional properties may be present in the attribute's definition (see [models documentation](/developer-docs/latest/development/backend-customization/models.md#custom-fields)).
<!-- The section linked above will be part of another PR, but basically it's about mentioning that in schema files, custom fields are defined with `type: 'custom-field'` and a possible additional `customField` key for the uid (`global::…` or `plugin::…`), plus possibly additional keys (e.g. `options` for a `select` setting, etc.) -->

::: note
Though the recommended way to add a custom field is through creating a plugin, app-specific custom fields can also be registered within the global `bootstrap` and `register` [functions](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md) found in `./src/index.js`.
:::

<!-- TODO: make sure this # exists in the backend custom. > models docs — will come in another PR -->

<!-- ? should we document these? 👇 this was described in the [technical RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#motivation) but I'm unsure about what to do with it -->

::: callout 🚧 Current custom fields limitations

* Custom fields can not be used to register new database types in the Strapi backend.
* Custom fields can not use the relation, media, component, or dynamic zone data types.
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
| `plugin`<br/><br/>(_optional_) | The name of the plugin creating the custom fields<br/><br/>!!!include(developer-docs/latest/development/snippets/custom-field-plugin-optional.md)!!!          | `String` |
| `type`                         | The data type the custom field will use           | `String` |

::: note
Currently custom fields can not add new data types to Strapi and should use existing, built-in Strapi data types (e.g. string, number, JSON — see [models documentation](/developer-docs/latest/development/backend-customization/models.md#model-attributes) for the full list).
:::

::: details Example: Registering an example "color" custom field on the server:

```js
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'color-picker',
      type: 'string',
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

The `app.customFields` object exposes a `register()` method on the `StrapiApp` instance. This method is used to register custom fields in the admin panel during the plugin's admin [bootstrap lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap).

`app.customFields.register()` registers one or several custom field(s) in the admin panel by passing an object (or an array of objects) with the following parameters:

| Parameter                        | Description                                                              | Type                  |
| -------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `name`                           | Name of the custom field                                             | `String`              |
| `pluginId`<br/><br/>(_optional_) | Name of the plugin creating the custom field<br/><br/>!!!include(developer-docs/latest/development/snippets/custom-field-plugin-optional.md)!!!                          | `String`              |
| `type`                           | Existing Strapi data type the custom field will use                  | `String`              |
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
    type: "text", // the color will be stored as text
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
      validator: (args) => ({
        'color-picker': yup.object().shape({
          format: yup.string().oneOf(['hex', 'rgba']),
        }),
      }),
    },
  });
}
```

:::

::: note
Relations, components or dynamic zones can't be used as a custom field's `type` parameter.
:::

### Components

`app.customFields.register()` must pass a `components` object with 1 or 2 of the following components:

| Component | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `Input`   | React component to use in the Content Manager's edit view           |
| `View`    | Read-only React component to use in the Content Manager's list view |

::: details Example: Registering Input and View components imported from dedicated files:

<!-- ? can we declare components inline as well? like Input: async () => <MyReactComponent>…<MyReactComponent/>? What would be the most simple React.component example we could describe for a custom field? -->
```js
// path: ./src/plugins/my-custom-field-plugin/strapi-admin.js

register(app) {
  app.customFields.register({
    // …
    components: {
      Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
      View: async () => import(/* webpackChunkName: "view-component" */ "./View"),
    } 
    // …
  });
}
```

:::

### Options

`app.customFields.register()` can pass an additional `options` object with the following parameters:

| Options parameter | Description                                                                     | Type                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `base`         | Settings available in the _Base settings_ tab of the field in the Content-type Builder       | `Object` or  `Array of Objects` |
| `advanced`     | Settings available in the _Advanced settings_ tab of the field in the Content-type Builder   | `Object` or  `Array of Objects` |
| `validator`    | Validator function returning an object, used to sanitize input | `Function`              |

Both `base` and `advanced` settings accept an object or an array of objects, each object being a settings section. Each settings section must include:

- a `sectionTitle` to declare the title of the section as an [`IntlObject`](https://formatjs.io/docs/react-intl/)
- and a list of `items` as an array of objects.

Each object in the `items` array can contain the following parameters:

<!-- TODO: fix the table content as the parameters given in the [example from the RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#example) and the [TS interface](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#admin) described in the RFC are inconsistent 🤷  -->

| Items parameter | Description                                                                                  | Type     |
| --------------- | -------------------------------------------------------------------------------------------- | -------- |
| `name`          | Name of the setting item<br/>Must use the `options.setting-name` format.                     | `String` |
| `description`   | Description of the setting item to use in the Content-type Builder                           | `String` |
| `intlLabel`     | Translation for the abel of the setting item                                                 | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `type`          | Type of setting (see [Setting types and specific options](#))                                 | `String` |

<!-- TODO: add a super simple example with one base setting, one advanced setting, and a simple validator -->
::: details Example: Declaring options for an example "color" custom field:

```jsx
// path: ./src/plugins/my-custom-field-plugin/strapi-admin.js

register(app) {
  app.customFields.register({
    // …
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

:::

:::note
When extending a custom field’s base and advanced forms in the Content-type Builder, it is not currently possible to import custom input components.
:::

<!-- TODO: decide whether we want to document all of these specific-settings 👇  -->
<!-- 
### Setting types and specific options

When registering a custom field in the admin panel, each setting item defined in the `items` keys of the `base` and `advanced` properties can have a different `type`, and each type comes with additional, specific keys.

#### `select` additional keys

Any setting item in the `base` or `advanced` declared as a `select` type can declare the following additional keys:

| Parameter | Description                                            | Type               | Available sub-keys                                                             |
| --------- | ------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------ |
| `options` | Options available in the dropdown                      | `Array of objects` | `key` (string): key name (will be used as an identifier in the model's schema) |
^^          | ^^                                                     | ^^                 | `value` (string): value to display in the CTB                                  |
^^          | ^^                                                     | ^^                 | `metadatas` (object): Used to declare the translation for the option, as an [IntlObject]() (i.e. with `id` and `defaultMessage` keys) |
| `value`   | Default option to display in the Content-type Builder  | `String`           | -                                                                              | -->

<!-- // TODO: add other possible additional keys for specific `type`s -->
