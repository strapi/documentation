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
# What's new in Strapi 5 docs?

Strapi 5 brings many new features and improvements, and this page quickly highlights the most important documentation changes.

🧑‍🎨 The **[Draft & Publish](/user-docs/content-manager/saving-and-publishing-content)** feature has been fully reworked. When Draft & Publish is enabled, the Content Manager edit view shows 2 different tabs, one for the draft version and one for the published version, and both can handle different content.

🧙‍♀️ The new **[Content History](/user-docs/content-manager/working-with-content-history)** feature allows you to view and restore previous versions of your content from the Content Manager.

🧑‍🏫 Strapi 5 now use **[documents](/dev-docs/api/document)** and introduces a new **[Document Service API](/dev-docs/api/document-service)** to replace the Entity Service API from v4, leveraging the new Draft & Publish system and paving the way for more upcoming features.

🕵️ The **[REST API](/dev-docs/api/rest)** and **[GraphQL API](/dev-docs/api/graphql)** have been updated, with a simplified response data format for both and partial support for Relay-style queries for GraphQL.

👩‍🚀 The **[Plugin SDK](/dev-docs/plugins/development/plugin-sdk)** is a new CLI tool that helps you develop and publish Strapi plugins.

🦾 Another whole new CLI **[upgrade tool](/dev-docs/upgrade-tool)** will help you migrate to any patch, minor, and major version of Strapi, automating most of the common tasks through codemods.

👷 Also, we have some resources ready to help you **[upgrade to Strapi 5](/dev-docs/migration/v4-to-v5/introduction-and-faq)**, including a [step-by-step guide](/dev-docs/migration/v4-to-v5/step-by-step), a list of [breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) and [specific resources](/dev-docs/migration/v4-to-v5/additional-resources/introduction) to read for when you will consider upgrading to Strapi 5.

👀 There are much more content updates: new or updated pages are identified in the table of contents with <ThemedImage alt="new badge" sources={{light:'/img/assets/new-badge.png', dark:'/img/assets/new-badge_DARK.png'}} /> or <ThemedImage alt="updated badge" sources={{light:'/img/assets/updated-badge.png', dark:'/img/assets/updated-badge_DARK.png'}} /> badges.

🏷️ We introduced a new **tagging system** to provide another layer of information architecture. Tags can be found at the bottom of each page. Clicking on a tag will point you to an index page listing all pages with the same tag. The list of all available tags is visible by visiting the [/tags](/tags) page.

➕ You will also soon find more **official guides** and more references to **external resources** (contributor documentation, design system documentation, and blog articles) throughout the docs pages.

🤖 Also, last but not least, you might have noticed that the search bar in the top navigation bar now combines 2 buttons: the left button, **🔎 Search**, triggers a regular search, while the right part is our new AI-based chatbot! Click **Ask AI** to ask your questions. The chatbot keeps the context of previous answers, so you can ask follow-up questions as long as you don't close the chatbot window.
