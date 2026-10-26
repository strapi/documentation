---
title: Creating and adding a custom Users & Permissions provider
description: todo
displayed_sidebar: cmsSidebar
tags:
- users & permissions
- providers
- configuration
- customization
---

# Creating and adding a custom Users & Permissions provider

<Tldr>

Create custom OAuth providers for Strapi's Users & Permissions feature by registering them in `src/index.js` and implementing an `authCallback` that returns user `email` and `username` for automatic registration or login.

</Tldr>


Strapi provides a list of [built-in providers](/cms/configurations/users-and-permissions-providers#setting-up-the-provider---examples) for the [Users & Permissions feature](/cms/features/users-permissions). You can also create your own provider following this guide.

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers) and understood the login flow.
:::

## Creating a custom provider

A custom provider is registered with the `add()` method of the `providers-registry` service of the Users & Permissions feature. Call `add()` from [the `register` lifecycle function](/cms/configurations/functions#register) in the `src/index.js|ts` file of your Strapi application. A plugin can also call `add()` from its own server `register()` function.

The following example registers an OAuth 2.0 provider named `example-provider-name`. Replace the URLs with the endpoints documented by your identity provider:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```js title="/src/index.js"
module.exports = {
  register({ strapi }) {
    strapi
      .plugin('users-permissions')
      .service('providers-registry')
      .add('example-provider-name', {
        icon: '',
        enabled: false,
        grantConfig: {
          key: '',
          secret: '',
          callback: 'http://localhost:3000/connect/example-provider-name/redirect',
          scope: ['email'],
          authorize_url: 'https://provider.example.com/authorize',
          access_url: 'https://provider.example.com/token',
          oauth: 2,
        },
        async authCallback({ accessToken }) {
          const response = await fetch('https://provider.example.com/api/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            throw new Error('Unable to fetch the user profile');
          }

          const profile = await response.json();

          return {
            username: profile.username,
            email: profile.email,
          };
        },
      });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/index.ts"
import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi
      .plugin('users-permissions')
      .service('providers-registry')
      .add('example-provider-name', {
        icon: '',
        enabled: false,
        grantConfig: {
          key: '',
          secret: '',
          callback: 'http://localhost:3000/connect/example-provider-name/redirect',
          scope: ['email'],
          authorize_url: 'https://provider.example.com/authorize',
          access_url: 'https://provider.example.com/token',
          oauth: 2,
        },
        async authCallback({ accessToken }: { accessToken: string }) {
          const response = await fetch('https://provider.example.com/api/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.ok) {
            throw new Error('Unable to fetch the user profile');
          }

          const profile = await response.json();

          return {
            username: profile.username,
            email: profile.email,
          };
        },
      });
  },
};
```

</TabItem>
</Tabs>

The name passed as the first argument of `add()` identifies the provider in the URLs of the login flow (for example, `/api/connect/example-provider-name`) and in the admin panel.

### Provider configuration

The second argument of `add()` is an object that accepts the following properties:

| Parameter | Description | Type | Required | Default |
|-----------|-------------|------|----------|---------|
| `enabled` | Whether the provider is enabled when Strapi first saves its settings. If omitted, the provider stays disabled until you enable it in the admin panel. | Boolean | No | - |
| `icon` | Icon name saved with the provider settings. Built-in providers use Font Awesome brand icon names (for example, `discord`). | String | No | - |
| `grantConfig` | OAuth settings of the provider (see [`grantConfig` options](#grantconfig-options)). | Object | Yes | - |
| `authCallback` | Function that receives the token returned by the identity provider and returns the user's `username` and `email` (see [`authCallback` function](#authcallback-function)). | Function | Yes | - |

When Strapi starts, it saves the `enabled`, `icon`, and `grantConfig` values of every registered provider in the database. Values already saved in the database, for instance the credentials entered in the admin panel, take precedence over the values defined in code. The `authCallback` function is not saved in the database: Strapi calls it from the registry at each login.

#### `grantConfig` options

The `grantConfig` object accepts the following options:

| Parameter | Description | Type | Required | Default |
|-----------|-------------|------|----------|---------|
| `key` | Client ID of the OAuth application. Leave it empty and set it in the admin panel. | String | Yes | - |
| `secret` | Client secret of the OAuth application. Leave it empty and set it in the admin panel. | String | Yes | - |
| `callback` | URL of your front-end application that Strapi redirects to at the end of the OAuth flow. You can change it in the admin panel. | String | Yes | - |
| `authorize_url` | Authorization endpoint of the identity provider. | String | Yes | - |
| `access_url` | Token endpoint of the identity provider. | String | Yes | - |
| `oauth` | OAuth version: `2` for OAuth 2.0, `1` for OAuth 1.0a. | Number | No | `2` |
| `request_url` | Request token endpoint of the identity provider. Only used, and required, when `oauth` is `1`. | String | No | - |
| `scope` | Scopes requested from the identity provider. Request the scopes that give access to the user's email address. | Array of strings or String | No | - |
| `scope_delimiter` | Character used to join the `scope` array in the authorization URL. Many OAuth 2.0 providers expect a space (`' '`). | String | No | `','` |
| `token_endpoint_auth_method` | Set to `'client_secret_basic'` to send the client ID and secret in an HTTP Basic `Authorization` header instead of the request body when exchanging the authorization code. | String | No | - |
| `subdomain` | Value that replaces the `[subdomain]` placeholder in `authorize_url` and `access_url`. When this value is set, the admin panel also displays a *Host URI (Subdomain)* field for the provider. | String | No | - |

#### `authCallback` function

Strapi calls `authCallback` once the identity provider has returned a token. The function receives an object with the following properties:

| Parameter | Description | Type |
|-----------|-------------|------|
| `accessToken` | Token returned by the identity provider. Use it to request the user's profile from the provider's API. | String |
| `grantResponse` | Token response saved in the session at the end of the OAuth flow. For custom providers, it contains the `access_token`, `oauth_token`, and `id_token` values returned by the identity provider, when present. | Object |
| `query` | Same object as `grantResponse`. | Object |
| `providers` | Settings of all providers, as saved in the database (for example, `providers['example-provider-name'].key`). | Object |

The function must return an object with at least a `username` and an `email` property, or a promise resolving to such an object. Throw an error to stop the login: Strapi then responds with a `400` error that contains the error message.

The built-in providers declared in <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/plugins/users-permissions/server/src/services/providers-registry.js" text="`providers-registry.js`"/> in the Strapi codebase are examples of `authCallback` functions.

:::note Changes in recent Strapi 5 versions
- Since Strapi 5.51.0, the Users & Permissions feature runs the OAuth flow itself instead of relying on the `grant` and `purest` packages. `authCallback` no longer receives a `purest` parameter: use `fetch` or any HTTP client to call the provider's API.
- Since Strapi 5.53.0, `authCallback` also receives the `grantResponse` parameter, and Strapi keeps the token in the session instead of adding an `access_token` parameter to the front-end redirect URL (see [Frontend setup](#frontend-setup)).
:::

### Configuring the provider in the admin panel

Once Strapi has restarted with the new provider registered, the provider is listed in <Icon name="gear-six" /> *Users & Permissions plugin > Providers* in the admin panel, with the built-in providers. To set the credentials of the provider:

1. Click on the edit <Icon name="pencil-simple" /> button of your provider.
2. Set the *Enable* option to **True**.
3. Fill in the *Client ID* and *Client Secret* fields with the credentials of the OAuth application created on the identity provider side.
4. Fill in *The redirect URL to your front-end app* field with the URL of the front-end route that completes the login (see [Frontend setup](#frontend-setup)).
5. Copy the URL displayed in the read-only *The redirect URL to add in your [provider] application configurations* field, for example `http://localhost:1337/api/connect/example-provider-name/callback`, and add it to the allowed redirect URLs of the OAuth application on the identity provider side.
6. Click on the **Save** button.

### How authentication flow works

The object returned by the `authCallback` function must contain at least `username` and `email` properties. Strapi uses the returned email address, converted to lowercase, to resolve the authentication flow for both registration and login:

* If a user with this `email` was already registered with the same provider: Strapi logs this user in and returns the JWT and user object.
* If no user with this `email` exists: Strapi registers a new user with the returned `email` and `username`, assigns the default role, and logs the user in. If the `username` is already taken, Strapi derives a unique username from it.
* If a user with this `email` was registered with another provider and the *One account per email address* option is enabled in the [advanced settings](/cms/features/users-permissions#advanced-settings), Strapi rejects the login with an `Email is already taken.` error.

Registration through a provider also requires the *Enable sign-ups* option of the advanced settings to be enabled.

Because of this design, you do not need to implement separate lookup or registration logic inside your custom provider. You only need to ensure your `authCallback` fetches the user's profile from the external provider and returns the user's `email` and `username`.

### Frontend setup

The OAuth flow between Strapi and the identity provider happens in the browser and relies on a session cookie that Strapi sets on its own domain. Once you have configured Strapi and the provider, in your frontend application you must:

1. Create a button that links to `STRAPI_BACKEND_URL/api/connect/${provider}` (for example, `https://strapi.mywebsite.com/api/connect/example-provider-name`).<br/>
   Strapi redirects the browser to the identity provider. Once the user has authorized the application, the identity provider redirects the browser back to `STRAPI_BACKEND_URL/api/connect/${provider}/callback`. Strapi then exchanges the authorization code for a token, saves the token response in the session, and redirects the browser to the front-end redirect URL set in the admin panel. The token is not added to the URL.
2. Create the front-end route set as the redirect URL, for example `FRONTEND_URL/connect/${provider}/redirect`. This route must send a `GET` request to `STRAPI_BACKEND_URL/api/auth/${provider}/callback` that includes the Strapi session cookie (for example, with `credentials: 'include'` when using `fetch`).<br/>
   Strapi calls the `authCallback` function of the provider, then responds with `{ "jwt": "...", "user": {...} }`. In the `refresh` [JWT management mode](/cms/features/users-permissions#jwt-management-modes), the response also includes a `refreshToken`, unless the refresh token is sent as an HTTP-only cookie.

If the login fails on the identity provider side or during the token exchange, Strapi redirects the browser to the front-end redirect URL with `error` and `error_description` query parameters instead.

The `/api/connect/${provider}` URL also accepts an optional `callback` query parameter that replaces the front-end redirect URL for this login (for example, `/api/connect/example-provider-name?callback=http://localhost:3000/connect/example-provider-name/redirect?lang=fr`). By default, the URL must have the same origin and path as the redirect URL set in the admin panel. To accept other URLs, [create a custom callback validator](/cms/features/users-permissions#creating-a-custom-password-validation).

Now you can make authenticated requests, as described in [token usage](/cms/features/users-permissions#token-usage).

### Reset password

**Can only be used for users registered using the email provider.**

<Tabs>

<TabItem value="Forgot & Reset flow">

The assumed general flow:

1. The user goes to your **forgotten password page**.
2. The user enters their email address.
3. Your forgotten password page sends a request to the backend to send an email with the reset password link to the user.
4. The user receives the email and clicks on the special link.
5. The link redirects the user to your **reset password page**.
6. The user enters their new password.
7. The **reset password page** sends a request to the backend with the new password.
8. If the request contains the code contained in the link at step 3, the password is updated.
9. The user can log in with the new password.

The following section details steps 3 and 7.

#### Forgotten password: ask for the reset password link

This action sends an email to a user with the link to your reset password page. The link will be enriched with the url param `code` that is needed for the [reset password](#reset-password) at step 7.

First, you must specify the following:

- In the admin panel: _Settings > USERS & PERMISSIONS PLUGIN > Advanced Settings > Reset Password_ page, the `url` to your reset password page.
- In the admin panel: _Settings > USERS & PERMISSIONS PLUGIN > Email Template_ page, the _Shipper email_.

Then, your **forgotten password page** has to make the following request to your backend:

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/api/auth/forgot-password', {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

#### Reset Password: Send the new password

This action will update the user password.
This also works with the [GraphQL Plugin](/cms/plugins/graphql), with the `resetPassword` mutation.

Your **reset password page** has to make the following request to your backend:

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/api/auth/reset-password', {
    code: 'privateCode', // code contained in the reset link of step 3.
    password: 'userNewPassword',
    passwordConfirmation: 'userNewPassword',
  })
  .then(response => {
    console.log("Your user's password has been reset.");
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

</TabItem>

<TabItem title="Change the password flow" value="Change the password flow">

You can also update an authenticated user password through the `/change-password` API endpoint:

```js
import axios from 'axios';

// Request API.
axios.post(
  'http://localhost:1337/api/auth/change-password',
  {
    currentPassword: 'currentPassword',
    password: 'userNewPassword',
    passwordConfirmation: 'userNewPassword',
  },
  {
    headers: {
      Authorization: 'Bearer <user jwt>',
    },
  }
);
```

</TabItem>

</Tabs>

### Email validation

:::note
In production, make sure the `url` config property is set. Otherwise the validation link will redirect to `localhost`. More info on the config [here](/cms/configurations/server).
:::

After registering, if you have set **Enable email confirmation** to **ON**, the user will receive a confirmation link by email. The user has to click on it to validate their registration.

Example of the confirmation link: `https://yourwebsite.com/api/auth/email-confirmation?confirmation=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNTk0OTgxMTE3LCJleHAiOjE1OTc1NzMxMTd9.0WeB-mvuguMyr4eY8CypTZDkunR--vZYzZH6h6sChFg`

If needed you can re-send the confirmation email by making the following request:

```js
import axios from 'axios';

// Request API.
axios
  .post(`http://localhost:1337/api/auth/send-email-confirmation`, {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.error('An error occurred:', error.response);
  });
```

## <Icon name="bug" /> Troubleshooting

Each of the following symptoms can appear while setting up a custom provider. The symptom is in bold, followed by what causes it and what to change:

- **The login fails with `Email was not available.`** The `authCallback` did not return a valid `email` address. Make sure the provider application requests the OAuth scopes that expose the email (for instance `email` or `profile`), and check that the identity provider actually returns it in the payload: some users hide their email address or set it to private on the provider side.

- **Requests fail with error `429`.** The login flow most likely fell into a loop. Wait a few minutes or restart the backend before making new requests.

- **The callback fails with `OAuth authentication requires a completed provider session`.** The request to `/api/auth/${provider}/callback` did not include the session cookie set during the OAuth flow, or the flow did not complete. Make sure the front-end request sends cookies, and try again in a private tab to rule out a stale session or cookie.

- **The connection fails with `Unknown OAuth provider`.** The `authorize_url` or `access_url` option of the provider's `grantConfig` is missing, as well as `request_url` for an OAuth 1.0a provider. Add the missing options to `grantConfig`.

- **The connection fails with `Provider callback URL is not configured`.** In the admin panel, the *The redirect URL to your front-end app* field of the provider is empty. Fill it in.

- **The redirect URL can't be built.** The backend URL is not set. Set it in `config/server.js`, as described in [Setting up the server URL](/cms/configurations/users-and-permissions-providers#setting-up-the-server-url).

- **The login fails while the backend runs behind ngrok.** Some URLs still point to `http://localhost:1337`. Check your URLs and use the ngrok URL instead.

- **You can't access the admin panel after restarting ngrok.** The admin panel was built with the previous ngrok URL as backend URL. Replace the backend URL with the new ngrok URL and run `yarn build` or `npm run build` again.
