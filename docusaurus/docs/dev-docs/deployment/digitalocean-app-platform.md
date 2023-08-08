---
title: DigitalOcean App Platform
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
displayed_sidebar: devDocsSidebar

---

import ConsiderStrapiCloud from '/docs/snippets/consider-strapi-cloud.md'

# Deploy to the DigitalOcean App Platform

The purpose of this guide is to allow users to deploy Strapi applications on the DigitalOcean App Platform. This guide uses the PostgreSQL development database provided by DigitalOcean, so applications can be tested in a deployed environment. At the end of the guide there is information on how to connect a Strapi application to a DigitalOcean Managed Database. Additional information about [migrating local database content to a production database](https://docs.digitalocean.com/products/databases/postgresql/how-to/import-databases/) and other deployment topics are provided in the [DigitalOcean documentation](https://docs.digitalocean.com/).

:::caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please [open an issue on GitHub](https://github.com/strapi/documentation/issues) or [submit a pull request](https://github.com/strapi/documentation/pulls) to improve the documentation.
:::

<ConsiderStrapiCloud />

## Prepare the deployment

Prior to starting the deployment process each user needs:

- a DigitalOcean account ([The Strapi referral link for DigitalOcean provides $200 in credits.](https://try.digitalocean.com/strapi/)),
- a [GitHub account](https://github.com/join) and [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an existing Strapi application.

## Setup a Strapi project for deployment

Strapi uses [environment configurations](/dev-docs/configurations/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

1. Add a production configuration environment by creating a sub-directory `./config/env/production`.
2. Create `database.js` inside the `./config/env/production` directory.
3. Add the code snippet to the `database` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/env/production/database.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/env/production/database.ts"

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

</TabItem>

</Tabs>

4. Create `server.js` inside the `./config/env/production` directory.
5. Add the code snippet to the `server` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/env/production/server.js"

    module.exports = ({ env }) => ({
        proxy: true,
        url: env('APP_URL'), // Sets the public URL of the application.
        app: { 
          keys: env.array('APP_KEYS')
        },
    });
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/env/production/server.ts"

export default ({ env }) => ({
        proxy: true,
        url: env('APP_URL'), // Sets the public URL of the application.
        app: { 
          keys: env.array('APP_KEYS')
        },
    });
```

</TabItem>

</Tabs>

6. Add PostgreSQL dependencies by installing [`pg` package](https://www.npmjs.com/package/pg):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add pg
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install pg
```

</TabItem>

</Tabs>

7. Verify that all of the new and modified files are saved locally.
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
4. (optional) Select the source directory.
5. Choose whether or not to "Autodeploy" when an update is pushed to the GitHub repository.
6. Click the **Next** button.

### Connect an App to a database

After creating an App attach a development database. To add a development database on the following screen:

1. Click **Add Resource**.
2. Select *Database* and click **Add**.
3. Select *Dev Database* and name the database. The default database name is "db" and is used to prefix the database values in the [global environment table](#add-environment-variables). If another database name is used, it should be substituted for "db".
4. Click the **Create and Attach** button.
5. Click the **Next** button to set the Environment Variables (Env Vars).

### Add environment variables

In the DigitalOcean App Platform there are Global and Component-level environment variables. Strapi applications in production need Global-level variables to set the database connection, and can use either Component or Global-level variables for secrets storage. The following procedure is to add the database variables at the Global level and store the Strapi secrets at the Component level.

1. Add the database, URL, and NODE_ENV variables to the global environment table:

    | Variable name       | Value            |
    |---------------------|------------------|
    | `APP_URL`           | `${APP_URL}`     |
    | `DATABASE_HOST`     | `${db.HOSTNAME}` |
    | `DATABASE_PORT`     | `${db.PORT}`     |
    | `DATABASE_NAME`     | `${db.DATABASE}` |
    | `DATABASE_USERNAME` | `${db.USERNAME}` |
    | `DATABASE_PASSWORD` | `${db.PASSWORD}` |
    | `NODE_ENV`          | `production`     |

    :::tip
    You can use the **Bulk Editor** button in the App Platform to add the preceding variables by copying and pasting the following code block:

    ```bash
    APP_URL=${APP_URL}
    DATABASE_HOST=${db.HOSTNAME}
    DATABASE_PORT=${db.PORT}
    DATABASE_NAME=${db.DATABASE}
    DATABASE_USERNAME=${db.USERNAME}
    DATABASE_PASSWORD=${db.PASSWORD}
    NODE_ENV=production
    ```

    :::
2. Add the key-value pairs for the Strapi secrets to the component environment variables table:

    | Variable name                     | value                                 |
    |-----------------------------------|---------------------------------------|
    | `APP_KEYS`                        | `"unique user-generated secrets here"`|
    | `API_TOKEN_SALT`                  | `"unique user-generated secret here"` |
    | `ADMIN_JWT_SECRET`                | `"unique user-generated secret here"` |
    | `JWT_SECRET`                      | `"unique user-generated secret here"` |
    | (optional)`TRANSFER_TOKEN_SALT`   | `"unique user-generated secret here"` |

3. Click **Next**.

:::note
It is possible to copy the secrets from the local `.env` file or to generate new secrets using a random secret generator. Examples can be found at [OpenSSL](https://www.openssl.org/).
:::

4. (optional) Edit the App name and Region and click **Save**
5. Click **Next**.
6. Click **Create Resources** to create the App and database.

## Deploy and access a Strapi application

When the preceding steps are completed DigitalOcean should automatically try to build and deploy the application. The Strapi admin panel is accessed at `{your App domain}/admin` once the application is successfully deployed.

:::tip
If the build does not start, click the **Actions** button and select *force rebuild and deploy*.
:::

## Add a managed database

DigitalOcean managed databases are a production-scale database solution for a deployed Strapi application. Switching from a development database to a managed database requires modifying the Strapi application and modifying the settings on DigitalOcean:

- removing the development database and database environment variables,
- installing the `pg-connection-string` dependency,
- changing the production `database` configuration file,
- creating and attaching the database in the DigitalOcean platform.

### Modify the Strapi application

When a managed database is attached to a Strapi application, the connection parameters are passed directly from the database to the application `.yaml` file (*App Spec* in the DigitalOcean settings). This requires a modification to the `config/env/production/database` file and the addition of the `pg-connection-string` dependency.

To add the `pg-connection-string` dependency navigate to the project directory and install `pg-connection-string`:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add pg-connection-string
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install pg-connection-string
```

</TabItem>

</Tabs>

To switch to a managed database modify the `config/env/production/database` file to be able to parse the `DATABASE_URL`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/env/production/database.js"

const parse = require("pg-connection-string").parse;

const { host, port, database, user, password } = parse(
  process.env.DATABASE_URL
);

module.exports = ({ env }) => ({
  connection: {  
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
    },
      debug: false,
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/env/production/database.ts"

const parse = require("pg-connection-string").parse;

const { host, port, database, user, password } = parse(
  process.env.DATABASE_URL
);

export default ({ env }) => ({
  connection: {  
    client: 'postgres',
    connection: {
      host,
      port,
      database,
      user,
      password,
      ssl: {
        ca: env('DATABASE_CA'),
      },
    },
      debug: false,
  },
});

```

</TabItem>

</Tabs>

### Create a managed database on DigitalOcean

Changing the settings on the DigitalOcean App Platform to incorporate a managed database requires creating and attaching the database to an existing Strapi application. Additionally, the database environment variables must be removed, as managed databases propagate the connection properties automatically.  

1. Click on the **Create** button from any DigitalOcean page and select *Databases*.
2. Select a location (use the same location as the application location).
3. Select the PostgreSQL database engine.
4. Select a database configuration.
5. Click the **Create a Database Cluster** button.

### Attach the managed database to an App

After creating the managed database, navigate to the application page:

1. Click on the **Create** button and select *Create/Attach Database*.
2. Select *Previously Created DigitalOcean Database*.
3. Use the picklist to select the previously created database.
4. Click **Attach Database**.

### Configure environment variables for production-ready managed database

Remove the previously added 'DATABASE_*' global variables added for connecting to the dev database, then set the following environment variables, inserting your database name (e.g. `db-postgresql-nyc3-1234`) in place of `dbClusterName`:

  | Variable name       | Value                          |
  |---------------------|--------------------------------|
  | `DATABASE_URL`      | `${dbClusterName.DATABASE_URL}`|
  | `DATABASE_CA`       | `${dbClusterName.CA_CERT}`     |

After attaching the database, DigitalOcean will attempt to auto-deploy the application. If the deployment is successful a link to the application will be provided at the top of the application page.

:::caution
The environmental variables for the development and managed database are handled differently by DigitalOcean. When connected to a managed database DigitalOcean passes the environmental variables automatically. If the App build fails due to database connection errors check the `.yaml` file (*App Spec* in the DigitalOcean Settings) to confirm the database settings are set at the top of the file and that there are no database environment variables in the file. If there are database environment variables, download the file, delete the environment variables and upload the edited file to DigitalOcean.
:::
