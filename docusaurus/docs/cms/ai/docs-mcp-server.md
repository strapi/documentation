---
title: Docs MCP server
description: Connect an MCP server for the Strapi documentation to your IDE for Strapi-aware code suggestions and answers.
sidebar_label: Docs MCP server
displayed_sidebar: cmsSidebar
tags:
  - ai
  - MCP
  - developer tools
toc_max_heading_level: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Docs MCP server

<Tldr>

A Docs MCP server exposes the Strapi documentation to AI coding tools. Connect it to your IDE to get Strapi-aware code suggestions and answers directly in your development environment.

</Tldr>

The Docs [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server is powered by [Kapa](https://kapa.ai) and draws from the full Strapi documentation, including guides, API references, and code examples. The Docs MCP server is part of the [AI tools for developers](/cms/ai/for-developers) that Strapi offers.

:::strapi MCP servers for Strapi
Strapi offers 2 different MCP servers:

- the Docs MCP server, covered on the present page,
- and the Strapi MCP for content management, covered on its [dedicated feature page](/cms/features/strapi-mcp-server).
:::

## Compatible tools

The MCP server works with any tool that supports the MCP protocol, including:

- [Cursor](https://cursor.com)
- [VS Code](https://code.visualstudio.com) with GitHub Copilot
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Windsurf](https://codeium.com/windsurf)
- Any other MCP-compatible IDE or tool

## Connection details

When opening the Ask AI window, you should see a **Use MCP** dropdown in the top right corner. Click on it and choose which tool you'd like to connect:

<ThemedImage
  alt="Ask AI modal with Use MCP options highlighted"
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
    <TabItem value="windsurf" label="Windsurf">

    Add to your `~/.codeium/windsurf/mcp_config.json` file:

    ```json title="~/.codeium/windsurf/mcp_config.json"
    {
      "mcpServers": {
        "strapi-docs": {
          "serverUrl": "https://strapi-docs.mcp.kapa.ai"
        }
      }
    }
    ```

    </TabItem>
    </Tabs>

Once connected, your AI coding assistant can query the Strapi documentation directly to answer questions, suggest implementations, and verify API usage.

:::tip
For docs-related questions, start your prompts with `Use the strapi-docs MCP server to answer:`. This will ensure the tool queries docs.strapi.io instead of returning answers based on its training data, which can be outdated.
:::