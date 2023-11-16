---
title: Plugin structure
# description: todo
displayed_sidebar: devDocsSidebar
---

import InteractivePluginStructure from '@site/src/components/PluginStructure.js'

# Plugin structure

When [creating a plugin with the CLI generator](/dev-docs/plugins/development/create-a-plugin), this is what Strapi will generate for you in the `./src/plugins/my-plugin` folder:

<!-- TODO: double-check that no files or folders are missing from the displayed hierarchy -->
<InteractivePluginStructure />

A Strapi plugin is divided into 2 parts: the admin panel part (`/admin` folder) and the backend server part (`/server` folder).

<!-- TODO: improve this below 👇 -->
<!-- 
Server plugin
You can create a plugin that will just use the server part to enhance the API of your application. We can think of a plugin that will have its own visible or invisible content-types, controller actions, and routes that are useful for a specific use case. In such a scenario, you don't need your plugin to have a specific interface in the admin.

Admin plugin
You can create a plugin just to inject some components into the admin. However, just know that you can basically do this by creating an ./src/admin/app.js file, invoking the bootstrap lifecycle function to inject your components: -->
