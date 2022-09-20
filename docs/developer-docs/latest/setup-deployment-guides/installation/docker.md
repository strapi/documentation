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

### Dockerfile

### Building the development container

### (Optional) Docker Compose

## Production Environments

### Dockerfile

### Building the production container

### (Optional) Publishing the container to a registry

### (Optional) Deploying to various cloud providers

## Community Tools

### @strapi-community/dockerize

## Docker FAQ

### Why doesn't Strapi provide official Docker images?

### Why do we have different Dockerfiles for development and production?
