---
sidebar_position: 3
title: API tokens
---

# Managing API tokens

:::prerequisites
* Administrators can create, read, update, or delete API tokens only if proper permissions are granted (see [Configuring administrator roles](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
* The *Global settings > API Tokens* sub-section of the settings interface is accessible in the admin panel only if the _API tokens > Read_ permission is granted.
:::

API tokens allow users to authenticate REST and GraphQL API queries (see [Developer Documentation](/dev-docs/configurations/api-tokens)). Administrators can manage API tokens from ![Settings icon](/img/assets/icons/settings.svg) *Settings > Global settings > API Tokens*.

<ThemedImage
  alt="API tokens"
  sources={{
    light: '/img/assets/settings/settings_api-token.png',
    dark: '/img/assets/settings/settings_api-token_DARK.png',
  }}
/>

The *API Tokens* settings sub-section displays a table listing all of the created API tokens.

The table displays each API token's name, description, date of creation, and date of last use. From the table, administrators can also:

- Click on the ![edit button](/img/assets/icons/edit.svg) to edit an API token's name, description, type, duration or [regenerate the token](#regenerating-an-api-token).
- Click on the ![delete button](/img/assets/icons/delete.svg) to delete an API token.

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
4. Click on the **Save** button. The new API token will be displayed at the top of the interface, along with a copy button![copy button](/img/assets/icons/duplicate.svg).

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