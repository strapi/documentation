# Project structure

By default, the structure of your Strapi project looks as shown below:

- `/.cache`: contains files used to build your admin panel.
- [`/admin`](/developer-docs/latest/development/admin-customization.md): _(optional)_ contains your admin customization files.
- `/api`: contains the business logic of your project split into sub-folders per API.
  - `**`
    - `/config`: contains the API's configurations ([`routes`](/developer-docs/latest/development/backend-customization.md#routing), [`policies`](/developer-docs/latest/development/backend-customization.md#policies), etc.).
    - [`/controllers`](/developer-docs/latest/development/backend-customization.md#controllers): contains the API's custom controllers.
    - [`/models`](/developer-docs/latest/development/backend-customization.md#models): contains the API's models.
    - [`/services`](/developer-docs/latest/development/backend-customization.md#services): contains the API's custom services.
- `/build`: contains your admin panel UI build.
- [`/config`](/developer-docs/latest/setup-deployment-guides/configurations.md)
  - [`/functions`](/developer-docs/latest/setup-deployment-guides/configurations.md#functions): contains lifecycle or generic functions of the project.
    - [`/responses`](/developer-docs/latest/development/backend-customization.md#requests-responses): contains custom responses.
      - `404.js`: contains a template for constructing your custom 404 message.
    - [`bootstrap.js`](/developer-docs/latest/setup-deployment-guides/configurations.md#bootstrap): contains the code executed at the application start.
    - [`cron.js`](/developer-docs/latest/setup-deployment-guides/configurations.md#cron-tasks): contains the cron tasks.
  - [`server.js`](/developer-docs/latest/setup-deployment-guides/configurations.md#server): contains the general configurations of the project.
  - [`database.js`](/developer-docs/latest/setup-deployment-guides/configurations.md#database): contains the database configurations of the project.
- `/extensions`: contains the files to extend installed plugins.
- [`/hooks`](/developer-docs/latest/setup-deployment-guides/configurations.md#hooks): contains the custom hooks of the project.
- [`/middlewares`](/developer-docs/latest/setup-deployment-guides/configurations.md#middlewares): contains the custom middlewares of the project.
- [`/plugins`](/developer-docs/latest/setup-deployment-guides/configurations.md#plugins): contains your local plugins.
- [`/public`](/developer-docs/latest/setup-deployment-guides/configurations.md#public-assets): contains the files accessible to the outside world.
- `/node_modules`: contains the npm packages used by the project.
