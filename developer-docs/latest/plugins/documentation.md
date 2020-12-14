# API Documentation

Now that you have created your API it's really important to document its available end-points. The documentation plugin takes out most of your pain to generate your documentation. This plugin uses [SWAGGER UI](https://swagger.io/solutions/api-documentation/) to visualize your API's documentation.

If installed, this plugin will scan all the routes available from your `./api` folder and will try to create the appropriate documentation, infer on the parameters needed to create data, the responses you will receive.

You'll be able to visualize all your end-points directly from the SWAGGER UI.

## Installation

As usual run the following in your terminal:

:::: tabs

::: tab yarn

```
yarn strapi install documentation
```

:::

::: tab npm

```
npm run strapi install documentation
```

:::

::: tab strapi

```
strapi install documentation
```

:::

::::

When your plugin is installed, you just have to start your application and it will generate your API documentation.

The administration panel lets you configure the basic settings of this plugin.

![Accessing the documentation](../assets/plugins/documentation/open-doc.gif 'Accessing the documentation')

## Administration panel

This plugin comes with an interface that is available in your administration panel and a configuration file.

### Restrict the access to your API's documentation

By default, your documentation will be accessible by anyone.

If you want to restrict the access to the documentation you have to enable the **Restricted Access** option.

- Click the `ON` of **Restricted Access**
- Select a password in the `password` input
- Save your settings

Now if you try to access your documentation, you will have to enter the password you set.

### Retrieve your JWT token

Strapi is secured by default which means that most of your end-points require your user to be authorized. You will need to paste this token in your SWAGGER UI to try out your end-points.

- Click on the **Retrieve your jwt token** input to copy the token
- Visit your documentation
- Click on the **Authorize** button on the right
- Past your token in the `value` input

### Regenerate a documentation

If you update your API, the documentation will not be updated automatically.
You will have to click on the **Regenerate** button of the documentation version you want to update.
It will regenerated to specified version with the current API documentation.

## Settings

You need to create the `./extensions/documentation/config/settings.json` file manually to customize the swagger ui settings.

Here are the file that needs to be created in order to change the documentation version, the server URL and so on.

```
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "DOCUMENTATION",
    "description": "",
    "termsOfService": "YOUR_TERMS_OF_SERVICE_URL",
    "contact": {
      "name": "TEAM",
      "email": "contact-email@something.io",
      "url": "mywebsite.io"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "x-strapi-config": {
    "path": "/documentation",
    "showGeneratedFiles": true,
    "pluginsForWhichToGenerateDoc": [
      "email",
      "upload",
      "users-permissions"
    ]
  },
  "servers": [
    {
      "url": "http://localhost:1337",
      "description": "Development server"
    },
    {
      "url": "YOUR_STAGING_SERVER",
      "description": "Staging server"
    },
    {
      "url": "YOUR_PRODUCTION_SERVER",
      "description": "Production server"
    }
  ],
  "externalDocs": {
    "description": "Find out more",
    "url": "https://strapi.io/documentation/"
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {},
  "tags": [],
  "components": {}
}
```

The `openapi`, `info`, `x-strapi-config`, `servers`, `externalDocs` and `security` fields are located in the `./extensions/documentation/config/settings.json` file. Here you can specify all your environment variables, licenses, external documentation and so on...
You can add all the entries listed in the [specification](https://swagger.io/specification/).

::: danger

Do not change the `openapi` field of the `settings.json`

:::

::: tip NOTE

When you change a field in the settings.json file you need to manually restart your server.

:::

### Create a new version of the documentation

To create a new version of your documentation, you will have to update the `version` key.

```
{
  "info": {
    "version": "2.0.0"
  }
}
```

### Change the documentation path

To access your documentation on a custom path, you will have to update the `path` key.

```
{
  "x-strapi-config": {
    "path": "/documentation"
  }
}
```

### Indicate which plugins' documentation to generate

To generate documentation for specific plugins, you will need to indicate the list of all the plugins for which you wish to generate documentation. In order to do that you need to update the `pluginsForWhichToGenerateDoc` key. Leaving this key with an empty array `[]` means that not any plugin documentation will be generated. If you wish to generate documentation for all plugins, you just have to remove the key from the `settings.json` file.

```
{
  "x-strapi-config": {
    "pluginsForWhichToGenerateDoc": [
      "email",
      "upload",
      "users-permissions"
    ],
  }
}
```

In the previous example, you will generate documentation for the upload, email and users permissions (permissions and roles) plugins.

### Default Response

Sometimes, an operation can return multiple errors with different HTTP status codes, but all of them have the same response structure. You can use the default response to describe these errors collectively, not individually. “Default” means this response is used for all HTTP codes that are not covered individually for this operation.

This is how it would looks like

```
responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        # Definition of all error statuses
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

You can set the generation of the default response with the following attribute `generateDefaultResponse`

```
{
  "x-strapi-config": {
    "generateDefaultResponse": true
  }
}
```

Note: this is configurable as some API Gateways does not support a default response.

## File structure

This plugin follows the OpenApi Specifications ([0AS.3.0.2](https://swagger.io/specification/)) and generates an OpenAPI Document called `full_documentation.json`.

### Plugin's architecture

```
./extensions
└─── documentation
    |
    └─── documentation // Folder containing your OpenAPI Documents
         └─── 1.0.0 // OpenAPI Document's version
         | └─── full_documentation.json // OpenAPI Document used by SWAGGER UI
         |
         └─── 2.0.0
           └─── full_documentation.json
```

### Generated files

When you start your server with this plugin installed it will automatically create the following files in your APIs (we will see how it works for the plugins). The plugin scans all the routes available in your model to create the `paths` field.

```
/my-strapi-project
  └─── api
        └─── Foo
            └── documentation // Folder added to your model
                └── 1.0.0
                    └── foo.json // File containing all the paths where the responses can be inferred
                    └── unclassified.json // File containing the manually added route of your `routes.json` file
                    |
                    └── overrides // (Optional) Folder to override the generated documentation
```

## Overriding the suggested documentation

Currently the plugin writes a json file for each API.

In order to customize the responses or to add information to a path you need to create a file in the associated `overrides/<file-name>.json` (the name of the file matters so make sure they are similar). Then you just need to identify the path you want to modify.
You can modify the default generated tags by adding a new one at the end of the file, it works the same way for the components.

**_NOTE 1_**

Overriding the `full_documentation.json` is a bad idea since it will be regenerated each time you change a model.

**_NOTE 2_**

You can easily modify the description, summary, parameters of a path however, for a response like the `200` you will need to write the full object. Take a look at the `./extensions/users-permissions/documentation/1.0.0/overrides/users-permissions-User.json` for a complete example.

**_NOTE 3_**

To modify your generated swagger files security on a specific model, for example to allow the public to use it, you will need to override the security for each path's action. For example with the route `/comments/count` typically all routes are protected by strapi, however if you allow the public role to use this without authentication you will need to override it in your model. See the below example:

```json
    "/comments/count": {
      "get": {
        "security": []
      }
    },
```

As you can see in that example, you are defining "no security" whereas normally you would need a bearer token to access. You will need to do this manually as the documentation plugin rewrites files and cannot pull permissions from the database as this would require a server restart each time the docs are updated.

## FAQ

### How does it generate the other plugins' documentation?

In order to display a plugin's end-point in the documentation you need to add a `description` key in the `config` object.

For example this is the plugin email `routes.json` file:

```
{
  "routes": [
    {
      "method": "POST",
      "path": "/",
      "handler": "Email.send",
      "config": {
        "policies": [],
        "description": "Send an email",
        "tag": {
          "plugin": "email",
          "name": "Email"
        }
      }
    },
    {
      "method": "GET",
      "path": "/environments",
      "handler": "Email.getEnvironments",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/settings/:environment",
      "handler": "Email.getSettings",
      "config": {
        "policies": []
      }
    },
    {
      "method": "PUT",
      "path": "/settings/:environment",
      "handler": "Email.updateSettings",
      "config": {
        "policies": []
      }
    }
  ]
}
```

In this file we have only one route that we want to reference in our documentation (`/`). Usually, the tag object is used for the SWAGGER UI, it will group this route under the `Email - Email` dropdown in the documentation. Furthermore, the algorithm will try to find the model to generate the best response possible. If the model is unknown it generates a response like the following `{ foo: "string" }` that you can easily override later.

There's another property to guide the algorithm to create the best response possible, the `actionType` key.
When we can't know by the controller name the type of the returned response (like `find` and `findOne`) you can specify it with this key. Here's an example from the `users-permissions` route file.

```
{
  "method": "GET",
  "path": "/users/me",
  "handler": "User.me",
  "config": {
    "policies": [],
    "prefix": "",
    "description": "Retrieve the logged in user information",
    "tag": {
      "plugin": "users-permissions",
      "name": "User",
      "actionType": "findOne"
    }
  }
}
```

### I have created a route in a common API (like product) that queries another model. How to automate this ?

You can use the `tag` key in your route. If you provide a `tag` which is a string like `"tag": "Product"` the algorithm will know that the end-point retrieves data from the **`Product`** table. Creating a tag object `{ "tag": { "name": "User", "plugin": "User-Permissions } }` will result in generating a response with the **`User`** model from the plugin users-permissions.
