---
title: MCP server
description: Strapi includes a built-in MCP server that exposes content management tools to AI clients like Claude, Cursor, or any MCP-compatible tool.
sidebar_label: MCP server
displayed_sidebar: cmsSidebar
tags:
  - ai
  - MCP
  - content management
  - API
toc_max_heading_level: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP server <BetaBadge />

<Tldr>

Strapi includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. Once enabled, it lets AI clients (Claude Desktop, Claude Code, Cursor, etc.) create, read, update, delete, publish, and unpublish your content directly through Strapi's Content Manager -- all gated by admin token permissions.

</Tldr>

The MCP server exposes a set of **tools** that map to your content types. An AI assistant connected to the MCP server can, for example, create a blog article, list recent entries, or publish a page -- all through natural language prompts. Which tools are available depends on the permissions granted to the admin token used for authentication.

:::note
The MCP server is an experimental feature. It requires the `adminTokens` feature flag and a Strapi version that includes MCP support.
:::

<IdentityCard>
  <IdentityCardItem icon="feather" title="Plan" value="All plans" />
  <IdentityCardItem icon="user-check" title="Role" value="Admin (token creator)" />
  <IdentityCardItem icon="toggle-right" title="Activation" value="Server configuration + feature flag" />
  <IdentityCardItem icon="server" title="Environment" value="Development & Production" />
</IdentityCard>

## Configuration

Enabling the MCP server requires two steps: turning on the `adminTokens` feature flag and enabling MCP in the server configuration.

### Enable the feature flag

The MCP server relies on Strapi's admin tokens feature. Enable it in the `config/features` configuration file:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="config/features.js"
module.exports = {
  future: {
    adminTokens: true,
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="config/features.ts"
export default {
  future: {
    adminTokens: true,
  },
};
```

</TabItem>
</Tabs>

### Enable the MCP server

Add the `mcp` key to the server configuration file:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  mcp: {
    enabled: true,
  },
});
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="config/server.ts"
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  mcp: {
    enabled: true,
  },
});
export default config;
```

</TabItem>
</Tabs>

Once both settings are in place, restart Strapi. The MCP endpoint becomes available at `/mcp` on your Strapi server (e.g., `http://localhost:1337/mcp`).

## Authentication

The MCP server authenticates requests using **admin API tokens**. Each MCP session is scoped to the permissions of the token used to connect.

To create an admin token:

1. In the Strapi admin panel, go to *Settings > API Tokens*.
2. Click **Create new API Token**.
3. Choose **Admin** as the token type.
4. Select the content types and actions (read, create, update, delete, publish) you want the AI client to access.
5. Save the token and copy it -- it will not be shown again.

The token's permissions determine which MCP tools are exposed to the AI client. For instance, if the token only grants `read` on `Article`, the AI client will only see listing and reading tools for articles -- no create, update, delete, or publish tools.

:::caution
Treat admin tokens like passwords. Do not commit them to version control or share them publicly. Use environment variables when possible.
:::

## Connecting an AI client

The MCP server uses the **Streamable HTTP** transport protocol. Any MCP-compatible client can connect by pointing to the `/mcp` endpoint with a `Bearer` token in the `Authorization` header.

### Claude Desktop

Open Claude Desktop's configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

You can also open this file from Claude's Settings > Developer (click the Edit Config button).

Add the Strapi MCP server to the configuration:

```json title="claude_desktop_config.json"
{
  "mcpServers": {
    "strapi-mcp": {
      "type": "streamable-http",
      "url": "http://localhost:1337/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ADMIN_TOKEN"
      }
    }
  }
}
```

Restart Claude Desktop for the changes to take effect.

### Claude Code

Run the following command, replacing `YOUR_ADMIN_TOKEN` with the token created earlier:

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Restart Claude Code, then run `/mcp` to confirm `strapi-mcp` reports as connected.

### Cursor

Add the server to your `.cursor/mcp.json` file:

```json title=".cursor/mcp.json"
{
  "mcpServers": {
    "strapi-mcp": {
      "type": "streamable-http",
      "url": "http://localhost:1337/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ADMIN_TOKEN"
      }
    }
  }
}
```

### Other MCP clients

Any client that supports the MCP Streamable HTTP transport can connect. The generic configuration is:

| Setting | Value |
|---------|-------|
| Transport type | `streamable-http` |
| URL | `http://localhost:1337/mcp` (adjust host and port to your Strapi instance) |
| Authorization header | `Bearer YOUR_ADMIN_TOKEN` |

## Available tools

Once connected, the AI client receives a set of **content management tools** derived from your content types. The tools available depend on the admin token's permissions.

### Tools per content type

For each content type the token has access to, Strapi generates up to 8 tools:

| Tool | Action | Permission required | Description |
|------|--------|-------------------|-------------|
| `list` | Read | `read` | List entries with pagination, sorting, and filtering |
| `get` | Read | `read` | Get a single entry by document ID |
| `create` | Create | `create` | Create a new entry (created as draft if Draft & Publish is enabled) |
| `update` | Update | `update` | Update an existing entry by document ID |
| `delete` | Delete | `delete` | Delete an entry by document ID |
| `publish` | Publish | `publish` | Publish a draft entry |
| `unpublish` | Unpublish | `publish` | Unpublish a published entry |
| `discard_draft` | Discard draft | `publish` | Discard draft changes and revert to the published version |

The last 3 tools (publish, unpublish, discard_draft) are only generated for content types that have [Draft & Publish](/cms/features/draft-and-publish) enabled.

Tool names follow the pattern `cm_<namespace>_<model>_<action>`. For example, an `Article` content type with UID `api::article.article` generates tools named `cm_api_article_list`, `cm_api_article_get`, `cm_api_article_create`, etc.

Single types follow a similar pattern but include `_single_` in the name (e.g., `cm_api_homepage_single_get`).

### Input schemas

Each tool has an input schema derived from your content type's attributes. The schema is dynamically adjusted per session based on the token's permissions:

- **Field-level permissions**: If the token restricts access to certain fields, those fields are excluded from both input and output schemas.
- **Locale-level permissions**: If the token restricts access to certain locales, the `locale` parameter only accepts permitted locales.
- **Write operations**: The `data` object only includes fields the token has permission to write. Unknown fields are rejected.

For the `list` tool, the input schema also includes parameters for pagination (`page`, `pageSize`), sorting (`sort`), and filtering (`filters`).

### Example prompts

Once connected, you can interact with your Strapi content using natural language:

| Prompt | What happens |
|--------|-------------|
| "Create a new article titled 'Hello World' with body 'First post'." | Creates a draft article entry |
| "List the 5 most recent articles." | Returns paginated list, newest first |
| "Show me article with ID abc123." | Returns the full entry |
| "Update article abc123 -- change the title to 'Hello Strapi'." | Updates the title, other fields untouched |
| "Publish article abc123." | Flips the entry status to published |
| "Delete article abc123." | Removes the entry |

## Permission boundaries

The MCP server enforces the same permission model as the Strapi admin panel. Permissions are checked at two levels:

1. **Tool visibility**: When an AI client connects, Strapi checks the admin token's permissions and only exposes tools the token has access to. If the token does not grant `delete` on `Article`, the AI client will not see a delete tool for articles at all.

2. **Field and locale filtering**: Even within an exposed tool, input and output schemas are narrowed to the fields and locales the token can access. If the token grants `read` on `Article` but excludes the `body` field, the AI client will not see or receive `body` content.

This means you can create tokens with fine-grained access:

- A "read-only" token that only exposes listing and reading tools
- A token scoped to specific content types (e.g., articles but not categories)
- A token restricted to specific fields or locales
- A token with condition-based permissions (e.g., only update entries you own)

:::tip
Create dedicated admin tokens for each AI client or use case. Use the most restrictive permissions that still allow the AI to accomplish its task.
:::

## Known limitations

The MCP server is experimental and has the following limitations:

- **Block content**: Rich text block content is not represented in tool definitions.
- **Components**: Component fields are passed as untyped (`any`) in tool schemas.
- **Dynamic zones**: Dynamic zone fields are passed as untyped arrays in tool schemas.
- **Nested population parameters**: The `list` and `get` tools do not support nested population parameters for relations.
- **Stateless sessions**: Each MCP request creates a new server instance. There is no session persistence between requests.
