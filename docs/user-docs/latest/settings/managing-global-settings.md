---
title: Global Settings - Strapi User Guide
description: Instructions to manage the global settings of a Strapi application in the admin panel.
---

# Managing global settings

Global settings for plugins and features are managed from *General > Settings* in the main navigation of the admin panel.

## Configuring Single Sign-On <GoldBadge withLinkIcon link="https://strapi.io/pricing-self-hosted" />

Single Sign-On (SSO) can be made available on a Strapi application to allow administrators to authenticate through an identity provider (e.g. Microsoft Azure Active Directory).

![SSO settings](../assets/settings/settings-sso.png)

To configure the SSO feature settings:

1. Go to the *Global settings > Single Sign-On* sub-section of the settings interface.
2. Define your chosen new settings:

| Setting name      | Instructions                                                                                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Auto-registration | Click on **ON** to allow the automatic creation of a new Strapi administrator when an SSO login does not match an existing Strapi administrator account. If this setting is set on **OFF**, new Strapi administrators accounts must be created manually beforehand. |
| Default role      | Choose among the drop-down list the role to attribute by default to auto-registrated Strapi administrators through SSO login.                                                                                                                                       |

## Configuring Internationalization locales

The [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) allows to manage content in different languages, called "locales". Once the Internationalization plugin is installed in a Strapi application (see [Installing plugins via the Marketplace](../plugins/installing-plugins-via-marketplace.md)), administrators can manage locales from the *Global settings > Internationalization* sub-section of the settings interface.

![i18n settings](../assets/settings/settings-i18n.png)

The *Internationalization* settings sub-section displays a table listing all locales available for the Strapi application. By default, only the English locale is configured and set as the default locale. 

For each locale, the table displays the default ISO code of the locale, its optional display name and indicates if the locale is set as the default one. From the table, administrators can also:

- Click on the edit button <Fa-PencilAlt /> to edit a locale
- Click on the trash button <Fa-TrashAlt /> to delete a locale

### Adding a new locale

Administrators can add and manage as many locales as they want. There can however only be one locale set as the default one for the whole Strapi application.

::: tip NOTE
It is not possible to create custom locales. Locales can only be created based on [the 500+ pre-created list of locales](https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-i18n/constants/iso-locales.json) set by Strapi.
:::

To add a new locale:

1. Click on the **Add new locale** button.
2. In the locale addition window, choose your new locale among the *Locales* drop-down list. The latter lists alphabetically all locales, displayed as their ISO code, that can be added to your Strapi application.
3. (optional) In the *Locale display name* textbox, write a new display name for your new locale.
4. (optional) In the Advanced settings tab, tick the *Set as default locale* setting to make your new locale the default one for your Strapi application.
5. Click on the **Add locale** button to confirm the addition of your new locale.