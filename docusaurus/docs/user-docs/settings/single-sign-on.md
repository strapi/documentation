---
sidebar_position: 3
title: Single Sign-On
---

# Configuring Single Sign-On <EnterpriseBadge />

Single Sign-On (SSO) can be made available on a Strapi application to allow administrators to authenticate through an identity provider (e.g. Microsoft Azure Active Directory). SSO configurations can be done from ![Settings icon](/img/assets/icons/settings.svg) *Settings > Global settings > Single Sign-On*.

![SSO settings](/img/assets/settings/settings-sso.png)

To configure the SSO feature settings:

1. Go to the *Global settings > Single Sign-On* sub-section of the settings interface.
2. Define your chosen new settings:

| Setting name      | Instructions      |
| ----------------- | ---------------------|
| Auto-registration | Click on **True** to allow the automatic creation of a new Strapi administrator when an SSO login does not match an existing Strapi administrator account. If this setting is set on **False**, new Strapi administrators accounts must be created manually beforehand. |
| Default role      | Choose among the drop-down list the role to attribute by default to auto-registered Strapi administrators through SSO login.           |
| Local authentication lock-out | Choose among the drop-down list the [roles](/user-docs/users-roles-permissions) for which the local authentication capabilities are disabled.<br />Users locked out of local authentication will be forced to use SSO to login and will not be able to change or reset their password. |

3. Click the **Save** button.
