---
title: Custom fields reference - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

<!-- TODO: add links to user guide section(s) somewhere -->
Custom fields are [plugins](/developer-docs/latest/development/plugins-development.md) that extend Strapi’s capabilities by adding new fields to content-types. Once created or installed, custom fields can be used in the Content-Types Builder and Content Manager just like [built-in fields](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#regular-fields).

The present reference documentation is intended to custom fields creators. It describes how custom fields work and can be created from a developer point of view, describing the APIs available to build a new custom field. The [user guide](#) describes how to install and use custom fields from Strapi's admin panel.

::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see the [Creating a color custom field guide](/developer-docs/latest/development/custom-fields/color-custom-fields-guide.md) page for step-by-step instructions on how to build your first custom field from scratch.
:::

Custom fields are a specific type of Strapi plugins that include both a back-end (or server) part and a front-end (or admin panel) part. Both parts should be registered for the custom fields to be available and usable in the Content-Types Builder and Content-Manager:

- `strapi.customFields.register` registers the [server](#registering-a-custom-field-on-the-server) part of a custom field in `strapi-server.js`
- `app.customFields.register` registers the [admin panel](#registering-a-custom-field-in-the-admin-panel) part of a custom field in `strapi-admin.js`

<!-- ? should we document this? 👇 this was described in the [technical RFC](https://github.com/strapi/rfcs/blob/3eb034e169746558315d719ca5fb49cec854640a/rfcs/xxxx-custom-fields-api.md#motivation) but I'm unsure about what to do with it -->
<!-- ::: note
Custom fields can not be used to register new database types in the Strapi backend.
::: -->

## Registering a custom field on the server

On the server part, Strapi needs to be aware of all custom fields to ensure that an attribute using a custom field is valid. To achieve this, the `strapi.customFields` object exposes a `register()` method on the `Strapi` instance.

`strapi.customFields.register()` registers a custom field on the server during the plugin's server [register lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#register) and should pass an object with the following parameters:

<!-- ? is `plugin` really optional? -->
| Parameter                      | Description                                       | Type     |
| ------------------------------ | ------------------------------------------------- | -------- |
| `name`                         | The name of the custom field                      | `String` |
| `plugin`<br/><br/>(_optional_) | The name of the plugin creating the custom fields | `String` |
| `type`                         | The existing, built-in Strapi data type the custom field will use<br/>(e.g. string, number, JSON — see [models documentation](/developer-docs/latest/development/backend-customization/models.md#model-attributes) for the full list).  | `String` |

::: details Example: Registering an example "color" custom field on the server:

```js
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'color',
      plugin: 'my-custom-field-plugin',
      type: 'text',
    });
  },
};
```

:::

## Registering a custom field in the admin panel

On the admin panel part, the custom field should be described to be available in the Content-Type Builder and the Content Manager. To achieve this, the `app.customFields` exposes a `register` method on the `StrapiApp` instance.

`app.customFields.register()` registers a custom field in the admin panel during the plugin's admin [bootstrap lifecycle](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap) and should pass an object (or an array of objects) with the following parameters:

| Parameter                        | Description                                                              | Type                  |
| -------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `name`                           | The name of the custom field                                             | `String`              |
| `pluginId`<br/><br/>(_optional_) | The name of the plugin creating the custom field                         | `String`              |
| `type`                           | The existing Strapi data type the custom field will use                  | `String`              |
| `intlLabel`                      | The translation for the name                                             | `IntlObject`          |
| `intlDescription`                | The translation for the description                                      | `IntlObject`          |
| `icon`<br/><br/>(_optional_)     | The icon for the custom field                                            | `React.ComponentType` |
| `components`                     | The components needed to display the custom field in the Content Manager.<br/><br/>Should include: <ul><li>`Input: () => Promise<{ default: React.ReactComponent }>;` to define the React component to be used in the Content Manager's edit view</li><li>`View: () => Promise<{ default: React.ReactComponent }>;` to define a read-only component for the List view</li></ul>| `Object`              |
| `options`<br/><br/>(_optional_) | The settings to extend in the Content-Type Builder | `Object` |

<!-- TODO: describe settings parameters (see base, advanced, and validator) -->

  <!-- options?: {
    base: CTBFormSection[];
    advanced: CTBFormSection[];
    validator: (args) => object;
  }

interface IntlObject {
  id: string;
  defaultMessage: string;
}

interface CTBFormSection {
  sectionTitle: IntlObject;
  items: CTBFormInput[];
}

interface CTBFormInput {
  name: string;
  description: InltObject;
  type: string;
  intlLabel: IntlObject;
} -->

<!-- TODO: add an example here, or decide to remove the example from the server section, since we already have examples in the guide -->

<!-- TODO: mention impacts on schema.json at some point? -->
