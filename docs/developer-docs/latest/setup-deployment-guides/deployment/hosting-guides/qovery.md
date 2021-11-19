---
title: Qovery Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on Qovery.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/qovery.html
---

# Qovery

This is a step-by-step guide for deploying a Strapi project on [Qovery](https://www.qovery.com).

Qovery is a CaaS for developers to deploy their full-stack applications on AWS, GCP, Azure and Digital Ocean. Qovery provides access to managed PostgreSQL and free SSL.

::: tip
Qovery provides free hosting for individual developers.
:::

## Deploying with the web interface
### 1. Create a Qovery Account
Visit [the Qovery dashboard](https://start.qovery.com) to create an account if you don't already have one.

### 2. Create a project
* Click on the **create a project** button and give a name to your project.
* Click on **next**.

::: note
One project can have multiple apps running. This is convenient to group your backend, frontend, database etc.
:::

### 3. Add your Strapi app
* Click on the **create an application** button and select your Github or Gitlab repository where your Strapi app is located.
* Click on **next**.

### 4. Add a PostgreSQL database
* Click on add a **PostgreSQL** database.
* Select the version
* Give a name to your PostgreSQL databse.
* Click on **next**.

### 5. Add a storage
* Click on add a **Storage**.
* Give a name to your storage.
* Select the storage type between Slow HDD, HDD, SSD, and Fast SSD. (SSD is recommended)
* Select the size.
* Give a mount point.

### 6. Deploy
Click on the **Deploy** button. Your app should be deployed: you can see the status in real time by clicking on **Deployment logs**.

## Deploying with the CLI
### 1. Create a Qovery Account
[Install the Qovery CLI](https://docs.qovery.com/docs/using-qovery/interface/cli/) and type the command `qovery auth` to create an account if you don't already have one.

### 2. Add a .qovery.yml File
Place a `.qovery.yml` file at the root of your project. Do not forget the dot when naming the file.

```yaml
application:
  name: GIVE_A_NAME_TO_YOUR_APP
  project: GIVE_A_PROJECT_NAME
  publicly_accessible: true
  storage: # qovery will attach automatically a SSD storage on /srv/app
    - name: data
      type: ssd
      size: 5GB
      mount_point: /srv/app
databases:
- type: postgresql # qovery will create a managed PostgreSQL database
  version: 12
  name: psql
routers:
- name: main
  custom_domains: # optional: only if you want to use your domain
  - branch: master
    domain: my.domain.tld
  routes:
  - application_name: strapi
    paths:
    - /*
```

::: tip
For more information about the `.qovery.yml` file, please refer to [the Qovery application documentation](https://docs.qovery.com/docs/using-qovery/configuration/applications).
:::

:::note
Alternatively, you can deploy your Strapi application with a PostgreSQL database in the Qovery dashboard.
:::

### 3. Add a Dockerfile (optional)

By default, Qovery uses Buildpacks to build and run your Strapi application. But it is also possible to build and run your application by providing a `Dockerfile` (see [Quovery documentation](https://docs.qovery.com/docs/using-qovery/configuration/applications/#application-build) for more information).

### 4. Deploy

1. Commit your changes and push them to GitHub or GitLab.
2. Execute the `qovery status --watch` command to see in real time your Strapi application deployment status. When the status of your application is `RUNNING`, it means it has been successfully deployed.

## Scaling

For vertical scaling, Qovery lets you upgrade your CPU and RAM per instance. For horizontal scaling, Qovery auto-scales the number of instance running depending of the CPU and Memory usage.
