---
title: Advanced policies
displayed_sidebar: cmsSidebar
tags:
  - GraphQL API
  - policies
---

# Advanced policies for the GraphQL API

Requests sent to the [GraphQL API](/cms/api/graphql) pass through Strapi's [middlewares](/cms/backend-customization/middlewares.md) and [policies](/cms/backend-customization/policies.md) system. Policies can be attached to resolvers to implement complex authorization rules, as shown in the present short guide.

For additional information on GraphQL policies, please refer to the [GraphQL plugin configuration](/cms/plugins/graphql#extending-the-schema) documentation.

## Conditional visibility

To limit the number of returned entries for unauthenticated users you can write a policy that modifies resolver arguments:

```ts title="/src/policies/limit-public-results.ts"
export default async (policyContext, config, { strapi }) => {
  const { state, args } = policyContext;

  if (!state.user) {
    args.limit = 4; // only return 4 results for public
  }

  return true;
};
```

Register the policy in `/config/policies.ts` and apply it to a resolver:

```ts title="/config/policies.ts"
export default {
  'api::restaurant.restaurant': {
    find: [ 'global::limit-public-results' ],
  },
};
```

## Group membership

Policies can access `policyContext.state.user` to check group membership, as in the following example:

```ts title="/src/policies/is-group-member.ts"
export default async ({ state }, config, { strapi }) => {
  const userGroups = await strapi.query('plugin::users-permissions.group').findMany({
    where: { users: { id: state.user.id } },
  });
  return userGroups.some(g => g.name === config.group);
};
```

Use the policy with the following configuration:

```ts title="/config/policies.ts"
export default {
  'api::restaurant.restaurant': {
    find: [{ name: 'global::is-group-member', config: { group: 'editors' } }],
  },
};
```

With this setup the resolver only returns results if the authenticated user belongs to the `editors` group.
