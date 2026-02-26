---
title: TEMPLATE — Configuration Title
displayed_sidebar: cmsSidebar
description: One-sentence summary of what this configuration controls.
tags:
  - configuration
---
# Template — Configuration Title

<Tldr>
What this setting does, where the file lives, and key options at a glance.
</Tldr>

<!-- Optional: add a :::caution callout if changes require a rebuild or restart. -->

The `/config/<area>.(js|ts)` file is used to define [what it configures] for a Strapi application.

<!-- 
  STRUCTURE GUIDANCE
  ==================
  Configuration pages do NOT follow a single fixed H2 skeleton.
  H2 sections are thematic — they depend on the scope and complexity
  of the configuration area being documented.

  Common core (always present):
  - Frontmatter, H1, <Tldr>, intro paragraph naming file path(s)

  Then choose H2s based on content scale:

  SMALL pages (e.g., API configuration — single file, few options):
  - No H2s needed. Use a parameter table + example directly under the intro.

  MEDIUM pages (e.g., server, features — one file, moderate options):
  - 2–3 H2s, e.g.:
    ## Available options
    ## Configurations  (examples: minimal + full)

  LARGE pages (e.g., admin-panel, database — many sub-domains):
  - Multiple thematic H2s, each covering a sub-domain with its own
    parameter table and examples, e.g.:
    ## Admin panel behavior
    ## Admin panel server
    ## API tokens
    ## Authentication
    ## Configuration examples

  BUILDING BLOCKS (use where applicable):
  - Parameter tables: Parameter | Description | Type | Default
  - Environment variable tables: Variable | Purpose | Type | Default
  - JS/TS Tabs for code examples (<Tabs groupId="js-ts">)
  - Per-environment overrides (/config/env/{environment}/...)
  - :::caution / :::note / :::tip callouts
  - <details> for advanced or edge-case examples

  Delete this comment block before publishing.
-->

<!-- PATTERN A: Small configuration (no H2s needed) -->

| Parameter     | Description                          | Type     | Default   |
| ---           | ---                                  | ---      | ---       |
| `optionName`  | What it controls and caveats         | `String` | `'value'` |

**Example:**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/config/<area>.js"
module.exports = ({ env }) => ({
  optionName: env('ENV_VAR', 'default'),
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/config/<area>.ts"
export default ({ env }) => ({
  optionName: env('ENV_VAR', 'default'),
});
```

</TabItem>

</Tabs>

<!-- PATTERN B: Medium configuration (2–3 thematic H2s) -->

<!--
## Available options

| Parameter     | Description                          | Type     | Default   |
| ---           | ---                                  | ---      | ---       |
| `optionName`  | What it controls                     | `String` | `'value'` |

## Configurations

Provide minimal and/or full configuration examples with file paths.

<Tabs>
<TabItem value="minimal" label="Minimal configuration">
...
</TabItem>
<TabItem value="full" label="Full configuration">
...
</TabItem>
</Tabs>
-->

<!-- PATTERN C: Large configuration (multiple thematic H2s) -->

<!--
## [Sub-domain 1 name]

Description of this sub-domain.

| Parameter     | Description                          | Type     | Default   |
| ---           | ---                                  | ---      | ---       |
| `optionName`  | What it controls                     | `String` | `'value'` |

## [Sub-domain 2 name]

...

## Configuration examples

Provide minimal and full examples with Tabs.
-->