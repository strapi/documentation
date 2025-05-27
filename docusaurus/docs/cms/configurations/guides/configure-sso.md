---
title: SSO configuration
sidebar_label: How to configure SSO
displayed_sidebar: cmsSidebar
toc_max_heading_level: 6
description: Strapi's SSO allows you to configure additional sign-in and sign-up methods for your administration panel. It requires an Enterprise Edition with a Gold plan.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html
tags:
- additional configuration
- admin panel
- configuration
- Enterprise feature
- SSO 
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# How to configure SSO providers
<EnterpriseBadge/> <SsoBadge />

[Single Sign-On (SSO)](/cms/features/sso) on Strapi allows you to configure additional sign-in and sign-up methods for the Strapi admin panel.

:::prerequisites

- To configure SSO on your application, you will need an <EnterpriseBadge /> plan or the <SsoBadge /> add-on.
- Make sure Strapi is part of the applications you can access with your provider. For example, with Microsoft (Azure) Active Directory, you must first ask someone with the right permissions to add Strapi to the list of allowed applications. Please refer to your provider(s) documentation to learn more about that.
:::

:::caution
- It is currently not possible to associate a unique SSO provider to an email address used for a Strapi account, meaning that the access to a Strapi account cannot be restricted to only one SSO provider. For more information and workarounds to solve this issue, <ExternalLink to="https://github.com/strapi/strapi/issues/9466#issuecomment-783587648" text="please refer to the dedicated GitHub issue"/>.
- Deploying the admin and backend on entirely different unrelated domains is not possible at this time when using SSO.
:::

## Accessing the configuration

The SSO configuration lives in the `/config/admin` file.

The providers' configuration should be written in the `auth.providers` path of the admin panel as an array of [provider configurations](#setting-up-provider-configuration):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

module.exports = ({ env }) => ({
  // ...
  auth: {
    providers: [], // The providers' configuration lives there
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/admin.ts"

export default ({ env }) => ({
  // ...
  auth: {
    providers: [], // The providers' configuration lives there
  },
});
```

</TabItem>

</Tabs>

## Setting up provider configuration

A provider's configuration is a JavaScript object built with the following properties:

| Name             | Required | Type     | Description                                                                                                            |
|------------------|----------|----------|------------------------------------------------------------------------------------------------------------------------|
| `uid`            | Yes     | String   | The UID of the strategy. It must match the strategy's name.                                                             |
| `displayName`    | Yes     | String   | The name that will be used on the login page to reference the provider.                                                |
| `createStrategy` | Yes     | Function | A factory that will build and return a new passport strategy for your provider. Takes the strapi instance as parameter. |
| `icon`           | No    | String   | An image URL. If specified, it will replace the displayName on the login page.                                          |

:::note
The `uid` property is the unique identifier of each strategy and is generally found in the strategy's package. If you are not sure of what it refers to, please contact the maintainer of the strategy.
:::

### Displaying providers logos

By default, Strapi security policy does not allow loading images from external URLs, so provider logos will not show up on the [login screen](/cms/features/admin-panel#usage) of the admin panel unless [a security exception is added through middlewares configuration](/cms/configurations/middlewares#security), as in the following example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/config/middlewares.js"
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
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
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

```ts title="/config/middlewares.ts"
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
            'dl.airtable.com',
            'www.okta.com', // Base URL of the provider's logo
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
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

### Setting common domain for cookies

When deploying the admin panel to a different location or on a different subdomain, an additional configuration is required to set the common domain for the cookies. This is required to ensure the cookies are shared across the domains.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/config/admin.js"
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

```ts title="/config/admin.ts"
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

### The `createStrategy` Factory

A passport strategy is usually built by instantiating it using 2 parameters: the configuration object, and the verify function.

#### Configuration object

The configuration object depends on the strategy needs, but often asks for a callback URL to be redirected to once the connection has been made on the provider side.

A specific callback URL can be generated for your provider using the `getStrategyCallbackURL` method. This URL also needs to be written on the provider side in order to allow redirection from it.

The format of the callback URL is the following: `/admin/connect/<provider_uid>`.

:::tip
`strapi.admin.services.passport.getStrategyCallbackURL` is a Strapi helper you can use to get a callback URL for a specific provider. It takes a provider name as a parameter and returns a URL.
:::

If needed, this is also where you will put your client ID and secret key for your OAuth2 application.

#### Verify function

The verify function is used here as a middleware allowing the user to transform and make extra processing on the data returned from the provider API.

This function always takes a `done` method as last parameter which is used to transfer needed data to the Strapi layer of SSO.

Its signature is the following: `void done(error: any, data: object);` and it follows the following rules:

- If `error` is not set to `null`, then the data sent is ignored, and the controller will throw an error.
- If the SSO's auto-registration feature is disabled, then the `data` object only need to be composed of an `email` property.
- If the SSO's auto-registration feature is enabled, then you will need to define (in addition to the `email`) either a `username` property or both `firstname` and `lastname` within the `data` object.

### Adding a provider

Adding a new provider means adding a new way for your administrators to log-in.

Strapi uses <ExternalLink to="http://www.passportjs.org/" text="Passport.js"/>, which enables a large selection of providers. Any valid passport strategy that doesn't need additional custom data should therefore work with Strapi.

:::caution
Strategies such as <ExternalLink to="https://github.com/vesse/passport-ldapauth" text="ldapauth"/> don't work out of the box since they require extra data to be sent from the admin panel.
If you want to add an LDAP provider to your application, you will need to write a <ExternalLink to="http://www.passportjs.org/packages/passport-custom/" text="custom strategy"/>.
You can also use services such as Okta and Auth0 as bridge services.
:::

### Configuring the provider

To configure a provider, follow the procedure below:

1. Make sure to import your strategy in your admin configuration file, either from an installed package or a local file.
2. Add a new item to the `auth.providers` array in your admin panel configuration that matches the [format given above](#setting-up-provider-configuration).
3. Rebuild and restart your application with `yarn build && yarn develop` or `npm run build && npm run develop`. The provider should appear on your admin login page.

#### Provider configuration examples

The following examples show how SSO is configured for the most common providers:

<CustomDocCardsWrapper>
<CustomDocCard icon="plugs-connected" title="Google" description="Learn how to configure SSO with Google and Strapi." link="/cms/configurations/sso-providers/google" />
<CustomDocCard icon="plugs-connected" title="GitHub" description="Learn how to configure SSO with GitHub and Strapi." link="/cms/configurations/sso-providers/github" />
<CustomDocCard icon="plugs-connected" title="Discord" description="Learn how to configure SSO with Discord and Strapi." link="/cms/configurations/sso-providers/discord" />
<CustomDocCard icon="plugs-connected" title="Microsoft" description="Learn how to configure SSO with Microsoft and Strapi." link="/cms/configurations/sso-providers/microsoft" />
<CustomDocCard icon="plugs-connected" title="Keycloak" description="Learn how to configure SSO with Keycloak and Strapi." link="/cms/configurations/sso-providers/keycloak" />
<CustomDocCard icon="plugs-connected" title="Okta" description="Learn how to configure SSO with Okta and Strapi." link="/cms/configurations/sso-providers/okta" />
</CustomDocCardsWrapper>

## Performing advanced customization

### Admin panel URL

If the administration panel lives on a host/port different from the Strapi server, the admin panel URL needs to be updated: Update the `url` key in [the `/config/admin` file](/cms/admin-panel-customization/host-port-path).

### Custom logic

In some scenarios, you will want to write additional logic for your connection workflow such as:

- restricting connection and registration for a specific domain
- triggering actions on connection attempt
- adding analytics

The easiest way to do so is to plug into the verify function of your strategy and write some code.

For example, if you want to allow only people with an official `strapi.io` email address, you can instantiate your strategy like follows:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

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

```ts title="/config/admin.ts"

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

### Authentication events

The SSO feature adds a new [authentication event](/cms/configurations/admin-panel#authentication): `onSSOAutoRegistration`.

This event is triggered whenever a user is created using the auto-register feature added by SSO.
It contains the created user (`event.user`), and the provider used to make the registration (`event.provider`).

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

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

```ts title="/config/admin.ts"

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
