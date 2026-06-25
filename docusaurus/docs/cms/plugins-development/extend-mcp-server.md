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
Strapi plugins can register additional MCP tools through the `strapi.ai.mcp` service. Registrations must happen while the MCP server is idle (during the plugin's `register()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the tools generated from your schema, plugins can register their own MCP capabilities so AI clients can trigger plugin-specific actions. Plugins can register 3 capability types through the `strapi.ai.mcp` service: tools, resources, and prompts.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a tool during the plugin's `register()` phase.

## Registering a custom tool

Use `strapi.ai.mcp.registerTool()` to expose a custom tool to AI clients:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { z } = require('@strapi/utils');

module.exports = {
  register({ strapi }) {
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
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { z } from '@strapi/utils';

export default {
  register({ strapi }) {
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
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies any policy in the `policies` array. Each policy is `{ action, subject? }`. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the tool to development mode only (equivalent to the built-in `log` tool). |
| `resolveInputSchema` | Function | No | Returns a Zod schema for the tool's input arguments. Called per request so RBAC constraints can be applied dynamically. Omit for tools with no input. |
| `resolveOutputSchema` | Function | Yes | Returns a Zod schema for the tool's structured output. Called per request. |
| `createHandler` | Function | Yes | Factory that returns the async tool handler. Receives the Strapi instance and per-request context (including `userAbility` and `user`). |

:::note
`resolveInputSchema` and `resolveOutputSchema` are called once per incoming MCP request, so you can narrow schemas dynamically based on the token's permissions (via `context.userAbility`).
:::

## Defining capabilities with builder helpers

:::caution
Builder helpers are an optional convenience for TypeScript users. The standard, recommended way to register a capability is to pass its definition inline to [`registerTool()`](#registering-a-custom-tool), as shown in the [previous section](#registering-a-custom-tool). You never need a builder helper to register a tool, resource, or prompt: skip this section unless you specifically want the extra TypeScript inference it provides.
:::

Passing the tool definition inline to [`registerTool()`](#registering-a-custom-tool) is the standard approach and works well for most cases. For larger plugins that keep capability definitions in their own modules, Strapi optionally exports a set of builder helpers that improve TypeScript inference when a definition is declared away from its `register` call.

These helpers are exported under the `ai.mcp` namespace on `@strapi/strapi`: `ai.mcp.defineTool`, `ai.mcp.defineResource`, and `ai.mcp.definePrompt`. Each one returns its definition unchanged at runtime: it is a pure type-inference helper, not a different way to register a capability. They infer the capability's `name`, schemas, and handler types, and narrow the access variant (`devModeOnly` or `auth`) so the result is directly assignable to the matching `register` method. This is similar to the `factories` helpers used for content-manager APIs.

Whether or not you use a builder, registration still happens the same way: pass the definition to `registerTool()` (or `registerResource()` / `registerPrompt()`) during the plugin's `register()` phase. Each definition takes either `devModeOnly: true` or an `auth` policy set, never both.

### Defining a tool

The following example uses `devModeOnly` for brevity. An `auth` policy set, like the one shown in the [tool definition options](#tool-definition-options) above, works the same way:

```ts title="src/plugins/my-plugin/mcp/greet.ts"
import { ai } from '@strapi/strapi';
import { z } from '@strapi/utils';

export const greet = ai.mcp.defineTool({
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
```

Register the tool from the plugin's server entry file:

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { greet } from './mcp/greet';

export default {
  register({ strapi }) {
    strapi.ai.mcp.registerTool(greet);
  },
};
```

### Defining a resource

A resource exposes read-only data to AI clients through a URI. Define it with `ai.mcp.defineResource`, then register it with `strapi.ai.mcp.registerResource()`:

```ts title="src/plugins/my-plugin/mcp/app-info.ts"
import { ai } from '@strapi/strapi';

export const appInfo = ai.mcp.defineResource({
  name: 'app-info',
  uri: 'strapi://app/info',
  metadata: { description: 'Metadata about the app', mimeType: 'application/json' },
  devModeOnly: true,
  createHandler: (strapi) => async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify({ ok: true }) }],
  }),
});
```

### Defining a prompt

A prompt exposes a reusable prompt template to AI clients. Define it with `ai.mcp.definePrompt`, then register it with `strapi.ai.mcp.registerPrompt()`:

```ts title="src/plugins/my-plugin/mcp/app-context.ts"
import { ai } from '@strapi/strapi';

export const appContext = ai.mcp.definePrompt({
  name: 'app-context',
  title: 'App Context',
  description: 'Provides context about the app',
  devModeOnly: true,
  createHandler: (strapi) => async () => ({
    messages: [{ role: 'user', content: { type: 'text', text: 'You are connected to Strapi.' } }],
  }),
});
```

:::note
The builders are identity functions: they do not change the definition at runtime. Defining a capability does not register it. Pass the result to `strapi.ai.mcp.registerTool()`, `registerResource()`, or `registerPrompt()` during `register()`, while the MCP server is still idle.
:::

