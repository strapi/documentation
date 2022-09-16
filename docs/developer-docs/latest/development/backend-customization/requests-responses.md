---
title: Requests and Responses - Strapi Developer Docs
description: Learn more about requests and responses for Strapi, the most popular headless CMS.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/requests-responses.html
---

# Requests & Responses

## Requests

The context object (`ctx`) contains all the requests related information. They are accessible through `ctx.request`, from [controllers](/developer-docs/latest/development/backend-customization/controllers.md) and [policies](/developer-docs/latest/development/backend-customization/policies.md).

Strapi passes the `body` on `ctx.request.body` and `files` through `ctx.request.files`

For more information, please refer to the [Koa request documentation](http://koajs.com/#request).

## Responses

The context object (`ctx`) contains a list of values and functions useful to manage server responses. They are accessible through `ctx.response`, from [controllers](/developer-docs/latest/development/backend-customization/controllers.md) and [policies](/developer-docs/latest/development/backend-customization/policies.md).

For more information, please refer to the [Koa response documentation](http://koajs.com/#response).

## Accessing the request context anywhere

::: callout ✨ New in v4.3.9
The `strapi.requestContext` works with Strapi v4.3.9+.
:::

Strapi exposes a way to access the current request context from anywhere in the code (e.g. lifecycle functions).

You can access the request as follows:

```js
const ctx = strapi.requestContext.get();
```

You should only use this inside of functions that will be called in the context of an HTTP request.

```js
// correct

const service = {
  myFunction() {
    const ctx = strapi.requestContext.get();
    console.log(ctx.state.user);
  },
};

// incorrect
const ctx = strapi.requestContext.get();

const service = {
  myFunction() {
    console.log(ctx.state.user);
  },
};
```

**Example:**

```js
//path: ./api/test/content-types/article/lifecycles.js

module.exports = {
  beforeUpdate() {
    const ctx = strapi.requestContext.get();

    console.log('User info in service: ', ctx.state.user);
  },
};
```

::: note
Strapi uses a Node.js feature called [AsyncLocalStorage](https://nodejs.org/docs/latest-v16.x/api/async_context.html#class-asynclocalstorage) to make the context available anywhere.
:::
