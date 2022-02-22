---
title: v4 code migration - Routes - Strapi Developer Docs
description: Migrate routes of a Strapi application from v3.6.x to v4.0.x
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html
---

# v4 code migration: Updating routes

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In both Strapi v3 and v4, creating content-types automatically generates core API routes.

In Strapi v3, routes are defined in JSON files that export an object containing configurations.

In Strapi v4, routes are defined in JavaScript files, called router files, that export the result of a call to the [`createCoreRouter` factory function](/developer-docs/latest/development/backend-customization/routes.md#configuring-core-routers), with or without further customization.
:::

Migrating [routes](/developer-docs/latest/development/backend-customization/routes.md) to Strapi v4 consists in making sure that each router file uses the `createCoreRouter` factory function introduced in v4.

Due to the differences between routes implementation in Strapi v3 and v4, it's recommended to create a new router file, then optionally bring existing v3 customizations into the new file and adapt them when necessary. If you didn't create any custom routes or customize the default routes, the step 4 of the following procedure is not required.

To create a v4 router file:

1. Create a `api/<api-name>/routes/<router-name>.js` file inside the `./src` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

2. Copy and paste the following code at the top of the `./src/api/<api-name>/routes/<router-name>.js` file. The code imports the `createCoreRouter` factory function from the factories included with the core of Strapi:

    ```js
    const { createCoreRouter } = require('@strapi/strapi').factories;
    ```

3. Copy and paste the following code, replacing `api-name` and `content-type-name` with appropriate names. The code exports the result of a call to the `createCoreRouter` factory function, passing the unique identifier of the content-type (e.g. `api::api-name.content-type-name`) as an argument:

    ```js
    module.exports = createCoreRouter('api::api-name.content-type-name')
    ```

4. (_optional_) To configure the router, pass a second argument to the `createCoreRouter` factory function. This argument can be either an object or a function returning an object. The object contains methods, which can either be entirely new actions or replace or extend existing actions of core API routes (see [routes implementation documentation](/developer-docs/latest/development/backend-customization/routes.md#implementation)).

::: details Example of a v4 router without customization

  ```jsx
  // path: ./src/api/<content-type-name>/routes/<router-name>.js

  const { createCoreRouter } = require('@strapi/strapi').factories;

  module.exports = createCoreRouter('api::api-name.content-type-name');
  ```

:::

::: details Example of a v4 router with customization

  ```jsx
  // path: ./src/api/<content-type-name>/routes/<router-name>.js

  const { createCoreRouter } = require('@strapi/strapi').factories;

  module.exports = createCoreRouter('api::api-name.content-type-name', {
   // creates an object with the basic CRUD configuration
    // ...
    config: {
      find: {
        // disables authorization requirement for the `find` route
        policies: ['admin::isAuthenticatedAdmin'],
        // here you can also customize auth & middlewares
      },
    },
    // disables every action except `find` and `findOne`.
    only: ['find', 'findOne'],
  });

  ```

:::

<!-- TODO: add a conclusion or links for other steps -->
