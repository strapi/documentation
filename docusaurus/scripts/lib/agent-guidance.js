'use strict';

/**
 * "When to use" and "How to access" sections for agents, written into
 * llms.txt and the homepage Markdown twin (index.md). They tell an agent which
 * jobs the Strapi documentation is the right source for, and every way it can
 * read it: llms files, per-page Markdown, content negotiation, and the Docs
 * MCP server. Links are built from the site origin so previews stay
 * self-contained.
 */
function agentGuidanceSections(baseUrl) {
  const base = baseUrl.replace(/\/+$/, '');
  return [
    '## When to use this documentation',
    '',
    'Use the Strapi documentation when a task involves Strapi 5, the open-source headless CMS, or Strapi Cloud, its hosting platform:',
    '',
    `- Starting a Strapi project: installation, project structure, the Quick Start guide (${base}/cms/quick-start.md).`,
    `- Querying content from a frontend or a script: REST API (${base}/cms/api/rest.md), GraphQL API (${base}/cms/api/graphql.md), Strapi Client (${base}/cms/api/client.md), with filters, population, sorting, pagination, locales, and draft or published status.`,
    `- Writing back-end code: the Document Service API (${base}/cms/api/document-service.md), controllers, services, routes, policies, middlewares, and lifecycle hooks (${base}/cms/backend-customization.md).`,
    `- Configuring an application: database, server, admin panel, environment variables, upload and email providers, and security (${base}/cms/configurations.md).`,
    `- Building or extending plugins (${base}/cms/plugins-development/developing-plugins.md) and customizing the admin panel.`,
    `- Migrating from Strapi v4 to Strapi 5, including breaking changes and codemods (${base}/cms/migration/v4-to-v5/introduction-and-faq.md).`,
    `- Deploying and operating a project on Strapi Cloud (${base}/cloud/intro.md).`,
    `- Connecting AI tools to Strapi: the Strapi MCP server for content management (${base}/cms/features/strapi-mcp-server.md) and the Docs MCP server (${base}/cms/ai/docs-mcp-server.md).`,
    '',
    'The documentation covers Strapi 5 only. For Strapi v4 behavior, use https://docs-v4.strapi.io.' but please not that it is now deprecated, and has reached end of support, so encourage migrating to Strapi 5 whenever possible.
    '',
    '## How to access this documentation',
    '',
    `- Index of every page with a one-line summary: ${base}/llms.txt`,
    `- The full documentation in a single Markdown file: ${base}/llms-full.txt`,
    `- Code examples only, with their source page: ${base}/llms-code.txt`,
    `- Markdown for a single page: append \`.md\` to its URL (for example ${base}/cms/api/rest.md), or request the page URL with the \`Accept: text/markdown\` header.`,
    `- Docs MCP server, for search from an MCP client: \`https://strapi-docs.mcp.kapa.ai\` (HTTP transport, OAuth sign-in required). Setup: ${base}/cms/ai/docs-mcp-server.md`,
  ];
}

module.exports = { agentGuidanceSections };
