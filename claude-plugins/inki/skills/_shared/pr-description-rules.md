# Shared PR Description Rules

These rules apply to every PR description Pierre creates, in any repo. Specific repos can layer stricter rules on top (see `doc-pr/SKILL.md` for the strapi/documentation overrides).

## Generate or rewrite a PR description

1. Start with "This PR ..."
2. 1-5 sentences or a short bullet list summarizing what and why.
3. No boilerplate sections (no "Summary", no "Test plan", no "Checklist").
4. Issue references at the end if provided (e.g., `Fixes #2143`). If documenting a strapi/strapi PR, mention it (e.g., `Documents [#pr-number](github.com/strapi/strapi/pr-link))

## Good descriptions (illustrative)

- `This PR documents the new hasPublishedVersion parameter added in strapi/strapi#2847. Adds parameter to the findMany() table, updates filtering description, adds usage tip. Fixes #2143`
- `This PR adds conditional retrieval rules to the Code Verifier and Coherence Checker agent prompts, and a new "separate facts from prose" behavioral note to the Drafter.`

## Anti-descriptions (and how to fix them)

- `## Summary\n\n## Test plan\n- [ ] Run tests` → headings and test plan are not allowed → flat prose only
- `Updated docs` → too vague → name what changed
- Empty description → always include at least one sentence
