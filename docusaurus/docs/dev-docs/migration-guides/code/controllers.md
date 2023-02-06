---
title: v4 code migration - Controllers - Strapi Developer Docs
description: Migrate controllers of a Strapi application from v3.6.x to v4.0.x
canonicalUrl:  https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.html
next: ./services
---

# v4 code migration: Updating controllers

This guide is part of the [v4 code migration guide](/dev-docs/migration-guides/code-migration) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

:::strapi v3/v4 comparison
In both Strapi v3 and v4, creating content-types automatically generates core API controllers. Controllers are JavaScript files that contain a list of methods, called actions.

In Strapi v3, controllers export an object containing actions that are merged with the existing actions of core API controllers, allowing customization.

In Strapi v4, controllers export the result of a call to the [`createCoreController` factory function](/dev-docs/backend-customization/controllers#implementation), with or without further customization.
:::

Migrating [controllers](dev-docs/backend-customization/controllers) to Strapi v4 consists in making sure that each controller is located in the proper folder and uses the `createCoreController` factory function introduced in v4.

Due to the differences between controllers implementation in Strapi v3 and v4, it's recommended to create a new controller file, then optionally bring existing v3 customizations into the new file and adapt them when necessary.

::: note
The controller file can be created automatically with the [interactive CLI command `strapi generate`](/dev-docs/cli#strapi-generate).
:::

To create a v4 controller:

1. Create a `api/<api-name>/controllers/<controller-name>.js` file inside the `./src` folder (see [project structure](/dev-docs/project-structure)).

2. Copy and paste the following code at the top of the `./src/api/<api-name>/controllers/<controller-name>.js` file. The code imports the `createCoreController` factory function from the factories included with the core of Strapi:

    ```js
    const { createCoreController } = require('@strapi/strapi').factories;
    ```

3. Copy and paste the following code, replacing `api-name` and `content-type-name` with appropriate names. The code exports the result of a call to the `createCoreController` factory function, passing the unique identifier of the content-type (e.g. `api::api-name.content-type-name`) as an argument:

    ```js
    module.exports = createCoreController('api::api-name.content-type-name')
    ```

4. (_optional_) To customize controller actions, pass a second argument to the `createCoreController` factory function. This argument can be either an object or a function returning an object. The object contains methods, which can either be entirely new actions or replace or extend existing actions of core API controllers (see [controllers implementation documentation](/dev-docs/backend-customization/controllers#adding-a-new-controller)).

<details>
<summary> Example of a v4 controller without customization:</summary>

  ```jsx title="path: ./src/api/<content-type-name>/controllers/<controller-name>.js"

  const { createCoreController } = require('@strapi/strapi').factories;

  module.exports = createCoreController('api::api-name.content-type-name');
  ```

</details>

<details>
<summary> Example of a v4 controller with customization:</summary>

  ```jsx title="path: ./src/api/<content-type-name>/controllers/<controller-name>.js"

  const { createCoreController } = require('@strapi/strapi').factories;

  module.exports = createCoreController('api::api-name.content-type-name', ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async find(ctx) {
      // some custom logic here
      ctx.query = { ...ctx.query, local: 'en' }

      // calling the default core action with super
      const { data, meta } = await super.find(ctx);

      // some more custom logic
      meta.date = Date.now()

      return { data, meta };
    },
  }));

  ```

</details>

:::tip Customization tips

- The original controller’s CRUD actions can be called using `super` (e.g. `super.find()`).
- The `sanitizeInput` and `sanitizeOutput` utilities can be used in Strapi v4 and replace the `sanitizeEntity` utility from v3.

More examples can be found in the [controllers implementation documentation](/dev-docs/backend-customization/controllers#implementation).
:::

:::strapi Next steps
[Migrating the back end code](/dev-docs/migration-guides/code/backend) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [configuration](/dev-docs/migration-guides/code/backend/configuration), [dependencies](/dev-docs/migration-guides/code/dependencies), [routes](/dev-docs/migration-guides/code/backend/routes), [services](/dev-docs/migration-guides/code/services), and [content-type schemas](/dev-docs/migration-guides/code/content-type-schema).
:::
