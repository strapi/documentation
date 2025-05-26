---
title: Customization
description: Learn more about Strapi 5 customization possibilities
displayed_sidebar: cmsSidebar
pagination_next: cms/backend-customization
tags:
- admin panel
- admin panel customization
- backend customization
- backend server
- concepts
- Content-type Builder 
- Content Manager
- introduction
---

# Customization

Strapi includes 2 main components:

- The back-end part of Strapi is a **server** that receives requests and handles them to return responses that can surface the data you built and saved through the Content-Type Builder and Content Manager. The backend server is described in more details in the [Backend Customization introduction](/cms/backend-customization). Most of the parts of the backend server can be customized.

- The front-end, user-facing part of Strapi is called the **admin panel**. The admin panel is the graphical user interface (GUI) that you use to build a content structure, create and manage content, and perform various other actions that can be managed by built-in or 3rd-party plugins.  Some parts of the admin panel can be customized.

From a bigger picture, this is how Strapi integrates in a typical, generic setup: Strapi includes 2 parts, a back-end server and an admin panel, and interact with a database (which stores data) and an external, front-end application that displays your data. Both parts of Strapi can be customized to some extent.

<MermaidWithFallback
    chartFile="/diagrams/customization.mmd"
    fallbackImage="/img/assets/diagrams/customization.png"
    fallbackImageDark="/img/assets/diagrams/customization_DARK.png"
    alt="Customization diagram"
/>

<br />

Click on any of the following cards to learn more about customization possibilities:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="Back-end customization" description="Customize the backend server (routes, policies, middlewares, controllers, services, and models)." link="/cms/backend-customization" />
<CustomDocCard emoji="" title="Admin panel customization" description="Customize the admin panel (logos, themes, menu, translations, and more)." link="/cms/admin-panel-customization" />
</CustomDocCardsWrapper>


:::info
Customizing the database or the external, front-end application are outside of the scope of the present documentation section.
- You can learn more about databases usage with Strapi by reading the installation documentation, which lists [supported databases](/cms/installation/cli#preparing-the-installation), and the configuration documentation, which describes how to [configure a database](/cms/configurations/database) with your project.
- You can learn more about how external front-end applications can interact with Strapi by reading the Strapi's <ExternalLink to="https://strapi.io/integrations" text="integration pages"/>.
:::
