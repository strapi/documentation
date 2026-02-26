---
title: AI tools in Strapi docs
description: One place to discover and use all AI-related helpers available on the Strapi documentation site.
tags:
- ai
- llms
- productivity
toc_max_heading_level: 3
---

<Tldr>
Use this page to quickly find and use AI helpers across the Strapi docs: copy a page’s Markdown, open a chat prefilled with context, or retrieve purpose‑built text files for LLMs.
</Tldr>

# AI tools in Strapi docs

Strapi documentation includes a few AI‑oriented helpers designed to make it easier to ask questions about the docs, learn from code examples, and share focused context with an assistant.

All AI options live in the AI toolbar at the top of each documentation page. From there, you can copy the current page as raw Markdown, open a new chat in your preferred assistant with the page prefilled as context, or open text files tailored for LLMs.

Use Copy Markdown when you want an assistant to reason over the exact source of the page you are reading. This copies the raw Markdown to your clipboard so you can paste it into a chat or IDE assistant.

When you need site‑wide context, prefer one of the LLMs files:
- LLMs.txt provides a concise, link‑rich overview of pages. Open `/llms.txt` to get a lightweight map of the docs that you can copy or share with an assistant as high‑level context.
- LLMs-full.txt contains the entire documentation in a single file. Open `/llms-full.txt` when full‑site context is required. The file is large.
- LLMs-code.txt extracts all code examples, grouped by page and section with language and file‑path hints. Open `/llms-code.txt` for code‑centric work (migrations, refactors, API discovery). Pair examples with their page URL for best results.

To start a conversation without copy‑pasting, use the Open with LLM buttons in the toolbar. “Open with ChatGPT” and “Open with Claude” open a new tab and prefill a brief prompt that references the current page (often in your browser language). This is the fastest way to ask, “Read this page so I can ask questions about it.”

## Tips for better results

- Include the page URL: Reference the exact page (and section anchor, if relevant) so the assistant grounds its answer.
- Be explicit about Strapi version: Mention Strapi v5 (or your version) and plugin versions to avoid outdated code.
- Pair examples with context: If you share a code snippet from `/llms-code.txt`, also link the page it comes from.
- Ask for “explain first, then propose”: Request an explanation of the docs’ guidance before asking for code.

## Guidance for IDE AI tools (Cursor, Copilot, etc.)

If your IDE assistant struggles to generate correct Strapi code (for example, custom backend code or plugin services):

- Start from docs: Provide the assistant with the page URL and a relevant code example from `/llms-code.txt`.
- Clarify the goal and constraints: Describe your use case, expected inputs/outputs, and that you are targeting Strapi v5.
- Prefer public extension points: Ask for solutions using documented APIs (controllers, services, middlewares, policies, and plugin extension points) instead of relying on private internals.
- Verify against the docs: Ask the assistant to cite the pages or sections it relied on.

Related request: see the discussion about improving AI outcomes with Strapi code generation in the issue tracker.

## Kapa chatbot

The Strapi docs include an integrated Kapa chatbot to help you explore topics and code examples without leaving the page.

- Sidebar entry point: Click Ask AI in the left sidebar (next to search) to open the Kapa panel and start a conversation about anything in the docs.
- Code‑block entry point: Hover any substantial code block and click Ask AI to ask for an explanation or adaptation of that snippet.
- Deep thinking mode: For more thorough answers, enable Kapa’s deep thinking mode (slower, but better for multi‑step reasoning or complex refactors).

For admin‑panel AI features and settings, see the Strapi AI section of the Admin panel configuration page: /cms/configurations/admin-panel#strapi-ai.

:::info Privacy note
When you copy or share documentation content with third‑party tools, ensure you handle data safely and follow your organization’s policies.
:::
