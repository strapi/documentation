# CustomDocCard component (clickable navigation cards)

Use `<CustomDocCard>` for a clickable card that sends the reader to another page: a section hub, a list of related guides, a set of provider pages. Wrap several cards in `<CustomDocCardsWrapper>` to lay them out as a grid. It is the most used custom component in the docs (around 150 cards), so match the surrounding page rather than inventing a variant.

## When to use

- A hub page that hands the reader off to its sub-pages (`cms/intro.md`, `cms/customization.md`).
- A list of sibling guides or providers where each entry is one page (`snippets/media-library-providers-list.md`, the deployment guides on `cms/deployment.md`).
- A single prominent onward link that deserves more weight than a prose link (`cms/configurations/environment.md` uses a one-card wrapper).

## When NOT to use

- The closing "what to read next" block of a tutorial. Use `<NextSteps>` instead (see `next-steps.md`); it numbers the steps and is the convention for that block.
- An unordered "see also" list inside a section. Prose links or a bullet list read better and cost less vertical space.
- Anything that is not a link. The whole card is a link, so a card with no `link` renders as a dead box.

## No import

- Do NOT add an import line. `CustomDocCard`, `CustomDocCardsWrapper` and `ExpandableDocCardsWrapper` are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js`, so they work directly in any `.md`/`.mdx` page.
- The names are case-sensitive in MDX and have no aliases.

## Props

`docusaurus/src/components/CustomDocCard.js` destructures exactly these 5 props. Anything else is ignored silently, with no build error and no visible sign on the page.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | (none) | The card label, rendered as its `<h2>`. Always supply it. |
| `link` | `string` | (none) | Target of the card. Internal paths start with `/` and carry no `.md` extension (`/cms/deployment/guides/nginx`); external links are full URLs. |
| `description` | `string` | (none) | One-line explanation under the title. Optional: without it the card is a title-only box. |
| `icon` | `string` | (none) | A Phosphor icon name, rendered as `ph-fill ph-<icon>` before the title (`icon="plug"`, `icon="arrow-square-out"`). See `icon.md` for the icon set. |
| `small` | boolean | `false` | Adds the `custom-doc-card--small` modifier, for the compact full-width variant used in stacked lists outside a wrapper. |

### Wrappers

| Component | Effect |
|-----------|--------|
| `<CustomDocCardsWrapper>` | Lays the cards out as an auto-fitting grid (`repeat(auto-fill, minmax(min(240px, 100%), 1fr))`), so the same block renders as 2 columns at normal width and more in max-width mode, and collapses to 1 column on mobile. |
| `<ExpandableDocCardsWrapper>` | Same grid, but shows only the first `initialVisible` cards (default 4) behind a "See more..." toggle. Use it for long provider lists. |

## Rules

1. **There is no `emoji` prop.** `<CustomDocCard emoji="🔗" … />` renders a card with no icon at all, and nothing reports the mistake. Use `icon` with a Phosphor name instead; `icon="arrow-square-out"` is the house icon for an outbound link. The confusion comes from `<SubtleCallout>`, which *does* take an `emoji`. The `unknown-card-prop` rule in `scripts/style-lint.sh` catches this.
2. **Keep descriptions to one short line.** The description renders inside `text--truncate`, so it is clipped to a single line with an ellipsis. Do not paste the page's frontmatter `description` verbatim: rewrite it to fit, around 60 to 70 characters.
3. **Be consistent within a block.** Every card in one wrapper should carry the same set of props. A grid where some cards have a description and others do not, or where only some have an icon, reads as broken rather than as emphasis.
4. **`small` belongs outside a wrapper.** The compact variant is for the stacked, full-width lists. Inside `<CustomDocCardsWrapper>` the grid already sizes the cards, and the canonical wrapper usages do not pass `small`.
5. **Blank lines around the wrapper.** Leave a blank line after the opening `<CustomDocCardsWrapper>` and before the closing tag when the cards are separated by blank lines, so MDX parses the block predictably.

## Canonical examples

### A grid of sibling guides

From `docs/cms/deployment.md`:

```mdx
<CustomDocCardsWrapper>
<CustomDocCard icon="plugs-connected" title="Proxying with Nginx" description="Serve Strapi through an Nginx reverse proxy over HTTPS." link="/cms/deployment/guides/nginx" />
<CustomDocCard icon="repeat" title="Using the PM2 process manager" description="Keep Strapi running with PM2, and start it again after a reboot." link="/cms/deployment/guides/pm2" />
</CustomDocCardsWrapper>
```

### The multi-line form

From `docs/snippets/media-library-providers-list.md`. Both forms are accepted; the multi-line one reads better past 3 props:

```mdx
<CustomDocCardsWrapper>
<CustomDocCard
  icon="plug"
  title="Amazon S3"
  description="Official provider for file uploads to Amazon S3."
  link="/cms/configurations/media-library-providers/amazon-s3"
/>
</CustomDocCardsWrapper>
```

### A single onward card

From `docs/cms/configurations/environment.md`. A one-card wrapper is a legitimate way to give one link card weight:

```mdx
<CustomDocCardsWrapper>
<CustomDocCard icon="chalkboard-simple" title="Access and cast variables" description="Learn how to access and cast environment variables with the env() utility." link="/cms/configurations/guides/access-cast-environment-variables" />
</CustomDocCardsWrapper>
```
