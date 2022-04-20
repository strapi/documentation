---
title: List of Strapi plugins - Strapi User Guide
description: Reference guide to Strapi plugins explaining how they work and how they expand a Strapi application.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/strapi-plugins.html
---

# List of Strapi plugins

This section provides a reference guide to the pre-installed plugins and additional plugins developed by Strapi which are available in the [Marketplace](/user-docs/latest/plugins/installing-plugins-via-marketplace.md). Regardless of the type, plugins are a way to expand the functionality of your Strapi application. Additional documentation on plugins is provided in the relevent sections of the User Guide and the Developer Documention, however, a brief plugin description, how the installed plugin works, and changes to the admin panel is provided below.

::: note
- Some Strapi Starters and Templates might install additional plugins beyond the default plugins listed below.
- Some plugin options are only available with an [Enterprise edition license](https://strapi.io/pricing-self-hosted), and are marked with  <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/> in this reference guide.
:::

## Pre-installed plugins

### <img width="28" src="../assets/plugins/icon_i18n-plugin.png"> Internationalization plugin

The Internationalization plugin is installed by default on all v4 Strapi applications, but it can be deactivated.

This plugin is used to manage content in different languages, called "locales". With the Internationalization plugin, it is possible to:

- define which locales should be available in the Strapi application,
- define which content-types and fields can be translated in different locales, or should only be available in the default locale,
- translate content and manage each locale individually.

The Internationalization plugin affects several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------|
| Settings         | <ul><li>Addition of a new "Internationalization" setting sub-section, where locales can be added, edited or deleted from the application (see [Configuring Internationalization locales](../settings/managing-global-settings.md#configuring-internationalization-locales)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Global Settings > Internationalization* </li> <br> <li>Addition of new permissions for administator roles: access to Content-types, as well as possible actions on the Content-types, can be defined depending on the locale (see [Configuring permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md#configuring-role-s-permissions)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel*</li> <br> <li> Addition of role-based permissions settings where the access for each user type can be enabled or restricted (see [Configuring permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.html#editing-a-role)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel > Roles > select role > Settings* <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/></li></ul> |
| Content-type Builder | <ul><li>Addition of a new setting at the Content-type level, to allow or not localisation/translation of the Content-type (see [Creating a new content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type)).</li> <li>Addition of a new setting at field level, to allow or not localisation/translation of the Content-type (see [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#regular-fields)).</li></ul> |
| Content Manager | <ul><li>Addition of a new *Locales* filter in collection types list view, to manage entries per locale (see [Introduction to the Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md#collection-types)).</li> <li>Addition of new options in Content-types edit view, to translate content and manage it per locale (see [Translating content](/user-docs/latest/content-manager/translating-content.md)).</li></ul> |

### <img width="28" src="../assets/plugins/icon_up-plugin.png"> Users & Permissions plugin

:::note
[API tokens](/user-docs/latest/settings/managing-global-settings.html#managing-api-tokens) are the preferred method for managing end users. Strapi plans to remove the Users & Permissions plugin from the default installation by the end of September 2022. <!--confirmed with Marco. Probably earlier, update will be needed-->
:::

The Users & Permissions plugin is installed by default on all v4 Strapi applications, but can be deactivated.

This plugin is used to manage end users, who consume the content that is created and managed with a Strapi application and displayed on a front-end application (e.g. website, mobile application, connected device etc.). With the Users & Permissions plugin, it is possible to:

- manage end users accounts, based on the "User" collection type available through the plugin,
- define the available end-user roles and their related permissions,
- manage available providers to enable end users to login through third-party providers,
- configure available email templates aimed at the end users (e.g. password reset, email address confirmation).

The Users & Permissions plugin impacts several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------|
| Settings         | <ul>Addition of a "Users & Permissions plugin" setting section, which contains 4 sub-sections: Roles (see [Configuring end-user roles](../users-roles-permissions/configuring-end-users-roles.md)), Providers, Email Templates, and Advanced Settings (see [Configuring Users & Permissions plugin](../settings/configuring-users-permissions-plugin-settings.md)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Users & Permissions plugin* </ul> |
| Content-type Builder | <ul>Creation of a default collection type "User" which allows for the management of the end users, the end-user roles and their permissions. This collection type cannot be deleted and the composing fields cannot be edited, but the addition of new fields is possible. </ul> |
| Content Manager | <ul>Addition of the default "User" collection type that allows for the managment of end-user accounts (see [Managing end-user accounts](../users-roles-permissions/managing-end-users.md)). <ul><li>By default, the following fields are available: Username, Email, Password, as well as Confirmed and Blocked as boolean fields.</li> <li>The "User" collection type has a relation established with the "Role" collection type. All end-user accounts must have a designated role: by default, the end user is attributed the end-user role set as default, but that role can be changed via the end-user entries directly in the Content Manager.</li></ul> </ul> |

### <img width="28" src="../assets/plugins/EmailPlugin.png"> Email plugin

The Email plugin allows users to send email from the server or from external providers such as Sendgrid. The Email plugin is not configurable in the admin panel, however users can test email delivery if it has been setup by an administrator. More information about the email plugin is available in the [Developer Documentation](/developer-docs/latest/plugins/email.md).

| Section impacted | Options and settings |
|------------------|----------------------|
| Settings         | <ul><li>Addition of "Email plugin" setting section, which contains a "Configuration" sub-section. In the Configuration section, only the email address field under "Test email delivery" is modifiable by users. A **send test email** button sends a test email.</li> <li>Addition of "Email" to the permissions for authenticated and public users. In the Email section the ability to send emails via the API can be enabled or disabled. <br>👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Users and Permissions > Roles* </li></ul>|

### <img width="28" src="../assets/plugins/MediaLibPlugin.png"> Media Library plugin

<!-- this section might be deleted and moved to the "content-type builder/content manager" status check with Pierre-->

The Media Library plugin is installed by default in each Strapi application and is accessible in the main navigation. The media Library allows users to:

- upload media
- download media
- crop images
- change file names, alternative text, and captions

Media assets can be manipulated through the main navigation or inside media fields in the Content Manager. In addition to the Media Library in the main navigation, the Media Library Plugin affects other parts of the administration panel:

| Section impacted | Options and settings                                                |
|------------------|---------------------------------------------------------------------|
| Main Navigation    | <ul> Addition of the Media Library to the main navigation. From the Media Library assets can be uploaded, downloaded, meta data edited, and images can be cropped. </ul>|
|Settings      | <ul> <li> Addition of booleans for: <ul> <li>responsive friendly upload</li> <li>size optimization</li><li>auto orientation</li></ul> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Media Library* </li><li>Addition of role-based permissions settings where the access for each user type can be enabled or restricted (see [Configuring permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.html#editing-a-role)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel > Roles > select role > Settings* <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/> </li></ul><li>Addition of role-based permissions settings where the access to the Media Library and Media Library functions can be enabled or restricted (see [Configuring permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.html#editing-a-role)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel > Roles > select role > Plugins* <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/> </li> |

:::note
Drag and drop media uploads on the entry page are not currently functional. Users must click on the media field to open a dialog box, where you can select existing assets or upload new assets.
:::

## Additional plugins

### <img width="28" src="../assets/plugins/Documentation-swagger.png"> Documentation

 The Documentation plugin automates documentation for APIs in a Strapi application using the Open API specification version 3.0.1. When the Documentation plugin is installed it is available in the admin panel, under the heading plugins. The Documentation plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-documentation).  The Documentation plugin allows you to:

- open the API documentation
- regenerate the documentation
- restrict access to the documentation endpoint

The Documentation plugin affects multiple parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted    | Options and settings         |
|------------------|---------------------------------------------------------------------------------------------------------|
| Documentation    | <ul>Addition of a new Documentation option in the main navigation under the plugins heading, which contains links to open and refresh the documentation.   </ul>        |
| Settings     | <ul><li>Addition of a "Documentation plugin" setting section, which controls whether the documentation endpoint is private or not. <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > documentation plugin* </li><br>  <li> Activation of role based access control for accessing, updating, deleting, and regenerating the documentation. Administrators can authorize different access levels to different types of users in the _Plugins_ tab and the _Settings_ tab. <br>👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration Panel > Roles*  <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/> </li></ul>|

### <img width="28" src="../assets/plugins/Gatsby_Monogram.png"> Gatsby preview

The Gatsby preview plugin allows applications with Gatsby Cloud accounts to preview the front end. The Strapi Gatsby preview plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-gatsby-preview). The Strapi Market page also contains more information about the Gatsby preview plugin.

| Section impacted    | Options and settings         |
|------------|-----------------|
| Settings     |  Addition of the Gatsby preview plugin section in the Settings sub navigation. In the plugin settings the user can: <ul><li> enable or disable Collection Types and Single Types, </li> <li>add the Gatsby Content Sync url</li> </ul> |
| Content Manager     | Addition of the **open Gatsby preview** button in the right-side navigation                  |
  

### <img width="28" src="../assets/plugins/graphql.png"> GraphQL

GraphQL is both a data query language for APIs and a runtime for queries. The Strapi GraphQL plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-graphql).The GraphQL plugin enables GraphQL endpoints in a Strapi application. The GraphQL Playground is accesible at <http://localhost:1337/graphql> in a default Strapi application with the GraphQL plugin installed. The GraphQL playground is a browser-based interface that assists in writing GraphQL queries and data exploration. There is no access to the GraphQL plugin in the admin panel. More information on using the GraphQL API is located in the [API reference](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#graphql-api) and the [Developer Documentation plugins section](/developer-docs/latest/plugins/graphql.md#graphql). Users can confirm the plugin installation by referencing the list of installed plugins by clicking on
 ![plugins icon](../assets/icons/plugins.svg) _Plugins_ in the main navigation.

### <img width="28" src="../assets/plugins/seo-logo.png"> SEO

The Strapi SEO plugin is designed to improve your application SEO. The Strapi SEO plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-seo). Once installed, the plugin is available in the main navigation. The SEO plugin requires adding a shared component to Collection Types and Single Types. From the **SEO** link in the main navigation, a list of Collection Types and Single Types is available. The plugin allows:

- importing of default Strapi seo and meta-social components
- managing the meta title, meta description, and preview the content
- managing social tags for Facebook and Twitter
- analyzing the SEO of the application content

| Section impacted    | Options and settings                     |
|-------------------|--------------------------------------------|
| Content Manager    | <ul> <li>Addition of SEO field to Collection Types with the SEO component</li> <li> Addition of SEO menu in the right-side navigation </li> <li>Addition of **Browser Preview** and **Social Preview** buttons in the right-side navigation, </li> <li> Addition of SEO Summary and link for details in the right-side navigation.</li> </ul>                          |
| Content-type Builder     | <ul> Addition of `shared - metaSocial` and `shared - seo` components in the Content-type Builder sub navigation. The `shared - metaSocial` and `shared - seo` components can be added to a collection type or single type using the **+ Add another field** button and adding an existing component. See [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.html#components) </ul> |
|Main navigation    | <ul> Addition of ![search icon](../assets/icons/search.svg) _SEO_ to the main navigation. By clicking on ![search icon](../assets/icons/search.svg) _SEO_ a list of Collection Types and Single Types, with the SEO status, is available.</ul>

### <img width="28" src="../assets/plugins/sentry.png"> Sentry

The Strapi Sentry plugin is used to track Strapi errors with Sentry. The Strapi Sentry plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-sentry). With the plugin installed a user can:

- Initialize a Sentry instance when a Strapi application starts,
- Send errors encountered in an application end API to Sentry,
- Attach useful metadata to Sentry events, to help with debugging,
- Expose a global Sentry service.

 There is no access to the Sentry plugin in the admin panel. The user can confirm the plugin installation by referencing the list of installed plugins by clicking on ![plugins icon](../assets/icons/plugins.svg) _Plugins_ in the main navigation.
