# MermaidWithFallback component (live Mermaid diagram with a static image fallback)

Use `<MermaidWithFallback>` to embed a Mermaid diagram on a doc page with graceful degradation. The component fetches the diagram definition from an external `.mmd` file and renders it live. If Mermaid.js fails to load or render (syntax error, network failure, a tab that is not yet visible), it swaps in a static fallback image, a short notice, and a color-mode-aware "Download diagram" link.

## When to use

- You want a live, theme-aware Mermaid diagram (flowchart, sequence diagram, and so on) but also need a reliable static fallback when rendering fails.
- The diagram has light and dark variants, and you want the component to pick the right Mermaid theme and the right fallback image for the active color mode.
- The diagram lives inside Docusaurus `<Tabs>`/`<TabItem>`. The component watches tab visibility and re-renders when its tab becomes active, so it works in tabbed layouts (the primary real-world pattern, see `docs/cms/api/document.md`).

Author workflow:
1. Put the diagram definition in a `.mmd` file under `docusaurus/static/diagrams/`.
2. Generate light and dark PNG fallbacks under `docusaurus/static/img/assets/diagrams/`.
3. Reference all three via `chartFile`, `fallbackImage`, and `fallbackImageDark`.

## When NOT to use

- You want to write the diagram source inline. The component does NOT accept the diagram as children or a code fence. It only fetches a separate `.mmd` file via `chartFile`. For inline source with no fallback, use a plain ` ```mermaid ` fenced block (Docusaurus' built-in Mermaid support).
- You have no static fallback PNG to point `fallbackImage` at. Both the failure state and the download link assume one exists.
- The asset is a simple image, not a diagram. Use a normal image or `<ThemedImage>` instead.

## No import

- Do NOT add an import line for `<MermaidWithFallback>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js` (the default export of `docusaurus/src/components/MermaidWithFallback.js`, exposed under the key `MermaidWithFallback`), so it is available directly in any `.md`/`.mdx` page with no import.
- The JSX tag must be exactly `<MermaidWithFallback>`. The file's internal function name (`DocusaurusMermaidFileFallback`) is irrelevant to authors, and no aliases are registered.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chartFile` | `string` (site-root path to a `.mmd` file under `/static`) | (required) | Path to the external Mermaid diagram definition. The component `fetch()`es this URL at runtime and renders its trimmed contents. This is how you pass the diagram, never as children. It is also used to derive a unique render ID and CSS class. If it is omitted, the load effect is skipped (it is guarded by `if (chartFile)`), so the component never leaves the loading state and stays stuck on "Loading diagram..." (it does not crash). Example: `/diagrams/document.mmd`. |
| `fallbackImage` | `string` (image URL path) | (required) | Static image shown when Mermaid fails to load or render, and the target of the "Download diagram" link. Example: `/img/assets/diagrams/document.png`. |
| `fallbackImageDark` | `string` (image URL path) | `undefined` (falls back to `fallbackImage`) | Optional dark-mode variant of the fallback image and download link. Used instead of `fallbackImage` when the color mode is `dark` and this is set. Example: a `*_DARK.png` file. |
| `alt` | `string` | `'Diagram (fallback image)'` | Alt text for the fallback `<img>`. |
| `className` | `string` | `undefined` (state-dependent default) | Overrides the wrapper `div` class. When omitted, the component picks `mermaid-loading-container` while loading, `mermaid-fallback-container` on failure, and `mermaid-container` on success (the success wrapper also appends a unique `mermaid-container-<sanitizedChartFile>` class). |

## Rules

1. **No import line.** The component is globally registered (see above). A page may carry a redundant import for historical reasons, but do not add or reintroduce one.
2. **`chartFile` and `fallbackImage` are required in practice.** Without `chartFile`, the load effect never runs, so the component never leaves the "Loading diagram..." state (it does not crash, but it never shows anything useful). Without `fallbackImage`, both the failure state and the download link break, since both rely on it.
3. **Paths are site-root-relative and resolved against `static/`.** `chartFile="/diagrams/foo.mmd"` maps to `docusaurus/static/diagrams/foo.mmd`; `fallbackImage="/img/assets/diagrams/foo.png"` maps to `docusaurus/static/img/assets/diagrams/foo.png`. The `.mmd` and PNG assets must actually exist, otherwise the page falls straight through to the fallback notice.
4. **Self-close the tag.** Write `<MermaidWithFallback ... />`. It takes no children.
5. **Surround it with blank lines.** It is a block-level JSX element. Leave a blank line before and after it. When nested inside `<TabItem>`, leave a blank line between the `<TabItem ...>` tag, the component, and the closing `</TabItem>` so MDX parses it correctly.
6. **Live rendering is client-side only and theme-aware.** Mermaid is loaded with a dynamic `import('mermaid')` and `securityLevel: 'loose'`, with a built-in failure-detection timeout (3 seconds) and tab-visibility logic. Console logging during this process is expected.
7. **The fallback image is intentionally not zoomable.** `medium-zoom` was deliberately removed (see the comment in the source). Do not try to re-enable zoom on it.
8. **The download link text is color-mode aware.** On failure (and on success) the component renders a link reading "Download diagram (light version)" or "Download diagram (dark version)" depending on the active color mode, pointing at the dark or light fallback image. Do not expect a single fixed "Download diagram" label. The failure state also renders a fixed notice ("the diagram couldn't be rendered, probably due to a Mermaid.js issue. A static image is displayed instead.") with a link to mermaid.js.org.

## Canonical examples

### Standalone in prose

From `docs/cms/customization.md`:

<MermaidWithFallback
    chartFile="/diagrams/customization.mmd"
    fallbackImage="/img/assets/diagrams/customization.png"
    fallbackImageDark="/img/assets/diagrams/customization_DARK.png"
    alt="Customization diagram"
/>

### Inside Tabs/TabItem

From `docs/cms/api/document.md`. Note the `className="tabs--allow-multiline"` on `<Tabs>` and the blank lines around each component and between TabItems (the real page has four TabItems; two are shown here for brevity):

<Tabs className="tabs--allow-multiline">
<TabItem value="document-only" label="Neither i18n nor Draft & Publish enabled">

<MermaidWithFallback
    chartFile="/diagrams/document.mmd"
    fallbackImage="/img/assets/diagrams/document.png"
    fallbackImageDark="/img/assets/diagrams/document_DARK.png"
    alt="Document diagram (no Draft & Publish, no i18n)"
/>

</TabItem>

<TabItem value="i18n-and-dandp" label="i18n + Draft & Publish enabled" default>

<MermaidWithFallback
    chartFile="/diagrams/document-draft-locales.mmd"
    fallbackImage="/img/assets/diagrams/document-draft-locales.png"
    fallbackImageDark="/img/assets/diagrams/document-draft-locales_DARK.png"
    alt="Document diagram (only Draft & Publish, no i18n)"
/>

</TabItem>
</Tabs>
