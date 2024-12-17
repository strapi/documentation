---
title: CAS provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# CAS provider for Users & Permissions

<h4 id="cas">Using ngrok</h4>

A remote CAS server can be configured to accept `localhost` URLs or you can run your own CAS server locally that accepts them.

The use of `ngrok` is not needed.

<h4 id="cas-config">CAS configuration</h4>

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

<h4 id="cas-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Cas** provider
- Fill the information:
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
