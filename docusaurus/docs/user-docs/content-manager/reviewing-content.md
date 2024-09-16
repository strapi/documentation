---
title: Reviewing content
description: Using review workflows to manage content throughout the content creation process.
tags:
- assignee
- Enterprise feature
- review workflows
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Reviewing content <EnterpriseBadge />

Using the [Review Workflows](/user-docs/settings/review-workflows) feature, you can manage content throughout the content creation process. In the Content Manager, you can change the review stage of the content from the edit view, and keep moving it between stages as needed. You can also change the assignee of the content, assigning it to a Strapi admin user for review.

When viewing your content in the Content Manager, you can see the current stage in the **Review Stage** column and the assignee in the **Assignee** column.

<ThemedImage
  alt="Review Stage column"
  sources={{
    light: '/img/assets/content-manager/review-workflow-list-view.png',
    dark: '/img/assets/content-manager/review-workflow-list-view_DARK.png',
  }}
/>

## Change review stage

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

## Change assignee

Entries of a review workflow content type can be assigned to any admin user in Strapi for review.

To change the assignee of your content:

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

<FeedbackPlaceholder />
