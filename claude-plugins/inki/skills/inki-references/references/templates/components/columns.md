# Columns component (two-up side-by-side layout)

Use `<Columns>` with `<ColumnLeft>` and `<ColumnRight>` to place two pieces of content side by side on wide screens, typically a before/after comparison or two equivalent variants.

## When to use

- You have exactly two pieces of content that read best next to each other: a before/after comparison or two equivalent variants.
- Real-world cases: GraphQL "works vs does not work" examples, populate-as-object vs populate-as-array, and v4-to-v5 "Before / After" entity-service-to-document-service migration snippets.
- The content stacking vertically on narrow screens is acceptable. The two-up layout is a wide-screen enhancement: the flex rules only apply at the `medium-up` breakpoint, so below it the columns stack.

## When NOT to use

- More than two columns. There is no grid or count prop, and the SCSS assumes two equal halves (`max-width: 50%` each); a third column would compress the layout.
- Content that must read in a single linear order on every viewport. Below `medium-up` the columns stack, so the left-then-right reading order is not guaranteed visually.
- General content-card layouts. Use `CustomDocCard` / `DocCardList` for cards, or `SideBySideColumn` / `SideBySideContainer` for the API reference two-column layout.

## No import

- Do NOT add an import line for `<Columns>`, `<ColumnLeft>`, or `<ColumnRight>`. All three are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js`, so they are available directly in any `.md`/`.mdx` page with no import.
- The registered aliases are `ColumnLeft` and `ColumnRight`. Always use those wrappers. Do not use a bare `<Column>`: the shared internal component (`docusaurus/src/components/Column.js`) is not registered globally and will not render in docs.

## Props

`<Columns>` itself accepts only `children`. The `title` and `side` props live on the inner `<Column>` component that `<ColumnLeft>` and `<ColumnRight>` wrap. The flex container also applies `justify-content: space-between` and a gap of `var(--strapi-spacing-4)` between the two columns at `medium-up`.

| Prop | Component | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `children` | `<Columns>` | `ReactNode` (MDX content) | (required) | The `<ColumnLeft>` and `<ColumnRight>` wrappers. |
| `children` | `<ColumnLeft>` / `<ColumnRight>` | `ReactNode` (MDX content) | (required) | The column body content (Markdown/MDX), rendered inside `.column__content`. |
| `title` | `<ColumnLeft>` / `<ColumnRight>` | `string` | `''` (empty) | Optional bold heading rendered above the column content in a `.column__title` div. The `.column__title` div is always present in the DOM (empty when no title is passed). Unused across all real docs; prefer an in-content Markdown heading or bold (e.g. `**Before:**`) instead. |
| `side` | `<ColumnLeft>` / `<ColumnRight>` | `'left'` \| `'right'` | `'left'` | Internal only. `<ColumnLeft>` hardcodes `side="left"` and `<ColumnRight>` hardcodes `side="right"`, setting the `column--left` / `column--right` class. Never set this directly; use the `<ColumnLeft>` / `<ColumnRight>` wrappers. |

## Rules

1. **Wrap exactly two children.** A single `<Columns>` contains one `<ColumnLeft>` and one `<ColumnRight>`, in that order. Do not add a third column.
2. **Keep the nesting strict.** The structure is `<Columns>` wrapping `<ColumnLeft>...</ColumnLeft>` and `<ColumnRight>...</ColumnRight>`. Do not use a bare `<Column>`.
3. **Surround inner content with blank lines.** Leave a blank line after the opening `<ColumnLeft>`/`<ColumnRight>` tag and a blank line before the closing tag, so MDX parses the body as Markdown (bold, paragraphs, fenced code blocks). Without the blank lines, lists and code fences inside a column may not render.
4. **Use `<br/>` for forced line breaks** inside a column, self-closing, as in the populate guide.
5. **Prefer in-content Markdown over the `title` prop.** The `.column__title` div renders regardless (it is always present in the DOM, empty when no title is passed), and no real page uses `title`. Use `**Before:**` or a Markdown heading inside the column instead.
6. **Do not add an import line.** See the No import section above.

## Canonical examples

### Before / after comparison (v4-to-v5 migration)

From `docs/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service.md` (used six times in that file). Note the blank lines around the inner content.

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.findOne(uid, entityId);
```

</ColumnLeft>
<ColumnRight>

**After:**

```tsx
strapi.documents(uid).findOne({
  documentId: "__TODO__"
});
```

</ColumnRight>
</Columns>

### Two equivalent variants (REST populate)

From `docs/cms/api/rest/guides/understanding-populate.md`. Note the `<br/>` for the forced line break.

<Columns>
<ColumnLeft>

Populate as an object<br/>(to populate 1 relation several levels deep):

```json
{
  populate: {
    category: {
      populate: ['restaurants'],
    },
  },
}
```

</ColumnLeft>
<ColumnRight>

Populate as an array<br/>(to populate many relations 1 level deep)

```json
{
  populate: [
    'articles',
    'restaurants'
  ],
}
```

</ColumnRight>
</Columns>

### Works vs does not work (GraphQL)

From `docs/cms/api/graphql.md`. Both sides query `restaurants_connection`; the "does not work" side fails because it nests a `pageInfo` block inside the `categories_connection` relation, which is not supported.

<Columns>
<ColumnLeft>

This works:

```graphql
{
  restaurants_connection {
    nodes {
      documentId
      name
      categories_connection {
        nodes {
          documentId
          name
        }
      }
    }
    pageInfo {
      page
      pageCount
      pageSize
      total
    }
  }
}
```

</ColumnLeft>
<ColumnRight>

This does not work:

```graphql
{
  restaurants_connection {
    nodes {
      documentId
      name
      categories_connection {
        nodes {
          documentId
          name
        }
        # not supported
        pageInfo {
          page
          pageCount
          pageSize
          total
        }
      }
    }
    pageInfo {
      page
      pageCount
      pageSize
      total
    }
  }
}
```

</ColumnRight>
</Columns>
