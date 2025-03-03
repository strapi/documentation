---
title: Configurations
description: Learn how you can manage and customize the configuration of your Strapi application.
displayed_sidebar: cmsSidebar
sidebar_label: Introduction
pagination_prev: cms/installation
pagination_next: cms/configurations/admin-panel
tags:
- introduction
- configuration
- base configuration 
- additional configuration 
---

import ProjectStructureConfigFiles from '@site/src/components/ProjectStructureConfigFiles'

# Configuration

The configuration of a Strapi project lives in the `/config` folder:

<ProjectStructureConfigFiles />

<em style={{fontSize: '12px'}}>The block above is an excerpt from the project structure. You can click on any file name in purple to read the corresponding documentation. Visit the <a href="/cms/project-structure">project structure page</a> for the full version.</em>

## Base configurations

From the `/config` folder, you can find and define the following base configurations:

| Configuration topic | File path | Required or optional |
|-----|----|----|
| [Database](/cms/configurations/database) | `config/database` | Required |
| [Server](/cms/configurations/server) | `config/server` | Required
| [Admin panel](/cms/configurations/admin-panel) | `config/admin` | Required |
| [Middlewares](/cms/configurations/middlewares) | `config/middlewares` | Required |
| [API calls](/cms/configurations/api) | `config/api` | Optional, used to define some general settings for responses and other REST-related parameters. |

## Additional configuration for specific features

Some specific features require additional configuration:

| Feature | Location | Required or optional |
|---------|------|------|
| [Plugins](/cms/configurations/plugins) | In the `config/plugins` file | <ul><li>Optional if using only built-in plugins with default presets.</li><li>Required to enable, configure, or disable plugins.</li></ul>Can also be used to configure the Upload plugin (which handles the Media Library feature) and GraphQL. |
| [TypeScript](/cms/configurations/typescript) | <ul><li>In `tsconfig.json` for general [TypeScript-related configuration](/cms/configurations/typescript#project-structure-and-typescript-specific-configuration-files)</li><li>In the `config/typescript` file for [dedicated TypeScript features](/cms/configurations/typescript#strapi-specific-configuration-for-typescript) specific to Strapi</li></ul> | Required to use TypeScript efficiently |
| [API tokens](/cms/features/api-tokens) | In the `config/admin` file | Required if using API tokens for authentication instead of the [Users & Permissions plugin](/cms/features/users-permissions) |
| [Lifecycle functions](/cms/configurations/functions) | In the `/src/index` file | Optionally used to perform various actions that happen during the server lifecycle. Includes the `register`, `bootstrap`, and `destroy` functions. |
| [Cron jobs](/cms/configurations/cron) | <ul><li>In the `/config/server` file to enable the feature</li><li>In a dedicated, optional `cron-tasks` file that can be used to declare the jobs</li></ul> | Required to setup CRON jobs for the server. |
| [Environment variables](/cms/configurations/environment) | In dedicated files and folders for the environment (e.g., `config/env/production/server`) | Optionally used to define different environments and their variables. |
| [Single Sign-On (SSO)](/cms/configurations/guides/configure-sso) <EnterpriseBadge /> <SsoBadge /> | In the `config/admin` file | Required to use the SSO feature if enabled on your project. |
| [Feature flags](/cms/configurations/features) | In the `config/features` file | Optional for a typical, stable Strapi application.<br/>Only required to enable [future flags](/cms/configurations/features).|

## Guides

The following guides will help you address specific use cases related to the Strapi configuration:

<CustomDocCard small title="How to create custom conditions for Role-Based Access Control (RBAC)" link="/cms/configurations/guides/rbac" />

<CustomDocCard small title="How to use public assets" link="/cms/configurations/guides/public-assets" />

<CustomDocCard small title="How to access and cast environment variables" link="/cms/configurations/guides/access-cast-environment-variables" />

<CustomDocCard small title="How to access configuration values from the code" link="/cms/configurations/guides/access-configuration-values" />
