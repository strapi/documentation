# 21YunBox

[21YunBox](https://www.21yunbox.com) provides blazing fast Chinese CDN, continuous deployment, one-click HTTPS and [other services like managed databases and backend web services](https://www.21yunbox.com/docs/#/), providing an avenue to launch web projects in China.

21YunBox includes the following features:

- Continuous, automatic builds & deploys from GitHub and Gitee
- Automatic SSL certificates through [Let's Encrypt](https://letsencrypt.org)
- Instant cache invalidation with a blazing fast, Chinese CDN
- Unlimited [custom domains](https://www.21yunbox.com/docs/#/custom-domains)
- Automatic [Brotli compression](https://en.wikipedia.org/wiki/Brotli) for faster sites
- Native HTTP/2 support
- Automatic HTTP → HTTPS redirects
- Custom URL redirects and rewrites

This guide explains how to update an existing Strapi project so it can be deployed on [21YunBox](https://www.21yunbox.com).

With persistent disks and managed PostgreSQL databases, 21YunBox gives you multiple different ways to store your content. 21YunBox services come with fully managed SSL, so it's no longer necessary to set up a proxy server to secure your Strapi app. Since 21YunBox services are automatically restarted if they become unresponsive, you don't need to use a process manager like `pm2` either.

::: tip
For more information consult [21YunBox's Deploy Strapi guide](https://www.21yunbox.com/docs/#/deploy-strapi)
:::


## Prerequisites

This guide assumes you already have a Strapi project to deploy. If you need a project, use the [Quick Start](/getting-started/quick-start) to get started or fork 21YunBox's Strapi Examples:
- [Strapi with SQLite Starter](https://gitee.com/eryiyunbox-examples/hello-strapi-sqlite)
- [Strapi with Postgres Starter](https://gitee.com/eryiyunbox-examples/hello-strapi-postgres)

## Setup

You can set up a Strapi CMS on 21YunBox in four quick steps:

1. Create a 21YunBox Account. Visit [21YunBox dashboard](https://https://www.21yunbox.com/u/signup/) to create an account if you don't already have one.
2. Create a new web service on 21YunBox, and give 21YunBox permission to access your GitHub or Gitee repo.
3. Use the following values during creation:

   | Setting               | Value                                                 |
   | --------------------- | ------------------------------------------------ |
   | **Environment**       | `Node 12.19`                                    |
   | **Build Command**     | `yarn && yarn build` (or your own build command) |
   | **Publish Directory** | `rsync -a public/ /data/public/ && yarn start` (or your own output directory)        |

4. Add the following environment variables, then press the "Deploy" button.

   | Setting               | Value                                                 |
   | --------------------- | ------------------------------------------------ |
   | **NODE_ENV**       | `production`                                    |
   | **DATABASE_FILENAME**     | If you use SQLite database, use `/data/strapi.db`|
   | **DATABASE_URL**     | If you use Postgres database, paste the database URL here (we have demo video below if you are unsure)|

That's it! Your site will be live on your 21YunBox URL (which looks like `yoursite.21yunbox.com`) as soon as the build is done.

If you are unsure the steps above, we have created few webcast for the steps above, you can view them at:
- Part 1: [Demo how to deploy Strapi with SQLite in production](https://www.bilibili.com/video/BV1fK4y1j7U8?zw)
- Part 2: [Demo how to get in the development mode and create content on Strapi](https://www.bilibili.com/video/BV1Ta4y1W7bD?zw)
- Part 3: [Demo how to deploy Strapi with database in production](https://www.bilibili.com/video/BV1Nf4y1k7ZP/)

## Continuous deploys

Now that 21YunBox is connected to your repo, it will automatically build and publish your site any time you push to Gitee or GitHub.

## Custom domains

Add your own domains to your site easily using 21YunBox's [custom domains](https://www.21yunbox.com/docs/#/custom-domains) guide.

## Questions?

[Contact us](https://www.21yunbox.com/docs/#/contact) if you need customized deployment with Strapi.
