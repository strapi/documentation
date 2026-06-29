# Badge component (feature availability and status flags)

Use a Badge to flag the availability or status of a feature next to a heading or inside a table or sentence. In practice you never write the raw `<Badge>` element: you always use one of the pre-configured named alias variants, which set the variant text, link, icon, and tooltip for you.

## When to use

- Flagging the plan or pricing tier a feature requires: `<GrowthBadge />`, `<EnterpriseBadge />`, `<SsoBadge />` for self-hosted, and `<CloudEssentialBadge />`, `<CloudProBadge />`, `<CloudScaleBadge />` for Strapi Cloud.
- Flagging the maturity of a feature: `<AlphaBadge />`, `<BetaBadge />`.
- Flagging an experimental feature gated behind a future flag: `<FeatureFlagBadge feature="flagName" />`.
- Flagging the minimum Strapi version a feature requires: `<VersionBadge version="5.42.0" />`.
- Flagging content freshness: `<NewBadge />`, `<UpdatedBadge />`.
- Inside a Markdown heading, placed before the `{#anchor}` token (e.g. `## Strapi AI <NewBadge /> {#strapi-ai}`).
- Chained, space-separated, on a single line to combine several flags (e.g. `<GrowthBadge /> <EnterpriseBadge/> <VersionBadge version="5.0.0" />`).

## When NOT to use

- Do not use the raw default `<Badge>` element. It is not registered as a global MDX component (only the named alias functions are), so a bare `<Badge variant="..." />` will not resolve and the page will fail to build.
- Do not invent variants that do not exist. There is no `FreeBadge` and no `CloudDevBadge`. The Strapi Cloud Free plan is represented by the absence of any badge: if no badge is shown, the feature is available on the Free plan.
- Do not place a badge where its tooltip would be cut off, or where the default tooltip is wrong without overriding it via the `tooltip` prop.
- Do not use a badge in a context that needs plain text, such as inside a code block.

## No import

- Do NOT add an import line for any badge. They are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js` (alongside `<Tabs>`, `<Annotation>`, `<StepDetails>`), so they are available directly in any `.md`/`.mdx` page with no import.
- The registered alias variants are: `AlphaBadge`, `BetaBadge`, `FeatureFlagBadge`, `EnterpriseBadge`, `GrowthBadge`, `SsoBadge`, `NewBadge`, `UpdatedBadge`, `CloudEssentialBadge`, `CloudProBadge`, `CloudScaleBadge`, and `VersionBadge`. Use these names; never write the raw `<Badge>` element.

## Props

These props belong to the underlying `<Badge>` component. The alias variants pre-fill most of them, so authors usually set only `feature`, `version`, `tooltip`, or `noTooltip`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `''` | The badge label text and CSS modifier. Lowercased and stripped of non-word characters to build the `badge--{variant}` class (the outer span always also carries the base `badge` and `badge--feature` classes). Real values are supplied by the aliases: `Alpha`, `Beta`, `Enterprise`, `Growth`, `SSO`, `Pro`, `Scale`, `Essential`, `New`, `Updated`, a feature flag name, or a version string. `New` and `Updated` also add the `badge--content` class and render an icon plus a `badge__text` span. |
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
3. **Do not invent variants.** Stick to the twelve registered aliases. There is no `FreeBadge` and no `CloudDevBadge`; the Cloud Essential alias is `CloudEssentialBadge`.
4. **Badges are self-closing JSX.** Write `<NewBadge />`. A space before `/>` is fine, and `<GrowthBadge/>` also works.
5. **Inside a heading, place the badge before the `{#anchor}` token.** For example, `## Strapi AI <NewBadge /> {#strapi-ai}`.
6. **Use `noTooltip` in tables and headings** where a hover tooltip would be awkward or cut off (e.g. `<FeatureFlagBadge feature="FeatureFlagName" noTooltip />`).
7. **`feature` and `version` override the variant-based class.** Setting `feature` forces `badge--featureflag` and setting `version` forces `badge--version`; these win over the `variant`-derived class.
8. **Override the tooltip when the default is wrong.** Pass `tooltip="..."` to replace the pre-filled text rather than leaving an inaccurate default.

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

A Strapi Cloud feature in beta, available on the Pro and Scale plans:

```mdx
#### Transferring data between environments <BetaBadge /> {#transferring-data-between-environments}
<CloudProBadge /> <CloudScaleBadge />
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
