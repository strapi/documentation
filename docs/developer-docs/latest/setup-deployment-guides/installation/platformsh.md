---
title: Install using Platform.sh - Strapi Developer Docs
description: Quickly deploy a Strapi application using the official Platform.sh Strapi template.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/platformsh.html
sidebarDepth: 1
---

# Platform.sh One-Click

!!!include(developer-docs/latest/setup-deployment-guides/snippets/one-click-install-not-updated.md)!!!

The following documentation will guide you through the one-click creation of a new Strapi project hosted on [Platform.sh](https://platform.sh/).

Platform.sh is a Platform as a Service (PaaS) that allows the management of multiple websites and applications. In particular, it allows to quickly install and deploy a Strapi application.

::: prerequisites
A Platform.sh account is necessary to follow this installation guide. Please visit the [Platform.sh website](https://console.platform.sh/) to create an account if you don't already have one.
:::

## Creating a Strapi project

There are 2 ways to create a new project hosted on Platform.sh: either by clicking the **One-Click** button, or following the numbered steps right below the button.

<a href="https://console.platform.sh/projects/create-project?template=https://raw.githubusercontent.com/platformsh/template-builder/master/templates/strapi/.platform.template.yaml&utm_content=strapi&utm_source=github&utm_medium=button&utm_campaign=deploy_on_platform">
    <img src="https://platform.sh/images/deploy/lg-blue.svg" alt="Deploy on Platform.sh" width="180px" />
</a>

1. In the [Platform.sh website](https://console.platform.sh/), click on the **Add project** button.
2. Select the *Use a template* option.
3. Fill the *Project name* and *Region* fields.
4. Click on the **Next** button.
5. Using the search bar, search for the `Strapi` template (see [source code](https://github.com/platformsh-templates/strapi#customizations)).
6. Select the template. After a few seconds, your Strapi application should be setup with a PostgreSQL database.

## Running Strapi

To visit your Strapi application:

1. Go to the [Platform.sh website](https://console.platform.sh/), logged in.
2. Go to *Settings > Domains*.
3. Click on the Platform.sh domain name that is used for your Strapi application.
