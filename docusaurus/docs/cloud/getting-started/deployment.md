---
title: Strapi Cloud - Dashboard deployment
displayed_sidebar: cloudSidebar
description: Learn how to deploy your Strapi application on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/getting-started/deployment.html
sidebar_label: with Cloud dashboard 
sidebar_position: 2
tags:
- billing details
- deployment
- project creation
- environment 
- general deployment guidelines
- Strapi Cloud
- Strapi Cloud plan
---

# Project deployment with the Cloud dashboard

This is a step-by-step guide for deploying your project on Strapi Cloud for the first time, using the Cloud dashboard.

:::prerequisites
Before you can deploy your Strapi application on Strapi Cloud using the Cloud dashboard, you need to have the following prerequisites:

* Strapi version `4.8.2` or higher
* Project database must be compatible with PostgreSQL. Strapi does not support and does not recommend using any external databases, though it's possible to configure one (see [advanced database configuration](/cloud/advanced/database)).
* Project source code hosted on <ExternalLink to="https://github.com" text="GitHub"/> or <ExternalLink to="https://about.gitlab.com/" text="GitLab"/>. The connected repository can contain multiple Strapi applications. Each Strapi app must be in a separate directory.
* Specifically for GitLab: at least have "<ExternalLink to="https://docs.gitlab.com/ee/user/permissions.html" text="Maintainer"/>" permissions for the project to import on Strapi Cloud.
:::

## Logging in to Strapi Cloud

1. Navigate to the <ExternalLink to="https://cloud.strapi.io" text="Strapi Cloud"/> login page.

2. You have the options to **Log in with GitHub**, **Log in with Google**, **Log in with GitLab** or **Magic link**. Choose your preferred option and log in. This initial login will create your Strapi Cloud account. Once logged in, you will be redirected to the Strapi Cloud *Projects* page where you can create your first Strapi Cloud project.

    <ThemedImage
    alt="Strapi Cloud login page"
    sources={{
        light: '/img/assets/cloud/login.png',
        dark: '/img/assets/cloud/login_DARK.png',
    }}
    />

## Creating a project {#deploying-a-project}

1. From the *Projects* page, click the **Create project** button.

    <ThemedImage
    alt="Strapi Cloud Projects page"
    sources={{
        light: '/img/assets/cloud/projects-empty.png',
        dark: '/img/assets/cloud/projects-empty_DARK.png',
    }}
    />

2. You will be redirected to the project creation interface. This interface contains 3 steps: choosing a plan, connecting a remote git repository, and setting up the project.

    <ThemedImage
    alt="Strapi Cloud project creation, step 1"
    sources={{
        light: '/img/assets/cloud/project-creation-1-2.png',
        dark: '/img/assets/cloud/project-creation-1-2_DARK.png',
    }}
    />

3. Choose a plan for your Strapi Cloud project: either Free, Essential, Pro, or Scale. Feel free to refer to [Pricing](https://strapi.io/pricing-cloud) for more information.

4. Connect a git repository to your new Strapi Cloud project.

    :::strapi Choose your path for your new Strapi Cloud project!
    Select one of the tabs below depending on how you wish to proceed:
    - by using a prebuilt template and creating a new repository on GitHub to discover Strapi Cloud easily and quickly *(recommended for new users and beginners — not available on another provider than GitHub)*,
    - or by using your own, already existing GitHub or GitLab repository and Strapi project.
    :::

    <Tabs groupId="REPO-OPTIONS">

    <TabItem value="TEMPLATE" label="New repo & prebuilt template ✨">

    4.a. Click on the **Use template** button. If you are deploying a project for the first time, you may first have to select GitHub as git provider and then you will see the option to use a template. 

    4.b. In the *Create repository with template* modal, choose:
    
    - the GitHub account where the repository will be created
    - the template to use for the new project (e.g. Blog)

    <ThemedImage
    alt="Create repo with template modal"
    width="60%"
    sources={{
        light: '/img/assets/cloud/template-modal.png',
        dark: '/img/assets/cloud/template-modal_DARK.png',
    }}
    />
    
    4.c. Click on the **Create repository** button. A modal will confirm the creation of the repository.

    4.d. If you have already given Strapi Cloud access to all repositories of your GitHub account, go directly to the next step. If not, you will be redirected to a GitHub modal where you will have to allow Strapi Cloud access to the newly created repository (more information in the <ExternalLink to="https://docs.github.com/en/apps/overview" text="GitHub documentation"/>).

    4.e. Back in the project deployment interface, select your *Account* and the *Repository* you just created.

    <ThemedImage
    alt="Selecting GitHub account and repository"
    sources={{
        light: '/img/assets/cloud/account-repo-selection.png',
        dark: '/img/assets/cloud/account-repo-selection_DARK.png',
    }}
    />

    </TabItem>

    <TabItem value="OWN-REPO" label="Own existing repo & Strapi project">


    4.a. (optional) If you are deploying a project for the first time, you may first have to select a git provider: either GitHub or GitLab. If you already deployed a project with one git provider, you can afterward deploy another project using another provider by clicking on the **Switch git provider** button and selecting either GitHub or GitLab.

    :::tip
    Connect the GitHub or GitLab account and/or organizations that owns the repository or repositories you want to deploy. This can be different from the account that own the Strapi Cloud account.
    :::
    :::note

    You can only connect a Github organization's repositories with Strapi Cloud paid plans. With the free plan, you can only connect a personal repository.
    :::

    4.b. If you have already given Strapi Cloud access to all repositories of your GitHub or GitLab account, go directly to the next step. If not, you will be redirected to a modal where you will have to allow Strapi Cloud permission to access some or all your repositories on GitHub/GitLab (more information in the <ExternalLink to="https://docs.github.com/en/apps/overview" text="GitHub"/> and <ExternalLink to="https://docs.gitlab.com/ee/integration/oauth_provider.html#view-all-authorized-applications" text="GitLab"/> documentations).

    4.c. Back in the project deployment interface, select your *Account* and a *Repository*. 

    <ThemedImage
    alt="Selecting git account and repository"
    sources={{
        light: '/img/assets/cloud/account-repo-selection.png',
        dark: '/img/assets/cloud/account-repo-selection_DARK.png',
    }}
    />

    </TabItem>

    </Tabs>

5. Set up your Strapi Cloud project.

    5.a. Fill in the following information:

    | Setting name | Instructions                                                                                            |
    |--------------|---------------------------------------------------------------------------------------------------------|
    | Display name | Write the name of your Strapi app, this is fetched from the repository name but can be edited. It is automatically converted to slug format (`my-strapi-app`). |
    | Git branch   | Choose from the drop-down the branch you want to deploy. |
    | Deploy on push | Tick this box to automatically trigger a deployment when changes are pushed to your selected branch. When disabled, you will need to manually deploy the latest changes. |
    | Region       | Choose the geographic location of the servers where your Strapi application is hosted. Selected region can either be US (East), Europe (West), Asia (Southeast) or Oceania. |

    :::note
    The Git branch and "Deploy on push" settings can be modified afterwards through the project's settings, however the hosting region can only be chosen during the creation of the project (see [Project Settings](/cloud/projects/settings)).
    :::

    5.b. (optional) Click on **Show advanced settings** to fill in the following options:

    <ThemedImage
    alt="Project creation advanced settings"
    sources={{
        light: '/img/assets/cloud/advanced-settings.png',
        dark: '/img/assets/cloud/advanced-settings_DARK.png',
    }}
    />

    | Setting name | Instructions                                                                                            |
    |--------------|---------------------------------------------------------------------------------------------------------|
    | Base directory | Write the name of the directory where your Strapi app is located in the repository. This is useful if you have multiple Strapi apps in the same repository or if you have a monorepo. |
    | Environment variables | Click on **Add variable** to add environment variables used to configure your Strapi app (see [Environment variables](/cms/configurations/environment/) for more information). You can also add environment variables to your Strapi application by adding a `.env` file to the root of your Strapi app directory. The environment variables defined in the `.env` file will be used by Strapi Cloud. |
    | Node version | Choose a Node version from the drop-down. The default Node version will automatically be chosen to best match the version of your Strapi project. If you manually choose a version that doesn't match with your Strapi project, the build will fail but the explanation will be displayed in the build logs. |

    :::strapi Using Environment Variables
    You can use environment variable to connect your project to an external database rather than the default one used by Strapi Cloud (see [database configuration](/cms/configurations/database#environment-variables-in-database-configurations) for more details). If you would like to revert and use Strapi's default database again, you have to remove your `DATABASE_` environment variables (no automatic migration implied).

    You can also set up here a custom email provider. Sendgrid is set as the default one for the Strapi applications hosted on Strapi Cloud (see [providers configuration](/cms/features/email#providers) for more details).
    :::

## Setting up billing details

:::strapi No billing step for the Free plan
If you chose the free plan, this billing step will be skipped as you will not be asked to share your credit card details at the creation of the project.

To upgrade your project to a paid plan, you will need to fill in your billing information in the **Billing** section of your Profile.

<Icon name="fast-forward" /> Skip to step 5 of the section below to finalize the creation of your project.
:::

1. Click on the **Continue to billing** button. You will directly be redirected to the second and final project deployment interface. There you can review all your new project setup information, enter payment & billing details and receive your invoice.

    <ThemedImage
    alt="Payment & Billing"
    sources={{
        light: '/img/assets/cloud/project-creation-2.png',
        dark: '/img/assets/cloud/project-creation-2_DARK.png',
    }}
    />

2. Review your project: make sure the plan and setup information are correct. If needed, click the <Icon name="pencil-simple" /> **Edit** button to navigate back to the first step of the project creation and fix any mistake.

3. In the Payment section, fill in at least all mandatory elements for *Payment method* and *Billing information*.

4. Check your invoice which informs you of what should be paid now and the following month. Optionally, you can enter a *Discount code* if you have one.

5. Click on the **Create project** button to finalize the creation of your new Strapi Cloud project.

## Deploying your project

After confirming the project creation, you will be redirected to your *Project dashboard* where you will be able to follow its creation and first deployment. 

While your project is deploying, you can already start configuring some of your [project settings](/cloud/projects/settings).

<ThemedImage
    alt="Project creation steps"
    sources={{
        light: '/img/assets/cloud/project-creation-3.png',
        dark: '/img/assets/cloud/project-creation-3_DARK.png',
    }}
    />

:::note
If an error occurs during the project creation, the progress indicator will stop and display an error message. You will see a **Retry** button next to the failed step, allowing you to restart the creation process.
:::

Once you project is successfully deployed, the creation tracker will be replaced by your deployments list and you will be able to visit your Cloud hosted project. Don't forget to create the first Admin user before sharing your Strapi project.


## <Icon name="fast-forward" /> What to do next?

Now that you have deployed your project via the Cloud dashboard, we encourage you to explore the following ideas to have an even more complete Strapi Cloud experience:

- Invite other users to [collaborate on your project](/cloud/projects/collaboration).
- Check out the [deployments management documentation](/cloud/projects/deploys) to learn how to trigger new deployments for your project.
