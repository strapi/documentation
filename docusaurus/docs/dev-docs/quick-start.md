---
sidebar_label: 'Quick Start Guide'
displayed_sidebar: devDocsSidebar
sidebar_position: 2
title: Quick Start Guide - Strapi Developer Docs
description: Get ready to get Strapi, your favorite open-source headless cms up and running in less than 3 minutes.
# next: ./troubleshooting

---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'

# Quick Start Guide

Strapi offers a lot of flexibility. Whether you want to go fast and quickly see the final result, or would rather dive deeper into the product, we got you covered. For this tutorial, we'll go for the DIY approach and build a project and data structure from scratch.

:::prerequisites
<InstallPrerequisites components={props.components} />
:::

## 🚀 Part A: Create a new project with Strapi

### Step 1: Run the installation script

Run the following command in a terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn create strapi-app my-project --quickstart
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npx create-strapi-app@latest my-project --quickstart
```

</TabItem>

</Tabs>

:::info
The `quick start` installation sets up Strapi with a SQLite database. Other databases and installation options are available (see [CLI installation guide](/dev-docs/installation/cli)).
:::

### Step 2: Register the first administrator user

Once the installation is complete, your browser automatically opens a new tab.

By completing the form, you create your own account. Once done, you become the first administrator user of this Strapi application. Welcome aboard, commander!

You now have access to the [admin panel](http://localhost:1337/admin):

![Admin panel screenshot: dashboard](/img/assets/quick-start-guide/qsg-handson-part1-01-admin_panel.png)

:::callout 🥳 CONGRATULATIONS!
You have just created a new Strapi project! You can start playing with Strapi and discover the product by yourself using our [User Guide](/user-docs/intro), or proceed to part B below.
:::

## 🛠 Part B: Build your content

The installation script has just created an empty project. We will now guide you through creating a restaurants directory, inspired by our [FoodAdvisor](https://github.com/strapi/foodadvisor) example application.

In short, we will create a data structure for your content, then add some entries and publish them, so that the API for your content can be consumed.

The admin panel of Strapi runs at [http://localhost:1337/admin](http://localhost:1337/admin). This is where you will spend most of your time creating and updating content.

:::tip TIP
If the server is not already running, in your terminal, `cd` into the `my-project` folder and run `npm run develop` (or `yarn develop`) to launch it.
:::

### Step 1: Create collection types with the Content-type Builder

The Content-type Builder plugin helps you create your data structure. When creating an empty project with Strapi, this is where to get the party started!

#### Create a "Restaurant" collection type

Your restaurants directory will eventually include many restaurants, so we need to create a "Restaurant" collection type. Then we can describe the fields to display when adding a new restaurant entry:

1. Click on the **Create your first Content type** button.<br />If it's not showing up, go to Plugins ![Content-type Builder icon](/img/assets/quick-start-guide/icons/content_types_builder.svg) [Content-type Builder](http://localhost:1337/admin/plugins/content-type-builder) in the main navigation.
2. Click on **Create new collection type**.
3. Type `Restaurant` for the _Display name_, and click **Continue**.  
4. Click the Text field.
5. Type `Name` in the _Name_ field.
6. Switch to the _Advanced Settings_ tab, and check the **Required field** and the **Unique field** settings.
7. Click on **Add another field**.
8. Choose the Rich text field.
9. Type `Description` under the _Name_ field, then click **Finish**.
10. Finally, click **Save** and wait for Strapi to restart.

![GIF: Create Restaurant collection type in Content-type Builder](/img/assets/quick-start-guide/qsg-handson-restaurant_2.gif)

Once Strapi has restarted, "Restaurant" is listed under ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) _Content Manager > Collection types_ in the navigation. Wow, you have just created your very first content-type! It was so cool — let's create another one right now, just for pleasure.

#### Create a "Category" collection type

It would help getting a bit more organized if our restaurants directory had some categories. Let's create a "Category" collection type:

1. Go to Plugins ![Content-type Builder icon](/img/assets/quick-start-guide/icons/content_types_builder.svg) [Content-type Builder](http://localhost:1337/admin/plugins/content-type-builder) in the main navigation.
2. Click on **Create new collection type**.
3. Type `Category` for the _Display name_, and click **Continue**.
4. Click the Text field.
5. Type `Name` in the _Name_ field.
6. Switch to the _Advanced Settings_ tab, and check the **Required field** and the **Unique field** settings.
7. Click on **Add another field**.
8. Choose the Relation field.
9. In the center, select the icon that represents "many-to-many" ![icon many-to-many](/img/assets/quick-start-guide/icon_manytomany.png). The text should read `Categories has and belongs to many Restaurants`.

![Admin Panel screenshot: relations](/img/assets/quick-start-guide/qsg-handson-part2-02-collection_ct.png)

11. Finally, click **Finish**, then the **Save** button, and wait for Strapi to restart.

### Step 2: Use the collection types to create new entries

Now that we have created a basic data structure with 2 collection types, "Restaurant" and "Category", let's use them to actually add content by creating new entries.

#### Create an entry for the "Restaurant" collection type

1. Go to ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) [Content Manager > Collection types - Restaurant](http://localhost:1337/admin/content-manager/collectionType/api::restaurant.restaurant) in the navigation.
2. Click on **Create new entry**.
3. Type the name of your favorite local restaurant in the _Name_ field. Let's say it's `Biscotte Restaurant`.
4. In the _Description_ field, write a few words about it. If you're lacking some inspiration, you can use `Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.`
5. Click **Save**.

![Screenshot: Biscotte Restaurant in Content Manager](/img/assets/quick-start-guide/qsg-handson-part2-03-restaurant.png)

The restaurant is now listed in the [Collection types - Restaurant](http://localhost:1337/admin/content-manager/collectionType/api::restaurant.restaurant) view.

#### Add Categories

Let's go to ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) [Content Manager > Collection types - Category](http://localhost:1337/admin/content-manager/collectionType/api::category.category) and create 2 categories:

1. Click on **Create new entry**.
2. Type `French Food` in the _Name_ field.
3. Click **Save**.
4. Go back to _Collection types - Category_, then click again on **Create new entry**.  
5. Type `Brunch` in the _Name_ field, then click **Save**.

![GIF: Add Categories](/img/assets/quick-start-guide/qsg-handson-categories.gif)

The "French Food" and "Brunch" categories are now listed in the [Collection types - Category](http://localhost:1337/admin/content-manager/collectionType/api::category.category) view.

#### Add a Category to a Restaurant

Go to ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) [Content Manager > Collection types - Restaurant](http://localhost:1337/admin/content-manager/collectionType/api::restaurant.restaurant) in the navigation, and click on "Biscotte Restaurant".

In the **Categories** drop-down list, select "Brunch". Click **Save**.

### Step 3: Set Roles & Permissions

We have just added a restaurant and 2 categories. We now have enough content to consume (pun intended). But first, we need to make sure that the content is publicly accessible through the API:

1. Click on _General ![Settings icon](/img/assets/quick-start-guide/icons/settings.svg) Settings_ at the bottom of the main navigation.
2. Under _Users & Permissions Plugin_, choose [Roles](http://localhost:1337/admin/settings/users-permissions/roles).
3. Click the **Public** role.
4. Scroll down under _Permissions_.
5. In the _Permissions_ tab, find _Restaurant_ and click on it.
6. Click the checkboxes next to **find** and **findOne**.
7. Repeat with _Category_: click the checkboxes next to **find** and **findOne**.
8. Finally, click **Save**.

![Screenshot: Public Role in Users & Permissions plugin](/img/assets/quick-start-guide/qsg-handson-part2-04-roles.png)

### Step 4: Publish the content

By default, any content you create is saved as a draft. Let's publish our categories and restaurant.

First, navigate to ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) [Content Manager > Collection types - Category](http://localhost:1337/admin/content-manager/collectionType/api::category.category). From there:

1. Click the "Brunch" entry.
2. On the next screen, click **Publish**.
3. In the _Confirmation_ window, click **Yes, publish**.  

Then, go back to the Categories list and repeat for the "French Food" category.

Finally, to publish your favorite restaurant, go to ![Content Manager icon](/img/assets/quick-start-guide/icons/content.svg) [Content Manager > Collection types - Restaurant](http://localhost:1337/admin/content-manager/collectionType/api::restaurant.restaurant), click the restaurant entry, and **Publish** it.

![GIF: Publish content](/img/assets/quick-start-guide/qsg-handson-publish.gif)

### Step 5: Use the API

OK dear gourmet, we have just finished creating our content and making it accessible through the API. You can give yourself a pat on the back — but you have yet to see the final result of your hard work.

There you are: the list of restaurants is accessible at [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

Try it now! The result should be similar to the example response below 👇.

<details>
<summary>Click me to view an example of API response</summary>

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Biscotte Restaurant",
        "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "createdAt": "2021-11-18T13:34:53.885Z",
        "updatedAt": "2021-11-18T13:59:05.035Z",
        "publishedAt": "2021-11-18T13:59:05.033Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

</details>

:::callout 🥳 CONGRATULATIONS!  
Now your content is created, published, and you have permissions to request it through the API.
Keep on creating amazing content!
:::

## ⏩ What to do next?

Now that you know the basics of creating and publishing content with Strapi, we encourage you to explore and dig deeper into some Strapi features:

<!-- TODO: uncomment this one when API token page is ready -->
<!-- - 👉 [create an API token](/user-docs/settings/managing-global-settings#managing-api-tokens) to restrict access to your API, -->
- 👉 learn how to use Strapi's [REST](/dev-docs/api/rest) API to query the content,
- 👉 deploy your project on [Strapi Cloud](/cloud/intro),
- 👉 and [customize your Strapi back end](/dev-docs/backend-customization) and [admin panel](/dev-docs/admin-panel-customization).
