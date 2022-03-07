---
title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.html
---

# DigitalOcean App Platform

!!!include(developer-docs/latest/setup-deployment-guides/deployment/snippets/deployment-guide-not-updated.md)!!!

This is a step-by-step guide for deploying a Strapi project to [DigitalOcean's App Platform](https://digitalocean.com). App Platform is DigitalOcean's Platform as a Service (PaaS) that will handle deploying, networking, SSL, and more for your app. It is the easiest way to deploy Strapi to DigitalOcean.

Databases can be created using DigitalOcean's [Managed Databases](https://www.digitalocean.com/products/managed-databases/).

Prior to starting this guide, you should have created a [Strapi project](/developer-docs/latest/getting-started/quick-start.md). And have read through the [configuration](/developer-docs/latest/setup-deployment-guides/deployment.md#application-configuration) section.

::: tip
Strapi does have a [One-Click](/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.md) deployment option for DigitalOcean and can also be deployed to [DigitalOcean Droplets](/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean.md).
:::

### DigitalOcean Install Requirements

- If you don't have a DigitalOcean account you will need to create one, you can use [this referral link](https://try.digitalocean.com/strapi/) to get \$100 of free credits!

## Configure Your Strapi Project for Deployment

To deploy your Strapi app, you will need to update the exisiting databse configuration file. You will be using PostgreSQL for this example but you are able to connect to any of the [databases](https://docs.digitalocean.com/products/databases/) provided by DigitalOcean and [supported by Strapi](/developer-docs/latest/setup-deployment-guides/installation/cli.md#preparing-the-installation).

You will configure a database for production. First, install the [pg](https://www.npmjs.com/package/pg) package (with `npm install pg --save` or `yarn add pg`) then add the following to `config/database.js`:

```javascript
module.exports = ({ env }) => {
  if (env('NODE_ENV') === 'production') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: {
            rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
          },
        },
        debug: false,
      },
    };
  }

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    }
  }  
};
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

- **Environment Variables**: Add `DATABASE_HOST`: `${db.HOSTNAME}`
- **Environment Variables**: Add `DATABASE_PORT`: `${db.PORT}`
- **Environment Variables**: Add `DATABASE_NAME`: `${db.DATABASE}`
- **Environment Variables**: Add `DATABASE_USERNAME`: `${db.USERNAME}`
- **Environment Variables**: Add `DATABASE_PASSWORD`: `${db.PASSWORD}`
- **Build Command**: `NODE_ENV=production npm run build`
- **Run Command**: `NODE_ENV=production npm start`

### Step 6. Add a Database

Click on the Add a Database button. You can create a development PostgreSQL database while testing your application. Alternatively, you can add a Managed Database that you have created.

Name your database (default name is `db`). Whatever you name your database here is what you should use in the environment variables in Step 5 above. For instance, we name the database `db` and we use the environment variable value: `${db.DATABASE_HOST}`

Click "Next".
### Step 7. Add Strapi Upload Provider for Digital Ocean Spaces

```bash
yarn add strapi-provider-upload-do
```

Follow the documentation of the [plugin](https://github.com/shorwood/strapi-provider-upload-do) for the full configuration.

### Step 8. Name your app

Name your app. This will also change what domain your app will live on: `https://app-name.ondigitalocean.app`

Select the region closest to you and your users. Static components are served on our global CDN.

### Step 9. Choose your plan

For prototype applications, you can choose the Basic plan. For applications that are expecting production traffic, you can choose the Pro plan. You will also see the pricing for your database that you have chosen.

Choose your container size based on how much traffic you believe your app will have. It is a good practice to start on the smaller sizes, monitor the metrics of your app, and scale up as your app grows. App Platform allows DigitalOcean to scale vertically or horizontally with the click of a button.

### Step 10. Launch!

DigitalOcean will now deploy your application and you will be taken to the dashboard where you can view your app, make adjustments, and visit your new Strapi app.

## Next Steps

You have the ability to size your application, add components like a static site, and add a domain.
