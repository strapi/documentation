# AGENTS.md (API pages)

Scope
- Applies to all API pages under `docusaurus/docs/cms/api/` (recursively).
- Do not duplicate repo‑wide rules (code snippets, callouts, TL;DR conventions); follow root `AGENTS.md`.

Purpose
- Encode structure and heading conventions for API pages, covering both overview pages and detailed references.

Frontmatter (mandatory)
- `title`: API name (Title Case).
- `description`: One concise sentence explaining the API’s purpose.
- `tags`: Include relevant API tags (e.g., Content API, Document Service, REST, GraphQL).
- Optional: `displayed_sidebar`, `sidebar_label` as needed by navigation.

Templates
- Start from `agents/templates/api-template.md` to align sections and example layout.
- See `agents/templates/INDEX.md` for a quick catalog of available templates with paths and purposes.

API Overview Pages (e.g., Content API)
1) H1 title — matches `title` frontmatter.
2) Optional TL;DR — brief orientation if it helps (1–2 sentences).
3) Introduction — context of where/why this API is used; relations to other layers.
4) Access methods — describe channels (e.g., REST, GraphQL, Client library) with links.
5) Architecture/diagram — optional ThemedImage/diagram when clarifying layers.

Service/Library Reference Pages (e.g., Document Service API)
1) H1 title — API name.
2) Short overview paragraph — what it is, when to use it; relate to neighboring APIs.
3) Optional prerequisites or notes (deprecations, version changes).
4) Method sections (H2) — one per operation (e.g., `create()`, `findOne()`, `update()`, `delete()`, `publish()`, `count()`). For each method:
   - Parameters (H3) — list or table with name, type, required, default, description.
   - Examples (H3) — one or more runnable examples; group language variants under the same example.
5) Error handling / edge cases (H2) — when applicable.

REST Endpoint Pages (groups)
1) H1 title — endpoint group or resource.
2) Overview — describe base path and auth requirements.
3) Endpoints (H2) — one section per endpoint:
   - Path and method (e.g., `GET /api/articles`).
   - Path/query params (H3) — name, type, required, description.
   - Request body (H3) — schema/shape when applicable.
   - Responses (H3) — status codes and payload shapes.
   - Examples (H3) — request/response pairs; group language variants.
4) Pagination, filtering, sorting (H2) — if common across endpoints, centralize here and cross‑reference.

Heading Conventions
- Use H2 for major sections; H3 for method sub‑sections (Parameters, Examples).
- Method names as H2 should be consistent and anchor‑friendly (e.g., ``## `create()` ``).

Component Patterns by Page Type

API pages use custom MDX components that vary by sub-section. When editing an existing page, always match the page's established patterns:

- **Document Service API pages** use `<ApiCall>` with `<Request>` / `<Response>` for code examples. The `noSideBySide` prop is used for longer examples. Response code blocks use JS object literal notation (not JSON).
- **REST API pages** use `<ApiCall>` wrapping `<Request>`, a `<details>` block for the `qs.stringify` equivalent, and `<Response>`. Snippet imports (`QsForQueryBody`, `QsForQueryTitle`, `QsIntroFull`) are used inside the `<details>` blocks. Response code blocks use JSON.
- **GraphQL API pages** use plain code blocks with `graphql` language identifier for query examples.

Do not mix patterns across page types (e.g., do not use `<details>` on a Document Service page, or plain code blocks where `<ApiCall>` is expected).

Cross‑linking
- Link to neighboring APIs (Content API, Query Engine), relevant features, and migration notes.
- Keep link text consistent with existing docs; prefer relative links under `/cms/`.

Quality Checklist (before commit)
- Overview or intro paragraph clearly situates the API.
- Method sections follow the H2/H3 structure; parameters and examples are present.
- Endpoint groups list path, method, params, body, responses, and examples.
- Headings and section order match this guide; anchors are stable.