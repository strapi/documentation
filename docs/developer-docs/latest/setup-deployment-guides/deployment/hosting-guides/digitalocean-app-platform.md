---
title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.html
---

# Deploy to the DigitalOcean App Platform

The purpose of this guide is to allow users to deploy Strapi applications on the DigitalOcean App Platform. This guide uses the PostgreSQL development database provided by DigitalOcean, so applications can be tested in a deployed environment. At the end of the guide there is information on how to connect a Strapi application to a DigitalOcean Managed Database. Additional information about [migrating local database content to a production database](https://docs.digitalocean.com/products/databases/postgresql/how-to/import-databases/) and other deployment topics are provided in the [DigitalOcean documentation](https://docs.digitalocean.com/).

::: caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please [open an issue on GitHub](https://github.com/strapi/documentation/issues) or [submit a pull request](https://github.com/strapi/documentation/pulls) to improve the documentation.
:::

## Prepare

Prior to starting the deployment process each user needs:

- a DigitalOcean account ([The Strapi referral link for DigitalOcean provides \$100 in credits.](https://try.digitalocean.com/strapi/)),
- a [GitHub account](https://github.com/join),
- [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an existing Strapi application.

## Setup a Strapi project for deployment

Strapi uses [environment configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

1. Add a production configuration environment by creating a sub-directory `./config/env/production`.
2. Create `database.js` (or `database.ts` for TypeScript projects) inside the `./config/env/production` directory.
3. Add the code snippet to the `database` configuration file:

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

4. Create `server.js` (or `server.ts` for TypeScript projects) inside the `./config/env/production` directory.
5. Add the code snippet to the `server` configuration file:

    <code-group>

    <code-block title='JAVASCRIPT'>

    ```jsx
    // path: ./config/env/production/server.js

    module.exports = ({ env }) => ({
        proxy: true,
        url: env('APP_URL'), // replaces `host` and `port` properties in the development environment
        app: { 
          keys: env.array('APP_KEYS')
        },
    });
    ```

    </code-block>

    <code-block title='TYPESCRIPT'>

    ```jsx
    // path: ./config/env/production/server.ts

    export default ({ env }) => ({
        proxy: true,
        url: env('APP_URL'), // replaces `host` and `port` properties in the development environment
        app: { 
          keys: env.array('APP_KEYS')
        },
    });
    ```

    </code-block>
    </code-group>

6. Add PostgreSQL dependencies by installing [`pg` package](https://www.npmjs.com/package/pg):

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

7. Save the Strapi application locally.
8. Commit the project to a remote repository:

    ```sh
    git add .
    git commit -m "commit message"
    git push
    ```

## Create and configure a DigitalOcean App 

Deploying on the DigitalOcean App Platform requires creating an App, connecting the App to a development database, and setting environment variables. At the end of the following steps a Strapi application should be successfully deployed.

### Create a DigitalOcean App

From the DigitalOcean website create and App and connect it to a GitHub repository:

1. Click on the **Create** button and select *Apps*.
2. Select GitHub and authorize access to the correct repository.
3. Select the branch.
4. (Optional) select the source directory.
5. Choose whether or not to "Autodeploy" when an update is pushed to the GitHub repository.
6. Click the **Next** button.

### Connect an App to a database

After creating an App attach a development database. To add a development database On the following screen:

1. Click **add resource**.
2. Select database and click **Add**.
3. Select *dev database* and name the database. The default database name is "db" and that will be used in the following example.
4. Click the **Create and attach** button.
5. Click the **Next** button to set the environment variables.

### Add environment variables

In the DigitalOcean App Platform there are App and Component-level environment variables. Strapi applications in production need App-level variables to set the database connection, and can use either Component or App-level variables for secrets storage. The following procedure is to add the database variables at the App level and store the Strapi secrets at the Component level.

1. Add the database, URL, and NODE_ENV variables to the global environment table:

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
3. Navigate to the *Settings* menu and select the Strapi application component.
4. Scroll to the *Environment Variables* and click **edit**.
5. Add the key-value pairs to the component environment variables table:

    | Variable name    | value                               |
    |------------------|-------------------------------------|
    | APP_KEYS         | "unique user-generated secrets here"|
    | API_TOKEN_SALT   | "unique user-generated secret here" |
    | ADMIN_JWT_SECRET | "unique user-generated secret here" |
    | JWT_SECRET       | "unique user-generated secret here" |

6. Click **Save**.

::: note
It is possible to copy the secrets from the local `.env` file or to generate new secrets using a random secret generator. Examples can be found at [Openssl](https://www.openssl.org/).
:::

## Deploy and access a Strapi application

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

To add the `pg-connection-string` dependency navigate to the project directory and install `pg-connection-string`:

<code-group>

<code-block title="NPM">
```sh
npm install pg-connection-string
```
</code-block>

<code-block title="YARN">
```sh
yarn add pg-connection-string
```
</code-block>

</code-group>

To switch to a managed database modify the `config/env/production/database` file to be able to parse the `DATABASE_URL`:

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
// path: ./config/env/production/database.ts

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
4. Build and deploy the App.

::: caution
The environmental variables for the development and managed database are handled differently by DigitalOcean. When connected to a managed database DigitalOcean passes the environmental variables automatically. If the App build fails due to database connection errors check the `.yaml` file to confirm the database settings are set at the top of the file and that there are no database environment variables in the file. If there are database environment variables, download the file, delete the environment variables and upload the edited file to DigitalOcean.
:::
