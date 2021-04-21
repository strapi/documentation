---
title: Is Owner - Strapi Developer Documentation
description: Learn in this guide how to restrict content editing to content authors only.
---

# Create is owner policy

This guide will explain how to restrict content editing to content authors only.

## Introduction

It is often required that the author of an entry is the only user allowed to edit or delete the entry.

This is a feature that is requested a lot and in this guide we will show how to implement it.

## Example

For this example, we will need an Article Content Type.

Add a `text` field and a `relation` field for this Content Type.

The `relation` field is a **many-to-one** relation with User.<br>
One User can have many Articles and one Article can have only one User.<br>
Name the field `author` for the Article Content Type and `articles` on the User side.

Now we are ready to start customization.

## Apply the author by default

When we are creating a new Article via `POST /articles` we will need to set the authenticated user as the author of the article.

To do so we will customize the `create` controller function of the Article API.

**Concepts we will use:**
Here is the code of [core controllers](/developer-docs/latest/development/backend-customization.md#core-controllers).
We will also use this [documentation](/developer-docs/latest/development/plugins/users-permissions.md#user-object-in-strapi-context) to access the current authenticated user information.

**Path —** `./api/article/controllers/Article.js`

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.article.create(data, { files });
    } else {
      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.article.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.article });
  },
};
```

Now, when an article is created, the authenticated user is automatically set as author of the article.

## Limit the update

Now we will restrict the update of articles only for the author.

We will use the same concepts as previously.

**Path —** `./api/article/controllers/Article.js`

```js
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.article.create(data, { files });
    } else {
      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.article.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.article });
  },

  /**
   * Update a record.
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [article] = await strapi.services.article.find({
      id: ctx.params.id,
      'author.id': ctx.state.user.id,
    });

    if (!article) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.article.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.article.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.article });
  },
};
```

And tada!

::: tip
For the delete action, it will be the exact same check as the update action.
:::
