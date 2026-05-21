---
title: MCP server
displayed_sidebar: cmsSidebar
description: Expose content management tools to AI clients through a built-in MCP server.
tags:
  - features
  - ai
  - MCP
  - content management
toc_max_heading_level: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP server
<VersionBadge version="5.48.0"/>

<Tldr>

Strapi includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. Once enabled, it lets AI clients create, read, update, delete, publish, and unpublish content directly through Strapi's Content Manager. All operations are gated by admin token permissions.

</Tldr>

The MCP server exposes a set of content management tools to AI clients such as Claude Desktop, Claude Code, Cursor, or any MCP-compatible tool. An AI assistant connected to the MCP server can, for example, create a blog article, list recent entries, or publish a page. Which tools are available depends on the permissions granted to the admin token used for authentication.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Admin (token creator)</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Server configuration</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

## Configuration

Before first use, the Strapi MCP server must be:
- configured in Strapi through the server configuration file and authenticated with Admin tokens created in the admin panel
- connected to your AI client.

### Strapi admin panel configuration

The MCP server authenticates requests using Admin tokens. Each MCP session is scoped to the permissions of the token used to connect:

1. Create a new admin token (see [Creating an admin token](/cms/features/admin-tokens#creating-a-new-admin-token) on the Admin tokens feature page).
2. Copy the token as you will need it 

The token's permissions determine which MCP tools are exposed to the AI client. For instance, if the token only grants `read` on an `Article` content-type, the AI client will only see listing and reading tools for articles.

### Strapi code-based configuration

Enable the MCP server by adding the `mcp` object to the server configuration file:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // highlight-start
  mcp: {
    enabled: true,
  },
  // highlight-end
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

Once the setting is in place, restart Strapi. The MCP endpoint becomes available at `/mcp` on your Strapi server (e.g., `http://localhost:1337/mcp`).

#### Advanced options

The following optional keys can be added to the `mcp` configuration object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | Boolean | `false` | Enable or disable the MCP server. |
| `connectTimeoutMs` | Number | `5000` | Maximum time (in ms) for the internal MCP transport to connect before the request is aborted. |
| `requestTimeoutMs` | Number | `60000` | Maximum time (in ms) for a single MCP request to complete before it times out. |

```js title="config/server.js"
mcp: {
  enabled: true,
  connectTimeoutMs: 10000, // 10 seconds
  requestTimeoutMs: 120000, // 2 minutes
},
```

### AI client configuration

Once you enabled and configured the MCP server through Strapi's admin panel (admin tokens) and configuration filters, you must connect your AI client to the Strapi MCP server.

:::note
`localhost:1337/` is used in configuration examples on this page. If your Strapi server is hosted on another URL or port, please update the code accordingly.
:::

#### Connecting Claude Desktop

Open Claude Desktop's configuration file. The location varies depending on your system:

| OS | File location |
|----|---------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

:::tip
You can also open the configuration file for Claude Desktop from Claude's settings: go to Settings > Desktop app > Developer, then click on the **Edit config** button.
:::

Add the Strapi MCP server to Claude's configuration file, as in the following example, replacing `YOUR_ADMIN_TOKEN` with the admin token value copied from the [admin panel](#strapi-admin-panel-configuration):

```json title="claude_desktop_config.json"
{
  "mcpServers": {
    "strapi-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:1337/mcp",
        "--header",
        "Authorization: Bearer YOUR_ADMIN_TOKEN"
      ]
    }
  }
}
```

Restart Claude Desktop for the changes to take effect.

#### Connecting Claude Code

Run the following command, replacing `YOUR_ADMIN_TOKEN` with the admin token value copied from the [admin panel](#strapi-admin-panel-configuration):

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Restart Claude Code, then run `/mcp` to confirm `strapi-mcp` reports as connected.

#### Connecting Cursor

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

#### Connecting Windsurf

Add the server to your `~/.codeium/windsurf/mcp_config.json` file:

```json title="~/.codeium/windsurf/mcp_config.json"
{
  "mcpServers": {
    "strapi-mcp": {
      "serverUrl": "http://localhost:1337/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ADMIN_TOKEN"
      }
    }
  }
}
```

#### Connecting other MCP clients

Any client that supports the MCP Streamable HTTP transport can connect. The generic configuration is as follows:

| Setting | Value |
|---------|-------|
| Transport type | `streamable-http` |
| URL | `http://localhost:1337/mcp` (adjust host and port to your Strapi instance) |
| Authorization header | `Bearer YOUR_ADMIN_TOKEN` |

## Usage

The MCP server uses the Streamable HTTP transport protocol. Any MCP-compatible client can connect by pointing to the `/mcp` endpoint with a `Bearer` token in the `Authorization` header. Once connected, the AI client can interact with your Strapi content using natural language prompts.

### Available tools

#### Content-type tools

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

#### Built-in utility tools

In addition to content-type tools, Strapi registers the following built-in tools:

| Tool | Availability | Description |
|------|-------------|-------------|
| `log` | Development mode only | Logs a message to the Strapi server console at a specified level (`info`, `warn`, `error`, `http`, `log`). Useful for debugging MCP interactions. |

Built-in utility tools are only available in development mode (when `autoReload` is enabled) and do not require specific content-type permissions.

### Managing content through prompts

Once connected, you can interact with your Strapi content using natural language:

| Prompt | What happens |
|--------|-------------|
| "Create a new article titled 'Hello World' with body 'First post'." | Creates a draft article entry |
| "List the 5 most recent articles." | Returns paginated list, newest first |
| "Show me article with ID abc123." | Returns the full entry |
| "Update article abc123, change the title to 'Hello Strapi'." | Updates the title, other fields untouched |
| "Publish article abc123." | Flips the entry status to published |
| "Delete article abc123." | Removes the entry |

### Understanding input schemas

Each tool has an input schema derived from your content type's attributes. The schema is dynamically generated per session based on the token's permissions:

- **Field-level permissions**: If the token restricts access to certain fields, those fields are excluded from both input and output schemas. For instance, a token that can only read `title` and `slug` on an `Article` type will only see those two fields in sort, filter, and output schemas.
- **Locale-level permissions**: If the [Internationalization (i18n)](/cms/features/internationalization) plugin is installed and the token restricts access to certain locales, the `locale` parameter only accepts the permitted locales for each action. Locale restrictions are evaluated per action: a token might allow reading in `en` and `fr` but only creating in `en`.
- **Write operations**: The `data` object in `create` and `update` tools only includes fields the token has permission to write. Unknown fields are rejected (strict validation). System-managed fields (`id`, `documentId`, `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`) and private fields are excluded automatically.
- **Attribute type mapping**: Field schemas carry constraints from your content-type definition, such as `required`, `minLength`, `maxLength`, `min`, `max`, and `enum` values. Enumeration fields expose their allowed values in the schema so the AI client can pick valid options.

#### Sorting

The `list` tool accepts a `sort` parameter that supports four notations:

| Notation | Example |
|----------|---------|
| String | `"title:asc"` |
| Array of strings | `["title:asc", "createdAt:desc"]` |
| Object | `{ "title": "asc" }` |
| Array of objects | `[{ "title": "asc" }, { "createdAt": "desc" }]` |

Sort field names are constrained to the content type's scalar attributes (strings, numbers, booleans, dates, enumerations). Relation, component, dynamic zone, media, and JSON fields cannot be sorted on.

#### Filtering

The `list` tool accepts a `filters` parameter using Strapi's filter syntax:

- **Field operators**: `$eq`, `$ne`, `$in`, `$notIn`, `$lt`, `$lte`, `$gt`, `$gte`, `$contains`, `$notContains`, `$startsWith`, `$endsWith`, `$null`, `$notNull`, and their case-insensitive variants (`$eqi`, `$nei`, `$containsi`, etc.).
- **Logical operators**: `$and`, `$or` (accept arrays of filter objects), `$not` (wraps a single filter object).
- **Implicit equality**: Passing a value directly (e.g., `{ "title": "Hello" }`) is equivalent to `{ "title": { "$eq": "Hello" } }`.

Like sort fields, filter fields are constrained to scalar attributes only.

#### Pagination

The `list` tool also accepts `page` (1-indexed, default: 1) and `pageSize` (default: 25, max: 100) parameters.

#### Rich text (blocks)

Rich text fields using the [Blocks editor](/cms/features/content-type-builder#rich-text-blocks) are represented with a structured schema in tool definitions. The schema covers all block types: paragraphs, headings (levels 1–6), quotes, code blocks (with optional language), ordered and unordered lists (including nested lists), images, and inline nodes (text with formatting marks, links).

### Permission boundaries

The MCP server enforces the same permission model as the Strapi admin panel. Permissions are checked at multiple levels:

1. **Tool visibility**: When an AI client connects, Strapi checks the admin token's permissions and only exposes tools the token has access to. If the token does not grant `delete` on `Article`, the AI client will not see a delete tool for articles at all.

2. **Field filtering**: Even within an exposed tool, input and output schemas are narrowed to the fields the token can access. If the token grants `read` on `Article` but excludes the `body` field, the AI client will not see or receive `body` content. Field restrictions are applied independently per action: write schemas (`create`, `update`) only include fields permitted for the corresponding action.

3. **Locale filtering**: When the [Internationalization (i18n)](/cms/features/internationalization) plugin is installed and locale-level permissions are configured, the `locale` parameter is narrowed per action. For example, a token might allow reading content in `en` and `fr` but only creating content in `en`. If the default locale is permitted for a given action, it is applied as the Zod schema default so the AI client does not need to specify it explicitly.

4. **Runtime enforcement**: Beyond schema-level narrowing, each handler calls Strapi's permission checker at runtime to verify access on the specific document being read, written, or published. Condition-based permissions (e.g., "only update entries you own") are enforced at this level.

This means you can create tokens with fine-grained access:

- A "read-only" token that only exposes listing and reading tools
- A token scoped to specific content types (e.g., articles but not categories)
- A token restricted to specific fields or locales
- A token with condition-based permissions (e.g., only update entries you own)

:::tip
Create dedicated admin tokens for each AI client or use case. Use the most restrictive permissions that still allow the AI to accomplish its task.
:::

### Stateless architecture

The MCP server uses a stateless architecture. Each POST request to the `/mcp` endpoint creates a fresh, ephemeral MCP server instance scoped to the authenticated token's permissions. There is no session persistence between requests: every request is independently authenticated and authorized. This design means the AI client does not need to manage session IDs, and permission changes (such as revoking a token or updating its permissions) take effect on the next request.

GET and DELETE HTTP methods on the `/mcp` endpoint return a `405 Method Not Allowed` JSON-RPC error, as the MCP server only accepts POST requests.

### Known limitations

The MCP server has the following limitations:

- **Components**: Component fields are passed as untyped (`any`) in tool schemas. The AI client can read and write component data, but the schema does not describe the component's internal structure.
- **Dynamic zones**: Dynamic zone fields are passed as untyped arrays in tool schemas.
- **Relations**: Relation fields accept document IDs (e.g., `"z7v8zma53x01r6oceimv922b"`) as input. The advanced `connect`/`disconnect` relation syntax is not yet supported in MCP tool schemas.
- **Nested population parameters**: The `list` and `get` tools do not support nested population parameters for relations.
- **Media upload**: Media fields accept existing media asset references but the MCP server cannot upload new files. Use Strapi's media library or upload API to add files first, then reference them in MCP tool calls.
- **Custom fields**: Custom fields registered via plugins are mapped to their underlying Strapi type. If the custom field registry is not populated when MCP tools are registered, the field falls back to `unknown`.
