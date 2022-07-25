---
title: Error handling - Strapi Developer Docs
description: With Strapi's error handling feature it's easy to send and receive errors in your application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/error-handling.html
---

# Error handling

Strapi is natively handling errors with a standard format.

There are 2 use cases for error handling:

- As a developer querying content through the [REST](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) or [GraphQL](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md) APIs, you might [receive errors](#receiving-errors) in response to the requests.
- As a developer customizing the backend of your Strapi application, you could use controllers and services to [throw errors](#throwing-errors).

## Receiving errors

Errors are included in the response object with the `error` key and include information such as the HTTP status code, the name of the error, and additional information.

### REST errors

Errors thrown by the REST API are included in the [response](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#requests) that has the following format:

```json
{
  "data": null,
  "error": {
    "status": "", // HTTP status
    "name": "", // Strapi error name ('ApplicationError' or 'ValidationError')
    "message": "", // A human readable error message
    "details": {
      // error info specific to the error type
    }
  }
}
```

### GraphQL errors

Errors thrown by the GraphQL API are included in the [response](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#unified-response-format) that has the following format:

```json
{ "errors": [
    {
      "message": "", // A human reable error message
      "extensions": {
        "error": {
          "name": "", // Strapi error name ('ApplicationError' or 'ValidationError'),
          "message": "", // A human reable error message (same one as above);
          "details": {}, // Error info specific to the error type
        },
        "code": "" // GraphQL error code (ex: BAD_USER_INPUT)
      }
    }
  ],
  "data": {
    "graphQLQueryName": null
  }
}
```

## Throwing errors

The recommended way to throw errors when developing any custom logic with Strapi is to have the [controller](/developer-docs/latest/development/backend-customization/controllers.md) respond with the correct status and body.

This can be done by calling an error function on the context (i.e. `ctx`). Available error functions are listed in the [http-errors documentation](https://github.com/jshttp/http-errors#list-of-all-constructors) but their name should be lower camel-cased to be used by Strapi (e.g. `badRequest`).

Error functions accept 2 parameters that correspond to the `error.message` and `error.details` attributes [received](#receiving-errors) by a developer querying the API:

- the first parameter of the function is the error `message`
- and the second one is the object that will be set as `details` in the response received

<code-group>
<code-block title="JAVASCRIPT">

```js

// path: ./src/api/[api-name]/controllers/my-controller.js

module.exports = {
  renameDog: async (ctx, next) => {
    const newName = ctx.request.body.name;
    if (!newName) {
      return ctx.badRequest('name is missing', { foo: 'bar' })
    }
    ctx.body = strapi.service('api::dog.dog').rename(newName);
  }
}

```


</code-block>

<code-block title="TYPESCRIPT">


```js

// path: ./src/api/[api-name]/controllers/my-controller.ts

export default {
  renameDog: async (ctx, next) => {
    const newName = ctx.request.body.name;
    if (!newName) {
      return ctx.badRequest('name is missing', { foo: 'bar' })
    }
    ctx.body = strapi.service('api::dog.dog').rename(newName);
  }
}

```

</code-block>
</code-group>


:::note
[Services](/developer-docs/latest/development/backend-customization/services.md) don't have access to the controller's `ctx` object. If services need to throw errors, these need to be caught by the controller, that in turn is in charge of calling the proper error function.
:::
