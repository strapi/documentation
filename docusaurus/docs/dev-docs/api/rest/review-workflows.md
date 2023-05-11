---
title: Review Workflows
description: Use the REST API to query review workflows
---

# Querying Review Workflows through the REST API <EntrepriseBadge />

The admin panel offers a graphical way to manage [Review Workflows](/user-docs/settings/review-workflows) but you can also use the REST API to interact with the Review Workflows feature programmatically.

<!-- TODO: add more introduction sentences here if necessary  -->

## Endpoints

When the Review Workflows feature is enabled (which requires an <EntrepriseBadge /> edition of Strapi), the following additional endpoints are available:

<!-- TODO: fill in the table with all available endpoints  -->

| Method   | URL                                         | Description                           |
| -------- | ------------------------------------------- | ------------------------------------- |
| `GET`    | `/api/strapi-workflows`                     | [Get a list of …](#header-link)       |
| `POST`   | `GET /api/strapi-workflows/:workflow_id`    | [description](#header-link)           |
| …        | …                                           | …                                     |

<!-- TODO: for each endpoint, follow the template below, giving a title and 1 or 2 introductory description sentences, and adding an example request and example response -->

##  Get all review workflows

<!-- TODO: complete the description sentence -->
Returns…

<!-- TODO: In the ApiCall template below, please fill the request and response data, and update the title properties if/when required -->

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows/`

</Request>

<Response title="Example response">

```json
{
  …
}

```

</Response>

</ApiCall>

## Use the `populate` parameter

<!-- TODO: Add a description of what populate can be used for, then one or two examples of real-world use cases using <ApiCall> component(s) -->
