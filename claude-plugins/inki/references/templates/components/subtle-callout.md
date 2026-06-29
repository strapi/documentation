# SubtleCallout component (low-emphasis "good to know" asides)

Use `<SubtleCallout>` for friendly, low-emphasis asides that point readers to related concepts or background reading without the strong visual weight of a standard Docusaurus admonition (`:::note` / `:::tip`). It renders a muted admonition-style box with a custom emoji and title on the heading line.

## When to use

- A short, optional aside that nudges the reader toward a related concept or background reading, not a must-read warning.
- The recurring "Related concept(s)" sidebars in the `backend-customization/examples/*` guides. This is the house style there.
- Short "good to know" explainers in API guides, where you want a gentle callout rather than a colored `:::note`/`:::tip` box.
- Inside layout components like `<SideBySideColumn>`, where it composes cleanly.

## When NOT to use

- Warnings, cautions, or anything the reader must not miss. Use a real Docusaurus admonition (`:::caution`, `:::warning`, `:::danger`) instead. `SubtleCallout` is deliberately de-emphasized.
- Primary procedural content or any must-read information that needs strong color and contrast.
- Anything that needs the admonition colon syntax (`:::`). This is a JSX component, not an admonition directive.

## No import

- Do NOT add an import line for `<SubtleCallout>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js` (imported from `../components/SubtleCallout`), so it is available directly in any `.md`/`.mdx` page with no import.
- Never write `import SubtleCallout from '@site/src/components/SubtleCallout'`. It is redundant and inconsistent with the rest of the codebase.
- It is registered under exactly one name, `SubtleCallout`, with no aliases. The name is case-sensitive in MDX.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` (React node) | (none) | Heading text shown on the callout's heading line, rendered right after the emoji (e.g. `title="Related concept"`). Not technically required by the source, but every real usage supplies it. Omitting it leaves the heading with just the emoji. |
| `emoji` | `string` | 🤓 | The icon rendered at the start of the heading line, inside a `fontWeight:300` span. Defaults to the nerd-face emoji when not provided. The only live override in the docs is an explicit `"🤓"`; a `"📍"` override exists only in commented-out code. |
| `children` | React node (MDX body) | (none) | The body of the callout, rendered after the heading. In MDX this is the Markdown between the opening and closing tags. |

## Rules

1. **Always supply a `title`.** Every real usage does. Without it the heading shows only the emoji.
2. **It is not an admonition directive.** `<SubtleCallout>` is a plain `<div>` that reuses admonition CSS classes (`theme-admonition theme-admonition--callout theme-admonition--subtle`) to look like a muted admonition. It does NOT get the standard admonition icon, the colored left border or background of `:::note`/`:::tip`, collapsibility, or type-based styling. Only what the `--subtle`/`--callout` modifiers provide.
3. **Leave blank lines around the body.** Put a blank line after the opening `<SubtleCallout …>` tag and before the closing `</SubtleCallout>` so MDX parses the body as Markdown. Links and lists inside render correctly only when surrounded by blank lines. Content can begin on the line immediately after the opening tag (as `understanding-populate.md` does), but blank-line separation is the safer, dominant convention.
4. **Keep blank lines at every boundary when nesting.** When placing it inside layout wrappers like `<SideBySideColumn>`, keep blank lines around each component boundary.
5. **Reserve it for low emphasis.** If the content is a warning or must-read, use a real admonition instead.

## Canonical examples

### Short "good to know" explainer in an API guide

From `docs/cms/api/rest/guides/understanding-populate.md`. The body begins on the line immediately after the opening tag (no blank line after the opening tag), then runs across several paragraphs and a bulleted list before a blank line and the closing tag:

<SubtleCallout emoji="🤓" title="Different populating strategies for similar results">
Depending on your content structure, you might get similar data presented in different ways with different queries. ...

- query articles and populate categories ...
- query categories and populate both articles and restaurants ...

The 2 different strategies are illustrated in the following diagram:

![Diagram](/img/assets/rest-api/populate-foodadvisor-diagram3.png)

</SubtleCallout>

### "Related concept" aside inside a layout column

From `docs/cms/backend-customization/examples/authentication.md`, nested inside `<SideBySideColumn>` with blank lines around each boundary:

<SideBySideColumn>

<SubtleCallout title="Related concept">

Additional information about JWT authentication can be found in the [Users & Permissions plugin](/cms/features/users-permissions) documentation.

</SubtleCallout>

</SideBySideColumn>

This `title="Related concept"` / `title="Related concepts"` pattern recurs across the `backend-customization/examples/*` guides (`services-and-controllers.md`, `middlewares.md`, `routes.md`, `policies.md`).

### Custom emoji

A `📍` emoji override exists in `docs/cloud/getting-started/intro.md`, but note it is currently inside an HTML comment block (`<!-- ... -->`) and therefore not rendered. The only live emoji override in the docs is the explicit `emoji="🤓"` in `understanding-populate.md` shown above. The commented-out form looks like this:

<SubtleCallout title="Strapi Cloud & Strapi CMS docs" emoji="📍">

There are 2 Strapi documentations, one for each Strapi product:
...

</SubtleCallout>
