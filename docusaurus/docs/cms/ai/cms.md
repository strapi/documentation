---
title: Strapi AI
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

# Strapi AI for content management

<GrowthBadge /> <VersionBadge version="5.30+" />

Some Strapi CMS features can be enhanced with Strapi AI, helping content managers and administrators design content structures, translate content automatically, and generate asset metadata, all from the admin panel.

## Activation and configuration {#activation}

Strapi AI is available since Strapi 5.30 and works with both Strapi Cloud and self-hosted deployments. To get started:

1. **Upgrade to Strapi v5.30+.** AI features are not available on earlier versions.
2. **Activate a Growth license key**, or start a 30-day free trial via CLI or Strapi Cloud. The trial includes 10 free credits to explore AI features.
3. **Access AI features** from the Content-Type Builder, Media Library, or Content Manager — they are enabled by default.

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

## Available features {#features}

| Feature | Description | Details |
|---------|-------------|---------|
| [Content-Type Builder](/cms/features/content-type-builder#strapi-ai) | AI chat assistant that helps design content-type structures, explain existing schemas, and plan data models. Uses your existing content types as context. | [Full walkthrough](/cms/features/content-type-builder#strapi-ai) |
| [Internationalization](/cms/features/internationalization#ai-powered-internationalization) | Automatically translates content from the default locale to all other configured locales when you save an entry. | [Setup guide](/cms/features/internationalization#ai-powered-internationalization) |
| [Media Library](/cms/features/media-library#ai-powered-metadata-generation) | Generates alternative text, captions, and descriptions for uploaded images. | [Details and screenshots](/cms/features/media-library#ai-powered-metadata-generation) |

## Credits and data handling {#credits}

Strapi AI features consume AI credits:

<StrapiAiCredits />

All AI requests are processed through Strapi-managed infrastructure. Content is only used temporarily during each request and is not stored outside your instance. Strapi AI follows the same GDPR-aligned framework as Strapi Cloud.

👉 See [Usage information > Strapi AI data handling](/cms/usage-information#strapi-ai-data-handling) for more details.
