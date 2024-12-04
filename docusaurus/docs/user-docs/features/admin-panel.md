---
title: Admin panel
description: Learn to use the admin panel.
toc_max_heading_level: 5
tags:
- admin panel
- administration panel
- profile
- interface language
- light mode
- dark mode
---

# Administration panel

The admin panel is the back office of your Strapi application. From the admin panel, you will be able to manage content-types, and write their actual content. It is also from the admin panel that you will manage users, both administrators and end users of your Strapi application.

<ThemedImage
alt="Homepage of the Admin Panel"
sources={{
    light: '/img/assets/getting-started/admin-panel-homepage.png',
    dark: '/img/assets/getting-started/admin-panel-homepage_DARK.png',
  }}
/>

## Overview

<div style={{position: 'relative', paddingBottom: 'calc(54.43121693121693% + 50px)', height: '0'}}>
<iframe id="dkd2m1lsgr" src="https://app.guideflow.com/embed/dkd2m1lsgr" width="100%" height="100%" style={{overflow:'hidden', position:'absolute', border:'none'}} scrolling="no" allow="clipboard-read; clipboard-write" webkitallowfullscreen mozallowfullscreen allowfullscreen allowtransparency="true"></iframe>
</div>

## Configuration

**Path to configure the admin panel:** Account name or initials (bottom left hand corner) > Profile

If you are a new administrator, we recommend making sure your profile is all set, before diving into your Strapi application. From your administrator profile, you are able to modify your user information, such as name, username, email or password. You can also choose the language and mode of the interface for your Strapi application.

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

| Password modification |                                             |
| --------------------- | ------------------------------------------- |
| Current password      | Write your current password in the textbox. |
| Password              | Write the new password in the textbox.      |
| Password confirmation | Write the same new password in the textbox. |

3. Click on the **Save** button.

:::tip
You can click on the ![Eye icon](/img/assets/icons/v5/Eye.svg) icon for the passwords to be shown.
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

## Usage

<!--### Accessing the admin panel-->

:::caution
In order to access the admin panel, your Strapi application must be launched, and you must be aware of the URL to its admin panel (e.g. `api.example.com/admin`).
:::

To access the admin panel:

1. Go to the URL of your Strapi application's admin panel.
2. Enter your credentials to log in.
3. Click on the **Login** button. You should be redirected to the homepage of the admin panel.

:::note
If you prefer or are required to log in via an SSO provider, please refer to the Single Sign-On documentation.
:::

<ThemedImage
alt="Login page"
sources={{
    light: '/img/assets/getting-started/login-page-sso.png',
    dark: '/img/assets/getting-started/login-page_DARK.png',
  }}
/>