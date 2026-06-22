# NextSteps component ("What's next?" navigation)

Use NextSteps for the closing navigation block at the end of a tutorial or quick-start page: a short, numbered list of where the reader should go next. Each step is a single onward link with a one-line description. Keep it to a handful of steps and put it last on the page.

When to use
- The end of a tutorial, quick-start, or any page that walks the reader through a task and should hand them off to the next thing to read.
- Each step points to one place worth going next (a feature page, an API reference, a deployment guide).
- Do not use it as a general link list mid-page, or for unordered "see also" references (use prose links or a bullet list instead).

No import line
- `<NextSteps>` and `<NextSteps.Step>` are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js` (like `<Tabs>`, `<Annotation>`, and `<ApiCall>`).
- Use them directly. Do NOT add an `import` line for `NextSteps` at the top of the page.

Props

`<NextSteps>`
- `title` — heading shown above the steps. Defaults to `What's next?`. Pass `title=""` to hide the built-in heading when you want to write your own `## What's next?` heading above the block (this is the canonical pattern, so the heading lands in the table of contents).

`<NextSteps.Step>` (self-closing)
- `title` — the step label. Required.
- `description` — optional one-line explanation under the title. Omit it for a bare link.
- `link` — optional href. When present, the whole step becomes a clickable link with a trailing arrow. Omit it for a non-clickable step.
- `index` — auto-injected by the parent `<NextSteps>` (it numbers the steps 1, 2, 3…). Never set it manually.

Canonical example

Write your own `## What's next?` heading so it appears in the table of contents, then pass `title=""` on the wrapper to avoid a duplicate heading. Each step is self-closing.

```mdx
## What's next?

<NextSteps title="">
  <NextSteps.Step
    title="Explore the admin panel"
    description="Create entries, set up roles, manage media files."
    link="/cms/features/admin-panel"
  />
  <NextSteps.Step
    title="Connect a frontend"
    description="Use REST or GraphQL with Next.js, Nuxt, or any framework."
    link="/cms/api/rest"
  />
  <NextSteps.Step
    title="Deploy to production"
    description="Strapi Cloud, Docker, or your own infrastructure."
    link="/cloud/getting-started/deployment"
  />
</NextSteps>
```
