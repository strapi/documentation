---
title: Strapi plugins
sidebar_position: 3
tags:
- Content Manager
- Internationalization (i18n)
- plugins
- provider
- marketplace
- upload plugin
- Users, Roles & Permissions
- Sentry
- Strapi plugin
---

# List of Strapi plugins

Strapi builds and maintains plugins that extend the functionality of a core Strapi application. This section is a reference guide to the pre-installed plugins and additional plugins developed by Strapi, which are available in the [Marketplace](/user-docs/plugins/installing-plugins-via-marketplace/). Additional documentation on plugins is provided in the relevant sections of the User Guide and the Developer Documentation, however, a brief plugin description, how the installed plugin works, and changes to the admin panel is provided.

:::note

- Some Strapi Starters and Templates might install additional plugins beyond the default plugins listed below.
- If plugin options are only available with a [paid plan](https://strapi.io/pricing-self-hosted), they are marked with a <GrowthBadge /> or an <EnterpriseBadge /> badge in this reference guide.
- All plugin installations can be confirmed in ![Cog icon](/img/assets/icons/v5/Cog.svg) *Settings > Plugins* in the admin panel.

:::

## Pre-installed plugins

### <img width="28" src="/img/assets/plugins/icon_i18n-plugin.png" /> Internationalization plugin

The Internationalization plugin is installed by default on all v5 Strapi applications, but it can be deactivated.

This plugin is used to manage content in different languages, called "locales". With the Internationalization plugin, it is possible to:

- define which locales should be available in the Strapi application,
- define which content-types and fields can be translated in different locales, or should only be available in the default locale,
- translate content and manage each locale individually.

The Internationalization plugin affects several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings   |
|------------------|----------------------------------------------------------------|
| Settings         | <ul><li>Addition of a new "Internationalization" setting sub-section, where locales can be added, edited or deleted from the application (see [Configuring Internationalization locales](/user-docs/settings/internationalization)). <br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Global Settings > Internationalization* </li> <br/> <li>Addition of new permissions for administrator roles: access to Content-types, as well as possible actions on the Content-types, can be defined depending on the locale (see [Configuring permissions](/user-docs/users-roles-permissions/configuring-administrator-roles#configuring-roles-permissions/)). <br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Administration panel*</li> <br/> <li> Addition of role-based permissions settings where the access for each user type can be enabled or restricted (see [Configuring permissions](/user-docs/users-roles-permissions/configuring-administrator-roles#editing-a-role)). <br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Administration panel > Roles > select role > Settings* </li></ul> |
| Content-type Builder | <ul><li>Addition of a new setting at the Content-type level, to allow or not localization/translation of the content-type (see [Creating a new content-type](/user-docs/content-type-builder/creating-new-content-type#creating-a-new-content-type/)).</li> <li>Addition of a new setting at field level, to allow or not localization/translation of the content-type (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type#regular-fields)).</li></ul> |
| Content Manager | <ul><li>Addition of a new *Locales* filter in collection types list view, to manage entries per locale (see [Introduction to the Content Manager](/user-docs/content-manager#collection-types)).</li> <li>Addition of new options in Content-types edit view, to translate content and manage it per locale (see [Translating content](/user-docs/content-manager/translating-content)).</li></ul> |

### <img width="28" src="/img/assets/plugins/icon_up-plugin.png" /> Users & Permissions plugin

The Users & Permissions plugin is installed by default on all v5 Strapi applications, but can be deactivated.

This plugin is used to manage end users, who consume the content that is created and managed with a Strapi application and displayed on a front-end application (e.g. website, mobile application, connected device, etc.). With the Users & Permissions plugin, it is possible to:

- manage end users accounts, based on the "User" collection type available through the plugin,
- define the available end-user roles and their related permissions,
- manage available providers to enable end users to login through third-party providers,
- configure available email templates aimed at the end users (e.g. password reset, email address confirmation).

The Users & Permissions plugin impacts several parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted | Options and settings       |
|------------------|------------------------------------------------------|
| Settings         | <ul>Addition of a "Users & Permissions plugin" setting section, which contains 4 sub-sections: Roles (see [Configuring end-user roles](/user-docs/users-roles-permissions/configuring-end-users-roles)), Providers, Email Templates, and Advanced Settings (see [Configuring Users & Permissions plugin](/user-docs/settings/configuring-users-permissions-plugin-settings)). <br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Users & Permissions plugin* </ul> |
| Content-type Builder | <ul>Creation of a default collection type "User" which allows for the management of the end users, the end-user roles and their permissions. This collection type cannot be deleted and the composing fields cannot be edited, but the addition of new fields is possible. </ul> |
| Content Manager | <ul>Addition of the default "User" collection type that allows for the management of end-user accounts (see [Managing end-user accounts](/user-docs/users-roles-permissions/managing-end-users)). <ul><li>By default, the following fields are available: Username, Email, Password, as well as Confirmed and Blocked as boolean fields.</li> <li>The "User" collection type has a relation established with the "Role" collection type. All end-user accounts must have a designated role: by default, the end user is attributed the end-user role set as default, but that role can be changed via the end-user entries directly in the Content Manager.</li></ul> </ul> |

### <img width="28" src="/img/assets/plugins/EmailPlugin.png" /> Email plugin

The Email plugin allows users to send email from the server or from external providers such as Sendgrid. The Email plugin is not configurable in the admin panel, however users can test email delivery if it has been setup by an administrator. More information about the email plugin is available in the [Developer Documentation](/dev-docs/plugins/email).

| Section impacted | Options and settings |
|------------------|----------------------|
| Settings         | <ul><li>Addition of "Email plugin" setting section, which contains a "Configuration" sub-section. In the Configuration section, only the email address field under "Test email delivery" is modifiable by users. A **send test email** button sends a test email.</li> <li>Addition of "Email" to the permissions for authenticated and public users. In the Email section the ability to send emails via the API can be enabled or disabled. <br/>👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Users and Permissions > Roles* </li></ul>|

## Additional plugins

### <img width="28" src="/img/assets/plugins/Documentation-swagger.png" /> Documentation

 The Documentation plugin automates documentation for APIs in a Strapi application using the Open API specification version 3.0.1. When the Documentation plugin is installed it is available in the admin panel, under the heading "Plugins". The Documentation plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-documentation). The Documentation plugin enables:

- opening the API documentation,
- regenerating the documentation,
- restricting access to the documentation endpoint.

The Documentation plugin affects multiple parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted    | Options and settings         |
|------------------|-------------------------------------------------------------|
| Documentation    | <ul>Addition of a new Documentation option in the main navigation under the plugins heading, which contains links to open and refresh the documentation.   </ul>        |
| Settings     | <ul><li>Addition of a "Documentation plugin" setting section, which controls whether the documentation endpoint is private or not. <br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Documentation plugin* </li><br/>  <li> Activation of role based access control for accessing, updating, deleting, and regenerating the documentation. Administrators can authorize different access levels to different types of users in the *Plugins* tab and the *Settings* tab. <br/>👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Administration Panel > Roles* </li></ul>|

### <img width="28" src="/img/assets/plugins/Gatsby_Monogram.png" /> Gatsby preview

The Gatsby preview plugin allows applications with Gatsby Cloud accounts to preview the front end. The Strapi Gatsby preview plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-gatsby-preview).

The Gatsby preview plugin affects multiple parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted    | Options and settings         |
|------------|-----------------|
| Settings     |  Addition of a "Gatsby preview plugin" setting section, enables/disables collection types and single types, and allows the Gatsby Content Sync URL to be added. <br/>👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Gatsby preview plugin* | |
| Content Manager     | Addition of the **open Gatsby preview** button in the right-side navigation.                  |
  

### <img width="28" src="/img/assets/plugins/graphql.png" /> GraphQL

The GraphQL plugin enables GraphQL endpoints in a Strapi application, and gives access to the GraphQL Playground: a browser-based interface that assists in writing GraphQL queries and data exploration. The Strapi GraphQL plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-graphql).

There is no access to the GraphQL plugin in the admin panel. The GraphQL Playground is accessible at <http://localhost:1337/graphql> in a Strapi application. More information on using the GraphQL API is located in the [API reference](/dev-docs/api/graphql) and the [Developer Documentation plugins section](/dev-docs/plugins/graphql).

### <img width="28" src="/img/assets/plugins/seo-logo.png" /> SEO

The Strapi SEO plugin is designed to improve your application SEO. The Strapi SEO plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-seo). Once installed, the plugin is available in the main navigation and adds 2 pre-built components *MetaSocial* and *Seo* to the Content-type Builder, which can be used as regular components (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type#components)).

With the plugin installed, it is possible to:

- import default Strapi SEO and meta-social components,
- manage the meta title, meta description, and preview the content,
- manage social tags for Facebook and Twitter,
- analyze the SEO of the application content.

The Strapi SEO plugin affects multiple parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted    | Options and settings                     |
|-------------------|--------------------------------------------|
| Content Manager    | <ul> <li>Addition of SEO field to Collection Types with the SEO component.</li> <li> Addition of SEO menu in the right-side navigation </li> <li>Addition of **Browser Preview** and **Social Preview** buttons in the right-side navigation, </li> <li> Addition of SEO Summary and link for details in the right-side navigation.</li> </ul>                          |
| Content-type Builder     | <ul> Addition of `shared - metaSocial` and `shared - seo` components in the Content-type Builder sub navigation. The `shared - metaSocial` and `shared - seo` components can be added to a collection type or single type using the ![Plus icon](/img/assets/icons/v5/Plus.svg) **Add another field** button and adding an existing component (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type#components)). </ul> |
|Main navigation    | <ul> Addition of ![search icon](/img/assets/icons/v5/Search.svg) *SEO* to the main navigation. By clicking on ![search icon](/img/assets/icons/v5/Search.svg) *SEO* a list of Collection Types and Single Types, with the SEO status, is available.</ul>

### <img width="28" src="/img/assets/plugins/sentry.png" /> Sentry

The Strapi Sentry plugin is used to track Strapi errors with Sentry. The Strapi Sentry plugin is available in the in-app Marketplace and the [Strapi Market](https://market.strapi.io/plugins/@strapi-plugin-sentry). With the plugin installed it is possible to:

- initialize a Sentry instance when a Strapi application starts,
- send errors encountered in an application end API to Sentry,
- attach useful metadata to Sentry events, to help with debugging,
- expose a global Sentry service.
