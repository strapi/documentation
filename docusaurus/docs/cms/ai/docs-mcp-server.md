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

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the documentation is available. The Docs MCP server exposes the Strapi documentation to AI coding tools. Connect it to your IDE to get Strapi-aware code suggestions and answers directly in your development environment.

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
    </Tabs>

Once connected, your AI coding assistant can query the Strapi documentation directly to answer questions, suggest implementations, and verify API usage.
