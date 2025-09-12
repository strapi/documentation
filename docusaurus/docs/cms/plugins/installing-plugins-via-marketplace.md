---
title: Installing Plugins via the Marketplace
displayed_sidebar: cmsSidebar
sidebar_position: 2
tags:
- plugins
- provider
- marketplace
- upload plugin
---

# Using the Marketplace

<Tldr>
The in-app Marketplace lists plugins and providers with badges, search, and “More” links to detailed Strapi Market pages. This documentation outlines browsing cards and following provider-specific instructions to install new integrations.
</Tldr>

Strapi comes with built-in plugins such as [Documentation](/cms/plugins/documentation), [GraphQL](/cms/plugins/graphql), and [Sentry](/cms/plugins/sentry). The Marketplace is where users can find additional plugins to customize Strapi applications, and additional providers to extend plugins. The Marketplace is located in the admin panel, indicated by <Icon name="shopping-cart" /> _Marketplace_. In the Marketplace, users can browse or search for plugins and providers, link to detailed descriptions for each, and submit new plugins and providers.

:::note strapi In-app Marketplace vs. Market website
The Marketplace in the admin panel displays all existing plugins, regardless of the version of Strapi they are for. All plugins can also be discoverable through the <ExternalLink to="https://market.strapi.io" text="Strapi Market"/> website.

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
  - <img alt="maintained by Strapi icon" src="/img/strapi-logo.png" width="14px" style={{position: "relative", bottom:"2px", marginRight:"2px"}} /> to indicate it is made by Strapi,
  - <Icon name="seal-check" color="rgb(58,115,66)" /> to indicate it was verified by Strapi.
- the number of times the plugin/provider was starred on GitHub and downloaded
- the description
- a **More** <Icon name="arrow-square-out" /> button to be redirected to the Market website for additional information, including about the version of Strapi the plugin is for, and implementation instructions

In the top right corner of the Marketplace, the **Submit plugin** button redirects to the Strapi Market where it is possible to submit your own plugin and provider.

:::tip Tips

- The search bar displays incremental search results based on the plugin/provider name and description.
- Use the "Sort by" button or set filters to find plugins more easily.

:::

## Installing Marketplace plugins and providers

To install a new plugin or provider via the Marketplace:

1. Go to the <Icon name="shopping-cart" /> *Marketplace*.
2. Choose the **Plugins** tab to browse available plugins or the **Providers** tab to browse available providers.
3. Choose an available plugin/provider and click on the **More** <Icon name="arrow-square-out" /> button.
4. Once redirected to the Strapi Market website, follow the plugin/provider-specific implementation instructions.

:::strapi Developing Strapi plugins
Can't find a plugin that suits your use case? Feel free to [create your own](/cms/plugins-development/developing-plugins)!
:::