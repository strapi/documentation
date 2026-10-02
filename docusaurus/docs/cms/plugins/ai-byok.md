---
title: Bring Your Own Key plugin
displayed_sidebar: cmsSidebar
description: Run Strapi AI features with your own AI provider, API key, and models.
tags:
- plugins
- Enterprise feature
- AI
- Bring Your Own Key
---

# Bring Your Own Key plugin
<EnterpriseBadge />

<Tldr>
The Bring Your Own Key (BYOK) plugin runs Strapi AI features: AI Translations and AI-powered metadata generation in the Media Library, with your own AI provider.
</Tldr>

With the Bring Your Own Key plugin, Strapi AI features send their requests to the provider of your choice. You set the API key and pick the model for each feature.

<IdentityCard isPlugin>
  <IdentityCardItem icon="navigation-arrow" title="Location">Configured in `/config/plugins`. Used through the Strapi AI features of the admin panel.</IdentityCardItem>
  <IdentityCardItem icon="package" title="Package name">`@strapi-enterprise/plugin-ai-byok`</IdentityCardItem>
  <IdentityCardItem icon="plus-square" title="Additional resources">[Installing Enterprise plugins](/cms/plugins/installing-enterprise-plugins)</IdentityCardItem>
</IdentityCard>

:::prerequisites
- A license for the CMS Enterprise plan.
- Strapi 5.57.0 or later.
- An API key for a provider with an OpenAI-compatible API.
- For AI Translations, the [Internationalization](/cms/features/internationalization) feature.
:::

## Installation

Install the plugin with the `strapi enterprise install` command, from the root folder of your Strapi application:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi enterprise install plugin-ai-byok
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm run strapi enterprise install plugin-ai-byok
```

</TabItem>
</Tabs>

See [Installing Enterprise plugins](/cms/plugins/installing-enterprise-plugins) for license and registry details.

:::caution
Once installed, the plugin is enabled, and Strapi does not start until the plugin is configured. With the configuration below, the plugin then stays off until `STRAPI_AI_BYOK_ENABLED` is `true`.
:::

## Configuration

The plugin is configured in the plugins configuration file, with environment variables for the provider connection and the models.

1. Add the plugin to the plugins configuration file:

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript">

  ```js title="/config/plugins.js"
  module.exports = ({ env }) => ({
    // …
    'ai-byok': {
      enabled: env.bool('STRAPI_AI_BYOK_ENABLED', false),
      config: {
        connection: {
          apiKey: env('STRAPI_AI_PROVIDER_API_KEY'),
          baseURL: env('STRAPI_AI_PROVIDER_BASE_URL'),
        },
        models: {
          translations: env('STRAPI_AI_TRANSLATIONS_MODEL'),
          mediaMetadata: env('STRAPI_AI_MEDIA_METADATA_MODEL'),
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
    'ai-byok': {
      enabled: env.bool('STRAPI_AI_BYOK_ENABLED', false),
      config: {
        connection: {
          apiKey: env('STRAPI_AI_PROVIDER_API_KEY'),
          baseURL: env('STRAPI_AI_PROVIDER_BASE_URL'),
        },
        models: {
          translations: env('STRAPI_AI_TRANSLATIONS_MODEL'),
          mediaMetadata: env('STRAPI_AI_MEDIA_METADATA_MODEL'),
        },
      },
    },
  });
  ```

  </TabItem>
  </Tabs>

2. Set the environment variables in the `.env` file. See [Configuration options](#configuration-options) for the expected value of each one:

  ```bash title="/.env"
  STRAPI_AI_BYOK_ENABLED=true
  STRAPI_AI_PROVIDER_BASE_URL=
  STRAPI_AI_PROVIDER_API_KEY=
  STRAPI_AI_TRANSLATIONS_MODEL=
  STRAPI_AI_MEDIA_METADATA_MODEL=
  ```

3. Restart Strapi.

### Configuration options

All `connection` and `models` options are required when the plugin is enabled. If one is missing, Strapi does not start and logs the first missing option.

| Option | Environment variable | Description |
|---|---|---|
| `enabled` | `STRAPI_AI_BYOK_ENABLED` | Turns the plugin on or off without uninstalling it. With the configuration above, the plugin stays off unless `STRAPI_AI_BYOK_ENABLED` is `true`. |
| `connection.baseURL` | `STRAPI_AI_PROVIDER_BASE_URL` | Root URL of your provider's OpenAI-compatible API, with its version prefix. For instance, `https://api.openai.com/v1` for OpenAI, or `https://api.anthropic.com/v1` for Anthropic. |
| `connection.apiKey` | `STRAPI_AI_PROVIDER_API_KEY` | API key for your provider. Keep it in the server environment only. |
| `models.translations` | `STRAPI_AI_TRANSLATIONS_MODEL` | Model used for AI Translations, for instance `gpt-4.1-mini` (OpenAI) or `claude-haiku-4-5` (Anthropic). |
| `models.mediaMetadata` | `STRAPI_AI_MEDIA_METADATA_MODEL` | Model used to generate alternative text and captions in the Media Library. The model must accept image input, for instance `gpt-4.1` (OpenAI) or `claude-sonnet-5-5` (Anthropic). |

:::tip
Use `STRAPI_AI_BYOK_ENABLED` to keep the plugin off in an environment without an API key, such as a staging environment.
:::

## Usage

Once the plugin is configured, each AI feature works as described in its own documentation, including how to turn it on, but sends its requests to your provider:

- [AI Translations](/cms/features/internationalization#enabling-ai-powered-internationalization)
- [AI-powered metadata generation](/cms/features/media-library#ai-powered-metadata-generation), including [generating metadata in bulk](/cms/features/media-library#bulk-metadata)

Requests don't use Strapi AI credits. The [Content-Type Builder AI assistant](/cms/features/content-type-builder#strapi-ai) is not available with the plugin. Setting [`ai.enabled`](/cms/configurations/admin-panel#strapi-ai) to `false` also turns off the plugin's features.

### Checking that the plugin is active

When Strapi starts, the server logs list the features that use your provider, for instance:

```
AI BYOK is ready for AI Translation, AI Media Library. Requests go to your configured provider.
```

## Troubleshooting

| Symptom | What to do |
|---|---|
| Strapi does not start and logs an option that `is required` | Set that option. See [Configuration options](#configuration-options). |
| A warning says your Strapi license does not include the feature | Check your license. Until it includes the feature, AI requests fail: they do not fall back to Strapi AI. |
| A warning says the i18n plugin is not installed | AI Translations stays off. The Media Library feature still uses your provider. |
| `The AI provider rejected the request (HTTP 401)` or `(HTTP 403)` | Check `connection.apiKey`. |
| `The AI provider rejected the request (HTTP 404)` | Check that `connection.baseURL` includes the API version path, such as `/v1`, and that your provider offers the model you set. |

## Uninstallation

1. Stop Strapi.
2. Remove the `'ai-byok'` entry from the plugins configuration file.
3. Remove the package:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn remove @strapi-enterprise/plugin-ai-byok
  ```

  </TabItem>
  <TabItem value="npm" label="NPM">

  ```bash
  npm uninstall @strapi-enterprise/plugin-ai-byok
  ```

  </TabItem>
  </Tabs>

4. Remove the `STRAPI_AI_*` variables from the `.env` file.
5. Start Strapi again.
