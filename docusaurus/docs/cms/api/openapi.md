---
title: OpenAPI specification 
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

Strapi provides a command-line tool to generate OpenAPI specifications for your applications. This tool automatically creates comprehensive API documentation that describes all available endpoints, parameters, and response formats in your Strapi application's content API.

The OpenAPI generation tool offers:

- Automatic discovery of all API endpoints in your Strapi application
- Comprehensive documentation including parameters, request bodies, and responses
- Multiple output formats (JSON and YAML) for different use cases
- Easy integration with documentation tools like Swagger UI and Redoc

:::callout 🚧  Experimental feature
The OpenAPI generation feature is currently experimental. Its behavior and output might change in future releases without following semantic versioning. For additional information and context, please refer to the <ExternalLink text="Strapi Contributor Docs" to="https://contributor.strapi.io/openapi" />.
:::

## Generating an OpenAPI specification

The OpenAPI generation tool is included with Strapi core and doesn't require additional installation. You can use it directly from the command line in any Strapi project to generate comprehensive API documentation.

### CLI usage

Executing the command without any arguments will generate a `specification.json` file at the root of your Strapi folder project:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```shell
yarn strapi openapi generate
```

</TabItem>

<TabItem value="npm" label="NPM">

```shell
npm run strapi openapi generate
```

</TabItem>
</Tabs>

You can also path an optional `--output` argument to specify the path and filename, as in the following example:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi openapi generate --output ./docs/api-spec.json
```
</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run strapi openapi generate -- --output ./docs/api-spec.json
```

</TabItem>
</Tabs>

### Generated specification structure

The generated OpenAPI specification follows the <ExternalLink to="https://spec.openapis.org/oas/v3.1.0.html" text="OpenAPI 3.1.0 standard" /> and could look like in the following example:

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

The generated OpenAPI specification includes all available API endpoints in your Strapi application, and information about these endpoints, such as the following:

- CRUD operations for all content types
- Custom API routes defined in your application
- Authentication endpoints for user management
- File upload endpoints for media handling
- Plugin endpoints from installed plugins

## Integrating with Swagger UI

With the following steps you can quickly generate a [Swagger UI](https://swagger.io/)-compatible page:

1. Generate a specification:

    <Tabs groupId="yarn-npm">
    <TabItem value="yarn" label="yarn">

    ```bash
    yarn strapi openapi generate --output ./public/swagger-spec.json
    ```

    </TabItem>

    <TabItem value="npm" label="npm">

    ```bash
    npm run strapi openapi generate -- --output ./public/swagger-spec.json
    ```

    </TabItem>
    </Tabs>

2. Update the `/config/middlewares.js` configuration file with the following code:

    <Tabs groupId="js-ts">
    <TabItem value="js" label="JavaScript">

    ```js title="/config/middlewares.js"
    module.exports = [
      'strapi::logger',
      'strapi::errors',
      {
        name: 'strapi::security',
        config: {
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
              'style-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
              'connect-src': ["'self'", 'https:'],
              'img-src': ["'self'", 'data:', 'blob:', 'https:'],
              'media-src': ["'self'", 'data:', 'blob:'],
              upgradeInsecureRequests: null,
            },
          },
        },
      },
      'strapi::cors',
      'strapi::poweredBy',
      'strapi::query',
      'strapi::body',
      'strapi::session',
      'strapi::favicon',
      'strapi::public',
    ];
    ```

    </TabItem>

    <TabItem value="ts" label="TypeScript">

    ```js title="/config/middlewares.ts"
    export default [
      'strapi::logger',
      'strapi::errors',
      {
        name: 'strapi::security',
        config: {
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
              'style-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
              'connect-src': ["'self'", 'https:'],
              'img-src': ["'self'", 'data:', 'blob:', 'https:'],
              'media-src': ["'self'", 'data:', 'blob:'],
              upgradeInsecureRequests: null,
            },
          },
        },
      },
      'strapi::cors',
      'strapi::poweredBy',
      'strapi::query',
      'strapi::body',
      'strapi::session',
      'strapi::favicon',
      'strapi::public',
    ];
    ```

    </TabItem>
    </Tabs>

    This will ensure the Swagger UI display from <ExternalLink to="https://unpkg.com/" text="unpkg.com" /> is not blocked by Strapi's CSP policy.


3. Create a `public/openapi.html` file in your Strapi project to display the Swagger UI, with the following code:

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
        <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: './swagger-spec.json',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: 'StandaloneLayout',
            });
          };
        </script>
      </body>
    </html>
    ```

4. Restart the Strapi server with `yarn develop` or `npm run develop` and visit the `/openapi.html` page. The Swagger UI should be displayed:

    ![Swagger UI example with Strapi OpenAPI specification](/img/assets/apis/swagger-open-api.png)
