import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
const imgStyle = {width: '100%', margin: '0'}
const captionStyle = {fontSize: '12px'}

# Controllers

Controllers are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](/dev-docs/backend-customization/routes). Whenever a client requests the route, the action performs the business logic code and sends back the [response](/dev-docs/backend-customization/requests-responses). Controllers represent the C in the model-view-controller (MVC) pattern.

In most cases, the controllers will contain the bulk of a project's business logic. But as a controller's logic becomes more and more complicated, it's a good practice to use [services](/dev-docs/backend-customization/services) to organize the code into re-usable parts.

<figure style={imgStyle}>
  <img src="/img/assets/backend-customization/diagram-controllers-services.png" alt="Simplified Strapi backend diagram with controllers highlighted" />
  <em><figcaption style={captionStyle}>The diagram represents a simplified version of how a request travels through the Strapi back end, with controllers highlighted. The backend customization introduction page includes a complete, <a href="/dev-docs/backend-customization#interactive-diagram">interactive diagram</a>.</figcaption></em>
</figure>

<br/>

:::caution
Before deciding to customize core controllers, please consider creating custom route middlewares (see [routes documentation](/dev-docs/backend-customization/routes)).
:::

## Implementation

Controllers can be [generated or added manually](#adding-a-new-controller). Strapi provides a `createCoreController` factory function that automatically generates core controllers and allows building custom ones or [extend or replace the generated controllers](#extending-core-controllers).

### Adding a new controller

A new controller can be implemented:

- with the [interactive CLI command `strapi generate`](/dev-docs/cli)
- or manually by creating a JavaScript file:
  - in `./src/api/[api-name]/controllers/` for API controllers (this location matters as controllers are auto-loaded by Strapi from there)
  - or in a folder like `./src/plugins/[plugin-name]/server/controllers/` for plugin controllers, though they can be created elsewhere as long as the plugin interface is properly exported in the `strapi-server.js` file (see [Server API for Plugins documentation](/dev-docs/api/plugins/server-api))

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::restaurant.restaurant",
  ({ strapi }) => ({
    /**
     * Example 1: Modifying a Strapi controller function
     *
     * If you need to modify the input or output of a pre-defined Strapi controller method,
     * write a method of the same name, and use `super` to call the parent method.
     * */
    async find(ctx) {
      // your custom logic for modifying the input
      ctx.query = { ...ctx.query, locale: "en" }; // force ctx.query.locale to 'en' regardless of what was requested

      // Call the default parent controller action
      const result = await super.find(ctx);

      // your custom logic for modifying the output
      result.meta.date = Date.now(); // change the date that is returned

      return result;
    },

    /**
     * Example 2: Replacing a Strapi controller function
     *
     * If you need to completely replace the behavior of a pre-defined Strapi controller method,
     * you can do so by simply implementing a method of the same name.
     *
     * Caution: You will need to manage the security of the request and results on your own,
     * as demonstrated in this example.
     * */
    async find(ctx) {
      // validateQuery throws an error if any of the query params used are inaccessible to ctx.user
      // That is, trying to access private fields, fields they don't have permission for, wrong data type, etc
      await this.validateQuery(ctx);

      // sanitizeQuery silently removes any query params that are invalid or the user does not have access to
      // It is recommended to use sanitizeQuery even if validateQuery is used, as validateQuery allows
      // a number of non-security-related cases such as empty objects in string fields to pass, while sanitizeQuery
      // will remove them completely
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      // Perform whatever custom actions are needed
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);

      // sanitizeOutput removes any data that was returned by our query that the ctx.user should not have access to
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      // transformResponse correctly formats the data and meta fields of your results to return to the API
      return this.transformResponse(sanitizedResults, { pagination });
    },

    /**
     * Example 3: Writing your own new controller function
     * If you need to create some new action that does not match one of the pre-configured Strapi methods,
     * you can simply add the method with the desired name and implement whatever functionality you want.
     *
     * Caution: Similar to replacing a controller, you will need to manage the security of the request
     * yourself, so remember to use sanitizers and validators as needed.
     * */
    async healthCheck(ctx) {
      ctx.body = "ok";
    },
  })
);
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::restaurant.restaurant",
  ({ strapi }) => ({
    /**
     * Example 1: Modifying a Strapi controller function
     *
     * If you need to modify the input or output of a pre-defined Strapi controller method,
     * write a method of the same name, and use `super` to call the parent method.
     * */
    async find(ctx) {
      // your custom logic for modifying the input
      ctx.query = { ...ctx.query, locale: "en" }; // force ctx.query.locale to 'en' regardless of what was requested

      // Call the default parent controller action
      const result = await super.find(ctx);

      // your custom logic for modifying the output
      result.meta.date = Date.now(); // change the date that is returned

      return result;
    },

    /**
     * Example 2: Replacing a Strapi controller function
     *
     * If you need to completely replace the behavior of a pre-defined Strapi controller method,
     * you can do so by simply implementing a method of the same name.
     *
     * Caution: You will need to manage the security of the request and results on your own,
     * as demonstrated in this example.
     * */
    async find(ctx) {
      // validateQuery throws an error if any of the query params used are inaccessible to ctx.user
      // That is, trying to access private fields, fields they don't have permission for, wrong data type, etc
      await this.validateQuery(ctx);

      // sanitizeQuery silently removes any query params that are invalid or the user does not have access to
      // It is recommended to use sanitizeQuery even if validateQuery is used, as validateQuery allows
      // a number of non-security-related cases such as empty objects in string fields to pass, while sanitizeQuery
      // will remove them completely
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      // Perform whatever custom actions are needed
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);

      // sanitizeOutput removes any data that was returned by our query that the ctx.user should not have access to
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      // transformResponse correctly formats the data and meta fields of your results to return to the API
      return this.transformResponse(sanitizedResults, { pagination });
    },

    /**
     * Example 3: Writing your own new controller function
     * If you need to create some new action that does not match one of the pre-configured Strapi methods,
     * you can simply add the method with the desired name and implement whatever functionality you want.
     *
     * Caution: Similar to replacing a controller, you will need to manage the security of the request
     * yourself, so remember to use sanitizers and validators as needed.
     * */
    async healthCheck(ctx) {
      try {
        ctx.body = "ok";
      } catch (err) {
        ctx.body = err;
      }
    },
  })
);
```

</TabItem>
</Tabs>

Each controller action can be an `async` or `sync` function.
Every action receives a context object (`ctx`) as a parameter. `ctx` contains the [request context](/dev-docs/backend-customization/requests-responses#requests) and the [response context](/dev-docs/backend-customization/requests-responses#responses).

<details>
<summary>Example: GET /hello route calling a basic controller</summary>

A specific `GET /hello` [route](/dev-docs/backend-customization/routes) is defined, the name of the router file (i.e. `index`) is used to call the controller handler (i.e. `index`). Every time a `GET /hello` request is sent to the server, Strapi calls the `index` action in the `hello.js` controller, which returns `Hello World!`:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js "title="./src/api/hello/routes/hello.js"
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/hello",
      handler: "hello.index",
    },
  ],
};
```

```js "title="./src/api/hello/controllers/hello.js"
module.exports = {
  async index(ctx, next) {
    // called by GET /hello
    ctx.body = "Hello World!"; // we could also send a JSON
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js "title="./src/api/hello/routes/hello.ts"
export default {
  routes: [
    {
      method: "GET",
      path: "/hello",
      handler: "hello.index",
    },
  ],
};
```

```js title="./src/api/hello/controllers/hello.ts"
export default {
  async index(ctx, next) {
    // called by GET /hello
    ctx.body = "Hello World!"; // we could also send a JSON
  },
};
```

</TabItem>

</Tabs>

</details>

:::note
When a new [content-type](/dev-docs/backend-customization/models#content-types) is created, Strapi builds a generic controller with placeholder code, ready to be customized.
:::

:::tip Tips
- To see a possible advanced usage for custom controllers, read the [services and controllers](/dev-docs/backend-customization/examples/services-and-controllers) page of the backend customization examples cookbook.
- If you want to implement unit testing to your controllers, this [blog post](https://strapi.io/blog/automated-testing-for-strapi-api-with-jest-and-supertest) should get you covered.
:::

### Sanitization and Validation in controllers

Sanitization means that the object is “cleaned” and returned.

Validation means an assertion is made that the data is already clean and throws an error if something is found that shouldn't be there.

In Strapi:

- validation is applied on query parameters, 
- and only sanitization is applied to input data (create and update body data).

:::warning
It's strongly recommended you sanitize (v4.8.0+) and/or validate (v4.13.0+) your incoming request query utilizing the new `sanitizeQuery` and `validateQuery` functions to prevent the leaking of private data.
:::

#### Sanitization when utilizing controller factories

Within the Strapi factories the following functions are exposed that can be used for sanitization and validation:

| Function Name    | Parameters                 | Description                                                                          |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `sanitizeQuery`  | `ctx`                      | Sanitizes the request query                                                          |
| `sanitizeOutput` | `entity`/`entities`, `ctx` | Sanitizes the output data where entity/entities should be an object or array of data |
| `sanitizeInput`  | `data`, `ctx`              | Sanitizes the input data                                                             |
| `validateQuery`  | `ctx`                      | Validates the request query (throws an error on invalid params)                      |
| `validateInput`  | `data`, `ctx`              | (EXPERIMENTAL) Validates the input data (throws an error on invalid data)            |

These functions automatically inherit the sanitization settings from the model and sanitize the data accordingly based on the content-type schema and any of the content API authentication strategies, such as the Users & Permissions plugin or API tokens.

:::warning
Because these methods use the model associated with the current controller, if you query data that is from another model (i.e., doing a find for "menus" within a "restaurant" controller method), you must instead use the `@strapi/utils` tools, such as `sanitize.contentAPI.query` described in [Sanitizing Custom Controllers](#sanitize-validate-custom-controllers), or else the result of your query will be sanitized against the wrong model.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::restaurant.restaurant",
  ({ strapi }) => ({
    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
  })
);
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::restaurant.restaurant",
  ({ strapi }) => ({
    async find(ctx) {
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const { results, pagination } = await strapi
        .service("api::restaurant.restaurant")
        .find(sanitizedQueryParams);
      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
  })
);
```

</TabItem>
</Tabs>

#### Sanitization and validation when building custom controllers {#sanitize-validate-custom-controllers}

Within custom controllers, there are 5 primary functions exposed via the `@strapi/utils` package that can be used for sanitization and validation:

| Function Name                | Parameters                    | Description                                                                                                                                           |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sanitize.contentAPI.input`  | `data`, `schema`, `auth`      | Sanitizes the request input including non-writable fields, removing restricted relations, and other nested "visitors" added by plugins                |
| `sanitize.contentAPI.output` | `data`, `schema`, `auth`      | Sanitizes the response output including restricted relations, private fields, passwords, and other nested "visitors" added by plugins                 |
| `sanitize.contentAPI.query`  | `ctx.query`, `schema`, `auth` | Sanitizes the request query including filters, sort, fields, and populate                                                                             |
| `validate.contentAPI.query`  | `ctx.query`, `schema`, `auth` | Validates the request query including filters, sort, fields (currently not populate)                                                                  |
| `validate.contentAPI.input`  | `data`, `schema`, `auth`      | (EXPERIMENTAL) Validates the request input including non-writable fields, removing restricted relations, and other nested "visitors" added by plugins |

:::note
Depending on the complexity of your custom controllers, you may need additional sanitization that Strapi cannot currently account for, especially when combining the data from multiple sources.
:::

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/controllers/restaurant.js"
const { sanitize, validate } = require("@strapi/utils");

module.exports = {
  async findCustom(ctx) {
    const contentType = strapi.contentType("api::test.test");
    await validate.contentAPI.query(ctx.query, contentType, {
      auth: ctx.state.auth,
    });
    const sanitizedQueryParams = await sanitize.contentAPI.query(
      ctx.query,
      contentType,
      { auth: ctx.state.auth }
    );

    const entities = await strapi.entityService.findMany(
      contentType.uid,
      sanitizedQueryParams
    );

    return await sanitize.contentAPI.output(entities, contentType, {
      auth: ctx.state.auth,
    });
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/restaurant/controllers/restaurant.ts"
import { sanitize, validate } from "@strapi/utils";

export default {
  async findCustom(ctx) {
    const contentType = strapi.contentType("api::test.test");

    await validate.contentAPI.query(ctx.query, contentType, {
      auth: ctx.state.auth,
    });
    const sanitizedQueryParams = await sanitize.contentAPI.query(
      ctx.query,
      contentType,
      { auth: ctx.state.auth }
    );

    const entities = await strapi.entityService.findMany(
      contentType.uid,
      sanitizedQueryParams
    );

    return await sanitize.contentAPI.output(entities, contentType, {
      auth: ctx.state.auth,
    });
  },
};
```

</TabItem>
</Tabs>

### Extending core controllers

Default controllers and actions are created for each content-type. These default controllers are used to return responses to API requests (e.g. when `GET /api/articles/3` is accessed, the `findOne` action of the default controller for the "Article" content-type is called). Default controllers can be customized to implement your own logic. The following code examples should help you get started.

:::tip
An action from a core controller can be replaced entirely by [creating a custom action](#adding-a-new-controller) and naming the action the same as the original action (e.g. `find`, `findOne`, `create`, `update`, or `delete`).
:::

:::tip
When extending a core controller, you do not need to re-implement any sanitization as it will already be handled by the core controller you are extending. Where possible it's strongly recommended to extend the core controller instead of creating a custom controller.
:::



<details>
<summary>Collection type examples</summary>

:::tip
The [backend customization examples cookbook](/dev-docs/backend-customization/examples) shows how you can overwrite a default controller action, for instance for the [`create` action](/dev-docs/backend-customization/examples/services-and-controllers#custom-controller).
:::

<Tabs>
<TabItem value="find" label="`find()`">

```js
async find(ctx) {
  // some logic here
  const { data, meta } = await super.find(ctx);
  // some more logic

  return { data, meta };
}
```

</TabItem>

<TabItem value="findOne" label="findOne()">

```js
async findOne(ctx) {
  // some logic here
  const response = await super.findOne(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="create" label="create()">

```js
async create(ctx) {
  // some logic here
  const response = await super.create(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

</TabItem>
</Tabs>
</details>

<details>
<summary>Single type examples</summary>
<Tabs>

<TabItem value="find" label="find()">

```js
async find(ctx) {
  // some logic here
  const response = await super.find(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="update" label="update()">

```js
async update(ctx) {
  // some logic here
  const response = await super.update(ctx);
  // some more logic

  return response;
}
```

</TabItem>

<TabItem value="delete" label="delete()">

```js
async delete(ctx) {
  // some logic here
  const response = await super.delete(ctx);
  // some more logic

  return response;
}
```

</TabItem>
</Tabs>
</details>

## Usage

Controllers are declared and attached to a route. Controllers are automatically called when the route is called, so controllers usually do not need to be called explicitly. However, [services](/dev-docs/backend-customization/services) can call controllers, and in this case the following syntax should be used:

```js
// access an API controller
strapi.controller("api::api-name.controller-name");
// access a plugin controller
strapi.controller("plugin::plugin-name.controller-name");
```

:::tip
To list all the available controllers, run `yarn strapi controllers:list`.
:::
