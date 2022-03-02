---
title: v4 code migration - Services - Strapi Developer Docs
description: Migrate services of a Strapi application from v3.6.8 to v4.0.x
canonicalUrl:  Used by Google to index page, should start with https://docs.strapi.io/ — delete this comment when done [paste final URL here]
---

<!-- TODO: update SEO -->

# v4 code migration: Updating services

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In both Strapi v3 and v4, creating content-types automatically generates core API services. Services are a set of reusable functions.

In Strapi v3, services export an object containing actions that are merged with the existing actions of core API services, allowing customization.

In Strapi v4, services export the result of a call to the [`createCoreService` factory function](/developer-docs/latest/development/backend-customization/services.md#adding-a-new-service), with or without further customization.
:::

Migrating a [service](/developer-docs/latest/development/backend-customization/services.md) to Strapi v4 consists in making sure it uses the `createCoreService` factory function introduced in v4.

Due to the differences between services implementation in Strapi v3 and v4, it's recommended to create a new service file, then optionally bring existing v3 customizations into the new file and adapt them when necessary.

A new service can be created:

- manually, starting at step 1 of the following procedure,
- or automatically, using the [`strapi generate` interactive CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) then jumping to step 2 of the following procedure.

To create a v4 service:

1. Create a `api/<api-name>/services/<service-name>.js` file inside the `./src` folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

2. Copy and paste the following code at the top of the `./src/api/<api-name>/services/<service-name>.js` file. The code imports the `createCoreService` factory function from the factories included with the core of Strapi:

    ```js
    const { createCoreService } = require('@strapi/strapi').factories;
    ```

3. Copy and paste the following code, replacing `api-name` and `content-type-name` with appropriate names. The code exports the result of a call to the `createCoreService` factory function, passing the unique identifier of the content-type (e.g. `api::api-name.content-type-name`) as an argument:

    ```js
    module.exports = createCoreService('api::api-name.content-type-name')
    ```

4. (_optional_) To customize the service, pass a second argument to the `createCoreService` factory function. This argument can be either an object or a function returning an object. The object contains methods, which can either be entirely new actions or replace or extend existing actions of core API controllers (see [services implementation documentation](/developer-docs/latest/development/backend-customization/services.md#implementation)).

::: details Example of a v4 service without customization

  ```jsx
  // path: ./src/api/<content-type-name>/services/<service-name>.js

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::api-name.content-type-name');
  ```

:::

::: details Example of a v4 service with customization

  ```jsx
  // path: ./src/api/<content-type-name>/services/<service-name>.js

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::api-name.content-type-name', ({ strapi }) => {
    async find(...args) {
      const { results, pagination } = await super.find(...args);

      results.forEach(result => {
        result.counter = 1;
      });

      return { results, pagination };
    },
  }));

  ```

:::

:::tip Customization tips

- The original service’s CRUD methods can be called using `super` (e.g. `super.find()`).
- The `this.getFetchParams()` utility function can be used to wrap parameters with some default parameters (e.g. a default value for [the `publicationState`](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#publication-state)). `this.getFetchParams()` has the following signature: `(params: Object) => Object`.

More examples can be found in the [services implementation documentation](/developer-docs/latest/development/backend-customization/services.md#implementation).
:::

<!-- TODO: add a conclusion or links for other steps -->
