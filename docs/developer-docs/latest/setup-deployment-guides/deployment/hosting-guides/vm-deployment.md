---
title: Virtual Machine Deployments - Strapi Developer Docs
description: Deploy your Strapi application on a virtual machine such as DigitalOcean Droplets, AWS, or Azure.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/vm-deployment.html
---

# Virtual Machine Deployment

The following is a high-level guide to deploying a Strapi project on a virtual machine such as a [DigitalOcean](https://www.digitalocean.com/) Droplet, AWS, or Azure. It is not intended to cover all possible configurations. For detailed information, consult the NodeJS deployment documentation from the respective hosting platforms.

:::prerequisites

- A Strapi project,
- an account with the hosting platform,
- a remote repository such as GitHub, GitLab or BitBucket. <!--not required?-->

:::

## Create a user

:::: tabs card

::: tab AWS
- [Create an admin user (IAM)](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-set-up.html#create-an-admin)
- [Create a regular user](https://console.aws.amazon.com/iam/home) by logging in as an IAM user
- download and save the `.csv` file containing your `Access key ID` and `Secret access key`

:::

::: tab Azure
test
:::

::: tab DigitalOcean Droplet
test
:::


::::

## Create a server

:::caution Consult the [hardware and software requirements](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html#hardware-and-software-requirements) before selecting a resource from your hosting provider
:::

:::: tabs card

::: tab AWS

- As a regular user logged into the AWS management console find and select `EC2, Virtual Servers in the Cloud`.
- Select a region
- Click on **Launch Instance**
- Select a server type and size. For example Ubantu 22.04 LTS (HVM), SSD Volume Type with `General purpose` and `t2.small` selected.
<!-- - Configure storage TODO -->
- (Optional) Add tags
<!-- - TODO Configure the security group  -->

- Click `Review and Launch`
- Create a new key pair and save the `.pem` file. You will need this file later in the process.
- Click the `Launch Instances` button.
:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::



::::

## Install and setup a NodeJS sever

:::: tabs card

::: tab AWS


:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::



::::



## Install Git

::::tabs card

::: tab AWS


:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::



::::

## Install a database

The following example shows how to create a managed database on each of the platforms. It is also possible to host your own database directly on your virtual machine. 

:::: tabs card

::: tab AWS

1. Navigate to the AWS RDS Service: In the top menu, click on Services and do a search for rds, click on RDS, Managed Relational Database Service.

2. Select your region: In the top menu bar, select the region that is the same as the EC2 instance, e.g. EU (Paris) or US East (N. Virgina).

#3. Create the database: Click the orange Create database button. Follow these steps to complete installation of a PostgreSQL database:

<!--update pg version here and rewrite this section-->
Engine Options: Click on PostgreSQL, version PostgreSQL 10.x-R1
Templates: Click on Free Tier.
Settings
DB instance identifier Give a name to your database, e.g. strapi-database
Credential Settings: This is your psql database username and password.
Master username: Keep as postgres, or change (optional)
Uncheck Auto generate a password, and then type in a new secret password.
Connectivity, and Additional connectivity configuration: Set Publicly accessible to Yes.
OPTIONAL: Review any further options (DB Instance size, Storage, Connectivity), and modify to your project needs.
You need to give you Database a name. Under Additional configuration:
Additional configuration, and then Initial database name: Give your database a name, e.g. strapi.
Review the rest of the options and click the orange, Create database button.
After a few minutes, you may refresh your page and see that your database has been successfully created.

:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::

::::

## Configure the local development environment

::::tabs card

::: tab AWS


:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::

::::

## Deploy from Github

:::: tabs card

::: tab AWS

:::

::: tab Azure

:::

::: tab DigitalOcean Droplet

:::

::::

## Install and configure PM2 process manager

[PM2 Runtime](https://pm2.keymetrics.io) allows you to keep your Strapi project alive and to reload it without downtime.

Ensure you are logged in as a **non-root** user and install **PM2** globally:

::::tabs card
::: YARN

```bash
yarn add pm2@latest -g
```

:::

::: NPM

```bash
npm install pm2@latest -g
```

::::

### Configure ecosystem.config.js

The `ecosystem.config.js` file manages the **database connection variables** Strapi uses to connect to your database. The `ecosystem.config.js` will also be used by `pm2` to restart your project whenever any changes are made to files within the Strapi file system itself. For example, when an update is initiated from GitHub. More details are available in the [PM2 documentation](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).

To configure the `ecosystem.config.js` file:

1. Open your `nano` editor and paste the following command:

```bash
cd ~
pm2 init
sudo nano ecosystem.config.js
```

2. Replace the default content in the file with the following:


:::: tabs card

::: tab AWS

```js
module.exports = {
  apps: [
    {
      name: 'your-app-name', // Your project name
      cwd: '/home/ubuntu/my-project', // Path to your project
      script: 'npm', // For this example we're using npm, could also be yarn
      args: 'start', // Script to start the Strapi server, `start` by default
      env: {
        APP_KEYS: 'your app keys', // you can find it in your project .env file.
        API_TOKEN_SALT: 'your api token salt',
        ADMIN_JWT_SECRET: 'your admin jwt secret',
        JWT_SECRET: 'your jwt secret',
        NODE_ENV: 'production',
        DATABASE_HOST: 'your-unique-url.rds.amazonaws.com', // database Endpoint under 'Connectivity & Security' tab
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'strapi', // DB name under 'Configuration' tab
        DATABASE_USERNAME: 'postgres', // default username
        DATABASE_PASSWORD: 'Password',
        AWS_ACCESS_KEY_ID: 'aws-access-key-id',
        AWS_ACCESS_SECRET: 'aws-access-secret', // Find it in Amazon S3 Dashboard
        AWS_REGION: 'aws-region',
        AWS_BUCKET_NAME: 'my-project-bucket-name',
      },
    },
  ],
};
```

:::

::: tab Azure

```js
module.exports = {
  apps: [
    {
      name: 'strapi-dev',
      cwd: '/srv/strapi/mystrapiapp',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'development',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'strapi_dev',
        DB_USER: 'strapi',
        DB_PASS: 'mysecurepassword',
        JWT_SECRET: 'aSecretKey',
      },
    },
  ],
};
 ```

:::

::: tab DigitalOcean Droplet

```js
module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/home/your-name/my-strapi-project/my-project',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        DATABASE_HOST: 'localhost', // database endpoint
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'strapi', // DB name
        DATABASE_USERNAME: 'your-name', // your username for psql
        DATABASE_PASSWORD: 'password', // your password for psql
      },
    },
  ],
};
```

:::

::::

You can also set your environment variables in a `.env` file in your project like so:

```bash

DB_HOST=localhost
DB_PORT=5432
DB_NAME=strapi_dev
DB_USER=strapi
DB_PASS=mysecurepassword
JWT_SECRET=aSecretKey
```

We recommend you continue setting the `NODE_ENV` variable in the `ecosystem.config.js` file.

### Start the Strapi service

Use the following command to start the Strapi service:

```bash
pm2 start ecosystem.config.js
```

The Strapi PM2 service is now set-up to use an `ecosystem.config.js` to manage your application.

## Other resources

Strapi community members often build helpful plugins and tools that can simplify deployment. The following table has some examples and resource links. These tools are not maintained by the core Strapi team. If you encounter a problem or have questions please use the [Strapi Forum](forum.strapi.io), [Discord](), or the specific GitHub repository to find solutions.

| Resource | Description |
|----------|-------------|
|          |             |
|          |             |
|          |             |

