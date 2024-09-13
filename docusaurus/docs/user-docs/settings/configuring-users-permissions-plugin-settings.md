---
sidebar_position: 2
tags:
- Email plugin
- password
- provider
- Users, Roles & Permissions
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Configuring Users & Permissions plugin settings

The Users & Permissions plugin is managed from the *Users & Permissions plugin* settings section, accessible from ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings* in the main navigation of the admin panel. This settings section allows to configure the available providers, email templates and the advanced settings of the plugin. It also allows to define the end-users roles and their related permissions (see [Configuring end-user roles](../users-roles-permissions/configuring-end-users-roles.md)).

## Configuring providers

The Users & Permissions plugin allows to enable and configure providers, for end users to login via a third-party provider to access the content of a front-end application through the Strapi application API. By default, a list of providers is available including one, "Email", enabled by default for all Strapi applications with the Users & Permissions plugin installed.

<ThemedImage
  alt="Providers interface"
  sources={{
    light: '/img/assets/settings/up_providers.png',
    dark: '/img/assets/settings/up_providers_DARK.png',
  }}
/>

To enable and configure a provider:

1. Go to the *Users & Permissions plugin > Providers* sub-section of the settings interface.
2. Click on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button of the provider to enable and configure.
3. In the provider edition window, click on the **TRUE** button of the *Enable* option.
4. Fill in the provider's configurations. Each provider has its own specific set of configurations, detailed in our developer documentation (see [Setting up the provider](/dev-docs/plugins/users-permissions#setting-up-the-provider---examples)).
5. Click on the **Save** button.

:::note
Other providers that are not proposed by default by Strapi can be added manually through the code of your Strapi application (see [Developer documentation](/dev-docs/providers)).
:::

<!---
:::tip
Click the search button ![Search icon](/img/assets/icons/v5/search.svg) above the table to use a text search and find one of your providers more quickly!
:::
--->

## Configuring email templates

The Users & Permissions plugin uses 2 email templates, "Email address confirmation" and "Reset password", that are sent to end users:

- if their account must be confirmed to be activated,
- if they need to reset the password of their Strapi account.

<ThemedImage
  alt="Email templates interface"
  sources={{
    light: '/img/assets/settings/up_email-templates.png',
    dark: '/img/assets/settings/up_email-templates_DARK.png',
  }}
/>

To configure and edit email templates:

1. Go to the *Users & Permissions plugin > Email templates* sub-section of the settings interface.
2. Click on the edit ![Edit icon](/img/assets/icons/v5/Pencil.svg) button of the email template to configure and edit.
3. Configure the email template:

| Setting name   | Instructions |
|--------------- | ----------------------------------------------- |
| Shipper name   | Indicate the name of the shipper of the email.                                                   |
| Shipper email  | Indicate the email address of the shipper of the email.                                          |
| Response email | (optional) Indicate the email address to which responses emails from the end users will be sent. |
| Subject        | Write the subject of the email. Variables can be used (see [Developer documentation](https://strapi.io/documentation/developer-docs/latest/development/plugins/users-permissions.html#templating-emails)).             |

4. Edit the content of the email in the "Message" textbox. Email templates content is in HTML and uses variables (see [Developer documentation](https://docs.strapi.io/developer-docs/latest/plugins/users-permissions.html#templating-emails)).
5. Click on the **Finish** button.

## Configuring advanced settings

All settings related to the Users & Permissions plugin are managed from the *Advanced Settings* sub-section, including the choice of a default role for end users, the enablement of sign-ups and email confirmation, as well as the choice of landing page for resetting a password.

<ThemedImage
  alt="Advanced settings interface"
  sources={{
    light: '/img/assets/settings/up_settings.png',
    dark: '/img/assets/settings/up_settings_DARK.png',
  }}
/>

1. Go to the *Users & Permissions plugin > Advanced settings* sub-section of the settings interface.
2. Configure the settings:

| Setting name  | Instructions         |
| ------------------------------------ | --------------------------------------------------------------|
| Default role for authenticated users | Click the drop-down list to choose the default role for new end users.                                                                                             |
| One account per email address        | Click on the **TRUE** button to limit to 1 the number of end-user accounts with the same email address. Click on **FALSE** to disable this limitation and allow several end-user accounts to be associated with the same email address (e.g. `kai.doe@strapi.io` can be used when logging in via several different providers).  |
| Enable sign-ups                      | Click on the **TRUE** button to enable end-user sign-ups. Click on **FALSE** to prevent end-user registration to your front-end application(s).                        |
| Reset password page                  | Indicate the URL of the reset password page for your front-end application(s).                                                                                     |
| Enable email confirmation            | Click on the **TRUE** button to enable end-user account confirmation by sending them a confirmation email. Click on **FALSE** to disable account confirmation.         |
| Redirection url                      | Indicate the URL of the page where end users should be redirected after confirming their Strapi account.                                                           |

3. Click the **Save** button.
