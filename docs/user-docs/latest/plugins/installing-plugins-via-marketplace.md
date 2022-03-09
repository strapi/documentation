---
title: Installing plugins via the Marketplace - Strapi User Guide
description: Instructions to install new plugins in a Strapi application via the Marketplace.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/installing-plugins-via-marketplace.html
---

# Marketplace plugins

The Marketplace contains optional plugins built to customize the core Strapi installation. The Marketplace is located in the admin panel, indicated by the ![Marketplace icon](../assets/icons/marketplace.svg) _Marketplace_. Marketplace plugins are installed using the CLI (see [Developer Documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-install)).

::: tip
The Marketplace displays only v4 plugins. Both v3 and v4 plugins are discoverable in the [Strapi Market](https://market.strapi.io/). v3 and v4 plugins are not cross-compatible.

:::

## The Marketplace

![The Marketplace interface](../assets/plugins/marketplace-v4.png)

Plugins can be discovered by searching or browsing. The search bar (1) displays find as you type results that search the plugin name and description. Plugins are displayed on individual cards containing:

- the plugin name
- the plugin description
- a _learn more_ link (2) for additional information, including detailed implementation instructions
- a button (3) to copy the install command to the local clipboard
- a badge indicating if the plugin is _made by Strapi_ ![made by Strapi icon](../assets/icons/official-market.svg) (4) or _verified by Strapi_ ![verified by Strapi icon](../assets/icons/verified-marketplace.svg) (5)

## Installing Marketplace plugins

To install a new plugin via the Marketplace:

1. Go to the ![Marketplace icon](../assets/icons/marketplace.svg) Marketplace.
2. Choose an available plugin and click on the _Copy install command_ button.
3. Switch to your CLI application and navigate to the Strapi application directory.
4. Paste and execute the copied install command.
5. Follow any plugin-specific implimentation instructions.

## Submitting a plugin

A link for submitting a plugin is located in the top right corner of the admin panel (6). Plugin authors should read the [guidelines](https://strapi.io/strapi-market-guidelines) before submission.
