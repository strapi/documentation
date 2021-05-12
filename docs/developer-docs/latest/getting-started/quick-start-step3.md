---
title: Quick Start Guide - Step 3
description: Get ready to get Strapi, your favorite open-source headless cms up and running in less than 3 minutes.
sidebarDepth: 0
prev: ./quick-start-step2
next: ./troubleshooting.md
---

# Quick Start Guide

<style lang="scss" scoped>
  h2 {
    padding-top: 2em;
  }
  h3, h4 {
    padding-top: 1.5em
  }
  h4 {
    font-size: 115%;
  }
  ul li, ol li {
    padding-bottom: .5em;
  }
  blockquote {
    border-left-color: #42b983;

    p {
      color: #888;
    }
  }
</style>

First, make sure that you have completed [step 1](/developer-docs/latest/getting-started/quick-start-step1.md) to create your project and [step2](/developer-docs/latest/getting-started/quick-start-step2.md) to get familiar with content creation using Strapi.

If you used a starter to quickly spin up your fullstack application, you're ready to deploy your content: choose the **Starters** path.

If you created the app and built the data structure yourself, choose the **Hands-on** path to learn about various options of consuming your API and deploying your content.


::::: tabs type:card
<!-- we need 5 colons or it will conflict with the tip markup -->

:::: tab Starters

<!-- We use the vuepress-plugin-tabs plugin but customize tabs to look more like buttons -->
<style lang="scss">
  .el-tabs__header {
    padding-top: 2em;
  }

  .el-tabs--card > .el-tabs__header,
  .el-tabs--card > .el-tabs__header .el-tabs__nav {
    border: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    border-radius: 8px;
    border: solid 1px rgba(129,107,250,.2);
    font-size: 100%;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
    border-left: solid 1px rgba(129,107,250,.2);
    margin-right: 8px;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    background-color: rgba(129,107,250,0.9);
    color: white !important;
    font-weight: bold;
    border-color: rgb(129,107,250);
  }

</style>

## 👀 Step 3: Show your content to the world

The beauty of using Strapi starters is that your Strapi backend comes with a frontend ready out-of-the-box. Now you probably want to show your shiny new website to the world!

The next step is then to deploy both your Strapi backend and the frontend on the platforms of your choice.
We offer various deployment options for your Strapi backend — see our [Deployment guides](/developer-docs/latest/setup-deployment-guides/deployment.md).

:::tip TIP
Once your Strapi backend is deployed, the easiest way to deploy your Gatsby blog frontend is probably [to deploy on Gatsby Cloud](https://support.gatsbyjs.com/hc/en-us/articles/360052324714-Connecting-to-Strapi).
:::

## ⏩ Where to go next?

- Read more about the [starters CLI](https://strapi.io/blog/announcing-the-strapi-starter-cli) on our blog.
- Start another project! We have lots of other [Starters](https://strapi.io/starters) you can use to kickstart your blog, e-commerce, corporate website, or portfolio project.
- Have a look at the [Tutorials](https://strapi.io/tutorials) to deep dive into Strapi.
- Get help on [our community forum](https://forum.strapi.io).
- Read the [source code](https://github.com/strapi/strapi), [contribute](https://github.com/strapi/strapi/blob/master/CONTRIBUTING.md) or [give a star](https://github.com/strapi/strapi) on GitHub.
- Follow us on [Twitter](https://twitter.com/strapijs) to get the latest news.
- [Join the vibrant and active Strapi community](https://slack.strapi.io) on Slack.
::::

:::: tab Hands-on

## 👀 Step 3: Show your content to the world

### Consume your API

You can consume your API with your favorite frameworks, frontend or backend programming languages just below.

<style lang="scss" scoped>
/* .integration-links {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.install-link__wrapper {
  flex-basis: 30%;
  margin-right: 20px;
  max-width: 200px;
} */
</style>

<IntegrationLinks></IntegrationLinks>

### Deploy your project

The next step is to deploy both your Strapi backend and the frontend on the platforms of your choice.
We offer various deployment options for your Strapi backend — see our [Deployment guides](/developer-docs/latest/setup-deployment-guides/deployment.md).

## ⏩ Where to go next?

- Have a look at the [Tutorials](https://strapi.io/tutorials) to deep dive into Strapi.
- Get help on [our community forum](https://forum.strapi.io).
- Read the [source code](https://github.com/strapi/strapi), [contribute](https://github.com/strapi/strapi/blob/master/CONTRIBUTING.md) or [give a star](https://github.com/strapi/strapi) on GitHub.
- Follow us on [Twitter](https://twitter.com/strapijs) to get the latest news.
- [Join the vibrant and active Strapi community](https://slack.strapi.io) on Slack.

::::

:::::
