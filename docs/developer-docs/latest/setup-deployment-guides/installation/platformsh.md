---
title: Install using Platform.sh - Strapi Developer Documentation
description: Quickly deploy a Strapi application using the official Platform.sh Strapi template.
---

# Platform.sh One-Click

The following documentation will guide you through the one-click creation of a Strapi project deployed on [Platform.sh](https://platform.sh/).

Platform.sh is a Platform-as-a-Service that allows the management of multiple websites and applications. In particular, it allows to quickly install and deploy a Strapi application.

::: warning PREREQUISITES
A Platform.sh account is necessary to follow this installation guide. Please visit the [Platform.sh website](https://console.platform.sh/) to create an account if you don't already have one.
:::

## Creating a Strapi project deployed on Platform.sh

There are 2 ways to create a new project deployed on Platform.sh: either by clicking the **One-Click** button, or following the numbered steps right below the button.

<a href="https://console.platform.sh/projects/create-project?template=https://raw.githubusercontent.com/platformsh/template-builder/master/templates/strapi/.platform.template.yaml&utm_content=strapi&utm_source=github&utm_medium=button&utm_campaign=deploy_on_platform">
    <img src="https://platform.sh/images/deploy/lg-blue.svg" alt="Deploy on Platform.sh" width="180px" />
</a>

1. In the [Platform.sh website](https://console.platform.sh/), click on the **Add project** button.
2. Select the *Use a template* option.
3. Click on the **Next** button.
4. Fill the *Project name* and *Region* fields.
5. Click on the **Next** button.
6. Using the search bar, search for the `Strapi` template (see [source code](https://github.com/platformsh-templates/strapi#customizations)).
7. Select the template.
8. Click on the **Next** button. After a few seconds, your Strapi application deployed with Platform.sh should be setup with a PostgreSQL database.

## Running the Strapi application

To visit your Strapi application:

1. Go to the [Platform.sh website](https://console.platform.sh/), logged in.
2. Go to *Settings > Domains*.
3. Click on the Platform.sh domain name that is used for your Strapi application.
