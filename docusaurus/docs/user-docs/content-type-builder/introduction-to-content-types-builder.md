---
sidebar_position: 1
slug: /user-docs/content-type-builder
tags:
- collection type
- components
- Content-type
- Content-type Builder
- introduction
- single type 
pagination_next: user-docs/content-type-builder/creating-new-content-type
---

# Introduction to the Content-type Builder

The Content-type Builder is a core plugin of Strapi. It is a feature that is always activated by default and cannot be deactivated. The Content-type Builder is however only accessible when the application is in a development environment.

Administrators can access the Content-type Builder from <Icon name="layout" /> _Content-type Builder_ in the main navigation of the admin panel.

<ThemedImage
  alt="Content-type Builder interface"
  sources={{
    light: '/img/assets/content-type-builder/content-types-builder.png',
    dark: '/img/assets/content-type-builder/content-types-builder_DARK.png',
  }}
/>

From the Content-type Builder, administrators can create and manage content-types: collection types and single types but also components.

- Collection types are content-types that can manage several entries.
- Single types are content-types that can only manage one entry.
- Components are a data structure that can be used in multiple collection types and single types.

All 3 are displayed as categories in the sub navigation of the Content-type Builder. In each category are listed all content-types and components that have already been created.

From each category of the Content-type Builder sub navigation, it is possible to:

- click on an existing content-type or component to access it and edit it (see [Managing content-types](/user-docs/content-type-builder/managing-content-types)),
- or create a new content-type or component (see [Creating content-types](/user-docs/content-type-builder/creating-new-content-type)).

:::tip
Click the search icon <Icon name="magnifying-glass" classes="ph-bold"/> in the Content-type Builder sub navigation to find a specific collection type, single type, or component.
:::
