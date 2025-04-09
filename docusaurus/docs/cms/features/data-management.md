---
title: Data Management
sidebar_position: 1
description: Learn to use the Data Management to import, export, or transfer data between different Strapi instances.
toc_max_heading_level: 5
tags:
- admin panel
- features
- data management
- data import
- data export
- data transfer
---

# Data Management

The Data Management feature can be used to import, export, or transfer data. Data Management is  CLI-based only, but is partly configured in the admin panel.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature.</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Minimum "Access the transfer tokens settings page" permission in Roles > Settings - Transfer tokens.</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated if a transfer salt is defined.</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment.</IdentityCardItem>
</IdentityCard>

## Configuration

Some configuration options for the Data Management feature are available in the admin panel, and some are handled via your Strapi project's code.

### Admin panel settings

:::prerequisites
A `transfer.token.salt` should be defined in the `config/admin` configuration file (see [code-based configuration](#code-based-configuration)).
:::

**Path to configure the feature:** <Icon name="gear-six" /> *Settings > Global settings > Transfer Tokens*

Transfer tokens allow users to authorize the `strapi transfer` CLI command (see [Data transfer](/cms/data-management/transfer) documentation).

<ThemedImage
  alt="Transfer tokens"
  sources={{
    light: '/img/assets/settings/settings_transfer-token.png',
    dark: '/img/assets/settings/settings_transfer-token_DARK.png',
  }}
/>

The *Transfer Tokens* interface displays a table listing all of the created Transfer tokens. More specifically, it displays each Transfer token's name, description, date of creation, and date of last use.

From there, administrators can also:

- Click on the <Icon name="pencil-simple" /> to edit a transfer token's name, description, or type, or [regenerate the token](#regenerating-a-transfer-token).
- Click on the <Icon name="trash" /> to delete a Transfer token.

#### Creating a new transfer token

1. Click on the **Create new Transfer Token** button.
2. In the Transfer token edition interface, configure the new Transfer token:
    | Setting name   | Instructions                                                                  |
    | -------------- | ----------------------------------------------------------------------------- |
    | Name           | Write the name of the Transfer token.                                         |
    | Description    | (optional) Write a description for the Transfer token.                        |
    | Token duration | Choose a token duration: *7 days*, *30 days*, *90 days*, or *Unlimited*.      |
    | Token type | Choose a token type:<ul><li>*Push* to allow transfers from local to remote instances only,</li><li>*Pull* to allow transfers from remote to local instances only,</li><li>or *Full Access* to allow both types of transfer.</li></ul>      |
3. Click on the **Save** button. The new Transfer token will be displayed at the top of the interface, along with a copy button <Icon name="copy" />.

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

#### Regenerating a Transfer token

1. Click on the Transfer token's edit button.
2. Click on the **Regenerate** button.
3. Click on the **Regenerate** button to confirm in the dialog.
4. Copy the new Transfer token displayed at the top of the interface.

### Code-based configuration

A `transfer.token.salt` value must be defined in [the `config/admin` file](/cms/configurations/admin-panel) so that transfer tokens can be properly generated. If no value is defined, the feature will be disabled. The salt can be any long string, and for increased security, it's best to add it to the [environment variables](/cms/configurations/environment) and import it using the `env()` utility as in the following example:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  // …
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/admin.ts"
export default ({ env }) => ({
  // …
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});
```

</TabItem>

</Tabs>

## Usage

The Data Management system is CLI-based only, meaning any import, export, or transfer command must be executed from the terminal. Exhaustive documentation for each command is accessible from the following pages:

<CustomDocCardsWrapper>
<CustomDocCard icon="terminal" title="Import" description="Learn how to import data into a Strapi instance." link="/cms/data-management/import"/>
<CustomDocCard icon="terminal" title="Export" description="Learn how to export data from a Strapi instance." link="/cms/data-management/export"/>
<CustomDocCard icon="terminal" title="Transfer" description="Learn how to transfer data from a Strapi instance to another one." link="/cms/data-management/transfer"/>
</CustomDocCardsWrapper>
