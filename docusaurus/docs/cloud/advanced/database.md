---
title: Database
displayed_sidebar: cloudSidebar
description: Configure your own database on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/advanced/database.html
---

# Database

Strapi Cloud provides a pre-configured PostgreSQL database by default. However, you can also configure it to utilize an external SQL database, if needed.

:::caution
While supported, it is not recommended to use an external database with Strapi Cloud, unless there is an explicit need to do so. This is because Strapi Cloud provides a managed database that is optimized for Strapi. Using an external database may result in unexpected behavior and/or performance issues.

### Caveats

- Network latency may impact performance.
- Strapi cannot provide security for external databases.
- Strapi cannot provide support for external databases.

:::

:::prerequisites

- A local Strapi project running on `v4.8.1+`.
- Credentials for external database.
- If using an existing database,
- the schema must match the Strapi project schema.

:::

## Configuration

It is important to ensure that the project `./config/database.js` or `./config/database.ts` file matches the configuration found in the [Environment variables in database configurations](https://docs.strapi.io/dev-docs/configurations/database#environment-variables-in-database-configurations) section.

:::tip
Before pushing changes, it is recommended to log into the Strapi Cloud project dashboard to add the environment variables.

:::

In the Strapi Cloud project dashboard, navigate to the `Variables` section under the `Settings` tab and click `Add variable`. Once the variables are added, click `Save`.

![environment variables](https://res.cloudinary.com/dz7knyfbp/image/upload/v1681936336/env_var_rw55uy.png)

The following environment variables will need to be set:

| Variable                           | Value            |
| ---------------------------------- | ---------------- |
| `DATABASE_CLIENT`                  | your_db          |
| `DATABASE_HOST`                    | your_db_host     |
| `DATABASE_PORT`                    | your_db_port     |
| `DATABASE_NAME`                    | your_db_name     |
| `DATABASE_USERNAME`                | your_db_username |
| `DATABASE_PASSWORD`                | your_db_password |
| `DATABASE_SSL`                     | true             |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | false            |
| `DATABASE_SCHEMA`                  | public           |

:::tip
To ensure a smooth deployment, it is recommended to not change the names of the environment variables.

:::

## Deployment

To deploy the project and utilize the external database, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi cloud project.

![deployment](https://res.cloudinary.com/dz7knyfbp/image/upload/v1681936928/deploy_h49uly.png)

Once the application finishes building, the project will use the external database.

## Reverting to the default database

To revert back to the default database, remove the previously added environment variables related to the external database from the Strapi Cloud project dashboard. This action will trigger a rebuild and new deployment of the Strapi cloud project.
