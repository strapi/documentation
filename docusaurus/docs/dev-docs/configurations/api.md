---
title: API calls configuration
sidebar_label: API calls
displayed_sidebar: cmsSidebar
description: Strapi's default API parameters can be configured.
tags:
- base configuration
- REST API
---

# API configuration

General settings for API calls can be set in the `./config/api.js` file:

| Property                      | Description                                                                                                                                                                                                                                          | Type         | Default |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| `responses`                   | Global API response configuration                                                                                                                                                                                                                    | Object       | -       |
| `responses.privateAttributes` | Set of globally defined attributes to be treated as private.                                                                                                                                                                                         | String array | `[]`    |
| `rest`                        | REST API configuration                                                                                                                                                                                                                               | Object       | -       |
| `rest.prefix`                 | The API prefix                       | String      | `/api`   |
| `rest.defaultLimit`           | Default `limit` parameter used in API calls (see [REST API documentation](/dev-docs/api/rest/sort-pagination#pagination-by-offset))                                                                      | Integer      | `25`    |
| `rest.maxLimit`               | Maximum allowed number that can be requested as `limit` (see [REST API documentation](/dev-docs/api/rest/sort-pagination#pagination-by-offset)). | Integer      | `100`   |

:::note 
If the `rest.maxLimit` value is less than the `rest.defaultLimit` value, `maxLimit` will be the limit used.
:::


**Example:**

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/api.js"

module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'id', 'created_at'],
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/api.ts"

export default ({ env }) => ({
  responses: {
    privateAttributes: ['_v', 'id', 'created_at'],
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 100,
    maxLimit: 250,
  },
});
```

</TabItem>

</Tabs>
