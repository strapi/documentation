# Endpoint component (API reference blocks)

Use `<Endpoint>` to document a single REST endpoint or Document Service method as a structured, 2-column block with method pill, parameters, code examples, and response samples.

## When to use

- REST API endpoint pages under `docs/cms/api/rest*.md`.
- Document Service API method pages under `docs/cms/api/document-service*.md`.
- One `<Endpoint>` per endpoint or method.

## When NOT to use

- GraphQL pages — use `<ApiCall>` with `<Request>` / `<Response>` and plain `graphql` code blocks.
- Non-API pages (features, guides, configurations).
- Inline code snippets that don't need the full endpoint layout.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | **Required.** Anchor id for ToC and deep links. Must be unique on the page. |
| `method` | `string` | `"GET"` | HTTP method displayed in the colored pill (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`). |
| `path` | `string` | — | Endpoint path (e.g., `/api/:pluralApiId`) or method signature (e.g., `strapi.documents().findOne()`). |
| `title` | `string` | — | Display title shown in the header. |
| `description` | `string` | — | Short description paragraph below the title. |
| `params` | `array` | `[]` | Parameter list rendered in the left column. Each item: `{ name, type, required, description }`. HTML is allowed in `description`. |
| `paramTitle` | `string` | `"Parameters"` | Heading above the parameter table (e.g., `"Query Parameters"`, `"Path Parameters"`). |
| `codeTabs` | `array` | `[]` | Code examples in the right column. Each item: `{ label, code }`. Common labels: `cURL`, `JavaScript`, `Request`. |
| `codePath` | `string` | value of `path` | URL displayed in the code panel header bar (e.g., `/api/restaurants?populate=*`). |
| `codePathHighlights` | `string[]` | `[]` | Substrings of `codePath` to visually highlight (e.g., `['restaurants']`). |
| `responses` | `array` | `[]` | Response examples. Each item: `{ status, statusText, time, body }`. Use `JSON.stringify(obj, null, 2)` for the `body`. |
| `isLast` | `boolean` | `false` | Set to `true` on the last `<Endpoint>` of a page to remove the bottom border. |
| `children` | `JSX` | — | Optional custom content rendered in the left column below the parameter table. |

## Layout behavior

- If `params` (or `children`) AND `codeTabs`/`responses` are provided → 2-column grid (params left, code right).
- If only `codeTabs`/`responses` are provided (no params) → stacked layout with code below the header.
- If only `params`/`children` are provided (no code) → left column only.

## Canonical examples

### REST endpoint

<Endpoint
  id="get-all-endpoint"
  method="GET"
  path="/api/:pluralApiId"
  title="List documents"
  description="Returns a paginated list of documents. Supports filtering, sorting, field selection, and relation population."
  paramTitle="Query Parameters"
  params={[
    { name: 'sort', type: 'string | string[]', required: false, description: 'Sort by field. Use <code>field:asc</code> or <code>field:desc</code>' },
    { name: 'filters', type: 'object', required: false, description: 'Filter with operators: <code>$eq</code>, <code>$contains</code>, <code>$gt</code>, <code>$lt</code>.' },
    { name: 'populate', type: 'string | object', required: false, description: 'Relations and components to include. Use <code>*</code> for all.' },
    { name: 'pagination[page]', type: 'integer', required: false, description: 'Page number. Default: <code>1</code>' },
    { name: 'pagination[pageSize]', type: 'integer', required: false, description: 'Items per page. Default <code>25</code>, max <code>100</code>' },
  ]}
  codePath="/api/restaurants"
  codePathHighlights={['restaurants']}
  codeTabs={[
    {
      label: 'cURL',
      code: `curl 'http://localhost:1337/api/restaurants' \\
  -H 'Authorization: Bearer <token>'`,
    },
    {
      label: 'JavaScript',
      code: `const response = await fetch(
  'http://localhost:1337/api/restaurants',
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
      time: '23ms',
      body: JSON.stringify({
        data: [
          {
            id: 2,
            documentId: "hgv1vny5cebq2l3czil1rpb3",
            Name: "BMK Paris Bamako",
          }
        ],
        meta: {
          pagination: { page: 1, pageSize: 25, pageCount: 1, total: 2 }
        }
      }, null, 2),
    },
  ]}
/>

### Document Service method

<Endpoint
  id="findone"
  method="GET"
  path="strapi.documents().findOne()"
  title="findOne()"
  description="Find a document matching the passed documentId and parameters."
  paramTitle="Parameters"
  params={[
    { name: 'documentId', type: 'ID', required: true, description: 'Document id' },
    { name: 'locale', type: 'String or undefined', required: false, description: 'Locale of the document to find.' },
    { name: 'status', type: "'published' | 'draft'", required: false, description: 'Publication status. Default: <code>draft</code>.' },
    { name: 'fields', type: 'Object', required: false, description: 'Select fields to return.' },
    { name: 'populate', type: 'Object', required: false, description: 'Populate results with additional fields.' },
  ]}
  codeTabs={[
    {
      label: 'Request',
      code: `await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm'
})`,
    },
  ]}
  responses={[
    {
      status: 200,
      statusText: 'OK',
      body: JSON.stringify({
        documentId: "a1b2c3d4e5f6g7h8i9j0klm",
        name: "Biscotte Restaurant",
        publishedAt: null,
        locale: "en",
      }, null, 2),
    },
  ]}
/>

## Rules

- **Always set `id`.** The component registers the id as a broken-link anchor. Omitting it causes build warnings. Use a short, descriptive, kebab-case value (e.g., `get-all-endpoint`, `findone`).
- **One `<Endpoint>` per operation.** Do not group multiple endpoints in a single component.
- **HTML is allowed in param `description`.** Use `<code>`, `<a href="...">`, and `<br/>` for formatting. JSX is not supported inside the description string.
- **Use `JSON.stringify(obj, null, 2)` for response bodies.** This ensures consistent formatting. Define the object inline in the `body` field.
- **Set `isLast={true}` on the final `<Endpoint>` of a page** to remove the bottom border separator.
- **`codePath` defaults to `path`** but should be overridden for REST endpoints to show a concrete URL (e.g., `/api/restaurants?populate=*` instead of `/api/:pluralApiId`).
- **REST pages use `cURL` and `JavaScript` tabs.** Document Service pages use a single `Request` tab.
- **Do not use `<Endpoint>` for GraphQL pages.** GraphQL pages use `<ApiCall>` with `<Request>` / `<Response>`.
- **Do not nest `<Endpoint>` inside other components** (Tabs, ExpandableContent, etc.).
