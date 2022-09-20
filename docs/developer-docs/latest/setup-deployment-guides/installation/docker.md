---
title: Custom Docker Container - Strapi Developer Docs
description: Quickly create a Docker container from a local project.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/docker.html
---

# Running Strapi in a Docker container

:::caution
Strapi does not build any official container images. The following instructions are provided as a courtesy to the community. If you have any questions, please reach out to the community on [Discord](https://discord.strapi.io).
:::

The following documentation will guide you through the process of building a custom [Docker](https://www.docker.com/) container with an existing Strapi project.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies). Containers are isolated from each other and bundle their own software, libraries and configuration files; they can communicate with each other through well-defined channels.

## Prerequisites

To follow the instructions below, the following will be needed:

- [Docker](https://www.docker.com/) installed on your machine
- [Supported version of Node.js](/developer-docs/latest/setup-deployment-guides/installation/cli.md#step-1-make-sure-requirements-are-met)
- An existing Strapi v4 project, or a new one created with [Strapi Quick Start](/developer-docs/latest/getting-started/quick-start.md)
- (Optional) [Yarn](https://yarnpkg.com/) installed on your machine
- (Optional) [Docker Compose](https://docs.docker.com/compose/) installed on your machine

## Development and/or Staging environments

For working with Strapi locally on your host machine (i.e. development and/or staging environments), you can use the [Dockerfile](https://docs.docker.com/engine/reference/builder/) and if needed the [docker-compose.yml](https://docs.docker.com/compose/compose-file/) can also be used to start up a database container.

Both of these methods will require an existing Strapi project, or a new one created with [Strapi Quick Start](/developer-docs/latest/getting-started/quick-start.md).

### Dockerfile

The following `Dockerfile` can be used to build a non-production Docker image for a Strapi project.

::: note
If you are using docker-compose, you can skip setting the environment variables manually, as they will be set in the `docker-compose.yml` file or a `.env` file.
:::

There are several environment variables that are required to be set in order to run Strapi in a Docker container, there are also several [optional variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md#strapi-s-environment-variables) you can also set.

The following environment variables are required:

| Variable name | Description |
|---------------|-------------|
| `NODE_ENV` | The environment in which the application is running. |
| `DATABASE_CLIENT` | The database client to use. |
| `DATABASE_HOST` | The database host. |
| `DATABASE_PORT` | The database port. |
| `DATABASE_NAME` | The database name. |
| `DATABASE_USERNAME` | The database username. |
| `DATABASE_PASSWORD` | The database password. |
| `JWT_SECRET` | The secret used to sign the JWT for the Users-Permissions plugin. |
| `ADMIN_JWT_SECRET` | The secret used to sign the JWT for the Admin panel. |
| `APP_KEYS` | The secret keys used to sign the session cookies. |

<code-group>

<code-block title="YARN">

```Dockerfile
FROM node:16-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add  build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install
WORKDIR /opt/app
COPY ./ .
RUN yarn build
EXPOSE 1337
CMD ["yarn", "develop"]
```

</code-block>

<code-block title="NPM">

```Dockerfile
FROM node:16-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add  build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./package-lock.json ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN npm install
WORKDIR /opt/app
COPY ./ .
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "develop"]
```

</code-block>

</code-group>

### (Optional) Docker Compose

The following `docker-compose.yml` can be used to start up a database container and a Strapi container along with a shared network for communication between the two.

<code-group>

<code-block title="MySQL">

```yml
version: '3'
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_CLIENT: ${DATABASE_CLIENT}
      DATABASE_HOST: strapiDB
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      NODE_ENV: ${NODE_ENV}
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./yarn.lock:/opt/yarn.lock
      - ./.env:/opt/app/.env
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - '1337:1337'
    networks:
      - strapi
    depends_on:
      - strapiDB

  strapiDB:
    container_name: strapiDB
    platform: linux/amd64 #for platform error on Apple M1 chips
    restart: unless-stopped
    env_file: .env
    image: mysql:5.7
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_USER: ${DATABASE_USERNAME}
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_DATABASE: ${DATABASE_NAME}
    volumes:
      - strapi-data:/var/lib/mysql
      #- ./data:/var/lib/mysql # if you want to use a bind folder
    ports:
      - '3306:3306'
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</code-block>

<code-block title="MariaDB">

```yml
version: '3'
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_CLIENT: ${DATABASE_CLIENT}
      DATABASE_HOST: strapiDB
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      NODE_ENV: ${NODE_ENV}
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./yarn.lock:/opt/yarn.lock
      - ./.env:/opt/app/.env
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - '1337:1337'
    networks:
      - strapi
    depends_on:
      - strapiDB

  strapiDB:
    container_name: strapiDB
    platform: linux/amd64 #for platform error on Apple M1 chips
    restart: unless-stopped
    env_file: .env
    image: mariadb:latest
    environment:
      MYSQL_USER: ${DATABASE_USERNAME}
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_DATABASE: ${DATABASE_NAME}
    volumes:
      - strapi-data:/var/lib/mysql
      #- ./data:/var/lib/mysql # if you want to use a bind folder
    ports:
      - '3306:3306'
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</code-block>

<code-block title="PostgreSQL">

```yml
version: '3'
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_CLIENT: ${DATABASE_CLIENT}
      DATABASE_HOST: strapiDB
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      NODE_ENV: ${NODE_ENV}
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./yarn.lock:/opt/yarn.lock
      - ./.env:/opt/app/.env
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - '1337:1337'
    networks:
      - strapi
    depends_on:
      - strapiDB
      
  strapiDB:
    container_name: strapiDB
    platform: linux/amd64 #for platform error on Apple M1 chips
    restart: unless-stopped
    env_file: .env
    image: postgres:12.0-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - strapi-data:/var/lib/postgresql/data/ #using a volume
      #- ./data:/var/lib/postgresql/data/ # if you want to use a bind folder

    ports:
      - '5432:5432'
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</code-block>

</code-group>

## Production Environments

### Dockerfile

The following `Dockerfile` can be used to build a production Docker image for a Strapi project.

<code-group>

<code-block title="YARN">

```Dockerfile
FROM node:16-alpine as build
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install
WORKDIR /opt/app
COPY ./ .
RUN yarn build


FROM node:16-alpine
RUN apk add vips-dev
RUN rm -rf /var/cache/apk/*
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/app
COPY --from=build /opt/node_modules ./node_modules
ENV PATH /opt/node_modules/.bin:$PATH
COPY --from=build /opt/app ./
EXPOSE 1337
CMD ["yarn", "start"]
```

</code-block>

<code-block title="NPM">

```Dockerfile
FROM node:16-alpine as build
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./package-lock.json ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN npm install --production
WORKDIR /opt/app
COPY ./ .
RUN npm run build


FROM node:16-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk add vips-dev
RUN rm -rf /var/cache/apk/*
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/app
COPY --from=build /opt/node_modules ./node_modules
ENV PATH /opt/node_modules/.bin:$PATH
COPY --from=build /opt/app ./
EXPOSE 1337
CMD ["npm", "run","start"]
```

</code-block>

</code-group>

### Building the production container

### (Optional) Publishing the container to a registry

### (Optional) Deploying to various cloud providers

## Community Tools

### @strapi-community/dockerize

<!-- ### @strapi-community/deployify -->

## Docker FAQ

### Why doesn't Strapi provide official Docker images?

### Why do we have different Dockerfiles for development and production?
