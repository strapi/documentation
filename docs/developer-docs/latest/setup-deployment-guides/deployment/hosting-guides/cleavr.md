---
title: Cleavr Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application to popular VPS providers using Cleavr.
---

# Cleavr

This guide explains how to deploy your Strapi projects to a VPS (virtual private server) using [Cleavr](https://cleavr.io).

Cleavr is a server management console that integrates with multiple VPS providers (Hetzner, Linode, Vultr, DigitalOcean, UpCloud, AWS, and custom) 
and helps you configure servers to host and deploy your Strapi projects.

Cleavr includes the following features:

- Provision and configure servers ready to host Strapi projects
- Secure servers and provides free SSL certs
- Deploy code from GitHub, GitLab, and Bitbucket repositories
- Auto-installs and configures PM2 (with cluster mode enabled)
- GitHub Actions integration to build app with no additional configuration required

::: tip
For more information, consult [Cleavr's Strapi deployment guide](https://docs.cleavr.io/guides/strapi-cms)
:::

### Prerequisites
- Your [cleavr.io](https://cleavr.io) account is set up and connected to your VPS and VC providers
- You have a Strapi project ready to deploy
- You have an existing provisioned server

### Step 1: Add A New Site

From your Cleavr panel, add a new **NodeJS SSR** site to the server you want to host your project on. 

### Step 2: Configure Web App Repository Settings

After you've added the new site, go to the web app section and edit the web app that was automatically added. 

Navigate to the **Code Repository** settings section and fill in the details for your VC provider, your repository, and the branch-to-deploy. 

### Step 3: Configure Web App Build Settings

On the **Build** settings tab, make the following configurations: 

- Set **Entry Point** to `npm`
- Set **Arguments** to `build`
- Set **Build Commands** to `npm run build --production`
- Set **Artifacts Path** to `build`

If you are not keying off an environment variable in the `.env` file for production, you can use PM2 to start Strapi in production mode.

In the **PM2 Ecosystem** area of the build settings tab, add `"NODE_ENV":"production"` to the `env` section.

It should look something like the following:

```json
{
  "name": "<site-name>",
  "script": "npm",
  "args": "start",
  "log_type": "json",
  "cwd": "/home/<server-user-name>/<site-name>/current",
  "instances": "max",
  "exec_mode" : "cluster",
  "env": {
    "NODE_ENV":"production",
    "PORT": <port number>,
    "CI": 1,
  }
}
```

### Step 4: Deploy

Once you have your web app configured, navigate to the web app deployment tab and click Deploy. 

If you'd like to use GitHub Actions to build your project, you can enable the GitHub Actions integration from the web app settings section. 

Refer to the Cleavr [guide](https://docs.cleavr.io/guides/strapi-cms/) and [forum](https://forum.cleavr.io/) if you run across any issues. 
