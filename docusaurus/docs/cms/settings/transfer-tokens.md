---
displayed_sidebar: cmsSidebar
sidebar_position: 3
title: Transfer tokens
tags:
- admin panel
- API Token
- transfer tokens
---

# Managing transfer tokens

:::prerequisites
* Administrators can create, read, update, or delete transfer tokens only if proper permissions are granted (see [Configuring administrator roles](/cms/users-roles-permissions/configuring-administrator-roles#plugins-and-settings)).
* The *Global settings > Transfer Tokens* sub-section of the settings interface is accessible in the admin panel only if the _Transfer tokens > Read_ permission is granted.
* A `transfer.token.salt` should be defined in the admin panel configuration file (see [Developer Documentation](/cms/configurations/admin-panel)).
:::

Transfer tokens allow users to authorize the `strapi transfer` CLI command (see [Developer Documentation](/cms/data-management/transfer)). Administrators can manage API tokens from ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Global settings > Transfer Tokens*.

<ThemedImage
  alt="Transfer tokens"
  sources={{
    light: '/img/assets/settings/settings_transfer-token.png',
    dark: '/img/assets/settings/settings_transfer-token_DARK.png',
  }}
/>

The *Transfer Tokens* settings sub-section displays a table listing all of the created Transfer tokens.

The table displays each Transfer token's name, description, date of creation, and date of last use. From the table, administrators can also:

- Click on the ![edit button](/img/assets/icons/v5/Pencil.svg) to edit a transfer token's name, description, or type, or [regenerate the token](#regenerating-a-transfer-token).
- Click on the ![delete button](/img/assets/icons/v5/Trash.svg) to delete a Transfer token.

## Creating a new transfer token

To create a new Transfer token:

1. Click on the **Create new Transfer Token** button.
2. In the Transfer token edition interface, configure the new Transfer token:

    | Setting name   | Instructions                                                                  |
    | -------------- | ----------------------------------------------------------------------------- |
    | Name           | Write the name of the Transfer token.                                         |
    | Description    | (optional) Write a description for the Transfer token.                        |
    | Token duration | Choose a token duration: *7 days*, *30 days*, *90 days*, or *Unlimited*.      |
    | Token type | Choose a token type:<ul><li>*Push* to allow transfers from local to remote instances only,</li><li>*Pull* to allow transfers from remote to local instances only,</li><li>or *Full Access* to allow both types of transfer.</li></ul>      |

3. Click on the **Save** button. The new Transfer token will be displayed at the top of the interface, along with a copy button ![copy button](/img/assets/icons/v5/Duplicate.svg).

<ThemedImage
  alt="Custom Transfer Token"
  sources={{
    light: '/img/assets/settings/settings_create-transfer-token.png',
    dark: '/img/assets/settings/settings_create-transfer-token_DARK.png',
  }}
/>

:::caution
For security reasons, Transfer tokens are only shown right after they have been created. When refreshing the page or navigating elsewhere in the admin panel, the newly created Transfer token will be hidden and will not be displayed again.
:::

## Regenerating a Transfer token

To regenerate an Transfer token:

1. Click on the Transfer token's edit button.
2. Click on the **Regenerate** button.
3. Click on the **Regenerate** button to confirm in the dialog.
4. Copy the new Transfer token displayed at the top of the interface.
