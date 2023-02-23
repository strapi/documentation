---
title: Policies
displayed_sidebar: devDocsSidebar
description: Migrate policies from Strapi v3.6.x to Strapi v4.0.x with step-by-step instructions

---

# v4 code migration: Updating policies

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x


:::strapi v3/v4 comparison

In both Strapi v3 and v4, policies handle authorization. Policies can be stored globally or scoped (i.e. with a specific API or plugin) and can be applied to REST controller's actions or to GraphQL resolvers.

In Strapi v3, policies are Koa middlewares accepting or rejecting requests based on the REST context. As middlewares, v3 policies always receive a Koa context, either coming from the REST request or built from the GraphQL resolver arguments.

In Strapi v4, [policies](/dev-docs/backend-customization/policies#policies) are functions that should return `true` or `undefined` for the request to be accepted. v4 policies receive a custom context, that cannot be modified, based on where the policy has been called from (e.g. a REST controller’s action or a GraphQL resolver).

Strapi v3 policies acting as route middlewares should be converted to proper [v4 route middlewares](/dev-docs/migration/v3-to-v4/code/route-middlewares).
:::

To migrate a policy to Strapi v4:

1. Move the policy file in the appropriate folder, depending on the policy scope:
  
    | Policy scope      | Folder                                                                                                                                                                                                           |
    | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Global            | `./src/policies`                                                                                                                                                                                                 |
    | A specific API    | `./src/api/<api-name>/policies`                                                                                                                                                                                  |
    | A specific plugin | `./src/plugins/<plugin-name>/policies`<br/><br/>(see [plugin policies migration](/dev-docs/migration/v3-to-v4/plugin/update-folder-structure#moving-policies) documentation) |

2. (_optional_) Update the policy code. Strapi v4 policies are functions returning `true` or `undefined` to authorize the request.

Migrating a policy code depends on the code itself and this migration guide can't cover every existing use case. The following examples cover some common use cases of v4 policies working with both REST and GraphQL APIs or specifically with one of these APIs. These examples can be used for global, API-related, or plugin-related policies.

<details>
<summary> Example: Authorize only logged in users (REST and GraphQL)</summary>

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
  module.exports = (policyContext, config, { strapi }) => {
    if (policyContext.state.user) { // if a session is open
      // go to next policy or reach the controller's action
      return true;
    }
  
    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
  };
  ```

The v4 policy uses the `policyContext.state` variable, accessible to both REST and GraphQL.

</details>

<details>
<summary> Example: Shared policy with alternate logic for REST and GraphQL</summary>

The following v4 policy checks if the current request is coming from REST or GraphQL via the `policyContext.type` and allows running alternative validation rules for each.

```jsx title="path: ./src/policies or ./src/api/api-name/policies/  depending on where you want to apply the policy"

module.exports = (policyContext, config, { strapi }) => {
  // handle Koa
  if (policyContext.type === 'koa') {
    // Do REST validation
    return true
  }

  // handle GraphQL
  else if (policyContext.type === 'graphql') {
    // Do GraphQL validation
    return true
  }

  // handle other cases
  return false;
};
```

</details>

<details>
<summary> Example: Authorize only for a specific entity (REST)</summary>

The following policy code can be used to authorize only targeting a specific entity:

```jsx
module.exports = (policyContext, config, { strapi }) => {
  return policyContext.params.id === 5;
};
```

</details>

<details>
<summary> Example: Authorize field resolvers only for a specific entity (GraphQL)</summary>

The following policy code can be used to authorize field resolvers only targeting a specific entity:

```jsx
module.exports = (policyContext, config, { strapi }) => {
  return typeof policyContext.parent === 'object' && policyContext.parent.id === 5;
};
```

</details>

:::tip Customization tips
In Strapi v4, depending on whether the policy is applied to REST or GraphQL (use `policyContext.type` is either `koa` for REST or `graphql` ), the function has access to different contexts:

- Both REST and GraphQL contexts have access to the `is`, `type`, and `state`.
- The REST context have access to the destructed Koa context.
- The GraphQL context has access to `parent`, `args`, `context` (which is the GraphQL Context), `info` & `http` (which contains the Koa context) (see [GraphQL customization](/dev-docs/plugins/graphql#custom-configuration-for-resolvers) documentation).

You can use `policyContext.type`, which value is either `koa` for REST or `graphql` for the GraphQL plugin, to determine the type of context the policy uses.
:::
