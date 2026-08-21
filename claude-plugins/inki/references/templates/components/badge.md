# Badge component (feature availability and status flags)

Use a Badge to flag the availability or status of a feature next to a heading or inside a table or sentence. In practice you never write the raw `<Badge>` element: you always use one of the pre-configured named alias variants, which set the variant text, link, icon, and tooltip for you.

## When to use

- Flagging the plan or pricing tier a feature requires: `<GrowthBadge />`, `<EnterpriseBadge />`, `<SsoBadge />` for self-hosted, and `<CloudStarterBadge />`, `<CloudProBadge />`, `<CloudBusinessBadge />` for Strapi Cloud.
- Flagging the maturity of a feature: `<AlphaBadge />`, `<BetaBadge />`.
- Flagging an experimental feature gated behind a future flag: `<FeatureFlagBadge feature="flagName" />`.
- Flagging the minimum Strapi version a feature requires: `<VersionBadge version="5.42.0" />`.
- Flagging content freshness: `<NewBadge />`, `<UpdatedBadge />`.
- Inside a Markdown heading, placed before the `{#anchor}` token (e.g. `## Strapi AI <NewBadge /> {#strapi-ai}`).
- Chained, space-separated, on a single line to combine several flags (e.g. `<GrowthBadge /> <EnterpriseBadge/> <VersionBadge version="5.0.0" />`).

## When NOT to use

- Do not use the raw default `<Badge>` element. It is not registered as a global MDX component (only the named alias functions are), so a bare `<Badge variant="..." />` will not resolve and the page will fail to build.
- Do not invent variants that do not exist. There is no `FreeBadge` and no `CloudDevBadge`. If no Cloud plan badge is shown, the feature is available on the Starter plan.
- Do not place a badge where its tooltip would be cut off, or where the default tooltip is wrong without overriding it via the `tooltip` prop.
- Do not use a badge in a context that needs plain text, such as inside a code block.

## No import

- Do NOT add an import line for any badge. They are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js` (alongside `<Tabs>`, `<Annotation>`, `<StepDetails>`), so they are available directly in any `.md`/`.mdx` page with no import.
- The registered alias variants are: `AlphaBadge`, `BetaBadge`, `FeatureFlagBadge`, `EnterpriseBadge`, `GrowthBadge`, `SsoBadge`, `NewBadge`, `UpdatedBadge`, `CloudStarterBadge`, `CloudProBadge`, `CloudBusinessBadge`, and `VersionBadge`. Use these names; never write the raw `<Badge>` element.

## Props

These props belong to the underlying `<Badge>` component. The alias variants pre-fill most of them, so authors usually set only `feature`, `version`, `tooltip`, or `noTooltip`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `''` | The badge label text and CSS modifier. Lowercased and stripped of non-word characters to build the `badge--{variant}` class (the outer span always also carries the base `badge` and `badge--feature` classes). Real values are supplied by the aliases: `Alpha`, `Beta`, `Enterprise`, `Growth`, `SSO`, `Pro`, `Business`, `Starter`, `New`, `Updated`, a feature flag name, or a version string. `New` and `Updated` also add the `badge--content` class and render an icon plus a `badge__text` span. |
| `feature` | `string` | (none) | When set, the badge gets the `badge--featureflag` class (overriding the variant-based class). Used by `FeatureFlagBadge`: the feature flag name becomes the variant and is interpolated into the tooltip text. Write e.g. `<FeatureFlagBadge feature="experimental_firstPublishedAt" />`. |
| `version` | `string` | (none) | When set, the badge gets the `badge--version` class (overriding the variant-based class). Used by `VersionBadge`: the version string becomes the variant and is interpolated into a "requires Strapi version X or later" tooltip. Write e.g. `<VersionBadge version="5.42.0" />`. |
| `tooltip` | `string` | (none) | Tooltip text rendered in a `badge__tooltip` span, unless `noTooltip` is true. Aliases pre-fill plan- and feature-specific tooltips; you can override them (e.g. `<GrowthBadge tooltip="The CMS Growth plan includes ..." />`). |
| `noTooltip` | `boolean` | `false` | Suppresses the tooltip span and adds the `badge--no-tooltip` class. Common in tables and headings, e.g. `<FeatureFlagBadge feature="FeatureFlagName" noTooltip />`. |
| `link` | `string` | `''` | If set (and `noLink` is false), the badge renders as an `<a href={link}>` link. Aliases pre-fill this (e.g. `EnterpriseBadge`, `GrowthBadge`, and `SsoBadge` point to `https://strapi.io/pricing-self-hosted`; the Cloud aliases point to `https://strapi.io/pricing-cloud`; `FeatureFlagBadge` points to `/cms/configurations/features`). |
| `noLink` | `boolean` | `false` | Forces the non-link (plain span) rendering even when a `link` prop is present. |
| `inline` | `boolean` | `false` | Adds the `badge--inline` class for rendering in line with surrounding text. |
| `icon` | `string` | (none) | Icon name passed to the `<Icon>` component. Pre-filled by aliases (e.g. `FeatureFlagBadge` uses `toggle-right`, `EnterpriseBadge` and `GrowthBadge` use `feather`, `SsoBadge` uses `plus`, the Cloud aliases use `cloud`, `NewBadge` uses `confetti`, `UpdatedBadge` uses `pencil-simple`). |
| `iconClasses` | `string` | (none) | Passed to `<Icon>` as its `classes` prop when present (e.g. `SsoBadge` uses `ph ph-plus ph-bold`). |
| `className` | `string` | (none) | Extra CSS class merged onto the outer badge span via `clsx`. |
| `children` | `node` | (none) | Rendered verbatim after the badge's variant text or link, inside the outer span. Rarely used by authors; the badge label comes from the `variant` prop, not from children. |

## Rules

1. **Never write the raw `<Badge>` element.** Only the named aliases are registered, so a bare `<Badge>` will not resolve. Always pick the alias that matches your intent.
2. **Never add an import line.** All twelve aliases are global MDX components. Do not write `import Badge ...` or import any alias by name.
3. **Do not invent variants.** Stick to the twelve registered aliases. There is no `FreeBadge` and no `CloudDevBadge`; the Cloud Starter alias is `CloudStarterBadge`.
4. **Badges are self-closing JSX.** Write `<NewBadge />`. A space before `/>` is fine, and `<GrowthBadge/>` also works.
5. **Inside a heading, place the badge before the `{#anchor}` token.** For example, `## Strapi AI <NewBadge /> {#strapi-ai}`.
6. **Use `noTooltip` in tables and inline in prose**, where a hover tooltip would be awkward or cut off (e.g. `<FeatureFlagBadge feature="FeatureFlagName" noTooltip />`). Under a heading, keep the tooltip: see "Placement: heading versus inline" below.
7. **`feature` and `version` override the variant-based class.** Setting `feature` forces `badge--featureflag` and setting `version` forces `badge--version`; these win over the `variant`-derived class.
8. **Override the tooltip when the default is wrong.** Pass `tooltip="..."` to replace the pre-filled text rather than leaving an inaccurate default.

## Placement: heading versus inline

`VersionBadge` (and any badge) has two distinct placements. Picking the wrong one is a common mistake, so decide first which case you are in.

### Case 1: the badge qualifies a whole section or page

Put the badge **on its own line, directly under the heading**, and **keep the tooltip**. The heading has room for it, and the tooltip is what tells the reader what the version actually gates.

```mdx
## Filter content types during transfer

<VersionBadge version="5.50.3" />

The `--exclude-content-types` and `--only-content-types` options let you …
```

When the heading introduces a *newly documented behavior* rather than a brand-new option, override the tooltip so readers do not conclude the whole feature is new:

```mdx
## What a transfer replaces and preserves

<VersionBadge version="5.52.2" tooltip="The preserve-versus-replace behavior described below is clarified and logged by the CLI since Strapi 5.52.2." />
```

Chain plan and version badges on that same line when several flags apply:

```mdx
# Content History

<GrowthBadge /> <EnterpriseBadge/> <VersionBadge version="5.0.0" />
```

### Case 2: the badge qualifies one sentence, row, or option

Put the badge **on the same line as the content it qualifies**, and add **`noTooltip`**: an inline tooltip overlaps the surrounding text and gets cut off. Since the tooltip is no longer there to carry the meaning, weave the badge into the sentence so it reads as part of the prose, rather than parking it at the start of the line.

```mdx
With Strapi <VersionBadge version="5.42.1+" noTooltip />, for localizable relations, Strapi automatically fetches the corresponding entry in the target locale if it exists.
```

Same rule inside a table cell:

```mdx
| `--only-content-types` | <VersionBadge version="5.50.3" noTooltip /> Comma-separated list of content-type UIDs to include. |
```

### Quick decision

| The badge applies to… | Placement | Tooltip |
|---|---|---|
| A heading's whole section or page | Own line, under the heading | Keep it; override the text when the version gates a clarified behavior rather than a new feature |
| One sentence, list item, or table row | Same line as the content | `noTooltip`, and state the version in the prose |

Do not put a badge on its own line in the middle of prose: it reads as applying to everything that follows, which is exactly what Case 1 means.

## Canonical examples

### Plan and version badges chained on one line

Several badges combine under a heading to show that a feature spans plans and requires a minimum version:

```mdx
<GrowthBadge /> <EnterpriseBadge/> <VersionBadge version="5.0.0" />
```

### Feature flag badge in a heading

A feature gated behind a future flag, placed before the heading anchor:

```mdx
### Recording the first publication date <FeatureFlagBadge feature="experimental_firstPublishedAt" /> {#recording-the-first-publication-date}
```

### New badge in a heading

Flagging freshly added content:

```mdx
## Strapi AI <NewBadge /> {#strapi-ai}
```

### Cloud plan badges under a Beta heading

A Strapi Cloud feature in beta, available on the Pro and Business plans:

```mdx
#### Transferring data between environments <BetaBadge /> {#transferring-data-between-environments}
<CloudProBadge /> <CloudBusinessBadge />
```

### Feature flag badge with the tooltip suppressed

Inside reference prose or a table where the hover tooltip is not wanted:

```mdx
where the name of the feature flag to use is included in the badge (e.g., <FeatureFlagBadge feature="FeatureFlagName" noTooltip />).
```

### Growth badge with a custom tooltip

Overriding the default tooltip to describe what the plan includes:

```mdx
30-day trial of the <GrowthBadge tooltip="The CMS Growth plan includes the Live Preview, Releases, and Content History features." />
```
