# Annotation component

Use `<Annotation>` to define unfamiliar or domain-specific terms inline. The component renders a small toggle button next to the annotated term; clicking it opens a tooltip with the definition.

## When to use

- A term is domain-specific, jargon, or could be unfamiliar to the target audience (e.g., "scalar value", "headless CMS", "series hook").
- The definition is short (1-3 sentences) and self-contained — readers should not need to leave the page to understand the term.
- The term appears in running prose, a table cell, or a list item — Annotations work inline.

## When NOT to use

- The term is common developer vocabulary that the target audience is expected to know (e.g., "function", "API", "boolean").
- The definition is long or requires code examples — use a cross-link or a dedicated section instead.
- The term was already defined by an Annotation earlier on the same page — do not repeat the Annotation.
- The content is inside a code block — Annotations only work in MDX prose.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | (auto-generated) | Optional unique identifier for the annotation. |
| `width` | `number` | `320` | Tooltip width in pixels. Increase for longer definitions. Ignored on small screens (<768px). |

## Rules

1. **Always bold the annotated term.** The bold text signals that the term is clickable/defined. Write `**term** <Annotation>...</Annotation>`, never `term <Annotation>...</Annotation>`.
2. **Keep the definition concise.** Aim for 1-3 sentences. If you need more, consider a cross-link instead.
3. **Use HTML inside for rich content.** Markdown is supported, but for lists or line breaks use `<ul><li>...</li></ul>` or `<br/>`.
4. **Cross-links inside Annotations are fine.** Use standard Markdown links `[text](/path)` to point readers to a full explanation elsewhere.
5. **One Annotation per term per page.** If the same term appears multiple times, annotate only the first occurrence.
6. **Close the component explicitly.** Always write `</Annotation>` — a missing closing tag causes a build error.

## Reusable Annotations

For terms that appear across many pages (e.g., "headless CMS", "document"), pre-built Annotation components are available in `src/components/ReusableAnnotationComponents/ReusableAnnotationComponents.jsx`. Import and use them instead of duplicating the definition:

```jsx
<DocumentDefinition />
<HeadlessCms />
<PluginsConfigurationFile />
<Codemods />
<NamingConventions />
```

If a new term appears on 3+ pages, consider adding it as a reusable component there.

## Canonical examples

### Inline in prose

The following example registers and calls handlers with a **series hook** <Annotation>A series hook executes handlers sequentially, one after another, in the order they were registered. See [admin hooks](/cms/plugins-development/admin-hooks) for more details.</Annotation>:

### Inside a table cell

| Method | Description |
| --- | --- |
| `isScalarAttribute(attribute)` | Check if the attribute is a **scalar value** <Annotation>A scalar value is a single, individual value rather than a collection or structure — e.g., a string, number, boolean, or date.</Annotation> |

### With HTML lists and line breaks

The **front-end part of Strapi** <Annotation>For a clarification on the distinction between:<ul><li>the Strapi admin panel (front end of Strapi),</li><li>the Strapi server (back end of Strapi),</li><li>and the end-user-facing front end of a Strapi-powered application,</li></ul>refer to the [development introduction](/cms/customization).</Annotation> is called the admin panel.

### With custom width

For longer definitions, increase the tooltip width:

A **test harness** <Annotation width={450}>A test harness is a collection of software and test data configured to test an application by running it in predefined conditions and monitoring its behavior.<br/><br/>In the present case, our test harness sets up a complete Strapi instance in an isolated testing environment, handles TypeScript files, and provides utilities to make testing easier.</Annotation> sets up and tears down instances for tests.
