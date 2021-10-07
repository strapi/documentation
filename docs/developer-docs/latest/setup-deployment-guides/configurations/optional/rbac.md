---
title: Role-Based Access Control (RBAC) - Strapi Developer Documentation
description: 
---

<!-- TODO: update SEO -->

# Role-Based Access Control <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted" withLinkIcon/>

:::caution 🚧 This API is considered unstable for now.
<br>
:::

Role-Based Access Control (RBAC) is an approach to restricting access to some users. In a Strapi application, users of the admin panel are administrators. Their roles and permissions are [configured in the admin panel](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md). The Community Edition of Strapi offers 3 default roles (Author, Editor, and Super Admin). To go further, creating custom conditions for any type of permission is also possible. This requires an Enterprise Edition with at minimum a Bronze licence plan.

## Declaring new conditions

Declare a single condition as an object, and multiple conditions as an array of objects. Each condition object can have 5 possible properties:

- `displayName` (string): the condition name as shown in the admin panel,
- `name` (string): the condition name, kebab-cased,
- `category` (string, _optional_): conditions can be grouped into categories available [in the admin panel](/user-docs/latest/users-roles-permissions/configuring-administrator-roles.md#setting-custom-conditions-for-permissions); if undefined, the condition will appear under the "Default" category,
- `plugin` (string, _optional_): if the condition is created by a plugin, should be the plugin's name, kebab-cased (e.g `content-manager`),
- `handler`: a function used to verify the condition (see [using the condition handler](#using-the-condition-handler))

Declare and register conditions in your [`./config/functions/bootstrap.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md#bootstrap) file (see [Registering conditions](#registering-conditions)).

:::note
The condition `name` property acts as a [unique id](https://github.com/strapi/strapi/blob/master/packages/strapi-admin/services/permission/condition-provider.js#L22) within its namespace, that is either the plugin if the `plugin` property is defined, or the root namespace.
:::

## Using the condition handler

A condition can be applied to any permission, and the condition `handler` is used to verify the condition. The `handler` is a function returning a query object or a boolean value.

Query objects are useful to verify conditions on the entities you read, create, update, delete or publish. They use the [sift.js](https://github.com/crcn/sift.js) library, but only with the following supported operators:

- `$or`
- `$and`
- `$eq`
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

To be available in the admin panel, conditions should be declared and registered in the [`./config/functions/bootstrap.js`](/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md#bootstrap) file. Register a single condition with the `conditionProvider.register()` method:

```js
module.exports = async () => {
  await strapi.admin.services.permission.conditionProvider.register({
    displayName: 'Billing amount under 10K',
    name: 'billing-amount-under-10k',
    plugin: 'admin',
    handler: { amount: { $lt: 10000 } },
  });
};
```

To register multiple conditions, defined as an array of [condition objects](#declaring-new-conditions), use `conditionProvider.registerMany()`:

```js
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

module.exports = async () => {
  // do your boostrap

  await strapi.admin.services.permission.conditionProvider.registerMany(conditions);
};
```
