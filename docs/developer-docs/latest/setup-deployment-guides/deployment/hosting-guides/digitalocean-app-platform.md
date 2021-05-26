---
title: DigitalOcean App Platform Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
---

# DigitalOcean App Platform

This is a step-by-step guide for deploying a Strapi project to [DigitalOcean's App Platform](https://digitalocean.com). App Platform is DigitalOcean's Platform as a Service (PaaS) that will handle deploying, networking, SSL, and more for your app. It is the easiest way to deploy Strapi to DigitalOcean.

Databases can be created using DigitalOcean's [Managed Databases](https://www.digitalocean.com/products/managed-databases/).

Prior to starting this guide, you should have created a [Strapi project](/developer-docs/latest/getting-started/quick-start.md). And have read through the [configuration](/developer-docs/latest/setup-deployment-guides/deployment.md#application-configuration) section.

::: tip
Strapi does have a [One-Click](/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.md) deployment option for DigitalOcean and can also be deployed to [DigitalOcean Droplets](/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean.md).
:::

### DigitalOcean Install Requirements

- If you don't have a DigitalOcean account you will need to create one, you can use [this referral link](https://try.digitalocean.com/strapi/) to get \$100 of free credits!

## Configure Your Strapi Project for Deployment

To deploy your Strapi app, you will need to create a database configuration file. You will be using PostgreSQL for this example but you are able to connect to any of the [databases](https://docs.digitalocean.com/products/databases/) provided by DigitalOcean and [supported by Strapi](/developer-docs/latest/setup-deployment-guides/configurations.html#database).

You will configure a database for production. With the setup below, you will only need to set **one environment variable** for the `DATABASE_URL` to connect to your PostgreSQL database. Add the following to `config/env/production/database.js`:

```javascript
const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

module.exports = () => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password: config.password,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      options: {},
    },
  },
});
```

Your application is now ready to deploy to DigitalOcean App Platform.

## Deploying Strapi to DigitalOcean App Platform

App Platform lets you deploy your application directly from a [GitHub](https://github.com) repo. [Gitlab](https://gitlab.com) is also supported.

### Step 1. Log in to your [DigitalOcean account](https://cloud.digitalocean.com/login).

### Step 2. Create a new "App" by clicking "Apps" in the "Create" dropdown

### Step 3. Choose GitHub (or wherever you have your Strapi repo)

### Step 4. Select your repository

Choose your repository, your branch, and keep "Autodeploy code changes" checked if you want DigitalOcean to deploy every time you push to this GitHub branch.

### Step 5. Configure your app

Here you will configure how DigitalOcean App Platform deploys your Strapi app. You can leave most things default. The only things you need to change are shown below:

- **Environment Variables**: Add `DATABASE_URL`: `${db.DATABASE_URL}`
- **Build Command**: `NODE_ENV=production npm run build`
- **Run Command**: `NODE_ENV=production npm start`

### Step 6. Add a Database

Click on the Add a Database button. You can create a development PostgreSQL database while testing your application. Alternatively, you can add a Managed Database that you have created.

Name your database (default name is `db`). Whatever you name your database here is what you should use in the environment variables in Step 5 above. For instance, we name the database `db` and we use the environment variable value: `${db.DATABASE_URL}`

Click "Next".

### Step 7. Name your app

Name your app. This will also change what domain your app will live on: `https://app-name.ondigitalocean.app`

Select the region closest to you and your users. Static components are served on our global CDN.

### Step 8. Choose your plan

For prototype applications, you can choose the Basic plan. For applications that are expecting production traffic, you can choose the Pro plan. You will also see the pricing for your database that you have chosen.

Choose your container size based on how much traffic you believe your app will have. It is a good practice to start on the smaller sizes, monitor the metrics of your app, and scale up as your app grows. App Platform allows DigitalOcean to scale vertically or horizontally with the click of a button.

### Step 9. Launch!

DigitalOcean will now deploy your application and you will be taken to the dashboard where you can view your app, make adjustments, and visit your new Strapi app.

## Next Steps

You have the ability to size your application, add components like a static site, and add a domain.
