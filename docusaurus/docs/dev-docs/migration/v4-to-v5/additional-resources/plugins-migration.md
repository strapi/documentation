---
title: Plugins upgrade summary
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
  - plugins
  - plugins development
  - upgrade to Strapi 5
---

# Plugins upgrade summary

:::callout 🚧  Work in progress
This page is a work-in-progress and some links are currently missing.
:::

The present page is intended to be used as a short summary of everything to consider if you are a plugin developer intending to upgrade your plugin from Strapi v4 to Strapi 5. The page quickly describes the changes affecting plugins and links to additional resources where necessary.

## Back-end changes

- The Entity Service API from Strapi v4 is deprecated and Strapi 5 uses the [Document Service API](/dev-docs/api/document-service) instead. A [migration guide](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) is available to help you transition to the Document Service API.
- General Strapi v4 to Strapi 5 [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) might apply.
- You can use the new [Plugin SDK](/dev-docs/plugins/development/create-a-plugin) to generate plugins and publish them on NPM and/or submit them to the Marketplace.

## Front-end changes

- The Design System is upgraded to v2 in Strapi 5:
  <!-- TODO: add link to icons in Design System v2 -->
  - There are no big visual changes, except for [icons](#).<br/>(_the link will be added in the upcoming weeks_)
  <!-- TODO: add link to migration guide -->
  - A migration guide will be [available](#).<br/>(_the link will be added in the upcoming weeks_)
  <!-- TODO: add link to breaking changes -->
  - A list of breaking changes specific to the Design System will be available in the [Design System documentation](#).<br/>(_the link will be added in the upcoming weeks_)
  - General Strapi v4 to Strapi 5 [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) might apply.
- The `helper-plugin` is deprecated. A [migration reference](/dev-docs/migration/v4-to-v5/additional-resources/helper-plugin) is available to help you transition away from the `helper-plugin`.
- Strapi does not alias dependencies any longer. The 4 dependencies that are expected to be used by all client facing code are declared at the project level (react/react-dom/styled-components & react-router-dom). If you do not declare your dependencies that you use e.g. `axios` there's a likelihood users could face unforeseen issues with your plugin.

<!-- TODO: clarify these 👇-->
<!-- ## General changes

- Building and packaging?
  - They don’t have to do it (not tested)
  - Recommended as a best practices (from npm)
- Pack up?
  - Not required
  - Is pack up specific to our packages or is it universal
      - More for libraries
  - Does the plugin need to be a TS one to use pack up (honestly no idea what pack up does)
- peerDepend requirement?
  - Yes probably (ask emilie)
  - As a peerDepend -->

## Custom providers

Custom [providers](/dev-docs/providers) for the Email and Upload plugins need conversion only if they were using the Entity Service API (please refer to the [Entity Service API to Document Service API migration guide](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service)).
