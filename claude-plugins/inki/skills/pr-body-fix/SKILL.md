---
name: pr-body-fix
description: "Alias for /doc-pr-description-fix. Rewrite the body/description of one or more open PRs on strapi/documentation."
argument-hint: "[PR#] [PR#] ..."
user-invocable: true
---

# /doc-pr-body-fix — alias for /doc-pr-description-fix

This skill is a convenience alias. The gh CLI uses the word "body" for what `/doc-pr-description-fix` rewrites. Both names invoke the same workflow.

## What this skill does

Read and follow `../pr-description-fix/SKILL.md` end to end. Pass `$ARGUMENTS` through unchanged.

That is the full content of the skill. The alias exists only to match gh CLI terminology; behavior is identical to `/doc-pr-description-fix`.
