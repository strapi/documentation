---
title: Admin Tokens
description: Learn how to use Admin tokens to authenticate programmatic access to the Strapi Admin API.
toc_max_heading_level: 4
displayed_sidebar: cmsSidebar
tags:
  - admin tokens
  - admin panel
  - authentication
  - RBAC
  - features
---

# Admin Tokens
<FeatureFlagBadge feature="adminTokens" /> 

<Tldr>
Admin tokens authenticate programmatic access to the Strapi Admin API. Each token is scoped to a subset of its owner's permissions and is designed for automation workflows such as MCP agents, CI/CD pipelines, and scripts.
</Tldr>

Admin tokens allow automated clients to authenticate requests to the Strapi Admin API. For authenticating requests to the Content API, see [API Tokens](/cms/features/api-tokens).

Admin tokens and API tokens are strictly separated: each is rejected on the other's routes.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">
    Free feature
  </IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">
    Activated by default for Super Admin. Each lower-level role needs an explicit permission grant in Roles > Settings - Admin tokens.
  </IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">
    Requires enabling the corresponding future flag,<br/>see [Features configuration](/cms/configurations/features)
  </IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">
    Available in both Development & Production environment
  </IdentityCardItem>
</IdentityCard>

<ThemedImage
  alt="Admin tokens in the admin panel"
  sources={{
      light: '/img/assets/settings/settings_admin-tokens-overview.png',
      dark: '/img/assets/settings/settings_admin-tokens-overview_DARK.png',
    }}
/>

## Configuration

Admin tokens are configured entirely from the admin panel. No code-based configuration is specific to Admin tokens. The shared salt and encryption key that apply to all token kinds are set via `apiToken.salt` and `apiToken.secrets.encryptionKey` in your `/config/admin` file (see [API tokens](/cms/features/api-tokens#code-based-configuration)).

**Path to configure the feature:** <Icon name="gear-six" /> _Settings > Administration Panel > Admin Tokens_

### Creating a new Admin token

:::prerequisites
If you're not the Strapi instance's super admin, the super admin must have granted you the following permissions:
  * access the Admin tokens settings page
  * create (generate) admin tokens
  
  (see [RBAC > Configuring role's permissions](/cms/features/rbac#plugins-and-settings) for details).
:::

1. Click on the **Create new Admin Token** button.
2. In the token creation form, configure the new Admin token:

   | Setting name | Instructions |
   | --- | --- |
   | Name | Write the name of the token. |
   | Description | (optional) Write a description for the token. |
   | Token duration | Choose a duration: _7 days_, _30 days_, _90 days_, or _Unlimited_. |
3. Define which admin actions this token can perform:
   - Click the tabs below the form to browse permission categories.
   - Use the checkboxes to enable or disable individual permissions.

    :::note
    Permissions that the current user does not hold appear disabled and cannot be selected. Conditions applied to the owner's role are shown as read-only and apply automatically to the token.
    :::
4. Click on the **Save** button. The new Admin token will be displayed at the top of the interface, along with a copy button <Icon name="copy" />.

<!-- TODO: Update screenshot once admin tokens UI is finalized behind the feature flag -->
<ThemedImage
alt="Admin token permissions"
sources={{
    light: '/img/assets/settings/settings_admin-token-creation.png',
    dark: '/img/assets/settings/settings_admin-token-creation_DARK.png',
  }}
/>

:::caution
The plaintext token key is shown only once, immediately after creation or regeneration. The `admin.secrets.encryptionKey` configuration that makes Content API token keys persistently viewable does not apply to Admin tokens. Admin token keys are always restricted to the token owner, regardless of encryption configuration.
:::

### Managing Admin tokens

Admin tokens have a dedicated settings page at <Icon name="gear-six" /> _Settings > Administration Panel > Admin Tokens_. Admin tokens and API tokens are stored in the same database table (differentiated by a `kind` field) but are managed through independent interfaces in the admin panel.

The Admin Tokens page displays an **Owner** column showing the display name of each token's owner.

Any user with access to the Admin Tokens settings page can view Admin tokens. A token can only be edited or deleted by its owner or a super-admin.

When a super-admin views an Admin token owned by another user, a read-only **Owner** field appears in the token details panel. The permissions panel shows only the checkboxes within the token owner's permission scope, not the super-admin's unrestricted access.

Removing a permission from a role causes admin tokens owned by users of that role to have the corresponding permission deleted automatically.

:::caution Owner account deactivation and deletion

* If the token owner's account is deleted, all Admin tokens owned by that user are automatically deleted along with their associated permissions. There is no recovery path. Rotate and replace Admin tokens before offboarding a team member who owns them.
* If the token owner's account is deactivated or blocked, any request authenticated with that owner's Admin token is rejected. The token itself is not deleted. Re-activating or unblocking the owner restores token functionality.
:::

#### Regenerating an Admin token

The **Regenerate** button is only visible to the token's owner. Other users, including super-admins, do not see this button for tokens they do not own.

To regenerate an Admin token:

1. Click on the Admin token's edit button.
2. Click on the **Regenerate** button.
3. Click on the **Regenerate** button to confirm in the dialog.
4. Copy the new Admin token displayed at the top of the interface.

## Usage

Using Admin tokens allows executing a request on Strapi's admin routes as an authenticated user.

Admin tokens can be helpful to give access to people or applications without managing a user account, for instance to connect an MCP server or a CI/CD pipeline.

When performing a request to Strapi's admin routes, the Admin token should be added to the request's `Authorization` header with the following syntax: `bearer your-admin-token`.

:::caution
Never expose Admin tokens in client-side code. Store them in a secrets manager or environment variable.
:::