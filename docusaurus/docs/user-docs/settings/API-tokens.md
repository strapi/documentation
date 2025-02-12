---
sidebar_position: 3
title: API tokens
tags:
- API Token
- REST API
- GraphQL API
---

# Managing API tokens

:::prerequisites
* Administrators can create, read, update, or delete API tokens only if proper permissions are granted (see [Configuring administrator roles](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
* The *Global settings > API Tokens* sub-section of the settings interface is accessible in the admin panel only if the _API tokens > Read_ permission is granted.
:::

API tokens allow users to authenticate REST and GraphQL API queries (see [Developer Documentation](/dev-docs/configurations/api-tokens)). Administrators can manage API tokens from <Icon name="gear-six" /> *Settings > Global settings > API Tokens*.

<ThemedImage
  alt="API tokens"
  sources={{
    light: '/img/assets/settings/settings_pregen-api-tokens.png',
    dark: '/img/assets/settings/settings_pregen-api-tokens_DARK.png',
  }}
/>

The *API Tokens* settings sub-section displays a table listing all of the created API tokens.

The table displays each API token's name, description, date of creation, and date of last use. From the table, administrators can also:

- Click on the <Icon name="pencil-simple" /> to edit an API token's name, description, type, duration or [regenerate the token](#regenerating-an-api-token).
- Click on the <Icon name="trash"/> to delete an API token.

:::note
Strapi pre-generates 2 API tokens for you, a Full access one and a Read-only one. Since tokens can be only seen once after creation, you have to [regenerate](#regenerating-an-api-token) them before using them.
:::

## Creating a new API token

To create a new API token:

1. Click on the **Create new API Token** button.
2. In the API token edition interface, configure the new API token:

    | Setting name   | Instructions                                                             |
    | -------------- | ------------------------------------------------------------------------ |
    | Name           | Write the name of the API token.                                         |
    | Description    | (optional) Write a description for the API token.                        |
    | Token duration | Choose a token duration: *7 days*, *30 days*, *90 days*, or *Unlimited*. |
    | Token type     | Choose a token type: *Read-only*, *Full access*, or *Custom*.            |

3. (optional) For the *Custom* token type, define specific permissions for your API endpoints by clicking on the content-type name and using checkboxes to enable or disable permissions.
4. Click on the **Save** button. The new API token will be displayed at the top of the interface, along with a copy button <Icon name="copy"/>.

<ThemedImage
  alt="Custom API token"
  sources={{
    light: '/img/assets/settings/settings_api-token-custom.png',
    dark: '/img/assets/settings/settings_api-token-custom_DARK.png',
  }}
/>

:::caution
For security reasons, API tokens are only shown right after they have been created. When refreshing the page or navigating elsewhere in the admin panel, the newly created API token will be hidden and will not be displayed again.
:::

## Regenerating an API token

To regenerate an API token:

1. Click on the API token's edit button.
2. Click on the **Regenerate** button.
3. Click on the **Regenerate** button to confirm in the dialog.
4. Copy the new API token displayed at the top of the interface.
