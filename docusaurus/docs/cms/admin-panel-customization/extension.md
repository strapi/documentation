---
title: Admin panel extension
description: Learn more about extending Strapi's admin panel.
displayed_sidebar: cmsSidebar
tags:
- admin panel 
- admin panel customization
---
import HotReloading from '/docs/snippets/hot-reloading-admin-panel.md'

# Admin panel extension

Strapi's [admin panel](/cms/admin-panel-customization) is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application. If the [customization options](/cms/admin-panel-customization#available-customizations) provided by Strapi are not enough for your use case, you will need to extend Strapi's admin panel.

Extending Strapi's admin panel means leveraging its React foundation to adapt and enhance the interface and features according to the specific needs of your project, which might imply creating new components or adding new types of fields.

There are 2 use cases where you might want to extend the admin panel:

- As a Strapi plugin developer, you want to develop a Strapi plugin that extends the admin panel **everytime it's installed in any Strapi application**.
  👉 This can be done by taking advantage of the [Admin Panel API for plugins](/cms/plugins-development/admin-panel-api), which lets you add navigation links and settings sections, inject React components into predefined areas, manage state with Redux, extend the Content Manager's Edit and List views, and more.

- As a Strapi developer, you want to develop a unique solution for a Strapi user who only needs to extend a specific instance of a Strapi application.
  👉 This can be done by directly updating the `/src/admin/app` file, which can import any file located in `/src/admin/extensions`.

## When to consider a plugin instead

Starting with a direct customization in `/src/admin/app` is the right default for project-specific needs. Consider moving to a plugin-based approach when one or more of these signals appear:

- You are duplicating the same admin customization across several Strapi projects.
- You want to version and distribute the extension, either internally or through the [Strapi Marketplace](https://market.strapi.io/).
- You need stronger automated testing independent from a single project codebase.
- Multiple teams need shared ownership and release management for the same extension.

For a full introduction to plugin development, see [Developing Strapi plugins](/cms/plugins-development/developing-plugins).

:::strapi Additional resources
* If you're looking for ways of replacing the default Rich text editor, refer to the [corresponding page](/cms/admin-panel-customization/wysiwyg-editor).
* If you're building a plugin, the following guides cover common extension use cases:
  * [How to create components for Strapi plugins](/cms/plugins-development/guides/create-components-for-plugins)
  * [How to create admin permissions for plugins](/cms/plugins-development/guides/admin-permissions-for-plugins)
  * [How to pass data from the server to the admin panel](/cms/plugins-development/guides/pass-data-from-server-to-admin)
:::

<HotReloading />