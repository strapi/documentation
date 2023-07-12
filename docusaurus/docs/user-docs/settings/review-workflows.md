---
title: Review Workflows
description: Managing your review workflows and stages in Strapi.
---

# Managing Review Workflows <EnterpriseBadge />

The Review Workflows feature allows you to create and manage any desired review stages for your content, enabling your team to collaborate in the content creation flow from draft to publication. Before being available in the [Content Manager](/user-docs/content-manager/reviewing-content) and [Content-Types Builder](/user-docs/content-type-builder), review workflows should be configured from ![Settings icon](/img/assets/icons/settings.svg) *Settings > Global settings > Review Workflows*.

:::note
- The Review workflows settings are only available to users with the Super Admin role by default. Other roles must be granted the **Review workflows** permission. See [Users, Roles, & Permissions](/user-docs/users-roles-permissions) for more information.
- Review Workflows are only available with the Enterprise Edition. If for any reason your project was downgraded to the Community Edition, all review workflows data would not be deleted but kept until the project goes back to Enterprise.
:::

<ThemedImage
  alt="Review Workflows Settings"
  sources={{
    light: '/img/assets/review-workflows/review-workflows.png',
    dark: '/img/assets/review-workflows/review-workflows_DARK.png',
  }}
/>

There are 4 stages in the default review workflow available in Strapi: To do, In progress, Ready to review, and Reviewed. All 4 stages can be edited, reordered or deleted as needed, and it is also possible to add new stages.

## Adding a new stage

To add a new stage in the review workflows:

1. Click on the **Add new stage** button.
2. Write the *Stage name*.
3. Select a *Color*
3. Click on the **Save** button.

:::tip
By default new stages are appended, but they can be reordered anytime using the ![drag & drop](/img/assets/icons/drag.svg) button.
:::

## Deleting a stage

:::warning Pending reviews on deleted stages
If you delete a stage that has pending reviews, the reviews will be moved to first stage in the workflow.
:::

To delete a stage from the review workflows:

1. Click on the ![delete button](/img/assets/icons/delete.svg) **Delete** button next to the stage you want to remove.
2. Click on the **Save** button: a confirmation modal will appear to confirm the deletion.

<FeedbackPlaceholder />
