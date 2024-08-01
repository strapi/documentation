---
title: SSO configuration
sidebar_label: Single Sign-On (SSO)
displayed_sidebar: devDocsConfigSidebar
description: Strapi's SSO allows you to configure additional sign-in and sign-up methods for your administration panel. It requires an Enterprise Edition.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html
tags:
- additional configuration
- admin panel
- configuration
- Enterprise feature
- SSO 
---

# Single Sign-On <EnterpriseBadge/>

Single Sign-On on Strapi allows you to configure additional sign-in and sign-up methods for your administration panel.

:::prerequisites

- A Strapi application running on version 3.5.0 or higher is required.
- To configure SSO on your application, you will need an <EnterpriseBadge /> license.
- Make sure the SSO feature is [enabled in the admin panel](/user-docs/settings/single-sign-on).
- You will need to have a working knowledge of JavaScript and Node.js to configure SSO.

:::

:::caution
It is currently not possible to associate a unique SSO provider to an email address used for a Strapi account, meaning that the access to a Strapi account cannot be restricted to only one SSO provider. For more information and workarounds to solve this issue, [please refer to the dedicated GitHub issue](https://github.com/strapi/strapi/issues/9466#issuecomment-783587648).
:::

## Required configuration before setting up SSO

TODO: Add server configuration information

## Accessing the SSO configuration

The SSO configuration lives in the server configuration of the application, found at `./config/admin.js` or `./config/admin.ts`.

The providers' configuration should be written within the `auth.providers` path of the admin panel configuration.

`auth.providers` is an array of [provider configuration](#setting-up-provider-configuration).

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  // ...
  auth: {
    // ...
    providers: [], // The providers' configuration lives there
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default ({ env }) => ({
  // ...
  auth: {
    // ...
    providers: [], // The providers' configuration lives there
  },
  // ...
});
```

</TabItem>

</Tabs>

## Setting up provider configuration

A provider's configuration is a JavaScript object built with the following properties:

| Name             | Required | Type     | Description                                                                                                            |
|------------------|----------|----------|------------------------------------------------------------------------------------------------------------------------|
| `uid`            | true     | string   | The UID of the strategy. It must match the strategy's name                                                             |
| `displayName`    | true     | string   | The name that will be used on the login page to reference the provider                                                 |
| `icon`           | false    | string   | An image URL. If specified, it will replace the displayName on the login page                                          |
| `createStrategy` | true     | function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter |

:::tip
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

:::note
By default, Strapi security policy does not allow loading images from external URLs, so provider logos will not show up on the [login screen](/user-docs/intro#accessing-the-admin-panel) of the admin panel unless [a security exception is added](/dev-docs/configurations/middlewares#security).
:::

<details>
  <summary>Example: Security exception for provider logos</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./config/middlewares.js"
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'www.okta.com', // Base URL of the provider's logo
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./config/middlewares.ts"
export default [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'www.okta.com', // Base URL of the provider's logo
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

  </TabItem>
</Tabs>

</details>

:::note
When deploying the admin panel to a different location or on a different subdomain, an additional configuration is required to set the common domain for the cookies. This is required to ensure the cookies are shared across the domains.
:::

:::caution
Deploying the admin and backend on entirely different unrelated domains is not possible at this time when using SSO due to restrictions in cross-domain cookies.
:::

<details>
  <summary>Example: Setting custom cookie domain</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./config/admin.js"
module.exports = ({ env }) => ({
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".test.example.com"),
    providers: [
      // ...
    ],
  },
  url: env("ADMIN_URL", "http://admin.test.example.com"),
  // ...
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./config/admin.ts"
export default ({ env }) => ({
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".test.example.com"),
    providers: [
      // ...
    ],
  },
  url: env("ADMIN_URL", "http://admin.test.example.com"),
  // ...
});
```

</TabItem>
</Tabs>

</details>

### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

#### Configuration Object

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

A specific callback URL can be generated for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

:::tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

**Verify Function**

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` object.

### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

Strapi uses [Passport.js](http://www.passportjs.org/), which enables a large selection of providers. Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

:::caution
Strategies such as [ldapauth](https://github.com/vesse/passport-ldapauth) don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a [custom strategy](http://www.passportjs.org/packages/passport-custom/).
You can also use services such as Okta and Auth0 as bridge services.
:::

### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your admin configuration file, either from an installed package or a local file.
2. You'll need to add a new item to the `auth.providers` array in your admin panel configuration that will match the [format given above](#setting-up-provider-configuration)
3. Restart your application, the provider should appear on your admin login page.

### Provider configuration examples

| Provider           | Package                    | Configuration                                                                     |
|--------------------|----------------------------|-----------------------------------------------------------------------------------|
| Auth0              | `passport-auth0`           | [Auth0 configuration](/dev-docs/configurations/sso-providers/auth0)               |
| Discord            | `passport-discord`         | [Discord configuration](/dev-docs/configurations/sso-providers/discord)           |
| Microsoft Entra ID | `passport-azure-ad-oauth2` | [Microsoft configuration](/dev-docs/configurations/sso-providers/entra-id)        |
| GitHub             | `passport-github`          | [GitHub configuration](/dev-docs/configurations/sso-providers/github)             |
| Gitlab             | `passport-gitlab2`         | [Gitlab configuration](/dev-docs/configurations/sso-providers/gitlab)             |
| Google             | `passport-google-oauth20`  | [Google configuration](/dev-docs/configurations/sso-providers/google)             |
| Keycloak           | `passport-keycloak-oauth2` | [Keycloak configuration](/dev-docs/configurations/sso-providers/keycloak)         |
| Okta               | `passport-okta-oauth20`    | [Okta configuration](/dev-docs/configurations/sso-providers/okta)                 |
| Generic OIDC       | `passport-oidc`            | [Generic OIDC configuration](/dev-docs/configurations/sso-providers/generic-oidc) |
| Generic SAML       | `passport-saml`            | [Generic SAML configuration](/dev-docs/configurations/sso-providers/generic-saml) |

## Performing advanced customization

### Custom Logic

In some scenarios, you will want to write additional logic for your connection workflow such as:

- restricting connection and registration for a specific domain
- triggering actions on connection attempt
- adding analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official strapi.io email address, you can instantiate your strategy like this:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

const strategyInstance = new Strategy(configuration, ({ email, username }, done) => {
  // If the email ends with @strapi.io
  if (email.endsWith('@strapi.io')) {
    // then we continue with the data given by the provider
    return done(null, { email, username });
  }

  // Otherwise, we continue by sending an error to the done function
  done(new Error('Forbidden email address'));
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

const strategyInstance = new Strategy(configuration, ({ email, username }, done) => {
  // If the email ends with @strapi.io
  if (email.endsWith('@strapi.io')) {
    // then we continue with the data given by the provider
    return done(null, { email, username });
  }

  // Otherwise, we continue by sending an error to the done function
  done(new Error('Forbidden email address'));
});
```

</TabItem>

</Tabs>

### Authentication Events

The SSO feature adds a new [authentication event](/dev-docs/configurations/admin-panel#available-options): `onSSOAutoRegistration`.

This event is triggered whenever a user is created using the auto-register feature added by SSO.
It contains the created user (`event.user`), and the provider used to make the registration (`event.provider`).

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = () => ({
    auth: {
      // ...
      events: {
        onConnectionSuccess(e) {},
        onConnectionError(e) {},
        // ...
        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default () => ({
    auth: {
      // ...
      events: {
        onConnectionSuccess(e) {},
        onConnectionError(e) {},
        // ...
        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
});
```

</TabItem>

</Tabs>

## Debugging common issues with SSO

### Oops something went wrong

TODO add information about common error page

### Insecure Cookies

TODO add information about insecure cookies

### Redirect URI mismatch

TODO add information about redirect URI mismatch

### Opening in a new tab requires logging in again

TODO explain why opening in a new tab requires logging in again
