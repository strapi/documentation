# Icon component (inline Phosphor icons in prose)

Use `<Icon>` inline in prose to reference a UI element the reader sees in the Strapi admin panel - a navigation entry, a button, or a settings gear - so the doc mirrors the actual interface. It is self-closing and renders a single Phosphor icon glyph that flows with the surrounding text and, by default, inherits the text color.

## When to use

- You want to point at a UI element the reader sees in the admin panel, so the prose matches what is on screen.
- In a `**Path to configure the feature:**` line, before the settings entry (e.g. `<Icon name="gear-six" /> Settings`).
- Inside a numbered step, before the name of a button the user must click.
- Inside a heading, to mark a part or section visually (e.g. `## <Icon name="rocket-launch"/> Part A: ...`).

## When NOT to use

- For decorative or large standalone imagery. Use a real image or screenshot instead.
- For callout/admonition leading icons. The `:::callout` / admonition syntax already styles those.
- For a color-meaningful status indicator that must survive a docs redesign. Colors are hardcoded inline RGB values and are not theme-aware.
- With an invented icon name. Only Phosphor Icons (web v2.x) names are valid; a wrong name silently renders nothing.

## No import

- Do NOT add an import line for `<Icon>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js` (imported from `../components/Icon` and added to the components map), so it is available directly in any `.md`/`.mdx` page with no import.
- No aliases are registered. The separate `InfoIcon` folder and `CheckBoxIcon.svg` are unrelated components, not aliases of `Icon`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | (none) | Required. The Phosphor icon name WITHOUT the `ph-` prefix; it is interpolated into the class as `ph-${name}`. Examples seen in docs: `rocket-launch`, `wrench`, `plus`, `gear-six`, `images`, `eye`, `seal-check`, `check-circle`, `confetti`, `layout`. Any valid Phosphor Icons (web) name works. Omitting it produces an empty `ph-undefined` class. |
| `classes` | `string` | `ph-fill` | The Phosphor weight/style class. The component always emits a constant base class `strapi-icons` first, then this `classes` value, then `ph-${name}` (rendered as `<i className={`strapi-icons ${classes} ph-${name}`}>`). Override it to pick another weight: `ph-bold` (bold) or `ph` (regular). Only the regular, fill, and bold stylesheets are loaded in `docusaurus.config.js`, so those three weights render reliably; thin, light, and duotone will not. The string is injected verbatim after `strapi-icons`, so `classes="ph ph-plus"` works but is redundant with the separate name interpolation. |
| `color` | `string` | `inherit` | CSS color applied via inline `style={{color}}`. The default `inherit` makes the icon match the surrounding text color. Pass any valid CSS color value, e.g. `color="rgb(58,115,66)"` (green, for verified/published states) or `color="#7B79FF"`. |

## Rules

1. **Pass the Phosphor name without the `ph-` prefix.** The component prepends it (`ph-${name}`). Writing `name="ph-plus"` wrongly produces `ph-ph-plus` and renders nothing.
2. **Always self-close the tag.** Write `<Icon ... />`. Both `name="x"/>` and `name="x" />` spacing styles appear in docs and both work.
3. **Keep it on the same line as surrounding inline text.** It is a JSX tag inside Markdown; a blank line before or after it breaks the inline flow. It is safe inside headings, list items, table cells, and mid-sentence because it outputs an inline `<i>` element that sits on the text baseline.
4. **Use only loaded weights.** Set `classes="ph-bold"` or `classes="ph"` for non-filled icons; other Phosphor weights will not render.
5. **Verify the icon name against the Phosphor Icons catalog.** The component does no validation, so a misspelled name fails silently with a blank glyph.

## Canonical examples

### Inside a heading

```mdx
## <Icon name="rocket-launch"/> Part A: Create a new project with Strapi
```

### Inside a numbered step, before a button

```mdx
3. Click on the <Icon name="plus" classes="ph ph-plus"/> plus icon next to **Collection types**.

1. Click the <Icon name="plus" classes="ph-bold" /> **New Release** button in the upper right corner.
```

### In a configuration path line

```mdx
**Path to configure the feature:** <Icon name="gear-six" /> Settings > Global Settings > Media Library.
```

### As a colored status indicator in a list

```mdx
- <Icon name="seal-check" color="rgb(58,115,66)" /> to indicate it was verified by Strapi.
```
