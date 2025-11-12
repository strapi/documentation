---
title: Database
displayed_sidebar: cloudSidebar
description: Configure your own database on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/advanced/database.html
tags:
- configuration
- database
- deployment
- PostgreSQL
- Strapi Cloud
- Strapi Cloud project
pagination_next: cloud/advanced/email
---

# Database

<Tldr>
Default PostgreSQL can be swapped for any supported SQL database by aligning configuration and environment variables.
</Tldr>

Strapi Cloud provides a pre-configured PostgreSQL database by default. However, you can also configure it to utilize an external SQL database, if needed.

:::prerequisites
- A local Strapi project running on `v4.8.2+`.
- Credentials for an external database.
- If using an existing database, the schema must match the Strapi project schema.
:::

:::caution
While it's possible to use an external database with Strapi Cloud, you should do it while keeping in mind the following considerations:
- Strapi Cloud already provides a managed database that is optimized for Strapi.
- Using an external database may result in unexpected behavior and/or performance issues (e.g., network latency may impact performance). For performance reasons, it's recommended to host your external database close to the region where your Strapi Cloud project is hosted. You can find where your Strapi Cloud project is hosted in your Project Settings (see [Project Settings > General > Selected Region](/cloud/projects/settings#general)).
- Strapi can't provide security or support with external databases used with Strapi Cloud.
:::

:::warning
Any environment variable added to your project that starts with `DATABASE_` will cause Strapi Cloud to assume that you will be using an external database and all Strapi Cloud specific database variables will not be injected!
:::


## Configuration

The project `./config/database.js` or `./config/database.ts` file must match the configuration found in the [environment variables in database configurations](https://docs.strapi.io/cms/configurations/database#environment-variables-in-database-configurations) section.

Before pushing changes, add environment variables to the Strapi Cloud project:

1. Log into Strapi Cloud and click on the corresponding project on the Projects page.
2. Click on the **Settings** tab and choose **Variables** in the left menu.
3. Add the following environment variables:

    | Variable                           | Value            | Details  |
    | ---------------------------------- | ---------------- |----------|
    | `DATABASE_CLIENT`                  | your_db          | Should be one of `mysql`, `postgres`, or `sqlite`. |
    | `DATABASE_HOST`                    | your_db_host     | The URL or IP address of your database host |
    | `DATABASE_PORT`                    | your_db_port     | The port to access your database |
    | `DATABASE_NAME`                    | your_db_name     | The name of your database |
    | `DATABASE_USERNAME`                | your_db_username | The username to access your database |
    | `DATABASE_PASSWORD`                | your_db_password | The password associated to this username |
    | `DATABASE_SSL_REJECT_UNAUTHORIZED` | false            | Whether unauthorized connections should be rejected |
    | `DATABASE_SCHEMA`                  | public           | - |

4.  Click **Save**.

:::caution
To ensure a smooth deployment, it is recommended to not change the names of the environment variables.
:::

## Deployment

To deploy the project and utilize the external database, push the changes from earlier. This will trigger a rebuild and new deployment of the Strapi Cloud project.

Once the application finishes building, the project will use the external database.

## Reverting to the default database

To revert back to the default database, remove the previously added environment variables related to the external database from the Strapi Cloud project dashboard, and save. For the changes to take effect, you must redeploy the Strapi Cloud project.
