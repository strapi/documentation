---
title: Some Mailgun provider legacy variables are not supported
description: In Strapi 5, some variables have been renamed for the Mailgun provider options, dropping support for some legacy variables that were deprecated in Strapi v4.
sidebar_label: Mailgun provider options
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - providers
 - email
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Some Mailgun provider legacy variables are not supported

In Strapi 5, the support is dropped for some legacy variables deprecated in Strapi v4 for the Mailgun provider.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Mailgun provider options can use the legacy `apiKey` and `host` variables.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Mailgun provider options can not use the legacy `apiKey` and `host` variables and must use the `key` and `url` variables instead.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

A Mailgun provider configuration in the [plugins configuration file](/cms/providers#configuring-providers) could look like the following example in Strapi 5:

```jsx title="/config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'), // Required
        domain: env('MAILGUN_DOMAIN'), // Required
        url: env('MAILGUN_URL', 'https://api.mailgun.net'), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```

### Manual procedure

If you were using the legacy parameters:

1. Rename `apiKey` to `key`.
2. Rename `host` to `url` and add `https://` in front of it so it is a proper URL.
