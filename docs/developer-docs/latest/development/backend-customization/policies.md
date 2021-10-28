---
title: Policies - Backend customization - Strapi Developer Documentation
description: …
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Policies

Policies are functions that execute specific logic on each request before it reaches the [controller](/developer-docs/latest/development/backend-customization/controllers.md). They are mostly used for securing business logic. Just like [all the other parts of the Strapi backend](/developer-docs/latest/development/backend-customization.md), policies can be customized.
<!-- TODO: remove this comment — the link above will work only when merged with PR #446 -->

Each [route](/developer-docs/latest/development/backend-customization/routes.md) of a Strapi project can be associated to an array of policies. For example, a policy named `is-admin` could check that the request is sent by an admin user, and uses it for critical routes.
<!-- TODO: remove this comment — the link above will work only when merged with PR #450 -->

Policies can be global or scoped. [Global policies](#global-policies) can be associated to any route in the project. Scoped policies only apply to a specific [API](#api-policies) or [plugin](#plugin-policies).

## Implementation

A new policy can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) 
<!-- TODO: update CLI documentation with the new interactive `strapi generate` -->
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):
  - `./src/policies/` for global policies
  - `./src/api/[api-name]/policies/` for API policies
  - `./src/plugins/[plugin-name]/policies/` for plugin policies

**Example**: Global policy

```js
// path: ./src/policies/is-authenticated.js

module.exports = (policyContext, { strapi }) => {
  if (ctx.state.user) { // if a session is open
    // go to next policy or reach the controller's action
    return await next();
  }

  ctx.unauthorized(`You're not logged in!`); // returns a 401 error

  return true; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

`policyContext` is a wrapper arround the [controller](/developer-docs/latest/development/backend-customization/controllers.md) context. It adds some logic that can be useful to implement a policy for both REST and GraphQL.

## Usage

To apply policies to a route, add them to its configuration object (see [routes documentation](/developer-docs/latest/development/backend-customization/routes#policies.md)).
<!-- TODO: remove this comment — the link above will work only when merged with PR #450 -->

Policies are called different ways depending on their scope:

- use `global::policy-name` for [global policies](#global-policies)
- use `api::api-name.policy-name` for [API policies](#API-policies)
- use `plugin::plugin-name.policy-name` for [plugin policies](#plugin-policies)

::: tip
To list all the available policies, run `yarn strapi policies:list`.
<!-- TODO: add this to CLI reference -->
:::

Policies are executed before the controller's action. To execute a logic `after`, use the `next` context:

```js
// path: ./src/policies/custom404.js

module.exports = async (ctx, next) => {
  // Indicate to the server to go to
  // the next policy or to the controller's action.
  await next();

  // The code below will be executed after the controller's action.
  if (ctx.status === 404) {
    ctx.body = 'We cannot find the resource.';
  }
};
```

### Global policies

Global policies can be associated to any route in a project.

```js
// path: ./src/api/restaurant/routes/router.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/restaurants',
      handler: 'Restaurant.find',
      config: {
        /**
          Before executing the find action in the Restaurant.js controller,
          we call the global 'is-authenticated' policy,
          found at ./src/policies/is-authenticated.js.
         */
        policies: ['global::is-authenticated']
      }
    }
  ]
}
```

### Plugin policies

[Plugins](/developer-docs/latest/plugins/plugins-intro.md) can add and expose policies to an application. For example, the [Users & Permissions plugin](/user-docs/latest/plugins/strapi-plugins.html#users-permissions-plugin) comes with policies to ensure that the user is authenticated or has the rights to perform an action:

```js
// path: ./src/api/restaurant/routes/router.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/restaurants',
      handler: 'Restaurant.find',
      config: {
        /**
          The `isAuthenticated` policy prodived with the `users-permissions` plugin 
          is executed before the `find` action in the `Restaurant.js` controller.
        */
        policies: ['plugins::users-permissions.isAuthenticated']
      }
    }
  ]
}
```

### API policies

API policies are associated to the routes defined in the API where they have been declared.

```js

// path: ./src/api/restaurant/policies/is-admin.js.

module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return await next();
  }

  ctx.unauthorized(`You're not allowed to perform this action!`);

  return true;
};


// path: ./src/api/restaurant/routes/router.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/restaurants',
      handler: 'Restaurant.find',
      config: {
        /**
          The `is-admin` policy found at `./src/api/restaurant/policies/is-admin.js`
          is executed before the `find` action in the `Restaurant.js` controller.
         */
        policies: ['is-admin']
      }
    }
  ]
}

```

To use a policy in another API, reference it with the following syntax: `api::[apiName].[policyName]`:

```js
// path: ./src/api/category/routes/router.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'Category.find',
      config: {
        /**
          The `is-admin` policy found at `./src/api/restaurant/policies/is-admin.js`
          is executed before the `find` action in the `Restaurant.js` controller.
        */
        policies: ['api::restaurant.is-admin']
      }
    }
  ]
}
```
