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
- Strapi AI Enterprise
toc_max_heading_level: 3
---

import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# AI for content managers

<Tldr>

Strapi AI helps content managers design content structures, translate content, and generate asset metadata from the admin panel. On the <GrowthBadge /> plan, Strapi AI Growth runs it on Strapi-managed infrastructure. On the <EnterpriseBadge /> plan, Strapi AI Enterprise, a paid add-on, runs it on your own model, for translations and asset metadata only. Strapi also includes a built-in MCP server that lets AI clients manage content through natural language.

</Tldr>

This page sums up the AI-powered capabilities available to content managers in Strapi: the AI features built into the admin panel, and the MCP server that lets AI clients manage your content.

## Strapi AI

<GrowthBadge /> <AiAddonBadge /> <VersionBadge version="5.30+" />

Some Strapi CMS features can be enhanced with Strapi AI, helping content managers and administrators design content structures, translate content automatically, and generate asset metadata, all from the admin panel.

Strapi AI is powered in one of 2 ways, depending on your plan:

| | Strapi AI Growth (Strapi-managed) | Strapi AI Enterprise (bring your own model) |
|---|---|---|
| Plan | <GrowthBadge /> | <EnterpriseBadge />, as a paid add-on |
| Features | Content-Type Builder assistant, AI Translations, AI metadata generation | AI Translations and AI metadata generation. No Content-Type Builder assistant. |
| Strapi version | 5.30 or later | 5.59 or later |
| AI requests go to | Strapi-managed infrastructure | Your own AI provider, with your API key and models |
| Billing | [AI credits](#credits) | The add-on fee, with unlimited usage and no credits, plus your AI provider's pricing |
| Data handling | [Strapi-managed](/cms/usage-information#strapi-ai-data-handling) | Your provider's terms |

### Activation and configuration {#activation}

With Strapi AI Growth, Strapi AI works with both Strapi Cloud and self-hosted deployments. To get started:

1. Upgrade to Strapi v5.30+. AI features are not available on earlier versions.
2. Activate a Growth license key, or start a 30-day free trial via CLI or Strapi Cloud. The trial includes 10 credits to explore AI features.
3. Access AI features from the Content-Type Builder, Media Library, or Content Manager. The Content-Type Builder assistant and AI metadata generation are enabled by default. AI Translations must be [enabled in the Internationalization settings](/cms/features/internationalization#enabling-ai-powered-internationalization).

To run Strapi AI on your own model, on the Enterprise plan, subscribe to the Strapi AI Enterprise add-on, then install and configure the [Strapi AI Enterprise plugin](/cms/plugins/strapi-ai-enterprise).

All Strapi AI features can be enabled or disabled globally through the admin panel configuration, whether they run on Strapi AI Growth or Strapi AI Enterprise:

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

| Feature | Description | Strapi AI Growth | Strapi AI Enterprise |
|---------|-------------|----------------|-----------------------|
| [Content-Type Builder](/cms/features/content-type-builder#strapi-ai) | AI chat assistant that helps design content-type structures, explain existing schemas, and plan data models. Uses your existing content types as context. | Available | Not available |
| [Internationalization](/cms/features/internationalization#ai-powered-internationalization) | Automatically translates content from the default locale to all other configured locales when you save an entry. | Available | Available |
| [Media Library](/cms/features/media-library#ai-powered-metadata-generation) | Generates alternative text and captions for uploaded images. | Available | Available |

### Credits and data handling {#credits}

Strapi AI Growth consumes AI credits.

<StrapiAiCredits />

Strapi AI Growth requests are processed through Strapi-managed infrastructure. Content is only used temporarily during each request and is not stored outside your instance. Strapi AI Growth follows the same GDPR-aligned framework as Strapi Cloud. With Strapi AI Enterprise, your provider's data handling terms apply.

 <Icon name="arrow-fat-right" /> See [Usage information > Strapi AI data handling](/cms/usage-information#strapi-ai-data-handling) for more details.

## Strapi MCP server

Strapi includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that lets AI clients like Claude, Cursor, or any MCP-compatible tool manage your content through natural language. Once enabled and connected, an AI client can create, read, update, delete, publish, and unpublish entries directly through Strapi's Content Manager, all gated by Admin token permissions. The Strapi MCP server is a built-in, free feature of Strapi. Click on the following card to learn more:

<CustomDocCard icon="feather" title="MCP server" description="Learn how to enable, configure, connect to, and use Strapi's built-in MCP server." link="/cms/features/strapi-mcp-server" />
