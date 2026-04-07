---
title: Developer MCP Server
description: Run a local Model Context Protocol (MCP) server in your Strapi project so AI assistants can execute validated admin and content operations.
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - features
  - admin panel
  - mcp
  - cli
  - ai assistants
---

# Developer MCP Server

<Tldr>
The Developer MCP Server runs locally in your Strapi project and exposes structured operations through the Model Context Protocol (MCP). Connected AI assistants can execute validated admin and development content tasks without exposing your Strapi instance over the network.
</Tldr>

Most Strapi administration is currently UI-driven. The Developer MCP Server adds a local automation layer for AI-assisted workflows by mapping structured MCP requests to the same internal services used by the admin panel.

In phase 1, the server is local only. It runs as a project process, uses one configured admin context at startup, and keeps command execution on the same machine.

:::note Availability
CLI entry points and configuration details depend on the Strapi version you run. If `strapi mcp` is not available in your project, check [release notes](/release-notes) and the [public roadmap](https://feedback.strapi.io/).
:::

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">
    Free feature; some connected tools depend on licensed capabilities when they target premium domains
  </IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">
    Uses a single admin context configured at startup in local mode
  </IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">
    Available when you start the local MCP process with `strapi mcp`
  </IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">
    Local development environment in phase 1
  </IdentityCardItem>
</IdentityCard>

## Configuration

Configure your local environment before using MCP actions from an AI assistant.

### Admin panel configuration

The Developer MCP Server does not add a dedicated settings screen in the admin panel. It executes actions in domains that already exist in Strapi administration.

Review related domains in the existing documentation:

- [Role-Based Access Control (RBAC)](/cms/features/rbac)
- [Users & Permissions](/cms/features/users-permissions)
- [Internationalization (i18n)](/cms/features/internationalization)
- [Media Library](/cms/features/media-library)
- [API Tokens](/cms/features/api-tokens)
- [Review Workflows](/cms/features/review-workflows) and [Releases](/cms/features/releases) when licensed

:::caution Local-only execution
In phase 1, the Developer MCP Server does not expose remote HTTP endpoints. All requests are handled through a local process.
:::

### Code-based configuration

1. Open a terminal in your Strapi project root.
1. Start the MCP server process:

```bash
npx strapi mcp
```

1. Register the local server in your MCP client configuration. A common setup looks like:

```json title="/mcp-config.json"
{
  "servers": {
    "strapi-local": {
      "protocol": "file",
      "command": "npx",
      "args": ["strapi", "mcp"],
      "cwd": "/absolute/path/to/your-strapi-project"
    }
  }
}
```

1. Configure the admin identity required by your Strapi version before starting the process.

The MCP server executes requests through Strapi services. It does not write directly to the database.

## Usage

Use the MCP server to automate local setup and repeatable development tasks.

### Start and verify the MCP connection

1. Start your Strapi project.
1. Run `npx strapi mcp` in the same project root.
1. Start your AI assistant with the MCP client configuration.
1. Send a read operation first, for example listing available roles.

### Send structured MCP actions

MCP clients send JSON payloads with an action and payload. Strapi validates the request and returns structured output.

Example request:

```json
{
  "action": "createRole",
  "payload": {
    "name": "Reviewer",
    "permissions": ["read:articles"]
  }
}
```

Example success response:

```json
{
  "status": "success",
  "summary": "Role 'Reviewer' created with read access to Articles"
}
```

Example error response:

```json
{
  "status": "error",
  "type": "permission_denied",
  "message": "The configured admin context does not allow role updates"
}
```

### Supported domains in local mode

| Domain | Example operations |
| --- | --- |
| RBAC | Create, update, or delete roles and permissions |
| Users and permissions | Assign admin roles and review access settings |
| Settings | Manage locales, webhooks, branding, and workflow settings |
| Media Library | Create folders, move files, and reorganize assets |
| API and transfer tokens | Create, rotate, and revoke tokens |
| Content operations | Create, edit, and delete entries for local automation |
| Premium domains (licensed) | Manage review workflows and releases |

### Review logs and auditability

Each operation is logged locally (for example in `.strapi/mcp.log`) with metadata such as timestamp, admin identifier, action, and outcome.

Use the logs command when supported by your version:

```bash
strapi mcp:logs
```

If your project uses [Audit Logs](/cms/features/audit-logs), MCP-driven actions can be included in broader administrative tracking depending on your edition and setup.

### Apply safety practices

Use these safeguards in AI-assisted workflows:

1. Require explicit confirmation before destructive actions.
1. Review operation logs after each automation session.
1. Treat local MCP capabilities as full administrative power over local project state.

### Keep environments aligned

MCP actions modify local project data and configuration. Promote those changes to other environments using your regular delivery flow, including [Data Management transfer](/cms/data-management/transfer) when relevant.

### Plan for extension and remote phases

The MCP server is designed to be extensible through Strapi and plugin tooling. Future phases can extend the same model to remote instances once secure authentication for Admin API actions is available.

## Related resources

- [Admin panel](/cms/features/admin-panel)
- [Data Management](/cms/features/data-management)
- [FAQ: Is there an MCP server for Strapi?](/cms/faq#is-there-an-mcp-server-for-strapi)
