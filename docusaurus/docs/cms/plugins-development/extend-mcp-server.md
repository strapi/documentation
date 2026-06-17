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
Strapi plugins can register additional MCP tools, resources, and prompts through the `strapi.ai.mcp` service. The `ai.mcp` builder helpers (`defineTool`, `defineResource`, `definePrompt`) give TypeScript inference before registration. Registrations must happen while the MCP server is idle (during the plugin's `register()` or `bootstrap()` lifecycle phase), before the server starts.
</Tldr>

Strapi includes a built-in [Model Context Protocol (MCP) server](/cms/features/strapi-mcp-server) that exposes content management tools to AI clients. In addition to the content-type tools generated from your schema, plugins can register their own custom tools, resources, and prompts so AI clients can trigger plugin-specific actions, read plugin-specific data, and reuse plugin-specific prompts.

Registrations must happen while the MCP server is idle, before it starts. In Strapi's load lifecycle, register a capability during the plugin's `register()` or `bootstrap()` phase. Prefer `bootstrap()` when a capability depends on synced content-types, permissions, or database state.

## Defining capabilities with the builder helpers

The `ai.mcp` namespace exposes 3 builder helpers that define a capability before you register it:

| Helper | Builds a definition for |
|--------|-------------------------|
| `ai.mcp.defineTool` | `strapi.ai.mcp.registerTool()` |
| `ai.mcp.defineResource` | `strapi.ai.mcp.registerResource()` |
| `ai.mcp.definePrompt` | `strapi.ai.mcp.registerPrompt()` |

Each helper returns its definition unchanged at runtime. Its only job is TypeScript inference: it infers the `name`, schemas, and handler types, and narrows the access variant (`devModeOnly` or `auth`) so the result is directly assignable to the matching `register*` method. This serves the same purpose as `factories` for the Content API: a typed builder you call before registration.

Import the helpers from `@strapi/strapi`:

```ts title="src/plugins/my-plugin/server/mcp/greet.ts"
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

Using a builder is optional. You can still pass a plain object directly to a `register*` method. In TypeScript, the builder is recommended: it infers the definition types and reports a malformed access variant early.

Every capability declares one access variant, and never both. Set `devModeOnly: true` to expose the capability in development mode only, with no authentication. Set an `auth` policy set to gate the capability with permissions: the session gate passes when the token satisfies any policy in the array.

## Registering a custom tool

Use `strapi.ai.mcp.registerTool()` to expose a custom tool to AI clients. Build the definition with `ai.mcp.defineTool`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { ai } = require('@strapi/strapi');
const { z } = require('@strapi/utils');

const myCustomTool = ai.mcp.defineTool({
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

module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerTool(myCustomTool);
    }
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';
import { z } from '@strapi/utils';

const myCustomTool = ai.mcp.defineTool({
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

export default {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerTool(myCustomTool);
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

## Registering a custom resource

Use `strapi.ai.mcp.registerResource()` to expose plugin-specific data to AI clients. Build the definition with `ai.mcp.defineResource`:

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
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify({ ok: true }) }],
  }),
});

module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerResource(appInfo);
    }
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
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify({ ok: true }) }],
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

### Resource definition options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | Yes | Unique resource name. Must be unique across all registered MCP resources. |
| `uri` | String | Yes | The resource URI advertised to the AI client. |
| `metadata` | Object | Yes | Resource metadata, including `description` and `mimeType`. |
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies any policy in the `policies` array. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the resource to development mode only. |
| `createHandler` | Function | Yes | Factory that returns the async resource handler. Receives the Strapi instance and is called with the requested URI. |

## Registering a custom prompt

Use `strapi.ai.mcp.registerPrompt()` to expose a reusable prompt to AI clients. Build the definition with `ai.mcp.definePrompt`:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```js title="src/plugins/my-plugin/strapi-server.js"
const { ai } = require('@strapi/strapi');

const appContext = ai.mcp.definePrompt({
  name: 'app-context',
  title: 'App Context',
  description: 'Provides context about the app',
  devModeOnly: true,
  createHandler: (strapi) => async () => ({
    messages: [{ role: 'user', content: { type: 'text', text: 'You are connected to Strapi.' } }],
  }),
});

module.exports = {
  register({ strapi }) {
    if (strapi.ai.mcp.isEnabled()) {
      strapi.ai.mcp.registerPrompt(appContext);
    }
  },
};
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```ts title="src/plugins/my-plugin/strapi-server.ts"
import { ai } from '@strapi/strapi';

const appContext = ai.mcp.definePrompt({
  name: 'app-context',
  title: 'App Context',
  description: 'Provides context about the app',
  devModeOnly: true,
  createHandler: (strapi) => async () => ({
    messages: [{ role: 'user', content: { type: 'text', text: 'You are connected to Strapi.' } }],
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

### Prompt definition options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | Yes | Unique prompt name. Must be unique across all registered MCP prompts. |
| `title` | String | Yes | Human-readable title shown to the AI client. |
| `description` | String | Yes | Short description of what the prompt provides. |
| `argsSchema` | Object | No | A Zod schema for the prompt's arguments. Omit for prompts with no arguments. |
| `auth` | Object | Yes (or `devModeOnly`) | Auth requirement. The session gate passes when the token satisfies any policy in the `policies` array. |
| `devModeOnly` | Boolean | Yes (or `auth`) | Set to `true` to restrict the prompt to development mode only. |
| `createHandler` | Function | Yes | Factory that returns the async prompt handler. Receives the Strapi instance. |

