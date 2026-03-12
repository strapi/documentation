---
title: Admin token permission model
description: Learn how ownership, permission ceilings, and role-change reconciliation work for admin tokens in Strapi.
displayed_sidebar: cmsSidebar
tags:
  - admin tokens
  - admin panel
  - authentication
  - RBAC
  - permissions
---

# Admin token permission model

Admin token permissions are bounded by the owner's account. This page explains how that boundary is defined, what happens when it is exceeded, and how tokens stay in sync when roles change.

## Ownership

Every admin token is owned by the admin user who created it. Ownership is immutable. It cannot be transferred after creation.

Ownership has 3 practical effects:

- **List visibility**: Non-super-admin users see only content-api tokens and their own admin tokens in the tokens list. Super-admins see all tokens. The plaintext key is never included in list results for either role.
- **Key access**: Who can view the plaintext token key depends on the token kind:

  | Token kind | Who can view the key |
  |---|---|
  | `admin` | Token owner only (intentional, cannot be overridden, even by super-admins). |
  | `content-api` | Any user with the appropriate route permission. |

- **Permission ceiling**: The token's permissions are bounded by the owner's effective permissions at all times (see [Permission ceiling](#permission-ceiling)).

## Permission ceiling

An admin token can never hold more permissions than its owner currently has. When a token is created or updated, the requested permissions are validated against the owner's effective permissions: the union of all permissions granted by the owner's roles.

3 rules apply:

1. **Action and subject must match.** A token cannot be granted a permission the owner does not hold. If the owner does not have `delete` on `api::article.article`, no token owned by that user can have it either.
2. **Field scope must be a subset.** If the owner's permission for an action and content type is scoped to specific fields (for example, only `title` and `slug`), the token can request at most those same fields. If the owner's permission has no field restrictions, the token may request any fields for that action and content type.
3. **Conditions are inherited, not chosen.** If the owner's role applies conditions to a permission (for example, "only records I created"), those conditions are automatically applied to the token and cannot be removed or relaxed.

Super-admins have no permission ceiling of their own. However, when a super-admin edits a token owned by another user, the ceiling is still enforced against the token owner's scope, not the super-admin's unrestricted access.

:::tip
Any permission exceeding the ceiling is rejected at creation time with a validation error listing the out-of-scope action, subject, and fields.
:::

## Role-change reconciliation

Token permissions are automatically reconciled whenever the owner's effective permissions change. This ensures tokens can never silently retain access that the owner no longer holds.

Reconciliation is triggered by 3 events, and a fourth event causes full token removal:

1. A role's permission set is updated (an action is added or removed from a role).
2. A user's role assignments change (a role is added to or removed from the user).
3. A role is deleted.
4. **The token owner's account is deleted.** In this case, all admin tokens owned by that user are deleted entirely, not re-clamped. See [Ownership](#ownership) for details.

When reconciliation runs, it applies conservative rules. Permissions that exceed the owner's new ceiling are deleted. Conditions are updated to match the owner's inherited conditions. Permissions that remain valid are left untouched. For users with multiple roles, a permission shared by a role the user still holds is preserved.

:::note
The owner's effective permissions are fetched via `GET /admin/api-tokens/:id/owner-permissions`. This endpoint is accessible by the token owner or a super-admin. It returns `400 Bad Request` for content-api tokens.
:::

For more on how admin roles and permissions work, see [Role-Based Access Control (RBAC)](/cms/features/rbac).