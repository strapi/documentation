---
title: Google App Engine Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on Google App Engine and how to upload your assets on Google Cloud Storage.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.html
---

# Google App Engine

!!!include(developer-docs/latest/setup-deployment-guides/deployment/snippets/deployment-guide-not-updated.md)!!!

In this guide we are going to:

- Create a new Strapi project
- Configure PostgreSQL for the production environment
- Deploy the app to Google App Engine
- Add the [Google Cloud Storage file uploading plugin](https://github.com/Lith/strapi-provider-upload-google-cloud-storage) by [@Lith](https://github.com/Lith)

### New Strapi project

<code-group>

<code-block title="NPM">
```sh
npx create-strapi-app@latest my-project --quickstart
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-app my-project --quickstart
```
</code-block>

</code-group>

When the setup completes, register an admin user using the form which opens in the browser. This user will be only relevant in local development.

The `sqlite` database is created at `.tmp/data.db`.

Login, but don't add content-types yet. Close the browser. Quit the running app.

### Initial commit

This may be a good point to commit the files in their initial state.

```bash
cd my-project
git init
git add .
git commit -m first
```

### Install the Cloud SDK CLI tool

[Cloud SDK: Command Line Interface](https://cloud.google.com/sdk/)

### New App Engine project

Create a new [App Engine](https://console.cloud.google.com/appengine/) project.

Select the region, such as `europe-west`.

- Language: Node JS
- Environment: Standard (or Flexible)

(_A note on performance and cost_: the `Standard Environment` is sufficient for development, but it may not be for production. Review the resources your application will need to determine the cost. When you sign up for Google App Engine, it offers a certain amount of free credits which will not be billed.)

Create the project. Take note of the instance identifier, which is in the form of `<instance_id>:<region>:<instance_name>`.

Check if `gcloud` lists the project:

```bash
gcloud projects list
```

Run `init` to authenticate the cli, and select current cloud project.

```bash
gcloud init
```

### Create the database (PostgreSQL)

Create the [Cloud SQL database](https://cloud.google.com/sql/docs/postgres/create-manage-databases) which the app is going to use.

Take note of the user name (default is `postgres`) and password.

The first database will be created with the name `postgres`. This cannot be deleted.

Create another database, named `strapi` for example. It may be useful to delete and and re-create this while you are experimenting with the application setup.

### Create app.yaml and .gcloudignore

Create the `app.yaml` file in the project root.

The instance identifier looks like `myapi-123456:europe-west1:myapi`.

The `myapi-123456` part is the project identifier. (The number is automatically added to short project names).

The following is an example config for `Standard Environment` or `Flexible Environment`.

:::: tabs card

::: tab Standard Environment

```yaml
runtime: nodejs16

instance_class: F2

env_variables:
  HOST: '0.0.0.0'
  NODE_ENV: 'production'
  DATABASE_NAME: 'strapi'
  DATABASE_USER: 'postgres'
  DATABASE_PASSWORD: '<password>'
  INSTANCE_CONNECTION_NAME: '<instance_identifier>'

beta_settings:
  cloud_sql_instances: '<instance_identifier>'
```

:::

::: tab Flexible Environment

```yaml
runtime: nodejs

env: flex

env_variables:
  HOST: '0.0.0.0'
  NODE_ENV: 'production'
  DATABASE_NAME: 'strapi'
  DATABASE_USER: 'postgres'
  DATABASE_PASSWORD: '<password>'
  INSTANCE_CONNECTION_NAME: '<instance_identifier>'

beta_settings:
  cloud_sql_instances: '<instance_identifier>'
```

:::

::::

Create `.gcloudignore` in the project root.

```
.gcloudignore
.git
.gitignore
node_modules/
#!include:.gitignore
!.env
yarn.lock  # If you're using Yarn
```

In the case of Strapi, the admin UI will have to be re-built after every deploy,
and so we don't deploy local build artifacts, cache files and so on by including
the `.gitignore` entries.

### Adding `.gitkeep` to database folder

Google App Engine does not give `mkdir` permissions and the `database/migrations` folder is required for deployments. Make sure `git` keeps track of the `database/migrations` folder by adding a `.gitkeep` file to the folder. Use the following command:

```bash
touch .gitkeep
```

### Configure the database

The `PostgreSQL` database will need the `pg` package.

```bash
yarn add pg
```

Adding the production database configuration for connect to GCP SQL.

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/env/production/database.js

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: `/cloudsql/${env('INSTANCE_CONNECTION_NAME')}`, // for a PostgreSQL database
      // ⚠️ For a MySQL database, use socketPath: `/cloudsql/${env('INSTANCE_CONNECTION_NAME')}` instead
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USER'),
      password: env('DATABASE_PASSWORD'),
    },
  },
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/env/production/database.ts

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: `/cloudsql/${env('INSTANCE_CONNECTION_NAME')}`, // for a PostgreSQL database
      // ⚠️ For a MySQL database, use socketPath: `/cloudsql/${env('INSTANCE_CONNECTION_NAME')}` instead
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USER'),
      password: env('DATABASE_PASSWORD'),
    },
  },
});
```

</code-block>
</code-group>

### Auto-build after deploy

After deployment, the admin UI has to be re-built. This generates the contents of the `build` folder on the server.

In `package.json`, add the `gcp-build` command to `scripts`:

```json
{
  "scripts": {
    "gcp-build": "strapi build"
  }
}
```

### Deploy

```bash
gcloud app deploy app.yaml --project myapi-123456
```

Watch the logs:

```bash
gcloud app logs tail --project=myapi-123456 -s default
```

Open the admin page and register and admin user.

```
https://myapp-123456.appspot.com/admin/
```

### File uploading to Google Cloud Storage

[Lith/strapi-provider-upload-google-cloud-storage](https://github.com/Lith/strapi-provider-upload-google-cloud-storage)

```bash
yarn add strapi-provider-upload-google-cloud-storage
```

Deploy so that the server app includes the dependency from `package.json`.

Follow the [documentation of the plugin](https://github.com/Lith/strapi-provider-upload-google-cloud-storage/blob/master/README.md) for the full configuration.

::: note
If thumbnails fail to load in the Media Library, try setting `publicFiles: true` in the upload provider `config` object in the `plugins.js` configuration file.
:::

### Post-setup configuration

**CORS**

CORS is enabled by default, allowing `*` origin. You may want to limit the allowed origins.

Read the documentation [here](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md).

**Changing the admin url**

```
config/env/production/admin.js
```

<code-group>
<code-block title="JAVASCRIPT">

```js
module.exports = ({ env }) => ({
  url: '/dashboard',
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
export default ({ env }) => ({
  url: '/dashboard',
});
```

</code-block>
</code-group>

### Troubleshooting

The following are common issues during deployment:

#### `unknown: Service 'containerregistry.googleapis.com' is not enabled for consumer`

Solution:

1. Type `containerregistry` in the search input of Google cloud panel.
2. In search results select the item with an API icon.
3. Disable and enable it again.
4. Find and enable CloudBuild API.
5. Deploy your project.

#### `connect ECONNREFUSED /cloudsql/strapi-0000:europe-west1:strapi/.s.PGSQL.5432`

Solution:

1. Find the Cloud SQL Admin API.
2. Enable the Cloud SQL Admin API.
3. Deploy your project.
