# Shared PR Description Rules

These rules apply to every PR description created on strapi/documentation.

## Generate or rewrite a PR description

1. Must start with "This PR ...".
2. 1-3 sentences or a short bullet list summarizing what and why.
3. Flat text only: no headings (no `##`, no `###`), no boilerplate sections (no "Summary", no "Test plan", no "Checklist").
4. Issue references near the end if provided, e.g., `Fixes #2143`.
5. If documenting a `strapi/strapi` PR, add a `Documents` reference with a markdown link, e.g., `Documents [#26847](https://github.com/strapi/strapi/pull/26847)`.
6. End with a Vercel preview link on its own last line: `Direct preview link 👉 [here](https://<deployment>.vercel.app/<page-path>)`. When references and a preview link both exist, references come first and the preview link is the very last line.

## Good descriptions (illustrative)

- `This PR documents the new hasPublishedVersion parameter added in strapi/strapi#2847. Adds parameter to the findMany() table, updates filtering description, adds usage tip. Fixes #2143`
- `This PR adds conditional retrieval rules to the Code Verifier and Coherence Checker agent prompts, and a new "separate facts from prose" behavioral note to the Drafter.`
- `This PR adds the documentation for the new openapi.json route. Documents [#26823](https://github.com/strapi/strapi/pull/26823)`

## Anti-descriptions (and how to fix them)

- `## Summary\n\n## Test plan\n- [ ] Run tests` → headings and test plan are not allowed → flat prose only
- `Updated docs` → too vague → name what changed
- Empty description → always include at least one sentence
