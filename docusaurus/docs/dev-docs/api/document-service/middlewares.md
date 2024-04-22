---
title: Extending the Document Service behavior
description: This document provides information about the middlewares in the Document Service API.
displayed_sidebar: devDocsSidebar
---

# Document Service API: Middlewares

The [Document Service API](/dev-docs/api/document-service) offers the ability to extend its behavior thanks to middlewares.

Middlewares allow you to perform actions before and/or after a method runs.

## Registering a middleware

Syntax: `strapi.documents.use(middleware)`

### Parameters

A middleware is a function that receives a context and a next function.

Syntax: `(context, next) => ReturnType<typeof next>`

| Parameter | Description                           | Type       |
| --------- | ------------------------------------- | ---------- |
| `context` | Middleware context                    | `Context`  |
| `next`    | Call the next middleware in the stack | `function` |

#### `context`

| Parameter     | Description                                                                          | Type          |
| ------------- | ------------------------------------------------------------------------------------ | ------------- |
| `action`      | The method that is running ([see available methods](/dev-docs/api/document-service)) | `string`      |
| `params`      | The method params ([see available methods](/dev-docs/api/document-service))          | `Object`      |
| `uid`         | Content type unique identifier                                                       | `string`      |
| `contentType` | Content type                                                                         | `ContentType` |

#### `next`

`next` is a function without parameters that calls the next middleware in the stack and return its response.

**Example**

```js
strapi.documents.use((context, next) => {
  return next();
});
```

### Where to register

Generaly speaking you should register your middlewares during the Strapi registration phase.

#### Users

`./src/index.js`

```js
module.exports = {
  register({ strapi }) {
    strapi.documents.use((context, next) => {
      // your logic
      return next();
    });
  },

  // bootstrap({ strapi }) {},
  // destroy({ strapi }) {},
};
```

#### Plugin developers

`./strapi-server.js`

```js
module.exports = {
  register({ strapi }) {
    strapi.documents.use((context, next) => {
      // your logic
      return next();
    });
  },

  // bootstrap({ strapi }) {},
  // destroy({ strapi }) {},
};
```

## Implementing a middleware

When implementing a middleware there is only one rule you should follow to avoid breaking your application or a user application:

- Return the response from `next()`

### Examples

```js
const applyTo = ['api::article.article'];

strapi.documents.use((context, next) => {
  // Only run for certain content types
  if (!applyTo.includes(context.uid)) {
    return next();
  }

  // Only run for certain actions
  if (['create', 'update'].includes(context.action)) {
    context.params.data.fullName = `${context.params.data.firstName} ${context.params.data.lastName}`;
  }

  const result = await next();

  // do sth with the result before returning it
  return result
});
```
