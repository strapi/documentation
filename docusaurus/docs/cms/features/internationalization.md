---
title: Internationalization
description: Learn how to use the Internationalization (i18n) feature that enables content managers to translate the content
toc_max_heading_level: 5
tags:
- admin panel
- internationalization
- i18n
- translation
- locale
- features
---

import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# Internationalization (i18n)

<Tldr>
Internationalization manages content in multiple locales directly from the admin panel. This documentation explains how to add locales, translate entries, and control locale-specific permissions.
</Tldr>

The Internationalization feature allows to manage content in different languages, called "locales".

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">None</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available but disabled by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="zkj5431ser" darkId="vkm9nn0t3p"/>

## Configuration

Before being usable in the Content Manager, the Internationalization feature must be configured from <Icon name="gear-six" /> *Settings*, and it should be enabled on your content types from the <Icon name="layout" /> _Content-type Builder_.

### Content-type Builder

**Path to configure the feature:** <Icon name="layout" /> _Content-type Builder_

For your content types to be translatable with Internationalization in the Content Manager, the feature must be enabled through the Content-type Builder. Internationalization can be configured for each content type and/or field.

1. Either edit the already created content type/field of your choice, or create a new content type/field.
2. Go to the **Advanced settings** tab.
3. Tick the option named "Internationalization" at content-type level, and "Enable localization for this field" at field level.

<ThemedImage
  alt="Content-type Builder's advanced settings"
  sources={{
    light: '/img/assets/content-type-builder/advanced-settings.png',
    dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
  }}
/>

### Settings

**Path to configure the feature:** <Icon name="gear-six" /> *Settings > Global Settings > Internationalization*

The *Internationalization* interface displays a table listing all locales available for the Strapi application. By default, only the English locale is configured and set as the default locale. 

For each locale, the table displays the default ISO code of the locale, its optional display name and indicates if the locale is set as the default one. From the table, administrators can also:

- Click on the edit button <Icon name="pencil-simple" /> to edit a locale
- Click on the delete button <Icon name="trash" /> to delete a locale

#### Adding a new locale

Administrators can add and manage as many locales as they want. There can however only be one locale set as the default one for the whole Strapi application.

:::note
It is not possible to create custom locales. Locales can only be created based on <ExternalLink to="https://github.com/strapi/strapi/blob/main/packages/plugins/i18n/server/src/constants/iso-locales.json" text="the 500+ pre-created list of locales"/> set by Strapi.
:::

1. Click on the **Add new locale** button.
2. In the locale addition window, choose your new locale among the *Locales* drop-down list. The latter lists alphabetically all locales, displayed as their ISO code, that can be added to your Strapi application.
3. (optional) In the *Locale display name* textbox, write a new display name for your new locale.
4. (optional) In the Advanced settings tab, tick the *Set as default locale* setting to make your new locale the default one for your Strapi application.
5. Click on the **Save** button to confirm the addition of your new locale.

<ThemedImage
  alt="Adding new locale with i18n"
  sources={{
    light: '/img/assets/settings/new-locale-i18n.png',
    dark: '/img/assets/settings/new-locale-i18n_DARK.png',
  }}
/>

#### Enabling AI-powered internationalization
<GrowthBadge /> <FeatureFlagBadge feature="unstableAILocalizations" />

AI-Powered Internationalization enables automatic translations for all the locales in a project when the source content is updated. This enables content editors to have their content translated into multiple languages within a few seconds.

AI-powered Internationalization is disabled by default. To enable it:

1. Ensure the `unstableAILocalizations` [feature flag](/cms/configurations/features) is set to `true`. If you've just changed this configuration property, you might need to restart the Strapi server for the changes to apply.
2. Go to <Icon name="gear-six" /> *Settings > Global Settings > Internationalization* and set _AI translations_ to on.

<!-- TODO: add light/dark mode screenshots -->

### Code-based configuration

A `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE` [environment variable](/cms/configurations/environment#strapi) can be configured to set the default locale for your environment. The value used for this variable should be an ISO country code from <ExternalLink to="https://github.com/strapi/strapi/blob/main/packages/plugins/i18n/server/src/constants/iso-locales.json" text="the 500+ pre-created list of locales"/>.

## Usage

**Path to use the feature:** <Icon name="feather" /> Content Manager, edit view of your content type

In the [Content Manager](/cms/features/content-manager), when the Internationalization feature is enabled for the content-type, a locale drop-down list is added to the top right of the edit view and allows to switch locales.

The Internationalization feature also allows dynamic zones and components to differ from one locale to another. Depending on the locale, dynamic zones can indeed have different structures depending on the locale, and repeatable components can have different entries and be organized differently as well.

:::caution
Content can only be managed one locale at the time. It is not possible to edit or publish content for several locales at the same time (e.g. Clicking on the **Publish** button will only publish the content for the locale you are currently working on).
:::

To translate content in another locale:

1. On the top right of the edit view, click on the locale drop-down list.
2. Choose the locale in which you want to translate your content.
3. Translate your content by filling up your content-type's fields. 

:::tip
Click on the <Icon name="download-simple" /> *Fill in from another locale* button, in the top right corner, for all non relational fields to be filled up with the values of another chosen locale. It can be useful if you do not remember what was the exact content in another locale.
:::

<ThemedImage
  alt="Managing locales with i18n"
  sources={{
    light: '/img/assets/content-manager/locale-i18n.png',
    dark: '/img/assets/content-manager/locale-i18n_DARK.png',
  }}
/>

### AI-powered internationalization <NewBadge /> {#ai-powered-internationalization}
<GrowthBadge /> <FeatureFlagBadge feature="unstableAILocalizations" />

[When enabled](#enabling-ai-powered-internationalization), AI-powered internationalization enables automatic translations for all the locales in a project when the source content is updated. This enables content editors to have their content translated into multiple languages within a few seconds.

Once enabled, whenever you edit a content-type in a given locale and click **Save**, all other locales for the content-type should be translated automatically, which will be confirmed by an _All locales have been translated_ notification. Using this feature consumes Strapi AI credits.

<!-- TODO: add screenshot -->

<StrapiAiCredits />

### Usage with APIs

Localized content can be requested, created, updated, and deleted for a given locale through the various front-end APIs accessible from [Strapi's Content API](/cms/api/content-api):

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="REST API" description="Learn how to use the locale parameter with the REST API." link="/cms/api/rest/locale"/>
<CustomDocCard icon="cube" title="GraphQL API" description="Learn how to use the locale parameter with GraphQL API." link="/cms/api/graphql#locale"/>
</CustomDocCardsWrapper>

On the back-end server of Strapi, the Document Service API can also be used to interact with localized content:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Document Service API" description="Learn how to use the locale parameter with the Document Service API." link="/cms/api/document-service/locale"/>
</CustomDocCardsWrapper>
