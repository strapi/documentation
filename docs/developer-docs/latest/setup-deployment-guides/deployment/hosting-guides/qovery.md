---
title: Qovery Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application on Qovery.
---

# Qovery

The following documentation will guide you through the step-by-step deployment of a Strapi project on  [Qovery](https://www.qovery.com). Qovery is a fully-managed cloud platform that runs on your AWS, DigitalOcean and Scaleway account where you can host static sites, backend APIs, databases, cron jobs, and all your other apps in one place.

## Setup
### 1. Create a Qovery Account
Visit the [Qovery dashboard](https://start.qovery.com) to create an account if you don't already have one.

### 2. Create a project
1. Click on **Create project** and give a name to your project.
2. Click on **Next**.

![Create a project](https://hub.qovery.com/img/heroku/heroku-2.png)

::: tip NOTE
One project can have multiple apps running. This is convenient to group your backend, frontend, database etc.
:::

### 3. Create a new environment
* Click on **Create environment** and give a name (e.g. staging, production).

![Create a new environment](https://hub.qovery.com/img/heroku/heroku-3.png)

### 4. Add your Strapi app
1. Click on **Create an application**, give a name and select your GitHub or GitLab repository where your Strapi application is located.
2. Define the main branch name and the root application path.
3. Click on **Create**.

![Add your application](https://hub.qovery.com/img/rust/rust.png)

After the application is created:

1. Navigate to your application **Settings**
2. Select **Port**
3. Add port used by your Strapi application

### 5. Deploy a database
Create and deploy a new database PostgreSQL database

To learn how to do it, you can [follow this guide](https://hub.qovery.com/guides/getting-started/create-a-database)

### 6. Add storage
To add storage, go to your application **Settings**:

![Add storage](https://hub.qovery.com/img/add-storage.png)


### 7. Setup your Strapi configuration
To use PostgreSQL provided by Qovery, you can use the built-in secrets and environment variables (see Qovery's [configuration section](https://hub.qovery.com/docs/using-qovery/configuration/environment-variable/).)

### 8. Deploy the app on Qovery
All you have to do now is to navigate to your application and click on **Deploy**.

![Deploy the app](https://hub.qovery.com/img/heroku/heroku-1.png)

That's it. Watch the status and wait till the application is deployed.

To open the application in your browser, click on **Action** and **Open** in your application overview.

## Support
Chat with Qovery developers on [Discord](https://discord.qovery.com) if you need help.
