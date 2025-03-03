---
title: Backend Customization Examples Cookbook
description: Learn how to use the core backend features of Strapi with the FoodAdvisor deployment
displayed_sidebar: cmsSidebar
pagination_prev: cms/backend-customization
pagination_next: cms/backend-customization/examples/authentication
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Backend customization: An examples cookbook using FoodAdvisor

<NotV5/>

The present section of the documentation is intended for developers who would like to get a deeper understanding of the Strapi back end customization possibilities.

The section is a collection of examples that demonstrate how the core components of the back-end server of Strapi can be used in a real-world project. Front-end code that interacts with the back end may also be part of some examples, but displayed in collapsed blocks by default since front-end code examples are not the main focus of this cookbook.

Examples are meant to extend the features of <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/>, the official Strapi demo application. FoodAdvisor builds a ready-made restaurants directory powered by a Strapi back end (included in the `/api` folder) and renders a <ExternalLink to="https://nextjs.org/" text="Next.js"/>-powered front-end website (included in the `/client` folder).

:::prerequisites
- 👀 You have read the [Quick Start Guide](/cms/quick-start) and/or understood that Strapi is a **headless CMS** <Annotation>A headless CMS is a Content Management System that separates the presentation layer (i.e., the front end, where content is displayed) from the back end (where content is managed).<br /><br/>Strapi is a headless CMS that provides:<ul><li>a back-end server exposing an API for your content,</li><li>and a graphical user interface, called the admin panel, to manage the content.</li></ul>The presentation layer should be handled by another framework, not by Strapi.</Annotation> that helps you create a data structure with the [Content-Type Builder](/cms/features/content-type-builder) and add some content through the [Content Manager](/cms/features/content-manager), then exposes the content through APIs.
- 👀 You have read the [back-end customization introduction](/cms/backend-customization) to get a general understanding of what routes, policies, middlewares, controllers, and services are in Strapi.
- 👷 If you want to test and play with the code examples by yourself, ensure you have cloned the <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> repository, setup the project, and started both the front-end and back-end servers. The Strapi admin panel should be accessible from <ExternalLink to="http://localhost:1337/admin" text="`localhost:1337/admin`"/> and the Next.js-based FoodAdvisor front-end website should be running on <ExternalLink to="http://localhost:3000" text="`localhost:3000`"/>.
:::

This section can be read from start to finish, or you might want to jump directly to a specific page to understand how a given core element from the Strapi back end can be used to solve a real-world use case example:

| I want to understand… | Dedicated page |
|------------|---------------|
| How to authenticate my queries | [Authentication flow with JWT](/cms/backend-customization/examples/authentication) |
| How and when to use<br />custom controllers and services | [Custom controllers and services examples](/cms/backend-customization/examples/services-and-controllers) |
| How to use custom policies<br />and send custom errors | [Custom policies examples](/cms/backend-customization/examples/policies) |
| How to configure and use custom routes | [Custom routes examples](/cms/backend-customization/examples/routes) |
| How and when to use<br />custom global middlewares | [Custom middleware example](/cms/backend-customization/examples/middlewares) |
