## Outliner

### Overview

The Outliner is a **wrapper prompt** that handles all documentation structure tasks. It routes requests to specialized sub-prompts based on the user's intent and the review depth required.

### Sub-prompts

| Sub-prompt | File | Purpose |
|------------|------|---------|
| **Outline Checker** | `outline-checker.md` | Verify structure against templates (technical compliance) |
| **UX Analyzer** | `outline-ux-analyzer.md` | Evaluate structure from reader's perspective |
| **Outline Generator** | `outline-generator.md` *(coming soon)* | Create new structure from source material |

---

### Review Modes

The Outliner supports two review modes based on the scope of changes:

| Mode | Sub-prompts Used | When to Use | Trigger Phrases |
|------|------------------|-------------|-----------------|
| **Quick Check** | Outline Checker only | Minor changes, small PRs, adding sections to existing pages | "quick check", "check outline", "verify structure" |
| **Full Review** | Outline Checker + UX Analyzer | New pages, major restructuring, pages >300 lines | "full review", "full outline check", "review structure and UX" |

#### Mode Selection Logic

```
User request
    │
    ├─► New page OR major restructuring OR explicit "full review"?
    │       └─► Run **Full Review** (Checker + UX Analyzer)
    │
    ├─► Minor changes OR quick check requested?
    │       └─► Run **Quick Check** (Checker only)
    │
    └─► Ambiguous?
            └─► Ask user: "Quick check or full review?"
```

#### Automatic Full Review Triggers

Run Full Review automatically when:
- File is **new** (not modifying existing page)
- PR diff shows **>50% of file changed**
- Document exceeds **300 lines**
- User explicitly requests "full review" or "UX analysis"

---

### Routing Logic

```
User request
    │
    ├─► Contains existing content/PR to review?
    │       │
    │       ├─► Quick Check mode
    │       │       └─► Route to **Outline Checker**
    │       │
    │       └─► Full Review mode
    │               └─► Route to **Outline Checker** → then **UX Analyzer**
    │
    └─► Contains source material (Notion, Jira, specs) to transform?
            └─► Route to **Outline Generator** (coming soon)
```

---

### Output Structure

#### Quick Check Output

```markdown
## Outline Check Report — [filename]

### Document Type
[Detected type]

### Summary
- Errors: X
- Warnings: Y
- Suggestions: Z

### Violations
[List of issues]

### Recommended Fixes (by priority)
[Prioritized fixes]
```

#### Full Review Output

```markdown
## Outline Check Report — [filename]

### Document Type
[Detected type]

### Summary
- Errors: X
- Warnings: Y
- Suggestions: Z

### Violations
[List of issues from Outline Checker]

---

## User Experience Analysis

### Overall UX Score: 🟢/🟠/🔴

### 1. Title vs. Content Alignment
[Assessment]

### 2. Information Architecture
[Assessment]

### 3. Navigability & Discoverability
[Assessment]

### 4. Section Proportions
[Assessment]

### 5. Onboarding & Context
[Assessment]

### 6. Cognitive Load
[Assessment]

---

## Recommended Fixes (by priority)

1. **[error]** [Technical fixes first]
2. **[warning]** [Warnings second]
3. **[ux-high]** [High-impact UX fixes]
4. **[suggestion]** [Style suggestions]
5. **[ux-medium]** [Medium-impact UX fixes]
6. **[ux-low]** [Nice-to-have UX improvements]
```

---

### Trigger Patterns

**Route to Quick Check when:**
- User says: "check outline", "verify structure", "quick check", "template compliance"
- PR has minor changes to existing page
- User provides content without specifying review depth

**Route to Full Review when:**
- User says: "full review", "full outline check", "check structure and UX", "review from user perspective"
- New documentation page
- Major restructuring (>50% changes)
- Long document (>300 lines)

**Route to Outline Generator when:**
- User provides source material (Notion doc, Jira ticket, GitHub issue, specs)
- User says: "create outline", "draft structure", "what sections should this have?"
- User wants to start a new documentation page from scratch

---

### Usage Examples

#### Example 1: Quick check on a PR

```
User: "Check the outline of PR #2930"

Outliner: 
  → Detects: PR modifying existing page (minor addition)
  → Routes to: Outline Checker only
  → Returns: Technical compliance report
```

#### Example 2: Full review on a new page

```
User: "Outline check on this new page: [pastes content]"

Outliner: 
  → Detects: New page (no existing file)
  → Routes to: Outline Checker → UX Analyzer
  → Returns: Combined technical + UX report
```

#### Example 3: Explicit full review request

```
User: "Full review of this page structure please"

Outliner: 
  → Detects: Explicit "full review" request
  → Routes to: Outline Checker → UX Analyzer
  → Returns: Combined report
```

#### Example 4: Ambiguous request

```
User: "Can you check this page?"

Outliner: 
  → Detects: Ambiguous scope
  → Asks: "Would you like a quick check (template compliance only) 
           or a full review (including UX analysis)?"
```

#### Example 5: Create new outline

```
User: "I need to document the new Scheduler feature. Here's the Notion spec: [link]"

Outliner: 
  → Detects: Source material provided, no existing content
  → Routes to: Outline Generator
  → Returns: Recommended outline with sections and content hints
```

---

### Integration with Other Prompts

The Outliner works within the broader documentation review system:

```
┌─────────────────────────────────────────────────────────────┐
│                     REVIEW SYSTEM                           │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌───────────┐         ┌───────────┐
   │  QUICK  │         │   FULL    │         │  CREATE   │
   │ REVIEW  │         │  REVIEW   │         │   FLOW    │
   └────┬────┘         └─────┬─────┘         └─────┬─────┘
        │                    │                     │
        ▼                    ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Outline     │    │   Outline     │    │   Outline     │
│   Checker     │    │   Checker     │    │   Generator   │
└───────┬───────┘    └───────┬───────┘    └───────────────┘
        │                    │
        │                    ▼
        │            ┌───────────────┐
        │            │ UX Analyzer  │
        │            └───────┬───────┘
        │                    │
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│ Style Checker │    │ Style Checker │
│  (optional)   │    │  (optional)   │
└───────────────┘    └───────────────┘
```

#### Prompt Responsibilities

| Prompt | Responsibility | Does NOT handle |
|--------|----------------|-----------------|
| **Outline Checker** | Template compliance, frontmatter, heading hierarchy, components, Diataxis | Prose quality, UX evaluation |
| **UX Analyzer** | Reader perspective, section order, navigability, proportions, cognitive load | Technical compliance, prose quality |
| **Style Checker** | Prose quality, 12 Rules, formatting, tone | Structure, UX |

---

### Behavioral Notes

1. **Determine review mode first**: Before analyzing, decide if this is a Quick Check or Full Review based on the triggers above.

2. **State the mode explicitly**: Always tell the user which mode you're using and why.
   > "Running a **Full Review** because this is a new page."

3. **Ask when ambiguous**: If the user's intent is unclear, ask whether they want a quick check or full review.

4. **Respect context limits**: For LLMs with limited context, Quick Check mode allows useful analysis without loading the UX Analyzer prompt.

5. **Combine reports cleanly**: In Full Review mode, merge Outline Checker and UX Analyzer outputs into a single coherent report.

6. **Prioritize fixes logically**: Errors → Warnings → High-impact UX → Suggestions → Medium/Low UX.

7. **Don't duplicate work**: Outline Checker handles technical structure; UX Analyzer handles reader experience. Don't repeat the same issues in both.

8. **Stay in scope**: Structure and UX only — no prose quality (Style Checker), no link checking (Integrity Checker).