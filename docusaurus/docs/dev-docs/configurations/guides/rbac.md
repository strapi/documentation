---
title: Create new Role-Based Access Control (RBAC) conditions
sidebar_label: Configure RBAC conditions
displayed_sidebar: cmsSidebar
description: In Strapi, RBAC is an approach to restricting access to some features of the admin panel to some users. The Community Edition of Strapi offers 3 default roles.
tags:
- administrator
- admin panel
- configuration
- configuration guide
- guides
- RBAC (Role-Based Access Control)
- Users, Roles & Permissions
---

# How to create custom conditions for Role-Based Access Control (RBAC)

Role-Based Access Control (RBAC) is an approach to restricting access to some users. In a Strapi application, users of the admin panel are administrators. Their roles and permissions are [configured in the admin panel](/user-docs/features/rbac).

## Declaring new conditions

Declare a single condition as an object, and multiple conditions as an array of objects. Each condition object can have 5 possible properties:

- `displayName` (string): the condition name as shown in the admin panel,
- `name` (string): the condition name, kebab-cased,
- `category` (string, _optional_): conditions can be grouped into categories available [in the admin panel](/user-docs/features/rbac#setting-custom-conditions-for-permissions); if undefined, the condition will appear under the "Default" category,
- `plugin` (string, _optional_): if the condition is created by a plugin, should be the plugin's name, kebab-cased (e.g `content-manager`),
- `handler`: a function used to verify the condition (see [using the condition handler](#using-the-condition-handler))

Declare and register conditions in the global [`bootstrap` function](/dev-docs/configurations/functions#bootstrap) found in `/src/index.js` (see [Registering conditions](#registering-conditions)).

:::note
The condition `name` property acts as a unique id within its namespace, that is either the plugin if the `plugin` property is defined, or the root namespace.
:::

## Using the condition handler

A condition can be applied to any permission, and the condition `handler` is used to verify the condition. The `handler` is a function returning a query object or a boolean value.

Query objects are useful to verify conditions on the entities you read, create, update, delete or publish. They use the [sift.js](https://github.com/crcn/sift.js) library, but only with the following supported operators:

- `$or`
- `$and`
- `$eq`
- `$eqi`
- `$ne`
- `$in`
- `$nin`
- `$lt`
- `$lte`
- `$gt`
- `$gte`
- `$exists`
- `$elemMatch`

The condition `handler` can be a synchronous or asynchronous function that:

- receives the authenticated user making the request,
- and returns `true`, `false`, or a query object.

Returning `true` or `false` is useful to verify an external condition or a condition on the authenticated user.
For instance, a condition that allows access to a page in the admin panel only if server time is 5pm could use this handler:

```js
handler: () => new Date().getHours() === 17;
```

The `handler` function receives the authenticated user, so it can verify conditions on the user:

```js
const condition = {
  displayName: 'Email address from strapi.io',
  name: 'email-strapi-dot-io',
  async handler(user) {
    return user.email.includes('@strapi.io');
  },
};
```

For more granular control, the `handler` function can also return a query object:

```js
const condition = {
  displayName: 'price greater than 50',
  name: 'price-gt-50',
  async handler(user) {
    return { price: { $gt: 50 } };
  },
};
```

## Registering conditions

To be available in the admin panel, conditions should be declared and registered in the global [`bootstrap` function](/dev-docs/configurations/functions#bootstrap) found in `/src/index`. Register a single condition with the `conditionProvider.register()` method:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/src/index.js"

module.exports = async () => {
  await strapi.admin.services.permission.conditionProvider.register({
    displayName: 'Billing amount under 10K',
    name: 'billing-amount-under-10k',
    plugin: 'admin',
    handler: { amount: { $lt: 10000 } },
  });
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/src/index.ts"

export default async () => {
  await strapi.admin.services.permission.conditionProvider.register({
    displayName: 'Billing amount under 10K',
    name: 'billing-amount-under-10k',
    plugin: 'admin',
    handler: { amount: { $lt: 10000 } },
  });
};
```

</TabItem>

</Tabs>

To register multiple conditions, defined as an array of [condition objects](#declaring-new-conditions), use `conditionProvider.registerMany()`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/src/index.js"

const conditions = [
  {
    displayName: "Entity has same name as user",
    name: "same-name-as-user",
    plugin: "name of a plugin if created in a plugin",
    handler: (user) => {
      return { name: user.name };
    },
  },
  {
    displayName: "Email address from strapi.io",
    name: "email-strapi-dot-io",
    async handler(user) {
      return user.email.includes('@strapi.io');
    },
  }
];

module.exports = {
  async bootstrap(/*{ strapi }*/) {
  // do your boostrap

    await strapi.admin.services.permission.conditionProvider.registerMany(conditions);
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/src/index.ts"

const conditions = [
  {
    displayName: "Entity has same name as user",
    name: "same-name-as-user",
    plugin: "name of a plugin if created in a plugin"
    handler: (user) => {
      return { name: user.name };
    },
  },
  {
    displayName: "Email address from strapi.io",
    name: "email-strapi-dot-io",
    async handler(user) {
      return user.email.includes('@strapi.io');
    },
  }
];

export default async () => {
  // do your boostrap

  await strapi.admin.services.permission.conditionProvider.registerMany(conditions);
};
```

</TabItem>

</Tabs>
