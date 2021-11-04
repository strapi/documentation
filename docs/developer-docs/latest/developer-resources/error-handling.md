---
title: Error handling - Strapi Developer Documentation
description: …
---

<!-- TODO: update SEO -->

# Error handling

Strapi has a standard format for errors that can be [returned](#receiving-errors) by the REST and GraphQL APIs or [thrown](#throwing-errors) by the customized parts of the Strapi backend.

## Receiving errors

Errors are included in the response object with the `error` key and include information such as the HTTP status code, the name of the error, and additional information.

### REST errors

Errors thrown by the REST API are included in the [response](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#unified-response-format) that has the following format:

```json
{
  "data": null,
  "error": {
    "status": "", // HTTP status
    "name": "", // Strapi error name ('ApplicationError' or 'ValidationError')
    "message": "", // A human reable error message
    "meta": {
      // error info specific to the error type
    }
  }
}
```

<!-- TODO: add "types" (aka error `name`) list once settled -->

### GraphQL errors

Errors thrown by the GraphQL API are included in the [response](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.html#unified-response-format) that has the following format:

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

The recommended way to throw errors when developing any custom logic with Strapi is to have the [controller](/developer-docs/latest/development/backend-customization/controllers.md) add a `badRequest` object to the context (i.e. `ctx`) based on [Koa's](https://koajs.com/#context) context. This `ctx.badRequest` object should contain error information that follows the proper format (see [receiving errors](#receiving-errors)).

[Services](/developer-docs/latest/development/backend-customization/services.md) don't have access to the controller's `ctx` object. If services need to throw errors, these need to be caught by the controller, that in turn is in charge of sending the proper `ctx.badRequest` along with the response.
