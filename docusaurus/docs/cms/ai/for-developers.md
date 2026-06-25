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
| **Copy Markdown** | Copies the clean Markdown version of the current page to your clipboard. Available in Elegant and AI modes; in Markdown mode, use the **View this page as .md** button next to the toolbar instead. |
| **View as Markdown** | Opens the clean Markdown version of the current page in a new tab.<br/>Available in Elegant and AI modes; in Markdown mode, it is replaced by the "<Icon name="markdown-logo" /> View this page as .md" button shown next to the toolbar. |
| **Open with ChatGPT** | Opens a new ChatGPT conversation prefilled with the current page URL |
| **Open with Claude** | Opens a new Claude conversation and copies the prompt to your clipboard |
| **View LLMs.txt** | Opens the lightweight page index for AI models |
| **View LLMs-code.txt** | Opens the code examples file for AI models |
| **View LLMs-full.txt** | Opens the complete documentation file for AI models |

### Copy Markdown

The primary action in the toolbar. Clicking **Copy Markdown** fetches the clean Markdown version of the current page (the same content as the page's `.md` URL, with layout components resolved into plain Markdown) and copies it to your clipboard. You can then paste it into any AI assistant (ChatGPT, Claude, Gemini, etc.) for:

- Asking questions about a specific page with full context
- Summarizing or simplifying documentation content
- Generating code based on documented APIs
- Translating documentation into another language

In Markdown mode, the toolbar's **Copy Markdown** and **View as Markdown** actions are replaced by a single **View this page as .md** button shown next to the toolbar, which opens the same clean Markdown. You can also reach it directly by adding `.md` to any page URL.

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

### AI mode entry point

Every documentation page can be switched to **AI mode** using the mode selector at the top of the page (next to **Elegant mode** and **Markdown mode**). AI mode splits the page into two columns: the documentation content on the left, and an AI assistant panel on the right.

The panel shows an AI-generated summary of the current page and a question box, so you can read the page and ask questions about it side by side, without leaving the page or opening a separate window. Questions are answered with the same Kapa-powered chatbot, scoped to the page you are reading.

To leave AI mode, switch back to **Elegant mode** or **Markdown mode** with the mode selector, or click the <Icon name="x"/> in the upper-right corner of the AI panel.

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

## MCP servers {#mcp}

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that lets AI tools interact with external services. 2 MCP servers are available for Strapi:

<CustomDocCardsWrapper>
<CustomDocCard icon="feather" title="Strapi MCP server" description="Connect AI clients to your Strapi instance to manage content through natural language." link="/cms/features/strapi-mcp-server" />
<CustomDocCard icon="book-open" title="Docs MCP server" description="Connect the Strapi documentation to your IDE for up-to-date, reliable information." link="/cms/ai/docs-mcp-server" />
</CustomDocCardsWrapper>

## Tips for better results {#tips}

The following tips will help you fine-tune your prompts to get the best results:
- Use the [Docs MCP server](/cms/ai/docs-mcp-server) in your IDE for the fastest developer experience. For docs-related questions, prefix your prompt with `Use the strapi-docs MCP server to answer:` so the tool queries docs.strapi.io instead of using potentially outdated training data.
- Include the page URL so the assistant grounds its answer in the right context.
- Mention your Strapi version (e.g., Strapi 5) to avoid outdated suggestions.
- Pair code examples with their source page when sharing snippets from `llms-code.txt`.
- Prefer documented APIs over private internals when asking for code generation.
