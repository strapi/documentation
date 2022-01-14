---
title: List of Strapi plugins - Strapi User Guide
description: Reference guide to Strapi plugins explaining how they work and how they expand a Strapi application.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/strapi-plugins.html
---

# List of Strapi plugins

<!--
::: callout 🚧 This section of the user guide is a work in progress. Stay tuned!
<br>
:::
-->

No matter if they are installed by default, or additional, Strapi plugins allow to expand your application by adding more options and possibilities. All options are documented in their right places throughout the user guide. However, you can use the following documentation as a reference guide to know which Strapi plugins are available, how they work and which options they add to your Strapi application.

## Default plugins

### <img width="28" src="../assets/plugins/icon_i18n-plugin.png"> Internationalization plugin

The Internationalization plugin is installed by default on all v4 Strapi applications, but can be deactivated.

This plugin allows to manage content in different languages, called "locales". With the Internationalization plugin, it is possible to:

- define what locales should be available in the Strapi application,
- define which content-types and fields can be translated in different locales, or should only be available in the default locale,
- translate content and manage it each locale at a time.

The Internationalization plugin impacts several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------|
| Settings         | <ul><li>Addition of a new "Internationalization" setting sub-section, from which to add, edit or delete locales available for the application (see [Configuring Internationalization locales](../settings/managing-global-settings.md#configuring-internationalization-locales)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Global Settings > Internationalization* </li> <br> <li>Addition of new permissions for administator roles: access to content-types, as well as possible actions on the content-types, can be defined depending on the locale (see [Configuring role's permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md#configuring-role-s-permissions)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel*</li></ul> |
| Content-type Builder | <ul><li>Addition of a new setting at content-type level, to allow or not localisation/translation of the content-type (see [Creating a new content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type)).</li> <li>Addition of a new setting at field level, to allow or not localisation/translation of the content-type (see [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#regular-fields)).</li></ul> |
| Content Manager | <ul><li>Addition of new *Locales* filter in collection types list view, to manage entries per locale (see [Introduction to the Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md#collection-types)).</li> <li>Addition of new options in content-types edit view, to translate content and manage it per locale (see [Translating content](/user-docs/latest/content-manager/translating-content.md)).</li></ul> |


### <img width="28" src="../assets/plugins/icon_up-plugin.png"> Users & Permissions plugin

The Users & Permissions plugin is installed by default on all v4 Strapi applications, but can be deactivated.

This plugin allows to manage end-users, who consume the content that is created and managed with a Strapi application and displayed on a front-end application (e.g. website, mobile application, connected device etc.). With the Users & Permissions plugin, it is possible to:

- manage end-users accounts, based on a "User" collection type available through the plugin,
- define the available end-users roles and their related permissions,
- manage available providers to enable end-users to login through third-party providers,
- configure available email templates aimed at the end-users (e.g. password reset, email address confirmation).

The Users & Permissions plugin impacts several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------|
| Settings         | <ul>Addition of a "Users & Permissions plugin" setting section, which contains 4 sub-sections: Roles (see [Configuring end-users roles](../users-roles-permissions/configuring-end-users-roles.md)), Providers, Email Templates, and Advanced Settings (see [Configuring Users & Permissions plugin](../settings/configuring-users-permissions-plugin-settings.md)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Users & Permissions plugin* </ul> |
| Content-type Builder | <ul>Creation of 3 default collection types: "User", "Role" and "Permission". They respectively allow to manage the end-users, the end-users roles and their permissions. These collection types cannot be deleted and their composing fields cannot be edited, but addition of new fields is possible. Out of the 3, only the "User" collection type is then available via the Content Manager.</ul> |
| Content Manager | <ul>Addition of the default "User" collection type that allows to manage end-user accounts (see [Managing end-users accounts](../users-roles-permissions/managing-end-users.md)). <ul><li>By default, the following fields are available: Username, Email, Password, as well as Confirmed and Blocked as boolean fields.</li> <li>The "User" collection type has a relation established with the "Role" collection type. All end-user accounts must indeed be attributed a role: by default, the end-user is attributed the end-user role set as default, but that role can be changed via the end-users entries directly in the Content Manager.</li></ul> </ul> |