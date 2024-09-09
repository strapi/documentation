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

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Using the Marketplace

<NotV5/>

The Marketplace is where users can find additional plugins to customize Strapi applications, and additional [providers](/user-docs/plugins#providers/) to extend plugins. The Marketplace is located in the admin panel, indicated by ![Marketplace icon](/img/assets/icons/v5/ShoppingCart.svg) _Marketplace_. In the Marketplace, users can browse or search for plugins and providers, link to detailed descriptions for each, and submit new plugins and providers.

:::note strapi In-app Marketplace vs. Market website
The Marketplace in the admin panel only displays v4 plugins, but all plugins for all Strapi versions are discoverable in the [Strapi Market](https://market.strapi.io).

Keep in mind that v3 and v4 plugins are not cross-compatible, but that providers are compatible both with v3 and v4 plugins.
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
- a **Learn more** button for additional information, including detailed implementation instructions
- a **Copy install command** button to copy the installation command to the local clipboard. This button is disabled if the plugin is not compatible with your current Strapi version. Hovering a disabled button displays the Strapi version with which the plugin is compatible. For any installed plugins and providers, this button is replaced by an indicator that it is already installed.

In the top right corner of the Marketplace, the **Submit your plugin** button redirects to the Strapi Market where it is possible to submit your own plugin and provider.

:::tip TIPS

- The search bar displays incremental search results based on the plugin/provider name and description.
- Use the "Sort by" button or set filters to find plugins more easily.

:::

## Installing Marketplace plugins and providers

:::note
Marketplace plugins and providers are installed and deleted from the user's terminal ([see Developer Documentation](/dev-docs/installation/cli/)).
:::

To install a new plugin or provider via the Marketplace:

1. Go to the ![Marketplace icon](/img/assets/icons/v5/ShoppingCart.svg) Marketplace.
2. Choose the **Plugins** tab to browse available plugins or the **Providers** tab to browse available providers.
3. Choose an available plugin/provider and click on the **Copy install command** button.
4. Switch to your terminal and navigate to the Strapi application directory.
5. Paste and run the copied install command.
6. Follow any plugin/provider-specific implementation instructions.
