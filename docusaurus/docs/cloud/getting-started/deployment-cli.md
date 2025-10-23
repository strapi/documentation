---
title: Strapi Cloud - CLI deployment
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application via the CLI.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment-cli.html
sidebar_position: 2
sidebar_label: with Cloud CLI
tags:
- Strapi Cloud
- deployment
- CLI
---

# Project deployment with the Command Line Interface (CLI)

This is a step-by-step guide for deploying your project on Strapi Cloud for the first time, using the Command Line Interface.

:::prerequisites
Before you can deploy your Strapi application on Strapi Cloud using the Command Line Interface, you need to have the following prerequisites:

- Have a Google, GitHub or GitLab account.
- Have an already created Strapi project (see [Installing from CLI in the CMS Documentation](/cms/installation/cli)), stored locally. The project must be less than 100MB.
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

4. In the browser window that opens automatically, confirm that the code displayed is the same as the one written in the terminal message.

5. Still in the browser window, choose whether to login via Google, GitHub or GitLab. The window should confirm the successful login soon after.

## Deploying your project

1. From your terminal, still from the folder of your Strapi project, enter the following command to deploy the project:

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
Deploying the project will create a new Strapi Cloud project on the Free plan.

### Automatically deploying subsequent changes

By default, when creating and deploying a project with the Cloud CLI, you need to manually deploy again all subsequent changes by running the corresponding `deploy` command everytime you make a change.

Another option is to enable automatic deployment through a git repository. To do so:

1. Host your code on a git repository, such as <ExternalLink to="https://www.github.com" text="GitHub"/> or <ExternalLink to="https://www.gitlab.com" text="GitLab"/>.
2. Connect your Strapi Cloud project to the repository (see the _Connected repository_ setting in [Projects Settings > General](/cloud/projects/settings#general)).
3. Still in _Projects Settings > General_ tab, tick the box for the "Deploy the project on every commit pushed to this branch" setting. From now on, a new deployment to Strapi Cloud will be triggered any time a commit is pushed to the connected git repository.

:::note
Automatic deployment is compatible with all other deployment methods, so once a git repository is connected, you can trigger a new deployment to Strapi Cloud [from the Cloud dashboard](/cloud/projects/deploys), [from the CLI](/cloud/cli/cloud-cli#strapi-deploy), or by pushing new commits to your connected repository.
:::

## ⏩ What to do next?

Now that you have deployed your project via the Command Line Interface, we encourage you to explore the following ideas to have an even more complete Strapi Cloud experience:

- Visit the Cloud dashboard to follow [insightful metrics and information](/cloud/projects/overview) on your Strapi project.
- Check out the full [Command Line Interface documentation](/cloud/cli/cloud-cli) to learn about the other commands available.
