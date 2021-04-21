---
title: API Reference - Strapi Developer Documentation
description: Discover our concise reference documentation containing all the information to work with your Strapi API
---

# API reference

- strapi
  - [.admin](#strapi-admin)
  - [.api](#strapi-api)
  - [.app](#strapi-app)
  - [.config](#strapi-config)
  - [.controllers](#strapi-controllers)
  - [.hook](#strapi-hook)
  - [.load()](#strapi-load)
  - [.log](#strapi-log)
  - [.middleware](#strapi-middleware)
  - [.models](#strapi-models)
  - [.plugins](#strapi-plugins)
  - [.query()](#strapi-query)
  - [.reload()](#strapi-reload)
  - [.router](#strapi-router)
  - [.server](#strapi-server)
  - [.services](#strapi-services)
  - [.start()](#strapi-start)
  - [.stop()](#strapi-stop)

## strapi.admin

This object contains the controllers, models, services and configurations contained in the `strapi-admin` package.

## strapi.api

This object contains APIs contained in the `./api` folder.
And by using `strapi.api[:name]` you can access the controllers, services, the model definition and also the configurations of the `./api/:name` folder

## strapi.app

Returns the Koa instance.

## strapi.config

Returns an object that represents the configurations of the project. Every JavaScript or JSON file located in the `./config` folder will be parsed into the `strapi.config` object.

## strapi.controllers

Returns an object of the controllers which is available in the project. Every JavaScript file located in the `./api/**/controllers` folder will be parsed into the `strapi.controllers` object. Thanks to this object, you can access every controller's actions everywhere in the project.

::: tip
This object doesn't include the admin's controllers and plugin's controllers.
:::

## strapi.hook

Returns an object of the hooks available in the project. Every folder that follows this pattern `strapi-*` and located in the `./node_modules` or `/hooks` folder will be mounted into the `strapi.hook` object.

## strapi.load

Returns a function that parses the configurations, hooks, middlewares and APIs of your app. It also loads the middlewares and hooks with the previously loaded configurations. This method could be useful to update references available through the `strapi` global variable without having to restart the server. However, without restarting the server, the new configurations will not be taken in account.

## strapi.log

Returns the Logger (Pino) instance.

## strapi.middleware

Returns an object of the middlewares available in the project. Every folder in the `./middlewares` folder will be also mounted into the `strapi.middleware` object.

## strapi.models

Returns an object of models available in the project. Every JavaScript or JSON file located in the `./api/**/models` folders will be parsed into the `strapi.models` object. Also every `strapi.models.**` object is merged with the model's instance returned by the ORM (Mongoose, Bookshelf). It allows to call the ORM methods through the `strapi.models.**` object (ex: `strapi.models.users.find()`).

## strapi.plugins

Returns an object of plugins available within the project. Each plugin object contains the associated controllers, models, services and configurations.

## strapi.query

This utility function allows to bind models with query functions specific to each ORM (e.g: `mongoose` or `bookshelf`).
For more details, see the [Queries section](/developer-docs/latest/development/backend-customization.md#queries).

## strapi.reload

Returns a function that reloads the entire app (with downtime).

## strapi.router

Returns the Router (Joi router) instance.

## strapi.server

Returns the [`http.Server`](https://nodejs.org/api/http.md#http_class_http_server) instance.

## strapi.services

Returns an object of services available in the project. Every JavaScript file located in the `./api/**/services` folders will be parsed into the `strapi.services` object.

## strapi.start

Returns a function that loads the configurations, middlewares and hooks. Then, it executes the bootstrap file, freezes the global variable and listens the configured port.

## strapi.stop

Returns a function that shuts down the server and destroys the current connections.
