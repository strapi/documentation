---
title: Bring your own AI key plugin
displayed_sidebar: cmsSidebar
description: Power Strapi AI with your own AI provider, API key, and models.
tags:
- plugins
- Enterprise feature
- AI
- Bring your own AI key
---

# Bring your own AI key plugin
<EnterpriseBadge tooltip="This plugin is available with an Enterprise plan."/> <VersionBadge version="5.57.0" />

<Tldr>
The Bring your own AI key (BYOK) plugin powers Strapi AI with your own AI provider, for AI Translations and AI-powered metadata generation.
</Tldr>

With the Bring your own AI key plugin, Strapi AI sends the requests of AI Translations and AI-powered metadata generation in the Media Library to the provider of your choice. You set the API key and pick the model for each feature. The [Content-Type Builder AI assistant](/cms/features/content-type-builder#strapi-ai) is not included: it is only available with Strapi-managed AI.

<IdentityCard isPlugin>
  <IdentityCardItem icon="navigation-arrow" title="Location">Configured in `/config/plugins`. Used through the Strapi AI features of the admin panel.</IdentityCardItem>
  <IdentityCardItem icon="package" title="Package name">`@strapi-enterprise/plugin-byok`</IdentityCardItem>
  <IdentityCardItem icon="plus-square" title="Additional resources">[Installing Enterprise plugins](/cms/plugins/installing-enterprise-plugins)</IdentityCardItem>
</IdentityCard>

:::prerequisites
- A license for the CMS Enterprise plan.
- Strapi 5.57.0 or later.
- An API key for a provider with an OpenAI-compatible API.
- For AI Translations, the [Internationalization](/cms/features/internationalization) feature.
:::

## Installation

The plugin installs from the Strapi package registry. The `strapi enterprise install` command does the setup for you, or you can do it manually.

### With the command

From the root folder of your Strapi application, run:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi enterprise install plugin-byok
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm run strapi enterprise install plugin-byok
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm strapi enterprise install plugin-byok
```

</TabItem>
</Tabs>

The command finds your license, sets up access to the registry, and installs a version that supports the Strapi version of your application. See [Installing Enterprise plugins](/cms/plugins/installing-enterprise-plugins) for details.

### Manually

1. Set up access to the registry, as described in [Setting up access manually](/cms/plugins/installing-enterprise-plugins#setting-up-access-manually).
2. From the root folder of your Strapi application, install the package, saving the exact version:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn add --exact @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  <TabItem value="npm" label="NPM">

  ```bash
  npm install --save-exact @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

  ```bash
  pnpm add --save-exact @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  </Tabs>

:::caution
Once installed, the plugin is enabled, and Strapi does not start until the plugin is configured. See [Configuration](#configuration).
:::

## Configuration

The plugin is configured in the plugins configuration file, with environment variables for the provider connection and the models.

1. Add the plugin to the plugins configuration file:

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript">

  ```js title="/config/plugins.js"
  module.exports = ({ env }) => ({
    // …
    byok: {
      enabled: env.bool('STRAPI_BYOK_ENABLED', false),
      config: {
        connection: {
          baseURL: env('STRAPI_BYOK_PROVIDER_BASE_URL'),
          apiKey: env('STRAPI_BYOK_PROVIDER_API_KEY'),
        },
        models: {
          translations: env('STRAPI_BYOK_TRANSLATIONS_MODEL'),
          mediaMetadata: env('STRAPI_BYOK_MEDIA_METADATA_MODEL'),
        },
      },
    },
  });
  ```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

  ```ts title="/config/plugins.ts"
  export default ({ env }) => ({
    // …
    byok: {
      enabled: env.bool('STRAPI_BYOK_ENABLED', false),
      config: {
        connection: {
          baseURL: env('STRAPI_BYOK_PROVIDER_BASE_URL'),
          apiKey: env('STRAPI_BYOK_PROVIDER_API_KEY'),
        },
        models: {
          translations: env('STRAPI_BYOK_TRANSLATIONS_MODEL'),
          mediaMetadata: env('STRAPI_BYOK_MEDIA_METADATA_MODEL'),
        },
      },
    },
  });
  ```

  </TabItem>
  </Tabs>

2. Set the environment variables in the `.env` file. See [Configuration options](#configuration-options) for the expected value of each one:

  ```bash title="/.env"
  STRAPI_BYOK_ENABLED=true
  STRAPI_BYOK_PROVIDER_BASE_URL=
  STRAPI_BYOK_PROVIDER_API_KEY=
  STRAPI_BYOK_TRANSLATIONS_MODEL=
  STRAPI_BYOK_MEDIA_METADATA_MODEL=
  ```

3. Restart Strapi.

### Configuration options

If a required option is missing while the plugin is enabled, Strapi does not start and logs the first missing option.

| Option | Type | Required | Description |
|---|---|---|---|
| `enabled` | Boolean | No | Turns the plugin on or off without uninstalling it. With the configuration above, the plugin stays off unless `STRAPI_BYOK_ENABLED` is `true`. |
| `connection.baseURL` | String | Yes | Root URL of your provider's OpenAI-compatible API, with its version prefix. For instance, `https://api.openai.com/v1` for OpenAI, or `https://api.anthropic.com/v1` for Anthropic. |
| `connection.apiKey` | String | Yes | API key for your provider. Keep it in the server environment only. |
| `models.translations` | String | Yes | Model used for AI Translations, for instance `gpt-4.1-mini` (OpenAI) or `claude-haiku-4-5` (Anthropic). |
| `models.mediaMetadata` | String | Yes | Model used to generate alternative text and captions in the Media Library. The model must accept image input, for instance `gpt-4.1` (OpenAI) or `claude-sonnet-5-5` (Anthropic). |

:::tip
Use `STRAPI_BYOK_ENABLED` to keep the plugin off in an environment without an API key, such as a staging environment.
:::

## Usage

Once the plugin is configured, each AI feature works as described in its own documentation, including how to turn it on. Its requests go to your provider:

- [AI Translations](/cms/features/internationalization#enabling-ai-powered-internationalization) (AI-powered internationalization)
- [AI-powered metadata generation](/cms/features/media-library#ai-powered-metadata-generation), including [generating metadata in bulk](/cms/features/media-library#bulk-metadata)

To turn off all Strapi AI features, including the ones the plugin powers, set [`ai.enabled`](/cms/configurations/admin-panel#strapi-ai) to `false`.

### Checking that the plugin is active

When Strapi starts, the server logs list the features that use your provider, for instance:

```
BYOK is ready for AI Translation, AI Media Library. Requests go to your configured provider.
```

## Troubleshooting

| Symptom | What to do |
|---|---|
| Strapi does not start and logs an option that `is required` | Set that option. See [Configuration options](#configuration-options). |
| A warning says your Strapi license does not include the feature | Check your license. Until it includes the feature, Strapi AI features stay off. |
| A warning says the i18n plugin is not installed | AI Translations stays off until the [Internationalization](/cms/features/internationalization) feature is enabled. The Media Library feature still uses your provider. |
| No `BYOK is ready` line in the logs at startup | Check that `STRAPI_BYOK_ENABLED` is `true` and that [`ai.enabled`](/cms/configurations/admin-panel#strapi-ai) is not `false`. |
| `The AI provider rejected the request (HTTP 401)` or `(HTTP 403)` | Check `connection.apiKey`. |
| `The AI provider rejected the request (HTTP 404)` | Check that `connection.baseURL` includes the API version path, such as `/v1`, and that your provider offers the model you set. |

## Uninstallation

1. Stop Strapi.
2. Remove the `byok` entry from the plugins configuration file.
3. Remove the package:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn remove @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  <TabItem value="npm" label="NPM">

  ```bash
  npm uninstall @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

  ```bash
  pnpm remove @strapi-enterprise/plugin-byok
  ```

  </TabItem>
  </Tabs>

4. Remove the `STRAPI_BYOK_ENABLED`, `STRAPI_BYOK_PROVIDER_BASE_URL`, `STRAPI_BYOK_PROVIDER_API_KEY`, `STRAPI_BYOK_TRANSLATIONS_MODEL` and `STRAPI_BYOK_MEDIA_METADATA_MODEL` variables from the `.env` file.
5. Start Strapi again.
