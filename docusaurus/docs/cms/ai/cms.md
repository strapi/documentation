---
title: AI for content management
description: Learn about AI-powered features in the Strapi admin panel — content-type design, automatic translations, and media metadata generation.
sidebar_label: AI for content management
displayed_sidebar: cmsSidebar
tags:
- ai
- features
- Content-Type Builder
- Internationalization (i18n)
- Media Library
- Growth plan
toc_max_heading_level: 3
---

import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# AI for content management

Some Strapi CMS features can be enhanced with AI, helping content managers and administrators design content structures, translate content automatically, and generate asset metadata — all from the admin panel.

<StrapiAiCredits />

## Content-Type Builder: AI chat assistant {#ctb-ai}

The [Content-Type Builder](/cms/features/content-type-builder) includes an AI chat assistant that helps you design your content architecture. Describe what you need in plain language, and the assistant suggests content-type structures, explains existing schemas, or helps you plan your data model.

The AI chat uses your existing content types as context, so suggestions are tailored to your project. You can iterate on the suggestions until the structure matches your needs, then apply them directly.

<ThemedImage
  alt="Strapi AI chat assistant in the Content-Type Builder"
  sources={{
    light: '/img/assets/content-manager/strapi-ai-ctb.gif',
    dark: '/img/assets/content-manager/strapi-ai-ctb.gif',
  }}
/>

### What you can ask the assistant

- **Create content types:** "Create a blog post content type with a title, body, author, and cover image."
- **Add relations:** "Create an author collection and link it to blog posts. An author can write multiple posts, but each post has one author."
- **Explain schemas:** "What fields does my restaurant content type have?"
- **Suggest improvements:** "What fields should I add to my product content type for an e-commerce site?"

The assistant generates content types and fields that you can review and apply with a single click.

👉 See [Content-Type Builder > Strapi AI](/cms/features/content-type-builder#strapi-ai) for the full interface walkthrough.

## Internationalization: AI-powered translations {#i18n-ai}

When [Internationalization (i18n)](/cms/features/internationalization) is enabled, Strapi can automatically translate your content from the default locale to all other configured locales using AI.

### How it works

1. Edit an entry in the default locale and click **Save**.
2. Strapi automatically generates translations for all other configured locales.
3. A notification confirms when all locales have been translated.

Translations are one-way: from the default locale to derived locales. Text fields are translated, while media, relations, booleans, and enumerations are copied from the source. The process is asynchronous and non-blocking — you can continue working while translations are generated.

<ThemedImage
  alt="AI-powered translations with internationalization"
  sources={{
    light: '/img/assets/content-manager/locale-i18n-with-ai.png',
    dark: '/img/assets/content-manager/locale-i18n-with-ai_DARK.png',
  }}
/>

:::caution
When AI-powered internationalization is enabled, manually editing content in the default locale and saving it will overwrite any manual modifications previously made to other locales.
:::

### Enabling AI translations

To enable AI translations, go to <ExternalLink to="http://localhost:1337/admin/settings/internationalization" text="Settings > Internationalization" /> and toggle the AI translations option.

👉 See [Internationalization > AI-powered internationalization](/cms/features/internationalization#ai-powered-internationalization) for the full setup guide and screenshots.

## Media Library: AI-powered metadata generation {#media-ai}

The [Media Library](/cms/features/media-library) can automatically generate metadata for uploaded image assets using AI. When you upload an image, Strapi analyzes it and suggests:

- **Alternative text** — for accessibility (screen readers, SEO)
- **Caption** — a short description of the image
- **Description** — a longer, more detailed description

This saves time when managing large volumes of media, and improves accessibility across your content.

<ThemedImage
  alt="AI-powered metadata generation in the Media Library"
  sources={{
    light: '/img/assets/media-library/media-library_ai-metadata.png',
    dark: '/img/assets/media-library/media-library_ai-metadata_DARK.png',
  }}
/>

### Enabling AI metadata

To enable AI metadata generation, go to <ExternalLink to="http://localhost:1337/admin/settings/media-library" text="Settings > Media Library" /> and toggle the AI metadata generation option.

👉 See [Media Library > AI-powered metadata generation](/cms/features/media-library#ai-powered-metadata-generation) for details and screenshots.

## Activation and configuration {#config}

Strapi AI is available since Strapi 5.30 and works with both Strapi Cloud and self-hosted deployments. To get started:

1. **Upgrade to Strapi v5.30+.** AI features are not available on earlier versions.
2. **Activate a Growth license key**, or start a 30-day free trial via CLI or Strapi Cloud. The trial includes 10 free credits to explore AI features.
3. **Access AI features** from the Content-Type Builder, Media Library, or Content Manager — they are enabled by default.

### Disabling AI features globally

All Strapi AI features can be enabled or disabled globally through the admin panel configuration:

```js title="/config/admin.js|ts"
module.exports = {
  // ...
  ai: {
    enabled: true, // set to false to disable all Strapi AI features
  },
};
```

👉 See [Admin panel configuration > Strapi AI](/cms/configurations/admin-panel#strapi-ai) for all configuration options.

## Data handling {#data-handling}

All AI requests are processed through Strapi-managed infrastructure. Content is only used temporarily during each request and is not stored outside your instance. Strapi AI follows the same GDPR-aligned framework as Strapi Cloud.

👉 See [Usage information > Strapi AI data handling](/cms/usage-information#strapi-ai-data-handling) for more details.
