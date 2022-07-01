---
title: Fly.io Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on Fly.io.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/fly.html
---

# Fly.io

This is a step-by-step guide for deploying a Strapi project on [Fly.io](https://fly.io/), using the [Postgres on Fly](https://fly.io/docs/reference/postgres/#about-postgres-on-fly) integration as persistent storage.

In this guide you are going to:

- Create a Strapi project
- Create a Fly project
- Setup and deploy a Postgres app on Fly
- Deploy the Strapi project on Fly
- Change the Strapi project and re-deploy on Fly

## Pre-requirements

::: caution
To follow this guide, you will need [an existing Fly.io account](https://fly.io/app/sign-up). For the first sign-up, Fly will require you to register your credit card. This guide will use only free-tier features of Fly, so your card is not going to be charged by following this.
:::

### Install the Fly CLI

Download and install the Fly CLI for your operating system. For more configuration and information, follow [Introducing Flyctl • Fly Docs](https://fly.io/docs/flyctl/).

<code-group>
<code-block title="MacOS">
```sh
brew install flyctl
```
</code-block>

<code-block title="Linux">
```sh
curl -L https://fly.io/install.sh | sh
```
</code-block>

<code-block title="Windows">
```sh
curl -L https://fly.io/install.sh | sh
```
</code-block>
</code-group>

The `flyctl` installation will create the symlink to `fly`, so in terminal both `flyctl` and `fly` are interchangeable.

### Login to Fly

Login to your Fly account. Follow the instructions and return to the command line.

```bash
fly auth login
```

## Create the Strapi project

### Generate the project

Create a [new Strapi project](/developer-docs/latest/getting-started/quick-start.md) using `create-strapi-app`.

<code-group>
<code-block title="npm">
```sh
npx create-strapi-app@latest strapi-fly --quickstart
```
</code-block>

<code-block title="yarn">
```sh
yarn create strapi-app strapi-fly --quickstart
```
</code-block>
</code-group>

::: tip
When you use `--quickstart` to create a Strapi project, a **SQLite database** will be used locally in the `development environment`. We will configure the `production` environment to use Postgres later in this guide.
:::

### Create the Dockerfile

Fly uses Dockerfiles to deploy its projects. Since [Strapi doesn't generate a Dockerfile](https://github.com/strapi/strapi-docker) for the project, you will have to create it. Create a new file `Dockerfile` in the root of your project.

<code-group>
<code-block title="yarn">
```Dockerfile
# Dockerfile

FROM node:16

# Installing libvips-dev for sharp Compatability
RUN apt-get update && apt-get install libvips-dev -y

# Set environment to production
ENV NODE_ENV=production

# Copy the configuration files
WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH

# Install dependencies
RUN yarn install

# Copy the application files
WORKDIR /opt/app
COPY ./ .

# Build the Strapi application
RUN yarn build

# Expose the Strapi port
EXPOSE 1337

# Start the Strapi application 
CMD ["yarn", "start"]
```
</code-block>

<code-block title="npm">
```Dockerfile
# Dockerfile

FROM node:16

# Installing libvips-dev for sharp Compatability
RUN apt-get update && apt-get install libvips-dev -y

# Set environment to production
ENV NODE_ENV=production

# Copy the configuration files
WORKDIR /opt/
COPY ./package.json ./package-lock.json ./
ENV PATH /opt/node_modules/.bin:$PATH

# Install dependencies
RUN npm install

# Copy the application files
WORKDIR /opt/app
COPY ./ .

# Build the Strapi application
RUN yarn build

# Expose the Strapi port
EXPOSE 1337

# Start the Strapi application
CMD ["npm", "start"]
```
</code-block>
</code-group>

[Simen Daehlin](https://twitter.com/eventyret) wrote a full guide on using Strapi with Docker at [Docker with Strapi V4](https://blog.dehlin.dev/docker-with-strapi-v4).

### Create the .dockerignore file

One the root of your project, create another file called `.dockerignore`. This will indicate what files should be ignored during the Docker build.

```text
# .dockerignore

.tmp/
.cache/
.git/
build/
node_modules/
data/
```

## Create the Fly project

Time to [create a new Fly project](https://fly.io/docs/flyctl/launch/) inside of the Strapi root folder. 

```sh
fly launch
```

Follow the instructions on the screen, until the **Would you like to setup a Postgresql database now?** is prompted. 

```text
? App Name (leave blank to use an auto-generated name): 
Automatically selected personal organization
? Select region: ams (Amsterdam, Netherlands)
Created app bold-haze-733 in organization personal
Wrote config file fly.toml
```

### Setup the Postgres project

You will be prompted **Would you like to setup a Postgresql database now?**. If you select *Yes*, Fly will create a separate Postgres project and attach it to your Strapi project. If you have a separate Postgres instance or you want to configure it later, select *No* and read further [Postgres on Fly • Fly Docs](https://fly.io/docs/reference/postgres/#creating-a-postgres-app).

Once you select *Yes* and select your preferred configuration, the Postgres app is being deployed.  

```text
? Would you like to setup a Postgresql database now? Yes
For pricing information visit: https://fly.io/docs/about/pricing/#postgresql-clusters
? Select configuration: Development - Single node, 1x shared CPU, 256MB RAM, 1GB disk
Creating postgres cluster bold-haze-733-db in organization personal
Postgres cluster bold-haze-733-db created
```

::: tip
Explore how you can use the free resources on Fly at [About Free Postgres on Fly • Fly Docs](https://fly.io/docs/reference/postgres/#about-free-postgres-on-fly)
:::

Once the Postgres cluster is deployed, you will be prompted with the configuration details. Make sure to save these, since you won't be able to revisit them. 

```text
  Username:    postgres
  Password:    9904f659e488d9bb0572491ef3693c8c5df4345b8e136aed
  Hostname:    bold-haze-733-db.internal
  Proxy Port:  5432
  PG Port: 5433
Save your credentials in a secure place, you won't be able to see them again!
```

Moreover, Fly will provide you with the credentials that can be used internally in your app. Read more about connecting to Postgres within Fly vs. outside Fly in [Connecting to Postgres • Fly Docs](https://fly.io/docs/reference/postgres/#connecting-to-postgres).

### Attach Postgres to the Strapi app

Fly will automatically attach the Postgres cluster to the Strapi that you just created.

```text
Postgres cluster bold-haze-733-db is now attached to bold-haze-733
The following secret was added to bold-haze-733:
  DATABASE_URL=postgres://bold_haze_733:ppx33flwj9JyM81@top2.nearest.of.bold-haze-733-db.internal:5432/bold_haze_733
Postgres cluster bold-haze-733-db is now attached to bold-haze-733
```

Fly automatically adds the `DATABASE_URL` in the environment secrets of the app. The [Fly secrets](https://fly.io/docs/reference/secrets/) are available to the app when it's running, but to deploy it from your machine, you need to make it available locally first. Edit the `.env` file of your Strapi project to include the exact same variable.

```sh
# .env

DATABASE_URL=postgres://bold_haze_733:ppx33flwj9JyM81@top2.nearest.of.bold-haze-733-db.internal:5432/bold_haze_733
```

::: tip
If you connect to your Strapi database externally, read more about managing Postgres or connecting from outside Fly at [Postgres on Fly • Fly Docs](https://fly.io/docs/reference/postgres/).
:::

When prompted **Would you like to deploy now?**, select *No*. You need to configure the production environment first. 

## Configure the production environment

Before deploying the Strapi app, you will need to configure it to be production-ready.

### Configure Fly

The Fly CLI generated the configuration file `fly.toml`. This file should point the port that Strapi is using. Go to the `fly.toml` file and change the `internal_port` row (line 17) to `1337`.

```toml
[[services]]
  http_checks = []
  internal_port = 1337
  processes = ["app"]
  protocol = "tcp"
  script_checks = []
```

### Configure Strapi

Because you are using Postgres, you will need to install the `pg-connection-string` package to split `DATABASE_URL` and `pg` as a client. 

<code-group>
<code-block title="yarn">
```sh
yarn add pg-connection-string pg
```
</code-block>

<code-block title="npm">
```sh
npm i pg-connection-string pg
```
</code-block>
</code-group>

Inside of the `./config` directory, you need to setup a database config file for the production environment. Create a new file `./config/env/production/database.js`. This will connect Strapi to the production Postgres database you just created. 

```js
// ./config/env/production/database.js

const parse = require("pg-connection-string").parse;
const config = parse(process.env.DATABASE_URL);

module.exports = () => ({
  connection: {
    client: "postgres",
    connection: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: false,
    },
    debug: false,
  },
});
```

::: caution
This will configure the production environment to use Postgres. The local development config will remain SQLite and can be found in `./config/database.js`. If you want to configure it, read more about [Database configuration - Strapi Developer Docs](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html#configuration-structure).
:::

## Deploy to fly

Time to deploy your Strapi application to Fly. 

```sh
fly deploy
```

This will build the Dockerfile with your project and deploy it to Fly. Follow the URL generated by Fly to get to your admin dashboard. 

From here, continue using Strapi as you would normally do, or follow the [Quick Start Guide - Strapi Developer Docs](/developer-docs/latest/getting-started/quick-start.md).

::: caution
Strapi does **not** allow you to use the Content-type Builder in production. To update the content types, you will have to make the changes locally and re-deploy them to Fly.
:::

## Update the Strapi project

Even if you deployed your Strapi app to production, you can still use your local environment as development environment. In order to make the local changes available to production you will need to re-deploy the Fly app.

Following [Quick Start Guide - Strapi Developer Docs](/developer-docs/latest/getting-started/quick-start.md), start by running Strapi in development mode.

<code-group>
<code-block title="yarn">
```sh
yarn develop  
```
</code-block>

<code-block title="npm">
```sh
npm run develop
```
</code-block>
</code-group>

After you make the changes and you are sure they work, re-deploy your app. 

```sh
fly deploy
```



