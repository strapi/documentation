# AGENTS — Concepts / Introduction / Overview pages

Scope
- Applies to concept-style pages under `docusaurus/docs/cms/` such as `intro.md`, “overview” pages, and conceptual introductions.
- Follow repo‑wide rules for TL;DR, callouts, and code snippets; this guide encodes structure and headings only.

Purpose
- Ensure intro/concept pages set context, define terminology, and orient readers toward hands‑on docs.

Frontmatter (recommended)
- `title`: Concise concept name or “Introduction” for the section.
- `description`: One sentence stating what this page helps the reader understand.
- Optional `tags` for discoverability.

Required Section Order
1) H1 title — matches `title` frontmatter.
2) TL;DR — 1–3 sentences summarizing the concept, value, and when it applies.
3) Audience and scope — who this is for; what’s included/excluded (≤1 short paragraph).
4) Key concepts and definitions (H2)
   - Define core terms and how they relate (use short subsections or a term list).
5) Architecture / mental model (H2)
   - Diagram or ThemedImage when it clarifies layers and flow; otherwise a clear textual model.
6) How it fits in (H2)
   - Place the concept within Strapi (link to features, APIs, and related systems).
7) Common pitfalls / limitations (H2) — optional but encouraged when known.
8) Next steps / Related links (H2)
   - Point to relevant features, guides/how‑tos, and API references.

Heading Conventions
- Use H2 for major blocks (Key concepts, Architecture, Fit, Pitfalls, Next steps).
- Keep section titles short and consistent (e.g., “Key concepts”, “Architecture”, “How it fits in”, “Next steps”).

Cross‑linking
- Link to the most relevant feature page(s), API reference(s), and starter guides.
- Prefer relative links within `/cms/` and consistent link text across docs.

Quality Checklist (before commit)
- TL;DR present and focused on understanding, not step‑by‑step instructions.
- Audience/scope stated; reader knows whether to continue.
- Core terms defined; relationships are clear.
- Architecture/mental model improves comprehension (diagram if useful).
- “How it fits in” connects to concrete docs the reader can follow next.
- Pitfalls/limitations called out when they can preempt confusion.
- Next steps and related links included.

