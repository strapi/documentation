---
title: Admin Tokens
description: Learn how to use admin tokens to authenticate programmatic access to the Strapi Admin API.
displayed_sidebar: cmsSidebar
tags:
  - admin tokens
  - admin panel
  - authentication
  - RBAC
  - features
---

# Admin Tokens

<Tldr>
Admin tokens are owner-scoped tokens that authenticate programmatic access to the Strapi Admin API. Unlike content-api tokens, they are bound to a specific admin user's permissions and are designed for automation workflows such as MCP agents, CI/CD pipelines, and scripts that need to create, update, or delete content through the Admin API.
</Tldr>

Strapi has 2 token kinds. Content-api tokens authenticate requests against the public REST and GraphQL APIs. Admin tokens authenticate requests against the Admin API. They are intended for automation workflows that need to manage content or settings programmatically.

The 2 kinds are strictly separated. An admin token is rejected on content-api routes, and a content-api token is rejected on admin routes. A workflow that needs access to both route types requires 1 token of each kind.

This page covers how to create and manage admin tokens and how to authenticate Admin API requests with them. For a detailed explanation of the permission model, ownership rules, and role-change reconciliation, see [Admin token permission model](/cms/features/admin-tokens-permission-model).

<Guideflow lightId="TODO" darkId="TODO" />

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">
    <!-- TODO: Confirm plan with PM — Free or Growth -->
    Free feature
  </IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">
    Minimum "Access the Admin tokens settings page" in Roles > Settings - Admin tokens
  </IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">
    <!-- TODO: Confirm with PM — available by default or behind a feature flag. If behind a flag, add <FeatureFlagBadge /> on the H1 above and a :::note in this intro section. -->
    Available and activated by default
  </IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">
    Available in both Development & Production environment
  </IdentityCardItem>
</IdentityCard>

## Configuration

Admin tokens are configured entirely from the admin panel. No code-based configuration is specific to admin tokens. The shared salt and encryption key that apply to all token kinds are set via `apiToken.salt` and `apiToken.secrets.encryptionKey` in your `/config/admin` file (see [API tokens — code-based configuration](/cms/features/api-tokens#code-based-configuration)).

### Admin panel configuration

**Path to configure the feature:** <Icon name="gear-six" /> _Settings > Administration Panel > Admin Tokens_

#### Creating an admin token

1. Click on the **Add new Admin Token** button.
2. In the token creation form, configure the new admin token:

   | Setting name | Instructions |
   | --- | --- |
   | Name | Write the name of the token. |
   | Description | (optional) Write a description for the token. |
   | Token duration | Choose a duration: _7 days_, _30 days_, _90 days_, or _Unlimited_. |
   | Permissions | Use the permissions matrix to select which admin actions this token can perform. Permissions the current user does not hold appear disabled and cannot be selected. |

3. Review the inherited conditions displayed in the permissions matrix. Conditions applied to the owner's role permissions are shown as read-only. They apply automatically to the token.
4. Click **Save**. The token key is displayed once at the top of the interface.

<!-- TODO: Add screenshot once UI is finalized — admin token creation form with ceiling-aware permissions matrix -->

:::note
The plaintext token key is shown only once, immediately after creation or regeneration. The `encryptionKey` configuration that makes content-api token keys persistently viewable does not apply to admin tokens. Admin token keys are always restricted to the token owner, regardless of encryption configuration.
:::

#### Managing admin tokens

Admin tokens have a dedicated settings page at <Icon name="gear-six" /> _Settings > Administration Panel > Admin Tokens_, separate from the content-api tokens page at <Icon name="gear-six" /> _Settings > Global settings > API Tokens_. The Admin Tokens page and the API Tokens page are independent interfaces, not filtered views of a shared list. The Admin Tokens page has its own CRUD routes (`admin::admin-tokens.*` RBAC actions) and displays an **Owner** column showing the display name of each token's owner.

<!-- TODO: Add screenshot once UI is finalized — Admin Tokens list view with Owner column -->

The following restrictions apply on the Admin Tokens page:

- The **Regenerate** button is only visible to the token's owner. Other users, including super-admins, do not see this button for tokens they do not own.
- The token can only be edited by its owner or a super-admin.
- The token can only be deleted by its owner or a super-admin.

When a super-admin views an admin token owned by another user, a read-only **Owner** field appears in the token details panel. The permissions matrix shows only the checkboxes within the token owner's scope, not the super-admin's unrestricted access.

## Usage

Admin tokens authenticate requests to Strapi Admin API routes. Add the token to the `Authorization` header of your request using `Bearer` syntax:

```bash title="Example: authenticated Admin API request"
curl -X GET \
  https://your-strapi-instance.com/admin/content-manager/collection-types/api::article.article \
  -H "Authorization: Bearer your-admin-token"
```

:::caution
Never expose admin tokens in client-side code. Store them in a secrets manager or environment variable. Admin tokens authenticate against admin routes only. They are rejected on content-api routes.
:::

For authenticating REST and GraphQL content API requests:

<CustomDocCardsWrapper>
<CustomDocCard icon="" title="API Tokens" description="Learn how to use content-api tokens to authenticate REST and GraphQL API requests." link="/cms/features/api-tokens" />
</CustomDocCardsWrapper>

For a detailed explanation of how token permissions are scoped, inherited, and reconciled when roles change:

<CustomDocCardsWrapper>
<CustomDocCard icon="" title="Admin token permission model" description="Learn how ownership, permission ceilings, and role-change reconciliation work for admin tokens." link="/cms/features/admin-tokens-permission-model" />
</CustomDocCardsWrapper>

<!-- drafter:notes
- TODO: Confirm plan — Free or Growth — for IdentityCard Plan item
- TODO: Confirm feature flag status for IdentityCard Activation item; if behind a flag, add <FeatureFlagBadge /> on H1 and :::note in intro
- TODO: Add screenshot — admin token creation form with ceiling-aware permissions matrix (#### Creating an admin token)
- TODO: Add screenshot — Admin Tokens list view with Owner column (#### Managing admin tokens)
- TODO: Replace Guideflow placeholder IDs once embed is available
- Permission model content extracted to /cms/features/admin-tokens-permission-model.md
-->