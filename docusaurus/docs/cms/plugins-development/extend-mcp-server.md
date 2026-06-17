---
title: Extending the MCP server with plugins
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-getters-usage
pagination_next: cms/plugins-development/plugins-extension
description: Register additional MCP tools, resources, and prompts from a Strapi plugin through the strapi.ai.mcp service.
tags:
  - plugin APIs
  - server API
  - plugins development
  - MCP
  - AI
---

# Extending the MCP server with plugins

<Tldr>
Strapi plugins can register additional MCP tools, resources, and prompts through the `strapi.ai.mcp` service. Registrations must happen while the MCP server is idle (during the plugin's `register()` or `bootstrap()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the content-type tools generated from your schema, plugins can register their own custom tools, resources, and prompts so AI clients can trigger plugin-specific actions, read plugin-specific data, and reuse plugin-specific prompt templates.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a capability during the plugin's `register()` or `bootstrap()` phase. Prefer `bootstrap()` when a capability depends on synced content-types, permissions, or database state.

## Defining capabilities with type inference

Strapi exports 3 builder helpers under the public `mcp` namespace of `@strapi/strapi`:

- `mcp.defineTool()` for tools
- `mcp.defineResource()` for resources
- `mcp.definePrompt()` for prompts

<!-- source: packages/core/core/src/mcp.ts (PR strapi/strapi#26603) -->

Each helper returns the definition unchanged. Its only role is to give TypeScript inference and to narrow the access variant (`devModeOnly` or `auth`) so the result is directly assignable to the matching `strapi.ai.mcp.register*()` method. They play the same role for MCP capabilities that `factories` play for content-manager APIs.

Using the builders is optional. In JavaScript, pass a plain object to the `register*()` methods directly. In TypeScript, the builders give you autocompletion and type checking on the definition before you register it:

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { mcp } from '@strapi/strapi';
import { z } from '@strapi/utils';

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

// later, in register() or bootstrap():
strapi.ai.mcp.registerTool(greet);
```

<!-- source: packages/core/core/src/services/mcp/tool-registry.ts @example (PR strapi/strapi#26603) -->

:::note
Each capability uses one access variant. Provide either `devModeOnly: true` (development mode only, no authentication) or an `auth` policy set, never both.
:::

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

## Registering a resource

A resource exposes read-only data to AI clients through a URI. Use `strapi.ai.mcp.registerResource()` to register one, optionally building the definition with `mcp.defineResource()`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerResource({
        name: 'app-info',
        uri: 'strapi://app/info',
        metadata: {
          description: 'Metadata about the app',
          mimeType: 'application/json',
        },
        devModeOnly: true,
        createHandler: (strapi) => async (uri) => ({
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ ok: true }),
            },
          ],
        }),
      });
    }
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { mcp } from '@strapi/strapi';

const appInfo = mcp.defineResource({
  name: 'app-info',
  uri: 'strapi://app/info',
  metadata: {
    description: 'Metadata about the app',
    mimeType: 'application/json',
  },
  devModeOnly: true,
  createHandler: (strapi) => async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify({ ok: true }),
      },
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

</TabItem>
</Tabs>

<!-- source: packages/core/core/src/services/mcp/resource-registry.ts @example (PR strapi/strapi#26603) -->

### Resource definition options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | Yes | Unique resource name. Must be unique across all registered MCP resources. |
| `uri` | String | Yes | URI that identifies the resource (for example `strapi://app/info`). |
| `metadata` | Object | Yes | Resource metadata, including a `description` and a `mimeType`. |
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies **any** policy in the `policies` array. Each policy is `{ action, subject? }`. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the resource to development mode only. |
| `createHandler` | Function | Yes | Factory that returns the async resource handler. Receives the Strapi instance and the requested URI, and returns a `contents` array. |

## Registering a prompt

A prompt exposes a reusable prompt template to AI clients. Use `strapi.ai.mcp.registerPrompt()` to register one, optionally building the definition with `mcp.definePrompt()`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerPrompt({
        name: 'app-context',
        title: 'App Context',
        description: 'Provides context about the app',
        devModeOnly: true,
        createHandler: (strapi) => async () => ({
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: 'You are connected to Strapi.' },
            },
          ],
        }),
      });
    }
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { mcp } from '@strapi/strapi';

const appContext = mcp.definePrompt({
  name: 'app-context',
  title: 'App Context',
  description: 'Provides context about the app',
  devModeOnly: true,
  createHandler: (strapi) => async () => ({
    messages: [
      {
        role: 'user',
        content: { type: 'text', text: 'You are connected to Strapi.' },
      },
    ],
  }),
});

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerPrompt(appContext);
    }
  },
};
```

</TabItem>
</Tabs>

<!-- source: packages/core/core/src/services/mcp/prompt-registry.ts @example (PR strapi/strapi#26603) -->

### Prompt definition options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | Yes | Unique prompt name. Must be unique across all registered MCP prompts. |
| `title` | String | Yes | Human-readable title shown to the AI client. |
| `description` | String | Yes | Short description of what the prompt provides. |
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies **any** policy in the `policies` array. Each policy is `{ action, subject? }`. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the prompt to development mode only. |
| `createHandler` | Function | Yes | Factory that returns the async prompt handler. Receives the Strapi instance and returns a `messages` array. |

