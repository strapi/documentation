---
title: MCP server
description: The Strapi MCP server exposes a built-in Model Context Protocol endpoint that lets AI coding agents read and write Strapi content directly from an IDE.
displayed_sidebar: cmsSidebar
tags:
  - features
  - ai
  - mcp
  - admin tokens
---

# MCP server

<Tldr>
Strapi includes a built-in Model Context Protocol (MCP) server. Enable it in your server configuration, authenticate with an admin API token, and connect any MCP-compatible tool to read and write content directly from your IDE.
</Tldr>

The MCP server is a stateless HTTP endpoint embedded in Strapi core that implements the [Model Context Protocol](https://modelcontextprotocol.io/) JSON-RPC 2.0 specification. It allows AI coding agents such as Cursor, GitHub Copilot, or Claude Code to interact with a running Strapi instance directly from the IDE, without a third-party bridge.

Each request to `POST /mcp` authenticates the caller via an admin API token, evaluates RBAC permissions, and processes the JSON-RPC payload in a fresh server context. No server-side sessions are maintained between requests.

<!-- unverified: plan availability not specified in PR 26371 source material -->

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Requires a valid admin API token</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Disabled by default. Enable with `mcp.enabled: true` in the server configuration file</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development and Production environments</IdentityCardItem>
</IdentityCard>

## Configuration

The MCP server has no admin panel configuration. Enable and configure it in the server configuration file.

### Code-based configuration

Add an `mcp` key to your `./config/server` file with at minimum `enabled: true`:

<!-- source: packages/core/core/src/services/mcp/ and @strapi/types McpConfig -->
<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="./config/server.js"
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
<TabItem value="ts" label="TypeScript">

```ts title="./config/server.ts"
export default ({ env }) => ({
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
</Tabs>

The following options are available under the `mcp` key:

<!-- source: @strapi/types McpConfig -->
| Parameter | Description | Type | Default |
|---|---|---|---|
| `mcp.enabled` | Enables the MCP endpoint at `POST /mcp`. | boolean | `false` |
| `mcp.connectTimeoutMs` | Maximum time in milliseconds allowed for a connection to establish. | integer | `5000` |
| `mcp.requestTimeoutMs` | Maximum time in milliseconds allowed for a single request to complete. | integer | `60000` |

:::note
Changing `./config/server` requires rebuilding the admin panel. Run `yarn build` or `npm run build` after saving the file.
:::

## Usage

Once enabled, the MCP server listens at `POST /mcp` on your Strapi host. Authenticate requests with an admin API token and connect any MCP-compatible tool to start reading and writing content.

### Connecting an MCP client

To connect an MCP-compatible tool such as Cursor, Claude Code, or the MCP Inspector:

1. Start your Strapi instance with `yarn develop` or `npm run develop`.
2. Open the admin panel and navigate to **Settings > Admin API Tokens**.
3. Create a new token with the permissions matching what you want the AI agent to access. Copy the `accessKey` value shown at creation.
4. Configure your MCP client to point to `http://localhost:1337/mcp` and pass the token as a `Bearer` header.

<!-- unverified: MCP client JSON config shape not in PR source; based on MCP spec and existing docs MCP examples -->
<Tabs>
<TabItem value="cursor" label="Cursor">

Add to your `.cursor/mcp.json` file:

```json title=".cursor/mcp.json"
{
  "mcpServers": {
    "strapi": {
      "url": "http://localhost:1337/mcp",
      "headers": {
        "Authorization": "Bearer your_access_key"
      }
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
    "strapi": {
      "type": "http",
      "url": "http://localhost:1337/mcp",
      "headers": {
        "Authorization": "Bearer your_access_key"
      }
    }
  }
}
```

</TabItem>
</Tabs>

Replace `your_access_key` with the token value generated in step 3.

### Authentication

Every request to the MCP server must include a `Bearer` token in the `Authorization` header. The token must be an [admin API token](/cms/features/admin-tokens) of kind `admin`.

<!-- source: packages/core/admin/src/services/api-token.ts authenticateAdminToken -->
The MCP server validates the token on each request. Validation checks that:

- The token exists and is of kind `admin`.
- The token is not expired.
- The token belongs to an active user account.

On successful authentication, the token's `lastUsedAt` timestamp is updated. If validation fails, the server returns a `401` response with an `AUTHENTICATION_REQUIRED` error.

The MCP server does not use Strapi's built-in route-level authentication. The MCP layer handles authentication entirely.

:::caution
Keep your admin API token secret. Anyone who has access to the token can read and write content within the permission scope of the token owner's roles.
:::

### Available content-type tools

When the MCP server receives a `tools/list` request, it returns 1 set of tools per displayed content type. The tools available depend on the content-type kind and the caller's RBAC permissions.

<!-- source: packages/core/content-manager/server/src/mcp/ -->

**Collection types** expose the following tools, where `{slug}` is the content-type's API ID:

| Tool | Description |
|------|-------------|
| `find_{slug}` | Retrieve a list of entries |
| `find_one_{slug}` | Retrieve a single entry by document ID |
| `create_{slug}` | Create a new entry |
| `update_{slug}` | Update an existing entry |
| `delete_{slug}` | Delete an entry |
| `publish_{slug}` | Publish an entry |
| `unpublish_{slug}` | Unpublish an entry |

**Single types** expose:

| Tool | Description |
|------|-------------|
| `find_{slug}` | Retrieve the document |
| `write_{slug}` | Create or update the document (upsert) |
| `delete_{slug}` | Delete the document |
| `publish_{slug}` | Publish the document |
| `unpublish_{slug}` | Unpublish the document |

RBAC rules are applied per request:

- A tool only appears in `tools/list` when the token has the required permission for that action on the content type.
- Field-restricted roles see a narrowed input schema. Disallowed fields are absent from the schema and stripped from Document Service calls.
- For localized content types, the `locale` parameter is restricted to only the locales the token owner may access for the given action.

### Registering custom tools from a plugin

Plugins can register additional tools, prompts, and resources on the MCP server during the Strapi `register()` lifecycle using `strapi.ai.mcp`:

<!-- source: packages/core/core/src/services/mcp/index.ts McpService -->
```js title="./src/plugins/my-plugin/server/register.js"
module.exports = ({ strapi }) => {
  strapi.ai.mcp.registerTool('my-custom-tool', {
    description: 'Description shown to the AI agent',
    inputSchema: z.object({
      // Zod schema for the tool input
    }),
    handler: async (input, context) => {
      // Tool implementation
    },
    access: { auth: { action: 'plugin::my-plugin.some-action' } },
  });
};
```

You can also use `strapi.ai.mcp.registerPrompt()` and `strapi.ai.mcp.registerResource()` for prompts and resources respectively.

Registration must happen during `register()`. Capability registration is locked once the MCP server starts. Tools registered after startup are ignored.

:::note
A built-in `log` tool is registered automatically and is only visible in development mode (when `autoReload` is `true`). It is not available in production.
:::

<!-- drafter:notes
- TODO: Confirm plan availability (Free vs. paid) with product team — marked as Free feature based on it being in core, but unconfirmed
- TODO: Add screenshot of Admin API Token creation if admin panel screenshot guidelines apply
- TODO: Verify MCP client JSON config format against latest Cursor/VS Code MCP spec
-->
