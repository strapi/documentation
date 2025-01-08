---
title: Review Workflows
description: Learn how to use the Review Workflows feature that enables the creation and management of workflows for your various content-types
toc_max_heading_level: 5
tags:
- admin panel
- Enterprise feature
- Review Workflows feature
---

# Review Workflows
<EnterpriseBadge />

The Review Workflows feature allows you to create and manage workflows for your various content-types. Each workflow can consist of any review stages for your content, enabling your team to collaborate in the content creation flow from draft to publication.

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Enterprise Edition. <br/>
<Icon name="user"/> **Role & permission:** Super Admin role in project's admin panel. <br/>
<Icon name="toggle-left"/> **Activation:** Available by default, if required plan. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

<ThemedImage
  alt="Review Stage column"
  sources={{
    light: '/img/assets/content-manager/review-workflow-list-view.png',
    dark: '/img/assets/content-manager/review-workflow-list-view_DARK.png',
  }}
/>

## Configuration

**Path to configure the feature:** ![Settings icon](/img/assets/icons/v5/Cog.svg) Settings > Global settings > Review Workflows

For the review workflows to be usable in the Content Manager, the default one should be configured or a new one should be created.

The default workflow is configured to have 4 stages: To do, In progress, Ready to review, and Reviewed. All 4 stages can be edited, reordered or deleted as needed, and it is also possible to add new stages.

### Creating a new workflow

1. Click on the **Create new workflow** button or on the edit button ![Edit icon](/img/assets/icons/v5/Pencil.svg) of a workflow.
2. In the workflow edit interface, configure the new workflow:
    | Setting name   | Instructions                                                             |
    | -------------- | ------------------------------------------------------------------------ |
    | Workflow name  | Write a unique name of workflow.                                         |
    | Associated to  | (optional) Assign this workflow to one or more existing content-types.   |
    | Stages         | Add review stages (see [Adding a new stage](#adding-a-new-stage)).       |
3. Click on the **Save** button. The new workflow will be displayed in the list view and for every content-type assigned.

:::note
The maximum number of [workflows and stages per workflow is limited](https://strapi.io/pricing-cloud).
:::

### Editing a workflow

<ThemedImage
  alt="Workflow edit view"
  sources={{
    light: '/img/assets/review-workflows/edit-view-light.png',
    dark: '/img/assets/review-workflows/edit-view-dark.png',
  }}
/>

#### Adding a new stage

1. Click on the **Add new stage** button.
2. Write the *Stage name*.
3. Select a *Color*.
4. Select *Roles* that can change the stage, if the entity is currently in that review stage.
5. Click on the **Save** button.

By default new stages are appended, but they can be reordered anytime using the ![drag & drop](/img/assets/icons/v5/Drag.svg) button.

:::tip
To set up roles for each stage, you can either click "Apply to all stages" to apply the current roles to all other stages of the workflow or use "Duplicate stage" of the stage context menu.
:::

#### Duplicating a stage

1. Click **Duplicate Stage** in the context menu of the stage.
2. Change the name of the duplicated stage.
2. Click on the **Save** button.

#### Deleting a stage

To delete a stage, click ![More](/img/assets/icons/v5/More.svg) in the context menu of the stage, then **Delete**.

If you delete a stage that has pending reviews, the reviews will be moved to first stage in the workflow. Every workflow needs to
contain at least one stage and therefore it is not possible to delete the last stage.

### Deleting a workflow

To delete a workflow click on the delete button ![Delete icon](/img/assets/icons/v5/Trash.svg) of a workflow in the list view.

:::note
It is not possible to delete the last workflow.
:::

## Usage

**Path to use the feature:** ![Content icon](/img/assets/icons/v5/Feather.svg) Content Manager

### Change review stage

As content is created and revised among your team, you can change the review stage of the content to any stage defined in the review workflow (see [Managing Review Workflows](/user-docs/settings/review-workflows)).

To change the review stage of your content:

1. Access the edit view of your content-type.
2. In the *Review Workflows* box on the right side of the interface, click on the _Review stage_ drop-down list.
3. Choose the new review stage of your entry. It is automatically saved.

<ThemedImage
  alt="Review Stage dropdown"
  sources={{
    light: '/img/assets/content-manager/review-stage-dropdown.png',
    dark: '/img/assets/content-manager/review-stage-dropdown_DARK.png',
  }}
/>

### Define assignee

Entries of a review workflow content type can be assigned to any admin user in Strapi for review.

To define the assignee of your content:

1. Access the edit view of your content-type.
2. In the *Review Workflows* box on the right side of the interface, click on the _Assignee_ drop-down list.
3. Choose the new assignee of your entry. It is automatically saved.

<ThemedImage
  alt="Review Stage dropdown"
  sources={{
    light: '/img/assets/content-manager/review-assignee-dropdown.png',
    dark: '/img/assets/content-manager/review-assignee-dropdown_DARK.png',
  }}
/>
