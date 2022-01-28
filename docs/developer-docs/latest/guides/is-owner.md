---
title: Is Owner - Strapi Developer Docs
description: Learn in this guide how to restrict content editing to content authors only.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/is-owner.html
---

# Create is owner policy

This guide will explain how to restrict finding, updating and deleting entries to the user that created them.

Three of Strapi's [backend customization features](/developer-docs/latest/development/backend-customization) are used to add this functionality to your application:

- [Policies](/developer-docs/latest/development/backend-customization/middlewares.html) protect API routes and controllers from unauthorized users.
- [Middlewares](/developer-docs/latest/development/backend-customization/middlewares.html) ensure that users are programmatically set as owners of newly created entries.
- [Routes](/developer-docs/latest/development/backend-customization/routes.html) are configured to include custom policies and middlewares.

## Example

[Setup Strapi](/developer-docs/latest/setup-deployment-guides/installation/cli.html#preparing-the-installation) and create a [Content-type](/developer-docs/latest/development/backend-customization/models.html) named **Article**.

Add a **text** field named `title` and a **relation** field to this model.

The relation field is a **many-to-one** relation with User (from:users-permissions).<br>
A **User** can have many **Articles**, but an **Article** can only have one **User**.<br>
Name the field `author` for the Article Content-type and `articles` on the User side.

Now we are ready to create custom policies and middlewares and attach them to our API routes.

When creating a new Article via `POST /api/articles` we must set the authenticated User as the article's author.

| Method   | URL                 | Controller | Policy  | Middleware |
| -------- | ------------------- | ---------- | ------- | ---------- |
| `GET`    | `/api/articles`     | find       | IsOwner | -          |
| `GET`    | `/api/articles/:id` | findOne    | IsOwner | -          |
| `POST`   | `/api/articles`     | create     | -       | SetOwner   |
| `PUT`    | `/api/articles/:id` | update     | IsOwner | SetOwner   |
| `DELETE` | `/api/articles/:id` | delete     | IsOwner | -          |

</div>

:::: tabs card

::: tab SetOwner

[Create a global middleware](/developer-docs/latest/development/backend-customization/middlewares.html) using the CLI or by directly creating a javascript file in `./src/middlewares/`.

<code-group>

<code-block title="YARN">
```bash
yarn strapi generate middleware SetOwner new
```
</code-block>

<code-block title="NPM">
```BASH
npm run strapi generate middleware SetOwner new
```
</code-block>

</code-group>

This function sets the current authenticated user as the owner of the entry that is being created or updated.

`./src/middlewares/SetOwner.js`

```javascript
'use strict';
const { yup } = require('@strapi/utils');

const SetOwnerConfigSchema = yup.object({
  field: yup.string().required('SetOwner middleware needs a "field" key in the configurations.'),
  uid: yup.string().required('SetOwner middleware requires a "uid" key in the configurations.'),
});

/**
 * `SetOwner` middleware.
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await SetOwnerConfigSchema.validate(config);
      const { field, uid } = config;
      const { id: userId } = ctx.state.user; // ctx.state.user contains the current authenticated user
      ctx.request.body.data[field] = userId;
      await next();
      if (ctx.response.status == 200) {
        const { id } = ctx.response.body.data; // ctx.response.body.data containts the just created/updated entity
        await strapi.entityService.update(uid, id, { data: { [field]: userId } });
      }
    } catch (error) {
      await ctx.forbidden(error);
    }
  };
};
```

:::

::: tab IsOwner

[Create a global policy](/developer-docs/latest/development/backend-customization/policies.html) using the CLI or by directly creating a javascript file in `./src/policies/`.

<code-group>

<code-block title="YARN">
```bash
yarn strapi generate policy IsOwner new
```
</code-block>

<code-block title="NPM">
```BASH
npm run strapi generate policy IsOwner new
```
</code-block>

</code-group>

This function protects routes and data from unauthorized users before the request reaches the controller.

`./src/policies/IsOwner.js`

```javascript
'use strict';
const { yup } = require('@strapi/utils');

const IsOwnerConfigSchema = yup.object({
  field: yup.string().required('IsOwner policy requires a "field" key in the configurations.'),
  uid: yup.string().required('IsOwner policy requires a "uid" key in the configurations.'),
});

/**
 * `IsOwner` policy.
 */

module.exports = async (ctx, config, { strapi }) => {
  try {
    await IsOwnerConfigSchema.validate(config);
    const { field, uid } = config;
    const { id: userId } = ctx.state.user;
    const { id } = ctx.params;
    if (id) {
      const [entity] = await strapi.entityService.findMany(uid, {
        filters: { id, [field]: userId },
      });
      return entity ? true : false;
    } else {
      ctx.request.query.filters = { ...ctx.request.query.filters, [field]: userId };
      return true;
    }
  } catch (error) {
    return false;
  }
};
```

:::

::::

### Route Configuration

The new policy and middleware can be associated with different [content-types](/developer-docs/latest/development/backend-customization/models.html#content-types) by [configuring their core routers](/developer-docs/latest/development/backend-customization/routes.html#configuring-core-routers).

`./src/api/routes/article.js`

```javascript
'use strict';

/**
 * article router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
// Modify these to match your Content-type
const uid = 'api::article.article';
const field = 'author';
// Only modify these if the middleware or policy name is different
const SetOwner = {
  name: 'global::SetOwner',
  config: {
    field,
    uid,
  },
};
const IsOwner = {
  name: 'global::IsOwner',
  config: {
    field,
    uid,
  },
};
module.exports = createCoreRouter(uid, {
  config: {
    create: {
      middlewares: [SetOwner],
    },
    find: {
      policies: [IsOwner],
    },
    findOne: {
      policies: [IsOwner],
    },
    delete: {
      policies: [IsOwner],
    },
    update: {
      policies: [IsOwner],
      middlewares: [SetOwner],
    },
  },
});
```
