---
title: Users & Permissions GraphQL API
description: GraphQL queries and mutations for authentication, user management, and role-based access with the Users & Permissions plugin.
displayed_sidebar: cmsSidebar
tags:
  - users & permissions
  - GraphQL API
  - authentication
  - API
---

# Users & Permissions GraphQL API

This page documents all GraphQL queries and mutations provided by the Users & Permissions plugin. The [GraphQL plugin](/cms/plugins/graphql) must be installed. For configuration details, see the main [Users & Permissions page](/cms/features/users-permissions).

## Authentication

Authentication mutations handle login, registration, and password management. Public mutations do not require an Authorization header.

### Login

The `login` mutation authenticates a user and returns a JWT token:

```graphql
mutation {
  login(input: { identifier: "user@example.com", password: "yourPassword" }) {
    jwt
    user {
      id
      documentId
      username
      email
      confirmed
      blocked
    }
  }
}
```

Input type `UsersPermissionsLoginInput`:

- `identifier` (String!) -- email or username
- `password` (String!)
- `provider` (String, defaults to "local")

Returns `UsersPermissionsLoginPayload`: `jwt` (String), `user` (UsersPermissionsMe)

Auth: Public

### Register

The `register` mutation creates a new user account and returns a JWT token:

```graphql
mutation {
  register(input: { username: "newuser", email: "new@example.com", password: "Password123!" }) {
    jwt
    user {
      id
      documentId
      username
      email
    }
  }
}
```

Input type `UsersPermissionsRegisterInput`:

- `username` (String!)
- `email` (String!)
- `password` (String!)

Returns `UsersPermissionsLoginPayload`

Auth: Public

:::note
Only `username`, `email`, and `password` are accepted by default. Additional fields require `register.allowedFields` configuration.
:::

### Forgot password

The `forgotPassword` mutation sends a password reset email to the user:

```graphql
mutation {
  forgotPassword(email: "user@example.com") {
    ok
  }
}
```

Input: `email` (String!) -- direct argument, not wrapped in an input type.

Returns `UsersPermissionsPasswordPayload`: `ok` (Boolean!)

Auth: Public

### Reset password

The `resetPassword` mutation sets a new password using the token received by email:

```graphql
mutation {
  resetPassword(code: "resetTokenFromEmail", password: "NewPassword123!", passwordConfirmation: "NewPassword123!") {
    jwt
    user {
      id
      username
      email
    }
  }
}
```

Input (direct arguments):

- `code` (String!) -- reset token from email
- `password` (String!)
- `passwordConfirmation` (String!)

Returns `UsersPermissionsLoginPayload`

Auth: Public

### Change password

The `changePassword` mutation updates the password for the currently authenticated user:

```graphql
mutation {
  changePassword(currentPassword: "OldPassword123!", password: "NewPassword456!", passwordConfirmation: "NewPassword456!") {
    jwt
    user {
      id
      username
      email
    }
  }
}
```

Requires an Authorization header with a Bearer token.

Input (direct arguments):

- `currentPassword` (String!)
- `password` (String!)
- `passwordConfirmation` (String!)

Returns `UsersPermissionsLoginPayload`

Auth: Authenticated

### Email confirmation

The `emailConfirmation` mutation confirms a user's email address using the token received by email:

```graphql
mutation {
  emailConfirmation(confirmation: "confirmationTokenFromEmail") {
    jwt
    user {
      id
      username
      email
      confirmed
    }
  }
}
```

Input: `confirmation` (String!)

Returns `UsersPermissionsLoginPayload`

Auth: Public

:::note
Unlike the REST equivalent (which redirects), the GraphQL mutation returns a JWT and user object directly.
:::

## User queries and mutations

These operations retrieve and manage user records. They require the corresponding permission to be enabled for the requesting user's role.

### Get authenticated user (me query)

The `me` query returns the profile of the currently authenticated user:

```graphql
query {
  me {
    id
    documentId
    username
    email
    confirmed
    blocked
    role {
      id
      name
      description
      type
    }
  }
}
```

Requires an Authorization header. Returns `UsersPermissionsMe` type.

### Create a user

The `createUsersPermissionsUser` mutation creates a new user record:

```graphql
mutation {
  createUsersPermissionsUser(data: { username: "newuser", email: "new@example.com", password: "Password123!" }) {
    data {
      documentId
      username
      email
    }
  }
}
```

Input: `UsersPermissionsUserInput` (auto-generated from User content-type schema, with `password` field added)

Auth: Requires `plugin::users-permissions.user.create` permission

### Update a user

The `updateUsersPermissionsUser` mutation updates an existing user record:

```graphql
mutation {
  updateUsersPermissionsUser(id: "documentId123", data: { username: "updatedname" }) {
    data {
      documentId
      username
      email
    }
  }
}
```

Auth: Requires `plugin::users-permissions.user.update` permission

### Delete a user

The `deleteUsersPermissionsUser` mutation removes a user record:

```graphql
mutation {
  deleteUsersPermissionsUser(id: "documentId123") {
    data {
      documentId
      username
    }
  }
}
```

Auth: Requires `plugin::users-permissions.user.destroy` permission

## Role mutations

Role mutations manage end-user roles. They return `{ ok: true }` on success (not the role data).

### Create a role

The `createUsersPermissionsRole` mutation creates a new role:

```graphql
mutation {
  createUsersPermissionsRole(data: { name: "Editor", description: "Can edit content" }) {
    ok
  }
}
```

Auth: Requires `plugin::users-permissions.role.createRole` permission

### Update a role

The `updateUsersPermissionsRole` mutation updates an existing role:

```graphql
mutation {
  updateUsersPermissionsRole(id: "1", data: { name: "Senior Editor", description: "Can edit and publish" }) {
    ok
  }
}
```

Auth: Requires `plugin::users-permissions.role.updateRole` permission

### Delete a role

The `deleteUsersPermissionsRole` mutation removes a role:

```graphql
mutation {
  deleteUsersPermissionsRole(id: "3") {
    ok
  }
}
```

Auth: Requires `plugin::users-permissions.role.deleteRole` permission

:::note
The Public role cannot be deleted.
:::

## Types reference

This section lists the key GraphQL types used across Users & Permissions operations.

### Input types

| Type | Fields | Used by |
|------|--------|---------|
| `UsersPermissionsLoginInput` | `identifier` (String!), `password` (String!), `provider` (String) | `login` mutation |
| `UsersPermissionsRegisterInput` | `username` (String!), `email` (String!), `password` (String!) | `register` mutation |

### Response types

| Type | Fields | Used by |
|------|--------|---------|
| `UsersPermissionsLoginPayload` | `jwt` (String), `user` (UsersPermissionsMe!) | `login`, `register`, `resetPassword`, `changePassword`, `emailConfirmation` |
| `UsersPermissionsPasswordPayload` | `ok` (Boolean!) | `forgotPassword` |
| `UsersPermissionsMe` | `id` (ID!), `documentId` (ID!), `username` (String!), `email` (String), `confirmed` (Boolean), `blocked` (Boolean), `role` (UsersPermissionsMeRole) | `me` query, nested in login payload |
| `UsersPermissionsMeRole` | `id` (ID!), `name` (String!), `description` (String), `type` (String) | Nested in `UsersPermissionsMe` |
