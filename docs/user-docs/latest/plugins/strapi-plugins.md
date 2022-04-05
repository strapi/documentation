---
title: List of Strapi plugins - Strapi User Guide
description: Reference guide to Strapi plugins explaining how they work and how they expand a Strapi application.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/strapi-plugins.html
---

# List of Strapi plugins

This section provides a reference guide to the pre-installed and the additional Strapi plugins, which are available in the Marketplace. Regardless of the type, plugins are the fastest way to expand the functionality of your Strapi application. Additional documentation on plugins is provided in the relevent sections of the User guide and the Developer documention, however, A brief plugin description, how the installed plugin works, and changes to the admin panel is provided.

Some plugin options are only available with an [Enterprise edition license](https://strapi.io/pricing-self-hosted), and are marked with  <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/> in this reference guide.

::: tip
Some Strapi Starters and Templates might install additional plugins beyond the default plugins listed below.
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
| Settings         | <ul><li>Addition of a new "Internationalization" setting sub-section, where locales can be added, edited or deleted form the application (see [Configuring Internationalization locales](../settings/managing-global-settings.md#configuring-internationalization-locales)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Global Settings > Internationalization* </li> <br> <li>Addition of new permissions for administator roles: access to Content-types, as well as possible actions on the Content-types, can be defined depending on the locale (see [Configuring role's permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md#configuring-role-s-permissions)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel*</li> <br> <li> Addition of role-based permissions setttings where the access for each user type can be enabled or restricted (see [Configuring permissions](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.html#editing-a-role)). <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration panel > Roles > select role > Settings* <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/></li></ul> |
| Content-type Builder | <ul><li>Addition of a new setting at the Content-type level, to allow or not localisation/translation of the Content-type (see [Creating a new content-type](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type)).</li> <li>Addition of a new setting at field level, to allow or not localisation/translation of the Content-type (see [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#regular-fields)).</li></ul> |
| Content Manager | <ul><li>Addition of a new *Locales* filter in collection types list view, to manage entries per locale (see [Introduction to the Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md#collection-types)).</li> <li>Addition of new options in Content-types edit view, to translate content and manage it per locale (see [Translating content](/user-docs/latest/content-manager/translating-content.md)).</li></ul> |

<!-- Add RBAC features-->

### <img width="28" src="../assets/plugins/icon_up-plugin.png"> Users & Permissions plugin

:::note
[API tokens]() are the preferred method for managing end users. Strapi plans to remove the Users & Permissions plugin from the default installation in the near future.
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
| Content-type Builder | <ul>Creation of 3 default collection types: "User", "Role" and "Permission". They respectively allow to manage the end users, the end-user roles and their permissions. These collection types cannot be deleted and their composing fields cannot be edited, but addition of new fields is possible. Out of the 3, only the "User" collection type is then available via the Content Manager.</ul> |
| Content Manager | <ul>Addition of the default "User" collection type that allows the managment of end-user accounts (see [Managing end-user accounts](../users-roles-permissions/managing-end-users.md)). <ul><li>By default, the following fields are available: Username, Email, Password, as well as Confirmed and Blocked as boolean fields.</li> <li>The "User" collection type has a relation established with the "Role" collection type. All end-user accounts must have a designated role: by default, the end user is attributed the end-user role set as default, but that role can be changed via the end-user entries directly in the Content Manager.</li></ul> </ul> |

<!-- Add RBAC features above-->

### Email plugin

The Email plugin allows users to send email from the server or from external providers such as Sendgrid. The Email plugin is configured through the ./config/plugins.js file, however users can test email delivery by clicking on Settings in the main navigation and then configuration under the email plugin heading. 
More information about the email plugin is available in the [Developer Documentation](https://docs.strapi.io/developer-docs/latest/plugins/email.html)

### GraphQL

There is no access to the GraphQL plugin in the admin panel. Users can confirm the plugin installation by referencing the list of installed plugins by clicking on ![plugins icon](../assets/icons/plugins.svg) _Plugins_ in the main navigation.

### Media library

The media library is installed by default in each Strapi application.

- link from main panel 
- RBAC <!-- need to upgrade licence to test this feature -->
- in content type builder add media component (link to content-type stuff)
- Content manager (allows for uploading content to am entry )

:::note
Drag and drop media uploads on the entry page are not currently functional. A user must click on the media field to open a dialog box, where you can select existing assets or upload new assets.
:::

## Additional plugins

### Documentation <!--need assets-->

The Documentation plugin is available from the Market or the in-app marketplace. The Documentation plugin automates documentation for APIs in a Strapi application using the Open API specification version 3.0.1.  

When the Documentation plugin is installed it is available in the admin panel, under the heading plugins. The Documentation plugin allows you to:

- open the API documentation
- regenerate the documentation
- restrict access to the documentation endpoint

The Documentation plugin affects multiple parts of the admin panel. The table below lists all the additional options and settings that are added to a Strapi application once the plugin has been installed.

| Section impacted    | Options and settings         |
|------------------|---------------------------------------------------------------------------------------------------------|
| Documentation    | Addition of a new Documentation option in the left menu under the plugins heading, which contains links to open and refresh the documentation.           |
| Settings     | Addition of a "Documentation plugin" setting section, which controls whether the documentation endpoint is private or not. <br> 👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > documentation plugin* <br> <!--<ul><li>--> Activation of role based access control for accessing, updating, deleting, and regenerating the documentation. Administrators can authorize different access levels to different types of users in the _Plugins_ tab and the _Settings_ tab. <br>👉 Path reminder: ![Settings icon](../assets/icons/settings.svg) *Settings > Administration Panel > Roles*  <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/>|


### Gatsby preview
The Gatsby preview plugin is available in the in-app Marketplace, allows applications with Gatsby Cloud accounts to preview the application. The plugin adds:

- GATSBY PREVIEW PLUGIN in the settings menu
- a Gatsby preview button TO the right side nav in the Content Manager
  
  | Section impacted    | Options and settings         |
|------------|-----------------|
| Settings     | Addition of the Gatsby preview plugin section in the Settings sub navigation. <br>test                 | 
| Content Manager     | Item 2                 | 
| Item 3     | Item 3                 | 

- gatsby button added in content manager 
- settings for which content types 
- settings to add the link to gatsby. 
- no changes to the RBAC 



### SEO
The Strapi SEO plugin is designed to improve your application SEO. Once installed, the plugin is available in the main navigation menu. <!-- add assets--> The plugin is configured from the main navigation menu. The plugin allows for:

- importation of default Strapi seo and meta-social components
- manage the meta title, meta description, and preview the content
- manage social tags for Facebook and Twitter
- SEO analysis of the application content

<!-- table here -->
- adds SEO to the nav panel
- adds SEO component to selected collection types
- lots of detail inside the content manager once it is setup
- how much detail to add here, and where else would it be documented?


### Sentry
There is no access to the Sentry plugin in the admin panel. The user can confirm the plugin installation by referencing the list of installed plugins by clicking on ![plugins icon](../assets/icons/plugins.svg) _Plugins_ in the main navigation.
