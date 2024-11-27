---
title: Installing Plugins via the Marketplace
displayed_sidebar: userDocsSidebar
sidebar_position: 2
tags:
- plugins
- provider
- marketplace
- upload plugin
---

# Using the Marketplace

The Marketplace is where users can find additional plugins to customize Strapi applications, and additional [providers](/user-docs/plugins#providers) to extend plugins. The Marketplace is located in the admin panel, indicated by ![Marketplace icon](/img/assets/icons/v5/ShoppingCart.svg) _Marketplace_. In the Marketplace, users can browse or search for plugins and providers, link to detailed descriptions for each, and submit new plugins and providers.

:::note strapi In-app Marketplace vs. Market website
The Marketplace in the admin panel displays all existing plugins, regardless of the version of Strapi they are for. All plugins can also be discoverable through the [Strapi Market](https://market.strapi.io) website.

Keep in mind however that v4 and v5 plugins are not cross-compatible, but that providers are compatible both with v4 and v5 plugins.
:::

<ThemedImage
  alt="The Marketplace interface"
  sources={{
    light: '/img/assets/plugins/marketplace-plugins.png',
    dark: '/img/assets/plugins/marketplace-plugins_DARK.png',
  }}
/>

The Plugins and Providers tabs display each plugin/provider on individual cards containing:

- their name, sometimes followed by either of the following badges:
  - ![maintained by Strapi icon](/img/assets/icons/v5/official-market.svg) to indicate it is made by Strapi,
  - ![verified by Strapi icon](/img/assets/icons/v5/verified-marketplace.svg) to indicate it was verified by Strapi.
- the number of times the plugin/provider was starred on GitHub and downloaded
- the description
- a **More** ![ExternalLink icon](/img/assets/icons/v5/ExternalLink.svg) button to be redirected to the Market website for additional information, including about the version of Strapi the plugin is for, and implementation instructions

In the top right corner of the Marketplace, the **Submit plugin** button redirects to the Strapi Market where it is possible to submit your own plugin and provider.

:::tip TIPS

- The search bar displays incremental search results based on the plugin/provider name and description.
- Use the "Sort by" button or set filters to find plugins more easily.

:::

## Installing Marketplace plugins and providers

:::note
Marketplace plugins and providers are installed and deleted from the user's terminal ([see Developer Documentation](/dev-docs/installation/cli/)).
:::

To install a new plugin or provider via the Marketplace:

1. Go to the ![Marketplace icon](/img/assets/icons/v5/ShoppingCart.svg) *Marketplace*.
2. Choose the **Plugins** tab to browse available plugins or the **Providers** tab to browse available providers.
3. Choose an available plugin/provider and click on the **More** ![ExternalLink icon](/img/assets/icons/v5/ExternalLink.svg) button.
4. Once redirected to the Strapi Market website, follow the plugin/provider-specific implementation instructions.
