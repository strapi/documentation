---
title: TEMPLATE — API Title
description: One-sentence summary of the API.
tags: [api]
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
