---
title: Internationalization
description: Learn how to use the Internationalization (i18n) feature that enables content managers to translate the content
tags:
- admin panel
- internationalization
- i18n
- translation
- locale
---

# Internationalization (i18n)

The Internationalization feature allows to manage content in different languages, called "locales".

<ThemedImage
  alt="i18n settings"
  sources={{
    light: '/img/assets/settings/settings-i18n.png',
    dark: '/img/assets/settings/settings-i18n_DARK.png',
  }}
/>

## Activation

The Internationalization feature is available in all projects, no matter the edition or plan of the project. The feature is however disabled by default.

## Configuration

Before being usable in the Content Manager, the Internationalization feature must be configured from ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Global settings > Internationalization*, and it should be enabled on your content types from the ![CTB icon](/img/assets/icons/v5/Layout.svg) _Content-type Builder_.

### Content-type Builder

For your content types to be translatable with Internationalization in the Content Manager, the feature must be enabled through the Content-type Builder. Internationalization can be configured for each content type and/or field.

To enable Internationalization:

1. Go to the ![CTB icon](/img/assets/icons/v5/Layout.svg) _Content-type Builder_ via the main navigation of the admin panel.
2. Either edit the already created content type/field of your choice, or create a new content type/field.
3. Go to the **Advanced settings** tab.
4. Tick the option named "Internationalization" at content-type level, and "Enable localization for this field" at field level.

<ThemedImage
  alt="Content-type Builder's advanced settings"
  sources={{
    light: '/img/assets/content-type-builder/advanced-settings.png',
    dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
  }}
/>

### Settings

The *Internationalization* settings sub-section displays a table listing all locales available for the Strapi application. By default, only the English locale is configured and set as the default locale. 

For each locale, the table displays the default ISO code of the locale, its optional display name and indicates if the locale is set as the default one. From the table, administrators can also:

- Click on the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) to edit a locale
- Click on the delete button ![Delete icon](/img/assets/icons/v5/Trash.svg) to delete a locale

#### Adding a new locale

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

## Usage

In the Content Manager, when the Internationalization feature is enabled for the content-type, a locale drop-down list is added to the top right of the edit view and allows to switch locales.

The Internationalization feature also allows dynamic zones and components to differ from one locale to another. Depending on the locale, dynamic zones can indeed have different structures depending on the locale, and repeatable components can have different entries and be organized differently as well.

:::caution
Content can only be managed one locale at the time. It is not possible to edit or publish content for several locales at the same time (e.g. Clicking on the **Publish** button will only publish the content for the locale you are currently working on).
:::

To translate content in another locale:

1. Access the edit view of your collection or single type.
2. On the top right of the edit view, click on the locale drop-down list.
3. Choose the locale in which you want to translate your content.
4. Translate your content by filling up your content-type's fields. 

:::tip
Click on the ![Dowload icon](/img/assets/icons/v5/Download.svg) *Fill in from another locale* button, in the top right corner, for all non relational fields to be filled up with the values of another chosen locale. It can be useful if you do not remember what was the exact content in another locale.
:::
