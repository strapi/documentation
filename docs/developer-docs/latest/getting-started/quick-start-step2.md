---
title: Quick Start Guide - Step 2
description: Get ready to get Strapi, your favorite open-source headless cms up and running in less than 3 minutes.
sidebarDepth: 0
prev: ./quick-start-step1
next: ./quick-start-step3
---

# Quick Start Guide

<style lang="scss" scoped>
  h2 {
    padding-top: 2em;
  }
  h3, h4 {
    padding-top: 1.5em
  }
  h4 {
    font-size: 115%;
  }
  ul li, ol li {
    padding-bottom: .5em;
  }
  blockquote {
    border-left-color: #42b983;

    p {
      color: #888;
    }
  }
</style>

First, make sure you've completed [step 1](/developer-docs/latest/getting-started/quick-start-step1) to create a project with Strapi.

If you wanted quick results and have just created a Gatsby blog with our starter CLI, keep on with the **Starters** path to get to know how to edit content for your blog ✍️.

If you felt more adventurous and have just created a blank app, go for the **Hands-on** path and we will guide you through creating a restaurants directory, based on our [FoodAdvisor](https://github.com/strapi/foodadvisor) example app ‍🥘.


::::: tabs type:card
<!-- we need 5 colons or it will conflict with the tip markup -->

:::: tab Starters

<!-- We use the vuepress-plugin-tabs plugin but customize tabs to look more like buttons -->
<style lang="scss">
  .el-tabs__header {
    padding-top: 2em;
  }

  .el-tabs--card > .el-tabs__header,
  .el-tabs--card > .el-tabs__header .el-tabs__nav {
    border: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    border-radius: 8px;
    border: solid 1px rgba(129,107,250,.2);
    font-size: 100%;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
    border-left: solid 1px rgba(129,107,250,.2);
    margin-right: 8px;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    background-color: rgba(129,107,250,0.9);
    color: white !important;
    font-weight: bold;
    border-color: rgb(129,107,250);
  }

</style>

## 🎨 Step 2: Play with your content

Strapi [starters](https://strapi.io/starters) build a full stack app and a data structure for you, so you can start playing with your content faster. You already have the admin panel for your blog running at [http://localhost:1337/admin](http://localhost:1337/admin). Now what?

:::tip TIP
If the server is not already running, in your terminal, `cd` into the `my-project` folder and run `yarn develop` (or `npm run develop`) to launch it.
:::

<!-- other considered emojis for this section: 🎠 🎡 🧸  -->

### 1. Add yourself as a writer

You have several ideas for great articles in mind. But first, the world needs to know who you are!

Navigate to [_COLLECTION TYPES > Writers_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::writer.writer?page=1&pageSize=10&_sort=name:ASC) in the left-hand menu, and click the **+ Add New Writers** button.

![Screenshot: Create a new writer in Admin Panel](../assets/quick-start-guide/qsg-starters-step2-01-writer.png)

First, add your **Name** and **Email** in the corresponding fields. 

Then, drag and drop your favorite selfie in the **Picture** field. Click **Upload 1 asset to the library** then **Finish** (saying 'Cheese!' during the process is optional 😄).

Finally, click **Save**.

> 🥳  _Voilà_! You have just added yourself as a writer.

### 2. Write & publish your first article

Now it's time to write!  Navigate to [_COLLECTION TYPES > Articles_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::article.article?page=1&pageSize=10&_sort=title:ASC) in the left-hand menu, and click the **+ Add New Articles** button.

![Screenshot: Create a new article in Admin Panel](../assets/quick-start-guide/qsg-starters-step2-02-write_article.png)

Type `Hello World!` in the **Title** field, then `My very first article with Strapi` in the **Description** field, and write a few lines in the **Content** field. If you're lacking some inspiration, just type `This is my first blog article with Strapi and using it feels like a breeze!`.

Once done, in the right sidebar, choose your name in the **Author** dropdown.  You have just signed your first article with Strapi. Take a few seconds to contemplate this historic moment! While in the right sidebar, 
you might also want to choose a **Category** for your post (or add your own) from the list.

Scroll down, pick a date in the **PublishedAt** field, then add a picture in the **Image** field, either by drag & drop, or by selecting a file from the Strapi assets library or from your computer.

By default, your new article would be saved as a draft. But let's not be too shy, and publish it right away: from the **Status** dropdown, choose **published**.

Finally, click on **Save** at the top of the window.

> 🥳  You have just created and published your very first article with Strapi.

### 3. Update the Homepage

It's time to make this blog a bit more yours. Navigate to [_SINGLE TYPES > Homepage_](http://localhost:1337/admin/plugins/content-manager/singleType/application::homepage.homepage) in the left-hand menu.

Hover the picture in the **ShareImage field** and click the **Edit** icon <Fa-PencilAlt />. Click on **Replace Media** and upload an image from your computer. This image will represent your blog when sharing an article on social medias. Click **Finish** twice.

Now, update the **Title** to `My Wonderful Strapi Blog` in the **Hero** field group, then click **Save**.

Gatsby is a static-site generator. It means that you need to restart the server for changes to appear on the frontend. In your terminal, press `Ctrl-C` to kill the servers. Then restart them by typing `yarn develop` (or `npm run develop`) and press `Enter`.

After a few moments, you should see your blog with its updated title running at [http://localhost:8000](http://localhost:8000). The `Hello World!` article you have just created is also visible at the bottom of the page 👀


![Screenshot: Updated Gatsby blog frontend](../assets/quick-start-guide/qsg-starters-step2-04-updated_fe.png)


:::tip CONGRATULATIONS! 🥳
Now that you know how to use Strapi to create and update your blog, you can keep on creating amazing content. Proceed to [step 3](/developer-docs/latest/getting-started/quick-start-step3.md) when you're ready to show it to the world!
:::


::::

:::: tab Hands-on

## 🛠  Step 2: Build your content

The admin panel of Strapi runs at [http://localhost:1337](http://localhost:1337). This is where you'll spend most of your time creating and updating content.

:::tip TIP
If the server is not already running, in your terminal, `cd` into the `my-project` folder and run `yarn develop` (or `npm run develop`) to launch it..
:::

### 1. Create collection types

You can use the Content-Types Builder to create a data structure from scratch.

#### Create a "Restaurant" collection type

Go to [_PLUGINS > Content-Types Builder_](http://localhost:1337/admin/plugins/content-type-builder) in the left-hand menu, and click on **"+ Create new collection type"**. Type `restaurant` for the **Display name**, and click **Continue**.  

On the next screen, click the **Text** field, and type `name` in the **Name** field.  Then, switch to the **ADVANCED SETTINGS** tab, and check the **Required field** and the **Unique field** settings.

Now, click on **"+ Add another Field"**.  Choose the **Rich Text** field, type `description` under the **Name** field, then click **Finish**.

Finally, click the **Save** button and wait for Strapi to restart.

> 🥳  You have just created your first collection type, `Restaurant`.

![Screenshot: Restaurant Collection Type in Content-Types Builder](../assets/quick-start-guide/qsg-handson-step2-01-restaurant_ct.png)

#### Create a "Category" collection type

Navigate to [_PLUGINS > Content-Types Builder_](http://localhost:1337/admin/plugins/content-type-builder) in the left-hand menu, and click on **"+ Create new collection type"**. Type `category` for the **Display name**, and click **Continue**.

Click the **Text** field, then type `name` in the **Name** field. Switch over to the **ADVANCED SETTINGS** tab, and check the **Required field** and the **Unique field** settings.

Click on **"+ Add another Field"** and choose the **Relation** field. On the right side, click the **Category** dropdown and select **Restaurant**. In the center, select the icon that represents `many-to-many`. The text should read `Categories has and belongs to many Restaurants`.

![](../assets/quick-start-guide/qsg-handson-step2-02-collection_ct.png)

Finally, click **Finish** then the **Save** button and wait for Strapi to restart.

> 🥳  You have just created another collection type, `Categories`, and connected it to the `Restaurant` collection type.

### 2. Use your Collection Types

Once your Content-Types are created, you can start creating entries.

#### Create an entry for the "Restaurant" collection type

Navigate to [_COLLECTION TYPES > Restaurants_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant) in the left-hand menu, and click on **+ Add New Restaurants** button.

Type `Biscotte Restaurant` in the **Name** field. Type `Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.` into the **Description** field.

Click **Save**.  If you go back [_COLLECTION TYPES > Restaurants_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant), you will see your restaurant listed in the entries.

> 🥳  You have just created the first content entry with the `Restaurant` collection type you have previously built.

#### Add Categories

Navigate go to [_COLLECTION TYPES > Categories_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category) in the left-hand menu, and click on **+ Add New Categories**. 

Type `French Food` in the **Name** field. Select `Biscotte Restaurant` on the right in the **Restaurant (0)** dropdown.

> 🥳 You have just discovered a first way to connect the `Restaurant` and `Category` collection types.

Click **Save**, go back to _COLLECTION TYPES > Categories_, then click again on **+ Add New Categories**.  Type `Brunch` in the **Category** field, then click **Save**. 

Go back again to [_COLLECTION TYPES > Categories_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category). You will see the `French Food` and `Brunch` categories in the list.

![Screenshot: Categories](../assets/quick-start-guide/qsg-handson-step2-03-categories.png)

#### Add a Category to a Restaurant

Navigate to [_COLLECTION TYPES > Restaurants_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant) in the left-hand menu, and click on `Biscotte Restaurant`.

In the right sidebar, click on **Add an item…** under **Categories (1)**, select `Brunch`, then click **Save**.

> 🥳 You have just discovered another way to connect 2 collection types.

### 3. Set Roles & Permissions

Navigate to _GENERAL > Settings_ in the left hand menu, then choose [**Roles**](http://localhost:1337/admin/settings/users-permissions/roles) under _USERS & PERMISSIONS PLUGIN_.

Click the **Public** role, scroll down under **Permissions**.

In the **Application** tab, find **RESTAURANT**. Click the checkboxes next to **find** and **findone**.
Repeat with **CATEGORY**: click the checkboxes next to **find** and **findone**.

Finally, click **Save**.

![Screenshot: Public Role in Users & Permissions plugin](../assets/quick-start-guide/qsg-handson-step2-04-roles.png)

> 🥳  You have just learned how to allow the API to access some items in your collection types.
### 4. Publish the content

By default, any content you create is saved as a draft.

To publish your categories, navigate to [_COLLECTION TYPES > Categories_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::category.category).

From there, click the **Draft** button on the `Brunch` category. On the next screen, click **Publish** and in the **Please confirm** dialog, click **Yes, publish**.  Go back to the Categories list and repeat for the `French food` category.

To publish your `Biscotte Restaurant`, navigate to [_COLLECTION TYPES > Restaurants_](http://localhost:1337/admin/plugins/content-manager/collectionType/application::restaurant.restaurant), click the **Draft** button for the entry, and **Publish** the restaurant entry.

> 🥳  Since you've setup roles & permissions and published your content, the list of restaurants is now accessible at [http://localhost:1337/restaurants](http://localhost:1337/restaurants).

![Screenshot: API Response](../assets/quick-start-guide/qsg-handson-step2-05-api_response.png)

:::tip CONGRATULATIONS! 🥳 
Now your data structure is created and accessible through the API. You can start consuming your content by yourself, or proceed to [step 3](/developer-docs/latest/getting-started/quick-start-step3.md) to learn how to integrate your content with various frameworks, frontend or backend programming languages, then deploy your content.
:::

::::

:::::
