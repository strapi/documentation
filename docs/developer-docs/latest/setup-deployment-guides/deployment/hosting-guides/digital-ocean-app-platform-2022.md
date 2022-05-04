---
title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform-2022.html
---

# Deploying to DigitalOcean App Platform

The purpose of this guide is to allow users to deploy Strapi applications on the DigitalOcean App Platform. While both Strapi and DigitalOcean App Platform can work with multiple types of databases the focus is on connecting to a postgres development database so users can test their application in a deployed environment. Future additions to the guide will address different database options. This guide does not cover migrating local database content to a production database or connecting front-end applications to the DigitalOcean App Platform.

::: caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please open an issue on GitHub.
:::

## Prerequsites

Prior to starting the deployment process each user will need:

- a DigitalOcean account ([referral link](https://try.digitalocean.com/strapi/)),
- a [GitHub account](https://github.com/join),
- Git version control.

The DigitalOcean App Platform uses version control repositories such as GitHub to deploy applications. In addition to GitHub, GitLab and Docker are also supported. The Strapi referral link for DigitalOcean provides \$100 in credits. Git version control must be used locally, in order to store an application in a remote repository such as GitHub. Follow the details below to setup Git for the project.

<!--- add details here-->
::: details - Setting up Git version control and connecting to a remote repository

:::

## Setting up a Strapi project for deployment

<!-- proposal is to move this content to the main deployment page once all of the guides are modified for consistency-->
Strapi uses [environment configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

1. [Create a new Strapi application using the quickstart flag](/developer-docs/latest/getting-started/quick-start.md) or navigate to the root directory of an existing Strapi application.
2. In the project `config` directory create the sub-directory `config/env/production`
3. Create `database.js` and `server.js` files (`.ts` for TypeScript projects)

### Configuring database

In order to connect the Strapi application in production to a hosted database the database credentials must be specified. Copy the following code snippet into `env/production/database`.

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
// path: ./config/env/production/database.js

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'), 
      port: env.int('DATABASE_PORT'), 
      database: env('DATABASE_NAME'), 
      user: env('DATABASE_USERNAME'), 
      password: env('DATABASE_PASSWORD'),
      ssl: {
        rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
      },
    },
    debug: false,
  },
});

```

</code-block>

<code-block title='TYPESCRIPT'>

```jsx
//path:config/env/production/database.ts

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'), 
      port: env.int('DATABASE_PORT'), 
      database: env('DATABASE_NAME'), 
      user: env('DATABASE_USERNAME'), 
      password: env('DATABASE_PASSWORD'),
      ssl: {
        rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
      },
    },
    debug: false,
  },
});

```

</code-block>
</code-group>

### Configuring server

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
//path:config/env/production/server.js

module.exports = ({ env }) => ({
    proxy: true,
    url: env('APP_URL'),
    app: { 
      keys: env.array('APP_KEYS')
    },
  })

```

</code-block>

<code-block title='TYPESCRIPT'>

```jsx
//path:config/env/production/server.ts

export default ({ env }) => ({
    proxy: true,
    url: env('APP_URL'),
    app: { 
      keys: env.array('APP_KEYS')
    },
  })

```

</code-block>
</code-group>

### Adding postgres dependencies
Connecting a postgres database to Strapi requires a set of Node modules contained in the `pg` package. Use the same package manager used to create the Strapi application to install `pg`. Run the following command in a terminal:

<code-group>

<code-block title="NPM">
```bash
npm install pg
```
</code-block>

<code-block title="YARN">
```bash
yarn add pg
```
</code-block>

</code-group>

### Committing the project to a remote repository

Save the Strapi application locally then, in a terminal, run :

1. `git add .`
2. `git commit -m "commit message"`
3. `git push`

## Creating a DigitalOcean App

On the DigitalOcean website click on the **Create** button and select *Apps*.  Next select GitHub and authorize access to your repository. Next:

1. select the branch,
2. select the source directory (optional),
3. chose whether or not to autodeploy with GitHub updates,
4. click the **Next** button.

### Connecting a web app to a database

On the next screen:

1. click **add resource**,
2. select database, and click **Add**,
3. On the next screen select *dev database* and name the database. The default database name is "db" and that will be used in the subsequent sections.
4. Click the **Create and attach** button.
5. On the next screen click the **Next** button to set the enviroment variables.

### Environmental variables

In the DigitalOcean App Platform there are global and component level enviroment variables. Strapi applications in production need global variables to set the database connection, and can use component level variables for secrets storage. Add the following variables to the global environment table:

| Variable name     | Value          |
|-------------------|----------------|
| URL               | ${APP_URL}     |
| DATABASE_HOST     | ${db.HOSTNAME} |
| DATABASE_PORT     | ${db.PORT}     |
| DATABASE_NAME     | ${db.DATABASE} |
| DATABASE_USERNAME | ${db.USERNAME} |
| DATABASE_PASSWORD | ${db.PASSWORD} |
| NODE_ENV          | production     |

Click **Save**.
At the top of the *Settings* menu select your Strapi application component. Scroll down to the Environment variables and click **edit** on the far right of the menu. The secrets for a Strapi application are set in the component settings environment variables. In your local application these secrets are stored in the `.env` file by default. Security is enhanced if different keys are generated for different environments. Add the following secrets and keys to the component environment variables table:

| Variable name    | value                               |
|------------------|-------------------------------------|
| APP_KEYS         | "unique user-generated secret here" |
| API_TOKEN_SALT   | "unique user-generated secret here" |
| ADMIN_JWT_SECRET | "unique user-generated secret here" |
| JWT_SECRET       | "unique user-generated secret here" |

Click **Save**.

::: caution
The environmental variables for the development and managed database are handled differently by DigitalOcean. When connected to a managed database DigitalOcean passes the environmental variables automatically as a url. Check the .yaml file to confirm the db settings are not duplicated if using a managed database.
:::

### Deploying and accessing a Strapi application

When the above steps are completed DigitalOcean should automatically try to build and deploy the application. If the build does not start, click the **Actions** button in the upper right and select *force rebuild and deploy*. The Strapi admin panel is accessed at {your app domain}/admin once the application is successfully deployed.

## Optional Steps

### Connect to a storage service
 

### Switch to a managed database
