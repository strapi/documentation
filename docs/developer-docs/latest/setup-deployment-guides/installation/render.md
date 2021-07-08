---
title: Render One-Click - Strapi Developer Documentation
description: Quickly deploy a Strapi application on Render by simply using their One-click button.
---

<style lang="scss" scoped>
  /*
    We override the :::warning callout for specific uses here.
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
</style>

# Render One-Click

The following documentation will guide you through the one-click creation of a new Strapi project hosted on [Render](https://render.com).

Render is a cloud provider with persistent disks and managed PostgreSQL databases, that offers multiple different ways to store content.

::: warning PREREQUISITES
A Render account is necessary to follow this installation guide. Please visit [the Render dashboard](https://dashboard.render.com) to create an account if you do not already have one.
:::

## Creating a Strapi project

Render maintains 3 "Strapi on Render" example repositories (see [Render's Deploy Strapi guide](https://render.com/docs/deploy-strapi) for more information), which differ based on the databased used and the storage location of uploaded media library files:

- [Strapi with SQLite and uploads on disk](https://github.com/render-examples/strapi-sqlite)
- [Strapi with PostgreSQL and uploads on Cloudinary](https://github.com/render-examples/strapi-postgres-cloudinary)
- [Strapi with PostgreSQL and uploads on disk](https://github.com/render-examples/strapi-postgres)

Once the choice between the 3 repositories is made:

1. Fork the repository on GitHub.
2. In the README file of your forked repository, click the **Deploy on Render** button.
3. Make sure you granted Render the permission to access your forked repository. <!-- Need more info here -->

::: tip NOTE
When using Cloudinary, you will be prompted to enter your account credentials as environment variables. Render encrypts environment variables and stores them securely.
:::

## Running Strapi

Your Strapi application on Render will be running in production mode, with `NODE_ENV=production`. <!-- Need more info here --> However, to add or edit content-types via the admin panel (see [Content-Types Builder](https://strapi.io/documentation/user-docs/latest/content-types-builder/introduction-to-content-types-builder.html) documentation), Strapi must be running locally in development mode.

To run Strapi locally:

1. Clone the forked repository to your local machine.
2. Still in terminal, access the repository using the `cd <repository-name>` command.
3. Run the `yarn install && yarn develop` command to run your Strapi project.

When committing changes and pushing them to your remote repository, Render will automatically deploy these changes to your production application. A [typical workflow](https://render.com/docs/deploy-strapi#development-%E2%86%92-staging-%E2%86%92-production) would also include a staging environment for testing.
