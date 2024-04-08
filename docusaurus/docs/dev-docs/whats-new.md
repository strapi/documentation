---
tags:
- Strapi 5
- Draft & Publish
- documents
- Document Service API
- REST API
- GraphQL API 
- upgrade tool
- breaking changes
---
# What's new in Strapi 5 docs beta?

Strapi 5 beta brings many new features and improvements, and this page quickly highlights the most important documentation changes.

🧑‍🎨 The [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature has been fully reworked. When Draft & Publish is enabled, the Content Manager edit view shows 2 different tabs, one for the draft version and one for the published version, and both can handle different content.

🧑‍🏫 Strapi 5 now use [documents](/dev-docs/api/document) and introduces a new [Document Service API](/dev-docs/api/document-service) to replace the Entity Service API from v4, leveraging the new Draft & Publish system and paving the way for more upcoming features.

🕵️ The [REST API](/dev-docs/api/rest) and [GraphQL API](/dev-docs/api/graphql) have been updated, with a simplified response data format for both and partial support for Relay-style queries for GraphQL.

🦾 A whole new CLI [upgrade tool](/dev-docs/upgrade-tool) will soon help you migrate to any patch, minor, and major version of Strapi, automating most of the common tasks through codemods.

👷 Also, we have a list of [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) and actions to take for when you will consider migrating to Strapi 5 (_but please don't migrate your production project while Strapi 5 and docs are in beta!_ 🙏).

👀 There might be much more: new or updated pages are identified in the table of contents with <ThemedImage alt="new badge" sources={{light:'/img/assets/new-badge.png', dark:'/img/assets/new-badge_DARK.png'}} /> or <ThemedImage alt="updated badge" sources={{light:'/img/assets/updated-badge.png', dark:'/img/assets/updated-badge_DARK.png'}} /> badges.

➕ You will also soon find more official guides and more references to external resources (contributor documentation, design system documentation, and blog articles) throughout the docs pages.

🤖 Also, last but not least, you might have noticed a shiny new **Ask AI** button at the bottom of the page! Click on it and ask your questions. It keeps the context of previous answers so you can ask follow-up questions as long as you don't close the popup.
