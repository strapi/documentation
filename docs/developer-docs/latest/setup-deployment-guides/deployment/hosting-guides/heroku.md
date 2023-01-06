---
title: Heroku Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on Heroku.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/heroku.html
---

# Deploy to Heroku

The purpose of this guide is to allow users to deploy Strapi applications on Heroku. This guide uses the Heroku CLI tool with a PostgreSQL database provided by Heroku. There are other options for how to deploy to Heroku available in the [Heroku documentation](link here).

::: caution
For security reasons, the Content-type Builder is disabled in production. Changes to the content structure should be developed locally and then deployed to production.
:::

## Prepare the deployment

Prior  to starting the deployment process each user needs:

- a [Heroku account](https://signup.heroku.com/),
- [Git version control](https://docs.github.com/en/get-started/quickstart/set-up-git),
- an existing Strapi application.


## Setup a Strapi project for deployment

Strapi uses [environment configurations](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

1. Add a production configuration environment by creating a sub-directory `./config/env/production`.
2. Create `database.js` inside the `./config/env/production` directory.
3. Add the following code snippet to the `database` configuration file:

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/env/production/database.js

const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

module.exports = ({ env }) => ({
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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/env/production/database.ts

import parse = require('pg-connection-string').parse;
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

</code-block>
</code-group>

4. Create `server.js` inside the `./config/env/production` directory.
5. Add the code snippet to the `server` configuration file:

<code-group>

<code-block title="JAVASCRIPT">

```js
// Path: ./config/env/production/server.js

module.exports = ({ env }) => ({
        proxy: true,
        url: env('APP_URL'), // replaces `host` and `port` properties in the development environment
        app: { 
          keys: env.array('APP_KEYS')
        },
    });

```

</code-block>

<code-block title="TYPESCRIPT">


```ts
// Path: ./config/env/production/server.js`
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

6. Add PostgreSQL dependencies by installing [`pg` package](https://www.npmjs.com/package/pg) and [`pg-connection-string` package](https://www.npmjs.com/package/pg-connection-string):

    <code-group>

    <code-block title="NPM">
    ```sh
    npm install pg && npm install pg-connection-string
    ```
    </code-block>

    <code-block title="YARN">
    ```sh
    yarn add pg && yarn add pg-connection-string
    ```
    </code-block>

    </code-group>

7. Verify that all of the new and modified files are saved locally.
8. Commit the project to a local repository:

    ```sh
    git init
    git add .
    git commit -m "commit message"
    ```


## Create and configure a Heroku App

Deploying to Heroku requires installing the CLI tool, creating an App, connecting the App to a database, and setting environment variables. At the end of the following steps a Strapi application should be successfully deployed.

### Install and use the Heroku CLI

1. Use the following OS-specific installation instructions to install the Heroku CLI tool:

      :::: tabs card

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

2. Login to Heroku from your CLI, following the command-line instructions:


    ```bash
    heroku login
    ```

3. Add `package.json` to the end of the `.gitignore` file at the root of your Strapi project:

      ```sh
      # path: ./.gitignore
      package-lock.json
      ```

:::note
It is usually recommended to version the `package.json` file, but it is known to cause issues on Heroku.
:::


### Create a Heroku project

Create a new Heroku project by running the following command in the root directory of your Strapi project:

```bash
# path: ./my-project/
heroku create
```

:::tip
You can use `heroku create custom-project-name`, to have Heroku create a `custom-project-name.heroku.com` URL. Otherwise, Heroku will automatically generate a random project name (and URL) for you.
:::

If you have a Heroku project app already created, you can use the following command to initialize your local project folder:

```bash
# path: ./my-project/
heroku git:remote -a your-heroku-app-name
```

Your local development environment is now set-up and configured to work with Heroku.

### Create a Heroku Database

The following procedure creates and connects a PostgreSQL database with your project. Consult the[ Heroku documentation](https://devcenter.heroku.com/articles/heroku-postgresql) for database plan names and costs. these steps to deploy your Strapi app to Heroku using **PostgreSQL**:

1. Install the [Heroku Postgres addon](https://elements.heroku.com/addons/heroku-postgresql).

```bash
#Path: ./my-project/
heroku addons:create heroku-postgresql:<PLAN_NAME>
```

2. Retrieve database `DATABASE_URL` string by running the following command in your terminal:

```bash
# path: ./my-project/
heroku config
```

The command output has the form `DATABASE_URL: postgres://ebitxebvixeeqd:dc59b16dedb3a1eef84d4999sb4baf@ec2-50-37-231-192.compute-2.amazonaws.com: 5432/d516fp1u21ph7b`.

(This url is read like so: \*postgres:// **USERNAME** : **PASSWORD** @ **HOST** : **PORT** / **DATABASE_NAME\***)

<!-- not good here--> You also need to set the `NODE_ENV` variable on Heroku to `production` to ensure this new database configuration file is used.

```bash
heroku config:set NODE_ENV=production
```

### Populate the environment variables

You need to set the environment variable in Heroku for the `MY_HEROKU_URL`. This populates the variable with something like `https://your-app.herokuapp.com`.

```bash
heroku config:set MY_HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)
heroku config:set APP_KEYS=$(cat .env | grep APP_KEYS | cut -d= -f2-)
heroku config:set API_TOKEN_SALT=$(cat .env | grep API_TOKEN_SALT | cut -d= -f2)
heroku config:set ADMIN_JWT_SECRET=$(cat .env | grep ADMIN_JWT_SECRET | cut -d= -f2)
heroku config:set JWT_SECRET=$(cat .env | grep -w JWT_SECRET | cut -d= -f2)
```

:::tip
On Windows, variables can be set manually by running the `heroku config:set VARIABLE=your-key-here` for each variable.
:::

The following `openssl` commands will generate random new secrets (Mac and Linux only):

```bash
heroku config:set APP_KEYS=$(openssl rand -base64 32)
heroku config:set API_TOKEN_SALT=$(openssl rand -base64 32)
heroku config:set ADMIN_JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
```

8. Commit your changes:

```bash
# path: ./my-project/
git add .
git commit -m "Update config"
```

9. Update Yarn lockfile and commit the change:

```bash
# path: ./my-project/
yarn install
git add yarn.lock
git commit -m "Updated Yarn lockfile"
```

### 10. Deploy

In the project root directory run the `git push heroku HEAD:main` CLI command to push your project to the Heroku server:

```bash
# path: ./my-project/`
git push heroku HEAD:main
```

The deployment may take a few minutes. At the end, logs will display the url of your project (e.g. `https://mighty-taiga-80884.herokuapp.com`). You can also open your project using the command line:

```bash
# path: ./my-project/`
heroku open
```

If you see the Strapi Welcome page, you have correctly set-up, configured and deployed your Strapi project on Heroku. You will now need to set-up your `admin user` as the production database is brand-new and empty.

## Project updates

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

::: tip
If you see the following issue while running the `git push` command: `'heroku' does not appear to be a git repository`, run the following command: `heroku git:remote -a your-app-name`.
:::

## File Uploads

Like with project updates on Heroku, the file system doesn't support local uploading of files as they will be wiped when Heroku "cycles" the dyno. This type of file system is called [ephemeral](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), which means the file system only lasts until the dyno is restarted (with Heroku this happens any time you redeploy or during their regular restart which can happen every few hours or every day).

Due to Heroku's filesystem you will need to use an upload provider such as AWS S3 or Cloudinary. You can view the documentation for installing providers [here](/developer-docs/latest/development/providers.md) and you can see a list of providers from both Strapi and the community on [npmjs.com](https://www.npmjs.com/search?q=strapi-provider-upload-&page=0&perPage=20).

## Gzip

As of version `3.2.1`, Strapi uses [`koa-compress`](https://github.com/koajs/compress) v5, which enables [Brotli](https://en.wikipedia.org/wiki/Brotli) compression by default. At the time of writing, the default configuration for Brotli results in poor performance, causing very slow response times and potentially response timeouts. If you plan on enabling the [gzip middleware](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#internal-middlewares-configuration-reference), it is recommended that you disable Brotli or define better configuration params.

To disable Brotli, provide the following configuration in `config/middleware.js`.

```json
gzip: {
  enabled: true,
  options: {
    br: false
  }
},
```

For more on Brotli configuration for `koa-compress`, reference [this issue](https://github.com/koajs/compress/issues/121).
