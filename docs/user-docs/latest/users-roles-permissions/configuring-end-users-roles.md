---
title: Configure End-users Roles - Strapi User Guide
description: Instructions to configure the end-users roles for a front-end application using the Users & Permissions plugin
---

# Configuring end-users roles

End-users are the users who consume the content that is created and managed with a Strapi application and displayed on front-end applications (e.g. websites, mobile applications, connected devices etc.). Unlike the administrators, they do not have access to the admin panel. End-users are managed with the Users & Permissions plugin (see [Users & Permissions plugin](../plugins/strapi-plugins.md#users-permissions-plugin)). This plugin is however not entirely managed and configured from one same place of the admin panel: end-users accounts are managed from the Content Manager (see [Managing end-user accounts](../users-roles-permissions/managing-end-users.md)) but end-users roles and permissions are managed in the Settings interface.

The configurations of the end-users roles and permissions are available in the *Users & Permissions plugin* section of the Settings interface, accessible from *General > Settings* in the main navigation of the admin panel.

![End-users roles interface](../assets/users-permissions/end-user_roles.png)

The *Roles* sub-section of *Users & Permissions plugin* displays all created roles for the end-users of your Strapi application.

From this interface, it is possible to:

- create a new end-user role (see [Creating a new role](#creating-a-new-role)),
- delete an end-user role (see [Deleting a role](#deleting-a-role)),
- or access information regarding an end-user role, and edit it (see [Editing a role](#editing-a-role)).

By default, 2 end-user roles are defined for any Strapi application:

- Authenticated: for end-users to access content only if they are logged in to a front-end application.
- Public: for end-users to access content without being logged in to a front-end application.

::: tip NOTE
The end-user role attributed by default to all new end-users can be defined in the *Advanced settings* sub-section of *Users & Permissions plugin* (see [Configuring advanced settings](../settings/configuring-users-permissions-plugin-settings.md#configuring-advanced-settings)).
:::

## Creating a new role

On the top right side of the *Users & Permissions plugin > Roles* interface, an **Add new role** button is displayed. It allows to create a new role for end-users of your Strapi application.

To create a new role, click on the **Add new role** button.
Clicking on the **Add new role** button will redirect you to the roles edition interface, where you will be able to edit the role's details and configure its permissions (see [Editing a role](#editing-role-s-details)).

## Deleting a role

Although the 2 default end-users roles cannot be deleted, the other ones can, as long as no end-user still has this role attributed to their account.

To delete a role:

1. Click on the trash button <Fa-TrashAlt /> on the right side of the role's record.
2. In the deletion window, click on the **Yes, confirm** button to confirm the deletion.

## Editing a role

![Configuring a role for end-users](../assets/users-permissions/end-user_roles-config.png)

The role edition interface allows to edit the details of an end-user role as well as to configure in detail the permissions to access the content of a front-end application. It is accessible from *Users & Permissions plugin > Roles* either after clicking on the edit button <Fa-PencilAlt /> on the right side of a role's record, or after clicking on the **Add new role** button (see [Creating a new role](#creating-a-new-role)).

### Editing role's details

The details area of an end-user role editing interface allows to define the name of the role, and to give it a description that should help administrators understand what the role gives access to.

To edit a role's details, follow the instructions from the table below:

| Role details  | Instructions                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Name          | Write the new name of the role in the textbox.                                                                                   |
| Description   | Write the description of the role in the textbox.          

### Configuring role's permissions

The permissions area of an end-user role editing interface allows to configure all possible actions and accesses for content-types and available plugins of the Strapi application.

To configure permissions for an end-user role:

1. Click on the name of the permission category to configure (e.g. Application, Content-Manager, Email etc.).
2. Tick the boxes of the actions and permissions to grant for the role.
3. Click on the **Save** button.

::: tip 💡 TIP
When ticking an action or permission box, related bound routes of the API are displayed in the right side of the interface.
:::