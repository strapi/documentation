---
title: Review Workflows
description: Use the REST API to query review workflows
---

# Querying Review Workflows through the REST API <EnterpriseBadge />

[Review Workflows](/user-docs/settings/review-workflows) allow users to create and manage customizable workflows for content creation and approval.

While the Strapi admin panel provides a graphical way to manage Review Workflows, developers may also want to interact with the feature programmatically through the REST API. This can be useful for automating workflows, integrating with other tools, or creating custom interfaces for managing content.

This documentation explains how to use the REST API to retrieve information about existing workflows and their stages
and to update existing workflows.

## Endpoints

When the Review Workflows feature is enabled (which requires an <EnterpriseBadge /> edition of Strapi), the following additional endpoints are available:

| Method   | URL                                         | Description                                                                                   |
| -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `GET`    | `/api/strapi-workflows`                     | [Get a list of workflows](#get-all-review-workflows)                                        |
| `GET`    | `/api/strapi-workflows/:workflow_id`         | [Get a specific workflow](#get-a-specific-review-workflow)                                  |
| `GET`    | `/api/strapi-workflows/:workflow_id/stages/:stage_id` | [Get a specific stage in a specific workflow](#get-a-specific-stage-in-a-specific-workflow) |
| `PUT`    | `/api/strapi-workflows/:workflow_id/stages/:stage_id` | [Update a specific stage in a specific workflow](#update-a-specific-stage-in-a-specific-workflow) |
| `PUT`    | `/api/strapi-workflows/:workflow_id/stages` | [Update all the stages of a workflow](#update-all-the-stages-of-a-workflow)                 |
| `POST`   | `/api/strapi-workflows/:workflow_id/stages` | [Create a new stage in the specified workflow](#create-a-new-stage-in-a-specific-workflow) |

Queries can also support using the [`populate` parameter](#use-the-populate-parameter).

### Get all review workflows

Returns a list of all the review workflows available in the project.

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "name": "Default Workflow"
    }
  ]
}

```

</Response>

</ApiCall>

### Get a specific review workflow

Retrieves a specific review workflow based on the provided `workflow_id`.

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows/2`

</Request>

<Response title="Example response">

```json
{
    "id": 2,
    "name": "Product Review Workflow",
    "description": "Workflow to manage product reviews"
}
```

</Response>

</ApiCall>

### Get a specific stage in a specific workflow

Retrieves a specific stage of a specific review workflow based on the provided `workflow_id` and `stage_id`.

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows/1/stages/1`

</Request>

<Response title="Example response">

```json
{
    "id": 1,
    "name": "Pending",
    "color": "#FFADAD"
}
```

</Response>

</ApiCall>

### Update a specific stage in a specific workflow

Updates a specific stage of a specific review workflow based on the provided `workflow_id` and `stage_id`.

<ApiCall>

<Request title="Example request">

`PUT http://localhost:1337/api/strapi-workflows/1/stages/2`

```json
{
    "name": "Approved",
    "color": "#90EE90"
}
```

</Request>

<Response title="Example response">

```json
{
    "id": 2,
    "name": "Approved",
    "color": "#90EE90"
}
```

</Response>

</ApiCall>

### Update all the stages of a workflow

The `/stages` endpoint can be used to update all the stages of a specific review workflow based on the provided `workflow_id`. Use it to change the order, remove, create, and update the stages of a workflow. The request body must contain an array of objects, where each object represents a stage and its properties.

Using this endpoint you can:

- Update an existing stage by including the stage's `id` in the object.
- Create a new stage if no stage `id` is provided.
- Remove a stage by omitting the stage from the request body.

<ApiCall>

<Request title="Example request">

`PUT http://localhost:1337/api/strapi-workflows/1/stages`

```json
[
    {
        "name": "New",
        "color": "#FFFFFF"
    },
    {
        "id": 2,
        "name": "Approved",
        "color": "#90EE90"
    },
    {
        "id": 3,
        "name": "Rejected",
        "color": "#FF0000"
    }
]
```

</Request>

<Response title="Example response">

```json
[
    {
        "id": 4,
        "name": "New",
        "color": "#FFFFFF"
    },
    {
        "id": 2,
        "name": "Approved",
        "color": "#90EE90"
    },
    {
        "id": 3,
        "name": "Rejected",
        "color": "#FF0000"
    }
]
```

</Response>

</ApiCall>

### Create a new stage in a specific workflow

Creates a new stage for a specific review workflow based on the provided `workflow_id`. The newly created stage will be put at the end of the stages of the workflow.

<ApiCall>

<Request title="Example request">

`POST http://localhost:1337/api/strapi-workflows/1/stages`

```json
{
    "name": "New",
    "color": "#FFFFFF"
}
```

</Request>

<Response title="Example response">

```json
{
  "id": 42,
  "name": "New",
  "color": "#FFFFFF"
}
```

</Response>

</ApiCall>


## Use the `populate` parameter

The `populate` parameter is used to fetch associated data with the resource being queried. In the context of Review Workflows, `populate` allows fetching the stages associated with a workflow in a single API call instead of making a separate API call for each stage.

#### Fetch all workflows with their stages
<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows?populate=stages`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "name": "Default Workflow",
      "stages": [
        {
          "id": 1,
          "name": "Draft",
          "color": "#FFADAD"
        },
        {
          "id": 2,
          "name": "In progress",
          "color": "#FF2212"
        },
        {
          "id": 3,
          "name": "In review",
          "color": "#38A2F2"
        },
        {
          "id": 4,
          "name": "Done",
          "color": "#000000"
        }
      ]
    }
  ]
}

```

</Response>

</ApiCall>

#### Fetch a specific workflow with its stages
<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/strapi-workflows/2?populate=stages`

</Request>

<Response title="Example response">

```json
{
  "id": 2,
  "name": "Product Review Workflow",
  "description": "Workflow to manage product reviews",
  "stages": [
    {
      "id": 1,
      "name": "Pending",
      "color": "#FFADAD"
    },
    {
      "id": 2,
      "name": "Approved",
      "color": "#CAFFBF"
    },
    {
      "id": 3,
      "name": "Rejected",
      "color": "#FFD6A5"
    }
  ]
}
```

</Response>

</ApiCall>
