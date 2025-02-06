---
title: Setting up the admin panel
displayed_sidebar: cmsSidebar
description: How to setup your Strapi Admin Panel
tags:
- admin panel
- administrator
- password
---


Before going over individual features, we recommend the following steps to set up and configure your Strapi admin panel correctly. Once you complete the setup, you can access the admin panel through the provided URL.

## Accessing the admin panel

The admin panel is the back office of your Strapi application. From the admin panel, you will be able to manage content-types, and write their actual content. It is also from the admin panel that you will manage users, both administrators and end users of your Strapi application.

:::caution
In order to access the admin panel, your Strapi application must be launched, and you must be aware of the URL to its admin panel (e.g. `api.example.com/admin`).
:::

<ThemedImage
alt="Login page"
sources={{
    light: '/img/assets/getting-started/login-page-sso.png',
    dark: '/img/assets/getting-started/login-page_DARK.png',
  }}
/>

To access the admin panel:

1. Go to the URL of your Strapi application's admin panel.
2. Enter your credentials to log in.
3. Click on the **Login** button. You should be redirected to the homepage of the admin panel.

### Using SSO for authentication {#using-sso}
<EnterpriseBadge /> <SsoBadge />

If your Strapi application was configured to allow authentication through SSO (see [Configuring Single Sign-On](/cms/settings/single-sign-on)), you can access the admin panel using a specific provider instead of logging in with a regular Strapi administrator account.

To do so, in the login page of your Strapi application, click on a chosen provider. If you cannot see your provider, click the ![More icon](/img/assets/icons/v5/More.svg) button to access the full list of all available providers. You will be redirected to your provider's own login page where you will be able to authenticate.

## Setting up your administrator profile

If you are a new administrator, we recommend making sure your profile is all set, before diving into your Strapi application. From your administrator profile, you are able to modify your user information, such as name, username, email or password. You can also choose the language of the interface for your Strapi application.

<ThemedImage
alt="Homepage of the Admin Panel"
sources={{
    light: '/img/assets/getting-started/user-information-profile.png',
    dark: '/img/assets/getting-started/user-information-profile_DARK.png',
  }}
/>

To modify your user information:

1. Click on your account name or initials in the bottom left hand corner of the main navigation of your Strapi application.
2. In the drop-down menu, click on **Profile**.
3. Modify the information of your choice:

| Profile & Experience | Instructions                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name           | Write your first name in the textbox.                                                                                                                                                                             |
| Last name            | Write your last name in the textbox.                                                                                                                                                                              |
| Email                | Write your complete email address in the textbox.                                                                                                                                                                 |
| Username             | (optional) Write a username in the textbox.                                                                                                                                                                       |
| Interface language   | Among the drop-down list, choose a language for your Strapi application interface.                                                                                                                                |
| Interface mode       | Among the drop-down list, choose a mode for your Strapi application interface: either "Light mode" or "Dark mode". Note that by default, the chosen mode for a Strapi application is based on the browser's mode. |

4. Click on the **Save** button.

### Changing your password

To change the password of your account:

1. Go to your administrator profile.
2. Fill in the password-related options:

| Password modification |                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Current password      | Write your current password in the textbox. <br/> 💡 You can click on the ![Eye icon](/img/assets/icons/v5/Eye.svg) icon for the password to be shown. |
| Password              | Write the new password in the textbox. <br/> 💡 You can click on the ![Eye icon](/img/assets/icons/v5/Eye.svg) icon for the password to be shown.      |
| Password confirmation | Write the same new password in the textbox. <br/> 💡 You can click on the ![Eye icon](/img/assets/icons/v5/Eye.svg) icon for the password to be shown. |

3. Click on the **Save** button.

---

Congratulations on being a new Strapi user! You're now ready to discover all the features and options that Strapi has to offer!
