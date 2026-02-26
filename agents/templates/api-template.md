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
### GET /path
- Purpose: …
- Auth: …
- Query params: …

```bash title="Example"
curl -H "Authorization: Bearer …" https://example.com/path
```

### POST /path
- Purpose: …
- Auth: …

```json title="Request body"
{
  "example": true
}
```

## Responses
```json title="200 OK"
{ "ok": true }
```

## Notes and Limits
Versioning, deprecations, rate limits, or pagination.

<!-- 
  Component patterns — match the target page
  ============================================
  Production API pages use custom MDX components not shown in this
  skeleton. When drafting or patching, always check the existing page
  and replicate its patterns:

  • Document Service pages:
    <ApiCall> wrapping <Request> and <Response>.
    Use `noSideBySide` prop for longer examples.
    Responses use JS object literal notation (not JSON).

  • REST pages:
    <ApiCall> wrapping <Request>, a <details> block for the
    qs.stringify equivalent (with <QsForQueryBody /> snippet),
    and <Response>. Responses use JSON.

  • GraphQL pages:
    Plain code blocks with `graphql` language identifier.

  Do not mix patterns across page types.
-->