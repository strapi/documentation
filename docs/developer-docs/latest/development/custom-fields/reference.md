---
title: Custom fields reference - Strapi Developer Docs
description: Learn how you can use custom fields to extend Strapi's content-types capabilities.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/custom-fields.html
---

# Custom fields

<!-- TODO: add links to user guide section(s) somewhere -->
Custom fields are [plugins](/developer-docs/latest/development/plugins-development.md) that extend Strapi’s capabilities by adding new fields to content-types. Once created or installed, custom fields can be used in the Content-Types Builder and Content Manager just like built-in fields.

The present reference documentation is intended to custom fields creators. It describes how custom fields work and can be created from a developer point of view, describing the APIs available to build a new custom field. The [user guide](#) describes how to install and use custom fields from Strapi's admin panel.

::: strapi Prefer to learn by building?
If you'd rather directly jump to a concrete example, see the [Creating a color custom field guide](/developer-docs/latest/development/custom-fields/color-custom-fields-guide.md) page for step-by-step instructions on how to build your first custom field from scratch.
:::

Custom fields are a specific type of Strapi plugins that include both a back-end (or server) part and a front-end (or admin panel) part. Both parts should be registered for the custom fields to be available and usable in Strapi's admin panel:

- `strapi.customFields.register` registers the [server](#registering-a-custom-field-on-the-server) part of a custom field in `strapi-server.js`
- `app.customFields.register` registers the [admin panel](#registering-a-custom-field-in-the-admin-panel) part of a custom field in `strapi-admin.js`

Once registered, custom fields can be used in [models's `schema.json`](/developer-docs/latest/development/backend-customization/models.md#model-schema). Custom fields' attributes should declare their `type` as `customField` and use the `customField` property to mention the registered custom field to use (see [model's custom fields documentation](/developer-docs/latest/development/backend-customization/models.md#custom-fields)).
<!-- TODO: make sure this # exists in the backend custom. > models docs — will come in another PR -->

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

::: details TypeScript shapes to register a custom field on the server:

The following Strapi API is exposed to help you register a custom field on the server:

```ts
interface CustomFieldServerOptions {
  // The name of the custom field
  name: string;
  // The name of the plugin creating the custom field
  plugin?: string;
  // The existing Strapi data type the custom field will use
  type: string;
}

strapi.customFields.register(
  options: CustomFieldServerOptions | CustomFieldServerOptions[]
);
```

:::

<!-- TODO: check this example with developers or create another one. The goal was to have an example different from the advanced color picker described in the guide. -->
::: details Example: Registering an example "checkbox" custom field on the server:

```js
// path: ./src/plugins/my-custom-field-plugin/strapi-server.js

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'checkbox',
      plugin: 'my-custom-field-plugin',
      type: 'boolean',
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
| `components`                     | The components needed to display the custom field in the Content Manager (see [components](#components))            |
| `options`<br/><br/>(_optional_) | The settings to extend in the Content-Type Builder (see [options](#options)) | `Object` |

::: note
Relations, components or dynamic zones can't be used as a custom field's `type` parameter.
:::

::: details TypeScript shapes to register a custom field in the admin panel:

The following Strapi APIs are exposed to help you register a custom field on the server:

```ts
// You can also pass an array of objects to register several custom fields at once
app.customFields.register(
  options: CustomFieldAdminOptions | CustomFieldAdminOptions[]
);

interface CustomFieldAdminOptions {
  // The name of the custom field
  name: string;
  // The name of the plugin creating the custom field
  pluginId?: string;
  // The existing Strapi data type the custom field will use
  type: string;
  // The translation for the name
  intlLabel: IntlObject;
  // The translation for the description
  intlDescription: IntlObject;
  // The icon for the custom field
  icon?: React.ComponentType;
  // The components needed to display the custom field in the Content Manager
  components: {
    // Input component for the Edit view
    Input: () => Promise<{ default: React.ReactComponent }>;
    // Read only component for the List view
    View: () => Promise<{ default: React.ReactComponent }>;
  };
  // The settings to extend in the Content-Type Builder
  options?: {
    base: CTBFormSection[];
    advanced: CTBFormSection[];
    validator: (args) => object;
  }
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
}
```

:::

<!-- TODO: check this example with developers or create another one. The goal was to have the most simple example, different from the advanced color picker described in the guide. -->
::: details Example: Registering an example "checkbox" custom field in the admin panel:

```jsx
// strapi-admin.js
register(app) {
  app.customFields.register({
    name: "checkbox",
    pluginId: "checkbox",
    type: "boolean",
    intlLabel: {
      id: "checkbox.label",
      defaultMessage: "Checked",
    },
    intlDescription: {
      id: "checkbox.description",
      defaultMessage: "Click to toggle the checkbox",
    } 
    icon: CheckboxIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
      View: async () => import(/* webpackChunkName: "view-component" */ "./View"),
    },
  });
}
```

:::

### Components

The `components` parameter used in `app.customFields.register()` should include 2 components:

- an `Input` component to define the React component to use in the Content Manager's edit view,
- and a `View` component View to define a read-only component used in the Content Manager's list view.

Both components could be declared as promises returning a React component imported from another file (e.g. `Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"`).
<!-- ? can we declare components inline as well? like Input: async () => <MyReactComponent>…<MyReactComponent/>? What would be the most simple React.component example we could describe for a custom field? -->

### Options

`app.customFields.register()` can pass additional options to be used for the base and advanced settings tabs of the Content-Type Builder. The `options` object accepts the following parameters:

| Parameter name | Description                                                                     | Type                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `base`         | Settings available in the _Base settings_ tab of the Content-Type Builder       | `Object` or  `Object[]` |
| `advanced`     | Settings available in the _Advanced settings_ tab of the Content-Type Builder   | `Object` or  `Object[]` |
| `validator`    | Validator function returning an object (useful to sanitize input, for instance) | `Function`              |

:::note
When extending a custom field’s base and advanced forms in the Content-type Builder, it is not yet possible to import custom input components.
:::

:::details TypeScript shapes to declare options:

The following types and shapes are used to describe the `options` when registering a custom field in the admin panel:

```ts
options?: {
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
}
```

:::

<!-- TODO: add a super simple example with one base setting, one advanced setting, and a simple validator -->
::: details Example of options passed when registering a custom field in the admin panel:
(TODO)
:::

