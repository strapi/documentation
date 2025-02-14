---
custom_edit_url: null
---

<br/>

# What's new in Strapi docs?

Strapi 5 brings many new features and improvements, and this page quickly highlights the most important documentation changes.

<Icon name="newspaper" /> The **[Draft & Publish](/cms/features/draft-and-publish)** feature has been fully reworked. When Draft & Publish is enabled, the Content Manager edit view shows 2 different tabs, one for the draft version and one for the published version, and both can handle different content.

<Icon name="magic-wand"/> The new **[Content History](/cms/features/content-history)** feature allows you to view and restore previous versions of your content from the Content Manager.

<Icon name="eye" /> The new **[Preview](/cms/features/preview)** feature allows you to preview your content in your front end application directly from Strapi's admin panel.

<Icon name="file"/> Strapi 5 now use **[documents](/cms/api/document)** and introduces a new **[Document Service API](/cms/api/document-service)** to replace the Entity Service API from v4, leveraging the new Draft & Publish system and paving the way for more upcoming features.

<Icon name="detective"/> The **[REST API](/cms/api/rest)** and **[GraphQL API](/cms/api/graphql)** have been updated, with a simplified response data format for both and partial support for Relay-style queries for GraphQL.

<Icon name="plugs" /> The **[Strapi Client](/cms/api/client)** library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content.

<Icon name="puzzle-piece" /> The **[Plugin SDK](/cms/plugins-development/plugin-sdk)** is a new CLI tool that helps you develop and publish Strapi plugins.

<Icon name="escalator-up" /> Another whole new CLI **[upgrade tool](/cms/upgrade-tool)** will help you migrate to any patch, minor, and major version of Strapi, automating most of the common tasks through codemods.

<Icon name="hard-hat" /> Also, we have some resources ready to help you **[upgrade to Strapi 5](/cms/migration/v4-to-v5/introduction-and-faq)**, including a [step-by-step guide](/cms/migration/v4-to-v5/step-by-step), a list of [breaking changes](/cms/migration/v4-to-v5/breaking-changes) and [specific resources](/cms/migration/v4-to-v5/additional-resources/introduction) to read for when you will consider upgrading to Strapi 5.

<Icon name="tag" /> We introduced a new **tagging system** to provide another layer of information architecture. Tags can be found at the bottom of each page. Clicking on a tag will point you to an index page listing all pages with the same tag. The list of all available tags is visible by visiting the [/tags](/tags) page.

<Icon name="plus" /> You will also soon find more **official guides** and more references to **external resources** (contributor documentation, design system documentation, and blog articles) throughout the docs pages.

<Icon name="call-bell" /> Also, last but not least, you might have noticed that the search bar now sits in the left sidebar and combines 2 buttons: the left button, **<Icon name="magnifying-glass" classes="ph-light" /> Search**, triggers a regular search, while the right part is our new AI-based chatbot! Click **<Icon name="sparkle"/> Ask AI** to ask your questions. The chatbot keeps the context of previous answers, so you can ask follow-up questions as long as you don't close the chatbot window.
