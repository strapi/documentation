
---title: DigitalOcean App Platform Deployment - Strapi Developer Docs
description: Learn in this guide how to deploy your Strapi application on DigitalOcean App Platform.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform-2022.html
---

# Deploying to Digital Ocean App Platform

After creating a Strapi application in a local environment it is useful to evaluate the app in a production environment. The purpose of this guide is to allow users to deploy Strapi applications on the Digital Ocean App Platform. While both Strapi and Digital Ocean App Platform can work with multiple types of databases the focus is on connecting to a development database so users can test their application in a deployed environment. Future additions to the guide will address different database options. This guide does not cover migrating local database content to a production database or connecting front-end applications to the Digital Ocean App Platform.

::: caution
Strapi maintains deployment guides to assist users in deploying projects. Since there are frequent updates to the Strapi app and to the hosting provider platforms, the guides are sometimes out of date. If you encounter an issue deploying your project following this guide, please open an issue on GitHub.
:::

## Prerequsites 

Digital Ocean App Platform deployment will require a Digital Ocean account and a GitHub account. 

## Setting up a Strapi project for deployment

<!-- proposal is to move this content to the main deployment page once all of the guides are modified for consistency-->
Strapi uses environment configurations <!--link--> to maintain multiple environments inside a single application. This section describes how to setup a production environment in a Strapi application.

<!--steps should be numbered-->

- [Create a new Strapi application using the quickstart flag](link) or navigate to the root directory of an existing Strapi application. <!-- insert create strapi app stuff here-->

::: details - Setup Git version control and connect to a remote repository,

:::

- Create the sub-directory `config/env/production`
- Create `database.js` and `server.js` files (`.ts` for TypeScript projects)

### Configuring `env/production/database`
<!-- ts and js code examples-->

### Configuring `env/production/server`
<!-- ts and js code examples-->


### Adding postgres dependencies
<!-- yarn and npm commands-->


### Committing the project to a remote repository 

## Creating a Digital Ocean App 

<!-- intro to the nomenclature for DO AP-->

### Connecting to GitHub repository 

### Connecting web app to a database 

### Environmental variables 

::: caution
The environmental variables for the development and managed database are handled differently by DO. When connected to a managed database DO handles the environmental variables automatically. Check the .yaml file to confirm the db settings are not duplicated if using a managed database.
:::

### Deploying the Strapi application


## Accessing the application in the production environment

