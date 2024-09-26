---
title: Collaboration
displayed_sidebar: cloudSidebar
description: Share your projects on Strapi Cloud to collaborate with others.
canonicalUrl: https://docs.strapi.io/cloud/projects/collaboration.md
sidebar_position: 1
tags:
- maintainers
- Strapi Cloud
- Strapi Cloud project
---

# Collaboration on projects


Projects are created by a user via their Strapi Cloud account. Strapi Cloud users can share their projects to anyone else, so these new users can have access to the project dashboard and collaborate on that project, without the project owner to ever have to share their credentials.

Users invited to collaborate on a project, called maintainers, do not have the same permissions as the project owner. Contrary to the project owner, maintainers:

- Cannot share the project themselves to someone else
- Cannot delete the project from the project settings
- Cannot access the *Billing* section of project settings

## Sharing a project

<ThemedImage
  alt="Share button and avatar"
  sources={{
    light: '/img/assets/cloud/collaboration-projectview.png',
    dark: '/img/assets/cloud/collaboration-projectview_DARK.png',
  }}
/>

To invite a new maintainer to collaborate on a project:

1. From the *Projects* page, click on the project of your choice to be redirected to its dashboard.
2. Click on the **Share** button located in the dashboard's header.
3. In the *Share [project name]* dialog, type the email address of the person to invite in the textbox. A dropdown indicating "Invite [email address]" should appear.
4. Click on the dropdown: the email address should be displayed in a purple box right below the textbox.
5. (optional) Repeat steps 3 and 4 to invite more people. Email addresses can only entered one by one but invites can be sent to several email addresses at the same time.
6. Click on the **Send** button.

New maintainers will be sent an email containing a link to click on to join the project. Once a project is shared, avatars representing the maintainers will be displayed in the project dashboard's header, next to the **Share** button, to see how many maintainers collaborate on that project and who they are.

:::tip
Avatars use GitHub, Google or GitLab profile pictures, but for pending users only initials will be displayed until the activation of the maintainer account. You can hover over an avatar to display the full name of the maintainer.
:::

## Managing maintainers

From the *Share [project name]* dialog accessible by clicking on the **Share** button of a project dashboard, projects owners can view the full list of maintainers who have been invited to collaborate on the project. From there, it is possible to see the current status of each maintainer and to manage them.

<ThemedImage
  alt="Share button and avatar"
  sources={{
    light: '/img/assets/cloud/collaboration-dialog2.png',
    dark: '/img/assets/cloud/collaboration-dialog2_DARK.png',
  }}
/>

Maintainers whose full name is displayed are users who did activate their account following the invitation email. If however there are maintainers in the list whose email address is displayed, it means they haven't activated their accounts and can't access the project dashboard yet. In that case, a status should be indicated right next to the email address to explain the issue:

- Pending: the invitation email has been sent but the maintainer hasn't acted on it yet.
- Expired: the email has been sent over 72 hours ago and the invitation expired.

For Expired statuses, it is possible to send another invitation email by clicking on the **Manage** button, then **Resend invite**. 

### Revoking maintainers

To revoke a maintainer's access to the project dashboard:

1. Click on the **Share** button in the project dashboard's header.
2. In the list of *People with access*, find the maintainer whose access to revoke and click on the **Manage** button.
3. Click on the **Revoke** button.
4. In the confirmation dialog, click again on the **Revoke** button.

The revoked maintainer will completely stop having access to the project dashboard.

:::note
Maintainers whose access to the project has been revoked do not receive any email or notification.
::: 
