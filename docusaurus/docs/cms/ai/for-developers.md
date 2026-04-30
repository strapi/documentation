---
title: AI for developers
description: Use AI-powered tools on the Strapi documentation site. Chatbot, Copy Markdown, LLMs.txt files, Open with LLM, and MCP server for IDE integration.
sidebar_label: AI for developers
displayed_sidebar: cmsSidebar
tags:
- ai
- developer tools
- LLMs
- MCP
toc_max_heading_level: 3
---

# AI for developers

The Strapi documentation site includes AI-powered tools to help developers learn, explore, and integrate Strapi more effectively. These tools are free to use and available to everyone.

:::tip AGENTS.MD files
In addition to docs and product features described on the present page, the <code><ExternalLink to="https://github.com/strapi/strapi/blob/develop/AGENTS.md" text="strapi/strapi"/></code> and <code><ExternalLink to="https://github.com/strapi/documentation/blob/main/AGENTS.md" text="strapi/documentation"/></code> repositories also have their own `AGENTS.md` files. Use them to guide your AI-based tools when developing Strapi features or updating documentation.
:::

## AI toolbar

Every documentation page includes an AI toolbar near the top of the page, right after the title. The toolbar provides quick access to all AI-related actions for the current page.

Clicking the dropdown arrow reveals additional options:

<ThemedImage
  alt="AI toolbar dropdown with all available actions"
  sources={{
    light: '/img/assets/ai/ai-toolbar-dropdown.png',
    dark: '/img/assets/ai/ai-toolbar-dropdown_DARK.png',
  }}
/>

The toolbar includes the following actions:

| Action | Description |
|--------|-------------|
| **Copy Markdown** | Copies the raw Markdown source of the current page to your clipboard |
| **Open with ChatGPT** | Opens a new ChatGPT conversation prefilled with the current page URL |
| **Open with Claude** | Opens a new Claude conversation and copies the prompt to your clipboard |
| **View LLMs.txt** | Opens the lightweight page index for AI models |
| **View LLMs-code.txt** | Opens the code examples file for AI models |
| **View LLMs-full.txt** | Opens the complete documentation file for AI models |

### Copy Markdown

The primary action in the toolbar. Clicking **Copy Markdown** fetches the raw Markdown source of the current page directly from the repository and copies it to your clipboard. You can then paste it into any AI assistant (ChatGPT, Claude, Gemini, etc.) for:

- Asking questions about a specific page with full context
- Summarizing or simplifying documentation content
- Generating code based on documented APIs
- Translating documentation into another language

### Open with LLM

The **Open with ChatGPT** and **Open with Claude** buttons open a new conversation in the respective AI assistant, prefilled with a prompt that includes the current page URL. The prompt is automatically localized to your browser's language.

For Claude, the prompt is also copied to your clipboard since URL encoding works differently.

## AI chatbot {#chatbot}

An AI chatbot powered by [Kapa](https://kapa.ai) is integrated directly into the documentation site. It draws from the full documentation, community forums, blog posts, and other Strapi resources to provide contextual answers.

### Sidebar entry point

Click the <Icon name="sparkle"/> **Ask AI** button in the left sidebar (next to the search bar) to open a conversation about anything related to Strapi.

You can ask questions like:
- "How do I create a Strapi project?"
- "How does population work in REST API?"
- "How do I customize the admin panel?"

For complex questions, enable **deep thinking mode** for more thorough (but slower) answers.

### Code block entry point

Hover over any code block on a documentation page to reveal an **Ask AI** button in the top-right corner of the block. Clicking it opens a conversation prefilled with the code snippet, so you can ask for an explanation or adaptation.

<ThemedImage
  alt="Ask AI button on a code block"
  sources={{
    light: '/img/assets/ai/codeblock-ask-ai.png',
    dark: '/img/assets/ai/codeblock-ask-ai_DARK.png',
  }}
/>

This is particularly useful for understanding configuration examples, API responses, or lifecycle hook patterns.

## LLMs text files {#llms-txt}

3 text files are available for feeding Strapi documentation content directly to LLMs. These follow the [llms.txt](https://llmstxt.org/) convention and are designed for programmatic consumption by AI tools.

| File | URL | Content | Best for |
|------|-----|---------|----------|
| `llms.txt` | [/llms.txt](https://docs.strapi.io/llms.txt) | Concise, link-rich overview of all pages | High-level context, navigation, RAG pipelines |
| `llms-full.txt` | [/llms-full.txt](https://docs.strapi.io/llms-full.txt) | Entire documentation in a single file | Full-site context when token limits allow |
| `llms-code.txt` | [/llms-code.txt](https://docs.strapi.io/llms-code.txt) | All code examples, grouped by page | Code-centric work, migrations, API discovery |

### When to use each file

- **`llms.txt`**: Use this to give an AI model an overview of what Strapi documentation covers, without consuming too many tokens. Ideal for RAG (Retrieval-Augmented Generation) systems or as a first pass before diving deeper.
- **`llms-full.txt`**: Use this when you need the AI to have access to the complete documentation content. This is a large file; make sure your model's context window can handle it.
- **`llms-code.txt`**: Use this when you're working on code and want to give an AI all of Strapi's documented code examples. Each snippet includes the source page URL and anchor for traceability.

## Docs MCP server {#docs-mcp}

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the documentation is available. The Docs MCP server exposes the Strapi documentation to AI coding tools. Connect it to your IDE to get Strapi-aware code suggestions and answers directly in your development environment.

### Compatible tools

The MCP server works with any tool that supports the MCP protocol, including:

- [Cursor](https://cursor.com)
- [VS Code](https://code.visualstudio.com) with GitHub Copilot
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Windsurf](https://codeium.com/windsurf)
- Any other MCP-compatible IDE or tool

### Connection details

When opening the Ask AI window, you should see a **Use MCP** dropdown in the top right corner. Click on it and choose which tool you'd like to connect:

<ThemedImage
  alt="Ask AI modal with Use MCP options higlighted"
  sources={{
    light: '/img/assets/ai/use-mcp-button.png',
    dark: '/img/assets/ai/use-mcp-button.png',
  }}
/>

If manual MCP server configuration is required:

1. Click the **Copy MCP URL** from the dropdown. The server URL should be: `https://strapi-docs.mcp.kapa.ai`
2. Update the MCP server configuration in your IDE:

    <Tabs>
    <TabItem value="cursor" label="Cursor">

    Add to your `.cursor/mcp.json` file:

    ```json title=".cursor/mcp.json"
    {
      "mcpServers": {
        "strapi-docs": {
          "url": "https://strapi-docs.mcp.kapa.ai"
        }
      }
    }
    ```

    </TabItem>
    <TabItem value="vscode" label="VS Code">

    Add to your `.vscode/mcp.json` file:

    ```json title=".vscode/mcp.json"
    {
      "servers": {
        "strapi-docs": {
          "type": "http",
          "url": "https://strapi-docs.mcp.kapa.ai"
        }
      }
    }
    ```

    </TabItem>
    </Tabs>

Once connected, your AI coding assistant can query the Strapi documentation directly to answer questions, suggest implementations, and verify API usage.

## Tips for better results {#tips}

- Include the page URL so the assistant grounds its answer in the right context.
- Mention your Strapi version (e.g., Strapi 5) to avoid outdated suggestions.
- Pair code examples with their source page when sharing snippets from `llms-code.txt`.
- Prefer documented APIs over private internals when asking for code generation.
- Use the MCP server in your IDE for the fastest developer experience.
