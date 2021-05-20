# Configuring Users & Permissions plugin

The Users & Permissions plugin is managed from the Users & Permissions plugin settings section, accessible from *General > Settings* in the main navigation of the admin panel. The Users & Permissions plugin settings section allows to configure the available providers and email templates, and the advanced settings of the plugin. It also allows to define the end-users roles and their related permissions (see Managing end-users in the Users, roles and permissions section of this User Guide).

## Configuring providers

The Users & Permissions plugin allows to enable and configure providers, for end-users to login via a third-party provider to access the content of a Strapi application. By default, a list of 12 providers is available including one, "Email", enabled by default for all Strapi applications with the Users & Permissions plugin installed.

To enable and configure a provider:

1. Go to the *Users & Permissions plugin > Providers* sub-section of the settings interface.
2. Click on the provider to enable and configure.
3. In the provider edition window, click on the **ON** button of the *Enable* option.
4. Fill in the provider's configurations. Each provider has its own specific set of configurations, detailed in our developer documentation (see [Setting up the provider](https://strapi.io/documentation/developer-docs/latest/development/plugins/users-permissions.html#setting-up-the-provider-examples)).
5. Click on the **Save** button.

::: tip NOTE
Other providers that are not proposed by default by Strapi can only be added manually through the code of your Strapi application (see Developer documentation).
:::

## Configuring email templates

The Users & Permissions plugin uses 2 email templates, "Email address confirmation" and "Reset password", that are sent to end-users:

- if their account must be confirmed to be activated,
- if they need to reset the password of their Strapi account.

::: tip NOTE
Other email templates than are not made available by default by Strapi can only be added manually through the code of your Strapi application (see Developer documentation).
:::

To configure and edit email templates:

1. Go to the *Users & Permissions plugin > Email templates* sub-section of the settings interface.
2. Click on the name of the email template to configure and edit.
3. Configure the email template:

| Setting name   | Instructions                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------|
| Shipper name   | Indicate the name of the shipper of the email.                                                   |
| Shipper email  | Indicate the email address of the shipper of the email.                                          |
| Response email | (optional) Indicate the email address to which responses emails from the end-users will be sent. |
| Subject        | Write the subject of the email. Variables can be used (see Developer documentation).             |

4. Edit the content of the email in the "Message" textbox. Email templates content is in HTML and uses variables (see Developer documentation).
5. Click on the **Save** button.

## Configuring advanced settings

All settings related to the Users & Permissions plugin are managed from the *Advanced Settings* sub-section, including the choice of a default role for end-users, the enablement of sign-ups and email confirmation, as well as the choice of landing page for resetting a password.

1. Go to the *Users & Permissions plugin > Advanced settings* sub-section of the settings interface.
2. Configure the settings:

| Setting name                         | Instructions                                                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Default role for authenticated users | Click the drop-down list to choose the default role for new end-users.                                                                                             |
| One account per email address        | Click on the **ON** button to limit to 1 the number of email addresses that can be associated to an end-user account. Click on **OFF** to disable this limitation. |
| Enable sign-ups                      | Click on the **ON** button to enable end-users sign-ups. Click on **OFF** to prevent end-users registration to the Strapi application.                             |
| Reset password page                  | Indicate the URL of the reset password page for your Strapi application.                                                                                           |
| Enable email confirmation            | Click on the **ON** button to enable end-users account confirmation by sending them a confirmation email. Click on **OFF** to disable account confirmation.        |
| Redirection url                      | Indicate the URL of the page where end-users should be redirected after confirming their Strapi account.                                                           |