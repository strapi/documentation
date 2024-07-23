---
tags:
- Draft & Publish
- documents
- Document Service API
- REST API
- GraphQL API 
- upgrade tool
- content history
- breaking changes
---
# What's new in Strapi 5 RC docs?

Strapi 5 RC (Release Candidate) brings many new features and improvements, and this page quickly highlights the most important documentation changes.

🧑‍🎨 The [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature has been fully reworked. When Draft & Publish is enabled, the Content Manager edit view shows 2 different tabs, one for the draft version and one for the published version, and both can handle different content.

🧙‍♀️ The new [Content History](/user-docs/content-manager/working-with-content-history) feature allows you to view and restore previous versions of your content from the Content Manager.

🧑‍🏫 Strapi 5 now use [documents](/dev-docs/api/document) and introduces a new [Document Service API](/dev-docs/api/document-service) to replace the Entity Service API from v4, leveraging the new Draft & Publish system and paving the way for more upcoming features.

🕵️ The [REST API](/dev-docs/api/rest) and [GraphQL API](/dev-docs/api/graphql) have been updated, with a simplified response data format for both and partial support for Relay-style queries for GraphQL.

🦾 A whole new CLI [upgrade tool](/dev-docs/upgrade-tool) will soon help you migrate to any patch, minor, and major version of Strapi, automating most of the common tasks through codemods.

👷 Also, we have some resources ready to help you [upgrade to Strapi 5](/dev-docs/migration/v4-to-v5/introduction-and-faq), including a list of [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) and [additional migration resources](/dev-docs/migration/v4-to-v5/additional-resources/introduction) to read for when you will consider migrating to Strapi 5. _But please don't migrate your *production* project before Strapi 5 is released as a stable version!_ 🙏. 

👀 There might be much more: new or updated pages are identified in the table of contents with <ThemedImage alt="new badge" sources={{light:'/img/assets/new-badge.png', dark:'/img/assets/new-badge_DARK.png'}} /> or <ThemedImage alt="updated badge" sources={{light:'/img/assets/updated-badge.png', dark:'/img/assets/updated-badge_DARK.png'}} /> badges.

🏷️ We introduced a new **tagging system** to provide another layer of information architecture. Tags can be found at the bottom of each page. Clicking on a tag will point you to an index page listing all pages with the same tag. The list of all available tags is visible by visiting the [/tags](/tags) page.

➕ You will also soon find more official guides and more references to external resources (contributor documentation, design system documentation, and blog articles) throughout the docs pages.

🤖 Also, last but not least, you might have noticed a shiny new **🔎 Ask AI & Search Docs** button in the top navigation bar! Click on it and select "Ask AI" to ask your questions. It keeps the context of previous answers so you can ask follow-up questions as long as you don't close the popup. You could also click "Search" to do a regular search through the documentation.
