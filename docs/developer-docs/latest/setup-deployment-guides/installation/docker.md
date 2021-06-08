---
title: Install from Docker - Strapi Developer Documentation
description: Quickly create a Strapi application using our official Strapi Docker images.
---

# Installing using Docker

The following documentation will guide you through the installation of a new Strapi project using [Docker](https://www.docker.com/).

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

::: warning PREREQUISITES
The official Docker image for Strapi is needed for this installation. You will find the image in the [Docker Hub](https://hub.docker.com/r/strapi/strapi).
:::

## Creating a Strapi project with Docker

1. Create an empty folder.
2. In your empty folder, create a `docker-compose.yaml` file. It is where the new Strapi project will be created, and it defines the database and Strapi service to use.

    :::: tabs

    ::: tab SQLite

    ```yaml
    version: '3'
    services:
      strapi:
        image: strapi/strapi
        volumes:
          - ./app:/srv/app
        ports:
          - '1337:1337'
    ```

    :::

    ::: tab PostgreSQL

    ```yaml
    version: '3'
    services:
      strapi:
        image: strapi/strapi
        environment:
          DATABASE_CLIENT: postgres
          DATABASE_NAME: strapi
          DATABASE_HOST: postgres
          DATABASE_PORT: 5432
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi
        volumes:
          - ./app:/srv/app
        ports:
          - '1337:1337'
        depends_on:
          - postgres

      postgres:
        image: postgres
        environment:
          POSTGRES_DB: strapi
          POSTGRES_USER: strapi
          POSTGRES_PASSWORD: strapi
        volumes:
          - ./data:/var/lib/postgresql/data
    ```

    :::

    ::: tab MongoDB

    ```yaml
    version: '3'
    services:
      strapi:
        image: strapi/strapi
        environment:
          DATABASE_CLIENT: mongo
          DATABASE_NAME: strapi
          DATABASE_HOST: mongo
          DATABASE_PORT: 27017
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi
        volumes:
          - ./app:/srv/app
        ports:
          - '1337:1337'
        depends_on:
          - mongo

      mongo:
        image: mongo
        environment:
          MONGO_INITDB_DATABASE: strapi
          MONGO_INITDB_ROOT_USERNAME: strapi
          MONGO_INITDB_ROOT_PASSWORD: strapi
        volumes:
          - ./data:/data/db
    ```

    :::

    ::: tab MySQL

    ```yaml
    version: '3'
    services:
      strapi:
        image: strapi/strapi
        environment:
          DATABASE_CLIENT: mysql
          DATABASE_HOST: mysql
          DATABASE_PORT: 3306
          DATABASE_NAME: strapi
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi
          DATABASE_SSL: 'false'
        volumes:
          - ./app:/srv/app
        ports:
          - '1337:1337'
        depends_on:
          - mysql

      mysql:
        image: mysql
        command: mysqld --default-authentication-plugin=mysql_native_password
        volumes:
          - ./data:/var/lib/mysql
        environment:
          MYSQL_ROOT_PASSWORD: strapi
          MYSQL_DATABASE: strapi
          MYSQL_USER: strapi
          MYSQL_PASSWORD: strapi
    ```

    :::

    ::: tab MariaDB

    ```yaml
    version: '3'
    services:
      strapi:
        image: strapi/strapi
        environment:
          DATABASE_CLIENT: mysql
          DATABASE_HOST: mariadb
          DATABASE_PORT: 3306
          DATABASE_NAME: strapi
          DATABASE_USERNAME: strapi
          DATABASE_PASSWORD: strapi
          DATABASE_SSL: 'false'
        volumes:
          - ./app:/srv/app
        ports:
          - '1337:1337'
        depends_on:
          - mariadb

      mariadb:
        image: mariadb
        volumes:
          - ./data:/var/lib/mysql
        environment:
          MYSQL_ROOT_PASSWORD: strapi
          MYSQL_DATABASE: strapi
          MYSQL_USER: strapi
          MYSQL_PASSWORD: strapi
    ```

    :::

    ::::

3. Pull the latest images using the following command:

    ```
    docker-compose pull
    ```

## Running Strapi

To run your Strapi project created with Docker, use one of the following commands:

```bash
# Execute Docker image detaching the terminal
docker-compose up -d

# Execute Docker image without detaching the terminal
docker-compose up
```
