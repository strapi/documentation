# ExpandableContent component

Use `<ExpandableContent>` to progressively disclose long content that is supplementary to the main reading flow. The component renders the content behind a gradient fade, then shows a toggle button ("Show more…" / "Show less") to expand or collapse it.

## When to use

- A code example is long (typically more than 30–40 lines) and the reader can understand the surrounding explanation without reading it in full.
- An end-to-end or combined example is illustrative but not required to follow the section.
- A reference table or list is exhaustive and most readers only need the first few rows.

## When NOT to use

- The content is required reading to complete a task — do not hide procedural steps or mandatory configuration behind `<ExpandableContent>`.
- The content is short enough to display in full without disrupting the reading flow.
- The content is already inside another disclosure mechanism (e.g., a tab or an admonition).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxHeight` | `string` (CSS value) | `"200px"` | Height of the collapsed preview area. Increase for taller previews. |
| `showMoreText` | `string` | `"Show more…"` | Label for the expand button. |
| `showLessText` | `string` | `"Show less"` | Label for the collapse button. |

Do not pass a `title` prop — the component has no title prop. Put a descriptive label in the surrounding prose instead (e.g., a heading or intro sentence).

## Canonical examples

### Long code example (default height)

The following example shows a complete request flow across three files.

<ExpandableContent>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="src/plugins/my-plugin/server/src/routes/index.js"
'use strict';

module.exports = {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: { auth: false },
      },
    ],
  },
};
```

```js title="src/plugins/my-plugin/server/src/controllers/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  async find(ctx) {
    ctx.body = await strapi.plugin('my-plugin').service('article').findAll();
  },
});
```

```js title="src/plugins/my-plugin/server/src/services/article.js"
'use strict';

module.exports = ({ strapi }) => ({
  findAll() {
    return strapi.documents('plugin::my-plugin.article').findMany();
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="src/plugins/my-plugin/server/src/routes/index.ts"
export default {
  'content-api': {
    type: 'content-api' as const,
    routes: [
      {
        method: 'GET' as const,
        path: '/articles',
        handler: 'article.find',
        config: { auth: false },
      },
    ],
  },
};
```

```ts title="src/plugins/my-plugin/server/src/controllers/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    ctx.body = await (strapi.plugin('my-plugin').service('article') as any).findAll();
  },
});
```

```ts title="src/plugins/my-plugin/server/src/services/article.ts"
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  findAll() {
    return strapi.documents('plugin::my-plugin.article').findMany();
  },
});
```

</TabItem>
</Tabs>

</ExpandableContent>

### Taller preview (custom maxHeight)

Use `maxHeight` when the default 200 px cuts off at an awkward point (e.g., mid-table or mid-function).

The following table lists all available options.

<ExpandableContent maxHeight="400px">

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| ... | ... | ... | ... |

</ExpandableContent>

### Custom button labels

Use `showMoreText` and `showLessText` when the default "Show more…" / "Show less" is too generic for the context.

<ExpandableContent showMoreText="Show full configuration…" showLessText="Collapse">

```js title="config/plugins.js"
module.exports = {
  // full configuration here
};
```

</ExpandableContent>

## Rules

- **Always close the component with `</ExpandableContent>`.** MDX requires an explicit closing tag. A missing `</ExpandableContent>` causes a build error.
- **Always write an intro sentence before `<ExpandableContent>`.** The reader must know what they are expanding before they click. Never open a section or immediately follow a heading with `<ExpandableContent>` without prose context.
- **`<ExpandableContent>` wraps content, not headings.** Do not place `##` or `###` headings inside the component — they will appear in the ToC but the content will be hidden on load, which is confusing.
- **One component per collapsible block.** Do not nest `<ExpandableContent>` inside another `<ExpandableContent>`.
- **`<Tabs>` inside `<ExpandableContent>` is fine.** This is the standard pattern for long JS/TS examples. The Tabs groupId still applies normally.
- **Do not use for required steps.** If a reader must read the content to complete a task, do not hide it.