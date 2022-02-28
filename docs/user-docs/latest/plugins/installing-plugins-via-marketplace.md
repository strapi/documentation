---
title: Installing plugins via the Marketplace - Strapi User Guide
description: Instructions to install new plugins in a Strapi application via the Marketplace.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/installing-plugins-via-marketplace.html
---

# Marketplace plugins

<!--::: callout 🚧 The Marketplace is currently not available for v4. It will be back soon, stay tuned!
In the meantime, plugins can be installed via the Command Line Interface (see [Developer Documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-install)).
::: -->

The Marketplace contains optional plugins built to customize and extend the default Strapi installation. Plugins are listed the in-app Marketplace, which is located in the admin panel, noted by the ![Marketplace icon](../assets/icons/marketplace.svg) _Marketplace_.Plugins are also discoverable through the [web Marketplace](https://market.strapi.io/). Marketplace plugins are installed using the CLI (see [Developer Documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-install)).

## The in-app Marketplace interface

![The Marketplace interface](../assets/plugins/marketplace-v4.png)

The Marketplace displays the available plugins on individual cards containing:

- the plugin name
- the plugin description
- a _learn more_ link for additional information, including detailed implimentation instructions.
- a button to copy the install command
- a badge indicating if the plugin is ![made by Strapi]((../assets/icons/icon_official.svg)) or validated by Strapi

The Marketplace plugins are searchable, and can be filtered by types, plugins, made by Strapi, and Strapi validated.  
<!-- add icons for badges in-line with the bullet point above -->

## Installing Marketplace plugins

To install a new plugin via the Marketplace:

1. Go to the ![Marketplace icon](../assets/icons/marketplace.svg) Marketplace.
2. Choose an available plugin and click on the `Copy install command` button.
3. Switch to your CLI application and navigate to the Strapi application directory.
4. Paste the copied install command and press enter/return.
5. Follow any plugin-specific implimentation instructions.

## Uninstalling Marketplace plugins

<!--

indications on the current status of the plugin:
   - "Compatible with your app": indicates that the plugin is not installed yet but can be installed on your Strapi application
   - "Already installed": indicates that the plugin is already installed and available in your Strapi application

::: tip
Click on the link icon ![External link icon](../assets/icons/external_link.svg) next to the name of a plugin to be redirected to the plugin package in the Strapi GitHub repository.
:::

To install a new plugin via the Marketplace:

1. Go to the ![Marketplace icon](../assets/icons/marketplace.svg) Marketplace.
2. Among the available plugin, choose the one you wish to install.
3. Click on the **Install** button in the chosen plugin's box.

-->