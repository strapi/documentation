---
title: Backend Customization Examples Cookbook
description: Learn how to use the core backend features of Strapi with the FoodAdvisor deployment
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/backend-customization
pagination_next: dev-docs/backend-customization/examples/authentication
---

# Backend customization: An examples cookbook using FoodAdvisor

The present section of the documentation is intended for developers who would like to get a deeper understanding of the Strapi back end customization possibilities.

The section is a collection of examples that demonstrate how the core components of the back-end server of Strapi can be used in a real-world project. Front-end code that interacts with the back end may also be part of some examples, but displayed in collapsed blocks by default since front-end code examples are not the main focus of this cookbook.

Examples are meant to extend the features of [FoodAdvisor](https://github.com/strapi/foodadvisor), the official Strapi demo application. FoodAdvisor builds a ready-made restaurants directory powered by a Strapi back end (included in the `/api` folder) and renders a [Next.js](https://nextjs.org/)-powered front-end website (included in the `/client` folder).

:::prerequisites
- 👀 You have read the [Quick Start Guide](/dev-docs/quick-start) and/or understood that Strapi is a **headless CMS** <Annotation>A headless CMS is a Content Management System that separates the presentation layer (i.e., the front end, where content is displayed) from the back end (where content is managed).<br /><br/>Strapi is a headless CMS that provides:<ul><li>a back-end server exposing an API for your content,</li><li>and a graphical user interface, called the admin panel, to manage the content.</li></ul>The presentation layer should be handled by another framework, not by Strapi.</Annotation> that helps you create a data structure with the [Content-Type Builder](/user-docs/content-type-builder) and add some content through the [Content Manager](/user-docs/content-manager), then exposes the content through APIs.
- 👀 You have read the [back-end customization introduction](/dev-docs/backend-customization) to get a general understanding of what routes, policies, middlewares, controllers, and services are in Strapi.
- 👷 If you want to test and play with the code examples by yourself, ensure you have cloned the [FoodAdvisor](https://github.com/strapi/foodadvisor) repository, setup the project, and started both the front-end and back-end servers. The Strapi admin panel should be accessible from [`localhost:1337/admin`](http://localhost:1337/admin) and the Next.js-based FoodAdvisor front-end website should be running on [`localhost:3000`](http://localhost:3000).
:::

This section can be read from start to finish, or you might want to jump directly to a specific page to understand how a given core element from the Strapi back end can be used to solve a real-world use case example:

| I want to understand… | Dedicated page |
|------------|---------------|
| How to authenticate my queries | [Authentication flow with JWT](/dev-docs/backend-customization/examples/authentication) |
| How and when to use<br />custom controllers and services | [Custom controllers and services examples](/dev-docs/backend-customization/examples/services-and-controllers) |
| How to use custom policies<br />and send custom errors | [Custom policies examples](/dev-docs/backend-customization/examples/policies) |
| How to configure and use custom routes | [Custom routes examples](/dev-docs/backend-customization/examples/routes) |
| How and when to use<br />custom global middlewares | [Custom middleware example](/dev-docs/backend-customization/examples/middlewares) |
