# Drafter — Interface specification

Interface specification defining what the Drafter expects as input for each operating mode. The Outline Generator (upstream) and Router must conform to this spec when producing data for the Drafter.

---

## Mode selection

The Drafter does not choose its mode. The mode is determined by the target's `priority` and `action` from the Router output:

| Target priority | Action | Drafter mode |
|---|---|---|
| `primary` | `create_page` or `add_section` (substantial) | **Compose** |
| `required` | `update_section` or `add_section` (small) | **Patch** |
| `optional` / cross-links | `add_link`, `update_text`, `add_mention` | **Micro-edit** |
| `conditional` | any | Deferred — resolved to one of the above after `ask_user` |

**Edge case:** If a `primary` target has action `update_section` and the update is substantial (e.g., rewriting a full section), it still uses **Compose** mode. The Outline Generator decides this by producing an outline — if an outline exists for the target, the Drafter uses Compose.

**Rule:** If an outline is provided → Compose. If no outline → Patch or Micro-edit based on scope.

---

## Common inputs (all modes)

These fields are always present, regardless of mode:

```yaml
# From the Router
doc_type: feature | plugin | configuration | guide | api | ...
template: agents/templates/feature-template.md    # or null
guide: agents/cms/features/AGENTS.md               # or null
key_topics: [topic1, topic2]

# Target being processed
target:
  path: cms/features/media-library.md
  action: add_section | update_section | create_page
  priority: primary | required | optional
  existing_section: "Usage > Filtering assets"     # or null
  notes: "Add focal point section under Usage."

# Source material (always passed through)
source_material: |
  [The original input: PR diff, spec, ticket content, etc.
   Passed verbatim from the user's initial request.
   The Drafter uses this as the authoritative reference
   for technical accuracy.]
```

### Notes on common inputs

- `template` and `guide`: The Drafter uses these to match the tone, formatting conventions, and structural patterns of the target section. If both are null, it falls back to the 12 Rules of Technical Writing.
- `source_material`: The raw input, passed as-is from the user's initial request. The Router and Outline Generator add structure and placement decisions, but they do not filter or transform the source material. **However**, the Drafter should not treat the entire source material equally: the `source_refs` fields in the outline point to the specific passages relevant to each section. The Drafter uses `source_refs` as its primary guide for what to write, and consults the full source material only to verify context or resolve ambiguities. This keeps the Drafter focused even when the source material is large.
- `existing_section`: A heading path (e.g., `"Usage > Filtering assets"`) that tells the Drafter where in the existing page to operate. Null for new pages.

---

## Output format (all modes)

All 3 modes produce **Markdown content** wrapped in a standardized envelope. The Drafter does not produce YAML output (unlike the Router). The envelope uses HTML comments — invisible at render time — so the output is valid Markdown that can be used as-is.

```markdown
<!-- drafter:mode=compose target=cms/features/mcp-server.md action=create_page -->

[Markdown content here]

<!-- drafter:notes
- TODO: Confirm exact plan name for MCP feature availability
- TODO: Add screenshot of MCP configuration panel
-->
```

### Envelope fields

| Field | Description |
|---|---|
| `mode` | `compose`, `patch`, or `micro-edit` |
| `target` | File path from `target.path` |
| `action` | Action from `target.action` |

The `drafter:notes` block is optional. It captures TODOs, unresolved gaps, and anything that requires human attention before publishing. These notes come from the Outline Generator's `drafter_notes` (in Compose mode) or from the Drafter's own analysis (in Patch/Micro-edit mode).

This format is consistent across all 3 modes — only the content between the header and the notes block changes.

---

## Mode 1: Compose

**When:** The Drafter writes substantial new content — a full page or a major new section.

**Input: outline** (from Outline Generator)

```yaml
outline:
  action: create_page | add_section
  insert_after: "## Existing heading"   # only for add_section, null for create_page

  # Frontmatter values — only for create_page
  frontmatter:
    title: "Page title"
    description: "One-sentence description."
    displayed_sidebar: cmsSidebar
    tags:
      - tag1
      - tag2

  # The heading skeleton with content directives per section.
  sections:
    - heading: "# Page title"
      level: 1
      intent: "Brief statement of this section's purpose."
      content_hints:
        - "What to cover in this section."
      source_refs:
        - "Reference to specific part of source material."
      components:
        - "<Tldr>"
      subsections:
        - heading: null
          level: null
          intent: "Introductory content between H1 and first H2."
          content_hints:
            - "One-paragraph introduction."
            - "IdentityCard component with feature metadata."
          components:
            - "<IdentityCard>"
          subsections: []
        - heading: "## Section name"
          level: 2
          intent: "..."
          content_hints: [...]
          source_refs: [...]
          components: [...]
          subsections:
            - heading: "### Subsection name"
              level: 3
              intent: "..."
              content_hints: [...]
              source_refs: [...]
              components: [...]
              subsections: []

  # Free-text notes from the Outline Generator
  drafter_notes: |
    1. **Gap — Plan information:** Source material does not specify whether
       this is a Free or Growth feature. Confirm with PM before publishing.
    2. **Ambiguity — Transport protocol:** PRD mentions stdio, RFC specifies
       HTTP. Outline follows RFC as the current technical design.
    3. **Cross-links:** Link to Access Tokens documentation when available.
```

### Outline format specification

Each section node contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string \| null | yes | The Markdown heading including level markers (`##`, `###`), or `null` for component-only nodes (intro blocks, `<IdentityCard>`, etc.). |
| `level` | integer \| null | yes | Heading depth (1, 2, 3, 4), or `null` when `heading` is `null`. Redundant with `heading` but explicit for validation. |
| `intent` | string | yes | One sentence: what this section must accomplish for the reader. |
| `content_hints` | list[string] | yes | Specific directives for what to write. These are instructions, not prose. |
| `source_refs` | list[string] | no | Pointers to relevant parts of the source material. Free-text references. |
| `components` | list[string] | no | MDX/JSX components the section should use (e.g., `<ThemedImage>`, `<Tabs>`). |
| `subsections` | list[section] | no | Nested sections following the same schema. |

### Top-level outline fields

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | yes | `create_page` or `add_section`. Must match `target.action` from common inputs. |
| `insert_after` | string \| null | yes | For `add_section`: the existing heading after which new content is inserted. Equivalent to `target.existing_section` from common inputs — both are provided for cross-validation. Null for `create_page`. |
| `frontmatter` | object \| null | conditional | Required for `create_page` (title, description, displayed_sidebar, tags). Null or omitted for `add_section`. |
| `sections` | list[section] | yes | The heading tree following the section node schema above. |
| `drafter_notes` | string \| null | no | Free-text notes from the Outline Generator: gaps in source material, ambiguities, cross-link suggestions, and anything the Drafter should know before writing. Passed as-is from the OG report's "Notes for Drafter" section. |

### Field equivalence note

The outline contains `action` and `insert_after` which overlap with `target.action` and `target.existing_section` from the Router's common inputs. This is intentional: the Outline Generator sets these based on its own analysis, and the Drafter can cross-validate that both sources agree. In case of conflict, `target` (from Router) takes precedence, since the Router is the authoritative source for placement decisions.

### What the Outline Generator must NOT include

- Actual prose or drafted sentences (that is the Drafter's job).
- Style rules or formatting instructions (the Drafter has its own reference to the 12 Rules and the style guide).
- Information not present in the source material (no hallucinated content hints).

### Compose output

The Drafter produces complete Markdown content ready to be inserted or used as a new page. The output includes:

- Frontmatter (for `create_page` only, using values from `outline.frontmatter`).
- All sections from the outline, fully written.
- Appropriate MDX components as specified.

**Insertion point:** For `add_section` on an existing page, the `insert_after` field from the outline (or `target.existing_section` from common inputs) tells the Drafter where the new content goes. The Drafter outputs only the new content block, not the entire page.

---

## Mode 2: Patch

**When:** The Drafter makes targeted edits to an existing page — updating a table, correcting a statement, adding a row, rewriting a paragraph.

**Input: existing_content + patch_instructions**

The Drafter is responsible for fetching `existing_content` when it is not provided directly. In the manual pipeline, the user may paste it; in the orchestrated pipeline, the Drafter fetches it from the repository using GitHub MCP tools.

```yaml
existing_content: |
  [The current content of the section being modified.
   Fetched from the repository — either the full page
   or the relevant section identified by existing_section.]

patch_instructions:
  # What to change, derived from Router notes + source material.
  # Each instruction is a discrete edit.
  - type: replace
    target: "The `count()` method does not support filtering by publication status."
    replacement: "The `count()` method supports filtering by publication status using the `hasPublishedVersion` parameter."
    reason: "Statement is now factually incorrect after the new parameter was added."

  - type: add_row
    target: "findOne() parameters table"
    content:
      parameter: "`hasPublishedVersion`"
      type: "Boolean"
      description: "Filter entries that have at least one published version."
    position: after_last   # or: after:"status", before:"first"

  - type: add_text
    target: "## Usage"            # heading to insert after
    position: end                 # start | end | after:"specific text"
    content: |
      :::tip
      You can combine `hasPublishedVersion` with other filters for more precise queries.
      :::
```

### Patch instruction types

| Type | Description | Required fields |
|---|---|---|
| `replace` | Replace a specific text passage with new text | `target` (text to find), `replacement` |
| `add_row` | Add a row to an existing table | `target` (table identifier), `content` (key-value pairs matching columns) |
| `add_text` | Insert a block of text at a position | `target` (heading or text anchor), `position`, `content` |
| `remove` | Delete a specific text passage | `target` (text to find) |
| `update_code` | Modify a code block | `target` (code block identifier — language + nearest heading), `replacement` |

### Patch instruction derivation

The Drafter derives `patch_instructions` itself from `source_material` + `target.notes`. No separate "Patch Planner" step is needed — the Router's notes provide sufficient context for the Drafter to formulate discrete edits (e.g., "add `hasPublishedVersion` parameter to the findOne() table" → `add_row` instruction).

**Key constraint:** The Drafter in Patch mode must have access to `existing_content`. It cannot guess what the current page says. When not provided by the user, the Drafter fetches it using GitHub MCP tools or the `fetch` tool.

### Patch output

The Drafter produces one of:

- **A list of find-and-replace pairs** (human-reviewable, easy to apply manually).
- **The rewritten section** (the full section with edits applied, for larger patches).

The choice depends on patch complexity: fewer than 3 discrete edits → find-and-replace list. More than 3, or edits that interact → rewritten section.

---

## Mode 3: Micro-edit

**When:** The Drafter makes a minimal insertion — a link, a tip callout, a cross-reference mention.

**Input: micro_instruction**

```yaml
micro_instruction:
  action: add_link | add_mention | add_tip | update_text
  target_page: cms/features/draft-and-publish.md
  target_section: "## Usage"      # where to insert
  position: end                    # start | end | after:"specific text"
  content: |
    For filtering by publication status at the API level, see [hasPublishedVersion](/cms/api/document-service/status#haspublishedversion).
  context: "Cross-link from draft-and-publish to the new hasPublishedVersion parameter."
```

### Micro-edit is self-contained

Unlike Compose and Patch, Micro-edit does not require `existing_content` in most cases. The instruction contains everything needed:

- Where to insert (page + section + position).
- What to insert (the exact content).
- Why (context for human review).

The Drafter's job in Micro-edit mode is minimal: validate that the instruction makes sense (e.g., the target section exists) and output the insertion in an applicable format.

### Micro-edit output

A single insertion instruction:

```markdown
**File:** `cms/features/draft-and-publish.md`
**Action:** Insert at end of "## Usage"
**Content:**
> For filtering by publication status at the API level, see [hasPublishedVersion](/cms/api/document-service/status#haspublishedversion).
```

---

## Summary: Input requirements by mode

| Field | Compose | Patch | Micro-edit |
|---|---|---|---|
| Common inputs (Router YAML) | ✅ | ✅ | ✅ |
| `source_material` | ✅ | ✅ | ❌ (optional) |
| `outline` (from Outline Generator) | ✅ **required** | ❌ | ❌ |
| `outline.frontmatter` | ✅ (for `create_page`) / ❌ (for `add_section`) | ❌ | ❌ |
| `outline.drafter_notes` | ✅ (if OG produced notes) | ❌ | ❌ |
| `existing_content` (fetched page) | ❌ (for `create_page`) / ✅ (for `add_section`) | ✅ **fetched by Drafter** | ❌ (optional) |
| `patch_instructions` | ❌ | ✅ **derived by Drafter** | ❌ |
| `micro_instruction` | ❌ | ❌ | ✅ **required** |

---

## Outline Generator compliance

The Outline Generator must produce outlines conforming to the `sections` schema defined above. Specifically: `heading` and `level` accept `null` for component-only nodes, `frontmatter` is required for `create_page` actions, and `drafter_notes` captures gaps and ambiguities as free text. See the Outline Generator prompt for the full output specification.

---

## Resolved decisions

These questions were resolved during design (2025-02-11) and are documented here for context.

### 1. Patch derivation

**Decision:** The Drafter derives `patch_instructions` itself from `source_material` + `target.notes`. No separate "Patch Planner" step.

**Rationale:** The Router's notes provide sufficient context (e.g., "add `hasPublishedVersion` to the parameters table"), and testing confirms the Drafter can reliably interpret source material into discrete edits. Adding a Patch Planner would introduce pipeline complexity without measurable gain.

### 2. Existing content fetching

**Decision:** The Drafter is responsible for fetching `existing_content` when it is not provided. In the manual pipeline, the user may paste it directly. In the orchestrated pipeline, the Drafter fetches it using GitHub MCP tools or the `fetch` tool.

**Rationale:** Having the Drafter fetch content at the moment it needs it avoids staleness issues (content changing between Orchestrator fetch and Drafter execution). It also keeps the Drafter self-sufficient — it can operate in both manual and orchestrated pipelines without interface changes.

### 3. Output format standardization

**Decision:** All 3 modes produce Markdown with a standardized HTML comment envelope (see "Output format" section above). The Drafter does not produce YAML — that is the Router's domain.

**Rationale:** HTML comments are invisible at render time, so the output is valid Markdown that can be used directly. The consistent envelope (mode, target, action + optional notes) lets a future Orchestrator parse outputs uniformly without mode-specific logic.

### 4. Validation loop

**Decision:** v1 uses manual re-runs. If the Style Checker finds issues, the user decides whether to re-run the Drafter with the Style Checker report as additional input.

**Future enhancement:** The Orchestrator may support an `auto_retry: once` option — if the Style Checker reports errors (not warnings or suggestions), the Drafter re-runs once with the Style Checker report injected as context. Maximum 1 retry, never more. This prevents infinite loops while catching clear violations (e.g., "easy" slipping through, missing backticks on file paths).

**Rationale:** Automated re-runs are valuable but risky if unbounded. A single retry with a severity threshold (errors only) balances automation with predictability.