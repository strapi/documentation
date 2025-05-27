---
title: Back-end customization
description: All elements of Strapi's back end, like routes, policies, middlewares, controllers, services, models, requests, responses, and webhooks, can be customized.
pagination_next: cms/backend-customization/requests-responses
tags:
- backend customization
- backend server
- Content-type Builder 
- controllers
- Document Service API 
- global middlewares
- GraphQL API
- HTTP server
- middlewares
- Query Engine API
- REST API 
- route middlewares
---

<div className="custom-mermaid-layout">

:::strapi Disambiguation: Strapi back end
As a headless CMS, the Strapi software as a whole can be considered as the "back end" of your website or application.
But the Strapi software itself includes 2 different parts:

- The **back-end** part of Strapi is an HTTP server that Strapi runs. Like any HTTP server, the Strapi back end receives requests and send responses. Your content is stored in a database, and the Strapi back end interacts with the database to create, retrieve, update, and delete content.
- The **front-end** part of Strapi is called the admin panel. The admin panel presents a graphical user interface to help you structure and manage the content.

Throughout this developer documentation, 'back end' refers _exclusively_ to the back-end part of Strapi.

The [Getting Started > Admin panel page](/cms/features/admin-panel) gives an admin panel overview and the [admin panel customization section](/cms/admin-panel-customization) details the various customization options available for the admin panel.
:::

The Strapi back end runs an HTTP server based on <ExternalLink to="https://koajs.com/" text="Koa"/>, a back-end JavaScript framework.

Like any HTTP server, the Strapi back end receives requests and send responses. You can send requests to the Strapi back end to create, retrieve, update, or delete data through the [REST](/cms/api/rest) or [GraphQL](/cms/api/graphql) APIs.

A request can travel through the Strapi back end as follows:

1. The Strapi server receives a [request](/cms/backend-customization/requests-responses).
2. The request hits [global middlewares](/cms/backend-customization/middlewares) that are run in a sequential order.
3. The request hits a [route](/cms/backend-customization/routes).<br/>By default, Strapi generates route files for all the content-types that you create (see [REST API documentation](/cms/api/rest)), and more routes can be added and configured.
4. [Route policies](/cms/backend-customization/policies) act as a read-only validation step that can block access to a route. [Route middlewares](/cms/backend-customization/routes#middlewares) can control the request flow and mutate the request itself before moving forward.
5. [Controllers](/cms/backend-customization/controllers) execute code once a route has been reached. [Services](/cms/backend-customization/services) are optional, additional code that can be used to build custom logic reusable by controllers.
6. The code executed by the controllers and services interacts with the [models](/cms/backend-customization/models) that are a representation of the content content structure stored in the database.<br />Interacting with the data represented by the models is handled by the [Document Service](/cms/api/document-service) and [Query Engine](/cms/api/query-engine).
7. You can implement [Document Service middlewares](/cms/api/document-service/middlewares) to control the data before it's sent to the Query Engine. The Query Engine can also use lifecycle hooks though we recommend you use Document Service middlewares unless you absolutely need to directly interact with the database.
7. The server returns a [response](/cms/backend-customization/requests-responses). The response can travel back through route middlewares and global middlewares before being sent.

Both global and route middlewares include an asynchronous callback function, `await next()`. Depending on what is returned by the middleware, the request will either go through a shorter or longer path through the back end:

* If a middleware returns nothing, the request will continue travelling through the various core elements of the back end (i.e., controllers, services, and the other layers that interact with the database).
* If a middleware returns before calling `await next()`, a response will be immediately sent, skipping the rest of the core elements. Then it will go back down the same chain it came up.

:::info
Please note that all customizations described in the pages of this section are only for the REST API. [GraphQL customizations](/cms/plugins/graphql#customization) are described in the GraphQL plugin documentation.
:::

<!-- TODO: uncomment this once we have updated the backend examples cookbook for v5 -->
<!-- :::tip Learn by example
If you prefer learning by reading examples and understanding how they can be used in real-world use cases, the [Examples cookbook](/cms/backend-customization/examples) section is another way at looking how the Strapi back end customization works.
::: -->

## Interactive diagram

The following diagram represents how requests travel through the Strapi back end. You can click on any shape to jump to the relevant page in the documentation.

<MermaidWithFallback
    chartFile="/diagrams/backend-customization.mmd"
    fallbackImage="/img/assets/diagrams/backend-customization.png"
    fallbackImageDark="/img/assets/diagrams/backend-customization_DARK.png"
    alt="Backend customization diagram"
/>

</div>
