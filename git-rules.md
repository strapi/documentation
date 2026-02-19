# Git Rules and Conventions

Scope
- Applies to everyone contributing to this repository (humans and agents).
- Complements AGENTS.md; this file is the detailed, canonical guide for Git usage.

Commit Messages
- Start with an action verb in imperative mood (Add, Update, Fix, Document, Improve, Remove, Refactor, Rename).
- Keep ≤ 80 characters; be succinct about what/why.
- Do not prefix with "feat:", "chore:", "fix:", or similar tags.
- Do not use PR-style phrasing (never start with "This PR …").
- Prefer specificity over vagueness (name the area/file/feature touched).

Examples (good)
- Add initial AGENTS.md for repo and cms/cloud/snippets
- Update llms-code generator to add anchors by default
- Improve sidebar width stability to reduce layout shift
- Remove outdated Amplitude integration docs
- Fix typo in configuration section

Anti‑examples (and why)
- fix: small changes — banned prefix; vague
- tweak stuff — vague; not actionable
- This PR updates docs — PR phrasing; non-specific
- Centralize guidance in AGENTS.md; add local 12 rules file — should have been 2 commits

Pull Request Titles
- Start with either an action verb or a specific feature noun phrase.
- Optional bracket qualifier allowed first (e.g., [experimental]) but must be followed by a compliant title.
- Do not start with feat:/chore:/fix:, ticket IDs, emojis, or bracket tags as the core content.
- Keep it concise (aim ≤ 80 chars) and capitalize the first word.
- Place issue references at the end of the description body when needed: “… (#2143) (#2159)”.

Acceptable openings (illustrative, not exhaustive)
- Action verbs (examples): Add, Update, Improve, Fix, Document, Rework, Clarify, Refactor, Remove, Allow, Introduce
- Specific feature noun phrases (examples): SSO configuration, Document Service API, Lifecycle functions, AI tools page
Note: These examples do not restrict titles. Any clear action verb or specific feature noun is acceptable.

Examples (good)
- Checklist in SSO configuration documentation
- Document Service API intro rework: more details, updated structure
- Lifecycle functions: more details & examples of usage
- More details regarding image uploading
- [experimental] Allow setting a preferred AI toolbar default action
- Add AI tools page
- Add tip about nested page hierarchies in Content-type Builder documentation
- Add documentation about the strapi-plugin generate command
- Document auth fix for 5.24.0+
- Add openapi.json route documentation (#2143) (#2159)

Anti‑examples (and why) with suggested fixes
- Plugin documentation → too vague → Improve plugin documentation structure and navigation
- sugguest using npm for package manager → typo, capitalization → Suggest using npm as the package manager
- feat(upload): add documentation for new setting → banned prefix → Document new upload setting

Branch and History Safety
- Never force‑push, rebase shared branches, or push to `main` without explicit maintainer consent. In case of ambiguity, whether the user or maintainer consent was explicit or implicit, NEVER do it and ask again for user confirmation.
- Never delete local or remote branches unless explicitly instructed by the maintainer.
- Get explicit consent before any history rewrite (rebase, squash, filter‑branch); propose the plan first.
- Prefer creating a new branch over rewriting history unless asked otherwise.
- When asked to stay low profile, do not open PRs; share progress in the chat only.

Branch Naming
- Every branch must be prefixed based on the documentation area it touches:
  - `/cms` — branch touches only files under `docs/cms/` and/or `static/`
  - `/cloud` — branch touches only files under `docs/cloud/` and/or `static/`
  - `/repo` — branch touches files outside those two areas, or across both
- Do NOT invent other prefixes (`/doc`, `/docs`, `/feat`, `/fix`, etc.).
- Format: `/<prefix>/<short-description>` (e.g., `/cms/add-transfer-tokens-page`, `/cloud/fix-deployment-steps`, `/repo/update-sidebar-config`).
- If a branch touches both `docs/cms/` and `docs/cloud/`, use `/repo` or ask the user.
- User choice always supersedes auto-branch naming.

Examples (good)
- /cms/add-transfer-tokens-page
- /cloud/update-deployment-guide
- /repo/fix-sidebar-layout-shift
- /repo/add-agents-md

Anti-examples (and why)
- /doc/update-middlewares — `/doc` is not a valid prefix; use `/cms`
- /docs/new-feature — `/docs` is not a valid prefix; use `/cms` or `/cloud`
- /feat/add-page — `/feat` is not a valid prefix; use the area-based prefix
- update-middlewares — missing prefix entirely

Pushing and PRs
- When pushing a new branch, set upstream: `git push -u origin <branch>` (this does not create a PR).
- Open PRs only when explicitly requested and follow the title/description rules above.
- Titles must not start with feat:/chore:/fix:; use action verbs or clear feature nouns.
- PR descriptions must start with “This PR …” and remain minimal; bullets allowed; no sections.

Optional Validation Hints
- Disallow prefixes: `^(?:feat|chore|fix)\s*:`
- Allow optional bracket qualifier: `^(?:\[[^\]]+\]\s*)?`
- Require initial capital: `^(?:\[[^\]]+\]\s*)?[A-Z]`
- Flag too-short or vague titles (e.g., ≤ 2 words, “update stuff”).

Quick Checklist
- Commit messages: imperative, ≤ 80 chars, specific, no feat:/chore:/fix:.
- PR titles: verb or specific noun; concise; optional brackets OK; issues at end.
- Never rewrite or delete branches/history without explicit consent.
- No PRs unless explicitly requested.
