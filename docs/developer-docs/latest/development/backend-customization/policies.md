---
title: Policies - Backend customization - Strapi Developer Docs
description: Strapi policies are functions that execute specific logic on each request before it reaches the controller. Policies can be customized according to your needs.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/policies.html
---

# Policies

Policies are functions that execute specific logic on each request before it reaches the [controller](/developer-docs/latest/development/backend-customization/controllers.md). They are mostly used for securing business logic.

Each [route](/developer-docs/latest/development/backend-customization/routes.md) of a Strapi project can be associated to an array of policies. For example, a policy named `is-admin` could check that the request is sent by an admin user, and restrict access to critical routes.

Policies can be global or scoped. [Global policies](#global-policies) can be associated to any route in the project. Scoped policies only apply to a specific [API](#api-policies) or [plugin](#plugin-policies).

## Implementation

A new policy can be implemented:

- with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) 
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)):
  - `./src/policies/` for global policies
  - `./src/api/[api-name]/policies/` for API policies
  - `./src/plugins/[plugin-name]/policies/` for plugin policies

<br/>

Global policy implementation example:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/policies/is-authenticated.js

module.exports = (policyContext, config, { strapi }) => {
  if (policyContext.state.user) { // if a session is open
    // go to next policy or reach the controller's action
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</code-block>

<code-block title="TYPESCRIPT">

```ts
// path: ./src/policies/is-authenticated.ts

export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user) { // if a session is open
    // go to next policy or reach the controller's action
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</code-block>
</code-group>

`policyContext` is a wrapper around the [controller](/developer-docs/latest/development/backend-customization/controllers.md) context. It adds some logic that can be useful to implement a policy for both REST and GraphQL.

<br/>

Policies can be configured using a `config` object:

<code-group>
<code-block title="JAVASCRIPT">


```js
// path: .src/api/[api-name]/policies/my-policy.js

module.exports = (policyContext, config, { strapi }) => {
    if (policyContext.state.user.role.code === config.role) { // if user's role is the same as the one described in configuration
      return true;
    }

    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</code-block>

<code-block title="TYPESCRIPT">


```ts
// path: .src/api/[api-name]/policies/my-policy.ts

export default (policyContext, config, { strapi }) => {
    if (policyContext.state.user.role.code === config.role) { // if user's role is the same as the one described in configuration
      return true;
    }

    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
  };
```

</code-block>
</code-group>

## Usage

To apply policies to a route, add them to its configuration object (see [routes documentation](/developer-docs/latest/development/backend-customization/routes.md#policies)).

Policies are called different ways depending on their scope:

- use `global::policy-name` for [global policies](#global-policies)
- use `api::api-name.policy-name` for [API policies](#api-policies)
- use `plugin::plugin-name.policy-name` for [plugin policies](#plugin-policies)

::: tip
To list all the available policies, run `yarn strapi policies:list`.
:::

### Global policies

Global policies can be associated to any route in a project.

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/restaurant/routes/custom-restaurant.js

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

</code-block>

<code-block title="TYPESCRIPT">

```ts
// path: ./src/api/restaurant/routes/custom-restaurant.ts

export default {
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

</code-block>
</code-group>

### Plugin policies

[Plugins](/developer-docs/latest/plugins/plugins-intro.md) can add and expose policies to an application. For example, the [Users & Permissions plugin](/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions.md) comes with policies to ensure that the user is authenticated or has the rights to perform an action:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/restaurant/routes/custom-restaurant.js

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

</code-block>

<code-block title="TYPESCRIPT">

```ts
// path: ./src/api/restaurant/routes/custom-restaurant.ts

export default {
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

</code-block>
</code-group>

### API policies

API policies are associated to the routes defined in the API where they have been declared.

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/restaurant/policies/is-admin.js.

module.exports = async (policyContext, config, { strapi }) => {
  if (policyContext.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return true;
  }

  return false;
};


// path: ./src/api/restaurant/routes/custom-restaurant.js

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

</code-block>

<code-block title="TYPESCRIPT">

```ts

// path: ./src/api/restaurant/policies/is-admin.ts.

export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return true;
  }

  return false;
};


// path: ./src/api/restaurant/routes/custom-restaurant.ts

export default {
  routes: [
    {
      method: 'GET',
      path: '/restaurants',
      handler: 'Restaurant.find',
      config: {
        /**
          The `is-admin` policy found at `./src/api/restaurant/policies/is-admin.js`
          is executed before the `find` action in the `Restaurant.ts` controller.
         */
        policies: ['is-admin']
      }
    }
  ]
}

```

</code-block>
</code-group>

To use a policy in another API, reference it with the following syntax: `api::[apiName].[policyName]`:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./src/api/category/routes/custom-category.js

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

</code-block>

<code-block title="TYPESCRIPT">

```ts
// path: ./src/api/category/routes/custom-category.ts

export default {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'Category.find',
      config: {
        /**
          The `is-admin` policy found at `./src/api/restaurant/policies/is-admin.ts`
          is executed before the `find` action in the `Restaurant.js` controller.
        */
        policies: ['api::restaurant.is-admin']
      }
    }
  ]
}
```

</code-block>
</code-group>
