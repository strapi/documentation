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

# MCP server
<VersionBadge version="5.47.0"/>

<Tldr>

Strapi includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. Once enabled, it lets AI clients create, read, update, delete, publish, and unpublish content directly through Strapi's Content Manager. All operations are gated by Admin token permissions.

</Tldr>

The MCP server exposes a set of content management tools to AI clients such as Claude Desktop, Claude Code, Cursor, or any MCP-compatible tool. An AI client connected to the MCP server can, for example, create a blog article, list recent entries, or publish a page. Which tools are available depends on the permissions granted to the Admin token used for authentication.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Admin (token creator)</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Server configuration</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

## Configuration

Before first use, the Strapi MCP server must be:
- enabled through the server configuration file and authenticated with Admin tokens created in the admin panel
- connected to your AI client.

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
  // highlight-start
  mcp: {
    enabled: true,
  },
  // highlight-end
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


### Strapi admin panel configuration

The MCP server authenticates requests using Admin tokens. Each MCP session is scoped to the permissions of the token used to connect:

1. Create a new Admin token (see [Creating an Admin token](/cms/features/admin-tokens#creating-a-new-admin-token) on the Admin tokens feature page).
2. Copy the token value. You will need it when configuring the AI client.

The token's permissions determine which MCP tools are exposed to the AI client. For instance, if the token only grants `read` on an `Article` content-type, the AI client will only see listing and reading tools for articles.

### AI client configuration

Once you have enabled the MCP server through the server configuration file and created an Admin token in the admin panel, connect your AI client to the Strapi MCP server.

:::note
`http://localhost:1337/` is used in configuration examples on this page. If your Strapi server is hosted on another URL or port, please update the code accordingly.
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

Add the Strapi MCP server to Claude's configuration file, as in the following example, replacing `YOUR_ADMIN_TOKEN` with the Admin token value copied from the [Strapi admin panel configuration](#strapi-admin-panel-configuration):

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

Run the following command, replacing `YOUR_ADMIN_TOKEN` with the Admin token value copied from the [Strapi admin panel configuration](#strapi-admin-panel-configuration):

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

The MCP server exposes 2 categories of tools: content-type tools generated from your schema, and built-in utility tools.

#### Content-type tools

The tools generated differ depending on whether the content type is a collection type or a single type.

**Collection types** generate up to 8 tools: 5 for CRUD operations and 3 for [Draft & Publish](/cms/features/draft-and-publish) actions:

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

**Single types** generate up to 6 tools. Because a single type always represents exactly one document, there is no `list` tool and create/update are merged into a single `write` tool:

| Tool | Action | Permission required | Description |
|------|--------|-------------------|-------------|
| `get` | Read | `read` | Get the single-type document |
| `write` | Create or update | `create` and/or `update` | Create the document if none exists; update the existing draft otherwise |
| `delete` | Delete | `delete` | Delete the single-type document |
| `publish` | Publish | `publish` | Publish the document |
| `unpublish` | Unpublish | `publish` | Unpublish the published document |
| `discard_draft` | Discard draft | `publish` | Discard draft changes and revert to the published version |

The publish, unpublish, and discard_draft tools are only generated when [Draft & Publish](/cms/features/draft-and-publish) is enabled on the content type.


#### Built-in utility tools

In addition to content-type tools, Strapi registers the following built-in tools:

| Tool | Availability | Description |
|------|-------------|-------------|
| `log` | Development mode only | Logs a message to the Strapi server console at a specified level (`info`, `warn`, `error`, `http`, `log`). Useful for debugging MCP interactions. |

Built-in utility tools are only available in development mode (when `autoReload` is enabled) and do not require specific admin permissions.

### Content management through prompts

Once connected, you can interact with your Strapi content using natural language:

| Prompt | What happens |
|--------|-------------|
| "Create a new article titled 'Hello World' with body 'First post'." | Creates a draft article entry |
| "List the 5 most recent articles." | Returns paginated list, newest first |
| "Show me article with ID abc123." | Returns the full entry |
| "Update article abc123, change the title to 'Hello Strapi'." | Updates the title, other fields untouched |
| "Publish article abc123." | Changes the entry status to published |
| "Delete article abc123." | Removes the entry |
| "Create an article in French with the title 'Bonjour le monde'." | Creates a draft article with `locale` set to `fr` |


#### Internationalization (i18n)

When [Internationalization (i18n)](/cms/features/internationalization) is enabled on a content type, MCP tools accept an optional `locale` parameter (e.g., `"en"`, `"fr"`). If omitted, the default locale is used.

The AI client sees which locales are available in each tool's schema, so you can ask it to create or update content in a specific language. For example, asking "Create an article in French titled 'Bonjour'" passes `locale: "fr"` to the `create` tool. Which locales are available depends on the Admin token's permissions (see [Permission boundaries](#permission-boundaries)).

:::tip
When working with localized content, explicitly mention the target language in your prompt so the AI client passes the correct `locale` value. For instance, prefer "Create an article **in French**" over "Create an article titled 'Bonjour'" to avoid ambiguity.
:::

#### Sorting

The `list` tool accepts a `sort` parameter that supports 4 notations:

| Notation | Example |
|----------|---------|
| String | `"title:asc"` |
| Array of strings | `["title:asc", "createdAt:desc"]` |
| Object | `{ "title": "asc" }` |
| Array of objects | `[{ "title": "asc" }, { "createdAt": "desc" }]` |

Sort field names are constrained to the content type's scalar attributes (strings, numbers, booleans, dates, enumerations). Relation, component, dynamic zone, media, and JSON fields cannot be sorted on.

#### Filtering

The `list` tool accepts a `filters` parameter using Strapi's filter syntax:

- **Field operators**: `$eq`, `$ne`, `$in`, `$notIn`, `$lt`, `$lte`, `$gt`, `$gte`, `$between`, `$contains`, `$notContains`, `$startsWith`, `$endsWith`, `$null`, `$notNull`, and their case-insensitive variants (`$eqi`, `$nei`, `$containsi`, `$notContainsi`, `$startsWithi`, `$endsWithi`).
- **Logical operators**: `$and`, `$or` (accept arrays of filter objects), `$not` (wraps a single filter object).
- **Implicit equality**: Passing a value directly (e.g., `{ "title": "Hello" }`) is equivalent to `{ "title": { "$eq": "Hello" } }`.

Like sort fields, filter fields are constrained to scalar attributes only.

#### Pagination

The `list` tool also accepts `page` (1-indexed, default: 1) and `pageSize` (default: 25, max: 100) parameters.

#### Relations

Relation fields support both a shorthand document ID string and a full relation object.

**To-one relations** (`oneToOne`, `manyToOne`) accept:
- A document ID string: `"z7v8zma53x01r6oceimv922b"`
- A relation object: `{ "documentId": "z7v8zma53x01r6oceimv922b", "locale": "en", "status": "draft" }` (`locale` and `status` are optional)
- `null` to clear the relation

**To-many relations** (`oneToMany`, `manyToMany`) accept a relation object with one or more of the following keys:

| Key | Description |
|-----|-------------|
| `connect` | Add relations. Accepts an array of document ID strings or `{ documentId, locale?, status?, position? }` objects. The optional `position` key supports `{ before?, after?, start?, end? }` ordering hints (default: `{ end: true }`). |
| `disconnect` | Remove relations. Accepts an array of document ID strings or `{ documentId, locale?, status? }` objects. |
| `set` | Replace all existing relations with the provided array. Pass `null` to clear all relations. Mutually exclusive with `connect`/`disconnect`. |

### Permission boundaries

The MCP server enforces the same permission model as the Strapi admin panel. Permissions are checked at multiple levels:

1. **Tool visibility**: When an AI client connects, Strapi checks the Admin token's permissions and only exposes tools the token has access to. If the token does not grant `delete` on `Article`, the AI client will not see a delete tool for articles at all.

2. **Field filtering**: Even within an exposed tool, input and output schemas are narrowed to the fields the token can access. If the token grants `read` on `Article` but excludes the `body` field, the AI client will not see or receive `body` content. Field restrictions are applied independently per action. Write schemas (`create`, `update`) only include fields permitted for the corresponding action.

3. **Locale filtering**: When the [Internationalization (i18n)](/cms/features/internationalization) feature is enabled and locale-level permissions are configured, the `locale` parameter is narrowed per action. For example, a token might allow reading content in `en` and `fr` but only creating content in `en`. If the default locale is permitted for a given action, that locale is applied as the Zod schema default, so the AI client does not need to specify a locale explicitly.

4. **Runtime enforcement**: Beyond schema-level narrowing, each handler calls Strapi's permission checker at runtime to verify access on the specific document being read, written, or published. Condition-based permissions (e.g., "only update entries you own") are enforced at this level.

This means you can create tokens with fine-grained access:

- A "read-only" token that only exposes listing and reading tools
- A token scoped to specific content types (e.g., articles but not categories)
- A token restricted to specific fields or locales
- A token with condition-based permissions (e.g., only update entries you own)

:::tip
Create dedicated Admin tokens for each AI client or use case. Use the most restrictive permissions that still allow the AI to accomplish its task.
:::

### Stateless architecture

The MCP server uses a stateless architecture. Each POST request to the `/mcp` endpoint creates a fresh, ephemeral MCP server instance scoped to the authenticated token's permissions. There is no session persistence between requests: every request is independently authenticated and authorized. Because there is no session state, the AI client does not need to manage session IDs, and permission changes (such as revoking a token or updating its permissions) take effect on the next request.

GET and DELETE HTTP methods on the `/mcp` endpoint return a `405 Method Not Allowed` JSON-RPC error, as the MCP server only accepts POST requests.

### Known limitations

The MCP server has the following limitations:

- **Dynamic zones**: Dynamic zone fields are passed as untyped arrays in tool schemas. The internal structure of each component within a dynamic zone is not described.
- **Nested population parameters**: The `list` and `get` tools do not support nested population parameters for relations.
- **Media upload**: Media fields accept existing media asset references but the MCP server cannot upload new files. Use Strapi's media library or upload API to add files first, then reference them in MCP tool calls.
- **Custom fields**: Custom fields registered via plugins are mapped to their underlying Strapi type. If the custom field registry is not populated when MCP tools are registered, the custom field falls back to an `unknown` type.
- **Circular component references**: Components that reference themselves (directly or indirectly) fall back to an open `record<string, unknown>` schema at the point of the cycle, rather than an infinite recursive structure.

### Plugin API

Strapi plugins can register additional MCP tools through the `strapi.ai.mcp` service, so AI clients can trigger plugin-specific actions. Click on the card below to read more details:

<CustomDocCardsWrapper>
<CustomDocCard icon="puzzle-piece" title="Extending the MCP server" description="Register custom MCP tools from a Strapi plugin through the strapi.ai.mcp service." link="/cms/plugins-development/extend-mcp-server" />
</CustomDocCardsWrapper>
