---
title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform-2022.html
---

# Deploy to the DigitalOcean App Platform

The purpose of this guide is to allow users to deploy Strapi applications on the DigitalOcean App Platform. This guide uses the PostgreSQL development database provided by DigitalOcean, so applications can be tested in a deployed environment. At the end of the guide there is information on how to connect a Strapi application to a DigitalOcean Managed Database. Additional information about [migrating local database content to a production database](https://docs.digitalocean.com/products/databases/postgresql/how-to/import-databases/) and other deployment topics are provided in the [DigitalOcean documentation](https://docs.digitalocean.com/). <!--info about managed db for non PostgreSQL here>

::: caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please [open an issue on GitHub](https://github.com/strapi/documentation/issues) or [submit a pull request](https://github.com/strapi/documentation/pulls) to improve the documentation.
:::

## Prepare

Prior to starting the deployment process each user needs:

- a DigitalOcean account ([The Strapi referral link for DigitalOcean provides \$100 in credits.](https://try.digitalocean.com/strapi/)),
- a [GitHub account](https://github.com/join),
- [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an existing Strapi application

Git version control is necessary to efficiently add a Strapi application to a remote repository such as GitHub. The DigitalOcean App Platform uses version control repositories such as GitHub to deploy applications. In addition to GitHub, GitLab and Docker are also supported.

## Setup a Strapi project for deployment

Strapi uses [environment configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

### Add a production configuration environment

In the project `config` directory create the sub-directory `config/env/production`.
Create `database.js` and `server.js` files (or `database.ts` and `server.ts` for TypeScript projects).

### Configure the database

In order to connect the Strapi application in production to a hosted development database, the database credentials must be specified. Copy the following code snippet into `./config/env/production/database`:

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
// path: ./config/env/production/database.ts

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

### Configure the server

The `server.js` configuration file (or `server.ts` for a TypeScript project) for a deployed project requires the `url` property instead of the `host` and `port` properties that are used in the local development environment. The `APP_URL` variable is then specified as an [environment variable](#add-environment-variables) in the DigitalOcean App Platform. Add the following code snippet to `./config/env/production/server`:

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
//path: ./config/env/production/server.js

module.exports = ({ env }) => ({
    proxy: true,
    url: env('APP_URL'),
    app: { 
      keys: env.array('APP_KEYS')
    },
});
```

</code-block>

<code-block title='TYPESCRIPT'>

```jsx
//path: ./config/env/production/server.ts

export default ({ env }) => ({
    proxy: true,
    url: env('APP_URL'),
    app: { 
      keys: env.array('APP_KEYS')
    },
});
```

</code-block>
</code-group>

### Add PostgreSQL dependencies

Connecting a PostgreSQL database to Strapi requires a set of Node modules contained in the [`pg` package](https://www.npmjs.com/package/pg). Use the same package manager used to create the Strapi application to install `pg`. Run the following command in a terminal:

<code-group>

<code-block title="NPM">
```sh
npm install pg
```
</code-block>

<code-block title="YARN">
```sh
yarn add pg
```
</code-block>

</code-group>

### Commit the project to a remote repository

Save the Strapi application locally then, in a terminal, run:

```sh
git add .
git commit -m "commit message"
git push
```

## Create a DigitalOcean App

On the DigitalOcean website click on the **Create** button and select *Apps*.  Next select GitHub and authorize access to the correct repository. Next:

1. Select the branch.
2. (Optional) Select the source directory.
3. Choose whether or not to "Autodeploy" when an update is pushed to the GitHub repository.
4. Click the **Next** button.

### Connect an App to a database

On the DigitalOcean App Platform there is an option between a development or a managed (production) database. On the following screen:

1. click **add resource**,
2. select database, and click **Add**,
3. On the next screen select *dev database* and name the database. The default database name is "db" and that will be used in the subsequent sections.
4. Click the **Create and attach** button.
5. On the next screen click the **Next** button to set the environment variables.

### Add environment variables

In the DigitalOcean App Platform there are App and Component-level environment variables. Strapi applications in production need App-level variables to set the database connection, and can use either Component or App-level variables for secrets storage. The following procedure is to add the database variables at the App level and store the Strapi secrets at the Component level.

1. Add the following variables to the global environment table:

| Variable name     | Value          |
|-------------------|----------------|
| URL               | ${APP_URL}     |
| DATABASE_HOST     | ${db.HOSTNAME} |
| DATABASE_PORT     | ${db.PORT}     |
| DATABASE_NAME     | ${db.DATABASE} |
| DATABASE_USERNAME | ${db.USERNAME} |
| DATABASE_PASSWORD | ${db.PASSWORD} |
| NODE_ENV          | production     |

2. Click **Save**.
3. At the top of the *Settings* menu select your Strapi application component.
4. Scroll down to the *Environment Variables* and click **edit**.
5. Add the following key-value pairs to the component environment variables table:

| Variable name    | value                               |
|------------------|-------------------------------------|
| APP_KEYS         | "unique user-generated secret here" |
| API_TOKEN_SALT   | "unique user-generated secret here" |
| ADMIN_JWT_SECRET | "unique user-generated secret here" |
| JWT_SECRET       | "unique user-generated secret here" |

6. Click **Save**.

::: note
It is possible to copy the secrets from the local `.env` file or to generate new secrets using a random secret generator. Examples can be found at [Openssl](https://www.openssl.org/).
:::

## Deploy and access a Strapi application <!--revise this section-->

When the preceding steps are completed DigitalOcean should automatically try to build and deploy the application. The Strapi admin panel is accessed at `{your App domain}/admin` once the application is successfully deployed.

::: tip
If the build does not start, click the **Actions** button in the upper right and select *force rebuild and deploy*.
:::

## Add a managed database

DigitalOcean managed databases are a production-scale database solution for a deployed Strapi application. Switching from a development database to a managed database requires modifying the Strapi application and modifying the settings on DigitalOcean:

- removing the development database and database environment variables,
- installing the `pg-connection-string` dependency,
- changing the production `database` file,
- creating and attaching the database in the DigitalOcean platform.

### Modify the Strapi application

When a managed database is attached to a Strapi application, the connection parameters are passed directly from the database to the application `.yaml` file. This requires a modification to the `config/env/production/database` file and the addition of the `pg-connection-string` dependency.

To add the `pg-connection-string` dependency navigate to the project directory and run the following code snippet in a terminal:

<code-group>

<code-block title="NPM">
```sh
npm install pg-connection-string --save <!-- needed?-->
```
</code-block>

<code-block title="YARN">
```sh
yarn add pg-connection-string
```
</code-block>

</code-group>

To switch to a managed database change the `config/env/production/database` file to be able to parse the `DATABASE_URL` like the following example.

<code-group>

<code-block title='JAVASCRIPT'>

```jsx
// path: ./config/env/production/database.js

const parse = require("pg-connection-string").parse;

const { host, port, database, user, password } = parse(
  process.env.DATABASE_URL
);

module.exports = ({ env }) => ({
    client: 'postgres',
    connection: {
      host,
      port,
      database,
      user,
      password,
      ssl: {
        rejectUnauthorized: false,
      },
      debug: false,
  },
});

```

</code-block>

<code-block title='TYPESCRIPT'>

```jsx
//path: ./config/env/production/database.ts

const parse = require("pg-connection-string").parse;

const { host, port, database, user, password } = parse(
  process.env.DATABASE_URL
);

export default ({ env }) => ({
    client: 'postgres',
    connection: {
      host,
      port,
      database,
      user,
      password,
      ssl: {
        rejectUnauthorized: false,
      },
      debug: false,
  },
});

```

</code-block>
</code-group>

### Modify settings on DigitalOcean

1. Create a managed database.
2. Attach the managed database to the App.
3. Delete all database environment variables from the App.
4. Check the `.yaml` file for any remaining database environment variables.
5. (optional) If there are environment variables in the `.yaml` file, download the file, delete the environment variables and upload the edited file to DigitalOcean.

### Deploy the application to DigitalOcean

::: caution
The environmental variables for the development and managed database are handled differently by DigitalOcean. When connected to a managed database DigitalOcean passes the environmental variables automatically. Check the .yaml file to confirm the database settings are set at the top of the file and duplicated if using a managed database.
:::
<!--
## Optional Steps

### Connect to a storage service
 -->