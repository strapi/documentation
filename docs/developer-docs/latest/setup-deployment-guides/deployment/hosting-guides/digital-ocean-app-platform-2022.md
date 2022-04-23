---
title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform-2022.html
---

# Deploying to Digital Ocean App Platform

After creating a Strapi application in a local environment it is useful to evaluate the app in a production environment. The purpose of this guide is to allow users to deploy Strapi applications on the Digital Ocean App Platform. While both Strapi and Digital Ocean App Platform can work with multiple types of databases the focus is on connecting to a development database so users can test their application in a deployed environment. Future additions to the guide will address different database options. This guide does not cover migrating local database content to a production database or connecting front-end applications to the Digital Ocean App Platform.

::: caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to the Strapi app and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please open an issue on GitHub.
:::

## Prerequsites

Prior to starting the deployment process each user will need:

- a Digital Ocean account ([referral link](https://try.digitalocean.com/strapi/)),
- a [GitHub account](https://github.com/join),
- Git version control.

The Digital Ocean App Platform uses version control repositories such as GitHub to deploy applications. In addition to GitHub, GitLab and Bit Bucket are also supported. The Strapi referral link for Digital Ocean provides \$100 in credits. Git version control must be used locally, in order to store an application in a remote repository such as GitHub. Follow the details below to setup Git for the project.

<!--- add details here-->
::: details - Setting up Git version control and connecting to a remote repository

:::

## Setting up a Strapi project for deployment

<!-- proposal is to move this content to the main deployment page once all of the guides are modified for consistency-->
Strapi uses [environment configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

1. [Create a new Strapi application using the quickstart flag](/developer-docs/latest/getting-started/quick-start.md) or navigate to the root directory of an existing Strapi application.
2. In the project `config` directory create the sub-directory `config/env/production`
3. Create `database.js` and `server.js` files (`.ts` for TypeScript projects)

### Configuring `env/production/database`

In order to connect the Strapi application in production to a hosted database the database credentials must be specified. Copy the following code snippet into `env/production/database`.

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
//path:config/env/production.database.js

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
//path:config/env/production.database.ts

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

### Configuring `env/production/server`

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
//path:config/env/production.server.js

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
//path:config/env/production.server.ts

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
yarn pg
```
</code-block>

</code-group>

### Committing the project to a remote repository

Save the Strapi application locally then, in a terminal, run :

1. `git add .`
2. `git commit -m "commit message"`
3. `git push`

## Creating a Digital Ocean App

<!-- intro to the nomenclature for DO AP-->





### Connecting to GitHub repository
connect to GH repo, autoDeploy on/off,


### Connecting web app to a database
<!-- create apps,  add resource: db, dev db, name db **important** -->
### Environmental variables

Env var: db at global and rest at app level

Region: keep same as app level for lower latency

::: caution
The environmental variables for the development and managed database are handled differently by DO. When connected to a managed database DO handles the environmental variables automatically. Check the .yaml file to confirm the db settings are not duplicated if using a managed database.
:::

### Deploying the Strapi application


## Accessing the application in the production environment

Access to the Strapi admin panel is {your app domain}/admin.
