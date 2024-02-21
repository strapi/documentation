---
title: Introduction to General Settings
description: Reviewing the audit logs in Strapi.
sidebar_position: 2
---

The _Settings_ feature allows an administrator to adjust all ![Settings icon](/img/assets/icons/settings.svg) _Settings_ from the main navigation of the admin panel, which is divided into 4 sub sections:

- _Global Settings_
- _Administration panel_
- _Email plugin_
- _Users & Permissions plugin_

<ThemedImage
alt="Custom logo settings"
sources={{
    light: '/img/assets/settings/settings_custom-logo.png',
    dark: '/img/assets/settings/settings_custom-logo_DARK.png',
  }}
/>

## Global Settings

The _Global Settings_ in Strapi allows administrators to configure logo in the _Overview & Custom Logo_ interface, manage _API Token_, manage _Media Library_, configure _Internationalization_ locales and configure _Single Sign-On_ and _Webhooks_.

## Administration Panel

The _Administration Panel_ Settings in Strapi allows administrators to configure _Roles_ and _Users_.

### Roles

The _Role_ interface allows administrators to edit the details of an administrator role and configure its permissions in detail. It can be accessed from _Administration panel_ > _Roles_ (see [Configuring Administrator Roles](/user-docs/users-roles-permissions/configuring-administrator-roles)).

### Users

The _Users_ interface allows administrators to edit the details of an end-users role and configure its permissions in detail. It can be accessed from _Administration panel_ > _Users_.

## Email plugin

Administrators must configure an email provider and its corresponding settings in the config/plugins.js or config/plugins.ts file to use the _Email plugin_ Settings. By default, Strapi uses **Sendmail** as the email provider, which is suitable for local development but requires further configuration for production environments. See the [Developer Documentation](/dev-docs/plugins/email) for more details.

## Users & Permission plugin

The _Users & Permission Plugins_ Settings in Strapi allows administrators to configure _Roles_, _Providers_, _Email Templates_, and _Advanced Settings_.

### Roles

The _Roles_ sub-section of the _Users & Permissions_ plugin displays all created roles for the end users of your Strapi application (see [Configuring End Users Roles](/user-docs/users-roles-permissions/configuring-end-users-roles)). From this interface, you can:

- Create a new end-user role
- Delete an end-user role
- Edit an end-user role

By default, two end-user roles are defined for any Strapi application:

- Authenticated: Allows access to content only for logged-in users.
- Public: Enables access to content without requiring users to be logged in.

### Providers

- Enables and configures authentication providers like email, OAuth, or custom providers.
- Accessible from the _Users & Permissions plugin_ > _Providers_ section.
- Each provider has its own set of configurations detailed in the [Developer Documentation](/dev-docs/plugins/users-permissions#setting-up-the-provider---examples).

### Email Templates

- Manages email templates for account confirmation and password reset.
- Allows configuration of sender name, email, response email, subject, and message content using HTML and variables.
- Accessible from the _Users & Permissions plugin_ > _Email templates_ section (see [Configuring Users and Permissions Plugin](/user-docs/settings/configuring-users-permissions-plugin-settings#configuring-email-templates)).
- Two default email templates are provided: "Email address confirmation" and "Reset password".

### Advanced Settings

- Manages various settings related to user authentication and account management.
- Provides settings for enforcing unique email addresses per user account and controlling sign-up functionality.
- Accessed from the _Users & Permissions plugin_ > _Advanced settings_ section (see [Configuring Users and Permissions Plugin](/user-docs/settings/configuring-users-permissions-plugin-settings#configuring-advanced-settings)).
- Options include choosing the default role for authenticated users, enabling sign-ups, specifying the reset password page URL, enabling email confirmation, and defining redirection URLs.
