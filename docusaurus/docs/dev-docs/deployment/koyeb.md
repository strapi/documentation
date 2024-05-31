---
title: Koyeb
description: Learn in this guide how to deploy your Strapi application on Koyeb.
displayed_sidebar: devDocsSidebar

---

import ConsiderStrapiCloud from '/docs/snippets/consider-strapi-cloud.md'

# Deploy to Koyeb

The purpose of this guide is to allow users to deploy Strapi applications on Koyeb. This guide uses the Koyeb CLI tool with a PostgreSQL database provided by Koyeb.

:::caution

- The Content-type Builder is disabled in production. See the documentation [FAQ for PaaS](/dev-docs/faq#why-are-my-application-s-database-and-uploads-resetting-on-paas) and the [FAQ for content-types in production](/dev-docs/faq#why-can-t-i-create-or-update-content-types-in-production-staging) for more information. Changes to the content structure should be developed locally and then deployed to production.

- Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please [open an issue on GitHub](https://github.com/strapi/documentation/issues) or [submit a pull request](https://github.com/strapi/documentation/pulls) to improve the documentation.

:::

Prior to starting the deployment process, each user needs:

- a [Koyeb account](https://app.koyeb.com/auth/signup),
- [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an Amazon S3-compatible object storage provider,
- an existing Strapi application.

<ConsiderStrapiCloud />

## Setup a Strapi project for deployment

Strapi uses [environment configurations](/dev-docs/configurations/environment) to maintain multiple environments inside a single application. This section describes how to set up a production environment in a Strapi application.

1. Add a production configuration environment by creating a sub-directory `./config/env/production`.
2. Create `plugins.js` inside the `./config/env/production` directory.
3. Add the following code snippet to the `plugins` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
// path: ./config/env/production/plugins.js

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_ACCESS_SECRET'),
          },
          region: env('S3_REGION'),
          endpoint: 'https://' + env('S3_ENDPOINT'),
          params: {
            ACL: 'private',
            Bucket: env('S3_BUCKET'),
          },
        },
      },
    },
  },
})

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
// path: ./config/env/production/plugins.ts

export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_ACCESS_SECRET'),
          },
          region: env('S3_REGION'),
          endpoint: 'https://' + env('S3_ENDPOINT'),
          params: {
            ACL: 'private',
            Bucket: env('S3_BUCKET'),
          },
        },
      },
    },
  },
})

```

</TabItem>

</Tabs>

4. Create `middlewares.js` inside the `./config/env/production` directory.
5. Add the following code snippet to the `middlewares` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
// path: ./config/env/production/middlewares.js

module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            env('S3_BUCKET') + '.' + env('S3_ENDPOINT'),
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            env('S3_BUCKET') + '.' + env('S3_ENDPOINT'),
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
// path: ./config/env/production/middlewares.ts

export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            env('S3_BUCKET') + '.' + env('S3_ENDPOINT'),
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            env('S3_BUCKET') + '.' + env('S3_ENDPOINT'),
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]

```

</TabItem>

</Tabs>

6. Add PostgreSQL and object storage dependencies by installing [`pg` package](https://www.npmjs.com/package/pg) and [`@strapi/provider-upload-aws-s3` package](https://www.npmjs.com/package/@strapi/provider-upload-aws-s3):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add pg @strapi/provider-upload-aws-s3
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install pg @strapi/provider-upload-aws-s3
```

</TabItem>

</Tabs>

7. Verify that all of the new and modified files are saved locally.

8. Commit the project to a local repository:

  ```sh
  git add :/
  git commit -m "commit message"
  ```

9. [Create a GitHub repository](https://github.com/new) for the Strapi project and push it to GitHub:

  ```sh
  git remote add origin git@github.com:<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
  git branch -M main
  git push -u origin main
  ```

## Create and configure a Koyeb database and App

Deploying to Koyeb requires creating database and deploying an App with the required environment variables. At the end of the following steps, a Strapi application should be successfully deployed.

### Create a Koyeb database

From the Koyeb control panel, create a new PostgreSQL database:

1. Click **Create Database Service**.
2. Name the database.
3. Select the *Region* to deploy to.
4. Select the database *Engine* (PostgreSQL version).
5. Set or use the pre-populated "koyeb-adm" for the *Default role* name. 
6. Choose a database *Size*.
7. Click **Create Database Service**.
8. On the *Connection Details* tab, click the **copy icon** to copy the `psql` connection string for later.

### Create a Koyeb App

From the Koyeb control panel, create a new App for Strapi:

1. Click **Create Web Service**.
2. Select **GitHub** as the deployment method.
3. Select your Strapi project repository.
4. Open the *Environment variables* section and click **Bulk edit** to open the environment variables bulk editor.
5. Paste the following block in the *Variables* field:

  ```sh
  HOST=0.0.0.0
  NODE_ENV=production
  DATABASE_CLIENT=postgres
  DATABASE_URL=
  S3_ENDPOINT=
  S3_REGION=
  S3_BUCKET=
  S3_ACCESS_KEY_ID=
  S3_ACCESS_SECRET=
  APP_KEYS=
  API_TOKEN_SALT=
  JWT_SECRET=
  ADMIN_JWT_SECRET=
  TRANSFER_TOKEN_SALT=
  ```

6. Fill in the variable values using the following details:

| Variable name         | value                                                                                                       |
|-----------------------|-------------------------------------------------------------------------------------------------------------|
| `HOST`                | `0.0.0.0`                                                                                                   |
| `NODE_ENV`            | `production`                                                                                                |
| `DATABASE_CLIENT`     | `postgres`                                                                                                  |
| `DATABASE_URL`        | The PostgreSQL connection string copied from the database page with `?sslmode=require` appended to the end. |
| `APP_KEYS`            | Copied from the Strapi `.env` file or generated with `openssl rand -base64 32`.                             |
| `API_TOKEN_SALT`      | Copied from the Strapi `.env` file or generated with `openssl rand -base64 32`.                             |
| `JWT_SECRET`          | Copied from the Strapi `.env` file or generated with `openssl rand -base64 32`.                             |
| `ADMIN_JWT_SECRET`    | Copied from the Strapi `.env` file or generated with `openssl rand -base64 32`.                             |
| `TRANSFER_TOKEN_SALT` | Copied from the Strapi `.env` file or generated with `openssl rand -base64 32`.                             |
| `S3_ENDPOINT`         | The endpoint for the S3-compatible object storage provider.                                                 |
| `S3_REGION`           | The S3-compatible object storage provider region. This is often a component of the `S3_ENDPOINT` domain.    |
| `S3_BUCKET`           | The S3-compatible object storage bucket name.                                                               |
| `S3_ACCESS_KEY_ID`    | The key ID to authenticate to the S3-compatible object storage provider.                                    |
| `S3_ACCESS_SECRET`    | The secret key to authenticate to the S3-compatible object storage provider.                                |

7. Open the *Instance* section, select the *Eco* tab, and choose **eMedium** or larger.
8. Click **Deploy**.

## Update your project

Modifications that require writing to model creation or other JSON files, such as creating or changing content types, require making those changes on the local development environment and then pushing the changes to Koyeb. See the documentation [FAQ for PaaS](/dev-docs/faq#why-are-my-application-s-database-and-uploads-resetting-on-paas) and the [FAQ for content-types in production](/dev-docs/faq#why-can-t-i-create-or-update-content-types-in-production-staging) for more information.

To make these types of changes, modify the local Strapi project in development mode and then commit and push the changes to GitHub:

```bash
git add :/
git commit -am "Changes to my-project noted"
git push origin main
```

Koyeb will automatically redeploy the Strapi application when changes are detected.  Once the deployment is healthy, it will replace the previous application instance.
