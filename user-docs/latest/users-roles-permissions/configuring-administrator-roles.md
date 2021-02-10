# Configuring administrator roles

Administrators are the users of the admin panel of a Strapi application. They accounts as well as the roles they are attributed are managed through the Role-Based Access Control (RBAC) feature, which settings are in the *Administration panel* area of the settings interface, accessible from *General > Settings* in the main navigation of the admin panel.

[screenshot]

By default, 3 administrator roles are defined for any Strapi application:

- Author, to be able to create, manage and publish their own content.
- Editor, to be able to create content, and manage and publish any content.
- Super Admin, to be able to access all features and settings. This is the role attributed by default to the first administrator at the creation of the Strapi application.

::: warning ATTENTION
If you use your Strapi application with the Community Edition (see Pricing & Plans), your use of the RBAC feature will contain some limitations. Only the 3 default role are available, as you cannot create more roles and cannot delete the default ones. It is however possible to edit them, to an extent:

- Configuring permissions in detail is only available for the Enterprise Edition: with the Community Editio, if you have access to a content type, it is automatically a full access with all permissions.
- You can only configure permissions for the content types, but not for the plugins and settings of the Strapi application.
- Custom conditions defined for a specific permission are also only available for the Enterprise Edition.

:::

## Creating a new role

::: tip 💡 TIP
In the *Roles* interface, from the table, you can click on the duplicate icon to create a new role by duplicating an existing one.
:::

On the top right side of the *Roles* interface, an **Add new role** button is displayed. It allows to create a new role for administrators of your Strapi application.

To create a new role, click on the **Add new role** button. 
Clicking on the **Add new role** button will redirect you to the roles edition interface, where you will be able to edit the role's details and configure its permissions (see [Editing a role](#editing-role-s-details)).

## Deleting a role

Administrator roles can be deleted from the *Administration panel > Roles* interface.

To delete a role:

1. Click on the delete icon on the right side of the role's record.
2. In the window that pops up, click on the **Yes, confirm** button to confirm the deletion.

## Editing a role

[screenshot]

To edit a role, click on the edit icon on the right side of the role's record. It gives you access to a role edition interface where you can edit the details of the role as well as configure in detail the permissions to all sections of your Strapi application.

::: warning ATTENTION
It isn't possible to edit the permissions of the Super Admin role. All configurations are in read-only mode.
:::

### Editing role's details

The details area of an administrator role editing interface allow to define the name of the role, and to give it a description that should help other administrators understand what the role gives access to.

::: tip 💡 TIP
In the top right corner, you can see a counter indicating how many administrators have been attributed the role.
:::

To edit a role's details, follow the instructions from the table below:

| Role details  | Instructions                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Name          | Write the new name of the role in the textbox.                                                                                   |
| Description   | Write the description of the role in the textbox.                                                                                |

### Configuring role's permissions

The permissions area of an administrator role editing interface allows to configure in detail what actions an administrator can do for any part of the Strapi application. It is displayed as a table, split into 4 categories: Collection Types, Single Types, Plugins and Settings.

#### Collection and Single Types

The Collection Types and Single Types categories respectively list all available collection and single types for the Strapi application. For each content type, the administrators can have the permission to perform the following actions: create, read, update, delete and publish.

To configure Collection or Single Types permissions for a role:

1. Go to the Collection Types or Single Types category of the permissions table.
2. Tick the box on the left of the name of the content type to give access to. By default, all actions can be performed for all fields of the content type.
3. (optional) Untick the action-related boxes to prevent actions of your choice.
4. (optional) Click the name of the content type to display its full list of fields. Untick the field and action-related boxes to prevent access and/or action for the fields of your choice.
5. Repeat steps 2 to 4 for each content type available to which the role should give access.
6. Click on the **Save** button on the top right corner.

#### Plugins

Plugins displays a sub-category per available plugin in the Strapi application. By default, permissions can be configured for Content-Type Builder, Upload, Content Manager and Users Permissions. Each plugin has its own specific set of permissions.

To configure plugins permissions for a role:

1. Go to the Plugins category of the permissions table.
2. Click on the name of the plugin which permissions to configure, to display all available permissions.
3. Tick the boxes of the permissions the role should give access to. You can refer to the table below for more information and instructions.

| Plugin name          | Permissions |
| -------------------- | ----------- |
| Content-Type-Builder | General: <br><br> - *Read*: gives access to the Content-Types Builder plugin in read-only mode |
| Upload               | General: <br><br> - *Access the Media Library*: gives access to the Media Library plugin <br><br> Assets: <br><br> - *Create (upload)*: allows to upload media files <br> - *Update (crop, details, replace) + delete*: allows to edit uploaded media files <br> - *Download*: allows to download uploaded media files <br> - *Copy link*: allows to copy the link of an uploaded media file <br> |    
| Content-Manager      | Single types: <br><br> - *Configure view*: allows to configure the edit view of a single type <br><br> Collection types: <br><br> - *Configure view*: allows to configure the edit view of a collection type <br><br> Components: <br><br> - *Configure Layout*: allows to configure the layout of a component <br> |
| Users-Permissions    | Roles: <br><br> - *Create*: allows to create roles in the "Roles" part of the Users & Permissions plugin <br> - *Read*: allows to access the "Roles" part of the Users & Permissions plugin <br> - *Update*: allows to edit the roles of the "Roles" part of the Users & Permissions plugin <br> - *Delete*: allows to delete roles from the "Roles" part of the Users & Permissions plugin <br><br> Providers: <br><br> - *Read*: allows to access the "Providers" part of the Users & Permissions plugin <br> - *Edit*: allows to edit the "Providers" part of the Users & Permissions plugin <br><br> Email Templates: <br><br> - *Read*: allows to access the "Email Templates" part of the Users & Permissions plugin <br> - *Edit*: allows to edit the "Email Templates" part of the Users & Permissions plugin <br><br> Advanced settings: <br><br> - *Read*: allows to access the "Advanced Settings" part of the Users & Permissions plugin <br> - *Edit*: allows to edit the "Advanced Settings" part of the Users & Permissions plugin <br> | 

4. Click on the **Save** button on the top right corner.


#### Settings

Settings displays a sub-category per available setting: Media Library, Plugins & Marketplace, Webhooks and Users & Roles (RBAC). Each setting has its own specific set of permissions.

To configure settings permissions for a role:

1. Go to the Settings category of the permissions table.
2. Click on the name of the setting which permissions to configure, to display all available permissions.
3. Tick the boxes of the permissions the role should give access to. You can refer to the table below for more information and instructions.

| Setting name            | Permissions |
| ----------------------- | ----------- |
| Media Library           | General: <br><br> - *Access the Media Library settings page*: gives access to the "Media Library" part of the Global Settings |
| Plugins and Marketplace | Marketplace: <br><br> - *Access the Marketplace*: gives access to the Marketplace <br><br> Plugins: <br><br> - *Install (only for dev env)*: allows to install new plugins when in a development environment <br> - *Uninstall (only for dev env)*: allows to uninstall plugins when in a development environment <br> |    
| Webhooks                | General: <br><br> - *Create*: allows to create webhooks in the "Webhooks" part of the Global Settings <br> - *Read*: allows to access the "Webhooks" part of the Global Settings <br> - *Update*: allows to edit the webhooks of the "Webhooks" part of the Global Settings <br> - *Delete*: allows to delete webhooks from the "Webhooks" part of the Global Settings |
| Users and Roles         | Users: <br><br> - *Create (invite)*: allows to create users in the "Users" part of the Administration Panel <br> - *Read*: allows to access the "Users" part of the Administration Panel <br> - *Update*: allows to edit the users details of the "Users" part of the Administration Panel <br> - *Delete*: allows to delete users from the "Users" part of the Administration Panel <br><br> Roles: <br><br> - *Create*: allows to create roles in the "Roles" part of the Administration Panel <br> - *Read*: allows to access the "Roles" part of the Administration Panel <br> - *Update*: allows to edit the roles of the "Roles" part of the Administration Panel <br> - *Delete*: allows to delete roles from the "Roles" part of the Administration Panel <br> | 

4. Click on the **Save** button on the top right corner.


### Settings custom conditions for permissions

For each permission of each category, a **Settings** button is displayed. It allows to push the permission configuration further by defining conditions.

<!---
NOTES :
- with Community edition, you either have access to everything, or nothing (create VS read VS update). You can only define permissions in detail with the Enterprise edition.
- configure permissions for collection types, single types // Plugins and Settings only available for Enterprise edition
- Settings button when Collection/Single type is selected: define custom conditions for the permissions BUT ONLY FOR EE
- From the list view you can see how many users have been attributed the role !!
--->