---
title: Collaboration
displayed_sidebar: cloudSidebar
description: Share your projects on Strapi Cloud to collaborate with others.
canonicalUrl: https://docs.strapi.io/cloud/projects/collaboration.md
sidebar_position: 1
---

# Collaboration & shared projects

Projects are created by a user via his Strapi Cloud account, which is linked to their GitHub account. Strapi Cloud users can share their projects to anyone else, so these new users can have access to the Cloud dashboard and collaborate on that project, without the project owner to ever have to share their GitHub credentials.
<!-- Question: What are the names of the 2 types of users? There is written "maintainer" in Figma but nowhere else. Invited user? VS Project creator? Administrator? -->

Users invited to collaborate on a project do not have the same permissions as the project owner. Contrary to the latter, invited users:

- cannot see the *Usage* section of the Overview tab,
- cannot share the project themselves to someone else,
- cannot delete the project from the project settings,
- and cannot access the *Billing* section of project settings.

## Inviting users by sharing a project

To invite someone to collaborate on a project:

1. Go to the *Overview* tab of your project dashboard.
2. Click on the **Share** button in the top right hand corner.
3. In the *Share [project name]* dialog, type the email address of the person to invite in the textbox. A dropdown indicating "Invite [email address]" should appear.
4. Click on the dropdown: the email address should be displayed in a purple box right below the textbox.
5. (optional) Repeat steps 3 and 4 to invite more people. Email addresses can only entered one by one but invites can be sent to several email addresses at the same time.
6. Click on the **Send** button.

People invited to collaborate on a project will be sent an email indicating how to join the project <!-- Question: What's on the email? Steps to follow? URL to click on? -->. Once a project is shared, <!-- Questions: How do we call the things that represent the people? Dots? Circles? Do they show profile pictures or only initials? --> will be displayed in the project dashboard next to the **Share** button, to see how many users collaborate on that project and who they are. <!-- Questions: What happens when we hover on those dots? Also, are they only displayed for the project owner or to everyone? -->.

<!-- SCREENSHOT OF DASHBOARD WITH DOTS AND SHARE BUTTON -->

## Managing invited users

From the *Share [project name]* dialog accessible by clicking on the **Share** button of a project dashboard, projects owners can view the full list of people who have been invited to collaborate on the project. From there, it is possible to see the current status of each invited user and to manage those users.

<!-- SCREENSHOT OF DIALOG WITH PEOPLE AND STATUS -->

Invited users whose full name is displayed and dot is blue are users who did activate their account following the invitation email <!-- Not sure that's the correct wording -->. If however there are users in the list whose email address is displayed and dot is grey, it means they haven't activated their accounts and can't access the project dashboard yet. In that case, a status should be indicated right next to the email address to explain the issue:

- Pending: the invitation email has been sent but the person hasn't acted on it yet.
- Expired: the email has been sent ... time ago <!-- Question: After how long does the invitation expire? --> and the invitation expired.

For both Pending and Expired statuses, it is possible to send another invitation email by clicking on the **Manage** button, then **Resend invite**. 

### Revoking invitations

To revoke an invited user's access to the project dashboard:

1. Click on the **Share** button in the project dashboard.
2. In the list of *People with access*, find the user whose access to revoke and click on the **Manage** button.
3. Click on the **Revoke** button. <!-- Question: Is is done after clicking on the button or is there another confirmation dialog or something? -->

The revoked user will completely stop having access to the project dashboard. <!-- Question: Do revoked users received an email/notification? -->