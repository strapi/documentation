---
title: Docker
displayed_sidebar: cmsSidebar
pagination_prev: cms/installation/cli
pagination_next: cms/features/admin-panel
description: Build and run a Strapi project in a Docker container for development and production environments.
tags:
  - installation
  - docker
  - deployment
  - production
---

import DockerEnvTable from '/docs/snippets/docker-env-table.md'

# Running Strapi in a Docker container

<Tldr>
This page guides you through running Strapi in Docker containers for development and production environments, including Dockerfile examples, Docker Compose configurations, and troubleshooting common issues.
</Tldr>

:::caution
Strapi does not build any official container images. The following instructions are provided as a courtesy to the community. If you have any questions please reach out on <ExternalLink to="https://discord.strapi.io" text="Discord"/>.
:::

Containerizing Strapi makes the runtime environment reproducible across machines and simplifies dependency management for deployment. This page covers building custom Docker images for an existing Strapi 5 project, with separate instructions for [development](#development-environment) and [production](#production-environment) environments, a [troubleshooting](#troubleshooting) section, and a list of [community tools](#community-tools-and-images). If you would rather not write your own Dockerfile, see [Community tools and images](#community-tools-and-images) for packaged alternatives.

:::prerequisites

- <ExternalLink to="https://www.docker.com/" text="Docker"/> installed on your machine
- <ExternalLink to="https://docs.docker.com/compose/" text="Docker Compose"/> v2 or later
- A [supported version of Node.js](/cms/installation/cli#preparing-the-installation)
- An **existing Strapi 5 project**, or a new one created with the [Quick Start guide](/cms/quick-start)
- npm as your package manager

:::

## Development environment

Development images use `npm run develop` and mount your local source code for hot-reload. Before creating the Dockerfile, set up 2 required files: `.dockerignore` and `.env`.

### Create a .dockerignore file

A `.dockerignore` file prevents local files from being copied into the Docker image. Without it, your local `node_modules` directory gets included in the build context, which causes architecture mismatches (e.g., x64 binaries on ARM) and increases the image size.

Create a `.dockerignore` file at the root of your Strapi project:

```txt title="./.dockerignore"
node_modules/
.tmp/
.cache/
.git/
build/
.env
```

### Create the Dockerfile

The following `Dockerfile` can be used to build a non-production Docker image for a Strapi project.

```dockerfile title="./Dockerfile"
FROM node:22-alpine
# Installing libvips-dev for sharp compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev bash vips-dev git
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
# RUN ["npm", "run", "build"]  # Optional: pre-builds the admin panel to speed up the first start. Not required since npm run develop rebuilds it in watch mode.
EXPOSE 1337
CMD ["npm", "run", "develop"]
```

:::tip Alternative base image for restricted networks
If your CI environment has limited network access (e.g., DNS restrictions that prevent downloading Sharp prebuilt binaries from GitHub), consider using `node:22-slim` instead of `node:22-alpine`. The Debian-based slim image avoids the need to compile native dependencies like `libvips` from source, and Sharp's prebuilt binaries work out of the box:

```dockerfile
FROM node:22-slim
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
```

<br/>
This trades a slightly larger image for fewer build dependencies and fewer network requirements.
:::

### Set up environment variables

Create a `.env` file at the root of your Strapi project. Docker Compose reads this file automatically when starting containers, so there is no need to `export` them in your shell.

<DockerEnvTable components={props.components} />

The following example contains placeholder values. Replace them with your own values before starting the containers:

```bash title="./.env"
# Server
HOST=0.0.0.0
PORT=1337

# Database
# Use 'mysql' for MySQL or MariaDB, and change DATABASE_PORT to 3306
DATABASE_CLIENT=postgres
DATABASE_HOST=strapiDB
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

# Secrets
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
ENCRYPTION_KEY=tobemodified

# Environment
NODE_ENV=development
```

### Add Docker Compose for the database

The following `docker-compose.yml` starts a database container and a Strapi container on a shared network.

:::note
For more information about Docker Compose and its commands, see the <ExternalLink to="https://docs.docker.com/compose/" text="Docker Compose documentation"/>.
:::

<Tabs groupId="databases">

<TabItem value="postgresql" label="PostgreSQL">

```yml title="./docker-compose.yml"
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env  # All variables from .env are injected into the container
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./package-lock.json:/opt/package-lock.json
      - ./.env:/opt/app/.env  # Needed because Strapi uses dotenv to read .env in development
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - "1337:1337"
    networks:
      - strapi
    depends_on:
      strapiDB:
        condition: service_healthy

  strapiDB:
    container_name: strapiDB
    # platform: linux/amd64  # Uncomment if you encounter platform errors on Apple Silicon
    restart: unless-stopped
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - strapi-data:/var/lib/postgresql/data/
      #- ./data:/var/lib/postgresql/data/ # if you want to use a bind folder
    ports:
      - "5432:5432"
    networks:
      - strapi
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  strapi-data:

networks:
  strapi:
    name: strapi
    driver: bridge
```

</TabItem>

<TabItem value="mysql" label="MySQL">

```yml title="./docker-compose.yml"
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env  # All variables from .env are injected into the container
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./package-lock.json:/opt/package-lock.json
      - ./.env:/opt/app/.env  # Needed because Strapi uses dotenv to read .env in development
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - "1337:1337"
    networks:
      - strapi
    depends_on:
      strapiDB:
        condition: service_healthy

  strapiDB:
    container_name: strapiDB
    # platform: linux/amd64  # Uncomment if you encounter platform errors on Apple Silicon
    restart: unless-stopped
    image: mysql:8.4
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
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  strapi-data:

networks:
  strapi:
    name: strapi
    driver: bridge
```

</TabItem>

<TabItem value="mariadb" label="MariaDB">

```yml title="./docker-compose.yml"
services:
  strapi:
    container_name: strapi
    build: .
    image: strapi:latest
    restart: unless-stopped
    env_file: .env  # All variables from .env are injected into the container
    volumes:
      - ./config:/opt/app/config
      - ./src:/opt/app/src
      - ./package.json:/opt/package.json
      - ./package-lock.json:/opt/package-lock.json
      - ./.env:/opt/app/.env  # Needed because Strapi uses dotenv to read .env in development
      - ./public/uploads:/opt/app/public/uploads
    ports:
      - "1337:1337"
    networks:
      - strapi
    depends_on:
      strapiDB:
        condition: service_healthy

  strapiDB:
    container_name: strapiDB
    # platform: linux/amd64  # Uncomment if you encounter platform errors on Apple Silicon
    restart: unless-stopped
    image: mariadb:11.4
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
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  strapi-data:

networks:
  strapi:
    name: strapi
    driver: bridge
```

</TabItem>

</Tabs>

### Build and run

1. Build and start all containers:

    ```bash
    docker compose up --build
    ```

2. Open `http://localhost:1337/admin` in your browser to access the Strapi admin panel.

To stop the containers, run `docker compose down`. Add the `-v` flag to also remove the database volume.

## Production environment

Production images differ from development images in 3 key ways: they use multi-stage builds to reduce image size, they install only production dependencies in the final stage, and they run `npm run start` instead of the develop command. This ensures the image contains only what is needed to serve the application, without development tooling or source maps. A reverse proxy should sit in front of the Strapi container in production (see [deployment documentation](/cms/deployment)).

### Create the production Dockerfile

The following `Dockerfile.prod` uses a multi-stage build. The first stage installs all dependencies, including devDependencies needed for the build step, and builds the admin panel. The second stage copies only production assets into the final image.

```dockerfile title="./Dockerfile.prod"
# Build stage
FROM node:22-alpine AS build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev bash vips-dev git > /dev/null 2>&1

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:22-alpine
RUN apk add --no-cache vips-dev
ENV NODE_ENV=production

WORKDIR /opt/
COPY --from=build /opt/package.json /opt/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY --from=build /opt/app ./

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
# highlight-start
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:1337/_health || exit 1
# highlight-end
CMD ["npm", "run", "start"]
```

:::note Key difference from the development Dockerfile
The build stage installs all dependencies (including devDependencies) because the `npm run build` step needs them to compile the admin panel. The production stage then installs only production dependencies, keeping the final image lean.
:::

### Add Docker Compose for production

The following `docker-compose.prod.yml` is suitable for production deployments. It uses PostgreSQL and includes healthchecks. The Strapi port binds to `127.0.0.1` so that only a local reverse proxy can reach it.

```yml title="./docker-compose.prod.yml"
services:
  strapi:
    container_name: strapi
    build:
      context: .
      dockerfile: Dockerfile.prod
    image: strapi:latest
    restart: always
    env_file: .env
    environment:
      NODE_ENV: production  # Overrides the development value from .env
    ports:
      - "127.0.0.1:1337:1337"
    networks:
      - strapi
    depends_on:
      strapiDB:
        condition: service_healthy

  strapiDB:
    container_name: strapiDB
    restart: always
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - strapi-data:/var/lib/postgresql/data/
    networks:
      - strapi
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  strapi-data:

networks:
  strapi:
    name: strapi
    driver: bridge
```

<Checklist title="Production checklist">
  <ChecklistItem>Do not expose database ports to the host. The <code>strapiDB</code> service above has no <code>ports</code> mapping, making it accessible only to other containers on the <code>strapi</code> network.</ChecklistItem>
  <ChecklistItem>Persist uploads. The production docker-compose does not mount a volume for <code>/opt/app/public/uploads</code>. If you use the default local upload provider, add a named volume (e.g., <code>strapi-uploads:/opt/app/public/uploads</code>) or configure an external provider such as AWS S3 or Cloudinary.</ChecklistItem>
  <ChecklistItem>Secure your secrets. The production docker-compose uses <code>env_file: .env</code>, which is acceptable for single-host deployments. For orchestrated environments, prefer Docker secrets, environment variables injected by your orchestrator (Kubernetes, ECS), or a dedicated secret manager (HashiCorp Vault, AWS Secrets Manager).</ChecklistItem>
</Checklist>

### Build and publish

To build a production Docker image, run the following command:

```bash
docker build \
  -t mystrapiapp:latest \
  -f Dockerfile.prod .
```

After building, you can publish the image to a Docker registry. For production usage, use a private registry since your Docker image may contain sensitive configuration.

Popular container registries include:

- <ExternalLink to="https://aws.amazon.com/ecr/" text="AWS ECR"/>
- <ExternalLink to="https://azure.microsoft.com/en-us/services/container-registry/" text="Azure Container Registry"/>
- <ExternalLink to="https://cloud.google.com/artifact-registry" text="GCP Artifact Registry"/>
- <ExternalLink to="https://www.digitalocean.com/products/container-registry/" text="Digital Ocean Container Registry"/>
- <ExternalLink to="https://www.ibm.com/cloud/container-registry" text="IBM Cloud Container Registry"/>
- <ExternalLink to="https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry" text="GitHub Container Registry"/>
- <ExternalLink to="https://docs.gitlab.com/ee/user/packages/container_registry/" text="Gitlab Container Registry"/>

## Community tools and images

Strapi does not provide official Docker images (see [FAQ](/cms/faq)). The following community-maintained tools and images can help you get started.

If you would like to add your tool to this list, please open a pull request on the <ExternalLink to="https://github.com/strapi/documentation" text="Strapi documentation repository"/>.

### The `@strapi-community/dockerize` CLI

The `@strapi-community/dockerize` package is a CLI tool that generates a `Dockerfile` and `docker-compose.yml` file for a Strapi project.

To get started, run `npx @strapi-community/dockerize@latest` within an existing Strapi project folder and follow the CLI prompts.

For more information, see the official <ExternalLink to="https://github.com/strapi-community/strapi-tool-dockerize" text="GitHub repository"/> or the <ExternalLink to="https://www.npmjs.com/package/@strapi-community/dockerize" text="npm package"/>.

### Community-maintained Docker images

Pre-built Docker images maintained by community members are available for Strapi 5. These images let you run Strapi without writing your own Dockerfile.

:::caution
These images are community-maintained and not officially supported by Strapi. Review their documentation and source code before using them in production.
:::

- <ExternalLink to="https://github.com/naskio/docker-strapi" text="naskio/strapi"/>: Actively maintained image that tracks Strapi 5 releases. Available on <ExternalLink to="https://hub.docker.com/r/naskio/strapi" text="Docker Hub"/>.
- <ExternalLink to="https://hub.docker.com/r/vshadbolt/strapi" text="vshadbolt/strapi"/>: Supports both AMD64 and ARM64 architectures. Tracks Strapi 5 releases.

## Troubleshooting

The following section details some common issues with Sharp and ARM builds on Apple Silicon-powered machines.

### Sharp and libvips errors

Sharp is the image processing library used by Strapi. It depends on `libvips`, which requires native compilation on Alpine-based images. Common error messages include `Cannot find module 'sharp'` or `Error: sharp: Installation error`.

To resolve Sharp issues:

1. Verify that your Dockerfile installs the required Alpine packages:

    ```dockerfile
    RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev bash vips-dev git
    ```

2. If the issue persists, switch to `node:22-slim` (Debian-based) to avoid native library compatibility problems: <Annotation>Alpine Linux uses a lightweight C library called **musl** instead of the standard **glibc** used by Debian and Ubuntu. Some npm packages ship pre-compiled binaries built for glibc that do not work on Alpine. Switching to a Debian-based image like `node:22-slim` avoids this issue entirely.</Annotation>

    ```dockerfile
    FROM node:22-slim
    RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
    ```

3. For ARM builds (see [below](#apple-silicon-and-arm-builds)), add the following environment variable before installing dependencies:

    ```dockerfile
    ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
    ```

### Apple Silicon and ARM builds

The `platform: linux/amd64` flag in docker-compose files forces containers to run under x86 emulation on ARM-based machines (Apple M1/M2/M3). This works but is slower than native ARM builds.

For native ARM performance:

- Remove the `platform: linux/amd64` line from your docker-compose file.
- Use `node:22-alpine` or `node:22-slim` as your base image. Both support ARM64 natively.
- Ensure Sharp dependencies are installed correctly (see [Sharp and libvips errors](#sharp-and-libvips-errors)).

:::note
The `platform: linux/amd64` flag is commented out in the [docker-compose examples](#add-docker-compose-for-the-database) above. Uncomment it if your database image does not provide an ARM64 variant.
:::

### Database connection issues

:::danger
Strapi applications must use a database created by a Strapi application. Connecting to a pre-existing non-Strapi database, or to a Strapi v3 database, is not supported and may result in lost data such as dropped tables.
:::

If Strapi cannot connect to the database in Docker, check the following:

1. Verify that `DATABASE_HOST` matches the service name in your docker-compose file (e.g., `strapiDB`), not `localhost` or `127.0.0.1`. Containers communicate over the Docker network using service names.

2. Check for port conflicts with local database instances. If a database is already running locally on the same port:
    - Stop the local database, **or**
    - Change the host-side port mapping in your docker-compose file (e.g., `"5433:5432"`).

3. Set the connection pool `min` value to `0` in your [database configuration](/cms/configurations/database), as Docker may kill idle connections:

    <Tabs>

    <TabItem value="js" label="JavaScript">

    ```js title="./config/database.js"
    module.exports = ({ env }) => ({
      connection: {
        client: env('DATABASE_CLIENT'),
        // ...
        pool: {
          min: 0,
          max: 10,
        },
      },
    });
    ```

    </TabItem>

    <TabItem value="ts" label="TypeScript">

    ```ts title="./config/database.ts"
    export default ({ env }) => ({
      connection: {
        client: env('DATABASE_CLIENT'),
        // ...
        pool: {
          min: 0,
          max: 10,
        },
      },
    });
    ```

    </TabItem>

    </Tabs>

4. Configure `pool.acquireTimeoutMillis` and `pool.idleTimeoutMillis` in your database configuration if the database container becomes unreachable after periods of inactivity.

## <Icon name="fast-forward" /> What to do next?

Now that Strapi is running in a Docker container, you can:

<Icon name="arrow-fat-right" /> Set up the [admin panel](/cms/features/admin-panel) and create your first content types with the [Content-Type Builder](/cms/features/content-type-builder).<br/>
<Icon name="arrow-fat-right" /> Configure a reverse proxy and deploy to production (see [deployment documentation](/cms/deployment)).<br/>
<Icon name="arrow-fat-right" /> Explore [environment configuration](/cms/configurations/environment) for fine-tuning your Strapi instance.
