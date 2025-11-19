---
title: Role-Based Access Control (RBAC)
description: Learn to use the RBAC feature which allows to manage the users of the admin panel.
toc_max_heading_level: 5
tags:
- admin panel
- RBAC
- Role Based Access Control
- features
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Role-Based Access Control (RBAC)

<Tldr>
Role-Based Access Control (RBAC) manages administrator roles and granular permissions in the admin panel. This documentation covers creating roles, assigning rights, and securing administrative workflows.
</Tldr>

The Role-Based Access Control (RBAC) feature allows the management of the administrators, who are the users of the admin panel. More specifically, RBAC manages the administrators' accounts and roles.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">CRUD permissions in Roles > Settings - Users & Roles</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="gky9n4mtdp" darkId="zkjloxzaep"/>

## Configuration

**Path to configure the feature:** <Icon name="gear-six" /> *Settings > Administration panel > Roles*

The *Roles* interface displays all created roles for the administrators of your Strapi application.

From this interface, it is possible to:

- create a new administrator role (see [Creating a new role](#creating-a-new-role)),
- delete an administrator role (see [Deleting a role](#deleting-a-role)),
- or access information regarding an administrator role, and edit it (see [Editing a role](#editing-a-role)).

By default, 3 administrator roles are defined for any Strapi application:

- Author: to be able to create and manage their own content.
- Editor: to be able to create content, and manage and publish any content.
- Super Admin: to be able to access all features and settings. This is the role attributed by default to the first administrator at the creation of the Strapi application.

### Creating a new role

On the top right side of the *Administration panel > Roles* interface, an **Add new role** button is displayed. Click on that **Add new role** button to create a new role for administrators of your Strapi application.

You will be redirected to the roles edition interface, where you will be able to edit the role's details and configure its permissions (see [Editing a role](#editing-roles-details)).

<ThemedImage
  alt="New role with RBAC"
  sources={{
    light: '/img/assets/users-permissions/new-role.png',
    dark: '/img/assets/users-permissions/new-role_DARK.png',
  }}
/>

:::tip
In the *Roles* interface, from the table, you can click on the duplicate button <Icon name="copy" /> to create a new role by duplicating an existing one.
:::

### Deleting a role

Administrator roles can be deleted from the *Administration panel > Roles* interface. However, they can only be deleted once they are no more attributed to any administrator of the Strapi application.

1. Make sure the role you wish to delete is not attributed to any administrator anymore.
2. Click on the delete button <Icon name="trash" /> on the right side of the role's record.
3. In the deletion window, click on the **Confirm** button to confirm the deletion.

### Editing a role

<ThemedImage
  alt="Administrator roles edition interface"
  sources={{
    light: '/img/assets/users-permissions/administrator_roles-edition.png',
    dark: '/img/assets/users-permissions/administrator_roles-edition_DARK.png',
  }}
/>

The role edition interface allows to edit the details of an administrator role as well as configure in detail the permissions to all sections of your Strapi application.

It is accessible from *Administration panel > Roles* either after clicking on the edit button <Icon name="pencil-simple" /> on the right side of a role's record, or after clicking on the **Add new role** button (see [Creating a new role](#creating-a-new-role)).

:::caution
It isn't possible to edit the permissions of the Super Admin role. All configurations are in read-only mode.
:::

#### Editing role's details

The details area of an administrator role editing interface allow to define the name of the role, and to give it a description that should help other administrators understand what the role gives access to.

| Role details  | Instructions   |
| ------------- | -------------- |
| Name | Write the new name of the role in the textbox. |
| Description | Write the description of the role in the textbox. |

:::tip
In the top right corner, you can see a counter indicating how many administrators have been attributed the role.
:::

#### Configuring role's permissions

The permissions area of an administrator role editing interface allows to configure in detail what actions an administrator can do for any part of the Strapi application.

It is displayed as a table, split into 4 categories: [Collection types](#collection-and-single-types), [Single types](#collection-and-single-types), [Plugins](#plugins-and-settings) and [Settings](#plugins-and-settings).

##### Collection and Single types

The Collection types and Single types categories respectively list all available collection and single types for the Strapi application.

For each content-type, the administrators can have the permission to perform the following actions: create, read, update, delete and publish.

1. Go to the Collection types or Single types category of the permissions table.
2. Tick the box on the left of the name of the content-type to give access to. By default, all actions can be performed for all fields of the content-type.
3. (optional) Untick the action-related boxes to prevent actions of your choice.
4. (optional) Click the name of the content-type to display its full list of fields. Untick the field and action-related boxes to prevent access and/or action for the fields of your choice. If the [Internationalization feature](/cms/features/internationalization) is installed, define also what permissions should be granted for each available locale.
5. Repeat steps 2 to 4 for each content-type available to which the role should give access.
6. Click on the **Save** button on the top right corner.

##### Plugins and Settings

The Plugins and Settings categories both display a sub-category per available plugin or setting of the Strapi application. Each sub-category contains its own specific set of permissions.

1. Go to the Plugins or Settings category of the permissions table.
2. Click on the name of the sub-category which permissions to configure, to display all available permissions.
3. Tick the boxes of the permissions the role should give access to. You can refer to the table below for more information and instructions.

<Tabs>

<TabItem value="plugins" label="Plugins">

By default, packages permissions can be configured for the [Content-type Builder](/cms/features/content-type-builder), [Upload (i.e. Media Library)](/cms/features/media-library), the [Content Manager](/cms/features/content-manager), and [Users & Permissions](/cms/features/users-permissions) (i.e. the Users & Permissions feature allowing to manage end users). Each package has its own specific set of permissions.

| Package name          | Permissions |
| -------------------- | ----------- |
| Content-Releases <br /> *(Releases)* | <ul><li>General</li><ul><li>"Read" - gives access to the Releases feature</li><li>"Create" - allows to create releases</li><li>"Edit" - allows to edit releases</li><li>"Delete" - allows to delete releases</li><li>"Publish" - allows to publish releases</li><li>"Remove an entry from a release"</li><li>"Add an entry to a release"</li></ul></ul> |
| Content-Manager | <ul><li>Single types</li><ul><li>"Configure view" - allows to configure the edit view of a single type</li></ul></ul><ul><li>Collection types</li><ul><li>"Configure view" - allows to configure the edit view of a collection type</li></ul></ul><ul><li>Components</li><ul><li>"Configure Layout" - allows to configure the layout of a component</li></ul></ul> |
| Content-Type-Builder | <ul><li>General</li><ul><li>"Read" - gives access to the Content-type Builder plugin in read-only mode</li></ul></ul> |
| Upload <br /> *(Media Library)* | <ul><li>General</li><ul><li>"Access the Media Library" - gives access to the Media Library plugin</li><li>"Configure view" - allows to configure the view of the Media Library</li></ul></ul> <ul><li>Assets</li><ul><li>"Create (upload)" - allows to upload media files</li> <li>"Update (crop, details, replace) + delete" - allows to edit uploaded media files</li><li>"Download" - allows to download uploaded media files</li><li>"Copy link" - allows to copy the link of an uploaded media file</li></ul></ul> |
| Users-Permissions | <ul><li>Roles</li><ul><li>"Create" - allows to create end-user roles</li><li>"Read" - allows to see created end-user roles</li><li>"Update" - allows to edit end-user roles</li><li>"Delete" - allows to delete end-user roles</li></ul></ul><ul><li>Providers</li><ul><li>"Read" - allows to see providers</li><li>"Edit" - allows to edit providers</li></ul></ul><ul><li>Email Templates</li><ul><li>"Read" - allows to access the email templates</li><li>"Edit" - allows to edit email templates</li></ul></ul><ul><li>Advanced settings</li><ul><li>"Read" - allows to access the advanced settings of the Users & Permissions plugin</li><li>"Edit" - allows to edit advanced settings</li></ul></ul> 👉 Path reminder to the Users & Permissions plugin: <br />*General > Settings > Users & Permissions plugin* |

</TabItem>

<TabItem value="settings" label="Settings">

Settings permissions can be configured for all settings accessible from *General > Settings* from the main navigation of the admin panel. They also allow to configure access to the Plugins and Marketplace sections of the admin panel. Each setting has its own specific set of permissions.

| Setting name            | Permissions |
| ----------------------- | ----------- |
| Content Releases | <ul><li>Options</li><ul><li>"Read" - allows to access the Releases settings</li><li>"Edit" - allows to edit the Releases settings</li></ul></ul> 👉 Path reminder to the Releases settings: <br />*General > Settings > Global Settings - Releases* |
| Email | <ul><li>General</li><ul><li>"Access the Email settings page" - gives access to Email settings</li></ul></ul> 👉 Path reminder to Email settings: <br /> *General > Settings > Users & Permissions plugin - Email templates* |
| Media Library | <ul><li>General</li><ul><li>"Access the Media Library settings page" - gives access to Media Library settings</li></ul></ul> 👉 Path reminder to Media Library settings: <br /> *General > Settings > Global Settings - Media Library* |
| Internationalization | <ul><li>Locales</li><ul><li>"Create" - allows to create new locales</li><li>"Read" - allows to see available locales</li><li>"Update" - allows to edit available locales</li><li>"Delete" - allows to delete locales</li></ul></ul> 👉 Path reminder to the Internationalization settings: <br /> *General > Settings > Global Settings - Internationalization* |
| Review Workflows <EnterpriseBadge /> | <ul><li>"Create" - allows to create workflows</li><li>"Read" - allows to see created workflows</li><li>"Update" - allows to edit workflows</li><li>"Delete" - allows to delete workflows</li></ul> 👉 Path reminder to Review workflows settings: <br /> *General > Settings > Global Settings - Review workflows* |
| Single sign on <EnterpriseBadge /> <SsoBadge /> | <ul><li>Options</li><ul><li>"Read" - allows to access the SSO settings</li><li>"Update" - allows to edit the SSO settings</li></ul></ul> 👉 Path reminder to the SSO settings: <br />*General > Settings > Global Settings - Single Sign-On* |
| Audit Logs | <ul><li>Options</li><ul><li>"Read" - allows to access the Audit Logs settings</li></ul></ul> 👉 Path reminder to the Audit Logs settings: <br />*General > Settings > Admin Panel - Audit Logs* |
| Plugins and Marketplace | <ul><li>Marketplace</li><ul><li>"Access the Marketplace" - gives access to the Marketplace</li></ul></ul> |
| Webhooks | <ul><li>General</li><ul><li>"Create" - allows to create webhooks</li><li>"Read" - allows to see created webhooks</li><li>"Update" - allows to edit webhooks</li><li>"Delete" - allows to delete webhooks</li></ul></ul> 👉 Path reminder to Webhook settings: <br /> *General > Settings > Global Settings - Webhook* |
| Users and Roles | <ul><li>Users</li><ul><li>"Create (invite)" - allows to create administrator accounts</li><li>"Read" - allows to see existing administrator accounts</li><li>"Update" - allows to edit administrator accounts</li><li>"Delete" - allows to delete administrator accounts</li></ul></ul><ul><li>Roles</li><ul><li>"Create" - allows to create administrator roles</li><li>"Read" - allows to see created administrator roles</li><li>"Update" - allows to edit administrator roles</li><li>"Delete" - allows to delete administrator roles</li></ul></ul> 👉 Path reminder to the RBAC feature: <br /> *General > Settings > Administration Panel* |
| API Tokens |  <ul><li>API tokens</li><ul><li>"Access the API tokens settings page" - toggles access to the API tokens page</li></ul></ul><ul><li>General</li><ul><li>"Create (generate)" - allows the creation of API tokens</li><li>"Read" - allows you to see created API tokens (disabling this permission will disable access to the *Global Settings - API Tokens* settings)</li><li>"Update" - allows editing of API tokens</li><li>"Delete (revoke)" - allows deletion of API tokens</li> <li> "Regenerate" - allows regeneration of the API token</li></ul></ul> 👉 Path reminder to API Tokens settings: <br /> *General > Settings > Global Settings - API Tokens* |
| Project | <ul><li>General</li><ul><li>"Update the project level settings" - allows to edit the settings of the project</li><li>"Read the project level settings" - gives access to settings of the project</li></ul></ul> |
| Transfer Tokens | <ul><li>Transfer tokens</li><ul><li>"Access the Transfer tokens settings page" - toggles access to the Transfer tokens page</li></ul></ul><ul><li>General</li><ul><li>"Create (generate)" - allows the creation of Transfer tokens</li><li>"Read" - allows you to see created Transfer tokens (disabling this permission will disable access to the *Global Settings - Transfer Tokens* settings)</li><li>"Update" - allows editing of Transfer tokens</li><li>"Delete (revoke)" - allows deletion of Transfer tokens</li> <li> "Regenerate" - allows regeneration of the Transfer token</li></ul></ul> 👉 Path reminder to Transfer Tokens settings: <br /> *General > Settings > Global Settings - Transfer Tokens* |

</TabItem>

</Tabs>

4. Click on the **Save** button on the top right corner.

:::tip
To create admin permissions for your custom plugin, please refer to our [dedicated guide](/cms/plugins-development/guides/admin-permissions-for-plugins).
:::

#### Setting custom conditions for permissions

For each permission of each category, a <Icon name="gear-six" /> **Settings** button is displayed. It allows to push the permission configuration further by defining additional conditions for the administrators to be granted the permission.

There are 2 default additional conditions:
- the administrator must be the creator,
- the administrator must have the same role as the creator.

<ThemedImage
  alt="Custom conditions"
  sources={{
    light: '/img/assets/users-permissions/administrator_custom-conditions.png',
    dark: '/img/assets/users-permissions/administrator_custom-conditions_DARK.png',
  }}
/>

1. Click on the <Icon name="gear-six" /> **Settings** button of the permission already granted for the role.
2. In the *Define conditions* window, each available permission can be customized with a specific condition. Click on the drop-down list related to the permission you want to customize.
3. Define the custom condition for the chosen permission. You can either:
   - Tick the Default option for all available additional conditions to be applied.
   - Click on the arrow button <Icon name="caret-down" /> to see the available additional conditions and tick only the chosen one(s).
4. Click on the **Apply** button.

:::tip
Once a custom condition is set for a permission, a dot is displayed next to the permission's name and the <Icon name="gear-six" /> **Settings** button.
:::

:::caution
Custom conditions can only be set for permissions that have been ticked to be granted for the role. If not, when clicking the <Icon name="gear-six" /> **Settings** button, the window that opens will remain empty, as no custom condition option will be available.
:::

Other custom conditions can be available if they have been created beforehand for your Strapi application. The following dedicated guide helps you create additional custom conditions:

<CustomDocCardsWrapper>
<CustomDocCard icon="" title="Creating custom RBAC conditions" description="Learn how to create custom RBAC conditions from scratch by customizing the code of your Strapi application." link="/cms/configurations/guides/rbac" />
</CustomDocCardsWrapper>

## Usage

**Path to use the feature:** <Icon name="gear-six" /> *Settings > Administration panel > Users*

The *Users* interface displays a table listing all the administrators of your Strapi application. More specifically, for each administrator listed in the table, their main account information are displayed, including name, email and attributed role. The status of their account is also indicated: active or inactive, depending on whether the administrator has already logged in to activate the account or not.

<ThemedImage
  alt="Users interface"
  sources={{
    light: '/img/assets/users-permissions/usage-interface.png',
    dark: '/img/assets/users-permissions/usage-interface_DARK.png',
  }}
/>

From this interface, it is possible to:

- make a textual search <ScreenshotNumberReference number="1" /> to find specific administrators,
- set filters <ScreenshotNumberReference number="2" /> to find specific administrators,
- create a new administrator account (see [Creating a new account](#creating-a-new-account)) <ScreenshotNumberReference number="3" />,
- delete an administrator account <ScreenshotNumberReference number="4" /> (see [Deleting an account](#deleting-an-account)),
- or access information regarding an administrator account, and edit it <ScreenshotNumberReference number="5" /> (see [Editing an account](#editing-an-account)).


:::tip
Sorting can be enabled for most fields displayed in the table. Click on a field name, in the header of the table, to sort on that field.
:::

### Creating a new account

<ThemedImage
  alt="User invitation"
  sources={{
    light: '/img/assets/users-permissions/invite-new-user.png',
    dark: '/img/assets/users-permissions/invite-new-user_DARK.png',
  }}
/>

1. Click on the <Icon name="envelope" /> **Invite new user** button.
2. In the *Invite new user* window, fill in the Details information about the new administrator:

  | User information | Instructions                                                                 |
  | ---------------- | ---------------------------------------------------------------------------- |
  | First name       | (mandatory) Write the administrator's first name in the textbox.             |
  | Last name        | (mandatory) Write the administrator's last name in the textbox.              |
  | Email            | (mandatory) Write the administrator's complete email address in the textbox. |

3. Fill in the Login settings about the new administrator:

  | Setting          | Instructions                                                                                                    |
  | ---------------- | --------------------------------------------------------------------------------------------------------------- |
  | User's roles     | (mandatory) Choose from the drop-down list the role to attribute to the new administrator.                      |
  | Connect with SSO | (optional) Click **TRUE** or **FALSE** to connect the new administrator account with SSO.                       |

4. Click on the **Invite user** button in the bottom right corner of the *Add new user* window.
5. A URL appears at the top of the window: it is the URL to send the new administrator for them to log in for the first time to your Strapi application. Click the copy button <Icon name="copy" /> to copy the URL.
6. Click on the **Finish** button in the bottom right corner to finish the new administrator account creation. The new administrator should now be listed in the table.

:::note
The administrator invitation URL is accessible from the administrator's account until it has been activated.
:::

### Deleting an account

It is possible to delete one or several administrator accounts at the same time.

1. Click on the delete button <Icon name="trash" /> on the right side of the account's record, or select one or more accounts by ticking the boxes on the left side of the accounts' records then click on the <Icon name="trash" /> **Delete** button above the table.
2. In the deletion window, click on the **Confirm** button to confirm the deletion.

### Editing an account

<ThemedImage
  alt="Edit an administrator account"
  sources={{
    light: '/img/assets/users-permissions/administrator_edit-info.png',
    dark: '/img/assets/users-permissions/administrator_edit-info_DARK.png',
  }}
/>

1. Click on the name of the administrator whose account you want to edit.
2. In the *Details* area, edit your chosen account details:

| User information      | Instructions  |
| --------------------- | ----------------------- |
| First name            | Write the administrator's first name in the textbox.                                        |
| Last name             | Write the administrator's last name in the textbox.                                         |
| Email                 | Write the administrator's complete email address in the textbox.                            |
| Username              | Write the administrator's username in the textbox.                                          |
| Password              | Write the new administrator account's password in the textbox.                              |
| Confirm password      | Write the new password in the textbox for confirmation.                                     |
| Active                | Click on **TRUE** to activate the administrator's account.                                  |

3. (optional) In the *Roles* area, edit the role of the administrator:
  - Click on the drop-down list to choose a new role, and/or add it to the already attributed one.
  - Click on the delete button <Icon name="x" classes="ph-bold" /> to delete an already attributed role.
4. Click on the **Save** button in the top right corner.
