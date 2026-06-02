---
title: Users & Permissions REST API
description: REST API reference for authentication, user management, roles, and permissions with the Users & Permissions feature.
displayed_sidebar: cmsSidebar
tags:
  - users & permissions
  - REST API
  - authentication
  - API
---

# Users & Permissions REST API

<Tldr>The Users & Permissions feature provides REST API endpoints for authentication, user management, roles, and permissions.</Tldr>

The Users & Permissions feature exposes a set of REST API endpoints for authentication, user management, and role/permission management. These endpoints are separate from the standard content-type CRUD endpoints and have their own response shapes. For a general overview and configuration options, see the [Users & Permissions introduction](/cms/features/users-permissions).

All endpoints use the `/api` prefix. For example, if your Strapi server runs at `http://localhost:1337`, the login endpoint is `http://localhost:1337/api/auth/local`.

## Authentication

Authentication endpoints handle login, registration, and password management. Most of these endpoints are public by default and do not require a Bearer token.

### Login

`POST /api/auth/local`

Authenticates a user with their identifier (email or username) and password, returning a JWT and the user object.

<ApiCall>

<Request title="Example request: Login">

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com", "password": "yourPassword"}'
```

</Request>

<Response>

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "documentId": "x74detpqybxw0bn6ormua5g2",
    "username": "testuser1",
    "email": "user@example.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z",
    "publishedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

</Response>

</ApiCall>

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"Invalid identifier or password"` | Wrong credentials |
| 400 | `"Your account email is not confirmed"` | Email confirmation required but not completed |
| 400 | `"Your account has been blocked by an administrator"` | Account blocked |

This endpoint is rate limited (default: 5 requests per 5 minutes).

### Register

`POST /api/auth/local/register`

Creates a new user account and returns a JWT along with the user object.

<ApiCall>

<Request title="Example request: Register">

```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "email": "newuser@example.com", "password": "Password123!"}'
```

</Request>

<Response>

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "documentId": "xjpaytstw1gm7wdfoc6c2k13",
    "username": "newuser",
    "email": "newuser@example.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z",
    "publishedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

</Response>

</ApiCall>

:::note
Only `username`, `email`, and `password` are accepted in the request body by default. To allow additional fields (e.g., a `fullName` field you added to the User content-type), you must explicitly list them in the `register.allowedFields` configuration. See [Registration configuration](/cms/features/users-permissions#registration-configuration) for details.

When email confirmation is enabled, the response contains only the user object without a JWT. The user must confirm their email before they can log in.

The newly registered user is assigned the default role (typically "Authenticated").
:::

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"Email or Username are already taken"` | Duplicate email or username |
| 400 | `"Invalid parameters: fieldName"` | Extra fields not listed in `allowedFields` |
| 400 | `"Register action is currently disabled"` | Registration disabled in admin settings |

This endpoint is rate limited.

### Forgot password

`POST /api/auth/forgot-password`

Sends a password reset email to the specified address. Requires an email provider to be configured.

<ApiCall>

<Request title="Example request: Forgot password">

```bash
curl -X POST http://localhost:1337/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

</Request>

<Response>

```json
{
  "ok": true
}
```

</Response>

</ApiCall>

:::note
This endpoint always returns `{ "ok": true }` regardless of whether the email address exists in the system. This is intentional to prevent user enumeration attacks.
:::

This endpoint is rate limited.

### Reset password

`POST /api/auth/reset-password`

Resets a user's password using a token received by email. All 3 fields are required.

<ApiCall>

<Request title="Example request: Reset password">

```bash
curl -X POST http://localhost:1337/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"code": "resetTokenFromEmail", "password": "NewPassword123!", "passwordConfirmation": "NewPassword123!"}'
```

</Request>

</ApiCall>

Example response (200): Same shape as the [login](#login) response (jwt + user).

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"passwordConfirmation is a required field"` | Missing `passwordConfirmation` |
| 400 | `"Passwords do not match"` | `password` and `passwordConfirmation` differ |
| 400 | `"Incorrect code provided"` | Invalid or expired reset token |

This endpoint is rate limited.

### Change password

`POST /api/auth/change-password`

Changes the password for the currently authenticated user. Requires a valid Bearer token. All 3 fields are required.

<ApiCall>

<Request title="Example request: Change password">

```bash
curl -X POST http://localhost:1337/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"currentPassword": "OldPassword123!", "password": "NewPassword456!", "passwordConfirmation": "NewPassword456!"}'
```

</Request>

</ApiCall>

Example response (200): Same shape as the [login](#login) response (jwt + user).

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"passwordConfirmation is a required field"` | Missing `passwordConfirmation` |
| 400 | `"Passwords do not match"` | `password` and `passwordConfirmation` differ |
| 400 | `"The provided current password is invalid"` | Wrong current password |
| 400 | `"Your new password must be different than your current password"` | Same password reused |

This endpoint is rate limited.

### Email confirmation

`GET /api/auth/email-confirmation`

Confirms a user's email address using a token from the confirmation email.

Query parameter: `confirmation` (the token received in the confirmation email).

<ApiCall>

<Request title="Example request: Email confirmation">

```bash
curl -G http://localhost:1337/api/auth/email-confirmation \
  --data-urlencode "confirmation=confirmationTokenHere"
```

</Request>

</ApiCall>

After confirming the email, Strapi redirects the user to the URL configured in the admin panel under Settings > Users & Permissions > Advanced Settings > "Redirection url".

### Send email confirmation

`POST /api/auth/send-email-confirmation`

Resends the confirmation email to a user who has not yet confirmed their email address.

<ApiCall>

<Request title="Example request: Send email confirmation">

```bash
curl -X POST http://localhost:1337/api/auth/send-email-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

</Request>

<Response>

```json
{
  "email": "user@example.com",
  "sent": true
}
```

</Response>

</ApiCall>

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"Already confirmed"` | User already confirmed their email |
| 400 | `"User blocked"` | Account blocked |

This endpoint is rate limited.

### Provider authentication

`GET /api/connect/:provider`

Redirects the user to a third-party provider's login page (e.g., Google, GitHub, Discord). Replace `:provider` with the provider name. See [Setting up providers](/cms/configurations/users-and-permissions-providers) for configuration instructions.

### Provider callback

`GET /api/auth/:provider/callback`

Handles the OAuth callback after the user authenticates with a third-party provider. On success, returns the same response shape as [login](#login) (jwt + user).

If the username derived from the provider profile already exists, a unique username is generated automatically to avoid conflicts.

## Session management

When session management is enabled (`jwtManagement: 'refresh'` in the plugin configuration), these additional endpoints become available. They return 404 when the default legacy JWT mode is active.

### Refresh token

`POST /api/auth/refresh`

Exchanges a refresh token for a new access token. The old refresh token is invalidated and a new one is returned (token rotation).

<ApiCall>

<Request title="Example request: Refresh token">

```bash
curl -X POST http://localhost:1337/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "yourRefreshToken"}'
```

</Request>

<Response>

```json
{
  "jwt": "newAccessToken",
  "refreshToken": "newRefreshToken"
}
```

</Response>

</ApiCall>

:::note
When `httpOnly` is enabled in the session configuration, the new refresh token is set as an HTTP-only cookie instead of being included in the response body. In that case, the response only contains `{ "jwt": "newAccessToken" }`.
:::

### Logout

`POST /api/auth/logout`

Revokes all sessions for the authenticated user. Requires a valid Bearer token.

<ApiCall>

<Request title="Example request: Logout">

```bash
curl -X POST http://localhost:1337/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

<Response>

```json
{
  "ok": true
}
```

</Response>

</ApiCall>

## Users

User management endpoints handle CRUD operations on end-user records. Each endpoint requires the corresponding permission to be enabled for the user's role in the admin panel (Settings > Users & Permissions > Roles).

:::caution Response format
User endpoints return bare JSON objects (not wrapped in a `data` key), unlike standard Strapi content-type endpoints.
:::

### Get current user

`GET /api/users/me`

Returns the user associated with the provided JWT. Requires authentication.

<ApiCall>

<Request title="Example request: Get current user">

```bash
curl http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

<Response>

```json
{
  "id": 1,
  "documentId": "x74detpqybxw0bn6ormua5g2",
  "username": "testuser1",
  "email": "user@example.com",
  "provider": "local",
  "confirmed": true,
  "blocked": false,
  "createdAt": "2024-03-15T10:00:00.000Z",
  "updatedAt": "2024-03-15T10:00:00.000Z",
  "publishedAt": "2024-03-15T10:00:00.000Z"
}
```

</Response>

</ApiCall>

### List users

`GET /api/users`

Returns a list of users. Supports `filters`, `sort`, and `pagination` query parameters.

<ApiCall>

<Request title="Example request: List users">

```bash
curl http://localhost:1337/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

</ApiCall>

Example response (200): An array of user objects.

### Get a user

`GET /api/users/:id`

Returns a single user by their integer `id`.

<ApiCall>

<Request title="Example request: Get a user">

```bash
curl http://localhost:1337/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

</ApiCall>

Example response (200): A user object.

### Count users

`GET /api/users/count`

Returns the total number of users. Supports the `filters` query parameter.

<ApiCall>

<Request title="Example request: Count users">

```bash
curl http://localhost:1337/api/users/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

<Response>

```json
42
```

</Response>

</ApiCall>

### Create a user

`POST /api/users`

Creates a new user. If `role` is omitted, the default role is assigned.

<ApiCall>

<Request title="Example request: Create a user">

```bash
curl -X POST http://localhost:1337/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"username": "newuser", "email": "newuser@example.com", "password": "Password123!", "role": 1}'
```

</Request>

</ApiCall>

Example response (201): A user object with the populated role.

### Update a user

`PUT /api/users/:id`

Updates an existing user. Only include the fields you want to change.

<ApiCall>

<Request title="Example request: Update a user">

```bash
curl -X PUT http://localhost:1337/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"username": "updateduser"}'
```

</Request>

</ApiCall>

Example response (200): The updated user object.

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 404 | `"User not found"` | No user with the given `id` |
| 400 | `"Username already taken"` or `"Email already taken"` | Duplicate value |

### Delete a user

`DELETE /api/users/:id`

Deletes a user by their integer `id`.

<ApiCall>

<Request title="Example request: Delete a user">

```bash
curl -X DELETE http://localhost:1337/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

</ApiCall>

Example response (200): The deleted user object.

## Roles

Role endpoints manage end-user roles and their associated permissions. These endpoints use the `/api/users-permissions/` prefix, not the standard `/api/` prefix used by content-type endpoints.

### List roles

`GET /api/users-permissions/roles`

Returns all available roles with user counts.

<ApiCall>

<Request title="Example request: List roles">

```bash
curl http://localhost:1337/api/users-permissions/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

<Response>

```json
{
  "roles": [
    {
      "id": 1,
      "documentId": "abcdefghijklmnop12345678",
      "name": "Authenticated",
      "description": "Default role given to authenticated user.",
      "type": "authenticated",
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z",
      "publishedAt": "2024-03-15T10:00:00.000Z",
      "nb_users": 2
    },
    {
      "id": 2,
      "documentId": "qrstuvwxyzabcdef98765432",
      "name": "Public",
      "description": "Default role given to unauthenticated user.",
      "type": "public",
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z",
      "publishedAt": "2024-03-15T10:00:00.000Z",
      "nb_users": 0
    }
  ]
}
```

</Response>

</ApiCall>

### Get a role

`GET /api/users-permissions/roles/:id`

Returns a single role by `id`, including its full permissions tree.

<ApiCall>

<Request title="Example request: Get a role">

```bash
curl http://localhost:1337/api/users-permissions/roles/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

</ApiCall>

Example response (200): A role object with a nested `permissions` structure mapping plugins to controllers to actions.

### Create a role

`POST /api/users-permissions/roles`

Creates a new role.

<ApiCall>

<Request title="Example request: Create a role">

```bash
curl -X POST http://localhost:1337/api/users-permissions/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Editor", "description": "Can edit content", "type": "editor"}'
```

</Request>

<Response>

```json
{
  "ok": true
}
```

</Response>

</ApiCall>

### Update a role

`PUT /api/users-permissions/roles/:id`

Updates an existing role.

<ApiCall>

<Request title="Example request: Update a role">

```bash
curl -X PUT http://localhost:1337/api/users-permissions/roles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"description": "Updated description"}'
```

</Request>

<Response>

```json
{
  "ok": true
}
```

</Response>

</ApiCall>

### Delete a role

`DELETE /api/users-permissions/roles/:id`

Deletes a role by `id`. The Public role cannot be deleted. When a role is deleted, users assigned to it are reassigned to the Public role.

<ApiCall>

<Request title="Example request: Delete a role">

```bash
curl -X DELETE http://localhost:1337/api/users-permissions/roles/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

<Response>

```json
{
  "ok": true
}
```

</Response>

</ApiCall>

Possible errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `"Cannot delete public role"` | Attempted to delete the Public role |

## Permissions

The permissions endpoint returns the complete permission tree, showing which actions are available across all plugins and content-types.

### List permissions

`GET /api/users-permissions/permissions`

Returns a nested object mapping plugins to controllers to actions.

<ApiCall>

<Request title="Example request: List permissions">

```bash
curl http://localhost:1337/api/users-permissions/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

</Request>

</ApiCall>

Example response (200): A nested `permissions` object where keys are plugin names, sub-keys are controller names, and values contain the available actions with their `enabled` status and `policy` information.
