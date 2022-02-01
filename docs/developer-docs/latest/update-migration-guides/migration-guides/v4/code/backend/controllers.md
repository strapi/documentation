---
title: v4 code migration - Controllers - Strapi Developer Docs
description: Migrate controllers of a Strapi application from v3.6.8 to v4.0.x
canonicalUrl:  Used by Google to index page, should start with https://docs.strapi.io/ — delete this comment when done [paste final URL here]
---

<!-- TODO: update SEO -->

# v4 code migration: Updating controllers

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In both Strapi v3 and v4, core API controllers are automatically generated when content-types are created and can be customized.

In Strapi v3, controllers are JavaScript files that export an object containing methods, called actions. Actions allow customizing controllers and are merged with the core API controllers.

In Strapi v4, controllers are JavaScript files that export the result of a call to the [`createCoreController` factory function](/developer-docs/latest/development/backend-customization/controllers.md#implementation), with or without further customization.
:::

Migrating a controller to Strapi v4 consists in making sure the controller is located in the proper folder and uses the `createCoreController` factory function introduced in v4.

Due to the differences between controllers implementation in Strapi v3 and v4, it's recommended to create a new controller file, then optionally bring existing v3 customizations into the new file and adapt them when necessary.

A new controller can be created:

- manually with the following procedure, starting at step 1
- or automatically, using the [`strapi generate` interactive CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) then jumping directly to step 4 of the following procedure if controller customizations are required.

To create a v4 controller:

1. Create a `api/<api-name>/controllers/<controller-name>.js` file inside the `./src` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

2. At the top of the `./src/api/<api-name>/controllers/<controller-name>.js` file, import the `createCoreController` factory function from the factories included with the core of Strapi:

    ```js
    const { createCoreController } = require('@strapi/strapi').factories;
    ```

3. Export the result of a call to the `createCoreController` factory function, passing the unique identifier of the content-type (e.g. `api::api-name.content-type-name`) as an argument:

    ```js
    module.exports = createCoreController('api::api-name.content-type-name')
    ```

4. (_optional_) To customize controller actions, pass a second argument to the `createCoreController` factory function. This argument is an object containing methods, that can either be entirely new actions or replace or extend core API controllers actions (see [controllers implementation documentation](/developer-docs/latest/development/backend-customization/controllers.md#adding-a-new-controller)).

::: details Example of a v4 controller without customization

  ```jsx
  // path: ./src/api/<content-type-name>/controllers/<controller-name>.js

  const { createCoreController } = require('@strapi/strapi').factories;

  module.exports = createCoreController('api::api-name.content-type-name');
  ```

:::

::: details Example of a v4 controller with customization

  ```jsx
  // path: ./src/api/<content-type-name>/controllers/<controller-name>.js

  const { createCoreController } = require('@strapi/strapi').factories;
    
  module.exports = createCoreController('api::api-name.content-type-name', {
    // overwrite the built-in find() method
    async find(ctx) {
      const { results } = await strapi.service('api::address.address').find();
  
      ctx.body = await this.sanitizeOutput(results);
    },
  });
  ```

:::

:::tip Customization tips

* The `sanitizeInput` and `sanitizeOutput` utilities can be used in Strapi v4 and replace the `sanitizeEntity` utility from v3.
* The original controller’s CRUD methods can be called using `super` (e.g. `super.find()`).

More examples can be found in the [controllers implementation documentation](/developer-docs/latest/development/backend-customization/controllers.md#implementation).
:::
