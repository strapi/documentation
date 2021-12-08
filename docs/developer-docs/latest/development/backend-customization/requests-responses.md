---
title: Requests and Responses - Strapi Developer Docs 
description: Learn more about requests and responses for Strapi, the most popular headless CMS.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/requests-responses.html
---

# Requests & Responses

## Requests

The context object (`ctx`) contains all the requests related information. They are accessible through `ctx.request`, from [controllers](/developer-docs/latest/development/backend-customization/controllers.md) and [policies](/developer-docs/latest/development/backend-customization/policies.md).

Strapi passes the `body` on `ctx.request.body` and `files` through `ctx.request.files`

For more information, please refer to the [Koa request documentation](http://koajs.com/#request).

## Responses

The context object (`ctx`) contains a list of values and functions useful to manage server responses. They are accessible through `ctx.response`, from [controllers](/developer-docs/latest/development/backend-customization/controllers.md) and [policies](/developer-docs/latest/development/backend-customization/policies.md).

For more information, please refer to the [Koa response documentation](http://koajs.com/#response).
