---
title: DigitalOcean One-click - Strapi Developer Docs
description: Quickly deploy a Strapi application on DigitalOcean by simply using their One-click button.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.html
---

# DigitalOcean One-click

::: caution
The one-click install droplet is currently missing from DigitalOcean's marketplace. We are not planning to continue support for this installation method but if you want to configure it yourself you can use our [one-click repo](https://github.com/strapi/one-click-deploy) to build the image yourself.
:::

The following documentation will guide you through the one-click creation of a new Strapi project hosted on [DigitalOcean](https://www.digitalocean.com/)

DigitalOcean is a cloud platform that helps to deploy and scale applications by offering an Infrastructure as a Service (IaaS) platform for developers.

::: prerequisites
A DigitalOcean account is necessary to follow this installation guide. Please visit the [DigitalOcean website](https://try.digitalocean.com/strapi/) to create an account if you don't already have one.
:::

## Creating a Strapi project

1. Go to the Strapi page on DigitalOcean's marketplace.
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

::: strapi Customization options for the DigitalOcean droplet
The DigitalOcean droplet includes everything you need to run Strapi. However, should you need to access and customize the droplet environment and change some of its settings, you may want to refer to [our dedicated documentation](/developer-docs/latest/setup-deployment-guides/installation/digitalocean-customization.md). You can also find the image generation [source code](https://github.com/strapi/one-click-deploy/tree/master/digital-ocean) on Strapi's GitHub.
:::
