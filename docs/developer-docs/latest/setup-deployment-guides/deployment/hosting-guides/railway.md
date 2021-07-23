---
title: Railway Deployment - Strapi Developer Documentation
description: Learn in this guide how to deploy your Strapi application on Railway.
---

# Railway

This is a step-by-step guide for deploying a Strapi project on [Railway](https://railway.app/).

### Railway install requirements

- A free Railway account is required for deploying the Strapi starter. If you don't already have one, it will be created for you.

### Create a new project

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Frailwayapp%2Fexamples%2Ftree%2Fmaster%2Fexamples%2Fstrapi&plugins=postgresql&envs=ADMIN_JWT_SECRET%2CCLOUDINARY_NAME%2CCLOUDINARY_KEY%2CCLOUDINARY_SECRET&optionalEnvs=CLOUDINARY_NAME%2CCLOUDINARY_KEY%2CCLOUDINARY_SECRET&ADMIN_JWT_SECRETDesc=Secret+used+to+encode+JWT+tokens)

Click the button above to deploy the Strapi starter on Railway. By default, it uses Postgres (which is provisioned automagically) as the database and Cloudinary for storage.

### Use an existing project

Railway can also be used to deploy existing Strapi projects with an external upload provider. As for the database, Railway providers plugins and automatic provision of [PostgreSQL](https://docs.railway.app/plugins/postgresql), [MySQL](https://docs.railway.app/plugins/mysql), and [MongoDB](https://docs.railway.app/plugins/mongodb).

### File uploads

Railway's file system is ephemeral which is why you will need to use an upload provider such as AWS S3, Cloudinary, or Rackspace (see [documentation for installing providers](/developer-docs/latest/development/plugins/upload.md#create-providers)). A list of providers from both Strapi and the community is available on [npmjs.com](https://www.npmjs.com/search?q=strapi-provider-upload-&page=0&perPage=20).
