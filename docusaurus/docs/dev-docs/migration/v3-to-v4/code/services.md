---
title: Services
displayed_sidebar: devDocsSidebar
description: Migrate services of a Strapi application from v3.6.x to v4.0.x

next: ./content-type-schema.md
---

# v4 code migration: Updating services

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

:::strapi v3/v4 comparison
In both Strapi v3 and v4, creating content-types automatically generates core API services. Services are a set of reusable functions.

In Strapi v3, services export an object containing actions that are merged with the existing actions of core API services, allowing customization.

In Strapi v4, services export the result of a call to the [`createCoreService` factory function](/dev-docs/backend-customization/services#adding-a-new-service), with or without further customization.
:::

Migrating a [service](/dev-docs/backend-customization/services) to Strapi v4 consists in making sure it uses the `createCoreService` factory function introduced in v4.

Due to the differences between services implementation in Strapi v3 and v4, it's recommended to create a new service file, then optionally bring existing v3 customizations into the new file and adapt them when necessary.

:::note
The service file can be created automatically with the [interactive CLI command `strapi generate`](/dev-docs/cli#strapi-generate).
:::

To create a Strapi v4 service:

1. Create a `api/<api-name>/services/<service-name>.js` file inside the `./src` folder (see [project structure](/dev-docs/project-structure)).

2. Copy and paste the following code at the top of the `./src/api/<api-name>/services/<service-name>.js` file. The code imports the `createCoreService` factory function from the factories included with the core of Strapi:

    ```js
    const { createCoreService } = require('@strapi/strapi').factories;
    ```

3. Copy and paste the following code, replacing `api-name` and `content-type-name` with appropriate names. The code exports the result of a call to the `createCoreService` factory function, passing the unique identifier of the content-type (e.g. `api::api-name.content-type-name`) as an argument:

    ```js
    module.exports = createCoreService('api::api-name.content-type-name')
    ```

4. (_optional_) To customize the service, pass a second argument to the `createCoreService` factory function. This argument can be either an object or a function returning an object. The object contains methods, which can either be entirely new actions or replace or extend existing actions of core API controllers (see [services implementation documentation](/dev-docs/backend-customization/services#implementation)).

<details>
<summary> Example of a v4 service without customization:</summary>

  ```jsx title="./src/api/<content-type-name>/services/<service-name>.js"

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::api-name.content-type-name');
  ```

</details>

<details>
<summary> Example of a v4 service with customization:</summary>

  ```jsx title="./src/api/<content-type-name>/services/<service-name>.js"

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::api-name.content-type-name', ({ strapi }) => ({
    async find(...args) {
      const { results, pagination } = await super.find(...args);

      results.forEach(result => {
        result.counter = 1;
      });

      return { results, pagination };
    },
  }));

  ```

</details>

:::tip Customization tips

- The original service’s CRUD methods can be called using `super` (e.g. `super.find()`).
- The `this.getFetchParams()` utility function can be used to wrap parameters with some default parameters (e.g. a default value for [the `publicationState`](/dev-docs/api/rest/filters-locale-publication#publication-state)). `this.getFetchParams()` has the following signature: `(params: Object) => Object`.

More examples can be found in the [services implementation documentation](/dev-docs/backend-customization/services#implementation).
:::

:::strapi Next steps
[Migrating the backend code](/dev-docs/migration/v3-to-v4/code/backend) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [configuration](/dev-docs/migration/v3-to-v4/code/configuration), [dependencies](/dev-docs/migration/v3-to-v4/code/dependencies), [routes](/dev-docs/migration/v3-to-v4/code/routes), [controllers](/dev-docs/migration/v3-to-v4/code/controllers), and [content-type schemas](/dev-docs/migration/v3-to-v4/code/content-type-schema).
:::
