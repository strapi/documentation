---
title: Deploy Strapi to Kubernetes with Porter
description: Deploy a Strapi application to a Kubernetes cluster in the cloud provider of your choice (e.g. AWS/GCP/Digital Ocean) in a few clicks via Porter, an application platform that runs in your own cloud.
---

# Deploying Strapi on Porter 

This guide explains how to deploy a new Strapi project on an Elastic Kubernetes Service (EKS), Google Kubernetes Engine (GKE), or Digital Ocean Kubernetes Service (DOKS) cluster via [Porter](https://getporter.dev) in a few clicks.

By default, this guide outlines how to deploy Strapi on Kubernetes with PostgresDB as storage option. However, you may customize the sample repository to use a different storage option.

### Step 1: Create a Porter Account

Visit [the Porter dashboard](https://dashboard.getporter.dev) to create an account if you don't already have one.

### Step 2: Provision a Kubernetes Cluster

If you don't already have a Kubernetes cluster you'd like to deploy to, you can provision a Kubernetes cluster in the cloud provider of your choice with a single click via Porter. If you already have a cluster, you can connect it to Porter using our CLI. To meet the ideal requirements of Strapi, we recommend you to provision a Kubernetes cluster with machines that have at least 4 vCPU and 4GB RAM.

- [Provision a cluster through Porter](https://docs.getporter.dev/docs/getting-started-with-porter-on-aws)
- [Connect an existing cluster to Porter](https://docs.getporter.dev/docs/cli-documentation#connecting-to-an-existing-cluster)

### Step 3: Deploy a PostgresDB instance on Porter

On Porter, you can one-click deploy a PostgreSQL database on your Kubernetes cluster with persistence in a single click. From the [Launch tab](https://dashboard.getporter.dev/launch), select the **PostgreSQL** add-on. Input the username and password you'd like to use and hit **Deploy**. In a few minutes, the database will be ready to accept connections!

### Step 4: Fork the sample Repository

Fork [this sample repository](https://github.com/porter-dev/strapi) and clone it locally. This repository includes the usual Strapi files in the `/app` folder, along with a `Dockerfile` that mounts your custom `/app` folder to Strapi's official `strapi/strapi` base image. 

### Step 5: Deploy Strapi

1. From the [Launch tab](https://dashboard.getporter.dev/launch), navigate to **Web Service > Deploy from Git Repository.** 
2. Select the forked repository, git branch, and `Dockerfile` in the root directory.
3. From application settings, configure the port to `1337` and set resources to [Strapi's recommended specs](https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/deployment.html#general-guidelines) (i.e. 2048Mi RAM, 1000 CPU **at minimum**).
4. In the **Environment Variables** tab, configure these following variables accordingly to connect to the database deployed in step 3:
```
NODE_ENV=production
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```
4. Hit Deploy! In a few minutes your Strapi instance will be ready.

# Development

To develop, run `yarn install && yarn develop` from the `/app` directory. When you push to the forked repository, Porter will use [GitHub Actions](https://github.com/features/actions) to automatically build, push, and re-deploy your changes.

# Questions?
If you run into any issues or have any questions about this guide, ask for help in the [Porter Discord community](https://discord.gg/FaaFjb6DXA).