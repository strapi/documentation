# ExternalLink component (outbound links with a trailing icon)

Use `<ExternalLink>` to render a link with a trailing "arrow-square-out" icon, signalling that the link leaves the current documentation context. It is the project's standard way to mark external references such as GitHub repositories and third-party sites.

## When to use

- The link points to an external resource and you want the trailing external-link icon to signal that it leaves the docs (e.g., GitHub repos, semver.org, llmstxt.org, the `qs` library).
- The link appears inline in prose, inside a table cell, or wrapped in bold (`**<ExternalLink .../>**`).
- The link is used in a snippet that is reused across pages.
- You want the external-link affordance on a non-external target (e.g., a `http://localhost:1337/admin/...` URL) where the icon still helps the reader. The component wraps Docusaurus `@docusaurus/Link`, so it accepts any URL.

## When NOT to use

- The link is an ordinary internal documentation cross-link. Use a standard Markdown link instead (e.g., `[text](/cms/...)`) so you get normal relative-link handling and no external-link icon.
- You do not want the trailing icon. The icon is hardcoded and cannot be turned off.
- You need to control `target`, `rel`, `title`, or `className`. None of these props exist; Docusaurus Link handles target behavior for absolute URLs on its own.

## No import

- Do NOT add an import line for `<ExternalLink>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js`, so it is available directly in any `.md`/`.mdx` page with no import.
- It is exported as a named export (`export const ExternalLink`) and imported in `MDXComponents.js` as `import { ExternalLink } from '../components/ExternalLink'`. There are no aliases registered, so always write the tag as `<ExternalLink>`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` (URL) | (none, required) | Destination URL. Passed verbatim to the Docusaurus `<Link to={to}>`. Accepts external https URLs, GitHub links, and even localhost admin URLs. No validation or transformation is applied. |
| `text` | `string` (or inline MDX/markdown) | (none, required) | The visible link label, rendered immediately before the trailing icon. Inline markdown such as backtick code spans works inside the value (e.g. `text="the `qs` library"`). |

## Rules

1. **Both props are required.** The source has no defaults and does no validation. Omitting `text` yields an empty, icon-only link; omitting `to` produces a broken link.
2. **Pass the label as the `text` prop, not as children.** Write `<ExternalLink to="..." text="..."/>`, never `<ExternalLink to="...">label</ExternalLink>`. Children are not read.
3. **Always self-close the tag.** Every real usage is self-closing. Both `... text="..."/>` and `... text="..." />` spacing variants are fine.
4. **Keep it on one line.** The component renders inline as a single `<Link>`, so leave it on the same line as the surrounding prose, table cell, or bold markers.
5. **Inline markdown is allowed inside `text`.** Backtick code spans work (e.g. `text="the `qs` library"`).
6. **Avoid double quotes inside `to` or `text`.** A double quote would break the attribute. None of the real usages do this.
7. **Do not rely on the name to mean "external".** The component does not enforce that the URL is external; it always shows the external-link icon regardless of the target.

## Canonical examples

### Inline in prose

```mdx
Thus, the version numbers of <ExternalLink to="https://github.com/strapi/documentation" text="strapi/documentation"/> and <ExternalLink to="https://github.com/strapi/strapi" text="strapi/strapi"/> may differ.
```

### Inline markdown inside the label

```mdx
Strapi takes advantage of the ability of <ExternalLink to="https://github.com/ljharb/qs" text="the `qs` library"/> to parse nested objects to create more complex queries.
```

### Non-external (localhost admin) target

```mdx
You can check your credit usage in the <ExternalLink to="http://localhost:1337/admin/settings/application-infos" text="Settings Overview" /> of the admin panel.
```

### Inside a table cell

```mdx
| `--template website` | Using one of the <ExternalLink to="https://github.com/strapi/strapi/tree/develop/templates" text="Strapi-maintained templates"/> calling it by its (folder) name. |
```
