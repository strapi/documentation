## Orchestrator

### Overview

The Orchestrator is the **master coordinator** for the Strapi documentation review system. It routes user requests to the appropriate workflow, coordinates the execution of multiple prompts in sequence, and consolidates their outputs into a unified report.

The Orchestrator does not perform any analysis itself — it delegates to specialized prompts.

---

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                             │
│         (coordinates all prompts based on user intent)          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │   REVIEW    │             │   CREATE    │
       │    MODE     │             │    MODE     │
       └──────┬──────┘             └──────┬──────┘
              │                           │
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │   Router    │             │   Router    │
       └──────┬──────┘             └──────┬──────┘
              │                           │
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │  Outliner   │             │  Outliner   │
       │  (Checker)  │             │ (Generator) │
       └──────┬──────┘             └──────┬──────┘
              │                           │
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │   Style     │             │   Drafter   │
       │   Checker   │             └──────┬──────┘
       └──────┬──────┘                    │
              │                           ▼
              ▼                    ┌─────────────┐
       ┌─────────────┐             │   Style     │
       │  Integrity  │             │   Checker   │
       │   Checker   │             └──────┬──────┘
       └─────────────┘                    │
                                          ▼
                                   ┌─────────────┐
                                   │  Integrity  │
                                   │   Checker   │
                                   └─────────────┘
```

---

### Workflows

The Orchestrator supports two main workflows:

#### Review Mode (existing content)

**Trigger:** User provides existing documentation to review (PR, page, Markdown content)

**Sequence:**
```
Router → Outliner (Checker) → Style Checker → Integrity Checker
```

**Use cases:**
- Reviewing a PR before merge
- Checking an existing page for compliance
- Validating documentation after edits
- Final review before a release
- Auditing a section of the documentation

**Note:** The Outliner internally decides whether to run a quick check (structure only) or a full review (structure + UX analysis) based on document characteristics. See `outliner.md` for details.

---

#### Create Mode (new content)

**Trigger:** User provides source material to transform into documentation

**Sequence:**
```
Router → Outliner (Generator) → Drafter → Style Checker → Integrity Checker
```

**Use cases:**
- Creating documentation from a Notion spec
- Documenting a new feature from a Jira or Linear ticket
- Documenting code changes based on a GitHub pull request or git diff
- Writing a guide based on GitHub issues

---

### Prompt Responsibilities

| Prompt | Responsibility | Does NOT handle |
|--------|----------------|-----------------|
| **Orchestrator** | Route user intent to correct mode, coordinate prompts, consolidate reports | Any direct analysis |
| **Router** | Identify doc type, locate template, determine target path | Content analysis |
| **Outliner (Checker)** | Structure: sections, components, heading hierarchy, Diataxis; optionally UX analysis | Prose quality, links |
| **Outliner (Generator)** | Create outline from source material | Content writing |
| **Drafter** | Generate content from outline and source material | Structure decisions |
| **Style Checker** | Prose quality, 12 Rules, formatting, tone | Structure, links |
| **Integrity Checker** | Links, paths, anchors, code block syntax | Content quality |

---

### Handoff Rules

1. **Orchestrator → Prompts**: Orchestrator determines the mode (review/create) and calls prompts in sequence.

2. **Router → Outliner**: Router passes document type and template path; Outliner uses these for structure validation or generation.

3. **Outliner → Drafter** *(create mode only)*: Outline Generator passes the approved outline structure; Drafter fills in content.

4. **Outliner → Style Checker** *(review mode)*: Outliner completes structure check; Style Checker receives the same content for prose review.

5. **Style Checker → Integrity Checker**: Style Checker completes; Integrity Checker receives content for technical verification.

6. **All Prompts → Orchestrator**: Each prompt returns a structured report; Orchestrator consolidates into final output.

**Key principle:** Each prompt focuses on its domain. No prompt should duplicate another's checks.

---

### Trigger Patterns

#### Review Mode Triggers
- "review this PR"
- "check this page"
- "full review"
- "style check"
- "outline check"
- "verify this documentation"
- User pastes Markdown content or provides a PR link

#### Create Mode Triggers
- "create documentation for..."
- "document this feature"
- "write a guide based on..."
- "draft an outline from..."
- User provides Notion/Jira/GitHub links as source material

---

### Consolidated Report Format

When consolidating reports from multiple prompts, the Orchestrator produces:

```markdown
# Documentation Review Report

**File:** [filename or PR reference]
**Mode:** [Review / Create]
**Date:** [timestamp]

---

## Summary

| Check | Errors | Warnings | Suggestions |
|-------|--------|----------|-------------|
| Structure (Outliner) | X | Y | Z |
| Style (12 Rules) | X | Y | Z |
| Integrity (Links) | X | Y | Z |
| **Total** | **X** | **Y** | **Z** |

---

## Structure Issues
[Output from Outline Checker]

## Style Issues
[Output from Style Checker]

## Integrity Issues
[Output from Integrity Checker]

---

## Recommended Fixes (by priority)

1. **[error]** [Most critical fix]
2. **[error]** [Second critical fix]
3. **[warning]** [Important fix]
...
```

---

### Behavioral Notes

1. **Determine mode first**: Before calling any prompt, identify which mode applies based on user intent.

2. **State the mode explicitly**: Tell the user which mode is being executed.
   > "Running **Review Mode**: Router → Outliner → Style Checker → Integrity Checker"

3. **Execute prompts in sequence**: Each prompt must complete before the next one starts.

4. **Pass context forward**: Each prompt receives the output of the previous prompt(s) as context.

5. **Consolidate at the end**: Merge all prompt outputs into a single, unified report.

6. **Deduplicate issues**: If multiple prompts flag the same issue, include it only once in the final report.

7. **Prioritize by severity**: Final recommendations should list errors first, then warnings, then suggestions.

8. **Handle partial failures**: If one prompt fails or returns no issues, continue with the remaining prompts.

---

### Future Enhancements

- **Parallel execution**: Run independent prompts (e.g., Style Checker and Integrity Checker) in parallel
- **Incremental review**: Only run prompts relevant to the changed content in a PR
- **Custom workflows**: Allow users to define custom prompt sequences
- **Caching**: Cache Router results to avoid re-detecting document type