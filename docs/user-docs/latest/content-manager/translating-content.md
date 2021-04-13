---
title: Translating content - Strapi User Guide
description: Instructions to translate content in various locales with i18n plugin
---

# Translating content

With the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) installed, it is possible to manage content in more than one language, called "locale". To manage content in a specific locale, the latter must be added beforehand through the Internationalization settings (see [Configuring Internationalization locales](../settings/managing-global-settings.md#configuring-internationalization-locales)).

In the Content Manager, when the Internationalization plugin is installed, some options are added to the edit view:

- an Internationalization box, displayed in the right side of the interface, from where it is possible to switch locales
- icons displayed next to every field to indicate whether the field can be translated or not:
  - <img width="16" src="../assets/content-manager/icon_localizable.png"> indicates that the field can be translated,
  - <img width="18" src="../assets/content-manager/icon_non-localizable.png"> indicates that the field cannot be translated: its content is the same for every locale.

::: warning IMPORTANT
Content can only be managed one locale at the time. It is not possible to edit or publish content for several locales at the same time (e.g. Clicking on the **Publish** button will only publish the content for the locale you are currently working on).
:::

To translate content in another locale:

1. Access the edit view of your collection or single type.
2. In the Internationalization box, click on the *Locales* drop-down list.
3. Choose the locale in which you want to translate your content.
4. Translate your content by filling up your content-type's fields (see [Writing content](writing-content.md)). 

::: tip 💡 TIP
Click on the **Fill in form** button in the Internationalization box for all non relational fields to be filled up with the values of another chosen locale. It can be useful if you do not remember what was the exact content in another locale.
:::