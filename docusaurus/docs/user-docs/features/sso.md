---
title: Single Sign-On (SSO)
description: Learn to use the SSO feature which manages authentication through an identity provider.
toc_max_heading_level: 6
tags:
- admin panel
- SSO
- single sign-on
- features
---

# Single Sign-On (SSO)
<EnterpriseBadge /> <SsoBadge />

The Single Sign-On (SSO) feature can be made available on a Strapi application to allow administrators to authenticate through an identity provider (e.g. Microsoft Azure Active Directory).

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Enterprise plan or SSO add-on. <br/>
<Icon name="user"/> **Role & permission:** Read & Update permissions in Roles > Settings - Single Sign-On. <br/>
<Icon name="toggle-left"/> **Activation:** Disabled by default. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

<ThemedImage
alt="Login page"
sources={{
    light: '/img/assets/getting-started/login-page-sso.png',
    dark: '/img/assets/getting-started/login-page_DARK.png',
  }}
/>

## Configuration

General settings for SSO are available in the admin panel, and additional SSO providers can be configured via your Strapi project's code.

### Admin panel settings

**Path to configure the feature:** <Icon name="gear-six" /> *Global settings > Single Sign-On*

1. In the *Single Sign-On* interface, define your chosen new settings:

| Setting name      | Instructions      |
| ----------------- | ---------------------|
| Auto-registration | Click on **True** to allow the automatic creation of a new Strapi administrator when an SSO login does not match an existing Strapi administrator account. If this setting is set on **False**, new Strapi administrators accounts must be created manually beforehand. |
| Default role      | Choose among the drop-down list the role to attribute by default to auto-registered Strapi administrators through SSO login.           |
| Local authentication lock-out | Choose among the drop-down list the roles for which the local authentication capabilities are disabled (see [RBAC feature](/user-docs/users-roles-permissions) documentation).<br />Users locked out of local authentication will be forced to use SSO to login and will not be able to change or reset their password. |

2. Click the **Save** button.

:::danger
Don't select _Super Admin_ in the roles list for the _Local authentication lock-out_. If _Super Admin_ is selected, it becomes possible to accidentally lock oneself out of the Strapi admin panel entirely. A fix will be provided soon.

In the meantime, the only way to get in if the Super Admin can't log in is to temporarily disable the SSO feature entirely, log in with username and password to remove the _Super Admin_ role from the _Local authentication lock-out_ list, and then re-enable SSO.
:::

<ThemedImage
  alt="SSO settings"
  sources={{
    light: '/img/assets/settings/settings-sso.png',
    dark: '/img/assets/settings/settings-sso_DARK.png',
  }}
/>

### Code-based configuration

The SSO configuration lives in [the `/config/admin` file](/dev-docs/configurations/admin-panel). The following dedicated guide will help you configure additional sign-in and sign-up methods for the Strapi admin panel:

<CustomDocCardsWrapper>
<CustomDocCard icon="sign-in" title="Configuring SSO providers" description="Learn how to configure SSO providers through your Strapi project's code." link="/dev-docs/configurations/guides/configure-sso"/>
</CustomDocCardsWrapper>

## Usage

To access the admin panel using a specific provider instead of logging in with a regular Strapi administrator account:

1. Go to the URL of your Strapi application's admin panel.
2. Click on a chosen provider, which logo should be displayed at the bottom of the login form. If you cannot see your provider, click the <Icon name="dots-three-outline" /> button to access the full list of all available providers.
3. You will be redirected to your provider's own login page where you will be able to authenticate.
