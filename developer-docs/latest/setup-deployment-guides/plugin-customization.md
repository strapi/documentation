# Plugins customization

## Plugin extensions

In Strapi you can install plugins in your `node_modules`. This allows for easy updates and respect best practices. To customize those installed plugins you can work in the `/extensions` directory. It contains all the plugins' customizable files.

Some plugins will create files in these folders so you can then modify them. You can also create certain files manually to add some custom configuration.

Extensions folder structure:

- `extensions/`
  - `**`: Plugin Id
    - `admin`: You can extend a plugin's admin by creating a file with the same name, doing so will override the original one.
    - `config`: You can extend a plugin's configuration by adding a settings.json file with your custom configuration.
    - `models`: Contains the plugin's models that you have overwritten (e.g. when you add a relation to the User model).
    - `controllers`: You can extend the plugin's controllers by creating controllers with the same names and override certain methods.
    - `services`: You can extend the plugin's services by creating services with the same names and override certain methods.

::: warning
When using **extensions** you will need to update your code whenever you upgrade your strapi version. Not updating and comparing your **extensions** with the new changes on the repository, can break your app in unexpected ways that we cannot predict in the [migration guides](/latest/update-migration-guides/migration-guides.md).
:::


<!--- BEGINNING OF DOC PLUGIN --->

## API Documentation plugin

Now that you have created your API it's really important to document its available end-points. The documentation plugin takes out most of your pain to generate your documentation. This plugin uses [SWAGGER UI](https://swagger.io/solutions/api-documentation/) to visualize your API's documentation.

If installed, this plugin will scan all the routes available from your `./api` folder and will try to create the appropriate documentation, infer on the parameters needed to create data, the responses you will receive.

You'll be able to visualize all your end-points directly from the SWAGGER UI.

### Installation

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

![Accessing the documentation](/flatest/assets/plugins/documentation/open-doc.gif 'Accessing the documentation')

### Administration panel

This plugin comes with an interface that is available in your administration panel and a configuration file.

#### Restrict the access to your API's documentation

By default, your documentation will be accessible by anyone.

If you want to restrict the access to the documentation you have to enable the **Restricted Access** option.

- Click the `ON` of **Restricted Access**
- Select a password in the `password` input
- Save your settings

Now if you try to access your documentation, you will have to enter the password you set.

#### Retrieve your JWT token

Strapi is secured by default which means that most of your end-points require your user to be authorized. You will need to paste this token in your SWAGGER UI to try out your end-points.

- Click on the **Retrieve your jwt token** input to copy the token
- Visit your documentation
- Click on the **Authorize** button on the right
- Past your token in the `value` input

#### Regenerate a documentation

If you update your API, the documentation will not be updated automatically.
You will have to click on the **Regenerate** button of the documentation version you want to update.
It will regenerated to specified version with the current API documentation.

### Settings

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

#### Create a new version of the documentation

To create a new version of your documentation, you will have to update the `version` key.

```
{
  "info": {
    "version": "2.0.0"
  }
}
```

#### Change the documentation path

To access your documentation on a custom path, you will have to update the `path` key.

```
{
  "x-strapi-config": {
    "path": "/documentation"
  }
}
```

#### Indicate which plugins' documentation to generate

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

#### Default Response

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

### File structure

This plugin follows the OpenApi Specifications ([0AS.3.0.2](https://swagger.io/specification/)) and generates an OpenAPI Document called `full_documentation.json`.

#### Plugin's architecture

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

#### Generated files

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

### Overriding the suggested documentation

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

### FAQ

#### How does it generate the other plugins' documentation?

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

#### I have created a route in a common API (like product) that queries another model. How to automate this ?

You can use the `tag` key in your route. If you provide a `tag` which is a string like `"tag": "Product"` the algorithm will know that the end-point retrieves data from the **`Product`** table. Creating a tag object `{ "tag": { "name": "User", "plugin": "User-Permissions } }` will result in generating a response with the **`User`** model from the plugin users-permissions.


<!--- BEGINNING OF EMAIL PLUGIN --->

## Email plugin

Thanks to the plugin `Email`, you can send email from your server or externals providers such as **Sendgrid**.

### Programmatic usage

#### Send an email - `.send()`

In your custom controllers or services you may want to send email.
By using the following function, Strapi will use the configured provider to send an email.

**Example**

```js
await strapi.plugins['email'].services.email.send({
  to: 'paulbocuse@strapi.io',
  from: 'joelrobuchon@strapi.io',
  cc: 'helenedarroze@strapi.io',
  bcc: 'ghislainearabian@strapi.io',
  replyTo: 'annesophiepic@strapi.io',
  subject: 'Use strapi email provider successfully',
  text: 'Hello world!',
  html: 'Hello world!',
});
```

#### Send an email using a template - `.sendTemplatedEmail()`

When you send an email, you will most likely want to build it from a template you wrote.
The email plugin provides the service `sendTemplatedEmail` that compile the email and then sends it. The function have the following params:

| param           | description                                                                                                              | type   | default |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | ------- |
| `emailOptions`  | Object that contains email options (`to`, `from`, `replyTo`, `cc`, `bcc`) except `subject`, `text` and `html`            | object | `{}`    |
| `emailTemplate` | Object that contains `subject`, `text` and `html` as [lodash string templates](https://lodash.com/docs/4.17.15#template) | object | `{}`    |
| `data`          | Object that contains the data used to compile the templates                                                              | object | `{}`    |

**Example**

```js
const emailTemplate = {
  subject: 'Welcome <%= user.firstname %>',
  text: `Welcome on mywebsite.fr!
    Your account is now linked with: <%= user.email %>.`,
  html: `<h1>Welcome on mywebsite.fr!</h1>
    <p>Your account is now linked with: <%= user.email %>.<p>`,
};

await strapi.plugins.email.services.email.sendTemplatedEmail(
  {
    to: user.email,
    // from: is not specified, so it's the defaultFrom that will be used instead
  },
  emailTemplate,
  {
    user: _.pick(user, ['username', 'email', 'firstname', 'lastname']),
  }
);
```

### Configure the plugin

By default Strapi provides a local email system ([sendmail](https://www.npmjs.com/package/sendmail)). If you want to use a third party to send emails, you need to install the correct provider module. Otherwise you can skip this part and continue to configure your provider.

You can check all the available providers developed by the community on npmjs.org - [Providers list](https://www.npmjs.com/search?q=strapi-provider-email-)

To install a new provider run:

:::: tabs

::: tab yarn

```
yarn add strapi-provider-email-sendgrid --save
```

:::

::: tab npm

```
npm install strapi-provider-email-sendgrid --save
```

:::

::::

##### Using scoped packages as providers

If your package name is [scoped](https://docs.npmjs.com/about-scopes) (for example `@username/strapi-provider-email-gmail-oauth2`) you need to take an extra step by aliasing it in `package.json`. Go to the `dependencies` section and change the provider line to look like this:

`"strapi-provider-email-gmail-oauth2": "npm:@username/strapi-provider-email-gmail-oauth2@0.1.9"`

The string after the last `@` represents your desired [semver](https://docs.npmjs.com/about-semantic-versioning) version range.

#### Configure your provider

After installing your provider you will need to add some settings in `config/plugins.js`.
If this file doesn't exists, you'll need to create it.

> ⚠️ Do note that filename has to come with correct spelling, plugin with 's' (plural). -> `plugins.js`
> Check the README of each provider to know what configuration settings the provider needs.

Here is an example of a configuration made for the provider [strapi-provider-email-sendgrid](https://www.npmjs.com/package/strapi-provider-email-sendgrid).

**Path —** `./config/plugins.js`.

```js
module.exports = ({ env }) => ({
  // ...
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: 'juliasedefdjian@strapi.io',
      defaultReplyTo: 'juliasedefdjian@strapi.io',
    },
  },
  // ...
});
```

::: tip
If you're using a different provider depending on your environment, you can specify the correct configuration in `config/env/${yourEnvironment}/plugins.js`. More info here: [Environments](/latest/setup-deployment-guides/framework-configurations.md#environment)
:::

::: tip
Only one email provider will be active at all time. If the email provider setting isn't picked up by strapi, verify you have put the file `plugins.js` in the correct folder, and with correct filename. The selection of email provider is done via configuration file only.  
:::

::: tip
When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template, with default no-reply@strapi.io need to be updated in according to your email provider, otherwise it will fail the test.
More info here: [Configure templates Locally](http://localhost:1337/admin/plugins/users-permissions/email-templates)
:::

### Create new provider

If you want to create your own, make sure the name starts with `strapi-provider-email-` (duplicating an existing one will be easier) and customize the `send` function.

Default template

```js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

In the `send` function you will have access to:

- `providerOptions` that contains configurations written in `plugins.js`
- `settings` that contains configurations written in `plugins.js`
- `options` that contains options you send when you call the `send` function from the email plugin service

To use it you will have to publish it on **npm**.

#### Create a local provider

If you want to create your own provider without publishing it on **npm** you can follow these steps:

- Create a `providers` folder in your application.
- Create your provider as explained in the documentation eg. `./providers/strapi-provider-email-[...]/...`
- Then update your `package.json` to link your `strapi-provider-email-[...]` dependency to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your new provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-email-[...]": "file:providers/strapi-provider-email-[...]",
    ...
  }
}
```

- Finally, run `yarn install` or `npm install` to install your new custom provider.

### Troubleshooting

You received an `Auth.form.error.email.invalid` error even though the email is valid and exists in the database.

Here is the error response you get from the API.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "messages": [
        {
          "id": "Auth.form.error.email.invalid"
        }
      ]
    }
  ]
}
```

This error is due to your IP connection. By default, Strapi uses the [`sendmail`](https://github.com/guileen/node-sendmail) package.

This package sends an email from the server it runs on. Depending on the network you are on, the connection to the SMTP server could fail.

Here is the `sendmail` error.

```
Error: SMTP code:550 msg:550-5.7.1 [87.88.179.13] The IP you're using to send mail is not authorized to
550-5.7.1 send email directly to our servers. Please use the SMTP relay at your
550-5.7.1 service provider instead. Learn more at
550 5.7.1  https://support.google.com/mail/?p=NotAuthorizedError 30si2132728pjz.75 - gsmtp
```

To fix it, we suggest you to use another email provider that uses third party to send emails.

When using a third party provider, you avoid having to setup a mail server on your server and get extra features such as email analytics.


<!--- BEGINNING OF GRAPHQL PLUGIN --->

## GraphQL plugin

By default Strapi create [REST endpoints](../content-api/api-endpoints.md) for each of your content types. With the GraphQL plugin, you will be able to add a GraphQL endpoint to fetch and mutate your content.

### Usage

To get started with GraphQL in your app, please install the plugin first. To do that, open your terminal and run the following command:

:::: tabs

::: tab yarn

```
yarn strapi install graphql
```

:::

::: tab npm

```
npm run strapi install graphql
```

:::

::: tab strapi

```
strapi install graphql
```

:::

::::

Then, start your app and open your browser at [http://localhost:1337/graphql](http://localhost:1337/graphql). You should see the interface (**GraphQL Playground**) that will help you to write GraphQL query to explore your data.

### Authentication

To perform authorized requests, you must first get a JWT:

```graphql
mutation {
  login(input: { identifier: "email", password: "password" }) {
    jwt
  }
}
```

Then on each request, send along an `Authorization` header in the form of `{ Authorization: "Bearer YOUR_JWT_GOES_HERE" }`. This can be set in the HTTP Headers section of your GraphQL Playground.

### Configurations

By default, the [Shadow CRUD](#shadow-crud) feature is enabled and the GraphQL is set to `/graphql`. The Playground is enabled by default for both the development and staging environments, however it is disabled in production. By changing the config option `playgroundAlways` to true, you can enable it.

Security limits on maximum number of items in your response by default is limited to 100, however you can change this on the following config option `amountLimit`. This should only be changed after careful consideration of the drawbacks of a large query which can cause what would basically be a DDoS (Distributed Denial of Service). And may cause abnormal load on your Strapi server, as well as your database server.

You can also setup any [Apollo Server options](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver) with the `apolloServer` option. For example, you can enable the tracing feature, which is supported by the playground to track the response time of each part of your query. To enable this feature just change/add the `"tracing": true` option in the GraphQL settings file. You can read more about the tracing feature from Apollo [here](https://www.apollographql.com/docs/apollo-server/federation/metrics/).

You can edit these configurations by creating following file.

::: warning
Please note the setting for GraphQL `tracing` as changed and has been moved to `apolloServer.tracing`
:::

**Path —** `./config/plugins.js`

```js
module.exports = {
  //
  graphql: {
    endpoint: '/graphql',
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
    apolloServer: {
      tracing: false,
    },
  },
};
```

### Query API

In the section, we assume that the [Shadow CRUD](#shadow-crud) feature is enabled. For each model, the plugin auto-generates queries and mutations which just fit to your needs.

#### Fetch a single entry

- `id`: String

```graphql
query {
  user(id: "5aafe871ad624b7380d7a224") {
    username
    email
  }
}
```

#### Fetch multiple entries

```graphql
query {
  users {
    username
    email
  }
}
```

#### Fetch dynamic zone data

Dynamic zones are union types in graphql so you need to use fragments to query the fields.

```graphql
query {
  restaurants {
    dz {
      __typename
      ... on ComponentDefaultClosingperiod {
        label
      }
    }
  }
}
```

#### Create a new entry

- `input`: Object
  - `data`: Object — Values to insert

```graphql
mutation {
  createUser(input: { data: { username: "John", email: "john@doe.com" } }) {
    user {
      username
      email
    }
  }
}
```

The implementation of the mutations also supports relational attributes. For example, you can create a new `User` and attach many `Restaurant` to it by writing your query like this:

```graphql
mutation {
  createUser(
    input: {
      data: {
        username: "John"
        email: "john@doe.com"
        restaurants: ["5b51e3949db573a586ad22de", "5b5b26619b0820c1c2fb79c9"]
      }
    }
  ) {
    user {
      username
      email
      restaurant {
        name
        description
        price
      }
    }
  }
}
```

#### Update an existing entry

- `input`: Object
  - `where`: Object - Entry's ID to update
  - `data`: Object — Values to update

```graphql
mutation {
  updateUser(
    input: {
      where: { id: "5b28f1747c739e4afb48605c" }
      data: { username: "John", email: "john@doe.com" }
    }
  ) {
    user {
      username
      email
    }
  }
}
```

You can also update relational attributes by passing an ID or an array of IDs (depending on the relationship).

```graphql
mutation {
  updateRestaurant(input: {
    where: {
      id: "5b5b27f8164f75c29c728110"
    },
    data: {
      chef: "5b51e3949db573a586ad22de" // User ID
    }
  }) {
    restaurant {
      chef {
        username
        email
      }
    }
  }
}
```

#### Delete an entry

- `input`: Object
  - `where`: Object - Entry's ID to delete

```graphql
mutation {
  deleteUser(input: { where: { id: "5b28f1747c739e4afb48605c" } }) {
    user {
      username
      email
    }
  }
}
```

#### Filters

You can also apply different parameters to the query to make more complex queries.

- `limit` (integer): Define the number of returned entries.
- `start` (integer): Define the amount of entries to skip.
- `sort` (string): Define how the data should be sorted.
- `publicationState` (PublicationState): Only select entries matching the publication state provided.

  Handled states are:

  - `live`: Return only published entries (default)
  - `preview`: Return both draft entries & published entries

- `<field>:asc` or `<field>:desc`
- `where` (object): Define the filters to apply in the query.
  - `<field>`: Equals.
  - `<field>_ne`: Not equals.
  - `<field>_lt`: Lower than.
  - `<field>_lte`: Lower than or equal to.
  - `<field>_gt`: Greater than.
  - `<field>_gte`: Greater than or equal to.
  - `<field>_contains`: Contains.
  - `<field>_containss`: Contains sensitive.
  - `<field>_in`: Matches any value in the array of values.
  - `<field>_nin`: Doesn't match any value in the array of values.
  - `<field>_null`: Equals null/Not equals null

Return the second decade of users which have an email that contains `@strapi.io` ordered by username.

```graphql
query {
  users(limit: 10, start: 10, sort: "username:asc", where: { email_contains: "@strapi.io" }) {
    username
    email
  }
  restaurants(
    limit: 10
    where: { _id_nin: ["5c4dad1a8f3845222ca88a56", "5c4dad1a8f3845222ca88a57"] }
  ) {
    _id
    name
  }
}
```

Return the users which have been created after the March, 19th 2018 4:21 pm.

```graphql
query {
  users(where: { createdAt_gt: "2018-03-19 16:21:07.161Z" }) {
    username
    email
  }
}
```

### Shadow CRUD

To simplify and automate the build of the GraphQL schema, we introduced the Shadow CRUD feature. It automatically generates the type definition, queries, mutations and resolvers based on your models. The feature also lets you make complex query with many arguments such as `limit`, `sort`, `start` and `where`.

::: tip NOTE
If you use a local plugin, the controller methods of your plugin are not created by default. In order for the Shadow CRUD to work you have to define them in your controllers for each of your models. You can find examples of controllers `findOne`, `find`, `create`, `update` and `delete` there : [Core controllers](../concepts/controllers.md#core-controllers).
:::

#### Example

If you've generated an API called `Restaurant` using the CLI `strapi generate:api restaurant` or the administration panel, your model looks like this:

**Path —** `./api/restaurant/models/Restaurant.settings.json`

```json
{
  "connection": "default",
  "options": {
    "timestamps": true
  },
  "attributes": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "text"
    },
    "open": {
      "type": "boolean"
    }
  }
}
```

The generated GraphQL type and queries will be:

```graphql
// Restaurant's Type definition
type Restaurant {
  _id: String
  created_at: String
  updated_at: String
  name: String
  description: String
  open: Boolean
}

// Queries to retrieve one or multiple restaurants.
type Query {
  restaurants(sort: String, limit: Int, start: Int, where: JSON): [Restaurant]
  restaurant(id: String!): Restaurant
}

// Mutations to create, update or delete a restaurant.
type Mutation {
  createRestaurant(input: createRestaurantInput): createRestaurantPayload!
  updateRestaurant(input: updateRestaurantInput): updateRestaurantPayload!
  deleteRestaurant(input: deleteRestaurantInput): deleteRestaurantPayload!
}
```

The queries and mutations will use the generated controller's actions as resolvers. It means that the `restaurants` query will execute the `Restaurant.find` action, the `restaurant` query will use the `Restaurant.findOne` action and the `createRestaurant` mutation will use the `Restaurant.create` action, etc.

### Aggregation & Grouping

::: warning
This feature is only available on Mongoose ORM.
:::

Strapi now supports Aggregation & Grouping.
Let's consider again the model mentioned above:

```graphql
type Restaurant {
  _id: ID
  createdAt: String
  updatedAt: String
  name: String
  description: String
  nb_likes: Int
  open: Boolean
}
```

Strapi will generate automatically for you the following queries & types:

#### Aggregation

```graphql
type RestaurantConnection {
  values: [Restaurant]
  groupBy: RestaurantGroupBy
  aggregate: RestaurantAggregator
}

type RestaurantGroupBy {
  _id: [RestaurantConnection_id]
  createdAt: [RestaurantConnectionCreatedAt]
  updatedAt: [RestaurantConnectionUpdatedAt]
  name: [RestaurantConnectionTitle]
  description: [RestaurantConnectionContent]
  nb_likes: [RestaurantConnectionNbLikes],
  open: [RestaurantConnectionPublished]
}

type RestaurantConnectionPublished {
  key: Boolean
  connection: RestaurantConnection
}

type RestaurantAggregator {
  count: Int
  sum: RestaurantAggregatorSum
  avg: RestaurantAggregatorAvg
  min: RestaurantAggregatorMin
  max: RestaurantAggregatorMax
}

type RestaurantAggregatorAvg {
  nb_likes: Float
}

type RestaurantAggregatorMin { // Same for max and sum
  nb_likes: Int
}

type Query {
  restaurantsConnection(sort: String, limit: Int, start: Int, where: JSON): RestaurantConnection
}
```

Getting the total count and the average likes of restaurants:

```graphql
query {
  restaurantsConnection {
    aggregate {
      count
      avg {
        nb_likes
      }
    }
  }
}
```

Let's say we want to do the same query but for only open restaurants

```graphql
query {
  restaurantsConnection(where: { open: true }) {
    aggregate {
      count
      avg {
        nb_likes
      }
    }
  }
}
```

Getting the average likes of open and non open restaurants

```graphql
query {
  restaurantsConnection {
    groupBy {
      open {
        key
        connection {
          aggregate {
            avg {
              nb_likes
            }
          }
        }
      }
    }
  }
}
```

Result

```json
{
  "data": {
    "restaurantsConnection": {
      "groupBy": {
        "open": [
          {
            "key": true,
            "connection": {
              "aggregate": {
                "avg": {
                  "nb_likes": 10
                }
              }
            }
          },
          {
            "key": false,
            "connection": {
              "aggregate": {
                "avg": {
                  "nb_likes": 0
                }
              }
            }
          }
        ]
      }
    }
  }
}
```

### Customize the GraphQL schema

If you want to define a new scalar, input or enum types, this section is for you. To do so, you will have to create a `schema.graphql.js` file. This file has to be placed into the config folder of each API `./api/*/config/schema.graphql.js` or plugin `./extensions/*/config/schema.graphql.js`.

**Structure —** `schema.graphql.js`.

```js
module.exports = {
  definition: ``,
  query: ``,
  type: {},
  resolver: {
    Query: {},
  },
};
```

- `definition` (string): lets you define new type, input, etc.
- `query` (string): where you add custom query.
- `mutation` (string): where you add custom mutation.
- `type` (object): allows you to add description, deprecated field or disable the [Shadow CRUD](#shadow-crud) feature on a specific type.
- `resolver` (object):
  - `Query` (object): lets you define custom resolver, policies for a query.
  - `Mutation` (object): lets you define custom resolver, policies for a mutation.

#### Example

Let say we are using the same previous `Restaurant` model.

**Path —** `./api/restaurant/config/schema.graphql.js`

```js
module.exports = {
  definition: `
    enum RestaurantStatusInput {
      work
      open
      closed
    }
  `,
  query: `
    restaurantsByChef(id: ID, status: RestaurantStatusInput, limit: Int): [Restaurant]!
  `,
  mutation: `
    attachRestaurantToChef(id: ID, chefID: ID): Restaurant!
  `,
  resolver: {
    Query: {
      restaurant: {
        description: 'Return a single restaurant',
        policies: ['plugins::users-permissions.isAuthenticated', 'isOwner'], // Apply the 'isAuthenticated' policy of the `Users & Permissions` plugin, then the 'isOwner' policy before executing the resolver.
      },
      restaurants: {
        description: 'Return a list of restaurants', // Add a description to the query.
        deprecated:
          'This query should not be used anymore. Please consider using restaurantsByChef instead.',
      },
      restaurantsByChef: {
        description: 'Return the restaurants open by the chef',
        resolver: 'application::restaurant.restaurant.findByChef',
      },
      restaurantsByCategories: {
        description: 'Return the restaurants open by the category',
        resolverOf: 'application::restaurant.restaurant.findByCategories', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, ctx) => {
          // ctx is the context of the Koa request.
          await strapi.controllers.restaurants.findByCategories(ctx);

          return ctx.body.restaurants || `There is no restaurant.`;
        },
      },
    },
    Mutation: {
      attachRestaurantToChef: {
        description: 'Attach a restaurant to an chef',
        policies: ['plugins::users-permissions.isAuthenticated', 'isOwner'],
        resolver: 'application::restaurant.restaurant.attachToChef',
      },
    },
  },
};
```

#### Define a new type

Edit the `definition` attribute in one of the `schema.graphql.js` files of your project by using the GraphQL Type language string.

::: tip
The easiest way is to create a new model using the CLI `strapi generate:model category --api restaurant`, so you don't need to customize anything.
:::

```js
module.exports = {
  definition: `
    type Person {
      id: Int!
      firstname: String!
      lastname: String!
      age: Int
      children: [Person]
    }
  `,
};
```

To explore the data of the new type `Person`, you need to define a query and associate a resolver to this query.

```js
module.exports = {
  definition: `
    type Person {
      id: Int!
      firstname: String!
      lastname: String!
      age: Int
      children: [Person]
    }
  `,
  query: `
    person(id: Int!): Person
  `,
  type: {
    Person: {
      _description: 'The Person type description', // Set the description for the type itself.
      firstname: 'The firstname of the person',
      lastname: 'The lastname of the person',
      age: {
        description: 'The age of the person',
        deprecated: 'We are not using the age anymore, we can find it thanks to our powerful AI'
      },
      children: 'The children of the person'
    }
  }
  resolver: {
    Query: {
      person: {
        description: 'Return a single person',
        resolver: 'application::person.person.findOne' // It will use the action `findOne` located in the `Person.js` controller.
      }
    }
  }
};
```

::: tip
The resolver parameter also accepts an object as a value to target a controller located in a plugin.
:::

```js
module.exports = {
  ...
  resolver: {
    Query: {
      person: {
        description: 'Return a single person',
        resolver: 'plugins::users-permissions.user.findOne'
      }
    }
  }
};
```

#### Add description and deprecated reason

One of the most powerful features of GraphQL is the auto-documentation of the schema. The GraphQL plugin allows you to add a description to a type, a field and a query. You can also deprecate a field or a query.

**Path —** `./api/restaurant/models/Restaurant.settings.json`

```json
{
  "connection": "default",
  "info": {
    "description": "The Restaurant type description"
  },
  "options": {
    "timestamps": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "description": "The name of the restaurant",
      "deprecated": "We are not using the name anymore, it is auto-generated thanks to our powerful AI"
    },
    "description": {
      "type": "text",
      "description": "The description of the restaurant."
    },
    "open": {
      "type": "boolean",
      "description": "Is the restaurant open or not. Yes = true."
    }
  }
}
```

It might happen that you want to add a description to a query or deprecate it. To do that, you need to use the `schema.graphql.js` file.

::: warning
The `schema.graphql.js` file has to be placed into the config folder of each API `./api/*/config/schema.graphql.js` or plugin `./extensions/*/config/schema.graphql.js`.
:::

**Path —** `./api/restaurant/config/schema.graphql.js`

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants', // Add a description to the query.
        deprecated:
          'This query should not be used anymore. Please consider using restaurantsByChef instead.', // Deprecate the query and explain the reason why.
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        deprecated: 'Please use the dashboard UI instead',
      },
    },
  },
};
```

#### Execute a policy before a resolver

Sometimes a query needs to be only accessible to authenticated user. To handle this, Strapi provides a solid policy system. A policy is a function executed before the final action (the resolver). You can define an array of policy that will be executed in order.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants',
        policies: [
          'plugins::users-permissions.isAuthenticated',
          'isOwner', // will try to find the policy declared in the same api as this schema file.
          'application::otherapi.isMember',
          'global::logging',
        ],
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        policies: ['plugins::users-permissions.isAuthenticated', 'global::logging'],
      },
    },
  },
};
```

In this example, the policy `isAuthenticated` located in the `users-permissions` plugin will be executed first. Then, the `isOwner` policy located in the `Restaurant` API `./api/restaurant/config/policies/isOwner.js`. Next, it will execute the `logging` policy located in `./config/policies/logging.js`. Finally, the resolver will be executed.

::: tip
There is no custom resolver in that case, so it will execute the default resolver (Restaurant.find) provided by the Shadow CRUD feature.
:::

#### Link a query or mutation to a controller action

By default, the plugin will execute the actions located in the controllers that has been generated via the Content-Type Builder plugin or the CLI. For example, the query `restaurants` is going to execute the logic inside the `find` action in the `Restaurant.js` controller. It might happen that you want to execute another action or a custom logic for one of your query.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolver: 'application::restaurant.restaurant.findByChef',
      },
    },
    Mutation: {
      createRestaurant: {
        description: 'Create a new restaurant',
        resolver: 'application::restaurant.restaurant.customCreate',
      },
    },
  },
};
```

In this example, it will execute the `findByChef` action of the `Restaurant` controller. It also means that the resolver will apply on the `restaurants` query the permissions defined on the `findByChef` action (through the administration panel).

::: tip
The `obj` parameter is available via `ctx.params` and the `options` are available via `ctx.query` in the controller's action.
:::

The same process is also applied for the `createRestaurant` mutation. It will execute the `customCreate` action of the `Restaurant` controller.

::: tip
The `where` parameter is available via `ctx.params` and the `data` are available via `ctx.request.body` in the controller's action.
:::

#### Define a custom resolver

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolver: (obj, options, { context }) => {
          // You can return a raw JSON object or a promise.

          return [
            {
              name: 'My first blog restaurant',
              description: 'Whatever you want...',
            },
          ];
        },
      },
    },
    Mutation: {
      updateRestaurant: {
        description: 'Update an existing restaurant',
        resolver: async (obj, options, { context }) => {
          // The `where` and `data` parameters passed as arguments
          // of the GraphQL mutation are available via the `context` object.
          const where = context.params;
          const data = context.request.body;

          return await strapi.api.restaurant.services.restaurant.addRestaurant(data, where);
        },
      },
    },
  },
};
```

You can also execute a custom logic like above. However, the roles and permissions layers won't work.

#### Apply permissions on a query

It might happen that you want to apply our permissions layer on a query. That's why, we created the `resolverOf` attribute. This attribute defines which are the permissions that should be applied to this resolver. By targeting an action it means that you're able to edit permissions for this resolver directly from the administration panel.

```js
module.exports = {
  resolver: {
    Query: {
      restaurants: {
        description: 'Return a list of restaurants by chef',
        resolverOf: 'application::restaurant.restaurant.find', // Will apply the same policy on the custom resolver as the controller's action `find` located in `Restaurant.js`.
        resolver: (obj, options, context) => {
          // You can return a raw JSON object or a promise.

          return [
            {
              name: 'My first blog restaurant',
              description: 'Whatever you want...',
            },
          ];
        },
      },
    },
    Mutation: {
      updateRestaurant: {
        description: 'Update an existing restaurant',
        resolverOf: 'application::restaurant.restaurant.update', // Will apply the same policy on the custom resolver than the controller's action `update` located in `Restaurant.js`.
        resolver: async (obj, options, { context }) => {
          const where = context.params;
          const data = context.request.body;

          return await strapi.api.restaurant.services.restaurant.addRestaurant(data, where);
        },
      },
    },
  },
};
```

#### Disable a query or a type

To do that, we need to use the `schema.graphql.js` like below:

```js
module.exports = {
  type: {
    Restaurant: false, // The Restaurant type won't be "queryable" or "mutable".
  },
  resolver: {
    Query: {
      restaurants: false, // The `restaurants` query will no longer be in the GraphQL schema.
    },
    Mutation: {
      createRestaurant: false,
      deletePOst: false,
    },
  },
};
```

### FAQ

**How are the types name defined?**

The type name is the global ID of the model. You can find the global ID of a model like that `strapi.models[xxx].globalId` or `strapi.plugins[xxx].models[yyy].globalId`.

**Where should I put the field description and deprecated reason?**

We recommend putting the field description and deprecated reason in the model. Right now, the GraphQL plugin is the only which uses these fields. Another plugin could use this description in the future as well. However, sometimes you don't have the choice, especially when you're defining a custom type.

::: tip
It's not a bad practice to put the description and deprecated attribute in the `schema.graphql.js`, though.
:::

**Why are the "createdAt" and "updatedAt" field added to my type?**

The plugin detects if the `timestamps` option is set to `true` in the model. By default, when you generate an API this option is checked. Set it to `false` in your model to remove these fields.


<!--- BEGINNING OF UPLOAD PLUGIN --->

## Upload plugin

Thanks to the plugin `Upload`, you can upload any kind of file on your server or external providers such as **AWS S3**.

### Configuration

Currently the Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of **200MB**.

The library we use is [`koa-body`](https://github.com/dlau/koa-body), and it uses the [`node-formidable`](https://github.com/felixge/node-formidable) library to process files.

You can pass configuration to the middleware directly by setting it in the `parser` middleware configuration in `config/middleware.js`:

```js
module.exports = {
  //...
  settings: {
    parser: {
      enabled: true,
      multipart: true,
      formidable: {
        maxFileSize: 200 * 1024 * 1024 // Defaults to 200mb
      }
    }
  },
  //...
};
```

### Endpoints

<style lang="stylus">
#endpoint-table
  table
    display table
    width 100%

  tr
    border none
    &:nth-child(2n)
      background-color white

  tbody
    tr
      border-top 1px solid #dfe2e5

  th, td
    border none
    padding 1.2em 1em
    border-right 1px solid #dfe2e5
    &:last-child
      border-right none
</style>

<div id="endpoint-table">

| Method | Path              | Description         |
| :----- | :---------------- | :------------------ |
| GET    | /upload/files     | Get a list of files |
| GET    | /upload/files/:id | Get a specific file |
| POST   | /upload           | Upload files        |
| DELETE | /upload/files/:id | Delete a file       |

</div>

### Upload files

To upload files into your application.

#### Parameters

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.

#### Code example

```html
<form>
  <!-- Can be multiple files -->
  <input type="file" name="files" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    request.open('POST', '/upload');

    request.send(new FormData(formElement));
  });
</script>
```

::: warning
You have to send FormData in your request body
:::

### Upload files related to an entry

To upload files that will be linked to a specific entry.

#### Request parameters

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.
- `path` (optional): The folder where the file(s) will be uploaded to (only supported on strapi-provider-upload-aws-s3).
- `refId`: The ID of the entry which the file(s) will be linked to.
- `ref`: The name of the model which the file(s) will be linked to (see more below).
- `source` (optional): The name of the plugin where the model is located.
- `field`: The field of the entry which the file(s) will be precisely linked to.

#### Examples

The `Restaurant` model attributes:

```json
"attributes": {
  "name": {
    "type": "string"
  },
  "cover": {
    "model": "file",
    "via": "related",
    "plugin": "upload"
  }
}
```

Code

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="file" name="files" />
  <input type="text" name="ref" value="restaurant" />
  <input type="text" name="refId" value="5c126648c7415f0c0ef1bccd" />
  <input type="text" name="field" value="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    request.open('POST', '/upload');

    request.send(new FormData(formElement));
  });
</script>
```

::: warning
You have to send FormData in your request body
:::

### Upload file during entry creation

You can also add files during your entry creation.

#### Examples

The `Restaurant` model attributes:

```json
"attributes": {
  "name": {
    "type": "string"
  },
  "cover": {
    "model": "file",
    "via": "related",
    "plugin": "upload"
  }
}
```

Code

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="text" name="name" />
  <input type="file" name="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    const formData = new FormData();

    const formElements = formElement.elements;

    const data = {};

    for (let i = 0; i < formElements.length; i++) {
      const currentElement = formElements[i];
      if (!['submit', 'file'].includes(currentElement.type)) {
        data[currentElement.name] = currentElement.value;
      } else if (currentElement.type === 'file') {
        if (currentElement.files.length === 1) {
          const file = currentElement.files[0];
          formData.append(`files.${currentElement.name}`, file, file.name);
        } else {
          for (let i = 0; i < currentElement.files.length; i++) {
            const file = currentElement.files[i];

            formData.append(`files.${currentElement.name}`, file, file.name);
          }
        }
      }
    }

    formData.append('data', JSON.stringify(data));

    request.open('POST', `${HOST}/restaurants`);

    request.send(formData);
  });
</script>
```

Your entry data has to be contained in a `data` key. You have to `JSON.stringify` your data object.

And for your files, they have to be prefixed by `files`.
Example here with cover attribute `files.cover`.

::: tip
If you want to upload files for a component, you will have to specify the index of the item you want to add the file to.
Example `files.my_component_name[the_index].attribute_name`
:::

::: warning
You have to send FormData in your request body
:::

### Models definition

Adding a file attribute to a model (or the model of another plugin) is like adding a new association.

In the first example below, you will be able to upload and attach one file to the avatar attribute.

**Path —** `User.settings.json`.

```json
{
  "connection": "default",
  "attributes": {
    "pseudo": {
      "type": "string",
      "required": true
    },
    "email": {
      "type": "email",
      "required": true,
      "unique": true
    },
    "avatar": {
      "model": "file",
      "via": "related",
      "plugin": "upload"
    }
  }
}
```

In our second example, you can upload and attach multiple pictures to the restaurant.

**Path —** `Restaurant.settings.json`.

```json
{
  "connection": "default",
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "convers": {
      "collection": "file",
      "via": "related",
      "plugin": "upload"
    }
  }
}
```

### Using a provider

By default Strapi provides a provider that uploads files to a local directory. You might want to upload your files to another provider like AWS S3.

You can check all the available providers developed by the community on npmjs.org - [Providers list](https://www.npmjs.com/search?q=strapi-provider-upload-&ranking=popularity)

To install a new provider run:

:::: tabs

::: tab yarn

```
yarn add strapi-provider-upload-aws-s3
```

:::

::: tab npm

```
npm install strapi-provider-upload-aws-s3 --save
```

:::

::::

#### Using scoped packages as providers

If your package name is [scoped](https://docs.npmjs.com/about-scopes) (for example `@username/strapi-provider-upload-aws2`) you need to take an extra step by aliasing it in `package.json`. Go to the `dependencies` section and change the provider line to look like this:

`"strapi-provider-upload-aws2": "npm:@username/strapi-provider-upload-aws2@0.1.9"`

The string after the last `@` represents your desired [semver](https://docs.npmjs.com/about-semantic-versioning) version range.

#### Enabling the provider

To enable the provider, create or edit the file at `./config/plugins.js`

```js
module.exports = ({ env }) => ({
  upload: {
    provider: 'aws-s3',
    providerOptions: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_ACCESS_SECRET'),
      region: 'aws-region',
      params: {
        Bucket: 'my-bucket',
      },
    },
  },
});
```

Make sure to read the provider's `README` to know what are the possible parameters.

#### Configuration per environment

When configuring your upload provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `./config/env/{env}/plugins.js` configuration file and it will be used to overwrite the one in the default configuration.

### Create providers

You can create a Node.js module to implement a custom provider. Read the official documentation [here](https://docs.npmjs.com/creating-node-js-modules).

To work with strapi, your provider name must match the pattern `strapi-provider-upload-{provider-name}`.

Your provider need to export the following interface:

```js
module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
      },
      delete(file) {
        // delete the file in the provider
      },
    };
  },
};
```

You can then publish it to make it available to the community.

#### Create a local provider

If you want to create your own provider without publishing it on **npm** you can follow these steps:

- Create a `./providers/strapi-provider-upload-{provider-name}` folder in your root application folder.
- Create your provider as explained in the [documentation](#create-providers) above.
- Then update your `package.json` to link your `strapi-provider-upload-{provider-name}` dependency to point to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-upload-{provider-name}": "file:providers/strapi-provider-upload-{provider-name}"
    ...
  }
}
```

- Finally, run `yarn install` or `npm install` to install your new custom provider.



<!--- BEGINNING OF USERS AND PERMISSIONS PLUGIN --->

## Users & Permissions plugin

This plugin provides a way to protect your API with a full authentication process based on JWT. This plugin comes also with an ACL strategy that allows you to manage the permissions between the groups of users.

To access the plugin admin panel, click on the **Settings** link in the left menu and then everything will be under the **USERS & PERMISSIONS PLUGIN** section.

When this plugin is installed, it adds an access layer on your application.
The plugin uses [`jwt token`](https://en.wikipedia.org/wiki/JSON_Web_Token) to authenticate users.

Each time an API request is sent, the server checks if an `Authorization` header is present and verifies if the user making the request has access to the resource.

To do so, your JWT contains your user ID and we are able to match the group your user is in and at the end to know if the group allows access to the route.

### Manage role permissions

#### Public role

This role is used when you receive a request that doesn't have an `Authorization` header.
If you allow some permissions in this role, everybody will be able to access the endpoints you selected.
This is common practice to select `find` / `findOne` endpoints when you want your front-end application to access all the content without developing user authentication and authorization.

#### Authenticated role

This is the default role that is given to every **new user** if no role is provided at creation. In this role you will be able to define routes that a user can access.

#### Permissions management

By clicking on the **Role** name, you will be able to see all functions available in your application (and these functions are related to a specific route)

If you check a function name, it makes this route accessible by the current role you are editing.
On the right sidebar you will be able to see the URL related to this function.

#### Update the default role

When you create a user without a role or if you use the `/auth/local/register` route, the `authenticated` role is given to the user.

To change the default role, go to the `Advanced settings` tab and update the `Default role for authenticated users` option.

### Authentication

#### Token usage

A jwt token may be used for making permission-restricted API requests. To make an API request as a user, place the jwt token into an `Authorization` header of the GET request. A request without a token, will assume the `public` role permissions by default. Modify the permissions of each user's role in admin dashboard. Authentication failures return a 401 (unauthorized) error.

##### Usage

- The `token` variable is the `data.jwt` received when logging in or registering.

```js
import axios from 'axios';

const token = 'YOUR_TOKEN_HERE';

// Request API.
axios
  .get('http://localhost:1337/posts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(response => {
    // Handle success.
    console.log('Data: ', response.data);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

#### JWT configuration

You can configure option for the JWT generation by creating `extensions/users-permissions/config/security.json` file.
We are using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to generate the JWT.

Available options:

- `expiresIn`: expressed in seconds or a string describing a time span zeit/ms.<br>
  Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

**Path —** `extensions/users-permissions/config/security.json`

```json
{
  "jwt": {
    "expiresIn": "1d"
  }
}
```

#### Registration

Creates a new user in the database with a default role as 'registered'.

##### Usage

```js
import axios from 'axios';

// Request API.
// Add your own code here to customize or restrict how the public can register new users.
axios
  .post('http://localhost:1337/auth/local/register', {
    username: 'Strapi user',
    email: 'user@strapi.io',
    password: 'strapiPassword',
  })
  .then(response => {
    // Handle success.
    console.log('Well done!');
    console.log('User profile', response.data.user);
    console.log('User token', response.data.jwt);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

#### Login

Submit the user's identifier and password credentials for authentication. When the authentication is successful, the response data returned will have the user's information along with a jwt authentication token.

##### Local

- The `identifier` param can either be an **email** or a **username**.

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/auth/local', {
    identifier: 'user@strapi.io',
    password: 'strapiPassword',
  })
  .then(response => {
    // Handle success.
    console.log('Well done!');
    console.log('User profile', response.data.user);
    console.log('User token', response.data.jwt);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

#### Providers

Thanks to [Grant](https://github.com/simov/grant) and [Purest](https://github.com/simov/purest), you can easily use OAuth and OAuth2 providers to enable authentication in your application.

For better understanding, you may find as follows the description of the login flow. To simplify the explanation, we used `github` as the provider but it works the same for the other providers.

##### Understanding the login flow

Let's say that strapi's backend is located at: strapi.website.com.
Let's say that your app frontend is located at: website.com.

1. The user goes on your frontend app (`https://website.com`) and click on your button `connect with Github`.
2. The frontend redirect the tab to the backend URL: `https://strapi.website.com/connect/github`.
3. The backend redirects the tab to the GitHub login page where the user logs in.
4. Once done, Github redirects the tab to the backend URL:`https://strapi.website.com/connect/github/callback?code=abcdef`.
5. The backend uses the given `code` to get from Github an `access_token` that can be used for a period of time to make authorized requests to Github to get the user info (the email of the user of example).
6. Then, the backend redirects the tab to the url of your choice with the param `access_token` (example: `http://website.com/connect/github/redirect?access_token=eyfvg`)
7. The frontend (`http://website.com/connect/github/redirect`) calls the backend with `https://strapi.website.com/auth/github/callback?access_token=eyfvg` that returns the strapi user profile with its `jwt`. <br> (Under the hood, the backend asks Github for the user's profile and a match is done on Github user's email address and Strapi user's email address)
8. The frontend now possesses the user's `jwt`, with means the user is connected and the frontend can make authenticated requests to the backend!

An example of a frontend app that handles this flow can be found here: [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react).

##### Setting up the server url

Before setting up a provider, you need to specify the absolute url of your backend in `server.js`.

**example -** `config/server.js`

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', 'http://localhost:1337'),
});
```

:::tip
Later on you will give this url to your provider. <br> For development, some providers accept the use of localhost urls but many don't. In this case we recommand to use [ngrok](https://ngrok.com/docs) (`ngrok http 1337`) that will make a proxy tunnel from a url it created to your localhost url (ex: `url: env('', 'https://5299e8514242.ngrok.io'),`).
:::

##### Setting up the provider - examples

Instead of a generic explanation, for better understanding, we decided to show an example for each provider.

In the following examples, the frontend app will be the [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react). <br>
It (the frontend app) will be running on `http://localhost:3000`. <br>
Strapi (the backend) will be running on `http://localhost:1337`.

:::: tabs

::: tab GitHub

##### Using ngrok

Github doesn't accept `localhost` urls. <br>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

##### Github configuration

- Visit the OAuth Apps list page [https://github.com/settings/developers](https://github.com/settings/developers)
- Click on **New OAuth App** button
- Fill the information (replace with your own ngrok url):
  - **Application name**: Strapi GitHub auth
  - **Homepage URL**: `https://65e60559.ngrok.io`
  - **Application description**: Strapi provider auth description
  - **Authorization callback URL**: `https://65e60559.ngrok.io/connect/github/callback`

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **GitHub** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 53de5258f8472c140917
  - **Client Secret**: fb9d0fe1d345d9ac7f83d7a1e646b37c554dae8b
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/github/redirect`

:::

::: tab Facebook

##### Using ngrok

Facebook doesn't accept `localhost` urls. <br>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

##### Facebook configuration

- Visit the Developer Apps list page <br> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup a **Facebook Login** product
- Click on the **PRODUCTS > Facebook login > Settings** link in the left menu
- Fill the information and save (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/connect/facebook/callback`
- Then, click on **Settings** in the left menu
- Then on **Basic** link
- You should see your Application ID and secret, save them for later

#### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Facebook** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 2408954435875229
  - **Client Secret**: 4fe04b740b69f31ea410b9391ff3b5b0
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/facebook/redirect`

:::

::: tab Google

##### Using ngrok

Google accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### Google configuration

- Visit the Google Developer Console <br> [https://console.developers.google.com/](https://console.developers.google.com/)
- Click on the **Select a project** dropdown in the top menu
- Then click **NEW PROJECT** button
- Fill the **Project name** input and create

Wait a few seconds while the application is created.

- On the project dropdown, select your new project
- Click on **Go to APIs overview** under the **APIs** card
- Then click on the **Credentials** link in the left menu
- Click on **OAuth consent screen** button
- Choose **External** and click on **create**
- Fill the **Application name** and save
- Then click on **Create credentials** button
- Choose **OAuth client ID** option
- Fill the information:
  - **Name**: `Strapi Auth`
  - **Authorized redirect URIs**: `http://localhost:1337/connect/google/callback`
- Click on **OAuth 2.0 Client IDs** name of the client you just created
- You should see your Application ID and secret, save them for later

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Google** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 226437944084-o2mojv5i4lfnng9q8kq3jkf5v03avemk.apps.googleusercontent.com
  - **Client Secret**: aiTbMoiuJQflSBy6uQrfgsni
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/google/redirect`

:::

::: tab AWS Cognito

##### Using ngrok

AWS Cognito accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### AWS Cognito configuration

- Visit the AWS Management Console <br> [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
- If needed, select your **Region** in the top right corner next to the Support dropdown
- Select the **Services** dropdown in the top left corner
- Click on **Cognito** in the `Security, Identity & Compliance` section
- Then click on the **Manage User Pools** button
- If applicable either create or use an existing user pool. You will find hereafter a tutorial to create a User Pool <br> [https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html](https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html)
- Go to the **App clients** section in your cognito user pool and create a new client with the name `Strapi Auth` and set all the parameters and then click on **Create app client**
- You should now have an **App client id** and by clicking on the button **Show Details** you will be able to see the **App client secret**. Do copy those two values **App client id** and **App client secret** somewhere for later use when configuring the AWS Cognito provider in Strapi.
- Go to the **App integration section** and click on **App client settings**
- Look for your app client named `Strapi Auth` and enable Cognito User Pool by checking it in the **Enabled Identity Providers** section of your newly created App client
- Fill in your callback URL and Sign out URL with the value `http://localhost:1337/connect/cognito/callback` or the one provided by your AWS Cognito provider in Strapi
- In the **Oauth 2.0** section select `Authorization code grant` and `Implicit grant` for the **Allowed OAuth Flows** and select `email`, `openid` and `profile` for the **Allowed OAuth Scopes**
- You can now click on **Save changes** and if you have already configured your domain name then you should be able to see a link to the **Launch Hosted UI**. You can click on it in order to display the AWS Cognito login page. In case you haven't yet configured your domain name, use the link **Choose domain name** at the bottom right of the page in order to configure your domain name. On that page you will have an `Amazon Cognito Domain` section where a `Domain prefix` is already setup. Type a domain prefix to use for the sign-up and sign-in pages that are hosted by Amazon Cognito, this domain prefix together with the `.auth.YOUR_REGION.amazoncognito.com` will be the **Host URI (Subdomain)** value for your strapi configuration later on.

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Cognito** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: fill in the **App client id** (`5bd7a786qdupjmi0b3s10vegdt`)
  - **Client Secret**: fill in the **App client secret** (`19c5c78dsfsdfssfsdfhpdb4nkpb145vesdfdsfsffgh7vwd6g45jlipbpb`)
  - **Host URI (Subdomain)**: fill in the URL value that you copied earlier (`myapp67b50345-67b50b17-local.auth.eu-central-1.amazoncognito.com`)
  - **The redirect URL to your front-end app**: if you are using strapi react-login [https://github.com/strapi/strapi-examples/tree/master/login-react/](https://github.com/strapi/strapi-examples/tree/master/login-react/) use `http://localhost:3000/connect/cognito/redirect` but if you do not yet have a front-end app to test your Cognito configuration you can then use the following URL `http://localhost:1337/auth/cognito/callback`

:::

::: tab Twitter

##### Using ngrok

Twitter doesn't accept `localhost` urls. <br>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

##### Twitter configuration

- Visit the Apps list page <br> [https://developer.twitter.com/en/apps](https://developer.twitter.com/en/apps)
- Click on **Create an app** button
- Fill the information (replace with your own ngrok url):
  - **App name**: Strapi Twitter auth
  - **Application description**: This is a demo app for Strapi auth
  - **Tell us how this app will be used**: - here write a message enough long -
- At the end of the process you should see your Application ID and secret, save them for later
- Go to you app setting and click on edit **Authentication settings**
- Enable **3rd party authentication** AND **Request email address from users**
- Fill the information (replace with your own ngrok url):
  - **Callback URLs**: `https://65e60559.ngrok.io/connect/twitter/callback`
  - **Website URL**: `https://65e60559.ngrok.io`
  - **Privacy policy**: `https://d73e70e88872.ngrok.io`
  - **Terms of service**: `https://d73e70e88872.ngrok.io`

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Twitter** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: yfN4ycGGmKXiS1njtIYxuN5IH
  - **Client Secret**: Nag1en8S4VwqurBvlW5OaFyKlzqrXFeyWhph6CZlpGA2V3VR3T
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitter/redirect`

:::

::: tab Discord

##### Using ngrok

Discord accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### Discord configuration

- Visit the Apps list page on the developer portal <br> [https://discordapp.com/developers/applications/](https://discordapp.com/developers/applications/)
- Click on **New application** button
- Fill the **name** and create
- Click on **OAuth2** in the left menu
- And click on **Add redirect** button
- Fill the **Redirect** input with `http://localhost:1337/connect/discord/callback` URL and save
- Click on **General information** in the left menu
- You should see your Application ID and secret, save them for later

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Discord** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 665118465148846081
  - **Client Secret**: iJbr7mkyqyut-J2hGvvSDch_5Dw5U77J
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/discord/redirect`

:::

::: tab Twitch

##### Using ngrok

Discord accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### Twitch configuration

- Visit the Apps list page on the developer console <br> [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
- Click on **Register Your Application** button
- Fill the information:
  - **Name**: Strapi auth
  - **OAuth Redirect URLs**: `http://localhost:1337/connect/twitch/callback`
  - **Category**: Choose a category
- Click on **Manage** button of your new app
- Generate a new **Client Secret** with the **New Secret** button
- You should see your Application ID and secret, save them for later

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Twitch** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: amuy279g8wt68qlht3u4gek4oykh5j
  - **Client Secret**: dapssh10uo97gg2l25qufr8wen3yr6
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitch/redirect`

:::

::: tab Instagram

##### Using ngrok

Facebook doesn't accept `localhost` urls. <br>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

##### Instagram configuration

- Visit the Developer Apps list page <br> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup an **Instagram** product
- Click on the **PRODUCTS > Instagram > Basic Display** link in the left menu
- Then click on the **Create new application** button (and valid the modal)
- Fill the information (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/connect/instagram/callback`
  - **Deauthorize**: `https://65e60559.ngrok.io`
  - **Data Deletion Requests**: `https://65e60559.ngrok.io`
- On the **App Review for Instagram Basic Display** click on **Add to submission** for **instagram_graph_user_profile**.
- You should see your Application ID and secret, save them for later

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Instagram** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 563883201184965
  - **Client Secret**: f5ba10a7dd78c2410ab6b8a35ab28226
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/instagram/redirect`

:::

::: tab VK

##### Using ngrok

Discord accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### VK configuration

- Visit the Apps list page <br> [https://vk.com/apps?act=manage](https://vk.com/apps?act=manage)
- Click on **Create app** button
- Fill the information:
  - **Title**: Strapi auth
  - **Platform**: Choose **Website** option
  - **Website address**: `http://localhost:1337`
  - **Base domain**: `localhost`
- Click on the **Settings** link in the left menu
- Click on the **Open API** link to enable this option
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/connect/vk/callback`

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **VK** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 7276416
  - **Client Secret**: cFBUSghLXGuxqnCyw1N3
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/vk/redirect`

:::

::: tab LinkedIn

##### Using ngrok

LinkedIn accepts the `localhost` urls. <br>
The use of `ngrok` is not needed.

##### LinkedIn configuration

- Visit the Apps list page <br> [https://www.linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
- Click on **Create app** button
- Fill the information:
  - **App name**: Strapi auth
  - **LinkedIn Page**: Enter a LinkedIn page name to associate with the app or click **Create a new LinkedIn Page** to create a new one
  - **App Logo**: Upload a square image that is at least 100x100 pixels.
- Click on the **Create app** to create the app
- On the app page click on **Auth** tab
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/connect/linkedin/callback`
- On the app page click on **Products** tab.
- Select `Sign In with LinkedIn` from the product list to enable it.

##### Strapi configuration

- Visit the User Permissions provider settings page <br> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **LinkedIn** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 84witsxk641rlv
  - **Client Secret**: HdXO7a7mkrU5a6WN
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/linkedin/redirect`

:::

::::

Your configuration is done.
Launch the backend and the [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react), go to `http://localhost:3000` and try to connect to the provider your configured. It should work 🎉

##### What you have to do in your frontend

Once you have configured strapi and the provider, in your frontend app you have to :

- Create a button that links to `GET STRAPI_BACKEND_URL/connect/${provider}` (ex: `https://strapi.mywebsite/connect/github`).
- Create a frontend route like `FRONTEND_URL/connect/${provider}/redirect` that have to handle the `access_token` param and that have to request `STRAPI_BACKEND_URL/auth/${provider}/callback` with the `access_token` param. <br >
  The JSON request response will be `{ "jwt": "...", "user": {...} }`.

Now you can make authenticated requests 🎉 More info here: [token usage](#token-usage).

:::warning Troubleshooting

- **Error 429**: It's most likely because your login flow fell into a loop. To make new requests to the backend, you need to wait a few minutes or restart the backend.
- **Grant: missing session or misconfigured provider**: It may be du to many things.
  - **The redirect url can't be built**: Make sure you have set the backend url in `config/server.js`: [Setting up the server url](#setting-up-the-server-url)
  - **A session/cookie/cache problem**: You can try again in a private tab.
  - **The incorrect use of a domain with ngrok**: Check your urls and make sure that you use the ngrok url instead of `http://localhost:1337`. Don't forget to check the backend url set in the example app at `src/config.js`.
- **You can't access your admin panel**: It's most likely because you built it with the backend url set with a ngrok url and you stopped/restarted ngrok. You need to replace the backend url with the new ngrok url and run `yarn build` or `npm run build` again.
  :::

#### Forgotten & reset password

**Can only be used for users registered using the email provider.**

The flow was thought this way:

1. The user goes to your **forgotten password page**
2. The user enters his/her email address
3. Your forgotten password page sends a request to the backend to send an email with the reset password link to the user
4. The user receives the email, and clicks on the special link
5. The link redirects the user to your **reset password page**
6. The user enters his/her new password
7. The **reset password page** sends a request to the backend with the new password
8. If the request contains the code contained in the link at step 3., the password is updated
9. The user can log in with the new password

In the following section we will detail steps 3. and 7..

##### Forgotten password: ask for the reset password link

This action sends an email to a user with the link to your own reset password page.
The link will be enriched with the url param `code` that is needed for the [reset password](#reset-password) at step 7..

First, you must specify the url to your reset password page in the admin panel: **Settings > USERS & PERMISSIONS PLUGIN > Advanced Settings > Reset Password Page**.

Then, your **forgotten password page** has to make the following request to your backend.

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/auth/forgot-password', {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

##### Reset Password: send the new password

This action will update the user password.
Also works with the [GraphQL Plugin](./graphql.md), with the `resetPassword` mutation.

Your **reset password page** has to make the following request to your backend.

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/auth/reset-password', {
    code: 'privateCode', // code contained in the reset link of step 3.
    password: 'userNewPassword',
    passwordConfirmation: 'userNewPassword',
  })
  .then(response => {
    console.log("Your user's password has been reset.");
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

Congrats, you're done!

#### Email validation

:::tip NOTE
In production, make sure the `url` config property is set. Otherwise the validation link will redirect to `localhost`. More info on the config [here](../concepts/configurations.md#server).
:::

After having registered, if you have set **Enable email confirmation** to **ON**, the user will receive a confirmation link by email. The user has to click on it to validate his/her registration.

_Example of the confirmation link:_ `https://yourwebsite.com/auth/email-confirmation?confirmation=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNTk0OTgxMTE3LCJleHAiOjE1OTc1NzMxMTd9.0WeB-mvuguMyr4eY8CypTZDkunR--vZYzZH6h6sChFg`

If needed, you can re-send the confirmation email by making the following request.

```js
import axios from 'axios';

// Request API.
axios
  .post(`http://localhost:1337/auth/send-email-confirmation`, {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.error('An error occurred:', error.response);
  });
```

### User object in Strapi context

The `user` object is available to successfully authenticated requests.

#### Usage

- The authenticated `user` object is a property of `ctx.state`.

```js
create: async ctx => {
  const { id } = ctx.state.user;

  const depositObj = {
    ...ctx.request.body,
    depositor: id,
  };

  const data = await strapi.services.deposit.add(depositObj);

  // Send 201 `created`
  ctx.created(data);
};
```

### Adding a new provider (to your project)

**[Grant](https://github.com/simov/grant) supplies configuration for a number of commonly used OAuth providers. [Custom](https://github.com/simov/grant#misc-custom-providers) providers are also supported**. <br> You can view and try out the 200+ supported providers here: [OAuth Playground](https://grant.outofindex.com/).

#### Prepare your files

To add a new provider on Strapi, you will need to perform changes onto the following files:

```
extensions/users-permissions/services/Providers.js
extensions/users-permissions/config/functions/bootstrap.js
```

If these files don't exist you will need to copy from your `node_modules` or the Strapi mono-repo. You can see [plugin extensions](../concepts/customization.md#plugin-extensions) for more information on how it works.

We will go step by step.

#### Configure your Provider Request

Configure the new provider in the `Provider.js` file at the `getProfile` function.

The `getProfile` takes three params:

- **provider**: The name of the used provider as a string.
- **query**: The query is the result of the provider callback.
- **callback**: The callback function who will continue the internal Strapi login logic.

Here is an example that uses the `discord` provider.

#### Configure your oauth generic information

```js
case 'discord': {
  const discord = new Purest({
    provider: 'discord',
    config: {
      'discord': {
        'https://discordapp.com/api/': {
          '__domain': {
            'auth': {
              'auth': {'bearer': '[0]'}
            }
          },
          '{endpoint}': {
            '__path': {
              'alias': '__default'
            }
          }
        }
      }
    }
  });
}
```

This code creates a `Purest` object that gives us a generic way to interact with the provider's REST API.

For more specs on using the `Purest` module, please refer to the [Official Purest Documentation](https://github.com/simov/purest)

You may also want to take a look onto the numerous already made configurations [here](https://github.com/simov/purest-providers/blob/master/config/providers.json).

#### Retrieve your user's information:

For our discord provider it will look like:

```js
  discord.query().get('users/@me').auth(access_token).request((err, res, body) => {
    if (err) {
      callback(err);
    } else {
      // Combine username and discriminator because discord username is not unique
      const username = `${body.username}#${body.discriminator}`;
      callback(null, {
        username,
        email: body.email
      });
    }
  });
  break;
}
```

Here is the next part of our switch. Now that we have properly configured our provider, we want to use it to retrieve
user information.

Here you see the real power of `purest`, you can simply make a get request on the desired URL, using the `access_token`
from the `query` parameter to authenticate.

That way, you should be able to retrieve the user info you need.

Now, you can simply call the `callback` function with the username and email of your user. That way, Strapi will be able
to retrieve your user from the database and log you in.

#### Configure the new provider model onto database

Now, we need to configure our 'model' for our new provider. That way, our settings can be stored in the database, and
managed from the admin panel.

Open the file `packages/strapi-plugin-users-permissions/config/functions/bootstrap.js`

Add the fields your provider needs into the `grantConfig` object.
For our discord provider it will look like:

```js
discord: {
  enabled: false,  // make this provider disabled by default
  icon: 'comments', // The icon to use on the UI
  key: '',  // our provider app id (leave it blank, you will fill it with the content manager)
  secret: '', // our provider secret key (leave it blank, you will fill it with the content manager)
  callback: '/auth/discord/callback', // the callback endpoint of our provider
  scope: [  // the scope that we need from our user to retrieve information
    'identify',
    'email'
  ]
},
```

<!-- #### Tests -->
<!-- TODO Add documentation about how to configure unit test for the new provider -->

### Templating emails

By default, this plugin comes with only two templates (reset password and email address confirmation) at the moment. More templates will come later. The templates use Lodash's template() method to populate the variables.

You can update these templates under **Plugins** > **Roles & Permissions** > **Email Templates** tab in the admin panel.

#### Reset Password

- `USER` (object)
  - `username`
  - `email`
- `TOKEN` corresponds to the token generated to be able to reset the password.
- `URL` is the link where the user will be redirected after clicking on it in the email.

#### Email address confirmation

- `USER` (object)
  - `username`
  - `email`
- `CODE` corresponds to the CODE generated to be able confirm the user email.
- `URL` is the Strapi backend URL that confirms the code (by default `/auth/email-confirmation`).

### Security configuration

JWT tokens can be verified and trusted because the information is digitally signed. To sign a token a _secret_ is required. By default Strapi generates one that is stored in `./extensions/users-permissions/config/jwt.js`. This is useful during development but for security reasons it is **recommended** to set a custom token via an environment variable `JWT_SECRET` when deploying to production.

By default you can set a `JWT_SECRET` environment variable and it will be used as secret. If you want to use another variable you can update the configuration file.

**Path -** `./extensions/users-permissions/config/jwt.js`.

```js
module.exports = {
  jwtSecret: process.env.SOME_ENV_VAR,
};
```

::: tip
You can learn more on configuration in the documentation [here](../concepts/configurations.md)
:::
