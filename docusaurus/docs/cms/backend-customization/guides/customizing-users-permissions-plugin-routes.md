---
title: Customizing Users & Permissions plugin routes
description: Extend or override routes, controllers, and policies for the Users & Permissions plugin to add custom access control logic.
displayed_sidebar: cmsSidebar
tags:
  - users & permissions
  - routes
  - policies
  - controllers
  - backend customization
  - guides
---

# Customizing Users & Permissions plugin routes

<Tldr>
The Users & Permissions feature exposes `/users` and `/auth` routes that can be extended or overridden using the plugin extension system. This guide shows how to add custom policies, override controllers, and add new routes to the User collection.
</Tldr>

The [Users & Permissions feature](/cms/features/users-permissions) ships with built-in routes for authentication (`/auth`) and user management (`/users`). Because these routes belong to a plugin rather than a user-created content-type, they cannot be customized with `createCoreRouter`. Instead, extend them through the [plugin extension system](/cms/plugins-development/plugins-extension) using a `strapi-server` file in the `/src/extensions/users-permissions/` folder.

:::prerequisites
- A Strapi 5 project.
- Familiarity with [routes](/cms/backend-customization/routes) and [policies](/cms/backend-customization/policies).
:::

## How it works {#how-routes-work}

### Route structure

<!-- source: packages/plugins/users-permissions/server/routes/content-api/index.js -->
<!-- source: packages/core/utils/src/content-api-router.ts#L3-L33 -->

Unlike content-types you create (e.g., `api::restaurant.restaurant`), the Users & Permissions plugin registers its routes inside the `plugin.routes['content-api'].routes` array. This array contains all `/users`, `/auth`, `/roles`, and `/permissions` route definitions.

Each route is an object with the following shape:

<!-- source: packages/plugins/users-permissions/server/routes/content-api/user.js#L24-L43 -->
```js
{
  method: 'GET',          // HTTP method
  path: '/users',         // URL path (relative to /api)
  handler: 'user.find',   // controller.action
  config: {
    prefix: '',           // path prefix (empty means /api)
  },
}
```

Route configurations can also include optional `policies` and `middlewares` arrays (see [Add a custom policy](#add-custom-policy)).

### The `strapi-server` extension file {#extend-routes}

<!-- source: packages/core/core/src/loaders/plugins/index.ts#L34-L61 -->

All customizations to the Users & Permissions plugin go in a single file:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  // Your customizations here

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  // Your customizations here

  return plugin;
};
```

</TabItem>

</Tabs>

The function receives the full plugin object and must return the plugin. You can modify `plugin.routes`, `plugin.controllers`, `plugin.policies`, and `plugin.services` before returning.

### Available actions {#available-actions}

<!-- source: packages/plugins/users-permissions/server/controllers/user.js#L37-L219 -->
<!-- source: packages/plugins/users-permissions/server/routes/content-api/user.js -->
The `user` controller is a plain object. It exposes the following actions:

| Action | Method | Path | Description |
| ------ | ------ | ---- | ----------- |
| `user.count` | `GET` | `/users/count` | Count users |
| `user.find` | `GET` | `/users` | Find all users |
| `user.me` | `GET` | `/users/me` | Get authenticated user |
| `user.findOne` | `GET` | `/users/:id` | Find one user |
| `user.create` | `POST` | `/users` | Create a user |
| `user.update` | `PUT` | `/users/:id` | Update a user |
| `user.destroy` | `DELETE` | `/users/:id` | Delete a user |

<!-- source: packages/plugins/users-permissions/server/controllers/auth.js#L40-L690 -->
<!-- source: packages/plugins/users-permissions/server/routes/content-api/auth.js -->
The `auth` controller is a factory function `({ strapi }) => ({...})`. It exposes the following actions:

| Action | Method | Path | Rate limited |
| ------ | ------ | ---- | ------------ |
| `auth.callback` | `POST` | `/auth/local` | Yes |
| `auth.callback` | `GET` | `/auth/:provider/callback` | No |
| `auth.register` | `POST` | `/auth/local/register` | Yes |
| `auth.connect` | `GET` | `/connect/(.*)` | Yes |
| `auth.forgotPassword` | `POST` | `/auth/forgot-password` | Yes |
| `auth.resetPassword` | `POST` | `/auth/reset-password` | Yes |
| `auth.changePassword` | `POST` | `/auth/change-password` | Yes |
| `auth.emailConfirmation` | `GET` | `/auth/email-confirmation` | No |
| `auth.sendEmailConfirmation` | `POST` | `/auth/send-email-confirmation` | No |
| `auth.refresh` | `POST` | `/auth/refresh` | No |
| `auth.logout` | `POST` | `/auth/logout` | No |

:::note
Because the two controllers have different types (plain object vs. factory function), they require different override patterns. See [Override a `user` controller action](#override-controller) and [Override an `auth` controller action](#override-auth-route) for the correct approach for each.
:::

## Customize routes {#customize-routes}

### Add a custom policy {#add-custom-policy}

A common requirement is restricting who can update or delete user accounts: for example, ensuring users can only update their own profile.

#### 1. Create the policy file

<!-- source: packages/core/utils/src/policy.ts#L29-L39 -->
<!-- source: packages/core/core/src/services/server/policy.ts#L9-L14 -->

Create a global policy that checks whether the authenticated user matches the target user. The policy function receives the Koa context (with access to `state.user` and `params`), an optional configuration object, and `{ strapi }`:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/policies/is-own-user.js"
"use strict";

module.exports = (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;

  if (!currentUser) {
    return false;
  }

  const targetUserId = Number(policyContext.params.id);

  if (currentUser.id !== targetUserId) {
    return false;
  }

  return true;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/policies/is-own-user.ts"
export default (policyContext, config, { strapi }) => {
  const currentUser = policyContext.state.user;

  if (!currentUser) {
    return false;
  }

  const targetUserId = Number(policyContext.params.id);

  if (currentUser.id !== targetUserId) {
    return false;
  }

  return true;
};
```

</TabItem>

</Tabs>

:::tip
The `is-own-user` policy above applies specifically to Users & Permissions plugin routes. For a similar pattern on standard content-types (restricting access to the entry author), see the [is-owner middleware example](/cms/backend-customization/middlewares#restricting-content-access-with-an-is-owner-policy) and the [is-owner-review policy example](/cms/backend-customization/examples/policies#creating-a-custom-policy).
:::

#### 2. Attach the policy to the user routes

<!-- source: packages/core/core/src/loaders/policies.ts#L28 -->

In the plugin extension file, find the `update` and `delete` routes and add the policy:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  // Find the routes that need the policy
  const routes = plugin.routes['content-api'].routes;

  // Add the 'is-own-user' policy to the update route
  const updateRoute = routes.find(
    (route) => route.handler === 'user.update'
  );

  if (updateRoute) {
    updateRoute.config = updateRoute.config || {};
    updateRoute.config.policies = updateRoute.config.policies || [];
    updateRoute.config.policies.push('global::is-own-user');
  }

  // Add the same policy to the delete route
  const deleteRoute = routes.find(
    (route) => route.handler === 'user.destroy'
  );

  if (deleteRoute) {
    deleteRoute.config = deleteRoute.config || {};
    deleteRoute.config.policies = deleteRoute.config.policies || [];
    deleteRoute.config.policies.push('global::is-own-user');
  }

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  // Find the routes that need the policy
  const routes = plugin.routes['content-api'].routes;

  // Add the 'is-own-user' policy to the update route
  const updateRoute = routes.find(
    (route) => route.handler === 'user.update'
  );

  if (updateRoute) {
    updateRoute.config = updateRoute.config || {};
    updateRoute.config.policies = updateRoute.config.policies || [];
    updateRoute.config.policies.push('global::is-own-user');
  }

  // Add the same policy to the delete route
  const deleteRoute = routes.find(
    (route) => route.handler === 'user.destroy'
  );

  if (deleteRoute) {
    deleteRoute.config = deleteRoute.config || {};
    deleteRoute.config.policies = deleteRoute.config.policies || [];
    deleteRoute.config.policies.push('global::is-own-user');
  }

  return plugin;
};
```

</TabItem>

</Tabs>

With this configuration, `PUT /api/users/:id` and `DELETE /api/users/:id` return a `403 Forbidden` error if the authenticated user does not match the `:id` in the URL.

:::tip
For a more informative error message, throw a `PolicyError` instead of returning `false`:

```js
const { errors } = require('@strapi/utils');
const { PolicyError } = errors;

// Inside the policy:
throw new PolicyError('You can only modify your own account');
```

See the [policies documentation](/cms/backend-customization/policies) for more details.
:::

### Add a new route {#add-new-route}

You can add custom routes to the Users & Permissions plugin. For example, to add an endpoint that deactivates a user account:

<!-- source: packages/plugins/users-permissions/server/services/user.js#L74-L80 -->

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  // Add a new controller action
  plugin.controllers.user.deactivate = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(id, { blocked: true });

    ctx.body = { message: `User ${user.username} has been deactivated` };
  };

  // Register the route
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/users/:id/deactivate',
    handler: 'user.deactivate',
    config: {
      prefix: '',
      policies: ['global::is-own-user'],
    },
  });

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  // Add a new controller action
  plugin.controllers.user.deactivate = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(id, { blocked: true });

    ctx.body = { message: `User ${user.username} has been deactivated` };
  };

  // Register the route
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/users/:id/deactivate',
    handler: 'user.deactivate',
    config: {
      prefix: '',
      policies: ['global::is-own-user'],
    },
  });

  return plugin;
};
```

</TabItem>

</Tabs>

After restarting Strapi, `POST /api/users/:id/deactivate` becomes available. Grant the corresponding permission in the admin panel under <Icon name="gear-six" /> *Users & Permissions plugin > Roles* for the roles that should access this endpoint.

### Remove a route {#remove-route}

You can disable a route by filtering it out of the routes array. For example, to disable the user count endpoint:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  plugin.routes['content-api'].routes = plugin.routes['content-api'].routes.filter(
    (route) => route.handler !== 'user.count'
  );

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  plugin.routes['content-api'].routes = plugin.routes['content-api'].routes.filter(
    (route) => route.handler !== 'user.count'
  );

  return plugin;
};
```

</TabItem>

</Tabs>

## Override controllers {#override-controllers}

### Override a `user` controller action {#override-controller}

<!-- source: packages/plugins/users-permissions/server/controllers/user.js#L37 -->

The `user` controller is a plain object, so you can directly read and replace its methods in the extension file. For instance, to add custom logic to the `me` endpoint:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    // Call the original controller
    await originalMe(ctx);

    // Add extra data to the response
    if (ctx.body) {
      ctx.body.timestamp = new Date().toISOString();
    }
  };

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    // Call the original controller
    await originalMe(ctx);

    // Add extra data to the response
    if (ctx.body) {
      ctx.body.timestamp = new Date().toISOString();
    }
  };

  return plugin;
};
```

</TabItem>

</Tabs>

:::caution
When wrapping a controller, always call the original function first to preserve the default behavior. Skipping the original function means you take over the full request handling, including sanitization and error handling.
:::

### Override an `auth` controller action {#override-auth-route}

<!-- source: packages/plugins/users-permissions/server/controllers/auth.js#L40 -->
<!-- source: packages/core/core/src/registries/controllers.ts#L34-L35 -->

The `auth` controller uses a factory pattern: it exports a function `({ strapi }) => ({...})` instead of a plain object. When your extension code runs, Strapi has not yet resolved this factory. As a result, `plugin.controllers.auth` is a function, not an object with methods.

To override an auth action, wrap the factory itself:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  const originalAuthFactory = plugin.controllers.auth;

  plugin.controllers.auth = ({ strapi }) => {
    // Resolve the original factory to get the controller methods
    const originalAuth = originalAuthFactory({ strapi });

    // Override the register method
    const originalRegister = originalAuth.register;

    originalAuth.register = async (ctx) => {
      // Call the original register logic
      await originalRegister(ctx);

      // Custom post-registration logic
      if (ctx.body && ctx.body.user) {
        strapi.log.info(`New user registered: ${ctx.body.user.email}`);
      }
    };

    return originalAuth;
  };

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  const originalAuthFactory = plugin.controllers.auth;

  plugin.controllers.auth = ({ strapi }) => {
    // Resolve the original factory to get the controller methods
    const originalAuth = originalAuthFactory({ strapi });

    // Override the register method
    const originalRegister = originalAuth.register;

    originalAuth.register = async (ctx) => {
      // Call the original register logic
      await originalRegister(ctx);

      // Custom post-registration logic
      if (ctx.body && ctx.body.user) {
        strapi.log.info(`New user registered: ${ctx.body.user.email}`);
      }
    };

    return originalAuth;
  };

  return plugin;
};
```

</TabItem>

</Tabs>

:::caution
Do not access `plugin.controllers.auth.register` directly. Because `auth` is a factory function at extension time, its methods are not accessible until Strapi calls the factory. Always wrap the factory as shown above.
:::

## Full example {#combine-customizations}

The following example combines several customizations in a single file: it adds a policy to `update` and `delete`, wraps the `me` controller, and adds a new route:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/extensions/users-permissions/strapi-server.js"
module.exports = (plugin) => {
  const routes = plugin.routes['content-api'].routes;

  // 1. Add 'is-own-user' policy to update and delete
  for (const route of routes) {
    if (route.handler === 'user.update' || route.handler === 'user.destroy') {
      route.config = route.config || {};
      route.config.policies = route.config.policies || [];
      route.config.policies.push('global::is-own-user');
    }
  }

  // 2. Wrap the 'me' controller to include the user's role
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.state.user && ctx.body) {
      const user = await strapi
        .plugin('users-permissions')
        .service('user')
        .fetch(ctx.state.user.id, { populate: ['role'] });

      ctx.body.role = user.role;
    }
  };

  // 3. Add a custom route
  plugin.controllers.user.profile = async (ctx) => {
    const user = await strapi
      .plugin('users-permissions')
      .service('user')
      .fetch(ctx.state.user.id, { populate: ['role'] });

    ctx.body = {
      username: user.username,
      email: user.email,
      role: user.role?.name,
      createdAt: user.createdAt,
    };
  };

  routes.push({
    method: 'GET',
    path: '/users/profile',
    handler: 'user.profile',
    config: { prefix: '' },
  });

  return plugin;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/extensions/users-permissions/strapi-server.ts"
export default (plugin) => {
  const routes = plugin.routes['content-api'].routes;

  // 1. Add 'is-own-user' policy to update and delete
  for (const route of routes) {
    if (route.handler === 'user.update' || route.handler === 'user.destroy') {
      route.config = route.config || {};
      route.config.policies = route.config.policies || [];
      route.config.policies.push('global::is-own-user');
    }
  }

  // 2. Wrap the 'me' controller to include the user's role
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.state.user && ctx.body) {
      const user = await strapi
        .plugin('users-permissions')
        .service('user')
        .fetch(ctx.state.user.id, { populate: ['role'] });

      ctx.body.role = user.role;
    }
  };

  // 3. Add a custom route
  plugin.controllers.user.profile = async (ctx) => {
    const user = await strapi
      .plugin('users-permissions')
      .service('user')
      .fetch(ctx.state.user.id, { populate: ['role'] });

    ctx.body = {
      username: user.username,
      email: user.email,
      role: user.role?.name,
      createdAt: user.createdAt,
    };
  };

  routes.push({
    method: 'GET',
    path: '/users/profile',
    handler: 'user.profile',
    config: { prefix: '' },
  });

  return plugin;
};
```

</TabItem>

</Tabs>

## Validation

After making changes, restart Strapi and verify your customizations:

1. Run `yarn strapi routes:list` to confirm your new or modified routes appear.
2. Test protected routes without authentication to verify policies return `403 Forbidden`.
3. Test with an authenticated user to confirm the expected behavior.
4. Check the Strapi server logs for errors during startup.

## Troubleshooting

| Symptom | Possible cause |
| ------- | -------------- |
| Route not found (404) | The new route was not pushed to `plugin.routes['content-api'].routes`, or its `prefix` property is missing. |
| Policy not applied | The policy name is incorrect. Global policies require the `global::` prefix (e.g., `global::is-own-user`). |
| Controller returns 500 | The controller action name does not match the `handler` value in the route definition. |
| Changes not reflected | Strapi was not restarted after modifying the extension file. Extensions are loaded at startup. |
| Permission denied (403) | The new action is not enabled for the role. Enable it in <Icon name="gear-six" /> *Users & Permissions plugin > Roles*. |
| Cannot read property of `auth` controller | The `auth` controller is a factory function, not a plain object. Wrap the factory instead of accessing methods directly (see [Override an `auth` controller action](#override-auth-route)). |
