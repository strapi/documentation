---
title: Docker
displayed_sidebar: cmsSidebar
description: Quickly create a Docker container from a local project.
tags:
- installation
- environment 
- MySQL
---

import DockerEnvTable from '/docs/snippets/docker-env-table.md'

# Running Strapi in a Docker container

:::caution
Strapi does not build any official container images. The following instructions are provided as a courtesy to the community. If you have any questions please reach out on [Discord](https://discord.strapi.io).
:::

:::danger
 Strapi applications are not meant to be connected to a pre-existing database, not created by a Strapi application, nor connected to a Strapi v3 database. The Strapi team will not support such attempts. Attempting to connect to an unsupported database may, and most likely will, result in lost data such as dropped tables.
:::

The following documentation will guide you through building a custom [Docker](https://www.docker.com/) container with an existing Strapi project.

Docker is an open platform that allows developing, shipping, and running applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies). Containers are isolated from each other and bundle their own software, libraries, and configuration files; they can communicate with each other through well-defined channels.

:::prerequisites

- [Docker](https://www.docker.com/) installed on your machine
- A [supported version of Node.js](/cms/installation/cli#preparing-the-installation)
- An **existing Strapi 5 project**, or a new one created with the [Quick Start guide](/cms/quick-start.md)
- (_optional_) [Yarn](https://yarnpkg.com/) installed on your machine
- (_optional_) [Docker Compose](https://docs.docker.com/compose/) installed on your machine

:::

## Development and/or Staging environments

For working with Strapi locally on your host machine you can use the [Dockerfile](https://docs.docker.com/engine/reference/builder/), and if needed the [docker-compose.yml](https://docs.docker.com/compose/compose-file/) can also be used to start up a database container.

Both methods require an existing Strapi project or a new one created (see [Quick Start guide](/cms/quick-start.md)).

### Development Dockerfile

The following `Dockerfile` can be used to build a non-production Docker image for a Strapi project.

:::note

If you are using `docker-compose`, you can skip setting the environment variables manually, as they will be set in the `docker-compose.yml` file or a `.env` file.

:::

<DockerEnvTable components={props.components} />

For more information on the `Dockerfile` and its commands, please refer to the [official Docker documentation](https://docs.docker.com/engine/reference/commandline/cli/).

Sample `Dockerfile`:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```dockerfile title="./Dockerfile"
FROM node:18-alpine3.18
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json yarn.lock ./
RUN yarn global add node-gyp
RUN yarn config set network-timeout 600000 -g && yarn install
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
RUN ["yarn", "build"]
EXPOSE 1337
CMD ["yarn", "develop"]
```

</TabItem>

<TabItem value="npm" label="npm">

```dockerfile title="./Dockerfile"
FROM node:18-alpine3.18
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "develop"]

```

</TabItem>

</Tabs>

### (Optional) Docker Compose

The following `docker-compose.yml` can be used to start up a database container and a Strapi container along with a shared network for communication between the two.

:::note
For more information about running Docker compose and its commands, please refer to the [Docker Compose documentation](https://docs.docker.com/compose/).
:::

Sample `docker-compose.yml`:

<Tabs groupId="databases">

<TabItem value="mysql" label="MySQL">

```yml title="./docker-compose.yml"
version: "3"
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
      - "1337:1337"
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
      - "3306:3306"
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</TabItem>

<TabItem value="mariadb" label="MariaDB">

```yml title="./docker-compose.yml"
version: "3"
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
      - "1337:1337"
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
      - "3306:3306"
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</TabItem>

<TabItem value="postgresql" label="PostgreSQL">

```yml title="./docker-compose.yml"
version: "3"
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
      - "1337:1337"
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
      - "5432:5432"
    networks:
      - strapi

volumes:
  strapi-data:

networks:
  strapi:
    name: Strapi
    driver: bridge
```

</TabItem>

</Tabs>

## Production Environments

The Docker image in production is different from the one used in development/staging environments because of the differences in the admin build process in addition to the command used to run the application. Typical production environments will use a reverse proxy to serve the application and the admin panel. The Docker image is built with the production build of the admin panel and the command used to run the application is `strapi start`.

Once the [Dockerfile](#production-dockerfile) is created, the [production container](#building-the-production-container) can be built. Optionally, the container can be published to a [registry](#optional-publishing-the-container-to-a-registry) to make it available to the community. [Community tools](#community-tools) can help you
in the process of building a production Docker image and deploying it to a production environment.

### Production Dockerfile

The following `Dockerfile` can be used to build a production Docker image for a Strapi project.

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```dockerfile title="./Dockerfile.prod"
# Creating multi-stage build for production
FROM node:18-alpine as build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
ENV NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json yarn.lock ./
RUN yarn global add node-gyp
RUN yarn config set network-timeout 600000 -g && yarn install --production
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY . .
RUN yarn build

# Creating final production image
FROM node:18-alpine
RUN apk add --no-cache vips-dev
ENV NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["yarn", "start"]
```

</TabItem>

<TabItem value="npm" label="npm">

```dockerfile title="./Dockerfile.prod"
# Creating multi-stage build for production
FROM node:18-alpine as build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY . .
RUN npm run build

# Creating final production image
FROM node:18-alpine
RUN apk add --no-cache vips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]

```

</TabItem>

</Tabs>

### Building the production container

Building production Docker images can have several options. The following example uses the `docker build` command to build a production Docker image for a Strapi project. However, it is recommended you review the [Docker documentation](https://docs.docker.com/engine/reference/commandline/build/) for more information on building Docker images with more advanced options.

To build a production Docker image for a Strapi project, run the following command:

```bash
docker build \
  --build-arg NODE_ENV=production \
  # --build-arg STRAPI_URL=https://api.example.com \ # Uncomment to set the Strapi Server URL
  -t mystrapiapp:latest \ # Replace with your image name
  -f Dockerfile.prod .
```

### (Optional) Publishing the container to a registry

After you have built a production Docker image for a Strapi project, you can publish the image to a Docker registry. Ideally for production usage this should be a private registry as your Docker image will contain sensitive information.

Depending on your hosting provider you may need to use a different command to publish your image. It is recommended you review the [Docker documentation](https://docs.docker.com/engine/reference/commandline/push/) for more information on publishing Docker images with more advanced options.

Some popular hosting providers are:

- [AWS ECR](https://aws.amazon.com/ecr/)
- [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/)
- [GCP Container Registry](https://cloud.google.com/container-registry)
- [Digital Ocean Container Registry](https://www.digitalocean.com/products/container-registry/)
- [IBM Cloud Container Registry](https://www.ibm.com/cloud/container-registry)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Gitlab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)

## Community tools

Several community tools are available to assist you in deploying Strapi to various cloud providers and setting up Docker in a development or production environment.

We strongly support our community efforts and encourage you to check out the following tools, please help support them by contributing to their development.

If you would like to add your tool to this list, please open a pull request on the [Strapi documentation repository](https://github.com/strapi/documentation).

### @strapi-community/dockerize

The `@strapi-community/dockerize` package is a CLI tool that can be used to generate a `Dockerfile` and `docker-compose.yml` file for a Strapi project.

To get started run `npx @strapi-community/dockerize@latest` within an existing Strapi project folder and follow the CLI prompts.

For more information please see the official [GitHub repository](https://github.com/strapi-community/strapi-tool-dockerize) or the [npm package](https://www.npmjs.com/package/@strapi-community/dockerize).

### @strapi-community/deployify

The `@strapi-community/deployify` package is a CLI tool that can be used to deploy your application to various cloud providers and hosting services. Several of these also support deploying a Strapi project with a Docker container and will call on the `@strapi-community/dockerize` package to generate the required files if they don't already exist.

To get started run `npx @strapi-community/deployify@latest` within an existing Strapi project folder and follow the CLI prompts.

For more information please see the official [GitHub repository](https://github.com/strapi-community/strapi-tool-deployify) or the [npm package](https://www.npmjs.com/package/@strapi-community/deployify).

## Docker FAQ

### Why doesn't Strapi provide official Docker images?

Strapi is a framework that can be used to build many different types of applications. As such, it is not possible to provide a single Docker image that can be used for all use cases.

### Why do we have different Dockerfiles for development and production?

The primary reason for various Docker images is due to the way our Admin panel is built. The Admin panel is built using React and is bundled into the Strapi application during the build process. This means that the Strapi backend is acting as a web server to serve the Admin panel and thus certain environment variables are statically compiled into the built Admin panel.

It is generally considered a best practice with Strapi to build different Docker images for development and production environments. This is because the development environment is not optimized for performance and is not intended to be exposed to the public internet.
