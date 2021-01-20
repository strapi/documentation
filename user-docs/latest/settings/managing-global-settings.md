# Managing global settings

Global settings for plugins and features are managed from *General > Settings* in the main navigation of the admin panel.

## Configuring Single Sign-On

::: warning This feature is only available with the Gold license.
For more information about pricing, please refer to [the Strapi website](https://strapi.io/pricing).
:::

Single Sign-On (SSO) can be made available on a Strapi application to allow users to authenticate through an identity provider (e.g. Microsoft Azure Active Directory).

<!--- screenshot --->

To configure the SSO feature settings:

1. Go to the *Global settings > Single Sign-On* area of the settings interface.
2. Define your chosen new settings:

| Setting name      | Instructions                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Auto-registration | Click on **ON** to allow the automatic creation of a new Strapi user when an SSO login does not match an existing Strapi user account. If this setting is set on **OFF**, administrators have to create manually the new Strapi user account for the SSO user. |
| Default role      | Choose among the drop-down list the role to attribute by default to auto-registrated Strapi users through SSO login.                                                                                                                                           |