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

### Controllers & Middlewares

The recommended way to throw errors when developing any custom logic with Strapi is to have the [controller](/developer-docs/latest/development/backend-customization/controllers.md) or [middleware](/developer-docs/latest/development/backend-customization/) respond with the correct status and body.

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

// path: ./src/api/[api-name]/middlewares/my-middleware.js

module.exports = async (ctx, next) => {
  const newName = ctx.request.body.name;
  if (!newName) {
    return ctx.badRequest('name is missing', { foo: 'bar' })
  }
  await next();
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

// path: ./src/api/[api-name]/middlewares/my-middleware.ts

export default async (ctx, next) => {
  const newName = ctx.request.body.name;
  if (!newName) {
    return ctx.badRequest('name is missing', { foo: 'bar' })
  }
  await next();
}

```

</code-block>
</code-group>

### Services and Model Lifecycles

Once you are working at a deeper layer than the controllers or middlewares there are dedicated error classes that can be used to throw errors. These classes are extensions of [Node Error Class](https://nodejs.org/api/errors.html#errors_class_error) and are specifically targeted for certain use-cases.

| Error class | Description | Default Message |
| --- | --- | --- |
| [ApplicationError]() | Generic error class for application errors | `An application error occured` |
| [ValidationError]() | Error class typically used for custom validation | - |
| [YupValidationError]() | Error class for validation errors using [Yup](https://www.npmjs.com/package/yup) | - |
| [PaginationError]() | Error class used for when pagination values are improperly formatted | `Invalid pagination` |
| [NotFoundError]() | Error class for when something doesn't exist | `Entity not found` |
| [ForbiddenError]() | Error class for when a user doesn't provide or provides incorrect credentials | `Forbidden access` |
| [UnauthorizedError]() | Error class for when a user isn't authorized to access a resource | `Unauthorized` |
| [PayloadTooLargeError]() | Error class for when the incoming request payload is too large | `Entity too large` |
| [PolicyError]() | Error class for Strapi policies | `Policy Failed` |

These error classes are imported through the `@strapi/utils` package and can be called from several different layers and are not just limited to services and model lifecycles but all examples below are using the service layer. When throwing errors in the model lifecycle layer, it's strongly recommended to use the `ApplicationError` class so that proper error messages are shown in the admin panel.

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/restaurant/services/restaurant.js

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  async create(params) {
    let okay = false;

    // Throwing an error will prevent the restaurant from being created
    if (!okay) {
      throw new ApplicationError('Something went wrong', { foo: 'bar' });
    }
  
    const result = await super.create(params);

    return result;
  }
});

```

</code-block>

<code-block title="TYPESCRIPT">


```js
// path: ./src/api/[api-name]/policies/my-policy.ts

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
const { createCoreService } = require('@strapi/strapi').factories;

export default (policyContext, config, { strapi }) => {
  let isAllowed = false;

  if (isAllowed) {
    return true;
  } else {
    throw new PolicyError('You are not allowed to perform this action', {
      policy: 'my-policy',
      myCustomKey: 'myCustomValue',
    });
  }
};

```

</code-block>
</code-group>

### Policies

[Policies](/developer-docs/latest/development/backend-customization/policies.md) are a special type of middleware that are executed before a controller. They are used to check if the user is allowed to perform the action or not. If the user is not allowed to perform the action and a `return false` is used then a generic error will be thrown. As an alternative, you can throw a custom error message using a nested class extensions from the Strapi [Forbidden Error Class](), [Application Error Class](), and finally the [Node Error Class](https://nodejs.org/api/errors.html#errors_class_error).

The `PolicyError` class is available from `@strapi/utils` package and accepts 2 parameters:

- the first parameter of the function is the error `message`
- (optional) the second parameter is the object that will be set as `details` in the response received and it's generally a best practice to set a `policy` key with the name of the policy that threw the error.

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/[api-name]/policies/my-policy.js

const utils = require('@strapi/utils');
const { PolicyError } = utils.errors;

module.exports = (policyContext, config, { strapi }) => {
  let isAllowed = false;

  if (isAllowed) {
    return true;
  } else {
    throw new PolicyError('You are not allowed to perform this action', {
      policy: 'my-policy',
      myCustomKey: 'myCustomValue',
    });
  }
}

```

</code-block>

<code-block title="TYPESCRIPT">


```js
// path: ./src/api/[api-name]/policies/my-policy.ts

const utils = require('@strapi/utils');
const { PolicyError } = utils.errors;

export default (policyContext, config, { strapi }) => {
  let isAllowed = false;

  if (isAllowed) {
    return true;
  } else {
    throw new PolicyError('You are not allowed to perform this action', {
      policy: 'my-policy',
      myCustomKey: 'myCustomValue',
    });
  }
};

```

</code-block>
</code-group>

### Custom Errors
