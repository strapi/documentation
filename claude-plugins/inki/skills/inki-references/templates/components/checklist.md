# Checklist component (interactive checkbox lists)

Use `<Checklist>` to present a set of action items, verification steps, or best-practice recommendations that the reader can tick off. It renders an interactive checkbox list whose checked state lives in component-local React state, so it is well suited to production-readiness lists, setup and verification sequences, and security best-practice roundups.

## When to use

- The content is a set of items the reader should verify or act on, where a checkbox carries meaning (e.g. "Production checklist", "Security best practices for production", "SSO setup checklist").
- Items can be ticked off independently and do not have to be completed in a strict order.
- Each item benefits from rich inline content: Markdown links, inline code, `<code>`, `<em>`, `<br/>`, and other globally registered components such as `<ExternalLink>`.

## When NOT to use

- The content is ordinary unordered information or a feature list where checkboxes carry no meaning. Use plain Markdown bullets.
- The reader must follow steps in a strict sequence. Use a numbered list or `<StepDetails>` instead. The authoring guide reserves numbered lists for procedures.
- You need durable progress tracking. The checkbox state is ephemeral and resets on reload, so do not rely on it to persist progress.

## No import

- Do NOT add an import line for `<Checklist>` or `<ChecklistItem>`. Both are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js` (imported there as `import Checklist, { ChecklistItem } from '../components/Checklist'` and listed in the components map), so they are available directly in any `.md`/`.mdx` page with no import.
- The registered aliases are `Checklist` (the wrapper) and `ChecklistItem` (each row). Both re-export through `docusaurus/src/components/Checklist/index.js`, so there is never a reason to add a local import for either.

## Props

`<Checklist>` props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Checklist"` | Heading text rendered in the checklist header bar (`<div className="checklist__header">`). If omitted, the literal string `Checklist` is shown, so set it explicitly for a meaningful header (e.g. `title="Production checklist"`). |
| `children` | `node` (`<ChecklistItem>` elements) | (required) | The list items. Pass one or more `<ChecklistItem>` elements; they are rendered inside a `<ul className="checklist__list" role="list">`. Raw text or plain `<li>` would not get the checkbox styling and behavior. |
| `className` | `string` | (none) | Extra CSS class merged onto the root `<div>` wrapper via `clsx('checklist', className)`. Rarely used in docs. |
| `...rest` | `object` (spread attributes) | (none) | Any other attributes (e.g. `id`, `data-*`, `style`) are spread onto the root `<div>`. No validation. |

`<ChecklistItem>` takes only its own `children`: the item content, rendered as one row (`<li className="checklist__item">` with a checkbox `<input type="checkbox">`). There is no `items` array prop. The only API is `children` composed of `<ChecklistItem>` elements.

## Rules

1. **Compose with `<ChecklistItem>` children.** A `<Checklist>` wraps one or more `<ChecklistItem>` elements. `<ChecklistItem>` renders the `<li>`, so never write a raw `<li>` or plain text directly inside `<Checklist>`.
2. **Always set `title`.** It defaults to the literal `Checklist` if omitted. Give it a meaningful header such as `title="Production checklist"`.
3. **Keep tags on their own lines.** Put the opening `<Checklist ...>` and closing `</Checklist>` on their own lines, and leave a blank line before the opening tag and after the closing tag to separate the block from surrounding Markdown.
4. **Write each item on a single line.** Each `<ChecklistItem>` body stays on one line. For multi-line item content, join the parts with `<br/>` rather than blank lines, because a blank line inside a JSX child breaks MDX parsing.
5. **Escape angle-bracket or JS-like content.** Inside item text, wrap `<` and `{}` content in a JSX string expression with the `<code>{"..."}</code>` form so MDX does not try to parse it (e.g. `<code>{"strapi.admin.services.passport.getStrategyCallbackURL('<provider_uid>')"}</code>`).
6. **Do not use it for ordered procedures.** If items must be followed in sequence, use a numbered list or `<StepDetails>`. Do not nest a strictly ordered procedure inside a `<Checklist>`.

## Canonical examples

### Security best practices, with links and an `<ExternalLink>`

From `docs/cms/configurations/media-library-providers/amazon-s3.md`:

<Checklist title="Security best practices for production">
  <ChecklistItem>Enable [server-side encryption](#server-side-encryption) for data at rest</ChecklistItem>
  <ChecklistItem>Enable [checksum validation](#checksum-validation) for upload integrity</ChecklistItem>
  <ChecklistItem>Enable [conditional writes](#conditional-writes-prevent-overwrites) to prevent race conditions</ChecklistItem>
  <ChecklistItem>Use `ACL: 'private'` with [signed URLs](#private-bucket-and-signed-urls) for sensitive content</ChecklistItem>
  <ChecklistItem>Enable <ExternalLink to="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html" text="S3 bucket versioning"/> for recovery from accidental deletions</ChecklistItem>
</Checklist>

### Production checklist, with inline `<code>` in longer item bodies

From `docs/cms/installation/docker.md`:

<Checklist title="Production checklist">
  <ChecklistItem>Do not expose database ports to the host. The <code>strapiDB</code> service above has no <code>ports</code> mapping, making it accessible only to other containers on the <code>strapi</code> network.</ChecklistItem>
  <ChecklistItem>Persist uploads. The production docker-compose does not mount a volume for <code>/opt/app/public/uploads</code>.</ChecklistItem>
  <ChecklistItem>Secure your secrets. The production docker-compose uses <code>env_file: .env</code>.</ChecklistItem>
</Checklist>

### Setup checklist, with `<br/>` for multi-line item bodies

From `docs/cms/configurations/guides/configure-sso.md`. Each item keeps its body on one line and uses `<br/>` to separate the action from its explanation:

<Checklist title="SSO setup checklist">
  <ChecklistItem>[Enable SSO in Strapi](/cms/features/sso#admin-panel-settings) <br/> Go to <em>Global settings > Single Sign-On</em> in the admin panel and set up the feature (e.g. toggle auto-registration and choose the default role).</ChecklistItem>
  <ChecklistItem>Register Strapi in your identity provider <br/> In the provider's dashboard (e.g. Azure AD, Okta, Google, GitHub), create a new OAuth/OIDC application for Strapi.</ChecklistItem>
</Checklist>
