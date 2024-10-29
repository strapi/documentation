---
title: Introduction to users, roles & permissions
slug: /user-docs/users-roles-permissions
displayed_sidebar: userDocsSidebar
pagination_next: user-docs/users-roles-permissions/configuring-administrator-roles
sidebar_position: 1
---

# Introduction to users, roles & permissions

Some features of the admin panel, as well as the content managed with Strapi itself, are ruled by a system of permissions. These permissions can be assigned to roles, which are associated with the users who have access to the admin panel, the administrators. But it is also possible to grant permissions more publicly, to give access to content to the end users of your Strapi application.

Depending on what users and their roles and permissions you want to manage, you should either use the Role Based Access Control (RBAC) feature, or the Users & Permissions plugin. Both are managed from <Icon name="gear-six" /> _Settings_, accessible from the main navigation of the admin panel.

<ThemedImage
  alt="Users, permissions and roles settings"
  sources={{
    light: '/img/assets/users-permissions/users-roles-permissions-settings.png',
    dark: '/img/assets/users-permissions/users-roles-permissions-settings_DARK.png',
  }}
/>
