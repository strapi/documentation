---
title: CAS provider setup for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

import ConfigDone from '/docs/snippets/u-and-p-provider-config-done.md'

# CAS provider setup for Users & Permissions

The present page explains how to setup the Auth0 provider for the [Users & Permissions feature](/cms/features/users-permissions).

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers).
:::

## CAS configuration

:::note
A remote CAS server can be configured to accept `localhost` URLs or you can run your own CAS server locally that accepts them.

The use of `ngrok` is not needed.
:::

- [CAS](https://github.com/apereo/cas) is an SSO server that supports many different methods of verifying a users identity,
  retrieving attributes out the user and communicating that information to applications via protocols such as SAML, OIDC, and the CAS protocol. Strapi can use a CAS server for authentication if CAS is deployed with support for OIDC.
- [CAS](https://github.com/apereo/cas) could already be used by your company or organization or you can setup a local CAS server by cloning the [CAS Overlay](https://github.com/apereo/cas-overlay-template) project or using the newer [CAS Initializr](https://github.com/apereo/cas-initializr) to create an overlay project.
- The CAS server must be configured so it can act as an [OpenID Connect Provider](https://apereo.github.io/cas/6.6.x/installation/OIDC-Authentication.html)
- CAS version 6.3.x and higher is known to work with Strapi but older versions that support OIDC may work.
- Define a CAS OIDC service for Strapi and store it in whichever CAS service registry is being used.
- The CAS service definition might look something like this for a local strapi deployment:

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "thestrapiclientid",
  "clientSecret": "thestrapiclientsecret",
  "bypassApprovalPrompt": true,
  "serviceId": "^http(|s)://localhost:1337/.*",
  "name": "Local Strapi",
  "id": 20201103,
  "evaluationOrder": 50,
  "attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes": {
      "@class": "java.util.TreeMap",
      "strapiemail": "groovy { return attributes['mail'].get(0) }",
      "strapiusername": "groovy { return attributes['username'].get(0) }"
    }
  }
}
```

## Strapi configuration

1. Visit the User & Permissions provider settings page at [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
2. Click on the **CAS** provider
3. Fill the information:
   - **Enable**: `ON`
   - **Client ID**: thestrapiclientid
   - **Client Secret**: thestrapiclientsecret
   - **The redirect URL to your front-end app**: `http://localhost:1337/api/connect/cas/redirect`
   - **The Provider Subdomain such that the following URLs are correct for the CAS deployment you are targeting:**
   ```
     authorize_url: https://[subdomain]/oidc/authorize
     access_url: https://[subdomain]/oidc/token
     profile_url: https://[subdomain]/oidc/profile
   ```
   For example, if running CAS locally with a login URL of: `https://localhost:8443/cas/login`, the value for the provider subdomain would be `localhost:8443/cas`.

<ConfigDone />
