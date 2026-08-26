# Known Pitfalls — Integrity Checker

This file lists documented patterns where AI-generated documentation has produced incorrect content. The Code Verifier checks every item on this list proactively against the content being reviewed.

**How to use this file:**
- The Code Verifier reads it before each run and checks for these patterns.
- Maintainers add new entries when a hallucination pattern is discovered.
- The Code Verifier can propose additions at the end of its report (see "Proposed pitfall additions").

---

## Pitfalls

### Strapi v5 identifiers

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| `ctx.params.id` | `ctx.params.documentId` | Document Service in Strapi v5 uses `documentId`, not `id` |
| `find({ id: ... })` | `find({ documentId: ... })` | Document Service methods use `documentId` as the identifier parameter |
| `strapi.query(...)` | `strapi.documents(...)` or Document Service API | `strapi.query()` is a Strapi v3/v4 pattern, removed in v5 |

### Lifecycle and boot sequence

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| `actionProvider.registerMany()` in `register()` | `actionProvider.registerMany()` in `bootstrap()` | Services are not available during `register()`. RBAC actions must be registered in `bootstrap()`. |
| Registering MCP capabilities (`strapi.ai.mcp.registerTool`/`registerResource`/`registerPrompt`) in `bootstrap()`, or describing `bootstrap()` as a supported or preferred phase | Register MCP capabilities only in the plugin's `register()` phase | Strapi docs convention (design decision): registration is gated to `serverStatus === 'idle'` (`packages/core/core/src/services/mcp/index.ts`), so `bootstrap()` is technically possible, but its edge cases are too narrow to recommend. Docs document `register()` only. strapi/strapi type comments may still mention `bootstrap()`: flag this as a docs-convention issue, not a code-vs-source error. The code may align to register-only later. |

### Scope and applicability

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| "Always sanitize input/output" (universal) | Sanitization applies specifically to Content API routes | The `sanitize` utility is used in Content API controllers. Not all routes require it. |

### Import and export patterns

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| `export * as namespace` confused with `export * from` | Check the actual `index.ts` to determine if something is a namespace export or a flattened re-export | A flattened re-export (`export * from './x'`) makes sub-exports top-level, not nested under a namespace. |
| `const { primitives } = require('@strapi/utils')` | `const { strings, objects, arrays, dates } = require('@strapi/utils')` | `@strapi/utils` does `export * from './primitives'` (flattened), not `export * as primitives` |
| `validateYupSchema` under the `yup` namespace | `validateYupSchema` is a top-level export from `@strapi/utils` | Exported from `./validators`, not from `./yup`. Import as `const { validateYupSchema } = require('@strapi/utils')`. |

### Data transfer stage filtering

Verified against `packages/core/strapi/src/cli/utils/data-transfer.ts` (`parseRestoreFromOptions`, `expandMediaLibraryPreset`), `packages/core/data-transfer/src/engine/index.ts` (`TransferGroupPresets`), and `packages/core/data-transfer/src/strapi/providers/local-destination/strategies/restore/index.ts` (`deleteEntitiesRecords`).

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| `--exclude files` (or `--only content`) described as preserving "files" or "the media library" on the destination | It preserves only the **binaries** under `public/uploads`. Media library DB records (`plugin::upload.file`, `plugin::upload.folder`) are part of the `content` preset and still transfer. Only `--exclude media-library` preserves both. | `TransferGroupPresets.files` is `{assets: true}` only; upload records ride the `entities` stage with `content`. Data-loss-adjacent: the wrong claim leaves the destination with records pointing at binaries that were never transferred. Always state which of the two halves is preserved, never just "files". |
| A stage-filtering matrix whose default-command row claims nothing is preserved on the destination | The default command always preserves `admin::*` types and `IGNORED_CONTENT_TYPES` (`plugin::content-releases.release`, `…release-action`) | `entitiesOptions.exclude` unconditionally contains the admin-prefixed and ignored types, so content is never wiped entirely. A "None preserved" row is always wrong. |
| `--exclude` / `--only` described as **deleting** the omitted types on the target instance (any data-management page) | Omitted stages are **preserved**; only transferred stages are replaced | `strapi import` and `strapi transfer` both call the same `parseRestoreFromOptions`, so the semantics are identical across the two pages. When a stage is out of scope, `entities.include` is set to `[]`, which matches nothing and short-circuits deletion. Check `import.md`, `export.md`, `transfer.md`, and `cli.md` agree: they have contradicted each other before. |
| A docs page quoting a `strapi transfer` confirmation prompt as "will delete all of the remote Strapi assets and its database" | The remote prompt is "The transfer will delete existing data from the remote Strapi!"; the local one is "…delete all **the** local Strapi assets and its database" | Reworded upstream precisely because `--only`/`--exclude` mean a transfer no longer always deletes everything. Verify quoted prompt strings against `packages/core/strapi/src/cli/commands/transfer/command.ts` rather than copying older docs. |

### Documentation formatting conventions

These are not code hallucinations but recurring Strapi-docs formatting mistakes. Verified against `STYLE_GUIDE.pdf` and `docusaurus/src/components/Icon.js`.

| Hallucinated pattern | Correct pattern | Context |
|---------------------|-----------------|---------|
| `**Copy**` (button name in bold, no icon) | `<Icon name="copy" /> **Copy**` | UI button names must be prefixed with their Phosphor icon (lowercase kebab-case name from phosphoricons.com). `<Icon>` is a global MDX component, no import needed. |
| `**Timestamp**` in a table cell | `Timestamp` (plain text) | Bold is reserved for UI button names only. Table cell labels and headers must be plain text. |
| `*Error*`, `*Warning*`, `*Info*` (log levels / values in italic) | `Error`, `Warning`, `Info` (plain text) | Italic is reserved for admin panel section, window, tab, and field names. Values, enum members, and log levels are not UI section names. |
| `:::caution` for non-destructive informational content | `:::note` | `:::caution` is for mistake prevention / unstable behavior; `:::warning` for data loss or crashes. Neutral side information with nothing risky is a `:::note`. |
| `<ApiCall>`/`<Request>`/`<Response>` trio (or `noSideBySide`) on a REST or Document Service reference page | `<Endpoint>` (`kind="http"` for REST, `kind="js"` for Document Service) | The redesign replaced the legacy trio with `<Endpoint>`. The trio is valid ONLY on these not-yet-migrated pages: `docs/cms/api/graphql.md`, `docs/cms/api/graphql/**`, `docs/cms/api/rest/upload.md`, `docs/cms/api/rest/relations.md`, `docs/cms/features/users-permissions/rest-api.md`, `docs/cms/plugins/graphql.md`. Flag the trio anywhere else. Do NOT flag bare `QsForQueryBody` (it is still used alongside `<Endpoint>` on migrated REST pages). |

---

## How to add a new pitfall

Add a row to the appropriate table above, or create a new category table if needed. Each entry needs:

1. **Hallucinated pattern**: What the AI wrote (the wrong version).
2. **Correct pattern**: What the code actually does (the right version).
3. **Context**: A brief explanation of why this mistake happens and when to watch for it.

When adding from a Code Verifier "Proposed pitfall additions" block, copy the pattern and verify it before merging.
