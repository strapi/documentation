---
title: TEMPLATE — API Title
displayed_sidebar: cmsSidebar
description: One-sentence summary of the API.
tags:
  - api
---
# Template — API Title

<Tldr>
Briefly describe the endpoint(s), authentication, and typical use.
</Tldr>

## Endpoints

Document each endpoint with an `<Endpoint>` block. This is the primary pattern for all new REST and Document Service reference pages. Use `kind="http"` (the default) for REST endpoints and `kind="js"` for Document Service methods.

Do not add an import line. `<Endpoint>`, `<StepDetails>`, and `<NextSteps>` are registered as global MDX components in `docusaurus/src/theme/MDXComponents.js` (alongside `<Tabs>`, `<Annotation>`, and `<ApiCall>`), so they are used directly with no import.

### GET /path (REST, `kind="http"`)

Full REST skeleton: `method`, `path` with `:params`, a `paramTitle`, a `params` array, `codePath` + `codePathHighlights` for the URL bar, `codeTabs` (cURL + JavaScript), and multiple `responses` built with `JSON.stringify(obj, null, 2)`.

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

### findOne() (Document Service, `kind="js"`)

Document Service skeleton: `kind="js"`, `path` written as a JS method signature, a `params` array (descriptions may contain HTML such as `<code>` and `<a href>`), a single `codeTabs` tab labelled `'Request'`, and one `response`. There is no `method`, no `codePath`, and no `codePathHighlights` — the verb is hidden and the result renders as "Returns".

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

### Admonitions around and inside `<Endpoint>`

Admonitions can sit **between** blocks (in the normal MDX flow, between the `### heading` and the `<Endpoint>`) or **inside** an `<Endpoint>` as children. To pass children, close the block with `</Endpoint>` instead of self-closing `/>`; the content renders in the left column under the params.

MDX rule: leave a blank line **after** the opening `>` and a blank line **before** `</Endpoint>` so the children parse as Markdown.

```mdx
<Endpoint
  id="create"
  kind="js"
  path="strapi.documents().create()"
  title="create()"
  paramTitle="Parameters"
  params={[ /* ... */ ]}
  codeTabs={[ /* ... */ ]}
  responses={[ /* ... */ ]}
>

:::tip
If the [Draft & Publish](/cms/features/draft-and-publish) feature is enabled on the content-type, you can automatically publish a document while creating it.
:::

</Endpoint>
```

### GraphQL pages

GraphQL pages use plain code blocks with the `graphql` language identifier (no `<Endpoint>` component).

```graphql
query {
  restaurants {
    documentId
    name
  }
}
```

## Notes and Limits
Versioning, deprecations, rate limits, or pagination.

<!--
  Snippet imports used alongside <Endpoint> (NOT legacy)
  ======================================================
  On migrated REST pages, <Endpoint> coexists with snippet imports:
  QsForQueryBody, QsForQueryTitle, and QsIntroFull. These are current
  snippet imports — keep them when present.

  Legacy exception (DEPRECATED for new content)
  =============================================
  The legacy <ApiCall>/<Request>/<Response> trio (plus the `noSideBySide`
  prop and the <details> qs.stringify block) is DEPRECATED. Match it ONLY
  when patching these specific not-yet-migrated pages:

  • docs/cms/api/graphql.md
  • docs/cms/api/graphql/** (e.g. graphql/locale.md)
  • docs/cms/api/rest/upload.md
  • docs/cms/api/rest/relations.md
  • docs/cms/features/users-permissions/rest-api.md
  • docs/cms/plugins/graphql.md

  Never introduce the trio on new, REST, or Document Service reference
  pages — use <Endpoint> instead.
-->

<!--
  Fallback for pages NOT using <Endpoint>
  =======================================
  Only for legacy/non-migrated pages. Prefer <Endpoint> above.

  ```bash title="Example"
  curl -H "Authorization: Bearer …" https://example.com/path
  ```

  ```json title="Request body"
  { "example": true }
  ```

  ```json title="200 OK"
  { "ok": true }
  ```
-->