---
title: Heroku
description: Learn in this guide how to deploy your Strapi application on Heroku.
displayed_sidebar: devDocsSidebar
tags:
- deployment 
- project creation
- guides
---

import ConsiderStrapiCloud from '/docs/snippets/consider-strapi-cloud.md'
import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Deploy Strapi to Heroku

<NotV5 />

The purpose of this guide is to allow users to deploy Strapi applications on Heroku. This guide uses the Heroku CLI tool with a PostgreSQL database provided by Heroku. There are other options for how to deploy to Heroku available in the [Heroku documentation](https://devcenter.heroku.com/categories/data-management).

:::caution

- The Content-type Builder is disabled in production. See the documentation [FAQ for PaaS](/dev-docs/faq#why-are-my-applications-database-and-uploads-resetting-on-paas-type-services) and the [FAQ for content-types in production](/dev-docs/faq#why-cant-i-create-or-update-content-types-in-productionstaging) for more information. Changes to the content structure should be developed locally and then deployed to production.

- Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to Strapi and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please [open an issue on GitHub](https://github.com/strapi/documentation/issues) or [submit a pull request](https://github.com/strapi/documentation/pulls) to improve the documentation.

:::

Prior to starting the deployment process, each user needs:

- a [Heroku account](https://signup.heroku.com/),
- [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an existing Strapi application.

<ConsiderStrapiCloud />

## Setup a Strapi project for deployment

Strapi uses [environment configurations](/dev-docs/configurations/environment) to maintain multiple environments inside a single application. This section describes how to set up a production environment in a Strapi application.

1. Add a production configuration environment by creating a sub-directory `./config/env/production`.
2. Create `database.js` inside the `./config/env/production` directory.
3. Add the following code snippet to the `database` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
// path: ./config/env/production/database.js

const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  const { host, port, database, user, password } = parse(env("DATABASE_URL"));
  
  return {
    connection: {
      client: 'postgres',
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: { rejectUnauthorized: false },
      },
      debug: false,
    },
  }
};

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
// path: ./config/env/production/database.ts

import { parse } from 'pg-connection-string';
const config = parse(process.env.DATABASE_URL);

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: {
        rejectUnauthorized: false
      },
    },
    debug: false,
  },
});
```

</TabItem>

</Tabs>

4. Create `server.js` inside the `./config/env/production` directory.
5. Add the following code snippet to the `server` configuration file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
// Path: ./config/env/production/server.js
// starting from Strapi v 4.6.1 server.js has to be the following

module.exports = ({ env }) => ({
  proxy: true,
  host: "0.0.0.0",
  port: process.env.PORT,
  url: env('MY_HEROKU_URL'),
  app: { 
    keys: env.array('APP_KEYS')
  },
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },
})

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
// Path: ./config/env/production/server.js`
export default ({ env }) => ({
        proxy: true,
        url: env('MY_HEROKU_URL'), // Sets the public URL of the application.
        app: { 
          keys: env.array('APP_KEYS')
        },
    });
```

</TabItem>

</Tabs>

6. Add PostgreSQL dependencies by installing [`pg` package](https://www.npmjs.com/package/pg) and [`pg-connection-string` package](https://www.npmjs.com/package/pg-connection-string):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn add pg && yarn add pg-connection-string
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm install pg && npm install pg-connection-string
```

</TabItem>

</Tabs>

7. Add `package-lock.json` to the end of the `.gitignore` file at the root of the Strapi project:

  ```sh
  # path: ./.gitignore
  package-lock.json
  ```

  :::info
  It is usually recommended to version the `package-lock.json` file, but it might cause issues on Heroku.
  :::

8. Verify that all of the new and modified files are saved locally.

9. Commit the project to a local repository:

  ```sh
  git init
  git add .
  git commit -m "commit message"
  ```

## Create and configure a Heroku App

Deploying to Heroku requires installing the CLI tool, creating an App, connecting the App to a database, and setting environment variables. At the end of the following steps, a Strapi application should be successfully deployed.

### Install and use the Heroku CLI

1. Use the following OS-specific installation instructions to install the Heroku CLI tool:
  
<Tabs>

<TabItem value="Ubuntu" label="Ubuntu">
Run the following from a terminal:

```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

</TabItem>

<TabItem value="Mac" label="Mac">

[Download the installer](https://cli-assets.heroku.com/heroku.pkg),

or install via Homebrew:

```bash
brew tap heroku/brew && brew install heroku
```

</TabItem>

<TabItem value="Windows" label="Windows">

Download the appropriate installer for a Windows installation:

- [64-bit installer](https://cli-assets.heroku.com/heroku-x64.exe)
- [32-bit installer](https://cli-assets.heroku.com/heroku-x86.exe)

</TabItem>
</Tabs>

2. Login to Heroku from the CLI, following the command-line instructions:

  ```bash
  heroku login
  ```

### Create a Heroku project

Create a new Heroku project by running the following command in the root directory of the Strapi project:

```bash
# path: ./my-project/
heroku create
```

:::tip
The command `heroku create custom-project-name`, creates the `custom-project-name.heroku.com` URL. Otherwise, Heroku automatically generates a random project name (and URL).
:::

To initialize a local project folder with an existing Heroku project use the following command:

```bash
# path: ./my-project/
heroku git:remote -a your-heroku-app-name
```

The local development environment is now set up and configured to work with Heroku.

### Create a Heroku database

The following command creates and connects a PostgreSQL database with the Heroku project. Consult the [Heroku documentation](https://devcenter.heroku.com/articles/heroku-postgresql) for database plan names and costs.

```bash
# path: ./my-project/
heroku addons:create heroku-postgresql:<PLAN_NAME>
```

The database credentials are stored as a `string` with the config variable name `DATABASE_URL`. The database credentials can be retrieved using the following command in the terminal:

```bash
# path: ./my-project/
heroku config
```

The command output has the form `DATABASE_URL: postgres://ebitxebvixeeqd:dc59b16dedb3a1eef84d4999sb4baf@ec2-50-37-231-192.compute-2.amazonaws.com: 5432/d516fp1u21ph7b`. The string has the structure `postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`

### Populate the environment variables

Strapi requires the following environment variables to be set for the remote instance:

- `NODE_ENV`,
- `MY_HEROKU_URL`,
- `JWT_SECRET`,
- `ADMIN_JWT_SECRET`,
- `API_TOKEN_SALT`,
- `APP_KEYS`.

The following tabs detail how to either set new values for the secrets or transfer the values from the local `.env` file. Creating new values is the best practice.

<Tabs>

<TabItem value="new" label="Set new secrets (Mac and Linux)">

The following `openssl` commands generate random new secrets (Mac and Linux only) and set the config values:

```bash
heroku config:set APP_KEYS=$(openssl rand -base64 32)
heroku config:set API_TOKEN_SALT=$(openssl rand -base64 32)
heroku config:set ADMIN_JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set MY_HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)
heroku config:set NODE_ENV=production
```

</TabItem>

<TabItem value="transfer" label="Transfer existing secrets (Mac and Linux)">

The following commands transfer the local secrets in the `.env` file to the remote instance:

```bash
heroku config:set APP_KEYS=$(cat .env | grep APP_KEYS | cut -d= -f2-)
heroku config:set API_TOKEN_SALT=$(cat .env | grep API_TOKEN_SALT | cut -d= -f2)
heroku config:set ADMIN_JWT_SECRET=$(cat .env | grep ADMIN_JWT_SECRET | cut -d= -f2)
heroku config:set JWT_SECRET=$(cat .env | grep -w JWT_SECRET | cut -d= -f2)
heroku config:set MY_HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)
heroku config:set NODE_ENV=production
```

</TabItem>
</Tabs>

:::tip
On Windows, secrets can be generated manually by running `node -p "require('crypto').randomBytes(48).toString('base64');"` and subsequently set on Heroku using the command `heroku config:set SECRET_NAME=your-key-here` for each variable.
:::

### Deploy an application to Heroku

In the project root directory run the `git push heroku HEAD:main` CLI command to push the project to the Heroku server:

```bash
# path: ./my-project/`
git push heroku HEAD:main
```

The deployment may take a few minutes. At the end, logs will display the URL of the project (e.g. `https://mighty-taiga-80884.herokuapp.com`). The project can also be opened from the command line:

```bash
# path: ./my-project/`
heroku open
```

The Strapi Welcome page indicates that the project is correctly set up, configured, and deployed on Heroku. Next, set up an `admin user` as the production database is brand-new and empty. Add `/admin` to the end of the website address to access the signup page.

## Update your project

Modifications that require writing to model creation or other JSON files, such as creating or changing content types, require making those changes on the local development environment and then pushing the changes to Heroku. See the documentation [FAQ for PaaS](/dev-docs/faq#why-are-my-applications-database-and-uploads-resetting-on-paas-type-services) and the [FAQ for content-types in production](/dev-docs/faq#why-cant-i-create-or-update-content-types-in-productionstaging) for more information.

Further development can benefit from [version control](https://devcenter.heroku.com/articles/github-integration), or continue  using `git push heroku HEAD:main` to commit and push changes to Heroku directly.

`Path: ./my-project/`

```bash
git add .
git commit -am "Changes to my-project noted"
git push heroku HEAD:main
heroku open
```

:::tip
If you encounter the error `'heroku' does not appear to be a git repository` when running `git push`, run the following command: `heroku git:remote -a your-app-name`.
:::

## Upload Files

Like with project updates on Heroku, the file system doesn't support local uploading of files as they are deleted when Heroku "cycles" the dyno. This type of file system is called [ephemeral](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), which means the file system only lasts until the dyno is restarted (with Heroku this happens any time the application is redeployed or during the regular restart which can happen every few hours or every day).

Due to Heroku's filesystem, an upload provider such as AWS S3 or Cloudinary is required. Additional details are available in the [installing providers documentation](/dev-docs/providers). The [Strapi Market](https://market.strapi.io/providers) contains providers from both Strapi and the community. Additional community providers are available from [npmjs.com](https://www.npmjs.com/search?q=strapi-provider-upload-&page=0&perPage=20).
