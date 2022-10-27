---
title: Scheduled Publication - Strapi Developer Docs
description: Learn in this guide how to create an article schedule system.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/scheduled-publication.html
---

# Scheduled publication

!!!include(developer-docs/latest/guides/snippets/guide-not-updated.md)!!!

This guide will help you set a publication date for an article, and at this date, switch the `draft` state to `published`.

## Example

For this example, we will have to add a `publish_at` attribute to the **Article** Content Type.

- Click on the Content-type Builder link in the left menu
- Select the **Article** Content Type
- Add another field
  - `date` attribute named `publish_at` with `datetime` type

And add some data with different dates and state to be able to see the publication happen.
Make sure to create some entries with a draft state and a `publish_at` that is before the current date.

The goal will be to check every minute if there are draft articles that have a `publish_at` lower that the current date.

## Create a CRON task

To execute a function every minutes, we will use a CRON task.

Here is the [full documentation](/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.md) of this feature. If your CRON task requires to run based on a specific timezone then do look into the full documentation.

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
// path: ./config/cron-tasks.js

module.exports = {
  /**
   * Scheduled publication workflow.
   * Checks every minute if there are draft articles to publish.
   */

  '*/1 * * * *': async () => {
    console.log('1 minute later');
    // fetch articles to publish;
    const draftArticleToPublish = await strapi.entityService.findMany('api::article.article', {
      publicationState: 'preview', // preview returns both draft and published entries
      filters: {
        publishedAt: {
          $null: true, // so we add another condition here to filter entries that have not been published
        },
        publish_at: {
          $lt: new Date() // and we keep only articles with a 'publish_at' datetime value that is lower than the current datetime
        }
      }
    });
    // update the publish_at of articles previously fetched
    await Promise.all(draftArticleToPublish.map(article => {
      return strapi.entityService.update('api::article.article', article.id, {
        data: {
          publishedAt: new Date(),
        }
      });
    }))
  },
};
```

And tada!
