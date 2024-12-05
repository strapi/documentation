---
title: Translating content
displayed_sidebar: userDocsSidebar
description: Instructions to translate content in various locales with i18n plugin.
sidebar_position: 5
tags:
- collection type
- components
- Content-type Builder
- dynamic zones
- Internationalization (i18n)
- single type
---

# Translating content

With the [Internationalization feature](/user-docs/plugins/strapi-plugins#i18n) enabled for a content-type, it is possible to manage content in more than one language, called "locale". To manage content in a specific locale, the latter must be added beforehand through the Internationalization settings (see [Configuring Internationalization locales](../settings/internationalization)).

<ThemedImage
  alt="Edit view of a localizable content-type"
  sources={{
    light: '/img/assets/content-manager/content-manager_translate3.png',
    dark: '/img/assets/content-manager/content-manager_translate3_DARK.png',
  }}
/>

<!-- In the Content Manager, when the Internationalization plugin is installed, some options are added to the edit view: -->
In the Content Manager, when the Internationalization feature is enabled for the content-type, a locale drop-down list is added to the top right of the edit view and allows to switch locales.

<!-- - a locale dropdown, displayed in the top right side of the interface, from where it is possible to switch locales -->
<!-- TODO: uncomment when it will work again, if it's planned for v5 -->
<!-- - icons displayed next to every field to indicate whether the field can be translated or not:
  - ![World icon](/img/assets/icons/world.svg) indicates that the field can be translated,
  - ![Striked world icon](/img/assets/icons/world_striked.svg) indicates that the field cannot be translated: its content is the same for every locale (i.e. changing the value of a non-localizable field changes it for all other locales). -->

The Internationalization feature also allows dynamic zones and components to differ from one locale to another. Depending on the locale, dynamic zones can indeed have different structures depending on the locale, and repeatable components can have different entries and be organized differently as well.

:::caution
Content can only be managed one locale at the time. It is not possible to edit or publish content for several locales at the same time (e.g. Clicking on the **Publish** button will only publish the content for the locale you are currently working on).
:::

To translate content in another locale:

1. Access the edit view of your collection or single type.
2. On the top right of the edit view, click on the locale drop-down list.
3. Choose the locale in which you want to translate your content.
4. Translate your content by filling up your content-type's fields (see [Writing content](writing-content.md)). 

:::tip
Click on the ![Dowload icon](/img/assets/icons/v5/Download.svg) *Fill in from another locale* button, in the top right corner, for all non relational fields to be filled up with the values of another chosen locale. It can be useful if you do not remember what was the exact content in another locale.
:::
