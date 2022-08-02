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

On the server part, Strapi needs to be aware of all custom fields to ensure that an attribute using a custom field is valid.

The `strapi.customFields.register()` function registers a custom field on the server. `strapi.customFields. This ensures that Strapi is aware of register` accepts an `options` parameter. `options`can be defined through a `CustomFieldServerOptions` interface that uses the following parameters:

<!-- ? is `plugin` really optional? -->
| Parameter                 | Description                                       | Type     |
| ------------------------- | ------------------------------------------------- | -------- |
| `name`                    | The name of the custom field                      | `String` |
| `plugin`<br/>(_optional_) | The name of the plugin creating the custom fields | `String` |
| `type`                    | The existing data type the custom field will use  |          |

The `CustomFieldServerOptions` interface can then be passed as an òptions` paramater to `strapi.customFields.register`.

::: note NOTES
Currently, custom fields can only use existing, built-in field types (e.g. string, number, JSON — see [models documentation](/developer-docs/latest/development/backend-customization/models.md#model-attributes) for the full list).
:::

## Registering a custom field in the admin panel

