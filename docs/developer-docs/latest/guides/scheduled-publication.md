---
title: Scheduled Publication - Strapi Developer Documentation
description: Learn in this guide how to create an article schedule system.
---

# Scheduled publication

This guide will explain how to create an article schedule system.

## Introduction

What we want here is to be able to set a publication date for an article, and at this date, switch the `draft` state to `published`.

## Example

For this example, we will have to add a `publish_at` attribute to the **Article** Content Type.

- Click on the Content Type Builder link in the left menu
- Select the **Article** Content Type
- Add another field
  - `date` attribute named `publish_at` with `datetime` type

And add some data with different dates and state to be able to see the publication happen.
Make sure to create some entries with a draft state and a `publish_at` that is before the current date.

The goal will be to check every minute if there are draft articles that have a `publish_at` lower that the current date.

## Create a CRON task

To execute a function every minutes, we will use a CRON task.

Here is the [full documentation](/developer-docs/latest/setup-deployment-guides/configurations.md#cron-tasks) of this feature. If your CRON task requires to run based on a specific timezone then do look into the full documentation.

**Path —** `./config/functions/cron.js`

```js
module.exports = {
  '*/1 * * * *': () => {
    console.log('1 minute later');
  },
};
```

Make sure the enabled cron config is set to true in `./config/server.js` file.

::: tip
Please note that Strapi's built in CRON feature will not work if you plan to use `pm2` or node based clustering. You will need to execute these CRON tasks outside of Strapi.
:::

## Business logic

Now we can start writing the publishing logic. The code that will fetch all `draft` **Articles** with a `publish_at` that is before the current date.

Then we will update the `published_at` of all these articles.

**Path —** `./config/functions/cron.js`

```js
module.exports = {
  '*/1 * * * *': async () => {
    // fetch articles to publish
    const draftArticleToPublish = await strapi.api.article.services.article.find({
      _publicationState: 'preview', // preview returns both draft and published entries
      published_at_null: true,      // so we add another condition here to filter entries that have not been published
      publish_at_lt: new Date(),
    });

    // update published_at of articles
    draftArticleToPublish.forEach(async article => {
      await strapi.api.article.services.article.update(
        { id: article.id },
        { published_at: new Date() }
      );
    });
  },
};
```

And tada!
