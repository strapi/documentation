---
title: Code migration - Dependencies - Strapi Developer Docs
description: Migrate your dependencies from Strapi v3.6.8 to v4.0.x with step-by-step instructions
canonicalUrl:  Used by Google to index page, should start with https://docs.strapi.io/ — delete this comment when done [paste final URL here]
---

<!-- TODO: update SEO -->

# v4 code migration: Updating dependencies

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

:::strapi v3/v4 comparison
In Strapi v3, Strapi package names were prefixed with `strapi-`.

Strapi v4 uses scoped packages.
:::

To migrate dependencies to Strapi v4, update all references to Strapi packages using the new names found in the following table, and make sure the version number in `package.json` is up-to-date.

Packages with a ✨ emoji before their name have a new name in Strapi v4.

Some packages, identified with the ❌  emoji, have been removed from Strapi v4 and all references to these packages should be removed from the code.

| Package name in Strapi v3          | Package name in Strapi v4             |
| ---------------------------------- | ------------------------------------- |
| strapi                             | ✨ @strapi/strapi                      |
| strapi-database                    | ✨ @strapi/database                    |
| strapi-admin                       | ✨ @strapi/admin                       |
| strapi-utils                       | ✨ @strapi/utils                       |
| strapi-helper-plugin               | ✨ @strapi/helper-plugin               |
| strapi-plugin-users-permissions    | ✨ @strapi/plugin-users-permissions    |
| strapi-plugin-i18n                 | ✨ @strapi/plugin-i18n                 |
| strapi-plugin-upload               | ✨ @strapi/plugin-upload               |
| strapi-plugin-documentation        | ✨ @strapi/plugin-documentation        |
| strapi-plugin-graphql              | ✨ @strapi/plugin-graphql              |
| strapi-plugin-email                | ✨ @strapi/plugin-email                |
| strapi-plugin-sentry               | ✨ @strapi/plugin-sentry               |
| strapi-plugin-content-type-builder | ✨ @strapi/plugin-content-type-builder |
| strapi-plugin-content-manager      | ✨ @strapi/plugin-content-manager      |
| strapi-provider-upload-rackspace   | ✨ @strapi/provider-upload-rackspace   |
| strapi-provider-email-nodemailer   | ✨ @strapi/provider-email-nodemailer   |
| strapi-provider-upload-local       | ✨ @strapi/provider-upload-local       |
| strapi-provider-email-mailgun      | ✨ @strapi/provider-email-mailgun      |
| strapi-provider-upload-cloudinary  | ✨ @strapi/provider-upload-cloudinary  |
| strapi-provider-email-sendmail     | ✨ @strapi/provider-email-sendmail     |
| strapi-provider-email-amazon-ses   | ✨ @strapi/provider-email-amazon-ses   |
| strapi-provider-upload-aws-s3      | ✨ @strapi/provider-upload-aws-s3      |
| strapi-provider-email-sendgrid     | ✨ @strapi/provider-email-sendgrid     |
| create-strapi-starter              | create-strapi-starter                 |
| create-strapi-app                  | create-strapi-app                     |
| strapi-generate-policy             | strapi-generate-policy                |
| strapi-generate-controller         | strapi-generate-model                 |
| strapi-generate-model              | strapi-generate-controller            |
| strapi-generate-new                | strapi-generate-new                   |
| strapi-generate                    | strapi-generate                       |
| strapi-generate-api                | strapi-generate-api                   |
| strapi-generate-plugin             | strapi-generate-plugin                |
| strapi-generate-service            | strapi-generate-service               |
| strapi-connector-mongoose          | ❌ (removed from v4)                   |
| strapi-connector-bookshelf         | ❌ (removed from v4)                   |
| strapi-hook-redis                  | ❌ (removed from v4)                   |
| strapi-hook-ejs                    | ❌ (removed from v4)                   |
| strapi-middleware-views            | ❌ (removed from v4)                   |

Example:

If the `package.json` file of a Strapi v3 application has the `“strapi-plugin-upload”: “3.6.8”` dependency declaration, and the migration targets Strapi v4.0.7, the dependency declaration should be replaced with `“@strapi/plugin-upload”: “4.0.7”`.

<!-- TODO: add a conclusion or links for other steps -->
