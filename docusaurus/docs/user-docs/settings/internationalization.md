---
sidebar_position: 3
title: Internationalization
tags:
- admin panel
- Internationalization (i18n)
- plugins
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Configuring Internationalization locales

The [Internationalization feature](/user-docs/plugins/strapi-plugins.md#i18n) allows to manage content in different languages, called "locales". Once the Internationalization plugin is installed in a Strapi application (see [Installing plugins via the Marketplace](/user-docs/plugins/installing-plugins-via-marketplace.md)), administrators can manage locales from <Icon name="gear-six" /> *Settings > Global settings > Internationalization*.

<ThemedImage
  alt="i18n settings"
  sources={{
    light: '/img/assets/settings/settings-i18n.png',
    dark: '/img/assets/settings/settings-i18n_DARK.png',
  }}
/>

The *Internationalization* settings sub-section displays a table listing all locales available for the Strapi application. By default, only the English locale is configured and set as the default locale. 

For each locale, the table displays the default ISO code of the locale, its optional display name and indicates if the locale is set as the default one. From the table, administrators can also:

- Click on the edit button <Icon name="pencil-simple" /> to edit a locale
- Click on the delete button <Icon name="trash"/> to delete a locale

## Adding a new locale

Administrators can add and manage as many locales as they want. There can however only be one locale set as the default one for the whole Strapi application.

:::note
It is not possible to create custom locales. Locales can only be created based on [the 500+ pre-created list of locales](https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json) set by Strapi.
:::

To add a new locale:

1. Click on the **Add new locale** button.
2. In the locale addition window, choose your new locale among the *Locales* drop-down list. The latter lists alphabetically all locales, displayed as their ISO code, that can be added to your Strapi application.
3. (optional) In the *Locale display name* textbox, write a new display name for your new locale.
4. (optional) In the Advanced settings tab, tick the *Set as default locale* setting to make your new locale the default one for your Strapi application.
5. Click on the **Save** button to confirm the addition of your new locale.
