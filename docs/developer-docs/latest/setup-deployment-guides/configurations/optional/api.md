---
title: API configuration - Strapi Developer Docs
description: Strapi's default API parameters can be configured.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html
---

# API configuration

General settings for API calls can be set in the `./config/api.js` file:

| Property                      | Description                                                                                                                                                                                                                                          | Type         | Default |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                                                                                                                                                                    | Object       | -       |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private.                                                                                                                                                                                         | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                                                                                                                                                               | Object       | -       |
| `rest.defaultLimit`           | Default `limit` parameter used in API calls (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#pagination-by-offset))                                                                      | Integer      | `25`    |
| `rest.maxLimit`               | Maximum allowed number that can be requested as `limit` (see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#pagination-by-offset)).<br/><br/>Defaults to `null`, which fetches all results. | Integer      | `100`   |

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
