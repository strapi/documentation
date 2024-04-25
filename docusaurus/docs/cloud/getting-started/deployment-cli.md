---
title: with Cloud CLI
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application via the CLI.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment-cli.html
sidebar_position: 2
---

# Project deployment with the Command Line Interface (CLI)

This is a step-by-step guide for deploying your project on Strapi Cloud for the first time, using the Command Line Interface.

<!--
:::strapi Cloud dashboard VS Cloud CLI
This guide only focuses on deploying a project using the Cloud Command Line Interface. If you prefer to deploy your project via the user interface (called "Cloud dashboard"), please refer to the [dedicated step-by-step guide](/cloud/getting-started/deployment).
:::
-->

:::prerequisites
Before you can deploy your Strapi application on Strapi Cloud using the Command Line Interface, you need to have the following prerequisites:

- Be a first-time Strapi Cloud user: you must never have deployed a project with Strapi Cloud before, and your free trial must still be available.
- Have a Google, GitHub or GitLab account.
- Have an already created Strapi project, stored locally. The project must be less than 100MB.
- Have available storage in your hard drive where the temporary folder of your operating system is stored.
:::

## Logging in to Strapi Cloud

1. Open your terminal.

2. Navigate to the folder of your Strapi project, stored locally on your computer.

3. Enter the following command to log into Strapi Cloud:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi login
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npx run strapi login
```

</TabItem>
</Tabs>

4. In the browser window that opens automatically, choose whether to login via Google, GitHub or GitLab. The window should confirm the successful login soon after.

## Deploying your project

1. Still from your terminal and still from the folder of your Strapi project, enter the following command to deploy the project:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi deploy
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npx run strapi deploy
```

</TabItem>
</Tabs>

2. Follow the progression bar in the terminal until confirmation that the project was successfully deployed with Strapi Cloud.

## ⏩ What to do next?

Now that you have deployed your project via the Command Line Interface, we encourage you to explore the following ideas to have an even more complete Strapi Cloud experience:

- Fill in your [billing information](/cloud/account/account-billing) to prevent your project from being suspended at the end of the trial period.
- Visit the Cloud dashboard to follow [insightful metrics and information](/cloud/projects/overview) on your Strapi project.
- Check out the full [Command Line Interface documentation](/cloud/cli/cloud-cli) to learn about the other commands available.