---
sidebar_label: 'Introduction'
description: The Strapi CMS documentation contains all the admin panel related information and the technical information related to the setup, advanced usage, customization, and update of your Strapi 5 application.
displayed_sidebar: cmsSidebar
slug: /cms/intro
pagination_next: cms/quick-start
sidebar_position: 1
tags:
 - introduction
 - concepts
---

# Welcome to the Strapi CMS Documentation!

<!--
<SubtleCallout title="Strapi CMS & Strapi Cloud docs" emoji="📍">

There are 2 Strapi documentations, one for each Strapi product:

- <Icon name="feather" /> The **CMS documentation**, that you're currently reading, which contains all the information related to a Strapi 5 project (installation, setup, deployment, content management in admin panel, etc).
- <Icon name="cloud" /> The **[Cloud documentation](/cloud/intro)**, which is about deploying your Strapi application to Strapi Cloud and managing your Strapi Cloud projects and settings.

</SubtleCallout>
-->

The Strapi CMS documentation focuses on Strapi 5 and will take you through the complete journey of your Strapi 5 project. From the technical information related to the setup, advanced usage, customization and update of your project, to the management of the admin panel and its content and users.

<ThemedImage
alt="Homepage of the Admin Panel"
sources={{
    light: '/img/assets/getting-started/admin-panel-homepage-2.png',
    dark: '/img/assets/getting-started/admin-panel-homepage-2_DARK.png',
  }}
/>

:::strapi Where to start as a beginner?
If you're totally new to **Strapi** <Annotation>**💡 Did you know?**<br />The original purpose of the project was to help Boot**strap** your **API**: that's where the Strapi name comes from and how Strapi was created.<br /><br />Now, Strapi is an **open-source headless CMS** that gives developers the freedom to choose their favorite tools and frameworks and allows editors to manage and distribute their content using their application's admin panel.<br /><br />Based on a plugin system, Strapi is a flexible CMS whose admin panel and API are extensible — and which every part is customizable to match any use case. Strapi also has a built-in user system to manage in detail what the administrators and end users have access to.<br /></Annotation>, we suggest you to:

1. Head over to the [Quick Start](/cms/quick-start) guide.
2. Learn about the Admin Panel and the 2 main parts of the Strapi CMS: the Content Manager and Content-type Builder.
3. Go through the available Strapi features, each fully documented in their own page. Perhaps you could be interested by Draft & Publish, Internationalization or Static Preview?
:::

The table of content of the Strapi CMS documentation displays 7 main sections in an order that should correspond to your journey with the product. Click on the cards to be redirected to the introduction of the section, or to the most read page of that section.

<CustomDocCardsWrapper>

<CustomDocCard icon="rocket" title="Getting Started" description="Install and deploy Strapi, then start using the admin panel. Recommended read for beginners!" link="/cms/installation" />

<CustomDocCard icon="backpack" title="Features" description="Learn about the Strapi features, and how to configure and use them." link="/cms/features/api-tokens" />

<CustomDocCard icon="cube" title="APIs" description="Query your content with REST, GraphQL, and Strapi's lower-level APIs." link="/cms/api/content-api" />

<CustomDocCard icon="gear-fine" title="Configurations" description="Follow the instructions to handle the base and additional configurations for your project." link="/cms/configurations" />

<CustomDocCard icon="laptop" title="Development" description="Customize the Strapi server and admin panel. Learn about the most advanced options for your project." link="/cms/customization" />

<CustomDocCard icon="puzzle-piece" title="Plugins" description="Use Strapi built-in plugins or develop your own plugins." link="/cms/plugins/installing-plugins-via-marketplace" />

<CustomDocCard icon="escalator-up" title="Upgrade" description="Upgrade your application to the most recent Strapi versions." link="/cms/migration/v4-to-v5/introduction-and-faq" />

</CustomDocCardsWrapper>

:::tip Tips to make the best of the docs
- If you already know exactly what you're searching for, use the search bar or navigate using the table of content.
- If you prefer learning more about Strapi while looking at the project code structure, you can use the interactive [project structure](/cms/project-structure) page.
- If demos are more your thing, feel free to watch the <ExternalLink to="https://youtu.be/zd0_S_FPzKg" text="video demo"/>, or you can request a <ExternalLink to="https://strapi.io/demo" text="live demo"/>.
- Try our AI assistant: Click or tap the **Ask AI** button and ask your questions using natural language. Watch it answer you in real time, then read recommended sources for more details.
:::

:::strapi Information for beginner developers
Some parts of the CMS documentation (e.g. APIs, Configuration, Development) are mostly intended to developers and assume some prior knowledge of the JavaScript ecosystem.

If you also make your first steps with JavaScript web development while discovering Strapi, we encourage you to read more about <ExternalLink to="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics" text="JavaScript" /> and <ExternalLink to="https://docs.npmjs.com/about-npm" text="npm" />. If applicable to your project, you can also learn about <ExternalLink text="TypeScript" to="https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html" /> before diving deeper into these technical parts of the CMS documentation.
:::
