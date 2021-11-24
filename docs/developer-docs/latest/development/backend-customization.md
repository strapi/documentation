---
title: Back-end customization - Strapi Developer Docs
description: All elements of Strapi's back end, like routes, policies, middlewares, controllers, services, models, requests, responses, and webhooks, can be customized.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization.html
---

# Back-end customization

Strapi runs an HTTP server based on [Koa](https://koajs.com/), a back end JavaScript framework.

:::strapi What is Koa?
If you are not familiar with the Koa back end framework, we highly recommend you to read the [Koa's documentation introduction](http://koajs.com/#introduction).
:::

Each part of Strapi's back end can be customized:

- the [requests](/developer-docs/latest/development/backend-customization/requests-responses.md#requests) received by the Strapi server,

- the [routes](/developer-docs/latest/development/backend-customization/routes.md) that handle the requests and trigger the execution of their controller handlers,

- the [policies](/developer-docs/latest/development/backend-customization/policies.md) that can block access to a route,

- the [middlewares](/developer-docs/latest/development/backend-customization/middlewares.md) that can control the request flow and the request before moving forward,

- the [controllers](/developer-docs/latest/development/backend-customization/controllers.md) that execute code once a route has been reached,

- the [services](/developer-docs/latest/development/backend-customization/services.md) that are used to build custom logic reusable by controllers,

- the [models](/developer-docs/latest/development/backend-customization/models.md) that are a representation of the content data structure,

- the [responses](/developer-docs/latest/development/backend-customization/requests-responses.md#responses) sent to the application that sent the request,

- and the [webhooks](/developer-docs/latest/development/backend-customization/webhooks.md) that are used to notify other applications of events that occured.
