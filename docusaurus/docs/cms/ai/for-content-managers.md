---
title: AI for content managers
description: Learn about AI-powered features in the Strapi admin panel and the built-in MCP server that lets AI clients manage your content.
sidebar_label: AI for content managers
displayed_sidebar: cmsSidebar
tags:
- ai
- features
- MCP
- Content-Type Builder
- Internationalization (i18n)
- Media Library
- Growth plan
- Enterprise feature
- Bring your own AI key
toc_max_heading_level: 3
---

import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# AI for content managers

<Tldr>

Strapi AI helps content managers design content structures, translate content, and generate asset metadata from the admin panel. On the CMS Enterprise plan, translations and asset metadata can use your own AI provider instead. Strapi also includes a built-in MCP server that lets AI clients manage content through natural language.

</Tldr>


This page covers the AI-powered capabilities available to content managers in Strapi: the Strapi AI features built into the admin panel, and the MCP server that lets AI clients manage your content.

## Strapi AI

<GrowthBadge /> <VersionBadge version="5.30+" />

Some Strapi CMS features can be enhanced with Strapi AI, helping content managers and administrators design content structures, translate content automatically, and generate asset metadata, all from the admin panel.

### Activation and configuration {#activation}

Strapi AI is available for Growth plan users since Strapi 5.30 and works with both Strapi Cloud and self-hosted deployments. To get started:

1. Upgrade to Strapi v5.30+. AI features are not available on earlier versions.
2. Activate a Growth license key, or start a 30-day free trial via CLI or Strapi Cloud. The trial includes 10 free credits to explore AI features.
3. Access AI features from the Content-Type Builder, Media Library, or Content Manager; they are enabled by default.

All Strapi AI features can be enabled or disabled globally through the admin panel configuration:

```js title="/config/admin.js|ts"
module.exports = {
  // ...
  ai: {
    enabled: true, // set to false to disable all Strapi AI features
  },
};
```

<Icon name="arrow-fat-right"/> See [Admin panel configuration > Strapi AI](/cms/configurations/admin-panel#strapi-ai) for all configuration options.

### Available features {#features}

| Feature | Description | With your own AI provider (CMS Enterprise plan) |
|---------|-------------|-------------------------------------------------|
| [Content-Type Builder](/cms/features/content-type-builder#strapi-ai) | AI chat assistant that helps design content-type structures, explain existing schemas, and plan data models. Uses your existing content types as context. | Not available |
| [Internationalization](/cms/features/internationalization#ai-powered-internationalization) | Automatically translates content from the default locale to all other configured locales when you save an entry. | Available |
| [Media Library](/cms/features/media-library#ai-powered-metadata-generation) | Generates alternative text, captions, and descriptions for uploaded images. | Available |

### Credits and data handling {#credits}

Strapi AI features consume AI credits. Features that use your own AI provider don't.

<StrapiAiCredits />

Strapi AI requests are processed through Strapi-managed infrastructure. Content is only used temporarily during each request and is not stored outside your instance. Strapi AI follows the same GDPR-aligned framework as Strapi Cloud.

 <Icon name="arrow-fat-right" /> See [Usage information > Strapi AI data handling](/cms/usage-information#strapi-ai-data-handling) for more details.

## Using your own AI provider {#byok}

<EnterpriseBadge /> <VersionBadge version="5.57+" />

Strapi AI is not available on the CMS Enterprise plan. Instead, the [Bring your own AI key plugin](/cms/plugins/byok) runs AI Translations and AI-powered metadata generation with your own AI provider, API key, and models. With the plugin:

- Requests go to your provider and don't use Strapi AI credits.
- Your provider's data handling terms apply, instead of the [Strapi AI ones](#credits).
- The global `ai.enabled` setting still applies: setting it to `false` also turns off the plugin's features.

## Strapi MCP server

Strapi includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that lets AI clients like Claude, Cursor, or any MCP-compatible tool manage your content through natural language. Once enabled and connected, an AI client can create, read, update, delete, publish, and unpublish entries directly through Strapi's Content Manager, all gated by Admin token permissions.

<CustomDocCard icon="feather" title="MCP server" description="Learn how to enable, configure, connect to, and use Strapi's built-in MCP server." link="/cms/features/strapi-mcp-server" />
