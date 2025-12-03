export function buildClaudePrompt({ prAnalysis, truncatedDiff, candidates, summary, impact }) {
  const candidatesBlock = Array.isArray(candidates) && candidates.length
    ? `## Candidate Documentation Pages (from llms-full index)\n\n` +
      candidates.map((p, i) => {
        const anchors = Array.isArray(p.anchors) && p.anchors.length ? p.anchors.slice(0, 8).join(', ') : '—';
        return `- [${i + 1}] Title: ${p.title}\n  URL: ${p.url || '(missing)'}\n  Anchors: ${anchors}`;
      }).join('\n') + '\n\n'
    : '';

  const signalsBlock = `## Signals\n\n- Heuristic summary: ${summary || 'N/A'}\n- Heuristic impact: ${(impact && impact.verdict) || 'unknown'} — ${(impact && impact.reason) || ''}\n\n`;

  return `You are a technical documentation analyst for Strapi CMS. Your expertise is in identifying documentation gaps and suggesting precise updates.

Analyze this pull request and provide specific, actionable documentation update suggestions.

## PR Information
- **Title**: ${prAnalysis.title}
- **Category**: ${prAnalysis.category}
- **Description**: ${(prAnalysis.body || '').substring(0, 1000)}
- **URL**: ${prAnalysis.url}

## Code Changes (Diff)

${truncatedDiff}

${signalsBlock}
${candidatesBlock}

## Your Task

**Important**: Strapi documentation structure:
- The old /user-docs and /dev-docs folders have been replaced
- Current structure: /cms for CMS documentation, /cloud for Cloud documentation
- Features are now in /cms/features/ (e.g., content-manager, media-library, internationalization)
- API docs are in /cms/api/
- Configurations are in /cms/configurations/

Analyze the changes and determine:
1. Does this PR affect user-facing functionality, APIs, or configuration?
2. What parts of the Strapi documentation need updates?
3. What specific content should be added, updated, or clarified?

Respond with a JSON object in this minimal shape (JSON only, no markdown):

{
  "summary": "≤200 chars plain text what/why",
  "needsDocs": "yes" | "no" | "maybe",
  "docsWorthy": true | false,
  "newPage": true | false,
  "rationale": "1–2 sentence justification",
  "targets": [
    { "path": "docs/cms/...md", "anchor": "optional-section-anchor" }
  ]
}

## Guidelines

1. **Priority Determination**: 
   - **HIGH**: New features, breaking changes, API modifications, new configuration options, significant behavior changes
   - **MEDIUM**: Important bug fixes affecting user workflows, UI/UX changes, plugin modifications, i18n changes
   - **LOW**: Minor fixes, cosmetic changes, internal refactoring with minimal user impact

2. **Affected Areas**: Be specific. Examples:
   - "Admin Panel - Content Manager"
   - "API Reference - Upload Plugin"
   - "User Guide - Internationalization"
   - "Configuration - Media Library Settings"
   - "Developer Guide - Plugin Development"

3. **File Paths**: Use the current Strapi documentation structure:
   - CMS docs: "docs/cms/[topic]/[page].md" (e.g., "docs/cms/features/content-manager.md")
   - Cloud docs: "docs/cloud/[topic]/[page].md" (e.g., "docs/cloud/getting-started/deployment.md")
   - API reference: "docs/cms/api/[type]/[endpoint].md"
   - Configuration: "docs/cms/configurations/[topic].md"
   - Features: "docs/cms/features/[feature].md"

4. **Suggested Content**: 
   - Write complete, ready-to-use markdown content
   - Include code examples where appropriate
   - Use proper markdown formatting (headers, code blocks, lists)
   - Be concise but comprehensive
   - Match Strapi's documentation tone (clear, friendly, technical)

5. **When NOT to suggest changes**:
   - Internal code refactoring with no external impact
   - Test file changes only
   - CI/CD pipeline changes
   - Minor typo fixes in code comments
   - Changes to development tooling`;
}

