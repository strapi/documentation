---
title: How to populate creator fields
description: Learn how to populate creator fields such as createdBy and updatedBy by creating a custom controller that leverages the populate parameter.
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- createdBy
- guides
- populate
- populateCreatorFields
- REST API
- REST API guides
- updatedBy
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# 🛠️ How to populate creator fields such as `createdBy` and `updatedBy`

<NotV5/>

The creator fields `createdBy` and `updatedBy` are removed from the [REST API](/dev-docs/api/rest) response by default. These 2 fields can be returned in the REST API by activating the `populateCreatorFields` parameter at the content-type level.

:::note

The `populateCreatorFields` property is not available to the GraphQL API.

Only the following fields will be populated: `id`, `firstname`, `lastname`, `username`, `preferedLanguage`, `createdAt`, and `updatedAt`.
:::

To add `createdBy` and `updatedBy` to the API response:

1. Open the content-type `schema.json` file.
2. Add `"populateCreatorFields": true` to the `options` object:

  ```json
  "options": {
      "draftAndPublish": true,
      "populateCreatorFields": true
    },
  ```

3. Save the `schema.json`.
4. Create a new route middleware either using the [generate CLI](/dev-docs/cli.md) or by manually creating a new file in `./src/api/[content-type-name]/middlewares/[your-middleware-name].js`
5. Add the following piece of code, you can modify this example to suit your needs:

  ```js title="./src/api/test/middlewares/defaultTestPopulate.js"
  "use strict";

  module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
      if (!ctx.query.populate) {
        ctx.query.populate = ["createdBy", "updatedBy"];
      }

      await next();
    };
  };
  ```

6. Modify your default route factory to enable this middleware on the specific routes you want this population to apply to and replacing the content-type/middleware name with yours:

  ```js title="./src/api/test/routes/test.js"
  "use strict";

  const { createCoreRouter } = require("@strapi/strapi").factories;

  module.exports = createCoreRouter("api::test.test", {
    config: {
      find: {
        middlewares: ["api::test.default-test-populate"],
      },
      findOne: {
        middlewares: ["api::test.default-test-populate"],
      },
    },
  });
  ```

REST API requests with no `populate` parameter will include the `createdBy` or `updatedBy` fields by default.
