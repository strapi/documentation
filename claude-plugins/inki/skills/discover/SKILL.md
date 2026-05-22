---
name: discover
description: "Top-level discover orchestrator: combines exists, route, and coverage to give a complete picture before writing."
argument-hint: "<topic, feature name, or strapi/strapi PR>"
user-invocable: true
---

# /inki:discover — pre-writing scout

**Autonomy Tier: 1.**

## Workflow

Given `$ARGUMENTS`, classify the input:
- Looks like a topic/keyword → invoke `/inki:exists $ARGUMENTS`
- Looks like a feature/module name → invoke `/inki:coverage $ARGUMENTS`
- Looks like a strapi/strapi PR (number or URL) → invoke `/inki:route $ARGUMENTS`

If the input is ambiguous, run more than one and label sections clearly.

## Output

Combine sub-reports under labeled sections:

```
=== Existing coverage ===
<output of /inki:exists, if invoked>

=== Feature gaps ===
<output of /inki:coverage, if invoked>

=== Code change routing ===
<output of /inki:route, if invoked>
```

Conclude with a single recommended next step (e.g., "Run /inki:write" or "Skip — already documented at <path>").
