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

Admin tokens are one of two token kinds in Strapi. Content-api tokens authenticate requests against the public REST and GraphQL APIs. Admin tokens authenticate requests against the Admin API — they are intended for automation workflows that need to manage content or settings programmatically.

The two kinds are strictly separated. An admin token is rejected on content-api routes, and a content-api token is rejected on admin routes. A workflow that needs access to both route types requires one token of each kind.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">
    <!-- TODO: Confirm plan — Free or Growth -->
  </IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">
    Minimum "Access the Admin tokens settings page" in Roles > Settings - Admin tokens
  </IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">
    <!-- TODO: Confirm feature flag status — available by default or behind a flag -->
  </IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">
    Available in both Development & Production environment
  </IdentityCardItem>
</IdentityCard>

## Configuration

Admin tokens are configured entirely from the admin panel. No code-based configuration is specific to admin tokens — the shared salt and encryption key that apply to all token kinds are set via `apiToken.salt` and `apiToken.secrets.encryptionKey` in your `/config/admin` file (see [API tokens — code-based configuration](/cms/features/api-tokens#code-based-configuration)).

### Creating an admin token

**Path to configure the feature:** <Icon name="gear-six" /> _Settings > Global settings > Admin Tokens_

1. Click on the **Create new API Token** button.
2. In the token creation form, configure the new admin token:

   | Setting name | Instructions |
   | --- | --- |
   | Name | Write the name of the token. |
   | Description | (optional) Write a description for the token. |
   | Token duration | Choose a duration: _7 days_, _30 days_, _90 days_, or _Unlimited_. |
   | Kind | Displays **Admin**. This field is set automatically and cannot be changed after creation. |
   | Permissions | Use the permissions matrix to select which admin actions this token can perform. Permissions the current user does not hold appear disabled and cannot be selected. |

3. Review the inherited conditions displayed in the permissions matrix. Conditions applied to the owner's role permissions are shown as read-only — they apply automatically to the token.
4. Click **Save**. The token key is displayed once at the top of the interface.

<!-- TODO: Add screenshot once UI is finalized — admin token creation form with ceiling-aware permissions matrix -->

:::note
The **Kind** field is set at creation time and cannot be changed. To switch a token from `content-api` to `admin` or vice versa, delete the existing token and create a new one.
:::

:::note
The plaintext token key is shown only once, immediately after creation or regeneration. The `encryptionKey` configuration that makes content-api token keys persistently viewable does not apply to admin tokens — admin token keys are always restricted to the token owner, regardless of encryption configuration.
:::

### Managing admin tokens

Admin tokens have a dedicated settings page at <Icon name="gear-six" /> _Settings > Global settings > Admin Tokens_, separate from the content-api tokens page at <Icon name="gear-six" /> _Settings > Global settings > API Tokens_. The two pages are independent interfaces — not filtered views of a shared list. The Admin Tokens page has its own CRUD routes (`admin::admin-tokens.*` RBAC actions) and displays an **Owner** column showing the display name of each token's owner.

<!-- TODO: Add screenshot once UI is finalized — Admin Tokens list view with Owner column -->

The following restrictions apply on the Admin Tokens page:

- The **Regenerate** button is only visible to the token's owner. Other users, including super-admins, do not see this button for tokens they do not own.
- The token can only be edited by its owner or a super-admin.
- The token can only be deleted by its owner or a super-admin.

When a super-admin views an admin token owned by another user, a read-only **Owner** field appears in the token details panel. The permissions matrix shows only the checkboxes within the token owner's scope — not the super-admin's unrestricted access.

:::note
The owner's effective permissions are fetched via `GET /admin/api-tokens/:id/owner-permissions`. This endpoint is accessible by the token owner or a super-admin. It returns `400 Bad Request` for content-api tokens.
:::

## Ownership

Every admin token is owned by a specific admin user. By default, the owner is the user who created the token. Ownership is immutable — it cannot be transferred after creation.

Ownership has three practical effects:

- **List visibility**: Non-super-admin users see only content-api tokens and their own admin tokens in the tokens list. Super-admins see all tokens. Neither role receives the plaintext key (`accessKey`) in list results — it is never included there.
- **Key access**: Who can view the plaintext token key depends on the token kind:

  | Token kind | Who can view the key |
  |---|---|
  | `admin` | Token owner only. Even a super-admin cannot read another user's key — this restriction is intentional and cannot be overridden. |
  | `content-api` | Any user with the appropriate route permission. |

- **Permission ceiling**: The token's permissions are bounded by the owner's effective permissions at all times (see [Permission ceiling](#permission-ceiling)).

:::caution Owner account deleted
If the token owner's account is deleted, all admin tokens owned by that user are automatically deleted along with their associated permissions. There is no recovery path. Rotate and replace admin tokens before offboarding a team member who owns them.
:::

:::caution Owner deactivation
If the token owner's account is deactivated (`isActive === false`) or blocked (`blocked === true`), any request authenticated with that owner's admin token returns `401 Token owner is deactivated`. The token itself is not deleted — re-activating or unblocking the owner restores token functionality.
:::

## Permission ceiling

An admin token can never hold more permissions than its owner currently has. When a token is created or updated, the requested permissions are validated against the owner's effective permissions — the union of all permissions granted by the owner's roles.

Three rules apply:

1. **Action and subject must match.** A token cannot be granted a permission the owner does not hold. If the owner does not have `delete` on `api::article.article`, no token owned by that user can have it either.
2. **Field scope must be a subset.** If the owner's permission for an action and content type is scoped to specific fields (for example, only `title` and `slug`), the token can request at most those same fields. If the owner's permission has no field restrictions, the token may request any fields for that action and content type.
3. **Conditions are inherited, not chosen.** If the owner's role applies conditions to a permission (for example, "only records I created"), those conditions are automatically applied to the token and cannot be removed or relaxed.

Super-admins have no permission ceiling of their own. However, when a super-admin edits a token owned by another user, the ceiling is still enforced against the token owner's scope — not the super-admin's unrestricted access.

:::tip
Any permission that exceeds the owner's ceiling is rejected at creation time with a validation error that lists the out-of-scope action, subject, and fields.
:::

For more on how admin roles and permissions work, see [Role-Based Access Control (RBAC)](/cms/features/rbac).

## Role-change synchronization

Token permissions are automatically reconciled whenever the owner's effective permissions change. This ensures tokens can never silently retain access that the owner no longer holds.

Reconciliation is triggered by three events, and a fourth event causes full token removal:

1. A role's permission set is updated (an action is added or removed from a role).
2. A user's role assignments change (a role is added to or removed from the user).
3. A role is deleted.
4. **The token owner's account is deleted.** In this case, all admin tokens owned by that user are deleted entirely, not re-clamped. See [Ownership](#ownership) for details.

When reconciliation runs, it applies conservative rules. Permissions that exceed the owner's new ceiling are deleted. Conditions are updated to match the owner's inherited conditions. Permissions that remain valid are left untouched. For users with multiple roles, a permission shared by a role the user still holds is preserved.

## Usage

Admin tokens authenticate requests to Strapi Admin API routes. Add the token to the `Authorization` header of your request using `Bearer` syntax:

```bash title="Example: authenticated Admin API request"
curl -X GET \
  https://your-strapi-instance.com/admin/content-manager/collection-types/api::article.article \
  -H "Authorization: Bearer your-admin-token"
```

:::caution
Never expose admin tokens in client-side code. Store them in a secrets manager or environment variable. Admin tokens authenticate against admin routes only — they are rejected on content-api routes.
:::

For authenticating REST and GraphQL content API requests, see the API Tokens documentation:

<CustomDocCardsWrapper>
<CustomDocCard icon="" title="API Tokens" description="Learn how to use content-api tokens to authenticate REST and GraphQL API requests." link="/cms/features/api-tokens" />
</CustomDocCardsWrapper>

<!-- drafter:notes
- TODO: Confirm plan — Free or Growth — for IdentityCard Plan item
- TODO: Confirm feature flag status for IdentityCard Activation item; if behind a flag, add <FeatureFlagBadge /> on H1 and :::note in intro
- TODO: Add screenshot — admin token creation form with ceiling-aware permissions matrix (### Creating an admin token)
- TODO: Add screenshot — Admin Tokens list view with Owner column (### Managing admin tokens)
- Section order note: Ownership, Permission ceiling, and Role-change synchronization are placed as H2s between Configuration and Usage. They are conceptual reference sections, not usage tasks. If the team prefers folding them under Configuration as H3s, this can be restructured without content loss.
-->