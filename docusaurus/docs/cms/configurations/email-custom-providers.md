---
title: Creating custom email providers
displayed_sidebar: cmsSidebar
description: Implement, publish, or use locally a custom email provider for Strapi's Email feature.
tags:
- email
- providers
- features
---

# Creating custom email providers

<Tldr>
Build a custom email provider by exporting a Node.js module with a `send()` function. Use it locally in your project or publish it to npm to share with the community.
</Tldr>

Strapi's [Email feature](/cms/features/email) delegates sending to a provider, a Node.js module that implements a standard interface. When no official or community provider meets your needs, you can create your own.

## Provider interface

To implement a custom provider you must <ExternalLink to="https://docs.npmjs.com/creating-node-js-modules" text="create a Node.js module"/>. The module must export an `init` function that returns a `send` function:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts
export default {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

</Tabs>

Inside the `send` function you have access to:

- `providerOptions` — the values passed under `providerOptions` in `/config/plugins.js|ts`.
- `settings` — the values passed under `settings` in `/config/plugins.js|ts`.
- `options` — the options passed when calling `send()` from a controller or service.

You can review the <ExternalLink to="https://github.com/strapi/strapi/tree/main/packages/providers" text="Strapi-maintained providers"/> for reference implementations.

## Publishing and using your provider

After creating your provider you can either publish it to npm or use it locally within your project.

### Publishing to npm

<ExternalLink to="https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages" text="Publish your provider to npm"/> to make it available to the Strapi community. Once published, install and configure it like any other provider (see [Configuring providers](/cms/features/email#configuring-providers)).

### Using a local provider

To use a custom provider without publishing it to npm:

1. Create a `providers` folder at the root of your Strapi application.
2. Create your provider inside it (e.g., `providers/strapi-provider-email-custom`).
3. Update `package.json` to point the dependency to the local path:

```json
{
  "dependencies": {
    "strapi-provider-email-custom": "file:providers/strapi-provider-email-custom"
  }
}
```

4. Update `/config/plugins.js|ts` to [configure the provider](/cms/features/email#configuring-providers).
5. Run `yarn` or `npm install` to link the local package.

## Private providers

A provider can be marked as **private**, meaning every asset URL will be signed for secure access rather than exposed as a plain URL.

To enable this, implement the `isPrivate()` method and return `true` in your provider module.

When a provider is private, Strapi uses a `getSignedUrl(file)` method — also implemented in the provider — to generate a signed URL for each asset. The signed URL contains an encrypted signature that grants access for a limited time and with specific restrictions, depending on your implementation.

:::note
For security reasons, the Content API does not return signed URLs. Developers consuming the API must sign URLs themselves using the provider's signing logic.
:::