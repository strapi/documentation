---
title: Session Management Configuration
description: Configure session management for enhanced authentication security in Strapi applications.
displayed_sidebar: cmsSidebar
---

# Session Management Configuration

Session management provides enhanced security for authentication in Strapi applications by using short-lived access tokens paired with longer-lived refresh tokens. This approach reduces the risk of token theft and allows for more granular control over user sessions.

## Overview

Strapi's session management system supports both admin panel authentication and content API authentication through the Users & Permissions plugin. The system provides:

- **Short-lived access tokens** (typically 30 minutes) for API requests
- **Refresh tokens** for obtaining new access tokens
- **Device-specific sessions** for targeted logout
- **Configurable token lifespans** for different security requirements

## Admin Authentication Configuration

Admin authentication uses session management by default and is configured in your admin configuration.

### Basic Configuration

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      accessTokenLifespan: 1800, // 30 minutes
      maxRefreshTokenLifespan: 2592000, // 30 days
      idleRefreshTokenLifespan: 604800, // 7 days
      maxSessionLifespan: 604800, // 7 days
      idleSessionLifespan: 3600, // 1 hour
    },
    cookie: {
      domain: env('ADMIN_COOKIE_DOMAIN'),
      path: '/admin',
      sameSite: 'lax',
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/admin.ts"
export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      accessTokenLifespan: 1800, // 30 minutes
      maxRefreshTokenLifespan: 2592000, // 30 days
      idleRefreshTokenLifespan: 604800, // 7 days
      maxSessionLifespan: 604800, // 7 days
      idleSessionLifespan: 3600, // 1 hour
    },
    cookie: {
      domain: env('ADMIN_COOKIE_DOMAIN'),
      path: '/admin',
      sameSite: 'lax',
    },
  },
});
```

</TabItem>

</Tabs>

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accessTokenLifespan` | number | 1800 | Access token lifespan in seconds |
| `maxRefreshTokenLifespan` | number | 2592000 | Maximum refresh token lifespan in seconds |
| `idleRefreshTokenLifespan` | number | 604800 | Idle refresh token timeout in seconds |
| `maxSessionLifespan` | number | 604800 | Maximum session duration in seconds |
| `idleSessionLifespan` | number | 3600 | Session idle timeout in seconds |

### Cookie Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domain` | string | undefined | Cookie domain (inherits from server if not set) |
| `path` | string | '/admin' | Cookie path |
| `sameSite` | string | 'lax' | SameSite cookie attribute |

## Users & Permissions Configuration

The Users & Permissions plugin supports both legacy JWT mode and session management mode.

### Enabling Session Management

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh', // Enable session management
      sessions: {
        accessTokenLifespan: 604800, // 1 week (default)
        maxRefreshTokenLifespan: 2592000, // 30 days
        idleRefreshTokenLifespan: 604800, // 7 days
        httpOnly: false, // Set to true for HTTP-only cookies
        cookie: {
          name: 'strapi_up_refresh',
          sameSite: 'lax',
          path: '/',
          secure: false, // true in production
        }
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh', // Enable session management
      sessions: {
        accessTokenLifespan: 604800, // 1 week (default)
        maxRefreshTokenLifespan: 2592000, // 30 days
        idleRefreshTokenLifespan: 604800, // 7 days
        httpOnly: false, // Set to true for HTTP-only cookies
        cookie: {
          name: 'strapi_up_refresh',
          sameSite: 'lax',
          path: '/',
          secure: false, // true in production
        }
      },
    },
  },
});
```

</TabItem>

</Tabs>

### Legacy Mode (Default)

For backwards compatibility, the plugin defaults to legacy mode:

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'legacy-support',
      jwt: {
        expiresIn: '7d', // Traditional JWT expiry
      },
    },
  },
});
```

### JWT Management Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `legacy-support` | Traditional long-lived JWTs | Existing applications, simple authentication |
| `refresh` | Session management with refresh tokens | New applications, enhanced security requirements |

## Environment Variables

Set these environment variables for secure configuration:

```bash title=".env"
# Admin authentication
ADMIN_JWT_SECRET=your-admin-secret-key

# Cookie domain (optional)
ADMIN_COOKIE_DOMAIN=yourdomain.com

# Users & Permissions JWT secret
JWT_SECRET=your-content-api-secret-key

# Users & Permissions session management
UP_JWT_MANAGEMENT=refresh  # or 'legacy-support'
UP_SESSIONS_ACCESS_TTL=604800  # 1 week in seconds
UP_SESSIONS_MAX_REFRESH_TTL=2592000  # 30 days in seconds
UP_SESSIONS_IDLE_REFRESH_TTL=604800  # 7 days in seconds
UP_SESSIONS_HTTPONLY=false  # true for HTTP-only cookies
UP_SESSIONS_COOKIE_NAME=strapi_up_refresh
UP_SESSIONS_COOKIE_SAMESITE=lax
UP_SESSIONS_COOKIE_PATH=/
UP_SESSIONS_COOKIE_SECURE=false  # true in production
```
