---
title: Heroku Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application on Heroku.
---

# Heroku

This is a step-by-step guide for deploying a Strapi project on [Heroku](https://www.heroku.com/). Databases that work well with Strapi and Heroku are provided instructions on how to get started.

### Heroku Install Requirements

- You must have [Git installed and set-up locally](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup).
- You must have a [free Heroku account](https://signup.heroku.com/) before doing these steps.

If you already have the Heroku CLI installed locally on your computer. Skip to [Login to Heroku](#_2-login-to-heroku-from-your-cli).

#### 1. Heroku CLI Installation

Download and install the `Heroku CLI` for your operating system:

:::: tabs

::: tab Ubuntu
Run the following from your terminal:

```bash
sudo snap install --classic heroku
```

:::

::: tab Mac
[Download the installer](https://cli-assets.heroku.com/heroku.pkg)

Also available via Homebrew:

```bash
brew tap heroku/brew && brew install heroku
```

:::

::: tab Windows
Download the appropriate installer for your Windows installation:

- [64-bit installer](https://cli-assets.heroku.com/heroku-x64.exe)
- [32-bit installer](https://cli-assets.heroku.com/heroku-x86.exe)
  :::

::::

#### 2. Login to Heroku from your CLI

Next, you need to login to Heroku from your computer.

```bash
heroku login
```

Follow the instructions and return to your command line.

#### 3. Create a new project (or use an existing one)

Create a [new Strapi project](/developer-docs/latest/getting-started/quick-start.md) (if you want to deploy an existing project go to step 4).

::: tip NOTE

If you plan to use **MongoDB** with your project, [refer to the create a Strapi project with MongoDB section of the documentation](/developer-docs/latest/setup-deployment-guides/configurations/databases/mongodb.md#install-mongodb-locally) then, jump to step 4.

:::

`Path: ./`

:::: tabs

::: tab yarn

Use **yarn** to install the Strapi project (**recommended**). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/)

```bash
yarn create strapi-app my-project --quickstart
```

:::

::: tab npx

Use **npm/npx** to install the Strapi project

```bash
npx create-strapi-app my-project --quickstart
```

:::

::::

::: tip
When you use `--quickstart` to create a Strapi project locally, a **SQLite database** is used which is not compatible with Heroku. Therefore, another database option [must be chosen](#_7-heroku-database-set-up).
:::

#### 4. Update `.gitignore`

Add the following line at end of `.gitignore`:

`Path: ./my-project/.gitignore`

```
package-lock.json
```

Even if it is usually recommended to version this file, it may create issues on Heroku.

#### 5. Init a Git repository and commit your project

Init the Git repository and commit your project.

`Path: ./my-project/`

```bash
cd my-project
git init
git add .
git commit -m "Initial Commit"
```

#### 6. Create a Heroku project

Create a new Heroku project.

`Path: ./my-project/`

```bash
heroku create
```

You can use `heroku create custom-project-name`, to have Heroku create a `custom-project-name.heroku.com` URL. Otherwise, Heroku will automatically generate a random project name (and URL) for you.

::: tip NOTE
If you have a Heroku project app already created. You would use the following step to initialize your local project folder:

`Path: ./my-project/`

```bash
heroku git:remote -a your-heroku-app-name
```

:::

Your local development environment is now set-up and configured to work with Heroku. You have a new Strapi project and a new Heroku app ready to be configured to work with a database and with each other.

#### 7. Heroku Database set-up

Below you will find database options when working with Heroku. Please choose the correct database (e.g. PostgreSQL, MongoDB, etc.) and follow those instructions.

:::: tabs

::: tab PostgreSQL

### Heroku Postgres

Follow these steps to deploy your Strapi app to Heroku using **PostgreSQL**:

#### 1. Install the [Heroku Postgres addon](https://elements.heroku.com/addons/heroku-postgresql) for using Postgres.

To make things even easier, Heroku provides a powerful addon system. In this section, you are going to use the Heroku Postgres addon, which provides a free "Hobby Dev" plan. If you plan to deploy your app in production, it is highly recommended switching to a paid plan.

`Path: ./my-project/`

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

#### 2. Retrieve database credentials

The add-on automatically exposes the database credentials into a single environment variable accessible by your app. To retrieve it, type:

`Path: ./my-project/`

```bash
heroku config
```

This should print something like this: `DATABASE_URL: postgres://ebitxebvixeeqd:dc59b16dedb3a1eef84d4999sb4baf@ec2-50-37-231-192.compute-2.amazonaws.com: 5432/d516fp1u21ph7b`.

(This url is read like so: \*postgres:// **USERNAME** : **PASSWORD** @ **HOST** : **PORT** : **DATABASE_NAME\***)

#### 3. Set Database variables automatically

Strapi expects a variable for each database connection configuration (host, username, etc.). So, from the url above, Strapi will deconstruct that environment variable using [pg-connection-string](https://www.npmjs.com/package/pg-connection-string) package. Heroku will sometimes change the above url, so it's best to automate the deconstruction of it, as Heroku will automatically update the `DATABASE_URL` environment variable.

Install the package:

With npm:

```bash
npm install pg-connection-string --save
```

With yarn:

```bash
yarn add pg-connection-string
```

#### 4. Create your Heroku database config file for production

Create new subfolders in `./config` like so: `/env/production`, then create a new `database.js` in it (see [environment documentation](/developer-docs/latest/setup-deployment-guides/configurations.md#environment)). Your path should look like this: `./config/env/production/database.js`. When you run locally you should be using the `./config/database.js` which could be set to use SQLite, however it's recommended you use PostgreSQL locally also, for information on configuring your local database, please see the [database documentation](/developer-docs/latest/setup-deployment-guides/configurations.md#database).

`Path: ./config/env/production/database.js`

```js
const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

module.exports = ({ env }) => ({
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
      options: {
        ssl: true,
      },
    },
  },
});
```

You also need to set the `NODE_ENV` variable on Heroku to `production` to ensure this new database configuration file is used.

```bash
heroku config:set NODE_ENV=production
```

#### 5. Create your Strapi server config for production

Create a new `server.js` in a new [env](/developer-docs/latest/setup-deployment-guides/configurations.md#environment) folder. In this file you only need one key, the `url`, to notify Strapi what our public Heroku domain is. All other settings will automatically be pulled from the default `./config/server.js`.

`Path: ./config/env/production/server.js`

```js
module.exports = ({ env }) => ({
  url: env('MY_HEROKU_URL'),
});
```

You will also need to set the environment variable in Heroku for the `MY_HEROKU_URL`. This will populate the variable with something like `https://your-app.herokuapp.com`.

```bash
heroku config:set MY_HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)
```

#### 6. Install the `pg` node module

Unless you originally installed Strapi with PostgreSQL, you need to install the [pg](https://www.npmjs.com/package/pg) node module.

`Path: ./my-project/`

```bash
npm install pg --save
```

:::

::: tab MongoDB

### MongoDB Atlas

(Using Strapi and MongoDB requires different set-up and different configuration steps. You cannot use `--quickstart` to develop a `MongoDB` Strapi project.)

Please follow these steps the **deploy a Strapi app with MongoDB on Heroku**.

You must have completed the [steps to use Strapi with MongoDB Atlas](/developer-docs/latest/setup-deployment-guides/configurations/databases/mongodb.md#install-on-atlas-mongodb-atlas) - through **4. Retrieve database credentials**.

#### 1. Set environment variables

When you [set-up your MongoDB Atlas database](/developer-docs/latest/setup-deployment-guides/configurations/databases/mongodb.md#install-on-atlas-mongodb-atlas) you noted a connection string. Similar to this:

```bash
mongodb://paulbocuse:<password>@strapidatabase-shard-00-00-fxxx6c.mongodb.net:27017,strapidatabase-shard-00-01-fxxxc.mongodb.net:27017,strapidatabase-shard-00-02-fxxxc.mongodb.net:27017/test?ssl=true&replicaSet=strapidatabase-shard-0&authSource=admin&retryWrites=true&w=majority

```

So, from **MongoDB Atlas**, you have to set two environment variables in the Heroku config (for **DATABASE_URI** and **DATABASE_NAME**). Set the environment variables using the following commands:

```bash
heroku config:set DATABASE_URI="mongodb://paulbocuse:<password>@strapidatabase-shard-00-00-fxxx6c.mongodb.net:27017,strapidatabase-shard-00-01-fxxxc.mongodb.net:27017,strapidatabase-shard-00-02-fxxxc.mongodb.net:27017/test?ssl=true&replicaSet=strapidatabase-shard-0&authSource=admin&retryWrites=true&w=majority"
heroku config:set DATABASE_NAME="my-database-name"
```

Please replace the `<password>` and `my-database-name` values with the your actual values.

#### 2. Update your database config file

`Path: ./config/database.js`.

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        uri: env('DATABASE_URI'),
      },
      options: {
        ssl: true,
      },
    },
  },
});
```

If you need to configure the connection differently (e.g using `host`,`port`...) you should set the default database config like so:

`Path: ./config/database.js`.

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {},
      options: {},
    },
  },
});
```

Then set the development and the production configurations separately:

`Path: ./config/env/development/database.js`.

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT'),
        database: env('DATABASE_NAME'),
        username: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
      },
      options: {},
    },
  },
});
```

and finally for the `production` env:

`Path: ./config/env/production/database.js`.

```js
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        uri: env('DATABASE_URI'),
      },
      options: {
        ssl: true,
      },
    },
  },
});
```

:::

::::

#### 8. Commit your changes

`Path: ./my-project/`

```bash
git add .
git commit -m "Update database config"
```

#### 9. Update Yarn lockfile

`Path: ./my-project/`

```bash
yarn install
```

#### 10. Commit your changes

`Path: ./my-project/`

```bash
git add yarn.lock
git commit -m "Updated Yarn lockfile"
```

#### 11. Deploy

`Path: ./my-project/`

```bash
git push heroku HEAD:main
```

The deployment may take a few minutes. At the end, logs will display the url of your project (e.g. `https://mighty-taiga-80884.herokuapp.com`). You can also open your project using the command line:

`Path: ./my-project/`

```bash
heroku open
```

If you see the Strapi Welcome page, you have correctly set-up, configured and deployed your Strapi project on Heroku. You will now need to set-up your `admin user` as the production database is brand-new (and empty).

You can now continue with the [Tutorial - Creating an Admin User](/developer-docs/latest/getting-started/quick-start.md#_2-create-an-administrator-user), if you have any questions on how to proceed.

::: warning
For security reasons, the Content Type Builder plugin is disabled in production. To update content structure, please make your changes locally and deploy again.
:::

### Project updates

When Strapi is deployed to Heroku, Heroku sets the environment variable to `NODE_ENV=production`. In `production mode` Strapi disables the content-type builder (for security reasons). Additionally, if you wanted to change the default production mode in Heroku, it wouldn't work as the file system is temporary. Strapi writes files to the server when you update the content-types and these updates would disappear when Heroku restarts the server.

Therefore, modifications that require writing to model creation or other json files, e.g. creating or changing content-types, require that you make those changes on your dev environment and then push the changes to Heroku.

As you continue developing your application with Strapi, you may want to use [version control](https://devcenter.heroku.com/articles/github-integration), or you can continue to use `git push heroku HEAD:main` to commit and push changes to Heroku directly.

`Path: ./my-project/`

```bash
git add .
git commit -am "Changes to my-project noted"
git push heroku HEAD:main
heroku open
```

### File Uploads

Like with project updates on Heroku, the file system doesn't support local uploading of files as they will be wiped when Heroku "Cycles" the dyno. This type of file system is called [ephemeral](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), which means the file system only lasts until the dyno is restarted (with Heroku this happens any time you redeploy or during their regular restart which can happen every few hours or every day).

Due to Heroku's filesystem you will need to use an upload provider such as AWS S3, Cloudinary, or Rackspace. You can view the documentation for installing providers [here](/developer-docs/latest/development/plugins/upload.md#create-providers) and you can see a list of providers from both Strapi and the community on [npmjs.com](https://www.npmjs.com/search?q=strapi-provider-upload-&page=0&perPage=20).

### Gzip

As of version `3.2.1`, Strapi uses [`koa-compress`](https://github.com/koajs/compress) v5, which enables [Brotli](https://en.wikipedia.org/wiki/Brotli) compression by default. At the time of writing, the default configuration for Brotli results in poor performance, causing very slow response times and potentially response timeouts. If you plan on enabling the [gzip middleware](/developer-docs/latest/setup-deployment-guides/configurations.md#core-middleware-configurations), it is recommended that you disable Brotli or define better configuration params.

To disable Brotli, provide the following configuration in `config/middleware.js`.

```jsonify
gzip: {
  enabled: true,
  options: {
    br: false
  }
},
```

For more on Brotli configuration for `koa-compress`, reference [this issue](https://github.com/koajs/compress/issues/121).
