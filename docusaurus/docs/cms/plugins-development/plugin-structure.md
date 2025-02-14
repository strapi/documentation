---
title: Plugin structure
description: Learn more about the structure of a Strapi plugin
displayed_sidebar: cmsSidebar
tags:
- admin panel
- Command Line Interface (CLI)
- backend server
- plugins
- plugins development
- plugins structure
- server-only plugin
---

import InteractivePluginStructure from '@site/src/components/PluginStructure.js'

# Plugin structure

When [creating a plugin with Plugin SDK](/cms/plugins-development/create-a-plugin), Strapi generates the following boilerplate structure for you in the `/src/plugins/my-plugin` folder:

<InteractivePluginStructure />

A Strapi plugin is divided into 2 parts, each living in a different folder and offering a different API:

| Plugin part | Description | Folder       | API |
|-------------|-------------|--------------|-----|
| Admin panel | Includes what will be visible in the [admin panel](/cms/intro) (components, navigation, settings, etc.) | `admin/` |[Admin Panel API](/cms/plugins-development/admin-panel-api)|
| Backend server | Includes what relates to the [backend server](/cms/backend-customization) (content-types, controllers, middlewares, etc.) |`server/` |[Server API](/cms/plugins-development/server-api)|

<br />

:::note Notes about the usefulness of the different parts for your specific use case
- **Server-only plugin**: You can create a plugin that will just use the server part to enhance the API of your application. For instance, this plugin could have its own visible or invisible content-types, controller actions, and routes that are useful for a specific use case. In such a scenario, you don't need your plugin to have an interface in the admin panel.

- **Admin panel plugin vs. application-specific customization**: You can create a plugin to inject some components into the admin panel. However, you can also achieve this by creating a `/src/admin/index.js` file and invoking the `bootstrap` lifecycle function to inject your components. In this case, deciding whether to create a plugin depends on whether you plan to reuse and distribute the code or if it's only useful for a unique Strapi application.
:::

<br/>

:::strapi What to read next?
The next steps of your Strapi plugin development journey will require you to use any of the Strapi plugins APIs.

2 different types of resources help you understand how to use the plugin APIs:

- The reference documentation for the [Admin Panel API](/cms/plugins-development/admin-panel-api) and [Server API](/cms/plugins-development/server-api) give an overview of what is possible to do with a Strapi plugin.
- [Guides](/cms/plugins-development/developing-plugins#guides) cover some specific, use-case based examples.
:::
