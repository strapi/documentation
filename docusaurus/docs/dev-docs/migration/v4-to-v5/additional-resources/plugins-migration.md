---
title: Plugins upgrade summary
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
  - plugins
  - plugins development
  - upgrade to Strapi 5
---

# Plugins upgrade summary

The present page is intended to be used as a short summary of everything to consider if you are a plugin developer upgrading your plugin from Strapi v4 to Strapi 5. The page quickly describes the changes affecting plugins and links to additional resources where necessary.

:::strapi Plugin SDK
Starting with Strapi 5, the platform includes a [Plugin SDK](/dev-docs/plugins/development/plugin-sdk) to help develop and build Strapi plugins. While you are free to use other methods for plugin development, we strongly recommend using the Plugin SDK. As part of the migration process from v4 to Strapi 5, we encourage you to update your plugin to take advantage of the Plugin SDK.
:::

## Recommended steps to migrate a plugin
:::prerequisites
Your Strapi application is already running on the latest v5 minor and patch version. If it's not, follow the [step-by-step guide](/dev-docs/migration/v4-to-v5/step-by-step) to upgrade to Strapi 5.
:::

Upgrading a Strapi v4 plugin to Strapi 5 consists in:

1. Creating a new empty plugin using the [Plugin SDK](/dev-docs/plugins/development/create-a-plugin).
2. Move your Strapi v4 code to the newly created files in the Strapi 5 [plugin structure](/dev-docs/plugins/development/plugin-structure), also considering the changes summarized in this page.

:::tip Tip: Partly automate the migration
Some parts of the plugin migration can be automated by the CLI upgrade tool through its **codemods** <Codemods/>. You can run `npx @strapi/upgrade codemods ls` to list available codemods and `npx @strapi/upgrade codemods run` to run a specific codemod. See the [list of codemods](/dev-docs/migration/v4-to-v5/step-by-step#step-2-run-automated-migrations) and the [reference documentation for the upgrade tool](/dev-docs/upgrade-tool#run-codemods-only) for more details.
:::

Alternatively, you can manually update your Strapi v4 plugin to use the Plugin SDK.
The manual steps include:
1. If your code uses a format other than CommonJS, update the `package.json` file and specify the appropriate exports property.
2. Reorganize your Strapi v4 code to align with the Strapi 5 [plugin structure](/dev-docs/plugins/development/plugin-structure)

### Back-end changes

- The Entity Service API from Strapi v4 is deprecated and Strapi 5 uses the [Document Service API](/dev-docs/api/document-service) instead. A [migration guide](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) is available to help you transition to the Document Service API.
- General Strapi v4 to Strapi 5 [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) might apply.
- You can use the new [Plugin SDK](/dev-docs/plugins/development/create-a-plugin) to generate plugins and publish them on NPM and/or submit them to the Marketplace.

### Front-end changes

- The Design System is upgraded to v2 in Strapi 5:
  - <Icon name="arrow-fat-right" /> A dedicated migration guide is [available in the Design System documentation](https://design-system-git-main-strapijs.vercel.app/?path=/docs/getting-started-migration-guides-v1-to-v2--docs).
  - There are no big visual changes, except for [icons](https://design-system-git-main-strapijs.vercel.app/?path=/docs/foundations-icons-overview--docs).
  - General Strapi v4 to Strapi 5 [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) might apply.
- The `helper-plugin` has been removed. A [migration reference](/dev-docs/migration/v4-to-v5/additional-resources/helper-plugin) is available to help you transition away from the `helper-plugin`.
- Strapi does not alias dependencies any longer. The 4 dependencies that are expected to be used by all client facing code are declared at the project level (`react`, `react-dom`, `styled-components`, and `react-router-dom`). If you do not declare the dependencies that you use (e.g. `axios`), there is a likelihood users could face unforeseen issues with your plugin.
- If you're using the [Plugin SDK](/dev-docs/plugins/development/create-a-plugin), you will need to transition your front-end files to `.jsx` or `.tsx` format.

## Custom providers

Custom [providers](/dev-docs/providers) for the Email and Upload plugins need conversion only if they were using the Entity Service API (please refer to the [Entity Service API to Document Service API migration guide](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service)).
