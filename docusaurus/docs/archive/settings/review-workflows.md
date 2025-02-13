---
title: Review Workflows
description: Managing your review workflows and stages in Strapi.
tags:
- admin panel
- review workflows
- Enterprise feature
- Strapi Cloud
---

# Managing Review Workflows
<EnterpriseBadge /> <CloudTeamBadge/>

The Review Workflows feature allows you to create and manage workflows for your various content-types. Each workflow can consist of any review stages for your content, enabling your team to collaborate in the content creation flow from draft to publication.

<ThemedImage
  alt="Workflow list view"
  sources={{
    light: '/img/assets/review-workflows/list-view-light.png',
    dark: '/img/assets/review-workflows/list-view-dark.png',
  }}
/>

In many organizations different teams review different parts of content. By using different review workflows for different content-types, it is possible to adjust each workflow to the needs of each team involved.

The default workflow is configured to have 4 stages: To do, In progress, Ready to review, and Reviewed. All 4 stages can be edited, reordered or deleted as needed, and it is also possible to add new stages.

Before being available in the [Content Manager](/cms/content-manager/reviewing-content), review workflows must be configured from ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Global settings > Review Workflows*. The Review workflows settings are only available to users with the Super Admin role by default. Other roles must be granted the **Review workflows** permissions. See [Users, Roles, & Permissions](/cms/features/users-permissions) for more information.

## Creating or editing a workflow

<ThemedImage
  alt="Workflow edit view"
  sources={{
    light: '/img/assets/review-workflows/edit-view-light.png',
    dark: '/img/assets/review-workflows/edit-view-dark.png',
  }}
/>

1. Click on the **Create new workflow** button or on the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) of a workflow.
2. In the workflow edit interface, configure the new workflow:

    | Setting name   | Instructions                                                             |
    | -------------- | ------------------------------------------------------------------------ |
    | Workflow name  | Write a unique name of workflow.                                         |
    | Associated to  | (optional) Assign this workflow to one or more existing content-types.   |
    | Stages         | Add review stages (see [Adding a new stage](#adding-a-new-stage)).       |

3. Click on the **Save** button. The new workflow will be displayed in the list-view and for every content-type assigned.

:::note
The maximum number of [workflows and stages per workflow is limited](https://strapi.io/pricing-cloud).
:::


### Adding a new stage

To add a new stage in the review workflows:

1. Click on the **Add new stage** button.
2. Write the *Stage name*.
3. Select a *Color*.
4. Select *Roles* that can change the stage, if the entity is currently in that review stage.
5. Click on the **Save** button.

By default new stages are appended, but they can be reordered anytime using the <Icon name="dots-six-vertical" /> button.

:::tip
To set up roles for each stage, you can either click "Apply to all stages" to apply the current roles to all other stages of the workflow or use "Duplicate stage" of the stage context menu.
:::


### Duplicating a stage

1. Click **Duplicate Stage** in the context menu of the stage.
2. Change the name of the duplicated stage.
2. Click on the **Save** button.


### Deleting a stage

To delete a stage, click ![More](/img/assets/icons/v5/More.svg) in the context menu of the stage, then **Delete**.

If you delete a stage that has pending reviews, the reviews will be moved to first stage in the workflow. Every workflow needs to
contain at least one stage and therefore it is not possible to delete the last stage.


## Deleting a workflow

To delete a workflow click on the delete button ![Delete icon](/img/assets/icons/v5/Trash.svg) of a workflow in the list view.

:::note
It is not possible to delete the last workflow.
:::

<FeedbackPlaceholder />
