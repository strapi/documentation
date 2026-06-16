---
title: Extending the MCP server with plugins
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

# Extending the MCP server with plugins

<Tldr>
Strapi plugins can register additional MCP tools through the `strapi.ai.mcp` service. You can pass capability definitions directly to the `register*()` methods, or author them with the optional `mcp` builder helpers exported from `@strapi/strapi`. Registrations must happen while the MCP server is idle (during the plugin's `register()` or `bootstrap()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the content-type tools generated from your schema, plugins can register their own custom tools so AI clients can trigger plugin-specific actions.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a tool during the plugin's `register()` or `bootstrap()` phase. Prefer `bootstrap()` when a tool depends on synced content-types, permissions, or database state.

There are 2 ways to author a capability: pass a definition object directly to the matching `strapi.ai.mcp.register*()` method, or build that definition with the optional `mcp` builder helpers for stronger TypeScript inference. Both are covered below, starting with the direct registration API the helpers wrap.

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

## Using builder helpers

`@strapi/strapi` exposes a `mcp` namespace (under `ai`) with 3 builder helpers that make MCP definitions easier to author in TypeScript: `mcp.defineTool`, `mcp.defineResource`, and `mcp.definePrompt`. They play the same role for MCP capabilities (tools, prompts, and resources) that `factories` plays for core controllers, services, and routers.

Each helper returns its definition unchanged at runtime: they exist only to help TypeScript. A builder infers the `name`, schemas, and handler types from the object you pass, and narrows the access variant so the result is directly assignable to the matching `strapi.ai.mcp.register*()` method. Without them, you would type each definition by hand against `Modules.MCP.*` from `@strapi/types`.

Every capability must declare exactly one access variant: either `devModeOnly: true` (the capability is available in development mode only, with no authentication) or an `auth` object with at least one policy. Never set both. The builders enforce this constraint at the type level.

The workflow is always the same: define the capability with a builder, then register the result during the plugin's `register()` or `bootstrap()` phase.

### Defining a tool

Use `mcp.defineTool()` to build a tool definition, then pass it to [`strapi.ai.mcp.registerTool()`](#registering-a-custom-tool). It accepts the same fields as a definition passed directly to `registerTool()`, listed in the [tool definition options](#tool-definition-options) table above:

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';
import { z } from '@strapi/utils';

const { mcp } = ai;

const greet = mcp.defineTool({
  name: 'greet',
  title: 'Greet',
  description: 'Greets a user by name',
  devModeOnly: true,
  resolveInputSchema: () => z.object({ name: z.string() }),
  resolveOutputSchema: () => z.object({ message: z.string() }),
  createHandler: (strapi) => async ({ args }) => {
    const message = `Hello, ${args.name}!`;
    return { content: [{ type: 'text', text: message }], structuredContent: { message } };
  },
});

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerTool(greet);
    }
  },
};
```

### Defining a prompt

Use `mcp.definePrompt()` to build a prompt definition, then pass it to `strapi.ai.mcp.registerPrompt()`:

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';

const { mcp } = ai;

const context = mcp.definePrompt({
  name: 'app-context',
  title: 'App Context',
  description: 'Provides context about the app',
  devModeOnly: true,
  createHandler: (strapi) => async () => ({
    messages: [
      { role: 'user', content: { type: 'text', text: 'You are connected to Strapi.' } },
    ],
  }),
});

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerPrompt(context);
    }
  },
};
```

### Defining a resource

Use `mcp.defineResource()` to build a resource definition, then pass it to `strapi.ai.mcp.registerResource()`:

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';

const { mcp } = ai;

const appInfo = mcp.defineResource({
  name: 'app-info',
  uri: 'strapi://app/info',
  metadata: { description: 'Metadata about the app', mimeType: 'application/json' },
  devModeOnly: true,
  createHandler: (strapi) => async (uri) => ({
    contents: [
      { uri: uri.href, mimeType: 'application/json', text: JSON.stringify({ ok: true }) },
    ],
  }),
});

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerResource(appInfo);
    }
  },
};
```
