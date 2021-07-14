---
title: DigitalOcean One-click - Strapi Developer Documentation
description: Quickly deploy a Strapi application on DigitalOcean by simply using their One-click button.
---

<style lang="scss" scoped>
/*
    We override the :::warning and :::danger callouts for specific uses here.
    The CSS is scoped so this won't affect the rest of the docs.

    Eventually this will be turned into custom blocks or VuePress components,
    once I understand better how markdown-it and markdown-it-custom-block work.
  */
  .custom-block.warning {
    border-left-width: .25rem;
    background-color: #f8f8f8;
    border-color: #bbbbba;
    /* margin-top: 2em; */
    /* margin-bottom: 2em; */

    .custom-block-title, p, li {
      color: rgb(44, 62, 80);
    }
    a {
      color: #007eff;
    }
  }

  .custom-block.danger {
    border-left-width: .25rem;
    background-color: rgba(129,107,250, .05);
    margin-top: 2em;
    margin-bottom: 2em;
    border-color: rgb(129,107,250);

    .custom-block-title, p, li {
      color: rgb(44, 62, 80);
    }
    a {
      color: #007eff;
    }
    .custom-block-title {
      color: rgb(129,107,250);
      font-weight: bold;
    }
  }
</style>

# DigitalOcean One-click

The following documentation will guide you through the one-click creation of a new Strapi project hosted on  [DigitalOcean](https://www.digitalocean.com/).

DigitalOcean is a cloud platform that helps to deploy and scale applications by offering an Infrastructure as a Service (IaaS) platform for developers.

:::warning PREREQUISITES
A DigitalOcean account is necessary to follow this installation guide. Please visit the [DigitalOcean website](https://try.digitalocean.com/strapi/) to create an account if you don't already have one.
:::

## Creating a Strapi project

1. Go to the [Strapi page on DigitalOcean's marketplace](https://try.digitalocean.com/strapi/).
2. Click on **Create Strapi Droplet** button.
3. Keep the selected "Shared CPU - Basic" plan.
4. Choose "Regular Intel with SSD" as a CPU option.
5. Select your virtual machine size (minimum of 2 GB/1 CPU).
6. Choose a datacenter region (closest to you or your target area).
7. Add a new SSH key. You can follow [this guide](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/).
8. Give your virtual machine a hostname.
9. Click **Create Droplet**. It may take from 30 seconds to a few minutes for the droplet to start, and a few minutes more to finish the Strapi installation.

## Running Strapi

Your Strapi application on DigitalOcean will be running in development mode. It is not recommended to use the application directly in production.

To visit your Strapi application:

1. Go to the [droplets list on DigitalOcean](https://cloud.digitalocean.com/droplets), logged in.
2. Click on the droplet name that is used for your Strapi application.
3. Copy the public ipv4 address of the droplet.
4. Use this address to access the Strapi application.

Visiting the Strapi application page for the first time will require to create the first administrator user.

::: danger 🤓 Customization options for the DigitalOcean droplet 
The DigitalOcean droplet includes everything you need to run Strapi. However, should you need to access and customize the droplet environment and change some of its settings, you may want to refer to [our dedicated documentation](/developer-docs/latest/setup-deployment-guides/installation/digitalocean-customization.md). You can also find the image generation [source code](https://github.com/strapi/one-click-deploy/tree/master/digital-ocean) on Strapi's GitHub.
:::
