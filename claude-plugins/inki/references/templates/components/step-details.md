# StepDetails component (collapsible numbered steps)

Use `<StepDetails>` on tutorial and quick-start pages to wrap a single numbered step as a collapsible block. Each step gets a clickable header (the step title) and a body that readers can expand or collapse. The block also carries a completion checkmark so readers can track progress through the tutorial.

When to use
- One `<StepDetails>` wraps exactly one step. Use a sequence of them for a step-by-step procedure (Step 1, Step 2, …), not for general prose.
- Reserve it for tutorial / quick-start flows. Do not use it as a generic accordion — for collapsible reference content that is not a step, use a plain `<details>`.

No import
- Do NOT add an import line for `<StepDetails>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js` (alongside `<Tabs>`, `<Annotation>`, `<ApiCall>`, `<NextSteps>`), so it is available directly in any `.md`/`.mdx` page with no import.
- Likewise, never add `import StepDetails from '@site/src/components/StepDetails/StepDetails'`. A page may still carry that line for historical reasons, but it is redundant and being removed — do not reintroduce it.

Props
- `title` (string, required) — the step header text. It is slugified with `github-slugger` (the same slugger Docusaurus uses for heading anchors) into the block's anchor `id`, so a `#step-...` deep link resolves to the block. The id is registered via `useBrokenLinks().collectAnchor`, so the broken-anchor checker knows the anchor exists. Keep the title stable: changing it changes the anchor and breaks inbound links.
- `defaultOpen` (boolean, bare) — when present, the step renders expanded on load. Write it bare (`defaultOpen`), not `defaultOpen={true}`. Omit it for steps that should start collapsed. Typically only the first step is `defaultOpen`.
- `children` — the step content (normal MDX: prose, numbered lists, images, code blocks, an inner `<details>`).

Nesting rule
- Leave a blank line after the opening `<StepDetails …>` tag and a blank line before the closing `</StepDetails>` so MDX parses the children as Markdown. Without the blank lines, lists and fenced code blocks inside the step will not render correctly.

Inner details vs. step wrapper
- Only the outer step wrapper is `<StepDetails>`. An inner collapsible that is not itself a step — for example, an example API response tucked away under the step — stays a plain `<details>`/`<summary>`. Do not nest one `<StepDetails>` inside another.

Title with quotes
- A title may contain a double-quoted attribute value with single quotes inside (`title='Step 1: Create a "Restaurant" collection type'`), or use HTML entities for the quotes (`title="…&quot;Restaurant&quot;…"`). Pick whichever keeps the attribute valid; both render the same.

Canonical examples

## Sequence of steps (first one expanded)

`defaultOpen` on the first step renders it expanded; later steps start collapsed.

<StepDetails title="Step 1: Run the installation script and create a Strapi Cloud account" defaultOpen>

... step content (prose, numbered lists, images) ...

</StepDetails>

<StepDetails title='Step 1: Create a "Restaurant" collection type'>

... content ...

</StepDetails>

<StepDetails title="Step 2: Create an entry for the &quot;Restaurant&quot; collection type">

... content ...

</StepDetails>

## Step with an inner plain `<details>`

The step wrapper is `<StepDetails>`; the example API response stays a plain `<details>`. Note the blank lines around both the inner content and the fenced code block.

<StepDetails title="Step 6: Use the API">

There you are: the list of restaurants should be accessible by visiting the `/api/restaurants` path ...

<details>
<summary>Click me to view an example of API response:</summary>

```json
{
  "data": [
    { "id": 3, "documentId": "wf7m1n3g8g22yr5k50hsryhk", "Name": "Biscotte Restaurant" /* ...trimmed... */ }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 1 } }
}
```

</details>

</StepDetails>
