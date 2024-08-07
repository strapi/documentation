---
title: Policies
description: Strapi policies are functions that execute specific logic on each request before it reaches the controller. Policies can be customized according to your needs.
displayed_sidebar: devDocsSidebar
tags:
- backend customization
- backend server
- controllers
- global policies
- plugin policies
- middlewares
- policies
- REST API 
- routes
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Policies

<NotV5 />

Policies are functions that execute specific logic on each request before it reaches the [controller](/dev-docs/backend-customization/controllers). They are mostly used for securing business logic.

Each [route](/dev-docs/backend-customization/routes) of a Strapi project can be associated to an array of policies. For example, a policy named `is-admin` could check that the request is sent by an admin user, and restrict access to critical routes.

Policies can be global or scoped. [Global policies](#global-policies) can be associated to any route in the project. Scoped policies only apply to a specific [API](#api-policies) or [plugin](#plugin-policies).

<figure style={{width: '100%', margin: '0'}}>
  <img src="/img/assets/backend-customization/diagram-routes.png" alt="Simplified Strapi backend diagram with routes and policies highlighted" />
  <em><figcaption style={{fontSize: '12px'}}>The diagram represents a simplified version of how a request travels through the Strapi back end, with policies and routes highlighted. The backend customization introduction page includes a complete, <a href="/dev-docs/backend-customization#interactive-diagram">interactive diagram</a>.</figcaption></em>
</figure>

## Implementation

A new policy can be implemented:

- with the [interactive CLI command `strapi generate`](/dev-docs/cli#strapi-generate) 
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/dev-docs/project-structure)):
  - `./src/policies/` for global policies
  - `./src/api/[api-name]/policies/` for API policies
  - `./src/plugins/[plugin-name]/policies/` for plugin policies

<br/>

Global policy implementation example:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/policies/is-authenticated.js"

module.exports = (policyContext, config, { strapi }) => {
  if (policyContext.state.user) { // if a session is open
    // go to next policy or reach the controller's action
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/policies/is-authenticated.ts"

export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user) { // if a session is open
    // go to next policy or reach the controller's action
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</TabItem>
</Tabs>

`policyContext` is a wrapper around the [controller](/dev-docs/backend-customization/controllers) context. It adds some logic that can be useful to implement a policy for both REST and GraphQL.

<br/>

Policies can be configured using a `config` object:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title=".src/api/[api-name]/policies/my-policy.js"

module.exports = (policyContext, config, { strapi }) => {
    if (policyContext.state.user.role.code === config.role) { // if user's role is the same as the one described in configuration
      return true;
    }

    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/api/[api-name]/policies/my-policy.ts"

export default (policyContext, config, { strapi }) => {
    if (policyContext.state.user.role.code === config.role) { // if user's role is the same as the one described in configuration
      return true;
    }

    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
  };
```

</TabItem>
</Tabs>

## Usage

To apply policies to a route, add them to its configuration object (see [routes documentation](/dev-docs/backend-customization/routes#policies)).

Policies are called different ways depending on their scope:

- use `global::policy-name` for [global policies](#global-policies)
- use `api::api-name.policy-name` for [API policies](#api-policies)
- use `plugin::plugin-name.policy-name` for [plugin policies](#plugin-policies)

:::tip
To list all the available policies, run `yarn strapi policies:list`.
:::

### Global policies

Global policies can be associated to any route in a project.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/custom-restaurant.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/api/restaurant/routes/custom-restaurant.ts"

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

</TabItem>
</Tabs>

### Plugin policies

[Plugins](/dev-docs/plugins) can add and expose policies to an application. For example, the [Users & Permissions plugin](/user-docs/users-roles-permissions) comes with policies to ensure that the user is authenticated or has the rights to perform an action:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/routes/custom-restaurant.js"

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
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    }
  ]
}
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/api/restaurant/routes/custom-restaurant.ts"

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
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    }
  ]
}
```

</TabItem>
</Tabs>

### API policies

API policies are associated to the routes defined in the API where they have been declared.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/restaurant/policies/is-admin.js."

module.exports = async (policyContext, config, { strapi }) => {
  if (policyContext.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return true;
  }

  return false;
};
```

```js title="./src/api/restaurant/routes/custom-restaurant.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/api/restaurant/policies/is-admin.ts"

export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user.role.name === 'Administrator') {
    // Go to next policy or will reach the controller's action.
    return true;
  }

  return false;
};

```

```ts title="./src/api/restaurant/routes/custom-restaurant.ts"

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

</TabItem>
</Tabs>

To use a policy in another API, reference it with the following syntax: `api::[apiName].[policyName]`:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/category/routes/custom-category.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./src/api/category/routes/custom-category.ts"

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

</TabItem>
</Tabs>
