---
title: OpenAPI Specification Generation
description: Learn how to generate OpenAPI specifications for your Strapi applications using the @strapi/openapi package
displayed_sidebar: cmsSidebar
pagination_prev: cms/api/document
pagination_next: cms/api/rest
tags:
  - openapi
  - api
  - documentation
  - specification
---

# OpenAPI Specification Generation

Strapi provides a command-line tool to generate OpenAPI specifications for your applications. This tool automatically creates comprehensive API documentation that describes all available endpoints, parameters, and response formats in your Strapi application.

## Overview

The OpenAPI generation tool offers:

- **Automatic discovery** of all API endpoints in your Strapi application
- **Comprehensive documentation** including parameters, request bodies, and responses
- **Multiple output formats** (JSON and YAML) for different use cases
- **Easy integration** with documentation tools like Swagger UI and Redoc

:::info
This tool is **experimental** and designed to replace the older documentation plugin with a more modern, maintainable solution.
:::

## Installation and basic usage

The OpenAPI generation tool is included with Strapi core and doesn't require additional installation. You can use it directly from the command line in any Strapi project to generate comprehensive API documentation.

### Generate OpenAPI Specification

<Tabs groupId="package-manager">
<TabItem value="npm" label="npm">

```bash
# Generate OpenAPI specification
npm run strapi openapi generate

# Generate with custom output path
npm run strapi openapi generate -- --output ./docs/api-spec.json


```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
# Generate OpenAPI specification
yarn strapi openapi generate

# Generate with custom output path
yarn strapi openapi generate --output ./docs/api-spec.json


```

</TabItem>
</Tabs>

### Command options

The `strapi openapi generate` command accepts the following options:

| Option     | Type     | Default               | Description                                      |
| ---------- | -------- | --------------------- | ------------------------------------------------ |
| `--output` | `string` | `./openapi-spec.json` | Output file path for the generated specification |

### Generated output

The command generates an OpenAPI specification file containing:

- **Document metadata**: API title, description, version, and server information
- **Paths**: all available API endpoints with HTTP methods, parameters, and responses
- **Components**: reusable schemas, parameters, and response objects
- **Security**: authentication and authorization requirements

## Generated specification structure

The generated OpenAPI specification follows the OpenAPI 3.1.0 standard and includes:

### Document metadata

- **openapi**: Version (3.1.0)
- **info**: API title, description, and version
- **servers**: API server configurations
- **paths**: All available API endpoints

### Route information

Each route includes:

- **HTTP methods** (GET, POST, PUT, DELETE, etc.)
- **Parameters**: Query parameters, path parameters, headers
- **Request bodies**: For POST/PUT operations
- **Responses**: Success and error response schemas
- **Security**: Authentication requirements

### Example generated specification

```json
{
  "openapi": "3.1.0",
  "x-powered-by": "strapi",
  "x-strapi-version": "5.21.0",
  "info": {
    "title": "My Strapi API",
    "description": "API documentation for My Strapi API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/articles": {
      "get": {
        "operationId": "article/get/articles",
        "parameters": [
          {
            "name": "fields",
            "in": "query",
            "schema": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Article" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Article": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "title": { "type": "string" },
          "content": { "type": "string" }
        }
      }
    }
  }
}
```

## Generated specification content

The generated OpenAPI specification includes all available API endpoints in your Strapi application:

### API Endpoints

The specification includes:

- **CRUD operations** for all content types
- **Custom API routes** defined in your application
- **Authentication endpoints** for user management
- **File upload endpoints** for media handling
- **Plugin endpoints** from installed plugins
- **Admin panel endpoints** for administrative functions

## Integration examples

### Swagger UI integration

Generate a specification and serve it with Swagger UI:

<Tabs groupId="package-manager">
<TabItem value="npm" label="npm">

```bash
# Generate specification for Swagger UI
npm run strapi openapi generate -- --output ./public/swagger-spec.json
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
# Generate specification for Swagger UI
yarn strapi openapi generate --output ./public/swagger-spec.json
```

</TabItem>
</Tabs>

Then create an HTML file to display the Swagger UI:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>API Documentation</title>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: './swagger-spec.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
      };
    </script>
  </body>
</html>
```
