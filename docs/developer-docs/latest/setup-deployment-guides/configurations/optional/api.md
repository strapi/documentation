---
title: API configuration - Strapi Developer Documentation
description:
---

<!-- TODO: update SEO -->

# API configuration

**Path —** `./config/api.js`.

```js
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

## Available options

| Property                      | Description                                                                                                 | Type         | Default |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                           | Object       | -       |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private.                                                | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                      | Object       | -       |
| `rest.defaultLimit`           | Specifies default `_limit` parameter used in API calls                                                      | Integer      | `100`   |
| `rest.maxLimit`               | Specifies max allowed number that can be requested as `_limit`. Default to `null` which fetches all results | Integer      | `null`  |
