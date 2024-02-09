---
displayed_sidebar: userDocsSidebar
sidebar_label: Welcome!
---

# Welcome to the Strapi User Guide!

<SubtleCallout title="Developer Docs, User Guide, and Strapi Cloud documentation" emoji="📍">

The documentation for Strapi contains 3 main sections, accessible from the top navigation bar:

- 🧑‍💻 The **[Developer Docs](/dev-docs/intro)** contain all the technical information related to the setup, advanced usage, customization, and update of your Strapi v5 application.
- 🧑‍🏫 The **User Guide** that you're currently reading is all about using Strapi's admin panel.
- ☁️ The **[Strapi Cloud](/cloud/intro)** documentation is about deploying your Strapi application to Strapi Cloud and managing your Strapi Cloud projects and settings.

</SubtleCallout>

This user guide contains the functional documentation related to all features available in the admin panel of your Strapi application.

<ThemedImage
  alt="Homepage of the Admin Panel"
  sources={{
    light: '/img/assets/getting-started/admin-panel-homepage.png',
    dark: '/img/assets/getting-started/admin-panel-homepage_DARK.png',
  }}
/>
The table of content of the Strapi Developer Docs displays 7 main sections in an order that should correspond to your journey with the product, from the very first steps to the most advanced aspects of Strapi's usage.
Clicking on any of the following cards will direct you to the introduction page for the category, with additional details and concepts:

<!-- <CustomDocCardsWrapper>
  <CustomDocCard emoji="📝" title="Content Manager" description="Create, Manage and Publish Content Types" link="/user-docs/content-manager/introduction-to-content-manager" />
  <CustomDocCard emoji="📝" title="Content Type Builder" description="Create, Manage and Publish Content Types" link="user-docs/content-type-builder" />
</CustomDocCardsWrapper> -->

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

### Using SSO for authentication <EnterpriseBadge />

If your Strapi application was configured to allow authentication through SSO (see [Configuring Single Sign-On](/user-docs/settings/single-sign-on)), you can access the admin panel using a specific provider instead of logging in with a regular Strapi administrator account.

To do so, in the login page of your Strapi application, click on a chosen provider. If you cannot see your provider, click the ![icon more](/img/assets/getting-started/icon_more.png) button to access the full list of all available providers. You will be redirected to your provider's own login page where you will be able to authenticate.

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
