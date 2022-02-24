---
title: v4 code migration - Policies - Strapi Developer Docs
description: Migrate policies from Strapi v3.6.x to Strapi v4.0.x with step-by-step instructions
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.html
---

# v4 code migration: Updating policies

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison

In both Strapi v3 and v4, policies handle authorization. Policies can be global or scoped (i.e. applied to a specific API or plugin) and can be applied to REST controllers actions or to GraphQL resolvers.

In Strapi v3, policies are Koa middlewares accepting or rejecting requests based on the REST context. As middlewares, v3 policies always receive a Koa context, either coming from the REST request or built from the GraphQL resolver arguments.

In Strapi v4, [policies](/developer-docs/latest/development/backend-customization/policies.md#policies) are functions that should return `true` or `undefined` for the request to be accepted. v4 policies receive a custom context based on where the policy has been called from (e.g. a REST controller’s action or a GraphQL resolver).
:::

To migrate a policy to Strapi v4:

1. Move the policy file in the appropriate folder, depending on the policy scope:
  
    | Policy scope      | Folder                                                                                                                                                                                                           |
    | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Global            | `./src/policies`                                                                                                                                                                                                 |
    | A specific API    | `./src/api/<api-name>/policies`                                                                                                                                                                                  |
    | A specific plugin | `./src/plugins/<plugin-name>/policies`<br/><br/>(see [plugin policies migration](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.md#moving-policies) documentation) |

2. (_optional_) Update the policy code. Strapi v4 policies are functions returning `true` or `undefined` to authorize the request.

Migrating a policy code depends on the code itself and this migration guide can't cover every existing use case. The following examples cover some common use cases of v4 policies working with both REST and GraphQL APIs or specifically with one of these APIs. These examples can be used for global, API-related, or plugin-related policies.

::: details Example: Authorize only logged in users (REST and GraphQL)

The following v3 policy authorizes only logged in users:
  
  ```jsx
  module.exports = async (ctx, next) => {
    if (ctx.state.user) {
      // Go to next policy or will reach the controller's action.
      return await next();
    }
   
    ctx.unauthorized(`You're not logged in!`);
  };
  ```
  
To update this policy to v4, replace it with the following code:
  
  ```jsx
  module.exports = (context, config, { strapi }) => {
    if (context.state.user) { // if a session is open
      // go to next policy or reach the controller's action
      return true;
    }
  
    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
  };
  ```

The v4 policy uses the `context.state` variable, accessible to both REST and GraphQL.

:::

::: details Example: Authorize only requests with an id filter (REST and GraphQL)

The following v4 policy only authorizes requests if an `id` filter is provided. The policy uses the `context.is()` method to check if the policy is being tested for a Koa controller or a GraphQL resolver:

```jsx
// path: ./src/policies or ./src/api/api-name/policies/  depending on where you want to apply the policy

module.exports = (context, config, { strapi }) => {
  // handle Koa
  if (context.is('koa')) {
    return context.request.query.id !== undefined;
  }

  // handle GraphQL
  else if (context.is('graphql')) {
    return context.args.id !== undefined;
  }

  // handle other cases
  return false;
};
```

:::

::: details Example: Authorize only GET requests (REST only)

The following policy code can be used to authorize only GET requests:

```jsx
module.exports = (context, config, { strapi }) => {
  // Here we're accessing the request.method property present in the Koa context 
  return context.request.method === 'GET';
};
```

:::

::: details Example: Authorize field resolvers only for a specific entity (GraphQL)

The following policy code can be used to authorize field resolvers only targetting a specific entity:

```jsx
module.exports = (context, config, { strapi }) => {
  return typeof context.parent === 'object' && context.parent.id === 5;
};
```

:::

::: note NOTES
In Strapi v4, depending on whether the policy is applied to REST or GraphQL, the function has access to different contexts:

- Both REST and GraphQL contexts have access to the `is(type: string): boolean`, `type: string`, and `state: object` attributes.
- The GraphQL context has access to `parent`, `args`, `context`, `info` & `http` (which contains the Koa context) (see [GraphQL customization](http://localhost:8080/developer-docs/latest/plugins/graphql.html#custom-configuration-for-resolvers) documentation).
- With REST requests, the controller context is merged with the policy context.
:::

::: strapi Next steps
[Migrating the back end code](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [routes](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.md), [route middlewares](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.md), [controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md) and [services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md).
:::
