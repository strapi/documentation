---
title: Error handling
displayed_sidebar: cmsSidebar
description: With Strapi's error handling feature it's easy to send and receive errors in your application.
tags:
- ctx
- GraphQL API
- GraphQL errorsa
- policies
- middlewares
- REST API
- REST errors
- throw errors
- strapi-utils
---

# Error handling

Strapi is natively handling errors with a standard format.

There are 2 use cases for error handling:

- As a developer querying content through the [REST](/cms/api/rest) or [GraphQL](/cms/api/graphql) APIs, you might [receive errors](#receiving-errors) in response to the requests.
- As a developer customizing the backend of your Strapi application, you could use controllers and services to [throw errors](#throwing-errors).

## Receiving errors

Errors are included in the response object with the `error` key and include information such as the HTTP status code, the name of the error, and additional information.

### REST errors

Errors thrown by the REST API are included in the [response](/cms/api/rest#requests) that has the following format:

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

Errors thrown by the GraphQL API are included in the response that has the following format:

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

<br/>

### Controllers and middlewares

The recommended way to throw errors when developing any custom logic with Strapi is to have the [controller](/cms/backend-customization/controllers) or [middleware](/cms/backend-customization/middlewares) respond with the correct status and body.

This can be done by calling an error function on the context (i.e. `ctx`). Available error functions are listed in the [http-errors documentation](https://github.com/jshttp/http-errors#list-of-all-constructors) but their name should be lower camel-cased to be used by Strapi (e.g. `badRequest`).

Error functions accept 2 parameters that correspond to the `error.message` and `error.details` attributes [received](#receiving-errors) by a developer querying the API:

- the first parameter of the function is the error `message`
- and the second one is the object that will be set as `details` in the response received

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
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

</TabItem>

</Tabs>

### Services and models lifecycles

Once you are working at a deeper layer than the controllers or middlewares there are dedicated error classes that can be used to throw errors. These classes are extensions of [Node `Error` class](https://nodejs.org/api/errors.html#errors_class_error) and are specifically targeted for certain use-cases.

These error classes are imported through the `@strapi/utils` package and can be called from several different layers. The following examples use the service layer but error classes are not just limited to services and model lifecycles. When throwing errors in the model lifecycle layer, it's recommended to use the `ApplicationError` class so that proper error messages are shown in the admin panel.

:::note
See the [default error classes](#default-error-classes) section for more information on the error classes provided by Strapi.
:::

#### Example: Throwing an error in a service**

This example shows wrapping a [core service](/cms/backend-customization/services#extending-core-services) and doing a custom validation on the `create` method:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./src/api/restaurant/services/restaurant.js"

const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  async create(params) {
    let okay = false;

    // Throwing an error will prevent the restaurant from being created
    if (!okay) {
      throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
    }
  
    const result = await super.create(params);

    return result;
  }
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./src/api/[api-name]/policies/my-policy.ts"

import { errors } from '@strapi/utils';
import { factories } from '@strapi/strapi';

const { ApplicationError } = errors;

export default factories.createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
  async create(params) {
    let okay = false;

    // Throwing an error will prevent the restaurant from being created
    if (!okay) {
      throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
    }
  
    const result = await super.create(params);

    return result;
  }
}));

```

</TabItem>

</Tabs>

#### Example: Throwing an error in a model lifecycle**

This example shows building a [custom model lifecycle](/cms/backend-customization/models#lifecycle-hooks) and being able to throw an error that stops the request and will return proper error messages to the admin panel. Generally you should only throw an error in `beforeX` lifecycles, not `afterX` lifecycles.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./src/api/[api-name]/content-types/[api-name]/lifecycles.js"

const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;

module.exports = {
  beforeCreate(event) {
    let okay = false;

    // Throwing an error will prevent the entity from being created
    if (!okay) {
      throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
    }
  },
};

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./src/api/[api-name]/content-types/[api-name]/lifecycles.ts"

import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

export default {
  beforeCreate(event) {
    let okay = false;

    // Throwing an error will prevent the entity from being created
    if (!okay) {
      throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
    }
  },
};
```

</TabItem>

</Tabs>

### Policies

[Policies](/cms/backend-customization/policies) are a special type of middleware that are executed before a controller. They are used to check if the user is allowed to perform the action or not. If the user is not allowed to perform the action and a `return false` is used then a generic error will be thrown. As an alternative, you can throw a custom error message using a nested class extensions from the Strapi `ForbiddenError` class, `ApplicationError` class (see [Default error classes](#default-error-classes) for both classes), and finally the [Node `Error` class](https://nodejs.org/api/errors.html#errors_class_error).

The `PolicyError` class is available from `@strapi/utils` package and accepts 2 parameters:

- the first parameter of the function is the error `message`
- (optional) the second parameter is the object that will be set as `details` in the response received; a best practice is to set a `policy` key with the name of the policy that threw the error.

#### Example: Throwing a PolicyError in a custom policy

This example shows building a [custom policy](/cms/backend-customization/policies) that will throw a custom error message and stop the request.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./src/api/[api-name]/policies/my-policy.js"

const { errors } = require('@strapi/utils');
const { PolicyError } = errors;

module.exports = (policyContext, config, { strapi }) => {
  let isAllowed = false;

  if (isAllowed) {
    return true;
  } else {
    throw new errors.PolicyError('You are not allowed to perform this action', {
      policy: 'my-policy',
      myCustomKey: 'myCustomValue',
    });
  }
}

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./src/api/[api-name]/policies/my-policy.ts"

import { errors } from '@strapi/utils';
const { PolicyError } = errors;

export default (policyContext, config, { strapi }) => {
  let isAllowed = false;

  if (isAllowed) {
    return true;
  } else {
    throw new errors.PolicyError('You are not allowed to perform this action', {
      policy: 'my-policy',
      myCustomKey: 'myCustomValue',
    });
  }
};
```

</TabItem>

</Tabs>

### Default error classes

The default error classes are available from the `@strapi/utils` package and can be imported and used in your code. Any of the default error classes can be extended to create a custom error class. The custom error class can then be used in your code to throw errors.

<Tabs> 

<TabItem value="Application" label="Application">

The `ApplicationError` class is a generic error class for application errors and is generally recommended as the default error class. This class is specifically designed to throw proper error messages that the admin panel can read and show to the user. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `An application error occured` |
| `details` | `object` | Object to define additional details | `{}` |

```js
throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });
```

</TabItem>

<!-- Not sure if it's worth keeping this tab or not as it's very specific to Strapi internal use-cases -->
<!-- ::: tab Validation

The `ValidationError` and `YupValidationError` classes are specific error classes designed to be used with the built in validations system and specifically format the errors coming from [Yup](https://www.npmjs.com/package/yup). The `ValidationError` does not accept any parameters but the `YupValidationError` accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | - |
| `details` | `object` | Object to define additional details | `{ yupErrors }` |

```js

```js
throw new PolicyError('Something went wrong', { policy: 'my-policy' });
```

::: -->

<TabItem value="Pagination" label="Pagination">

The `PaginationError` class is a specific error class that is typically used when parsing the pagination information from [REST](/cms/api/rest/sort-pagination#pagination), [GraphQL](/cms/api/graphql#pagination), or the [Document Service](/cms/api/document-service). It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Invalid pagination` |

```js
throw new errors.PaginationError('Exceeded maximum pageSize limit');
```

</TabItem>

<TabItem value="NotFound" label="NotFound">

The `NotFoundError` class is a generic error class for throwing `404` status code errors. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Entity not found` |

```js
throw new errors.NotFoundError('These are not the droids you are looking for');
```

</TabItem>

<TabItem value="Forbidden" label="Forbidden">

The `ForbiddenError` class is a specific error class used when a user either doesn't provide any or the correct authentication credentials. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Forbidden access` |

```js
throw new errors.ForbiddenError('Ah ah ah, you didn\'t say the magic word');
```

</TabItem>

<TabItem value="Unauthorized" label="Unauthorized">

The `UnauthorizedError` class is a specific error class used when a user doesn't have the proper role or permissions to perform a specific action, but has properly authenticated. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Unauthorized` |

```js
throw new errors.UnauthorizedError('You shall not pass!');
```

</TabItem>

<TabItem value="NotImplemented" label="NotImplemented">

The `NotImplementedError` class is a specific error class used when the incoming request is attempting to use a feature that is not currently implemented or configured. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `This feature isn't implemented` |

```js
throw new errors.NotImplementedError('This isn\'t implemented', { feature: 'test', implemented: false });
```

</TabItem>

<TabItem value="PayloadTooLarge" label="PayloadTooLarge">

The `PayloadTooLargeError` class is a specific error class used when the incoming request body or attached files exceed the limits of the server. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Entity too large` |

```js
throw new errors.PayloadTooLargeError('Uh oh, the file too big!');
```

</TabItem>

<TabItem value="Policy" label="Policy">

The `PolicyError` class is a specific error designed to be used with [route policies](/cms/backend-customization/policies). The best practice recommendation is to ensure the name of the policy is passed in the `details` parameter. It accepts the following parameters:

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `message` | `string` | The error message | `Policy Failed` |
| `details` | `object` | Object to define additional details | `{}` |

```js
throw new errors.PolicyError('Something went wrong', { policy: 'my-policy' });
```

</TabItem>

</Tabs>
