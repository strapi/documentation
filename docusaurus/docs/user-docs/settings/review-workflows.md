---
title: Review Workflows
description: Managing your review workflows and stages in Strapi.
---

# Managing Review Workflows <EnterpriseBadge />

The Review Workflows feature allows you to create and manage different workflows for different content-types. Each workflow can consist of any review stages for your content, enabling your team to collaborate in the content creation flow from draft to publication.

<ThemedImage
  alt="Workflow list view"
  sources={{
    light: '/img/assets/review-workflows/list-view-light.png',
    dark: '/img/assets/review-workflows/list-view-dark.png',
  }}
/>

In many organizations different teams review different parts of content. By using different review workflows for different content-types, it is possible to adjust each workflows to the needs of each team involved. The default workflow is configured to have 4 stages: To do, In progress, Ready to review, and Reviewed. All 4 stages can be edited, reordered or deleted as needed, and it is also possible to add new stages.

Before being available in the [Content Manager](/user-docs/content-manager/reviewing-content), review workflows must be configured from ![Settings icon](/img/assets/icons/settings.svg) *Settings > Global settings > Review Workflows*.

:::note
- The Review workflows settings are only available to users with the Super Admin role by default. Other roles must be granted the **Review workflows** permission. See [Users, Roles, & Permissions](/user-docs/users-roles-permissions) for more information.
- Review Workflows are only available with the Enterprise Edition. If for any reason your project was downgraded to the Community Edition, all review workflows data would not be deleted but kept until the project goes back to Enterprise.
:::


## Creating or editing a workflow

<ThemedImage
  alt="Workflow edit view"
  sources={{
    light: '/img/assets/review-workflows/edit-view-light.png',
    dark: '/img/assets/review-workflows/edit-view-dark.png',
  }}
/>

1. Click on the **Create new workflow** button or on the edit button ![Edit icon](/img/assets/icons/edit.svg) of a workflow.
2. In the workflow edit interface, configure the new workflow:

    | Setting name   | Instructions                                                             |
    | -------------- | ------------------------------------------------------------------------ |
    | Name           | Write a unique name of workflow.                                         |
    | Content-Types  | (optional) Assign this workflow to one or more existing content-types.   |
    | Stages         | Add review stages.                                                       |

3. Click on the **Save** button. The new workflow will be displayed in the list-view and for every content-type assigned.

:::note
- If a content-type is already assigned to another workflow, it will be re-assigned to the one currently created/ edited.
- The maximum number of [workflows and stages per workflow is limited](https://strapi.io/pricing-cloud).
:::


### Adding a new stage

To add a new stage in the review workflows:

1. Click on the **Add new stage** button.
2. Write the *Stage name*.
3. Select a *Color*
3. Click on the **Save** button.

By default new stages are appended, but they can be reordered anytime using the ![drag & drop](/img/assets/icons/drag.svg) button.


### Deleting a stage

1. Click on the ![delete button](/img/assets/icons/delete.svg) **Delete** button next to the stage you want to remove.
2. Click on the **Save** button: a confirmation modal will appear to confirm the deletion.

If you delete a stage that has pending reviews, the reviews will be moved to first stage in the workflow. Every workflow needs to
contain at least one stage and therefore it is not possible to delete the last stage.


## Deleting a workflow

To delete a workflow click on the delete button ![Delete icon](/img/assets/icons/delete.svg) of a workflow in the list view.

:::note
It is not possible to delete the last workflow.
:::

<FeedbackPlaceholder />
