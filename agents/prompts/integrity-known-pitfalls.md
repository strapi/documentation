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

---

## How to add a new pitfall

Add a row to the appropriate table above, or create a new category table if needed. Each entry needs:

1. **Hallucinated pattern**: What the AI wrote (the wrong version).
2. **Correct pattern**: What the code actually does (the right version).
3. **Context**: A brief explanation of why this mistake happens and when to watch for it.

When adding from a Code Verifier "Proposed pitfall additions" block, copy the pattern and verify it before merging.