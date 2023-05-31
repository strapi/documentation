---
title: Managing end-user accounts
displayed_sidebar: userDocsSidebar
sidebar_position: 5
---

# Managing end-user accounts

End-users are the users who consume the content that is created and managed with a Strapi application and displayed on front-end applications (e.g. websites, mobile applications, connected devices etc.). Unlike the administrators, they do not have access to the admin panel.

With the [Users & Permissions plugin](../plugins/strapi-plugins.md#users-permissions-plugin) activated, it is possible to manage end users. This plugin is however not entirely managed and configured from one same place of the admin panel: end-user roles and permissions are managed in the ![Settings icon](/img/assets/icons/settings.svg) _Settings_ interface (see [Configuring end-user roles](../users-roles-permissions/configuring-end-users-roles.md)), but end-user accounts are managed from the ![Content icon](/img/assets/icons/content.svg) _Content Manager_.

With the Users & Permissions plugin, the end users and their account information are managed as a content-type. When the plugin is installed on a Strapi application, 3 collection types are automatically created (see [Users & Permissions plugin](../plugins/strapi-plugins.md#users-permissions-plugin)), including "User" which is the only one available directly in the Content Manager.

<ThemedImage
  alt="Managing end users via the Content Manager"
  sources={{
    light: '/img/assets/users-permissions/end-user_content-manager.png',
    dark: '/img/assets/users-permissions/end-user_content-manager_DARK.png',
  }}
/>

Registering new end users in a front-end application with the Users & Permissions plugin consists in adding a new entry to the User collection type (see [Introduction to the Content Manager](/user-docs/content-manager) for more information about the Content Manager).

:::note
If end users can register themselves on your front-end application (see [Managing Users & Permissions plugin settings](../settings/configuring-users-permissions-plugin-settings.md)), a new entry will automatically be created and the fields of that entry will be filled up with the information indicated by the end user. All fields can however be edited by an administrator of the Strapi application.
:::

To create a new end-user account:

1. Go to the User collection type in the Content Manager.
2. Click on the **Add new entry** button in the top right corner.
3. Fill in the default fields of the entry. Additional fields added specifically for your Strapi application by your administrators may be displayed as well.

| Field     | Instructions    |
| --------- | ---------------------------- |
| Username  | Write the username of the end user.    |
| Email     | Write the complete email address of the end user in the textbox.   |
| Password  | (optional) Write a new password in the textbox. You can click on the eye icon for the password to be shown. |
| Confirmed | (optional) Click **ON** for the end-user account to be confirmed.                                           |
| Blocked   | (optional) Click **ON** to block the account of the end user, to prevent them to access content.            |
| Role      | (optional) Indicate the role that should be granted to the new end user. If this field is not filled in, the end user will be attributed the role set as default (see [Managing Users & Permissions plugin settings](../settings/configuring-users-permissions-plugin-settings.md)). |

4. Click on the **Save** button.
