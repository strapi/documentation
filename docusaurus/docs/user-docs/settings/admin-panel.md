---
sidebar_position: 3
title: Overview & Custom logo
tags:
- admin panel
- company logo
---

# Customizing the logo

The default Strapi logos, displayed in the main navigation of a Strapi application and the authentication pages, can be modified from ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Global settings > Overview*.

:::note
Both logos can also be customized programmatically via the Strapi application's configuration files (see [Developer Documentation](/dev-docs/admin-panel-customization/options#logos)). However, the logos uploaded via the admin panel supersedes any logo set through the configuration files.
:::

<ThemedImage
  alt="Custom logo settings"
  sources={{
    light: '/img/assets/settings/settings_custom-logo.png',
    dark: '/img/assets/settings/settings_custom-logo_DARK.png',
  }}
/>

To customize the logos:

1. Go to the *Global settings > Overview* sub-section of the settings interface.
2. Click on the upload area.
3. Upload your chosen logo, either by browsing files, drag & dropping the file in the right area, or by using a URL. The logo shouldn't be more than 750x750px. 
4. Click on the **Upload logo** button in the upload window.
5. Click on the **Save** button in the top right corner.

:::tip
Once uploaded, the new logo can be replaced with another one ![Add icon](/img/assets/icons/v5/Plus.svg), or reset ![Reset icon](/img/assets/icons/v5/ArrowClockwise.svg) with the default Strapi logo or the logo set in the configuration files.
:::
