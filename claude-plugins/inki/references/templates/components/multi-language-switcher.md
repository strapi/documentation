# MultiLanguageSwitcher component (language-switchable API request examples)

Use `<MultiLanguageSwitcher>` to present the same API request example in several language flavors (for example REST vs Node) behind a single dropdown selector. The reader picks their preferred language once, and the choice persists across switchers on the page, across browser tabs, and across page loads.

## When to use

- The same request needs to be shown in more than one language flavor (for example REST and Node), and you want the reader to pick once rather than scroll past every variant.
- Each variant goes in its own `<MultiLanguageSwitcherRequest>` child carrying a `language` prop. That `language` value is the label shown in the dropdown (for example `REST`, `Node`).
- You want the selected language to persist: it is saved to `localStorage` under the key `strapi-docs.multi-language-switcher` and synced across every switcher on the page (and across tabs via the `storage` event), so switching one switcher updates the others.
- In the real docs it is used only in `docs/cms/api/rest/relations.md`, nested inside Docusaurus `<TabItem>` blocks, to show shorthand vs longhand `connect`/`disconnect` request bodies in REST and Node.

## When NOT to use

- There is a single code example with no language variants. The dropdown only renders when at least one child has both a truthy `language` and the correct `mdxType`; with zero qualifying children no selector shows.
- You only need to toggle JavaScript vs TypeScript inside one fenced block. Use the code block language or Docusaurus `<Tabs>`/`<TabItem>` for that.
- You expect `<MultiLanguageSwitcherResponse>` to appear in the selector. Only `<MultiLanguageSwitcherRequest>` children with a `language` populate the dropdown. `<MultiLanguageSwitcherResponse>` is just a styled heading and content wrapper (default heading "Example response") and is not used anywhere in the current docs.
- The page already follows the `<ApiCall>` request/response convention. Reach for `<MultiLanguageSwitcher>` only when you specifically need the persistent language-switcher behavior.

## No import

- Do NOT add an import line for `<MultiLanguageSwitcher>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js` (imported from `../components/MultiLanguageSwitcher` and spread into the default export), so it is available directly in any `.md`/`.mdx` page with no import.
- The same applies to its two registered aliases, `<MultiLanguageSwitcherRequest>` and `<MultiLanguageSwitcherResponse>`. They are registered globally as well, so never add an import line for them either. There are no other aliases.

## Props

These props apply to `<MultiLanguageSwitcher>` (the parent container).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | (none) | Forwarded down to every `<MultiLanguageSwitcherRequest>` child, where it becomes that child's request heading. A child's own explicit `title` prop wins over the forwarded one, because the child's own props are spread last. |
| `children` | `ReactNode` (`MultiLanguageSwitcherRequest` elements) | (none, required) | One or more `<MultiLanguageSwitcherRequest>` children. The component reads each child's `language` and `mdxType` props to build the dropdown: only children whose `mdxType === 'MultiLanguageSwitcherRequest'` and that have a truthy `language` populate the selector. Other children are still rendered (cloned untouched). Every direct child must be a React element, because the component calls `cloneElement` on each one. |

## Rules

1. **Never add an import line.** The component and its two aliases are global MDX components (see "No import" above). Use the tags directly.
2. **Put each variant in a `<MultiLanguageSwitcherRequest>` with a `language` prop.** The dropdown is built by reading each child's `language` and `mdxType`; only children where `mdxType === 'MultiLanguageSwitcherRequest'` with a truthy `language` are listed. So `language` is effectively required on each request, and it doubles as the visible dropdown option text (for example `language="REST"`). The first language is selected by default unless `localStorage` holds a still-valid value.
3. **Surround Markdown inside a request with blank lines.** This is the big gotcha. Backtick spans and fenced code blocks inside `<MultiLanguageSwitcherRequest>` must have a blank line after the opening tag and a blank line before the closing tag, otherwise MDX will not parse the Markdown (it renders literally or errors). The opening `<MultiLanguageSwitcher ...>` and its first child tag may sit on adjacent lines with no blank line between the two JSX tags, and a blank line separates sibling request blocks.
4. **Keep only element children as direct children.** The parent runs `Children.map` and `cloneElement` over every child, so each direct child must be a React element. Keep only `<MultiLanguageSwitcherRequest>`/`<MultiLanguageSwitcherResponse>` tags directly inside; do not place bare prose text between them as a direct child node, or the clone will throw.
5. **Understand title propagation.** `title` on the parent is forwarded to every request child's heading. A request's own `title` overrides it. With no title at all, a request heading falls back to `Example ${language} request` and a response heading falls back to `Example response`.

## Canonical examples

Both examples below are from `docs/cms/api/rest/relations.md`, nested inside `<TabItem>` blocks.

### Shorthand syntax tab

<MultiLanguageSwitcher title="Example request using the shorthand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']
        }
      }
    }
  }
);
```

</MultiLanguageSwitcherRequest>
</MultiLanguageSwitcher>

### Longhand syntax tab

<MultiLanguageSwitcher title="Example request using the longhand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: [
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
        { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
      ]
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: [
            { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
            { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
          ]
        }
      }
    }
  }
);
```

</MultiLanguageSwitcherRequest>
</MultiLanguageSwitcher>

Note the blank line after each opening `<MultiLanguageSwitcherRequest ...>` and before each closing `</MultiLanguageSwitcherRequest>`, and the blank line between the two sibling request blocks. The opening `<MultiLanguageSwitcher ...>` and its first child tag sit on adjacent lines.
