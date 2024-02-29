---
title: How to populate creator fields
description: Learn how to populate creator fields such as createdBy and updatedBy by creating a custom controller that leverages the populate parameter.
---

# 🛠️ How to populate creator fields such as `createdBy` and `updatedBy`

The creator fields `createdBy` and `updatedBy` are removed from the [REST API](/dev-docs/api/rest) response by default. These 2 fields can be returned in the REST API by activating the `populateCreatorFields` parameter at the content-type level.

:::note

The `populateCreatorFields` property is not available to the GraphQL API.
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
4. Open the controller `[collection-name].js` file inside the corresponding API request.
5. Add the following piece of code, and make sure you replace the `[collection-name].js` with proper collection name:

  ```js
  'use strict';
  /**
   *  [collection-name] controller
   */
  const { createCoreController } = require('@strapi/strapi').factories;
  module.exports = createCoreController('api::[collection-name].[collection-name]', ({ strapi }) => ({
    async find(ctx) {
      // Calling the default core action
      const { data, meta } = await super.find(ctx);
      const query = strapi.db.query('api::[collection-name].[collection-name]');
      await Promise.all(
        data.map(async (item, index) => {
          const foundItem = await query.findOne({
            where: {
              id: item.id,
            },
            populate: ['createdBy', 'updatedBy'],
          });

          data[index].attributes.createdBy = {
            id: foundItem.createdBy.id,
            firstname: foundItem.createdBy.firstname,
            lastname: foundItem.createdBy.lastname,
          };
          data[index].attributes.updatedBy = {
            id: foundItem.updatedBy.id,
            firstname: foundItem.updatedBy.firstname,
            lastname: foundItem.updatedBy.lastname,
          };
        })
      );
      return { data, meta };
    },
  }));
  ```

REST API requests using the `populate` parameter that include the `createdBy` or `updatedBy` fields will now populate these fields.

