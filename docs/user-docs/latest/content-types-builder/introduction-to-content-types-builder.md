# Introduction to the Content-Types Builder

The Content-Types Builder is a core plugin of Strapi. It is a feature that is always activated by default and cannot be deleted. It is however only accessible when the application is in a development environment.

Administrators can access the Content-Types Builder from _Plugins > Content-Types Builder_ in the main navigation of the admin panel. From there, it is possible to create and manage content-types, including collection types, single types and components.

![Content-Types Builder interface](../assets/content-types-builder/content-types-builder.png)

The Content-Types Builder contains 2 main parts: the navigation and the edition and configuration interface.

The navigation of the Content-Types Builder is divided into 3 categories:

- Collection type
- Single type 
- Components

Each category of the Content-Types Builder navigation lists all its related available same-named entries. From each category, it is possible to access the entry and edit it, or create a new one.

::: tip TIP
Use the search bar to find a specific entry in the Content-Types Builder.
:::

![Content-Types Builder's edition interface](../assets/content-types-builder/content-types-builder_edition.png)

The edition and configuration interface of a content type or component displays:

- the name and optionally the description of the content type or component (1),
- buttons to cancel or save any ongoing modification (2),
- a table listing all the fields created and configured for the content type or component. From the fields table, it is possible to:
  - edit a field, by clicking on the edit button <Fa-PencilAlt />
  - delete a field, by clicking on the trash button <Fa-TrashAlt />
  - add another field to the content type or component, by clicking on the **Add another field** button
  - access the view configuration interface, by clicking on the **Configure the view** button (see Configuring content types views)