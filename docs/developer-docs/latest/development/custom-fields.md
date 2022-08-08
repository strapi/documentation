---
title: Custom fields reference - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

<!-- TODO: add links to user guide section(s) somewhere -->
Custom fields extend Strapi’s capabilities by adding new types of fields to content-types. Once created or installed, custom fields can be used in the Content-Types Builder and Content Manager just like built-in fields.

The present documentation is intended to custom fields creators: it describes how custom fields work and can be created from a developer point of view, using dedicated APIs. The [user guide](#) describes how to install and use custom fields from Strapi's admin panel.

<!-- TODO: uncomment and adjust content when blog post is ready -->
<!-- ::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see our [Creating a color custom field guide](#) page for step-by-step instructions on how to build your first custom field from scratch.
::: -->

Custom fields are a specific type of Strapi [plugins](/developer-docs/latest/development/plugins-development.md) that include both a back-end (or server) part and a front-end (or admin panel) part. Both parts should be registered separately before a custom field is usable in Strapi's admin panel:

- `strapi.customFields.register` registers the [server](#registering-a-custom-field-on-the-server) part of a custom field in `strapi-server.js`
- `app.customFields.register` registers the [admin panel](#registering-a-custom-field-in-the-admin-panel) part of a custom field in `strapi-admin.js`

::: note
Once registered, custom fields can be used in [models's `schema.json`](/developer-docs/latest/development/backend-customization/models.md#model-schema). Custom fields' attributes should declare their `type` as `customField` and use the `customField` property to mention the registered custom field to use (see [model's custom fields documentation](/developer-docs/latest/development/backend-customization/models.md#custom-fields)).
<!-- TODO: make sure this # exists in the backend custom. > models docs — will come in another PR -->
:::

<!-- ? should we document this? 👇 this was described in the [technical RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#motivation) but I'm unsure about what to do with it -->
<!-- ::: note
Custom fields can not be used to register new database types in the Strapi backend.
::: -->

## Registering a custom field on the server

Strapi's server needs to be aware of all the custom fields to ensure that an attribute using a custom field is valid.

The `strapi.customFields` object exposes a `register()` method on the `Strapi` instance to register custom fields on the server during the plugin's server [register lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#register).

`strapi.customFields.register()` registers one or several custom field(s) on the server by passing an object (or an array of objects) with the following parameters:

| Parameter                      | Description                                       | Type     |
| ------------------------------ | ------------------------------------------------- | -------- |
| `name`                         | The name of the custom field                      | `String` |
| `plugin`<br/><br/>(_optional_) | The name of the plugin creating the custom fields<br/><br/>If omitted, the custom field is registered within the `global` namespace.          | `String` |
| `type`                         | The data type the custom field will use           | `String` |

::: caution
Currently custom fields can not add new data types to Strapi and should use existing, built-in Strapi data types (e.g. string, number, JSON — see [models documentation](/developer-docs/latest/development/backend-customization/models.md#model-attributes) for the full list).
:::

<!-- TODO: check this example with developers or create another one. The goal was to have an example different from the advanced color picker described in the guide. -->
::: details Example: Registering an example "color" custom field on the server:

```js
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'color-picker', // the custom 
      type: 'text',
    });
  },
};
```

:::

## Registering a custom field in the admin panel

Custom fields must be registered in Strapi's admin panel to be available in the Content-Type Builder and the Content Manager.

The `app.customFields` object exposes a `register()` method on the `StrapiApp` instance to register custom fields in the admin panel during the plugin's admin [bootstrap lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap).

`app.customFields.register()` registers one or several custom field(s) in the admin panel by passing an object (or an array of objects) with the following parameters:

| Parameter                        | Description                                                              | Type                  |
| -------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `name`                           | The name of the custom field                                             | `String`              |
| `pluginId`<br/><br/>(_optional_) | The name of the plugin creating the custom field<br/><br/>If omitted, the custom field is registered within the `global` namespace.                          | `String`              |
| `type`                           | The existing Strapi data type the custom field will use                  | `String`              |
| `icon`<br/><br/>(_optional_)     | The icon for the custom field                                            | `React.ComponentType` |
| `intlLabel`                      | The translation for the name                                             | `IntlObject`          |
| `intlDescription`                | The translation for the description                                      | `IntlObject`          |
| `components`                     | The components needed to display the custom field in the Content Manager (see [components](#components))            |
| `options`<br/><br/>(_optional_) | The settings to extend in the Content-Type Builder (see [options](#options)) | `Object` |

::: note
Relations, components or dynamic zones can't be used as a custom field's `type` parameter.
:::

<!-- TODO: check this example with developers or create another one. The goal was to have the most simple example, different from the advanced color picker described in the guide. -->
::: details Example: Registering an example "color" custom field in the admin panel:

```jsx
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

register(app) {
  app.customFields.register({
    name: "color",
    pluginId: "color-picker", // the custom field is created by a color-picker plugin
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
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

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

`app.customFields.register()` can pass additional options to be used for the base and advanced settings tabs of the Content-Type Builder. The `options` object accepts the following parameters:

| Options parameter | Description                                                                     | Type                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `base`         | Settings available in the _Base settings_ tab of the Content-Type Builder       | `Object` or  `Object[]` |
| `advanced`     | Settings available in the _Advanced settings_ tab of the Content-Type Builder   | `Object` or  `Object[]` |
| `validator`    | Validator function returning an object (useful to sanitize input, for instance) | `Function`              |

Both `base` and `advanced` settings accept:

- a `sectionTitle` (as an React `IntlObject`)
- and a list of `items` as an array of objects, each object containing the following parameters:

<!-- TODO: fix the table content as the parameters given in the [example from the RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#example) and the [TS interface](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#admin) described in the RFC are inconsistent 🤷  -->

| Items parameter | Description                                                                                  | Type     |
| --------------- | -------------------------------------------------------------------------------------------- | -------- |
| `intlLabel`     | Label for the setting item, in the [React Intl](https://formatjs.io/docs/react-intl/) format | `Object` |
| `name`          | Name of the setting to be used, in the following format: `options.<setting-name>`            | `String` |
| `type`          | ?                                                                                            | `String` |
| `value`         | ?                                                                                            | `String` |
| `metadatas`     | ?                                                                                            | `Object` |

:::note
When extending a custom field’s base and advanced forms in the Content-type Builder, it is not currently possible to import custom input components.
:::

<!-- TODO: add a super simple example with one base setting, one advanced setting, and a simple validator -->
::: details Example: Declaring settings for an example "color" custom field:

```jsx
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

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
