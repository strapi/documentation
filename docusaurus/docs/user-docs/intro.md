---
displayed_sidebar: userDocsSidebar
sidebar_label: Welcome!
---

# Welcome to the Strapi User Guide!

This user guide contains the functional documentation related to all features available in the admin panel of your Strapi application.

![Homepage of the Admin Panel](/img/assets/getting-started/admin-panel-homepage.png)

Before going any further into this user guide, we recommend you to acknowledge the main concepts below. They will help you to understand how Strapi works, and ensure a smooth Strapi experience.

- **Development, Staging or Production Environment** <br/> When you start working on your application, it is in a development environment, which is the status for the content structure and application configuration. After deploying your application, it is in production or staging environment. This status change impacts how you can use your Strapi application, as some features are only available in development environment, such as the Content-type Builder. In this user guide the availability or not of a feature, depending on the application status, is always mentioned in the feature's introduction.

- **Versions** <br/> Strapi is constantly evolving and growing. This implies that new releases are quite frequent, to improve what is already available but also to add new features to Strapi. For every new Strapi version, we communicate through our main channels and by sending notifications both on your terminal (when launching your Strapi application), and on your application's admin panel. We always recommend to use the latest version. However, we always keep live both the documentation of the current Strapi version, and the documentation of the previous one - the latter being officially and actively maintained for 6 months after the release of the newest Strapi version.

- **License and Pricing Plans** <br/> As a Strapi user you have the choice between using the Community Edition, which is entirely free, or one of the 3 paid plans of the Enterprise Edition: Bronze, Silver, and Gold (see [Pricing and Plans](https://strapi.io/pricing-self-hosted)). In this user guide if a feature is only available for the Enterprise Edition, a badge is displayed beside the section's title to indicate which plans allow access to that feature (e.g. <BronzeBadge link="https://strapi.io/pricing-self-hosted"/> <SilverBadge link="https://strapi.io/pricing-self-hosted"/> <GoldBadge link="https://strapi.io/pricing-self-hosted"/>).

- **Roles and Permissions** <br/> Some features of the admin panel, as well as the content managed with Strapi itself, are ruled by a system of permissions. From your Strapi admin panel, you have the possibility to define, at a detailed level, the roles and permissions of all administrators and end users. In this user guide, all features and possible options are documented. It is however possible, depending on your role and permissions, that you may not be able to access all these features and options. In that case, please refer to the main Super Admin of your Strapi application.

With all this in mind, you should be ready to start your Strapi experience!

## Accessing the admin panel

The admin panel is the back office of your Strapi application. From the admin panel, you will be able to manage content-types, and write their actual content. It is also from the admin panel that you will manage users, both administrators and end users of your Strapi application.

:::caution
In order to access the admin panel, your Strapi application must be launched, and you must be aware of the URL to its admin panel (e.g. `api.example.com/admin`).
:::

![Login page with SSO activated](/img/assets/getting-started/login-page-sso.png)

To access the admin panel:

1. Go to the URL of your Strapi application's admin panel.
2. Enter your credentials to log in.
3. Click on the **Login** button. You should be redirected to the homepage of the admin panel.

### Using SSO for authentication <GoldBadge withLinkIcon link="https://strapi.io/pricing-self-hosted" />

If your Strapi application was configured to allow authentication through SSO (see [Configuring Single Sign-On](#)), you can access the admin panel using a specific provider instead of logging in with a regular Strapi administrator account.

To do so, in the login page of your Strapi application, click on a chosen provider. If you cannot see your provider, click the ![icon more](/img/assets/getting-started/icon_more.png) button to access the full list of all available providers. You will be redirected to your provider's own login page where you will be able to authenticate.

## Setting up your administrator profile

If you are a new administrator, we recommend making sure your profile is all set, before diving into your Strapi application. From your administrator profile, you are able to modify your user information, such as name, username, email or password. You can also choose the language of the interface for your Strapi application.

![User profile](/img/assets/getting-started/user-information-profile.png)

To modify your user information:

1. Click on your account name or initials in the bottom left hand corner of the main navigation of your Strapi application.
2. In the drop-down menu, click on **Profile**.
3. Modify the information of your choice:

| Profile & Experience  | Instructions                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| First name            | Write your first name in the textbox.                                                                   |
| Last name             | Write your last name in the textbox.                                                                    |
| Email                 | Write your complete email address in the textbox.                                                       |
| Username              | (optional) Write a username in the textbox.                                                             |
| Interface language    | Among the drop-down list, choose a language for your Strapi application interface.                      |
| Interface mode        | Among the drop-down list, choose a mode for your Strapi application interface: either "Light mode" or "Dark mode". Note that by default, the chosen mode for a Strapi application is based on the browser's mode. |

4. Click on the **Save** button.

### Changing your password

To change the password of your account:

1. Go to your administrator profile.
2. Fill in the password-related options:

| Password modification |                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Current password      | Write your current password in the textbox. <br/> 💡 You can click on the eye icon for the password to be shown. |
| Password              | Write the new password in the textbox. <br/> 💡 You can click on the eye icon for the password to be shown.      |
| Password confirmation | Write the same new password in the textbox. <br/> 💡 You can click on the eye icon for the password to be shown. |

3. Click on the **Save** button.


---

Congratulations on being a new Strapi user! You're now ready to discover all the features and options that Strapi has to offer!

:::strapi Welcome to the Strapi community!

If you have any trouble with your Strapi experience, you can reach us through [GitHub](https://github.com/strapi/) or our [forum](https://forum.strapi.io/)! The Strapi Community and Strapi team are always available to answer your questions or help you with anything!

:::
