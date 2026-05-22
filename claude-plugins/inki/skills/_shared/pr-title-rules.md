# Shared PR Title Rules

These rules apply to every PR title the user creates, in any repo.

## Generate or rewrite a PR title

1. Start with an action verb (Add, Update, Fix, Document, Improve, Remove, Refactor, Rename, Clarify, Rework, Introduce, Allow) OR a specific feature noun phrase.
2. Optional bracket qualifier first (e.g., `[experimental]`).
3. No `feat:`, `chore:`, `fix:` prefix.
4. No ticket IDs or emojis as the core content.
5. Capitalize the first word.
6. Keep it at most 80 characters.
7. Be specific — name the area, page, or feature.

## Good titles (illustrative)

- `Checklist in SSO configuration documentation`
- `Document Service API intro rework: more details, updated structure`
- `Add tip about nested page hierarchies in Content-type Builder documentation`
- `Document auth fix for 5.24.0+`
- `[experimental] Allow setting a preferred AI toolbar default action`

## Anti-titles (and how to fix them)

- `Plugin documentation` → too vague → `Improve plugin documentation structure and navigation`
- `feat(upload): add documentation for new setting` → banned prefix → `Document new upload setting`
- `Update stuff` → too vague and lowercase → name what was updated and capitalize
