---
title: API configuration - Strapi Developer Documentation
description:
---

<!-- TODO: update SEO -->

# API configuration

General settings for API calls can be set in the `./config/api.js` file:

| Property                      | Description                                                                                                 | Type         | Default |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                           | Object       | -       |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private.                                                | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                      | Object       | -       |
| `rest.defaultLimit`           | Default `limit` parameter used in API calls (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#pagination-by-offset))                                                | Integer      | `100`   |
| `rest.maxLimit`               | Maximum allowed number that can be requested as `limit` (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#pagination-by-offset)).<br/><br/>Defaults to `null`, which fetches all results. | Integer      | `null`  |

**Example:**

```js
// path: ./config/api.js

module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'id', 'created_at'],
  },
  rest: {
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```
