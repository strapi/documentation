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
Strapi plugins can register additional MCP tools, resources, and prompts through the `strapi.ai.mcp` service. Registrations must happen while the MCP server is idle (during the plugin's `register()` or `bootstrap()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the content-type tools generated from your schema, plugins can register their own custom tools, resources, and prompts so AI clients can trigger plugin-specific actions.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a tool during the plugin's `register()` or `bootstrap()` phase. Prefer `bootstrap()` when a tool depends on synced content-types, permissions, or database state.

## Registering a custom tool

Tools are the most common capability a plugin registers. Resources and prompts follow the same pattern and are covered in [Defining capabilities with type inference](#defining-capabilities-with-type-inference).

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
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies any policy in the `policies` array. Each policy is `{ action, subject? }`. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the tool to development mode only (equivalent to the built-in `log` tool). |
| `resolveInputSchema` | Function | No | Returns a Zod schema for the tool's input arguments. Called per request so RBAC constraints can be applied dynamically. Omit for tools with no input. |
| `resolveOutputSchema` | Function | Yes | Returns a Zod schema for the tool's structured output. Called per request. |
| `createHandler` | Function | Yes | Factory that returns the async tool handler. Receives the Strapi instance and per-request context (including `userAbility` and `user`). |

:::note
`resolveInputSchema` and `resolveOutputSchema` are called once per incoming MCP request, so you can narrow schemas dynamically based on the token's permissions (via `context.userAbility`).
:::

## Defining capabilities with type inference

The example above defines the tool's schemas inline. You can also type a capability definition manually against the `Modules.MCP.*` types from `@strapi/types`. For TypeScript inference and editor autocompletion, use the builders exported from `@strapi/strapi` under the `ai.mcp` namespace:

- `ai.mcp.defineTool` for tools
- `ai.mcp.defineResource` for resources
- `ai.mcp.definePrompt` for prompts

Each builder returns the definition unchanged at runtime. The builder's only job is to infer the definition's types (`name`, schemas, handler) and narrow the access variant, so the result is directly assignable to the matching `register` method. Provide either `devModeOnly: true` or an `auth` policy set for each capability, never both.

Define the capability first, then register it during the plugin's `register()` or `bootstrap()` phase.

### Defining a tool

Use `ai.mcp.defineTool` to define a tool, then pass it to `strapi.ai.mcp.registerTool()`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { ai } = require('@strapi/strapi');
const { z } = require('@strapi/utils');

const greet = ai.mcp.defineTool({
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

module.exports = {
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerTool(greet);
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';
import { z } from '@strapi/utils';

const greet = ai.mcp.defineTool({
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
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerTool(greet);
  },
};
```

</TabItem>
</Tabs>

A tool definition takes the same fields as `registerTool()`: a `name`, a `title`, a `description`, an optional `resolveInputSchema`, a `resolveOutputSchema`, and a `createHandler` factory. See [Tool definition options](#tool-definition-options) for the full list.

### Defining a resource

Resources expose readable data to AI clients through a URI. Use `ai.mcp.defineResource` to define a resource, then pass it to `strapi.ai.mcp.registerResource()`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { ai } = require('@strapi/strapi');

const appInfo = ai.mcp.defineResource({
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

module.exports = {
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerResource(appInfo);
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';

const appInfo = ai.mcp.defineResource({
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
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerResource(appInfo);
  },
};
```

</TabItem>
</Tabs>

A resource definition takes a `name`, a `uri`, a `metadata` object, and a `createHandler` factory that returns the resource's read handler.

### Defining a prompt

Prompts provide reusable message templates to AI clients. Use `ai.mcp.definePrompt` to define a prompt, then pass it to `strapi.ai.mcp.registerPrompt()`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { ai } = require('@strapi/strapi');

const context = ai.mcp.definePrompt({
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

module.exports = {
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerPrompt(context);
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';

const context = ai.mcp.definePrompt({
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
  bootstrap({ strapi }) {
    strapi.ai.mcp.registerPrompt(context);
  },
};
```

</TabItem>
</Tabs>

A prompt definition takes a `name`, a `title`, a `description`, an optional `argsSchema`, and a `createHandler` factory that returns the prompt's message handler.

