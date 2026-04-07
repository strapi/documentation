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

<!-- Use one <Endpoint> per operation. See agents/templates/components/endpoint.md for full props and rules. -->

<Endpoint
  id="example-get"
  method="GET"
  path="/api/:pluralApiId"
  title="List resources"
  description="Short description of what this endpoint returns."
  paramTitle="Query Parameters"
  params={[
    { name: 'sort', type: 'string', required: false, description: 'Sort order.' },
  ]}
  codePath="/api/examples"
  codePathHighlights={['examples']}
  codeTabs={[
    { label: 'cURL', code: `curl 'http://localhost:1337/api/examples' \\\n  -H 'Authorization: Bearer <token>'` },
    { label: 'JavaScript', code: `const res = await fetch('http://localhost:1337/api/examples', {\n  headers: { Authorization: 'Bearer <token>' },\n});\nconst data = await res.json();` },
  ]}
  responses={[
    { status: 200, statusText: 'OK', time: '23ms', body: JSON.stringify({ data: [], meta: {} }, null, 2) },
  ]}
/>

## Notes and Limits
Versioning, deprecations, rate limits, or pagination.

<!--
  Component patterns — match the target page
  ============================================
  • REST and Document Service pages:
    Use the <Endpoint> component (one per operation).
    See agents/templates/components/endpoint.md for props, canonical
    examples, and rules.

  • GraphQL pages:
    Use <ApiCall> wrapping <Request> and <Response> with plain
    code blocks using the `graphql` language identifier.

  Do not mix patterns across page types.
-->