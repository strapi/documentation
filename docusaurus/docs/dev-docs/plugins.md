---
title: Plugins
description: Strapi comes with built-in plugins (GraphQL, Users & Permissions, Upload, API documentation, and Email) and you can install plugins as npm packages.
displayed_sidebar: cmsSidebar
pagination_prev: dev-docs/advanced-features
pagination_next: dev-docs/customization
tags:
- admin panel
- concepts 
- plugins 
- introduction
---

# Strapi plugins

:::strapi Dev Docs vs. User Guide
The present section is about the developer-oriented aspects of Strapi plugins. To learn how to install and use plugins from the Strapi admin panel, please read the [User Guide](/user-docs/plugins).
:::

Strapi's core features can be extended with plugins, and your experience with Strapi plugins will fall under the following 4 use cases:

- You will use one of the  **built-in plugins** officially maintained by Strapi. Some built-in plugins can already be pre-installed when you create a new Strapi project.
- You might want to browse **3rd-party plugins** for additional features. 3rd-party plugins can be browsed from the admin panel or from the [Marketplace website](https://market.strapi.io) and installed with the command line interface.
- You might want to **develop your own plugins**. The plugins you develop can be specific to your Strapi project — these plugins are called "local plugins", or can be submitted to the Marketplace if meant to be shared with the Strapi community.
- You might want to **extend an existing plugin** for a specific Strapi project. With this last use case, please proceed carefully, knowing that extensions might break with future updates from the plugin maintainer.

Choose one of the following documentation sections from the table, depending on your profile and use case:

| As a…       | I want to…    | Recommended section to read |
|-------------|---------------|-----------------------------|
| User        | Discover and install built-in and 3rd-party plugins |  [User Guide > Plugins](/user-docs/plugins) |
| Developer   | Setup, configure, and use Strapi built-in plugins | [Dev Docs > Using plugins](/dev-docs/plugins/using-plugins) |
| Developer   | Create my own plugin and submit it to the Marketplace | [Dev Docs > Developing plugins](/dev-docs/plugins/developing-plugins) |
| Developer   | Extend an existing plugin to customize it for a specific Strapi project️ | [Dev Docs > Extending plugins](/dev-docs/plugins-extension) |

<br/>

:::tip
Before browsing or creating plugins, please double-check that Strapi does not already cover your use case with its built-in [advanced features](/dev-docs/advanced-features). Feel free to [submit feedback](https://feedback.strapi.io/) if you'd like some additional features to be included in the core Strapi product.
:::
