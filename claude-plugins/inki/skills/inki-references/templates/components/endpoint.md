# Endpoint component (API reference blocks)

Use `<Endpoint>` to document a single API operation on a reference page: one HTTP request (REST) or one method call (Document Service / other JS APIs). Each block renders a self-contained, anchorable two-column layout — operation header and parameters on the left, code examples and responses on the right.

No import line
- Do NOT add an import for `<Endpoint>`. It is registered as a global MDX component in `docusaurus/src/theme/MDXComponents.js`, exactly like `<Tabs>`, `<Annotation>`, and `<ApiCall>`. Use it directly.
- The same is true for `<StepDetails>` and `<NextSteps>`: they are globally registered too, so never import them either.
- Adding a redundant `import ... from '@site/src/components/...'` line is a mistake; remove it if you see it on a migrated page.

When to use
- One `<Endpoint>` per API operation on a reference page (one HTTP route, or one method signature).
- `kind="http"` (the default) for REST endpoints; `kind="js"` for Document Service and other programmatic APIs.
- Put shared context (intro prose, admonitions that apply to the operation) immediately before the block, or pass operation-specific admonitions as children (see "Admonitions as children" below).
- Do not use `<Endpoint>` outside API reference pages, and do not nest one inside another.

Prop contract (from `docusaurus/src/components/ApiReference/Endpoint.jsx`)
- `id` — string. Anchor id for the block; registered via `useBrokenLinks().collectAnchor(id)` so deep links and cross-references resolve. Required for linkable operations.
- `kind` — `'http'` (default) | `'js'`. `'js'` hides the method pill and URL bar, renders `path` as a JS signature, and labels the result "Returns".
- `method` — `'GET'` (default) | `'POST'` | `'PUT'` | `'DELETE'`. HTTP only; ignored when `kind="js"`. `DELETE` renders as the pill label `DEL`.
- `path` — string. For `kind="http"`, the HTTP path with `:params` (e.g. `/api/:pluralApiId/:documentId`). For `kind="js"`, the JS method signature (e.g. `strapi.documents().findOne()`).
- `title` — string. Short operation name shown in the header.
- `description` — string. Rendered as a paragraph under the header.
- `params` — array of `{ name, type, required, description }`. `description` may contain inline HTML such as `<code>...</code>` and `<a href="...">...</a>`.
- `paramTitle` — string. Heading above the parameter table (default `'Parameters'`). REST pages use `'Query Parameters'`, `'Path Parameters'`, or `'Body Parameters'`.
- `codeTabs` — array of `{ label, code }`. `label` is the tab name (e.g. `'cURL'`, `'JavaScript'`, `'Request'`); `code` is a template-literal string. Multiple tabs are idiomatic on JS pages (e.g. `'Generic example'`, `'With filters'`).
- `codePath` — string. Path shown in the code panel URL bar (falls back to `path`). HTTP only; visual.
- `codePathHighlights` — `string[]`. Substrings of `codePath` to highlight in the URL bar.
- `responses` — array of `{ status, statusText, time?, body }`. `body` is a **string**; build it with `JSON.stringify(obj, null, 2)`. `time` (e.g. `'12ms'`) is typical on REST and usually omitted for JS. An empty array `responses={[]}` is valid (e.g. DELETE).
- `isLast` — boolean. Removes the bottom border on the final block of a page. Both `isLast` (bare) and `isLast={true}` are accepted.
- `children` — node. Extra MDX rendered in the left column under the parameters; this is where operation-specific admonitions and notes go.

Two-column layout rule
- The block renders as two columns **only when** `(params OR children) AND (codeTabs OR responses)`.
- If there are params/children but no code/responses, or code/responses but no params/children, the block falls back to a stacked single-column layout. Provide both sides when you want the side-by-side reference look.

`kind="js"` behavior
- Hides the `MethodPill` and the URL bar.
- Renders `path` as a JS method signature in code, not as an HTTP route.
- Labels the result panel "Returns" instead of "200 OK"; there are no HTTP status tabs, status dot, or response time.
- `method`, `codePath`, and `codePathHighlights` are not used.

Canonical examples

## REST / HTTP endpoint (`kind="http"`)

```mdx
<Endpoint
  id="get-endpoint"
  method="GET"
  path="/api/:pluralApiId/:documentId"
  title="Get a document"
  description="Returns a single document by its documentId. Supports field selection and relation population."
  paramTitle="Path Parameters"
  params={[
    { name: 'pluralApiId', type: 'string', required: true, description: 'Plural API ID of the content-type (e.g. <code>restaurants</code>)' },
    { name: 'documentId', type: 'string', required: true, description: 'Unique document identifier' },
  ]}
  codePath="/api/restaurants/znrlzntu9ei5onjvwfaalu2v"
  codePathHighlights={['restaurants', 'znrlzntu9ei5onjvwfaalu2v']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl 'http://localhost:1337/api/restaurants/znrlzntu9ei5onjvwfaalu2v' \\
  -H 'Authorization: Bearer <token>'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants/znrlzntu9ei5onjvwfaalu2v',
  {
    headers: {
      Authorization: 'Bearer <token>',
    },
  }
);
const data = await response.json();`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      time: '12ms',
      body: JSON.stringify({
        data: {
          id: 6,
          documentId: "znrlzntu9ei5onjvwfaalu2v",
          Name: "Biscotte Restaurant",
          // ... trimmed: model fields + createdAt/updatedAt/publishedAt/locale ...
        },
        meta: {}
      }, null, 2),
    },
    {
      status: 404,
      statusText: 'Not Found',
      body: JSON.stringify({
        error: { status: 404, name: 'NotFoundError', message: 'Document not found' }
      }, null, 2),
    },
  ]}
/>
```

## Document Service / JS method (`kind="js"`)

```mdx
<Endpoint
  id="findone"
  kind="js"
  path="strapi.documents().findOne()"
  title="findOne()"
  description="Find a document matching the passed documentId and parameters. If only a documentId is passed without any other parameters, findOne() returns the draft version of a document in the default locale. Returns the matching document if found, otherwise returns null."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the document to find. Defaults to the default locale. <a href="/cms/api/document-service/locale#find-one">See locale docs</a>.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'If <a href="/cms/features/draft-and-publish">Draft & Publish</a> is enabled: publication status. Can be <code>published</code> or <code>draft</code>. Default: <code>draft</code>.' },
    { name: 'fields', type: 'Object', required: false, description: '<a href="/cms/api/document-service/fields#findone">Select fields</a> to return.' },
    { name: 'populate', type: 'Object', required: false, description: '<a href="/cms/api/document-service/populate">Populate</a> results with additional fields. Default: <code>null</code>.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klmn'
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klmn",
        name: "Biscotte Restaurant",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
  ]}
/>
```

Notes on the examples
- Trim long JSON bodies to the shape that matters; keep `JSON.stringify(obj, null, 2)`.
- `time` appears on REST responses and is usually dropped on JS.
- On JS pages, multiple `codeTabs` (e.g. `'Generic example'`, `'With filters'`) pair with multiple `responses` whose `statusText` matches each tab.
- The last block on a page takes `isLast` (REST writes it bare; JS pages tend to write `isLast={true}`).

Admonitions as children
- When `<Endpoint>` has a closing tag `</Endpoint>` (not self-closing `/>`), everything between the tags becomes `children` and renders in the left column, under the parameters.
- Put operation-specific admonitions (`:::tip`, `:::note`) and short prose there.
- MDX rule: leave a blank line after the opening `>` and before `</Endpoint>`, so MDX parses the children as Markdown.

```mdx
<Endpoint
  id="create"
  kind="js"
  path="strapi.documents().create()"
  title="create()"
  description="Create a document and return it."
  paramTitle="Parameters"
  params={[
    { name: 'data', type: 'Object', required: true, description: 'Values of the attributes' },
  ]}
  codeTabs={[
    { label: 'Request', code: `await strapi.documents('api::restaurant.restaurant').create({
  data: { name: 'Biscotte Restaurant' }
})` },
  ]}
  responses={[
    { status: 200, statusText: 'OK', body: JSON.stringify({ documentId: "a1b2c3d4e5f6g7h8i9j0klmn", name: "Biscotte Restaurant" }, null, 2) },
  ]}
>

:::tip
If the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled on the content-type, you can automatically publish a document while creating it (see [`status` documentation](/cms/api/document-service/status#create)).
:::

</Endpoint>
```

- Admonitions that introduce the operation (rather than annotate the params) stay in the normal MDX flow, between the `### heading` and the `<Endpoint>` block, instead of as children.

Internal sub-components (never authored directly)
- `<Endpoint>` composes `MethodPill`, `ParamTable`, `CodePanel`, and `ResponsePanel` internally; the page chrome is built from `ApiHeader`, `ApiSidebar`, and `ApiReferencePage`, and code blocks use `CopyCodeButton`.
- Never write any of these in MDX. Always express an operation through `<Endpoint>` props; the sub-components are implementation details of the component.

Legacy pages
- The legacy `<ApiCall>` / `<Request>` / `<Response>` trio (plus the `noSideBySide` prop and the `<details>` `qs.stringify` block) is **DEPRECATED** for new content.
- Match this trio **only** when patching these specific, not-yet-migrated pages:
  - `docs/cms/api/graphql.md`
  - `docs/cms/api/graphql/**` (e.g. `graphql/locale.md`)
  - `docs/cms/api/rest/upload.md`
  - `docs/cms/api/rest/relations.md`
  - `docs/cms/features/users-permissions/rest-api.md`
  - `docs/cms/plugins/graphql.md`
- Never introduce the trio on new pages, on migrated REST pages, or on Document Service reference pages — use `<Endpoint>` instead.
- NOTE: `QsForQueryBody`, `QsForQueryTitle`, and `QsIntroFull` are NOT legacy. They are snippet imports still used alongside `<Endpoint>` on migrated REST pages; keep them.

Extraction
- llms-code extracts each `codeTabs` entry as a code example for the operation; keep one operation per `<Endpoint>` and keep `code` strings runnable.
- Provide both cURL and JavaScript tabs on REST endpoints when applicable so both variants are captured.
