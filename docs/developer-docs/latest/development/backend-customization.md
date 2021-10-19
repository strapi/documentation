---
title: Backend customization - Strapi Developer Docs
description: …
---

<!-- TODO: update SEO -->

# Backend customization

Strapi runs an HTTP server based on [Koa](https://koajs.com/). Its internal flow mostly revolves around 7 core concepts: [requests](#requests), [routes](#routes), [policies](#policies), [middlewares](#middlewares), [controllers](#controllers), [services](#services), and [responses](#responses). Each of these parts can be customized, as well as [models](#models) and [webhooks](#webhooks).

## Requests

As Strapi runs an HTTP server, it receives requests, handled by [routes](#routes). These requests can come from API calls (e.g. via a client application) or from the Strapi's admin panel and plugins.

Strapi's server is built upon [Koa](https://koajs.com/). Koa's request objects are an abstraction on top of [node's vanilla request object](https://nodejs.org/api/http.html#http_class_http_incomingmessage). In Strapi, the context object (i.e. `ctx`) contains all the request-related information:

- the request itself is accessible through `ctx.request` and is available to [controllers](#controllers) and [policies](#policies),
- the body of the request is passed as `ctx.request.body`,
- and the files are passed as `ctx.request.files`.

## Routes

Requests can be handled on any URL by adding [routes](/developer-docs/latest/development/backend-customization/routes.md) to Strapi. Using routes is the first step towards creating custom JSON APIs to be used later on in the client application. 

Routes can be configured:

- with [policies](#policies), which are a way to block access to a route,
- and with [middlewares](#middlewares), which are a way to control the request flow and the request itself, and change them.

Once a route has been created, it should execute some code handled by a [controller](#controllers).

## Policies

[Policies](/developer-docs/latest/development/backend-customization/policies.md) are a way to block access to a route. They are usually used for authorization purposes or to check for some accessibility conditions.

In Strapi, policies work for both:

- REST routes when making requests through the [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md)
- and GraphQL resolvers when using the [GraphQL plugin](/developer-docs/latest/plugins/graphql.md).

Policies can be global (i.e. applied to any route in a Strapi project) or scoped (i.e. limited to a specific scope, e.g. only used by a plugin or applied to a specific API).

As a developer, you can manually add policies, and they can also be added by the admin panel or by plugins.

## Middlewares

[Middlewares](/developer-docs/latest/development/backend-customization/middlewares.md) are a way to:

- control the request flow and change it,
- and change the [request](#requests) before moving forward.

Usually middlewares are mostly used for logging, caching, debuging, error handling, and security purposes.

Strapi middlewares are functions that are composed and executed in a stack-like manner upon request. They are based on [Koa](https://koajs.com/)'s middleware stack.

## Controllers

Once a [route](#routes) has been created, it should execute some code handled by a controller.

[Controllers](/developer-docs/latest/development/backend-customization/controllers.md) are JavaScript files that contain a set of methods, called actions, reached by the client according to the requested [route](#route). Every time a client requests the route, the action performs the business logic code and sends back the [response](#responses).

In most cases, the controllers will contain the bulk of a project's business logic. As the logic implemented in a controller becomes more complex, it's a good practice to move that logic into its own layer, ready to be reused and reorganised, using [services](#services).

## Services

[Services](/developer-docs/latest/development/backend-customization/services.md) are a generic way to build business logic. They are a set of reusable functions, that can be useful to respect the don’t repeat yourself (DRY) programming concept and to simplify [controllers](#controllers) logic.

## Responses

At the end of the flow, Strapi [controllers](#controllers) send a response to a [request](#requests).

Strapi is based on Koa, so responses are based on [Koa's response object](https://koajs.com/#response), which are an abstraction on top of [node's response object](https://nodejs.org/api/http.html#http_class_http_serverresponse).

In Strapi, the context object (i.e. `ctx`) contains a list of values and functions useful to manage server responses. They are accessible through `ctx.response`, from [controllers](#controllers) and [policies](#policies).

## Models

[Models](/developer-docs/latest/development/backend-customization/models.md), define a representation of the data structure of the content accessible through APIs.

There are 2 different types of models in Strapi:

- [content-types](/developer-docs/latest/development/backend-customization/models.md#models), which can be collection types or single types, depending on how many entries they manage,
- and [components](/developer-docs/latest/development/backend-customization/models.md#components-2), which are data structures re-usable in multiple content-types and can organized with [dynamic zones](/developer-docs/latest/development/backend-customization/models.md#dynamic-zones)

## Webhooks

[Webhooks](/developer-docs/latest/development/backend-customization/webhooks.md) are a construct used by Strapi to notify other applications that an event occurred. A webhook is a user-defined HTTP callback, used to inform third-party providers so they can start some processing on their end (e.g. continuous integration, build, deployment, etc.).
