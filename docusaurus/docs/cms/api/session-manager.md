---
title: Session Manager API
description: Programmatic API for issuing, rotating, validating, and revoking origin-scoped authentication sessions from the Strapi backend.
displayed_sidebar: cmsSidebar
tags:
  - API
  - Session Manager
  - authentication
  - JWT
---

# Session Manager API

<Tldr>

The Session Manager API is available at `strapi.sessionManager`. Use it from the backend or a plugin to issue short-lived access tokens and longer-lived refresh tokens, scoped to an origin such as `admin` or `users-permissions`.

</Tldr>

The Session Manager powers [admin panel session management](/cms/configurations/admin-panel#session-management) and [Users & Permissions refresh-token mode](/cms/features/users-permissions#jwt-management-modes). HTTP endpoints for those products are documented on their own pages. This page describes the JavaScript API for custom controllers, services, and plugins.

Access tokens are JWTs. Send them as `Authorization: Bearer <token>`. Refresh tokens are also JWTs. Admin stores refresh tokens in an HTTP-only cookie. Users & Permissions can return them in the response body or in a cookie, depending on configuration.

:::note Built-in HTTP APIs
End-user session list and revoke flows use the [Users & Permissions REST API](/cms/features/users-permissions/rest-api#session-management). Admin users manage devices from the admin profile, not from this API.
:::

## Access the API

`strapi.sessionManager` is registered at startup. Call it with an origin name to get an origin-scoped manager:

```js
const adminSessions = strapi.sessionManager('admin');
const upSessions = strapi.sessionManager('users-permissions');
```

The origin string must already be registered with [`defineOrigin()`](#defineorigin). Strapi registers `admin` and `users-permissions` during bootstrap. A missing origin throws:

```
SessionManager: Origin '<name>' is not defined. Please define it using defineOrigin('<name>', config).
```

## Origins and configuration

Each origin has its own JWT keys and lifespans. Strapi stores every origin's rows in the hidden `admin::session` content-type (database table `strapi_sessions`). Rows are isolated by the `origin` field.

| Origin | Registered by | Typical config |
| --- | --- | --- |
| `admin` | Admin server bootstrap | [`admin.auth.sessions`](/cms/configurations/admin-panel#session-management) and `admin.auth.secret` |
| `users-permissions` | Users & Permissions bootstrap | [`plugin::users-permissions` session keys](/cms/features/users-permissions#jwt-management-modes) |

`defineOrigin()` accepts the following fields:

| Field | Type | Description |
| --- | --- | --- |
| `jwtSecret` | string | Symmetric signing secret. Required for `HS256` (the default algorithm). |
| `accessTokenLifespan` | number | Access token lifetime, in seconds. |
| `maxRefreshTokenLifespan` | number | Maximum lifetime of a refresh-token family, in seconds. |
| `idleRefreshTokenLifespan` | number | Idle timeout for `type: 'refresh'` tokens, in seconds. |
| `maxSessionLifespan` | number | Maximum lifetime of a `type: 'session'` family, in seconds. |
| `idleSessionLifespan` | number | Idle timeout for `type: 'session'` tokens, in seconds. |
| `algorithm` | string | JWT algorithm. Default: `HS256`. |
| `jwtOptions` | object | Extra options passed to `jsonwebtoken`. For `RS*`, `ES*`, and `PS*` algorithms, set `privateKey` (signing) and `publicKey` (verification). |

Asymmetric algorithms read keys from `jwtOptions.privateKey` and `jwtOptions.publicKey`. They do not use `jwtSecret`.

### Token types

`generateRefreshToken()` accepts `type: 'refresh'` (default) or `type: 'session'`. The type selects which idle and max lifespans apply:

| `type` | Idle lifespan | Max lifespan |
| --- | --- | --- |
| `refresh` | `idleRefreshTokenLifespan` | `maxRefreshTokenLifespan` |
| `session` | `idleSessionLifespan` | `maxSessionLifespan` |

Admin uses `refresh` when `rememberMe` is true and `session` otherwise. Both types still issue a JWT whose payload `type` is `'refresh'`. Access tokens use payload `type: 'access'`.

### Session records

Active sessions are database rows. Typical fields include:

| Field | Description |
| --- | --- |
| `userId` | User identifier stored as a string. |
| `sessionId` | Opaque id embedded in the refresh JWT. |
| `deviceId` | Optional device family. Used for targeted invalidation. |
| `origin` | Origin that created the row. |
| `type` | `'refresh'` or `'session'`. |
| `status` | `'active'`, `'rotated'`, or `'revoked'`. |
| `metadata` | Origin-defined object. The Session Manager stores it as-is and does not interpret it. |
| `expiresAt` | Idle expiry. |
| `absoluteExpiresAt` | Family expiry. Rotation copies this value to the child row. |
| `childId` | Session id of the rotated successor, when present. |

[`rotateRefreshToken()`](#rotaterefreshtoken) marks the previous row as `rotated` and creates a child. [`listSessions()`](#listsessions) returns only `status: 'active'` rows, so each login family appears once.

Expired rows are deleted in batches about every 50 Session Manager calls. [`isSessionActive()`](#issessionactive) also deletes a row that has already expired.

## Method overview

Call methods on an origin-scoped manager, except `defineOrigin()`, `hasOrigin()`, and `generateSessionId()`, which live on `strapi.sessionManager` itself.

| Method | Purpose |
| --- | --- |
| [`generateRefreshToken()`](#generaterefreshtoken) | Create a session row and a refresh JWT. |
| [`generateAccessToken()`](#generateaccesstoken) | Issue an access JWT from a valid refresh JWT. |
| [`rotateRefreshToken()`](#rotaterefreshtoken) | Replace a refresh JWT and keep the same family expiry. |
| [`validateAccessToken()`](#validateaccesstoken) | Verify an access JWT (synchronous). |
| [`validateRefreshToken()`](#validaterefreshtoken) | Verify a refresh JWT and the backing session row. |
| [`invalidateRefreshToken()`](#invalidaterefreshtoken) | Delete sessions for a user, optionally limited to one device. |
| [`listSessions()`](#listsessions) | List active sessions for a user. |
| [`revokeSessionById()`](#revokesessionbyid) | Delete one session owned by the user and origin. |
| [`isSessionActive()`](#issessionactive) | Return whether a session exists and is not expired. |
| [`defineOrigin()`](#defineorigin) | Register origin configuration (root API). |
| [`hasOrigin()`](#hasorigin) | Check whether an origin is registered (root API). |
| [`generateSessionId()`](#generatesessionid) | Generate a random session id (root API). |

## Origin methods

The following methods are called on `strapi.sessionManager('<origin>')`.

### `generateRefreshToken()`

Creates a session row, then signs a refresh JWT that includes `userId`, `sessionId`, `type: 'refresh'`, `iat`, and `exp`.

<Endpoint
  id="generate-refresh-token"
  kind="js"
  path="strapi.sessionManager(origin).generateRefreshToken()"
  title="generateRefreshToken()"
  description="Creates a session and returns a refresh JWT. The origin must already be defined."
  paramTitle="Parameters"
  params={[
    { name: 'userId', type: 'string', required: true, description: 'User identifier stored on the session row.' },
    { name: 'deviceId', type: 'string or undefined', required: false, description: 'Optional device family. Pass <code>undefined</code> when the origin does not track devices.' },
    { name: 'options.type', type: "'refresh' | 'session'", required: false, description: 'Selects idle and max lifespans. Default: <code>refresh</code>.' },
    { name: 'options.metadata', type: 'object', required: false, description: 'Free-form data persisted on the row (for example device label).' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const sessions = strapi.sessionManager('users-permissions');

const { token, sessionId, absoluteExpiresAt } = await sessions.generateRefreshToken(
  String(user.id),
  deviceId,
  {
    type: 'refresh',
    metadata: { deviceName: 'CLI' },
  }
);
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "absoluteExpiresAt": "2026-09-26T12:00:00.000Z"
}
```

</ResponseTab>
</Responses>

</Endpoint>

### `generateAccessToken()`

Validates the refresh JWT and the active session row, then signs a short-lived access JWT. On failure the return value is `{ error: 'invalid_refresh_token' }` instead of throwing.

<Endpoint
  id="generate-access-token"
  kind="js"
  path="strapi.sessionManager(origin).generateAccessToken()"
  title="generateAccessToken()"
  description="Issues an access JWT from a refresh JWT. The session must be active and within idle and absolute expiry."
  paramTitle="Parameters"
  params={[
    { name: 'refreshToken', type: 'string', required: true, description: 'Refresh JWT returned by <code>generateRefreshToken()</code> or <code>rotateRefreshToken()</code>.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const result = await strapi.sessionManager('admin').generateAccessToken(refreshToken);

if ('error' in result) {
  throw new Error(result.error);
}

const accessToken = result.token;
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

</ResponseTab>
<ResponseTab status={400} statusText="invalid_refresh_token">

```json
{
  "error": "invalid_refresh_token"
}
```

</ResponseTab>
</Responses>

</Endpoint>

### `rotateRefreshToken()`

Creates a child session, marks the current row as `rotated`, and returns a new refresh JWT. Idle and max windows are enforced against the current row. If the parent already has a `childId`, the same child token is returned again.

<Endpoint
  id="rotate-refresh-token"
  kind="js"
  path="strapi.sessionManager(origin).rotateRefreshToken()"
  title="rotateRefreshToken()"
  description="Rotates a refresh JWT. Copies deviceId and metadata onto the child. Keeps the original absoluteExpiresAt."
  paramTitle="Parameters"
  params={[
    { name: 'refreshToken', type: 'string', required: true, description: 'Current refresh JWT.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const rotated = await strapi.sessionManager('users-permissions').rotateRefreshToken(
  refreshToken
);

if ('error' in rotated) {
  throw new Error(rotated.error);
}
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
  "absoluteExpiresAt": "2026-09-26T12:00:00.000Z",
  "type": "refresh"
}
```

</ResponseTab>
<ResponseTab status={400} statusText="error">

```json
{
  "error": "invalid_refresh_token"
}
```

</ResponseTab>
</Responses>

:::note Rotation errors
`rotateRefreshToken()` can also return `{ error: 'idle_window_elapsed' }` or `{ error: 'max_window_elapsed' }`.
:::

</Endpoint>

### `validateAccessToken()`

Verifies the JWT signature, algorithm, and payload `type: 'access'`. This method is synchronous and does not read the database. A revoked session can still present a valid access token until that token expires. Pair it with [`isSessionActive()`](#issessionactive) when you need the row to still exist.

<Endpoint
  id="validate-access-token"
  kind="js"
  path="strapi.sessionManager(origin).validateAccessToken()"
  title="validateAccessToken()"
  description="Verifies an access JWT for the origin. Returns the payload when the token is valid."
  paramTitle="Parameters"
  params={[
    { name: 'token', type: 'string', required: true, description: 'Access JWT.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const result = strapi.sessionManager('admin').validateAccessToken(accessToken);

if (!result.isValid) {
  return;
}

const { userId, sessionId } = result.payload;
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "isValid": true,
  "payload": {
    "userId": "1",
    "sessionId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    "type": "access",
    "iat": 1756281600,
    "exp": 1756283400
  }
}
```

</ResponseTab>
<ResponseTab status={401} statusText="invalid">

```json
{
  "isValid": false,
  "payload": null
}
```

</ResponseTab>
</Responses>

</Endpoint>

### `validateRefreshToken()`

Verifies the refresh JWT, then loads the session row. The row must exist, belong to the same `userId`, have `status: 'active'`, and be within `expiresAt` and `absoluteExpiresAt`.

<Endpoint
  id="validate-refresh-token"
  kind="js"
  path="strapi.sessionManager(origin).validateRefreshToken()"
  title="validateRefreshToken()"
  description="Validates a refresh JWT against the origin configuration and the session row."
  paramTitle="Parameters"
  params={[
    { name: 'token', type: 'string', required: true, description: 'Refresh JWT.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const validation = await strapi.sessionManager('admin').validateRefreshToken(
  refreshToken
);

if (!validation.isValid) {
  return;
}
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "isValid": true,
  "userId": "1",
  "sessionId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
}
```

</ResponseTab>
<ResponseTab status={401} statusText="invalid">

```json
{
  "isValid": false
}
```

</ResponseTab>
</Responses>

</Endpoint>

### `invalidateRefreshToken()`

Deletes session rows for the origin and user. Pass `deviceId` to limit deletion to that device family. Omit it to delete every session for the user on this origin.

<Endpoint
  id="invalidate-refresh-token"
  kind="js"
  path="strapi.sessionManager(origin).invalidateRefreshToken()"
  title="invalidateRefreshToken()"
  description="Deletes matching session rows. Used after logout and after credential changes."
  paramTitle="Parameters"
  params={[
    { name: 'userId', type: 'string', required: true, description: 'User identifier.' },
    { name: 'deviceId', type: 'string', required: false, description: 'When set, only rows with this device id are deleted.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
await strapi.sessionManager('users-permissions').invalidateRefreshToken(
  String(user.id)
);

await strapi.sessionManager('users-permissions').invalidateRefreshToken(
  String(user.id),
  deviceId
);
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{}
```

</ResponseTab>
</Responses>

</Endpoint>

### `listSessions()`

Returns active sessions for the user and origin, newest first.

<Endpoint
  id="list-sessions"
  kind="js"
  path="strapi.sessionManager(origin).listSessions()"
  title="listSessions()"
  description="Lists rows with status active. Rotated and revoked rows are omitted."
  paramTitle="Parameters"
  params={[
    { name: 'userId', type: 'string', required: true, description: 'User identifier.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const sessions = await strapi.sessionManager('admin').listSessions(String(user.id));
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
  {
    "userId": "1",
    "sessionId": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    "deviceId": "3f2e1d0c-9b8a-7c6d-5e4f-3210fedcba98",
    "origin": "admin",
    "type": "refresh",
    "status": "active",
    "metadata": { "deviceName": "Chrome on macOS" },
    "expiresAt": "2026-09-09T12:00:00.000Z",
    "absoluteExpiresAt": "2026-09-26T12:00:00.000Z"
  }
]
```

</ResponseTab>
</Responses>

</Endpoint>

### `revokeSessionById()`

Deletes one session when the row belongs to the given user and origin. Returns `true` if a matching row was deleted.

<Endpoint
  id="revoke-session-by-id"
  kind="js"
  path="strapi.sessionManager(origin).revokeSessionById()"
  title="revokeSessionById()"
  description="Revokes a single session. Returns false when the row is missing or owned by another user or origin."
  paramTitle="Parameters"
  params={[
    { name: 'userId', type: 'string', required: true, description: 'User identifier that must own the row.' },
    { name: 'sessionId', type: 'string', required: true, description: 'Session id to delete.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const revoked = await strapi.sessionManager('admin').revokeSessionById(
  String(user.id),
  sessionId
);
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
true
```

</ResponseTab>
</Responses>

</Endpoint>

### `isSessionActive()`

Returns `true` when a row exists for the origin and `expiresAt` is still in the future. If the row exists but has expired, the method deletes it and returns `false`.

<Endpoint
  id="is-session-active"
  kind="js"
  path="strapi.sessionManager(origin).isSessionActive()"
  title="isSessionActive()"
  description="Checks that a session row exists, matches the origin, and has not expired."
  paramTitle="Parameters"
  params={[
    { name: 'sessionId', type: 'string', required: true, description: 'Session id from an access or refresh token payload.' },
  ]}
>

<Tabs>
<TabItem value="request" label="Request">

```js
const access = strapi.sessionManager('admin').validateAccessToken(accessToken);

if (!access.isValid) {
  return;
}

const active = await strapi.sessionManager('admin').isSessionActive(
  access.payload.sessionId
);
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
true
```

</ResponseTab>
</Responses>

</Endpoint>

## Root methods

The following methods are called on `strapi.sessionManager` without an origin argument.

### `defineOrigin()`

Registers JWT and lifespan configuration for an origin. Call this during plugin bootstrap before issuing tokens. Calling it again with the same origin name replaces the previous configuration.

```js
strapi.sessionManager.defineOrigin('my-plugin', {
  jwtSecret: strapi.config.get('plugin::my-plugin.jwtSecret'),
  accessTokenLifespan: 30 * 60,
  maxRefreshTokenLifespan: 30 * 24 * 60 * 60,
  idleRefreshTokenLifespan: 14 * 24 * 60 * 60,
  maxSessionLifespan: 24 * 60 * 60,
  idleSessionLifespan: 2 * 60 * 60,
  algorithm: 'HS256',
});
```

### `hasOrigin()`

Returns whether `defineOrigin()` has been called for the name.

```js
if (!strapi.sessionManager.hasOrigin('my-plugin')) {
  throw new Error('Session origin my-plugin is not configured');
}
```

### `generateSessionId()`

Returns a 32-character hex string. `generateRefreshToken()` already calls this internally.

```js
const sessionId = strapi.sessionManager.generateSessionId();
```

## Custom origin example

The following plugin bootstrap registers an origin and issues tokens for a custom user id:

```js
module.exports = {
  async bootstrap({ strapi }) {
    strapi.sessionManager.defineOrigin('my-plugin', {
      jwtSecret: strapi.config.get('plugin::my-plugin.jwtSecret'),
      accessTokenLifespan: 30 * 60,
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60,
      idleRefreshTokenLifespan: 14 * 24 * 60 * 60,
      maxSessionLifespan: 24 * 60 * 60,
      idleSessionLifespan: 2 * 60 * 60,
    });
  },
};
```

```js
const origin = strapi.sessionManager('my-plugin');

const { token: refreshToken } = await origin.generateRefreshToken(
  userId,
  deviceId,
  { type: 'refresh' }
);

const access = await origin.generateAccessToken(refreshToken);
```

`admin.auth.secret` is still required at startup when the admin panel is served. API-only apps can set [`serveAdminPanel: false`](/cms/configurations/admin-panel#admin-panel-behavior) so that check is skipped. Users & Permissions can reuse `admin.auth.secret` when `jwtSecret` is unset.

## What's next?

<NextSteps title="">
  <NextSteps.Step
    title="Configure admin sessions"
    description="Set access and refresh lifespans, cookies, and JWT options for the admin panel."
    link="/cms/configurations/admin-panel#session-management"
  />
  <NextSteps.Step
    title="Configure Users & Permissions"
    description="Enable refresh-token mode and related REST endpoints for Content API users."
    link="/cms/features/users-permissions#jwt-management-modes"
  />
  <NextSteps.Step
    title="Users & Permissions REST API"
    description="Refresh, logout, list, and revoke sessions over HTTP."
    link="/cms/features/users-permissions/rest-api#session-management"
  />
</NextSteps>
