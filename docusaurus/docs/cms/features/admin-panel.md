---
title: Admin panel
description: Learn to use the admin panel.
toc_max_heading_level: 5
tags:
- admin panel
- profile
- light mode
- dark mode
---

# Administration panel

The admin panel is the back office of your Strapi application. From the admin panel, you will be able to manage content-types and write their actual content, but also manage users, both administrators and end users of your Strapi application.

<ThemedImage
alt="Homepage of the Admin Panel"
sources={{
    light: '/img/assets/getting-started/admin-panel-homepage.png',
    dark: '/img/assets/getting-started/admin-panel-homepage_DARK.png',
  }}
/>

## Overview

:::prerequisites
There are a few factors that you should keep in mind when using the admin panel, as they could modify the interface and your experience with it.

- **Development, Staging or Production Environment** <br/> Your content structure and application configuration change status: from development environment to production or staging environment once deployed. Some features are only available in development. Check the Identity Cards to know when features are usable.

- **License and Pricing Plans** <br/> Some features's availability or limits depend on whether your application is using the free Community Edition, the <ExternalLink to="https://strapi.io/pricing-self-hosted" text="Growth plan"/>, or the <ExternalLink to="https://strapi.io/pricing-self-hosted" text="Enterprise plan"/>. Look for the <GrowthBadge /> and <EnterpriseBadge /> badges in the docs.

- **Roles and Permissions** <br/> Some features and the content itself are ruled by a system of permissions that can be defined at a detailed level. Depending on your role and permissions, you may not be able to access all the features and options. Read the [RBAC feature documentation](/cms/features/rbac) for more information.

- **Future flags** <br/> Some incoming Strapi features are not yet ready to be shipped to all users, but Strapi still offers community users the opportunity to provide early feedback. These experimental features require enabling the corresponding future flags. Look for the <FeatureFlagBadge /> badge in the docs and read the [Feature flags documentation](/cms/configurations/features#enabling-a-future-flag) for more information.
:::

<Guideflow lightId="dkd2m1lsgr" darkId="dkd2mjlugr"/>

## Configuration

**Path to configure the admin panel:** Account name or initials (bottom left hand corner) > Profile

If you are a new administrator, we recommend making sure your profile is all set, before diving into your Strapi application. From your administrator profile, you are able to modify your user information (name, username, email, password). You can also choose the language and mode of the interface for your Strapi application.

<ThemedImage
alt="Homepage of the Admin Panel"
sources={{
    light: '/img/assets/getting-started/user-information-profile.png',
    dark: '/img/assets/getting-started/user-information-profile_DARK.png',
  }}
/>

### Modifying profile information (name, email, username)

1. Go to the *Profile* section of your profile.
2. Fill in the following options:

| Profile & Experience | Instructions                                      |
| -------------------- | ------------------------------------------------- |
| First name           | Write your first name in the textbox.             |
| Last name            | Write your last name in the textbox.              |
| Email                | Write your complete email address in the textbox. |
| Username             | (optional) Write a username in the textbox.       |

3. Click on the **Save** button.

### Changing account password

1. Go to the *Change password* section of your profile.
2. Fill in the following options:

| Password modification | Instructions                                |
| --------------------- | ------------------------------------------- |
| Current password      | Write your current password in the textbox. |
| Password              | Write the new password in the textbox.      |
| Password confirmation | Write the same new password in the textbox. |

3. Click on the **Save** button.

:::tip
You can click on the <Icon name="eye" /> icon for the passwords to be shown.
:::

### Choosing interface language

In the *Experience* section of your profile, select your preferred language using the *Interface language* dropdown.

:::note
Keep in mind that choosing an interface language only applies to your account on the admin panel. Other users of the same application's admin panel can use a different language.
:::

### Choosing interface mode (light, dark)

By default, the chosen interface mode is based on your browser's mode. You can however, in the *Experience* section of your profile, manually choose either the Light Mode or Dark Mode using the *Interface mode* dropdown.

:::note
Keep in mind that choosing an interface mode only applies to your account on the admin panel.
:::

### Customizing the logo

**Path to configure the admin panel:** <Icon name="gear-six" /> *Settings > Global settings > Overview*

The default Strapi logos, displayed in the main navigation of a Strapi application and the authentication pages, can be modified.

1. Click on the upload area for *Menu logo* or *Auth logo*.
2. Upload your chosen logo, either by browsing files, drag & dropping the file in the right area, or by using a URL. The logo shouldn't be more than 750x750px. 
3. Click on the **Upload logo** button in the upload window.
4. Click on the **Save** button in the top right corner.

Once uploaded, the new logo can be replaced with another one <Icon name="plus" classes="ph-bold"/>, or reset <Icon name="arrow-clockwise" classes="ph-bold"/> with the default Strapi logo or the logo set in the configuration files.

:::note
Both logos can also be customized programmatically via the Strapi application's configuration files (see [Admin panel customization](/cms/admin-panel-customization/options#logos)). However, the logos uploaded via the admin panel supersedes any logo set through the configuration files.
:::

<ThemedImage
  alt="Custom logo settings"
  sources={{
    light: '/img/assets/settings/settings_custom-logo.png',
    dark: '/img/assets/settings/settings_custom-logo_DARK.png',
  }}
/>

## Usage

:::caution
In order to access the admin panel, your Strapi application must be launched, and you must be aware of the URL to its admin panel (e.g. `api.example.com/admin`).
:::

To access the admin panel:

1. Go to the URL of your Strapi application's admin panel.
2. Enter your credentials to log in.
3. Click on the **Login** button. You should be redirected to the homepage of the admin panel.

:::note
If you prefer or are required to log in via an SSO provider, please refer to the [Single Sign-On documentation](/cms/features/sso).
:::

<ThemedImage
alt="Login page"
sources={{
    light: '/img/assets/getting-started/login-page-sso.png',
    dark: '/img/assets/getting-started/login-page_DARK.png',
  }}
/>
