---
title: Custom fields
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
displayed_sidebar: devDocsSidebar
canonicalUrl: https://docs.strapi.io/dev-docs/development/custom-fields.html
tags:
- admin panel
- Components
- Content-type Builder 
- Content Manager 
- custom fields
- register function
---

import CustomFieldRequiresPlugin from '/docs/snippets/custom-field-requires-plugin.md'

# Custom fields

Custom fields extend Strapi’s capabilities by adding new types of fields to content-types and components. Once created or added to Strapi via plugins, custom fields can be used in the Content-Type Builder and Content Manager just like built-in fields.

The present documentation is intended for custom field creators: it describes which APIs and functions developers must use to create a new custom field. The [User Guide](/user-docs/plugins/introduction-to-plugins.md#custom-fields) describes how to add and use custom fields from Strapi's admin panel.

It is recommended that you develop a dedicated [plugin](/dev-docs/plugins/developing-plugins) for custom fields. Custom field plugins include both a server and admin panel part. The custom field must be registered in both parts before it is usable in Strapi's admin panel.

Once created and used, custom fields are defined like any other attribute in the model's schema. An attribute using a custom field will have its type represented as `customField` (i.e. `type: 'customField'`). Depending on the custom field being used a few additional properties may be present in the attribute's definition (see [models documentation](/dev-docs/backend-customization/models#custom-fields)).

:::note NOTES

- Though the recommended way to add a custom field is through creating a plugin, app-specific custom fields can also be registered within the global `register` [function](/dev-docs/configurations/functions) found in `src/index.js` and `src/admin/app/js` files.
- Custom fields can only be shared using plugins.
:::

## Registering a custom field on the server

:::prerequisites
<CustomFieldRequiresPlugin components={props.components} />
:::

Strapi's server needs to be aware of all the custom fields to ensure that an attribute using a custom field is valid.

The `strapi.customFields` object exposes a `register()` method on the `Strapi` instance. This method is used to register custom fields on the server during the plugin's server [register lifecycle](/dev-docs/plugins/server-api#register).

`strapi.customFields.register()` registers one or several custom field(s) on the server by passing an object (or an array of objects) with the following parameters:

| Parameter                         | Description                                                                                                                                             | Type     |
| --------------------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------| -------- |
| `name`                            | The name of the custom field                                                                                                                            | `String` |
| `plugin`<br/><br/>(_optional_)    | The name of the plugin creating the custom fields<br/><br/>❗️ If defined, the `pluginId` value on the admin panel registration must have the same value (see [Registering a custom field in the admin panel](#registering-a-custom-field-in-the-admin-panel)) | `String` |
| `type`                            | The data type the custom field will use                                                                                                                 | `String` |
| `inputSize`<br/><br/>(_optional_) | Parameters to define the width of a custom field's input in the admin panel                                                                             | `Object` |

The optional `inputSize` object, when specified, must contain all of the following parameters:

| Parameter     | Description                                                                                                                                               | Type      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `default`     | The default size in columns that the input field will occupy in the 12-column grid in the admin panel.<br/>The value can either be `4`, `6`, `8` or `12`. | `Integer` |
| `isResizable` | Whether the input can be resized or not                                                                                                                   | `Boolean` |

:::note Current limitations
Currently:
* Custom fields cannot add new data types to Strapi and must use existing, built-in Strapi data types described in the [models' attributes](/dev-docs/backend-customization/models#model-attributes) documentation. 
* You also cannot modify an existing data type.
* Special data types unique to Strapi, such as relation, media, component, or dynamic zone data types, cannot be used in custom fields.
:::

<details>
<summary>Example: Registering an example "color" custom field on the server:</summary>

In the following example, the `color-picker` plugin was created using the CLI generator (see [plugins development](/dev-docs/plugins/developing-plugins)):

```js title="./src/plugins/color-picker/server/register.js"
"use strict";

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: "color",
    plugin: "color-picker",
    type: "string",
    inputSize: {
      // optional
      default: 4,
      isResizable: true,
    },
  });
};
```

The custom field could also be declared directly within the `strapi-server.js` file if you didn't have the plugin code scaffolded by the CLI generator:

```js title="./src/plugins/color-picker/strapi-server.js"
module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: "color",
      plugin: "color-picker",
      type: "text",
      inputSize: {
        // optional
        default: 4,
        isResizable: true,
      },
    });
  },
};
```

</details>

## Registering a custom field in the admin panel

:::prerequisites
<CustomFieldRequiresPlugin components={props.components} />
:::

Custom fields must be registered in Strapi's admin panel to be available in the Content-type Builder and the Content Manager.

The `app.customFields` object exposes a `register()` method on the `StrapiApp` instance. This method is used to register custom fields in the admin panel during the plugin's admin [register lifecycle](/dev-docs/plugins/admin-panel-api#register).

`app.customFields.register()` registers one or several custom field(s) in the admin panel by passing an object (or an array of objects) with the following parameters:

| Parameter                        | Description                                                                                                                                  | Type                                                 |
| -------------------------------- |----------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------------------------- |
| `name`                           | Name of the custom field                                                                                                                     | `String`                                             |
| `pluginId`<br/><br/>(_optional_) | Name of the plugin creating the custom field<br/><br/>❗️ If defined, the `plugin` value on the server registration must have the same value (see [Registering a custom field on the server](#registering-a-custom-field-on-the-server))  | `String`                                             |
| `type`                           | Existing Strapi data type the custom field will use<br/><br/>❗️ Relations, media, components, or dynamic zones cannot be used.               | `String`                                             |
| `icon`<br/><br/>(_optional_)     | Icon for the custom field                                                                                                                    | `React.ComponentType`                                |
| `intlLabel`                      | Translation for the name                                                                                                                     | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `intlDescription`                | Translation for the description                                                                                                              | [`IntlObject`](https://formatjs.io/docs/react-intl/) |
| `components`                     | Components needed to display the custom field in the Content Manager (see [components](#components))                                         |
| `options`<br/><br/>(_optional_)  | Options to be used by the Content-type Builder (see [options](#options))                                                                     | `Object`                                             |

<details>
<summary>Example: Registering an example "color" custom field in the admin panel:</summary>

In the following example, the `color-picker` plugin was created using the CLI generator (see [plugins development](/dev-docs/plugins/developing-plugins.md)):

```jsx title="./src/plugins/color-picker/admin/src/index.js"
import ColorPickerIcon from "./components/ColorPicker/ColorPickerIcon";

export default {
  register(app) {
    // ... app.addMenuLink() goes here
    // ... app.registerPlugin() goes here

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
      icon: ColorPickerIcon, // don't forget to create/import your icon component
      components: {
        Input: async () =>
          import(
            /* webpackChunkName: "input-component" */ "./components/Input"
          ),
      },
      options: {
        // declare options here
      },
    });
  },

  // ... bootstrap() goes here
};
```

</details>

### Components

`app.customFields.register()` must pass a `components` object with an `Input` React component to use in the Content Manager's edit view.

<details>
<summary>Example: Registering an Input component</summary>

In the following example, the `color-picker` plugin was created using the CLI generator (see [plugins development](/dev-docs/plugins/developing-plugins.md)):

```jsx title="./src/plugins/color-picker/admin/src/index.js"
export default {
  register(app) {
    app.customFields.register({
      // …
      components: {
        Input: async () =>
          import(/* webpackChunkName: "input-component" */ "./Input"),
      },
      // …
    });
  },
};
```

</details>

Custom field input components receive the following props:

| Prop             | Description                                                                                                                                                                                                                               | Type                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `attribute`      | The attribute object with custom field's underlying Strapi type and options                                                                                                                                                               | `{ type: String, customField: String }`                              |
| `description`    | The field description set in [configure the view](/user-docs/content-manager/configuring-view-of-content-type#configuring-the-edit-view)                                                                                                  | [`IntlObject`](https://formatjs.io/docs/react-intl/)                 |
| `placeholder`    | The field placeholder set in [configure the view](/user-docs/content-manager/configuring-view-of-content-type#configuring-the-edit-view)                                                                                                  | [`IntlObject`](https://formatjs.io/docs/react-intl/)                 |
| `hint`           | The field description set in [configure the view](/user-docs/content-manager/configuring-view-of-content-type#configuring-the-edit-view) along with min/max [validation requirements](/dev-docs/backend-customization/models#validations) | `String`                                                             |
| `name`           | The field name set in the content-type builder                                                                                                                                                                                            | `String`                                                             |
| `intlLabel`      | The field name set in the content-type builder or configure the view                                                                                                                                                                      | [`IntlObject`](https://formatjs.io/docs/react-intl/)                 |
| `onChange`       | The handler for the input change event. The `name` argument references the field name. The `type` argument references the underlying Strapi type                                                                                          | `({ target: { name: String value: unknown type: String } }) => void` |
| `contentTypeUID` | The content-type the field belongs to                                                                                                                                                                                                     | `String`                                                             |
| `type`           | The custom field uid, for example `plugin::color-picker.color`                                                                                                                                                                            | `String`                                                             |
| `value`          | The input value the underlying Strapi type expects                                                                                                                                                                                        | `unknown`                                                            |
| `required`       | Whether or not the field is required                                                                                                                                                                                                      | `boolean`                                                            |
| `error`          | Error received after validation                                                                                                                                                                                                           | [`IntlObject`](https://formatjs.io/docs/react-intl/)                 |
| `disabled`       | Whether or not the input is disabled                                                                                                                                                                                                      | `boolean`                                                            |

As of Strapi v4.13.0, fields in the Content Manager can be auto-focussed via the `URLSearchParam` `field`. It's recommended that your input component is wrapped in React's [`forwardRef`](https://react.dev/reference/react/forwardRef) method; you should pass the corresponding `ref` to the `input` element.

<details>
<summary>Example: A custom text input</summary>

In the following example we're providing a custom text input that is controlled. All inputs should be controlled otherwise their data will not be submitted on save.

```jsx title="./src/plugins/<plugin-name>/admin/src/components/Input.js"
import * as React from "react";

import { useIntl } from "react-intl";

const Input = React.forwardRef((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } =
    props; // these are just some of the props passed by the content-manager

  const { formatMessage } = useIntl();

  const handleChange = (e) => {
    onChange({
      target: { name, type: attribute.type, value: e.currentTarget.value },
    });
  };

  return (
    <label>
      {formatMessage(intlLabel)}
      <input
        ref={ref}
        name={name}
        disabled={disabled}
        value={value}
        required={required}
        onChange={handleChange}
      />
    </label>
  );
});

export default Input;
```

</details>

:::tip
For a more detailed view of the props provided to the customFields and how they can be used check out the [`ColorPickerInput` file](https://github.com/strapi/strapi/blob/main/packages/plugins/color-picker/admin/src/components/ColorPickerInput.tsx#L80-L95) in the Strapi codebase.
:::

### Options

`app.customFields.register()` can pass an additional `options` object with the following parameters:

| Options parameter | Description                                                                                                                               | Type                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `base`            | Settings available in the _Base settings_ tab of the field in the Content-type Builder                                                    | `Object` or `Array of Objects` |
| `advanced`        | Settings available in the _Advanced settings_ tab of the field in the Content-type Builder                                                | `Object` or `Array of Objects` |
| `validator`       | Validator function returning an object, used to sanitize input. Uses a [`yup` schema object](https://github.com/jquense/yup/tree/pre-v1). | `Function`                     |

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

<details>
<summary>Example: Declaring options for an example "color" custom field:</summary>

In the following example, the `color-picker` plugin was created using the CLI generator (see [plugins development](/dev-docs/plugins/developing-plugins.md)):

```jsx title="./src/plugins/color-picker/admin/src/index.js"
// imports go here (ColorPickerIcon, pluginId, yup package…)

export default {
  register(app) {
    // ... app.addMenuLink() goes here
    // ... app.registerPlugin() goes here
    app.customFields.register({
      // …
      options: {
        base: [
          /*
            Declare settings to be added to the "Base settings" section
            of the field in the Content-Type Builder
          */
          {
            sectionTitle: {
              // Add a "Format" settings section
              id: "color-picker.color.section.format",
              defaultMessage: "Format",
            },
            items: [
              // Add settings items to the section
              {
                /*
                  Add a "Color format" dropdown
                  to choose between 2 different format options
                  for the color value: hexadecimal or RGBA
                */
                intlLabel: {
                  id: "color-picker.color.format.label",
                  defaultMessage: "Color format",
                },
                name: "options.format",
                type: "select",
                value: "hex", // option selected by default
                options: [
                  // List all available "Color format" options
                  {
                    key: "hex",
                    defaultValue: "hex",
                    value: "hex",
                    metadatas: {
                      intlLabel: {
                        id: "color-picker.color.format.hex",
                        defaultMessage: "Hexadecimal",
                      },
                    },
                  },
                  {
                    key: "rgba",
                    value: "rgba",
                    metadatas: {
                      intlLabel: {
                        id: "color-picker.color.format.rgba",
                        defaultMessage: "RGBA",
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
          format: yup.string().required({
            id: "options.color-picker.format.error",
            defaultMessage: "The color format is required",
          }),
        }),
      },
    });
  },
};
```

</details>

<!-- TODO: replace these tip and links by proper documentation of all the possible shapes and parameters for `options` -->

:::tip
The Strapi codebase gives an example of how settings objects can be described: check the [`baseForm.ts`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/baseForm.ts) file for the `base` settings and the [`advancedForm.ts`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/advancedForm.ts) file for the `advanced` settings. The base form lists the settings items inline but the advanced form gets the items from an [`attributeOptions.js`](https://github.com/strapi/strapi/blob/main/packages/core/content-type-builder/admin/src/components/FormModal/attributes/attributeOptions.js) file.
:::
