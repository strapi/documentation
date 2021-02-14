# Quick start

Strapi allows you to create local plugins that will work exactly the same as external ones. All your local plugins will be located in the `./plugins` folder of your application.

## Development Environment Setup

Create a development project

1. Create a new project `cd .. && strapi new myDevelopmentProject`.
2. `cd myDevelopmentProject && strapi develop` To start the Strapi project

## Plugin development Setup

In a new terminal window:

1. Generate a new plugin: `cd /path/to/myDevelopmentProject && strapi generate:plugin my-plugin`

::: tip NOTE
After you have successfully generated a plugin, you need to run `strapi build` which adds the new plugin to the admin panel. 
:::
