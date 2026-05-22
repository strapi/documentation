# Shared PR Description Rules

These rules apply to every PR description the user creates, in any repo. Specific repos can layer stricter rules on top (see `doc-pr/SKILL.md` for the strapi/documentation overrides).

## Generate or rewrite a PR description

1. Start with "This PR ..."
2. 1-5 sentences or a short bullet list summarizing what and why.
3. No boilerplate sections (no "Summary", no "Test plan", no "Checklist").
4. Issue references at the end if provided (e.g., `Fixes #2143`).
5. If documenting a `strapi/strapi` PR, add a `Documents` reference at the end with a markdown link, e.g., `Documents [#26847](https://github.com/strapi/strapi/pull/26847)`.

## Good descriptions (illustrative)

- `This PR documents the new hasPublishedVersion parameter added in strapi/strapi#2847. Adds parameter to the findMany() table, updates filtering description, adds usage tip. Fixes #2143`
- `This PR adds conditional retrieval rules to the Code Verifier and Coherence Checker agent prompts, and a new "separate facts from prose" behavioral note to the Drafter.`
- `This PR adds the documentation for the new openapi.json route. Documents [#26823](https://github.com/strapi/strapi/pull/26823)`

## Anti-descriptions (and how to fix them)

- `## Summary\n\n## Test plan\n- [ ] Run tests` → headings and test plan are not allowed → flat prose only
- `Updated docs` → too vague → name what changed
- Empty description → always include at least one sentence
