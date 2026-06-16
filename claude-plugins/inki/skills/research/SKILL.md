---
name: research
description: "Top-level research orchestrator: combines exists, route, and coverage to give a complete picture before writing."
argument-hint: "[--no-log] <topic, feature name, or strapi/strapi PR>"
user-invocable: true
---

# /inki:research — pre-writing research

## Step 0: Logging

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:document`), write into that run's existing directory instead of creating a new one.

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
