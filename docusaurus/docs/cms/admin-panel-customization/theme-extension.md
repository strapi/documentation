---
title: Theme extension
description: Extend Strapi's admin panel theme.
displayed_sidebar: cmsSidebar
sidebar_label: Theme extension
toc_max_heading_level: 4
tags:
- admin panel
- admin panel customization
---

# Theme extension

Strapi's [admin panel](/cms/admin-panel-customization) can be displayed either in light or dark mode (see [profile setup](/cms/getting-started/setting-up-admin-panel#setting-up-your-administrator-profile)), and both can be extended through custom theme settings.

To extend the theme, use either:

- the `config.theme.light` key for the Light mode
- the `config.theme.dark` key for the Dark mode

:::strapi Strapi Design System
The default <ExternalLink to="https://github.com/strapi/design-system/tree/main/packages/design-system/src/themes" text="Strapi theme"/> defines various theme-related keys (shadows, colors…) that can be updated through the `config.theme.light` and `config.theme.dark` keys in `./admin/src/app.js`. The <ExternalLink to="https://design-system.strapi.io/" text="Strapi Design System"/> is fully customizable and has a dedicated <ExternalLink to="https://design-system-git-main-strapijs.vercel.app" text="StoryBook"/> documentation.
:::
