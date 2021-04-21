---
title: Managing Administrators - Strapi User Guide
description: Instructions to manage the administrators of a Strapi application with the Role-Based Access Control (RBAC) feature.
---

# Managing administrator accounts

Administrators are the users of an admin panel of a Strapi application. Administrator accounts and roles are managed with the Role-Based Access Control (RBAC) feature. It is available in the *Administration panel* section of the Settings interface, accessible from *General > Settings* in the main navigation of the admin panel.

The *Administration panel* section is divided into 2 sub-sections: *Roles* (see [Configuring administrator roles](configuring-administrator-roles.md)) and *Users*.

![Edit an administrator account](../assets/users-permissions/administrator_list-view.png)

The *Users* sub-section of *Administration panel* displays a table listing all the administrators of your Strapi application.

From this interface, it is possible to:

- make a textual search (1) to find specific administrators,
- sort the administrator accounts (2) to make it easier to view the list of administrator accounts,
- set filters (2) to find specific administrators,
- create a new administrator account (see [Creating a new account](#creating-a-new-account)),
- delete an administrator account (see [Deleting an account](#deleting-an-account)),
- or access information regarding an administrator account, and edit it (see [Editing an account](#editing-an-account)).

For each administrator listed in the table, their main account information are displayed, including name, email and attributed role. The status of their account is also indicated: active or inactive, depending on whether the administrator has already logged in to activate the account or not.

## Creating a new account

On the top right side of the *Administration panel > Users* interface, a **Create new User** button is displayed. It allows to create a new administrator account for your Strapi application.

To create a new administrator account:

1. Click on the **Create new User** button.
2. In the *Add new user* window, fill in the following information about the new administrator:

| User information  | Instructions                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| First name        | (mandatory) Write the administrator's first name in the textbox.                                        |
| Last name         | (mandatory) Write the administrator's last name in the textbox.                                         |
| Email             | (mandatory) Write the administrator's complete email address in the textbox.                            |
| User's role       | (mandatory) Choose from the drop-down list the role to attribute to the new administrator.              |

3. Click on the **Create user** button in the bottom right corner of the *Add new user* window.
4. A URL appears at the top of the window: it is the URL to send the new administrator for them to log in for the first time to your Strapi application. Click the copy button <Fa-Copy /> to copy the URL.
5. Click on the **Continue** button in the bottom right corner to finish the new administrator account creation. The new administrator should now be listed in the table.

::: tip NOTE
The administrator invitation URL is accessible from the administrator's account until it has been activated.
:::

## Deleting an account

Administrator accounts can be deleted from the *Administration panel > Users* interface. It is possible to delete one or several administrator accounts at the same time.

To delete an administrator:

1. Click on the trash button <Fa-TrashAlt /> on the right side of the account's record, or select one or more accounts by ticking the boxes on the left side of the accounts' records then click on the **Delete** button in the top right corner.
2. In the deletion window, click on the **Yes, confirm** button to confirm the deletion.

## Editing an account

![Edit an administrator account](../assets/users-permissions/administrator_edit-info.png)

The table displayed in the *Administration panel > Users* interface allows to access all information regarding each administrator, where it is also possible to edit that information.

To edit an administrator account:

1. Click on the name of the administrator whose account you want to edit.
2. In the *Details* area, edit your chosen account details:

| User information      | Instructions                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------- |
| First name            | Write the administrator's first name in the textbox.                                        |
| Last name             | Write the administrator's last name in the textbox.                                         |
| Email                 | Write the administrator's complete email address in the textbox.                            |
| Username              | Write the administrator's username in the textbox.                                          |
| Password              | Write the new administrator account's password in the textbox.                              |
| Confirmation password | Write the new password in the textbox for confirmation.                                     |
| Active                | Click on **ON** to activate the administrator's account.                                    |

3. (optional) In the *Attributed roles* area, edit the role of the administrator:

  - Click on the drop-down list to choose a new role, and/or add it to the already attributed one.
  - Click on the ![icon x](../assets/users-permissions/icon_delete2.png) to delete an already attributed role.

4. Click on the **Save** button in the top right corner.

::: tip 💡 TIP
You can go back to the original configurations of the account by clicking on the **Reset** button in the top right corner of the interface.
:::
