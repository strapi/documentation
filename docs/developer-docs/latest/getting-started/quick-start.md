---
title: Quick Start Guide - Strapi Developer Documentation
description: Get ready to get Strapi, your favorite open-source headless cms up and running in less than 3 minutes.
---

# Quick Start Guide

Get ready to get Strapi up and running in **less than 3 minutes** 🚀.

<div class="video-container">
  <iframe width="853" height="480" src="https://www.youtube.com/embed/zd0_S_FPzKg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

_For a step-by-step guide, please take a look at the following steps. This quickstart is really close to the [FoodAdvisor](https://github.com/strapi/foodadvisor) application._

(Before continuing, please make sure [Node.js and npm are properly installed](/developer-docs/latest/setup-deployment-guides/installation/cli.md#step-1-make-sure-requirements-are-met) on your machine. You can [install the Yarn v1.2.0+ package here](https://yarnpkg.com/en/).)

::: warning
In the 3.1.5 the **Roles & Permissions** section has been migrated into the **Settings** section.
:::

## 1. Install Strapi and Create a new project

:::: tabs

::: tab yarn

```bash
yarn create strapi-app my-project --quickstart
```

:::

::: tab npx

```bash
npx create-strapi-app my-project --quickstart
```

:::

::::

## 2. Create an Administrator user

Navigate to [**http://localhost:1337/admin**](http://localhost:1337/admin).

Complete the form to create the first **Administrator** user.

## 3. Create a Restaurant Content Type

Navigate to [**PLUGINS** - **Content Type Builder**](http://localhost:1337/admin/plugins/content-type-builder), in the left-hand menu.

- Click the **"+ Create new collection type"** link
- Type `restaurant`, and click `Continue`
- Click the **Text** field
- Type `name` in the **Name** field
- Click over to the **ADVANCED SETTINGS** tab, and check the `Required field` and the `Unique field`
- Click the **"+ Add another Field"** button
- Click the **Rich Text** field
- Type `description` under the **BASE SETTINGS** tab, in the **Name** field
- Click `Finish`
- Click the **Save** button and wait for Strapi to restart

## 4. Create a Category Content type

Navigate back to [**PLUGINS** - **Content Type Builder**](http://localhost:1337/admin/plugins/content-type-builder), in the left-hand menu.

- Click the **"+ Create new collection type"** link
- Type `category`, and click `Continue`
- Click the **Text** field
- Type `name` under the **BASE SETTINGS** tab, in the **Name** field
- Click over to the **ADVANCED SETTINGS** tab, and check the `Required field` and the `Unique field`
- Click the **"+ Add another field"** button
- Click the **Relation** field
- On the right side, click the **Category** dropdown and select, `Restaurant`
- In the center, select the icon that represents `many-to-many`. The text should read, `Categories has and belongs to many Restaurants`
- Click `Finish`
- Click the **Save** button and wait for Strapi to restart

## 5. Add content to "Restaurant" Content Type

Navigate to [**COLLECTION TYPES** - **Restaurants**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant), in the left-hand menu.

- Click on **+ Add New Restaurants** button. Type `Biscotte Restaurant` in the **Name** field. Type `Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.` into the **Description** field.
- Click **Save**.

If you navigate back [**COLLECTION TYPES** - **Restaurants**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant), you will see your restaurant listed in the entries.

## 6. Add categories to the "Category" Content Type

Navigate to [**COLLECTION TYPES** - **Categories**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category).

- Click on **+ Add New Categories** button. Type `French Food` in the **Name** field. Select `Biscotte Restaurant`, on the right in the **Restaurant (0)** dropdown.
- Click **Save**.

Navigate back to [**COLLECTION TYPES** - **Categories**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category). You will see the **French Food** category listed in the entries.

- Click on **+ Add New Categories** button. Type `Brunch` in the **Category** field. **DO NOT ADD** `Biscotte Restaurant` to the `Restaurants` dropdown on the right.
- Click **Save**.

You will see the **Brunch** category listed in the entries.

Navigate back to [**COLLECTION TYPES** - **Restaurants**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant).

- Click on `Biscotte Restaurant`.
- On the right, under **Categories(1)**, `select` the `Add an item...`, and add **Brunch** as a category for this restaurant, and click the **Save** button.

You have now seen **two different ways** to use the **relation** field type to add and connect relations between Content Types.

## 7. Set Roles and Permissions

Navigate to [**GENERAL** > **Settings** > **USERS & PERMISSIONS PLUGIN** > **Roles**](http://localhost:1337/admin/settings/users-permissions/roles).

- Click the **Public** Role.
- Scroll down under **Permissions**, open the **Application** tab and find **Restaurant**. Click the checkbox next to **find** and **findone**.
- Repeat and find **Category**. Click the checkbox next to **find** and **findone**.
- Click **Save**.

## 8. Publish the content

By default, any content you create is saved as a draft. To publish your content:

Navigate back to [**COLLECTION TYPES** - **Categories**](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category)

- Click the **Draft** button on the **Brunch** category.
- Click **Publish** button.
- In the **Please confirm** dialog, click **Yes, publish** button.
- Repeat for the **French food** category and **Biscotte Restaurant**.

## 9. Consume the Content Type's API

Here we are! The list of **restaurants** is accessible at [`http://localhost:1337/restaurants`](http://localhost:1337/restaurants).

::: tip CONGRATULATIONS
👏 Congratulations, you have now completed the **Strapi Quick Start**. Where to go next?

- Consume your API with your favorite frameworks, frontend or backend programming languages just below.
- Learn how to use Strapi with React ([Gatsby](https://strapi.io/blog/build-a-static-blog-with-gatsby-and-strapi) or [Next.js](https://strapi.io/blog/nextjs-react-hooks-strapi-food-app-1)) or Vue.js ([Nuxt.js](https://strapi.io/blog/cooking-a-deliveroo-clone-with-nuxt-vue-js-graphql-strapi-and-stripe-setup-part-1-7/)).
- Have a look at the [Tutorials](https://strapi.io/tutorials) to deep dive into Strapi.
- Get help on [our community forum](https://forum.strapi.io).
- Read the [source code](https://github.com/strapi/strapi), [contribute](https://github.com/strapi/strapi/blob/master/CONTRIBUTING.md) or [give a star](https://github.com/strapi/strapi) on GitHub.
- Follow us on [Twitter](https://twitter.com/strapijs) to get the latest news.
- [Join the vibrant and active Strapi community](https://slack.strapi.io) on Slack.
  :::

### Consume your API using one of these technologies:

  <IntegrationLinks>
  </IntegrationLinks>
