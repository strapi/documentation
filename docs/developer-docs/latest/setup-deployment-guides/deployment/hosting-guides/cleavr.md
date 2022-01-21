---
title: Cleavr Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application to popular VPS providers using Cleavr.
---

# Cleavr

This guide explains how to deploy your Strapi projects to a VPS (virtual private server) using [Cleavr](https://cleavr.io).

Cleavr is a server management console that integrates with multiple VPS providers (Hetzner, Linode, Vultr, DigitalOcean, UpCloud, AWS, and custom) and helps you configure servers to host and deploy your Strapi projects.

Cleavr includes the following features:

- Provision and configure servers ready to host Strapi projects
- Secure servers and provides free SSL certs
- Deploy code from GitHub, GitLab, and Bitbucket repositories
- Auto-installs and configures PM2 (with cluster mode enabled)
- GitHub Actions integration to build app with no additional configuration required

::: tip
For more information, consult [Cleavr's Strapi deployment guide](https://docs.cleavr.io/guides/strapi-cms)
:::

::: prerequisites
- Your [cleavr.io](https://cleavr.io) account is set up and connected to your VPS and VC providers
- You have a Strapi project ready to deploy
- You have an existing provisioned server
:::

### Step 1: Add A New Site

From your Cleavr panel, add a new **Strapi** site to the server you want to host your project on. 

Expand the advanced options to configure your port number, database, and NodeJS version. 

### Step 2: Configure Web App Repository Settings

After you've added the new site, go to the web app section and edit the web app that was automatically added. 

Navigate to the **Code Repository** settings section and fill in the details for your VC provider, your repository, and the branch-to-deploy. 

### Step 3: Make any additional required configuration updates

In many cases, you're all set to deploy your Strapi CMS app. 

However, you may need to customize some configs prior to deploying. 

Check the following areas for any additional configs you may need to make: 

- Settings > Build to customize entry point, PM2 Ecosystem, and build command
- Environment section to manage environment variables
- Deployment hooks to create any custom hooks required to deploy your app

### Step 4: Deploy

Once you have your web app configured, navigate to the web app deployment tab and click Deploy. 

If you'd like to use GitHub Actions to build your project, you can enable the GitHub Actions integration from the web app settings section. However, using GitHub Actions will likely require you to add your environment variables to the PM2 Ecosystem > ENV section.

Refer to the Cleavr [guide](https://docs.cleavr.io/guides/strapi-cms/) and [forum](https://forum.cleavr.io/) if you run across any issues. 
