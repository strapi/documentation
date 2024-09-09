---
sidebar_label: 'Quick Start Guide'
displayed_sidebar: devDocsSidebar
sidebar_position: 2
title: Quick Start Guide - Strapi Developer Docs
description: Get ready to get Strapi, your favorite open-source headless cms up and running in less than 3 minutes.
tags:
 - guides
 - Content-type Builder
 - collection type
 - Content Manager
 - Strapi Cloud

# next: ./troubleshooting

---

import InstallPrerequisites from '/docs/snippets/installation-prerequisites.md'
const detailsStyle = {backgroundColor: 'transparent', border: 'solid 1px #4945ff' }
const summaryStyle = {fontSize: '18px'}

# Quick Start Guide

Strapi offers a lot of flexibility. Whether you want to go fast and quickly see the final result, or would rather dive deeper into the product, we got you covered. For this tutorial, we'll go for the DIY approach and build a project and data structure from scratch, then deploy your project to Strapi Cloud to add data from there.

*Estimated completion time: 5-10 minutes*

:::prerequisites
<InstallPrerequisites components={props.components} />

You will also need to [install `git`](https://github.com/git-guides/install-git) and to have a [GitHub](https://github.com) account to deploy your project to Strapi Cloud.
:::

## 🚀 Part A: Create a new project with Strapi

We will first create a new Strapi project on your machine by running a command in the terminal, and then register our first local administrator user.

Follow the steps below by clicking on the togglable content to read more instructions.

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 1: Run the installation script</summary>

### Step 1: Run the installation script

Run the following command in a terminal:

```bash
npx create-strapi@rc my-project --quickstart
```

:::info
The `--quickstart` installation sets up Strapi with a SQLite database. Other databases and installation options are available (see [CLI installation guide](/dev-docs/installation/cli)).
:::

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 2: Register the first local administrator user</summary>

### Step 2: Register the first local administrator user

Once the installation is complete, your browser automatically opens a new tab.

By completing the form, you create your own account. Once done, you become the first administrator user of this Strapi application. Welcome aboard, commander!

You now have access to the [admin panel](http://localhost:1337/admin):

<ThemedImage
alt="Admin panel screenshot: dashboard"
sources={{
    light: '/img/assets/quick-start-guide/qsg-handson-part1-01-admin_panel.png',
    dark: '/img/assets/quick-start-guide/qsg-handson-part1-01-admin_panel_DARK.png',
}}
/>

</details>

:::callout 🥳 CONGRATULATIONS!
You have just created a new Strapi project! You can start playing with Strapi and discover the product by yourself using our [User Guide](/user-docs/intro), or proceed to part B below.
:::

## 🛠 Part B: Build your data structure with the Content-type Builder

The installation script has just created an empty project. We will now guide you through creating a restaurants directory, inspired by our [FoodAdvisor](https://github.com/strapi/foodadvisor) example application.

The admin panel of a local Strapi project runs at [http://localhost:1337/admin](http://localhost:1337/admin). This is where you will spend most of your time creating and updating content.

First we will build a data structure for your content. This can only be done while in development mode, which is the default mode for projects that are created locally.

:::tip TIP
If the server is not already running, in your terminal, `cd` into the `my-project` folder and run `npm run develop` (or `yarn develop`) to launch it.
:::

The Content-Type Builder helps you create your data structure. When creating an empty project with Strapi, this is where to get the party started!

<details style={detailsStyle}>

<summary style={summaryStyle}>Step 1: Create a "Restaurant" collection type</summary>

### Step 1: Create a "Restaurant" collection type

Your restaurants directory will eventually include many restaurants, so we need to create a "Restaurant" collection type. Then we can describe the fields to display when adding a new restaurant entry:

1. Click on the **Create your first Content type** button.<br />If it's not showing up, go to ![Content-type Builder icon](/img/assets/icons/v5/Layout.svg) [Content-type Builder](http://localhost:1337/admin/plugins/content-type-builder) in the main navigation.
2. Click on **Create new collection type**.
3. Type `Restaurant` for the _Display name_, and click **Continue**.  
4. Click the Text field.
5. Type `Name` in the _Name_ field.
6. Switch to the _Advanced Settings_ tab, and check the **Required field** and the **Unique field** settings.
7. Click on **Add another field**.
8. Choose the Rich text (Blocks) field in the list.
9. Type `Description` under the _Name_ field, then click **Finish**.
10. Finally, click **Save** and wait for Strapi to restart.

<ThemedImage
alt="GIF: Create Restaurant collection type in Content-type Builder"
sources={{
    light: '/img/assets/quick-start-guide/qsg-handson-restaurant_2.gif',
    dark: '/img/assets/quick-start-guide/qsg-handson-restaurant_2_DARK.gif',
}}
/>

Once Strapi has restarted, "Restaurant" is listed under ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types_ in the navigation. Wow, you have just created your very first content-type! It was so cool — let's create another one right now, just for pleasure.

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 2: Create a "Category" collection type</summary>

### Step 2: Create a "Category" collection type

It would help getting a bit more organized if our restaurants directory had some categories. Let's create a "Category" collection type:

1. Go to ![Content-type Builder icon](/img/assets/icons/v5/Layout.svg) [Content-type Builder](http://localhost:1337/admin/plugins/content-type-builder) in the main navigation.
2. Click on **Create new collection type**.
3. Type `Category` for the _Display name_, and click **Continue**.
4. Click the Text field.
5. Type `Name` in the _Name_ field.
6. Switch to the _Advanced Settings_ tab, and check the **Required field** and the **Unique field** settings.
7. Click on **Add another field**.
8. Choose the Relation field.
9. In the center, select the icon that represents "many-to-many" ![icon many-to-many](/img/assets/icons/v5/ctb_relation_manytomany.svg). The text should read `Categories has and belongs to many Restaurants`.

<ThemedImage
alt="Admin Panel screenshot: relations"
sources={{
  light: '/img/assets/quick-start-guide/qsg-handson-part2-02-collection_ct.png',
  dark: '/img/assets/quick-start-guide/qsg-handson-part2-02-collection_ct_DARK.png',
}}
/>

11. Finally, click **Finish**, then the **Save** button, and wait for Strapi to restart.

</details>

:::callout 🥳 CONGRATULATIONS!
You have just created a basic data structure for your Strapi project! You can keep on playing with the [Content-type Builder](/user-docs/content-type-builder), or proceed to parts C and D below to discover Strapi Cloud and add actual content to your project.
:::

## ☁️ Part C: Deploy to Strapi Cloud

Now that your beautiful first Strapi project is working locally, it's time for the world to see it live! The most straightforward way to host your project is to use Strapi Cloud. Before deploying to Strapi Cloud, you will need to host your Strapi project on an online repository — we will use GitHub.

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 1: Host the code of your Strapi project on GitHub</summary>

### Step 1: Host the code of your Strapi project on GitHub

Create a new GitHub repository and push the code of your Strapi project to this repository. If you're not already familiar with GitHub, the togglable content below should get you started 👇

<details>
<summary>Steps required to push your Strapi project code to GitHub:</summary>

1. In the terminal, ensure you are still in the `my-project` folder that hosts the Strapi project we created. If you followed this tutorial closely so far, we should still be there.
2. Run the `git init` command to initialize git for this folder.
3. Run the `git add .` command to add all modified files to the git index.
4. Run the `git commit -m "Initial commit"` command to create a commit with all the added changes.
5. Log in into your GitHub account and [create a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories). Give the new repository a name, for instance `my-first-strapi-project`, and remember this name.
6. Go back to the terminal and push your local repository to GitHub:

  a. Run a command similar to the following: `git remote add origin git@github.com:yourname/my-first-strapi-project.git`, ensuring you replace `yourname` by your actual GitHub profile name, and `my-first-strapi-project` by the actual name you used at step 4.

  b. Run the `git push --set-upstream origin main` command to finally push the commit to your GitHub repository.

Additional information about using git with the command line interface can be found in the [official GitHub documentation](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#adding-a-local-repository-to-github-using-git).

</details>

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 2: Create a Strapi Cloud account and a new Strapi Cloud project</summary>

### Step 2: Create a Strapi Cloud account and a new Strapi Cloud project

To create a new Strapi Cloud account:

1. Navigate to the [Strapi Cloud](https://cloud.strapi.io) login page.
2. Click the **Continue with GitHub** button and log in with the GitHub account where your Strapi project's repository is hosted.

You should now see the Strapi Cloud dashboard. This is where you manage your Strapi projects hosted on Strapi Cloud.

We will create a new Strapi Cloud project by importing the local Strapi project you have just pushed to a GitHub repository:

<ThemedImage
  alt="Strapi Cloud dashboard"
  sources={{
    light: '/img/assets/quick-start-guide/qsg-strapi-cloud-1.png',
    dark: '/img/assets/quick-start-guide/qsg-strapi-cloud-1_DARK.png',
  }}
/>

1. Click the **+ Create project** button.
2. Select the free trial plan.
3. Scroll down, and in the "Import git repository section", choose the appropriate Account and Repository from the list (for instance, Account: `yourname`, Repository: `my-first-strapi-project`).
4. Scroll down further, and in the "Setup" section, give your project a Display name (for instance `my-first-strapi-project`) and leave the other options unchanged.
5. Click **Create project** at the bottom of the page.

Your Strapi project should be deployed within minutes. 🚀 Once it's done, you'll be able to log into your deployed Strapi project by clicking the **Visit app** button in the top right corner.

</details>

:::callout 🥳 CONGRATULATIONS!  
Now your project is hosted on Strapi Cloud and accessible online. You can learn more about Strapi Cloud by reading [its dedicated documentation](/cloud/intro) or proceed to part D to log in into your online Strapi project and add your first data from there.
:::

## 📝 Part D: Add content to your Strapi Cloud project with the Content Manager

Now that we have created a basic data structure with 2 collection types, "Restaurant" and "Category", and deployed your project to Strapi Cloud, let's use the Cloud to actually add content by creating new entries.

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 1: Log in to the admin panel of your new Strapi Cloud project</summary>

### Step 1: Log in to the admin panel of your new Strapi Cloud project

Now that your Strapi Cloud project is created, let's log in into the project:

1. From your [Strapi Cloud dashboard](https://cloud.strapi.io/projects), click the `my-first-strapi-project` project.
3. Click the **Visit app** button.
4. In the new page that opens, complete the form to create the first administrator user of this Strapi Cloud project.

Logged in into our first Strapi Cloud project, we will now add data from there.

<ThemedImage
alt=""
sources={{
  light: '/img/assets/quick-start-guide/qsg-first-login-cloud.gif',
  dark: '/img/assets/quick-start-guide/qsg-first-login-cloud_DARK.gif'
}}
/>

<details>
<summary>ℹ️ Additional information and tips about users and Strapi Cloud projects:</summary>

:::note Note: Local users and Strapi Cloud users are different
The databases for your Strapi Cloud project and your local project are different. This means that data is not automatically transferred from your local project to Strapi Cloud. This includes users that you previously created locally. That's why you are invited to create a new administrator account when logging in to your Strapi Cloud project for the first time.
:::

:::tip Tip: Directly accessing the admin panel of your Strapi Cloud project
Any project hosted on Strapi Cloud is accessible from its own URL, something like `https://my-strapi-project-name.strapiapp.com`. To access the admin panel of your online project, simply add `/admin` to the URL, for instance as in `https://my-strapi-project-name.strapiapp.com/admin`. URLs can be found in your Strapi Cloud dashboard and you can also directly access your Strapi Cloud projects from there by clicking on the name of your project then on the **Visit app** button.
:::

</details>

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 2: Create an entry for the "Restaurant" collection type</summary>

### Step 2: Create an entry for the "Restaurant" collection type

1. Go to ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types - Restaurant_ in the navigation.
2. Click on **Create new entry**.
3. Type the name of your favorite local restaurant in the _Name_ field. Let's say it's `Biscotte Restaurant`.
4. In the _Description_ field, write a few words about it. If you're lacking some inspiration, you can use `Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.`
5. Click **Save**.

<ThemedImage
alt="Screenshot: Biscotte Restaurant in Content Manager"
sources={{
  light: '/img/assets/quick-start-guide/qsg-handson-part2-03-restaurant.png',
  dark: '/img/assets/quick-start-guide/qsg-handson-part2-03-restaurant_DARK.png',
}}
/>

The restaurant is now listed in the _Collection types - Restaurant_ view of the ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager_.

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 3: Add Categories</summary>

#### Step 3: Add Categories

Let's go to ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types - Category_ and create 2 categories:

1. Click on **Create new entry**.
2. Type `French Food` in the _Name_ field.
3. Click **Save**.
4. Go back to _Collection types - Category_, then click again on **Create new entry**.  
5. Type `Brunch` in the _Name_ field, then click **Save**.

<ThemedImage
alt="GIF: Add Categories"
sources={{
  light: '/img/assets/quick-start-guide/qsg-handson-categories.gif',
  dark: '/img/assets/quick-start-guide/qsg-handson-categories_DARK.gif',
}}/>

The "French Food" and "Brunch" categories are now listed in the _Collection types - Category_ view of the ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager_.

Now, we will add a category to a restaurant:

1. Go to ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types - Restaurant_ in the navigation, and click on "Biscotte Restaurant".
2. In the **Categories** drop-down list at the bottom of the page, select "Brunch". Scroll back to the top of the page and click **Save**.

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 4: Set Roles & Permissions</summary>

### Step 4: Set Roles & Permissions

We have just added a restaurant and 2 categories. We now have enough content to consume (pun intended). But first, we need to make sure that the content is publicly accessible through the API:

1. Click on _![Settings icon](/img/assets/icons/v5/Cog.svg) Settings_ at the bottom of the main navigation.
2. Under _Users & Permissions Plugin_, choose _Roles_.
3. Click the **Public** role.
4. Scroll down under _Permissions_.
5. In the _Permissions_ tab, find _Restaurant_ and click on it.
6. Click the checkboxes next to **find** and **findOne**.
7. Repeat with _Category_: click the checkboxes next to **find** and **findOne**.
8. Finally, click **Save**.

<ThemedImage
alt="Screenshot: Public Role in Users & Permissions plugin"
sources={{
  light: '/img/assets/quick-start-guide/qsg-handson-part2-04-roles.png',
  dark: '/img/assets/quick-start-guide/qsg-handson-part2-04-roles_DARK.png'
}}/>

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 5: Publish the content</summary>

### Step 5: Publish the content

By default, any content you create is saved as a draft. Let's publish our categories and restaurant.

First, navigate to ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types - Category_. From there:

1. Click the "Brunch" entry.
2. On the next screen, click **Publish**.
3. In the _Confirmation_ window, click **Yes, publish**.  

Then, go back to the Categories list and repeat for the "French Food" category.

Finally, to publish your favorite restaurant, go to ![Content Manager icon](/img/assets/icons/v5/Feather.svg) _Content Manager > Collection types - Restaurant_, click the "Biscotte Restaurant" entry, and **Publish** it.

<ThemedImage
alt="GIF: Publish content"
sources={{
  light: '/img/assets/quick-start-guide/qsg-handson-publish.gif',
  dark: '/img/assets/quick-start-guide/qsg-handson-publish_DARK.gif'
}}
/>

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>Step 6: Use the API</summary>

### Step 6: Use the API

OK dear gourmet, we have just finished creating our content and making it accessible through the API. You can give yourself a pat on the back — but you have yet to see the final result of your hard work.

There you are: the list of restaurants should be accessible by visting the `/api/restaurants` path of your Strapi Cloud project URL (e.g., `https://beautiful-first-strapi-project.strapiapp.com/api/restaurants`).

Try it now! The result should be similar to the example response below 👇.

<details>
<summary>Click me to view an example of API response:</summary>

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "hm2djv4ftwshlxdow91al75f",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
            }
          ]
        }
      ],
      "createdAt": "2021-11-18T13:34:53.885Z",
      "updatedAt": "2021-11-18T13:59:05.035Z",
      "publishedAt": "2021-11-18T13:59:05.033Z"
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

</details>

:::callout 🥳 CONGRATULATIONS!  
Now your content is created, published, and you have permissions to request it through the API.
Keep on creating amazing content!
:::

:::tip Tip: Transfer data between your local and Strapi Cloud projects
The databases for your Strapi Cloud project and your local project are different. This means that data is not automatically synchronized between your Strapi Cloud and local projects. You can use the [data management system](/dev-docs/data-management) to transfer data between projects.
:::

## ⏩ What to do next?

Now that you know the basics of creating and publishing content with Strapi, we encourage you to explore and dig deeper into some Strapi features:

- 👉 learn how to use Strapi's [REST](/dev-docs/api/rest) API to query the content,
- 👉 learn more about Strapi features by browsing the [User Guide](/user-docs/intro),
- 👉 and [customize your Strapi back end](/dev-docs/backend-customization) and [admin panel](/dev-docs/admin-panel-customization) for advanced use cases.
