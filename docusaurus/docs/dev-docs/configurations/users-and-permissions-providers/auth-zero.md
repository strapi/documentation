---
title: Auth0 provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Auth0 provider for Users & Permissions

<h4 id="auth0">Using ngrok</h4>

Auth0 accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="auth0-config">Auth0 configuration</h4>

- Visit your Auth0 tenant dashboard
- In API section, create a new API
- In application, create a `machine-to-machine` application and select the API that you have just created
- In settings of this app set these values:
  - **Allowed Callback URLs**: `http://localhost:1337/api/connect/auth0/callback`
  - **Allowed Logout URLs**: `http://localhost:3000`
  - **Allowed Web Origins**: `http://localhost:3000`
- At the bottom of settings, show "Advanced Settings" and go to the "Grant Types". Ensure that these grants are checked/enabled:
  - Implicit
  - Authorization Code
  - Refresh Token
  - Client Credentials

<h4 id="auth0-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Auth0** provider
- Fill the information:
  - Enable: `ON`
  - Client ID: `<Your Auth0 Client ID>`
  - Client Secret: `<Your Auth0 Client Secret>`
  - Subdomain: `<Your Auth0 tenant url>`, example it is the part in bold in the following url: https://**my-tenant.eu**.auth0.com/
  - The redirect URL to your front-end app: `http://localhost:3000/connect/auth0`
