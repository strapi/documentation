---
title: v4 code migration - Routes - Strapi Developer Docs
description: Migrate routes of a Strapi application from v3.6.x to v4.0.x
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html
next: ./controllers.md
---

# v4 code migration: Updating routes

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In both Strapi v3 and v4, creating content-types automatically generates core API routes.

In Strapi v3, routes are defined in JSON files that export an object with a `routes` property. `routes` is an array of objects, each object being a route with its own parameters.

In Strapi v4, routes are defined in JavaScript files, called router files. 2 types of v4 router files coexist:

* core router files export the result of a call to the [`createCoreRouter` factory function](/developer-docs/latest/development/backend-customization/routes.md#configuring-core-routers) introduced in Strapi v4
* [custom router files](/developer-docs/latest/development/backend-customization/routes.md#creating-custom-routers) have a structure similar to Strapi v3 routes.
:::

Migrating [routes](/developer-docs/latest/development/backend-customization/routes.md) depends on whether you want to [configure core routers](#migrating-core-routers) or [migrate custom routers](#migrating-custom-routers).

## Migrating core routers

Migrating a core router to Strapi v4 consists in making sure that each router file uses the `createCoreRouter` factory function introduced in v4.

Due to the differences between routes implementation in Strapi v3 and v4, it's required to create a new router file, then optionally bring existing Strapi v3 customizations into the new file and adapt them when necessary.

To create a v4 core router file:

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

::: details Example of a Strapi v4 core router without customization:

  ```jsx
  // path: ./src/api/<content-type-name>/routes/<router-name>.js

  const { createCoreRouter } = require('@strapi/strapi').factories;

  module.exports = createCoreRouter('api::api-name.content-type-name');
  ```

:::

::: details Example of a Strapi v4 core router with customization:

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

## Migrating custom routers

Custom routers in Strapi v4 are JavaScript files that export an array of objects, each object being a route, in a structure similar to the JSON routers configuration files used in Strapi v3.

To migrate a custom router to Strapi v4:

1. Create a `api/<api-name>/routes/<custom-router-name>.js` file inside the `./src` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).
2. Make sure this `./src/api/<api-name>/routes/<custom-router-name>.js` file exports an object:

    ```js
    // path: ./src/api/<api-name>/routes/<router-name>.js

    module.exports = {

    }
    ```

3. Copy and paste the `routes` array declared in the Strapi v3 JSON file into the object exported by the Strapi v4 file.
4. Convert the exported object in Strapi v4 to a cleaner JavaScript format, removing all `"` on keys from the Strapi v3 JSON format (e.g. `"method"` → `method`, `"path"` → `path`).

::: details Example of a Strapi v4 custom router:

```js
// path: ./src/api/restaurant/routes/custom-restaurant.js

module.exports = {
  routes: [
    { // Path defined with a URL parameter
      method: 'GET',
      path: '/restaurants/:category/:id',
      handler: 'Restaurant.findOneByCategory',
    },
    { // Path defined with a regular expression
      method: 'GET',
      path: '/restaurants/:region(\\d{2}|\\d{3})/:id', // Only match when the first parameter contains 2 or 3 digits.
      handler: 'Restaurant.findOneByRegion',
    },
    { // Route with custom policies
      method: 'POST',
      path: "/restaurants/:id/reservation",
      handler: 'Restaurant.reservation',
      config: {
        policies: ["is-authenticated", "has-credit-card"]
      }
    }
  ]
}

```

:::

::: strapi Next steps
[Migrating the back end code](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.md), [dependencies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.md), [controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md), [services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md), and [content-type schemas](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.md).
:::
