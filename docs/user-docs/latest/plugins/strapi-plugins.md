---
title: List of Strapi plugins - Strapi User Guide
description: Reference guide to Strapi plugins explaining how they work and how they expand a Strapi application
---

# List of Strapi plugins

::: warning 🚧 This section of the user guide is a work in progress. Stay tuned!
<br>
:::

No matter if they are installed by default, or additional, Strapi plugins allow to expand your application by adding more options and possibilities. All options are documented in their right places throughout the user guide. However, you can use the following documentation as a reference guide to know which Strapi plugins are available, how they work and which options they add to your Strapi application.

## Default plugins

### <img width="28" src="../assets/plugins/icon_i18n-plugin.png"> Internationalization plugin

The Internationalization plugin is a default plugin for all Strapi applications running on version 3.6.0 or higher. For lower versions, a migration is needed, as well as a manual installation of the plugin (see [Installing plugins via the Marketplace](installing-plugins-via-marketplace.md)).

This plugin allows to manage content in different languages, called "locales". With the Internationalization plugin, it is possible to:

- define what locales should be available in the Strapi application,
- define which content-types and fields can be translated in different locales, or should only be available in the default locale,
- translate content and manage it each locale at a time.

The Internationalization plugin impacts several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------|
| Settings         | <ul><li>Addition of a new "Internationalization" setting sub-section, from which to add, edit or delete locales available for the application (see [Configuring Internationalization locales](../settings/managing-global-settings.md#configuring-internationalization-locales)). <br> 👉 Path reminder: *General > Settings > Global Settings > Internationalization* </li> <br> <li>Addition of new permissions for administator roles: access to content-types, as well as possible actions on the content-types, can be defined depending on the locale (see [Configuring role's permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md#configuring-role-s-permissions)). <br> 👉 Path reminder: *General > Settings > Administration panel*</li></ul> |
| Content-Types Builder | <ul><li>Addition of a new setting at content-type level, to allow or not localisation/translation of the content-type (see [Creating a new content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type)).</li> <li>Addition of a new setting at field level, to allow or not localisation/translation of the content-type (see [Configuring fields for content types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#regular-fields)).</li></ul> |
| Content Manager | <ul><li>Addition of new *Locales* filter in collection types list view, to manage entries per locale (see [Introduction to the Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md#collection-types)).</li> <li>Addition of new options in content-types edit view, to translate content and manage it per locale (see [Translating content](/user-docs/latest/content-manager/translating-content.md)).</li></ul> |