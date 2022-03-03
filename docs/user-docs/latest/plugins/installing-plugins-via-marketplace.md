---
title: Installing plugins via the Marketplace - Strapi User Guide
description: Instructions to install new plugins in a Strapi application via the Marketplace.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/installing-plugins-via-marketplace.html
---

# Marketplace plugins

<!-- Questions so far: 
   1. not getting the side nav to update? 
   2. proper size for the icons?
   4. 
   -->

The Marketplace contains optional plugins built to customize the core Strapi installation. The in-app Marketplace is located in the admin panel, indicated by the ![Marketplace icon](../assets/icons/marketplace.svg) _Marketplace_. Marketplace plugins are installed using the CLI (see [Developer Documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-install)).

::: tip
The in-app Marketplace displays only v4 plugins. Both v3 and v4 plugins are discoverable in the [web Marketplace](https://market.strapi.io/). 

:::

## The in-app Marketplace interface

![The Marketplace interface](../assets/plugins/marketplace-v4.png)

The Marketplace displays all available v4 plugins on individual cards containing:

- the plugin name
- the plugin description
- a _learn more_ link for additional information, including detailed implementation instructions.
- a button to copy the install command
- a badge indicating if the plugin is _made by Strapi_ ![made by Strapi icon](../assets/icons/official-market.svg) or _verified by Strapi_ ![verified by Strapi icon](../assets/icons/verified-marketplace.svg)

The Marketplace plugins are searchable, and can be filtered by types, plugins, made by Strapi, and verified by Strapi.  

## Installing Marketplace plugins

To install a new plugin via the Marketplace:

1. Go to the ![Marketplace icon](../assets/icons/marketplace.svg) Marketplace.
2. Choose an available plugin and click on the `Copy install command` button.
3. Switch to your CLI application and navigate to the Strapi application directory.
4. Paste  and execute the copied install command.
5. Follow any plugin-specific implimentation instructions.

<!--
::: tip
Click on the link icon ![External link icon](../assets/icons/external_link.svg) next to the name of a plugin to be redirected to the plugin package in the Strapi GitHub repository.
:::
-->