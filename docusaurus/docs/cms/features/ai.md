---
title: AI features
description: Discover all AI-powered features available in Strapi CMS and on the Strapi documentation site.
sidebar_label: AI features
displayed_sidebar: cmsSidebar
tags:
- ai
- features
- Content-Type Builder
- Internationalization (i18n)
- Media Library
toc_max_heading_level: 3
---

import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# AI features

Strapi integrates AI capabilities in several areas. This page provides an overview of all AI-powered features available in the CMS and on the documentation site.

## AI features in Strapi CMS

Strapi AI features require a <GrowthBadge noTooltip /> plan or above.

<StrapiAiCredits />

### Content-Type Builder: AI chat assistant {#ctb-ai}

The [Content-Type Builder](/cms/features/content-type-builder) includes an AI chat assistant that helps you design your content architecture. You can ask the assistant to suggest content-type structures, explain existing schemas, or help you plan your data model.

The AI chat uses your existing content types as context, so suggestions are tailored to your project. This feature is available directly in the Content-Type Builder interface.

👉 See [Content-Type Builder > Strapi AI](/cms/features/content-type-builder#strapi-ai) for details and screenshots.

### Internationalization: AI-powered translations {#i18n-ai}

When [Internationalization (i18n)](/cms/features/internationalization) is enabled, Strapi can automatically translate your content from the default locale to all other locales using AI. When you save an entry in the default locale, Strapi generates translations for all configured locales asynchronously.

To enable AI translations, go to Settings > Internationalization and toggle the AI translations option.

👉 See [Internationalization > AI-powered translations](/cms/features/internationalization) for the full guide.

### Media Library: AI-powered metadata generation {#media-ai}

The [Media Library](/cms/features/media-library) can automatically generate metadata for uploaded assets using AI. When enabled, Strapi analyzes images and suggests alternative text, captions, and descriptions.

To enable AI metadata, go to Settings > Media Library and toggle the AI metadata generation option.

👉 See [Media Library > AI-powered metadata generation](/cms/features/media-library#ai-powered-metadata-generation) for details and screenshots.

### Configuration {#config}

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

---

## AI tools on the documentation site {#docs-ai}

The Strapi documentation site ([docs.strapi.io](https://docs.strapi.io)) includes several AI-oriented tools to help you learn, explore, and integrate Strapi more effectively.

### Kapa AI chatbot {#kapa}

An AI chatbot is integrated directly into the documentation:

- **Sidebar entry point:** Click "Ask AI" in the left sidebar (next to search) to open a conversation about anything in the docs.
- **Code-block entry point:** Hover any code block and click "Ask AI" to ask for an explanation or adaptation of that snippet.
- **Deep thinking mode:** For complex questions, enable deep thinking mode for more thorough (but slower) answers.

The chatbot draws from the full documentation, community forums, and other Strapi resources to provide contextual answers.

### Copy Markdown {#copy-markdown}

Use the "Copy Markdown" button in the AI toolbar at the top of each documentation page to copy the raw Markdown source. Paste it into your preferred AI assistant (ChatGPT, Claude, etc.) for analysis, summarization, or code generation with full page context.

### LLMs text files {#llms-txt}

Three text files are available for feeding documentation content to LLMs:

| File | URL | Content | Best for |
|------|-----|---------|----------|
| `llms.txt` | [/llms.txt](https://docs.strapi.io/llms.txt) | Concise, link-rich overview of all pages | High-level context, navigation |
| `llms-full.txt` | [/llms-full.txt](https://docs.strapi.io/llms-full.txt) | Entire documentation in a single file | Full-site context (large file) |
| `llms-code.txt` | [/llms-code.txt](https://docs.strapi.io/llms-code.txt) | All code examples, grouped by page | Code-centric work, migrations, API discovery |

### Open with LLM {#open-with-llm}

The AI toolbar on each page includes "Open with ChatGPT" and "Open with Claude" buttons. These open a new tab with a prompt prefilled with the current page content, so you can immediately start asking questions about it.

### MCP Server {#mcp}

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server is available, powered by [Kapa](https://kapa.ai), that exposes the Strapi documentation to AI coding tools. Connect it to your IDE (Cursor, VS Code with GitHub Copilot, etc.) to get Strapi-aware code suggestions and answers.

:::tip Tips for better results with AI tools
- **Include the page URL** so the assistant grounds its answer in the right context.
- **Mention your Strapi version** (e.g., Strapi 5) to avoid outdated suggestions.
- **Pair code examples with their source page** when sharing snippets from `llms-code.txt`.
- **Prefer documented APIs** (controllers, services, middlewares) over private internals when asking for code generation.
:::
