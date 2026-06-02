---
title: Extending the MCP server
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-getters-usage
pagination_next: cms/plugins-development/plugins-extension
description: Register additional MCP tools from a Strapi plugin through the strapi.ai.mcp service.
tags:
  - plugin APIs
  - server API
  - plugins development
  - MCP
  - AI
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Extending the MCP server

<Tldr>
Strapi plugins can register additional MCP tools through the `strapi.ai.mcp` service. Registrations must happen while the MCP server is idle (during the plugin's `register()` or `bootstrap()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the content-type tools generated from your schema, plugins can register their own custom tools so AI clients can trigger plugin-specific actions.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a tool during the plugin's `register()` or `bootstrap()` phase. Prefer `bootstrap()` when a tool depends on synced content-types, permissions, or database state.

## Registering a custom tool

Use `strapi.ai.mcp.registerTool()` to expose a custom tool to AI clients:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { z } = require('@strapi/utils');

module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerTool({
        name: 'my_custom_tool',
        title: 'My Custom Tool',
        description: 'A short description shown to the AI client.',
        auth: {
          // The session gate passes when the token satisfies ANY policy in the array.
          policies: [{ action: 'plugin::my-plugin.my-action' }],
        },
        // resolveInputSchema and resolveOutputSchema are called per request,
        // so they can narrow schemas based on the token's permissions.
        resolveInputSchema: (context) =>
          z.object({
            message: z.string().describe('The message to echo.'),
          }),
        resolveOutputSchema: (context) =>
          z.object({
            result: z.string(),
          }),
        createHandler: (strapi, context) => async ({ args }) => ({
          content: [{ type: 'text', text: args.message }],
          structuredContent: { result: args.message },
        }),
      });
    }
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { z } from '@strapi/utils';

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerTool({
        name: 'my_custom_tool',
        title: 'My Custom Tool',
        description: 'A short description shown to the AI client.',
        auth: {
          // The session gate passes when the token satisfies ANY policy in the array.
          policies: [{ action: 'plugin::my-plugin.my-action' }],
        },
        // resolveInputSchema and resolveOutputSchema are called per request,
        // so they can narrow schemas based on the token's permissions.
        resolveInputSchema: (context) =>
          z.object({
            message: z.string().describe('The message to echo.'),
          }),
        resolveOutputSchema: (context) =>
          z.object({
            result: z.string(),
          }),
        createHandler: (strapi, context) => async ({ args }) => ({
          content: [{ type: 'text', text: args.message }],
          structuredContent: { result: args.message },
        }),
      });
    }
  },
};
```

</TabItem>
</Tabs>

### Tool definition options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | Yes | Unique tool name. Must be unique across all registered MCP tools. |
| `title` | String | Yes | Human-readable title shown to the AI client. |
| `description` | String | Yes | Short description of what the tool does. |
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies **any** policy in the `policies` array. Each policy is `{ action, subject? }`. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the tool to development mode only (equivalent to the built-in `log` tool). |
| `resolveInputSchema` | Function | No | Returns a Zod schema for the tool's input arguments. Called per request so RBAC constraints can be applied dynamically. Omit for tools with no input. |
| `resolveOutputSchema` | Function | Yes | Returns a Zod schema for the tool's structured output. Called per request. |
| `createHandler` | Function | Yes | Factory that returns the async tool handler. Receives the Strapi instance and per-request context (including `userAbility` and `user`). |

:::note
`resolveInputSchema` and `resolveOutputSchema` are called once per incoming MCP request, so you can narrow schemas dynamically based on the token's permissions (via `context.userAbility`).
:::

