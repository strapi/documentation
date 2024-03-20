---
title: Configurations
description: Learn how you can manage and customize the configuration of your Strapi application.
displayed_sidebar: devDocsConfigSidebar
pagination_prev: dev-docs/installation
pagination_next: dev-docs/setup-deployment
---

import ProjectStructureConfigFiles from '@site/src/components/ProjectStructureConfigFiles'
const imgStyle = {width: '100%', margin: '0'}
const captionStyle = {fontSize: '12px'}

# Configuration

The configuration of a Strapi project lives in the `/config` folder:

<ProjectStructureConfigFiles />

<em style={captionStyle}>The block above is an excerpt from the project structure. You can click on any file name to read the corresponding documentation. Visit the <a href="/dev-docs/project-structure">project structure page</a> for the full version.</em>

## Base configurations

From the `/config` folder, you can find and define the following base configurations:

| Configuration topic | File path | Required or optional |
|-----|----|----|
| [Database](/dev-docs/configurations/database) | `config/database` | Required |
| [Server](/dev-docs/configurations/server) | `config/server` | Required
| [Admin panel](/dev-docs/configurations/admin-panel) | `config/admin` | Required |
| [Middlewares](/dev-docs/configurations/middlewares) | `config/middlewares` | Required |
| [API calls](/dev-docs/configurations/api) | `config/api` | Optional, used to define some general settings for responses and other REST-related parameters. |

## Additional configuration for specific features

Some specific features require additional configuration:

| Feature | Location | Required or optional |
|---------|------|------|
| [Plugins](/dev-docs/configurations/plugins) | In the `config/plugins` file | <ul><li>Optional if using only built-in plugins with default presets.</li><li>Required to enable, configure, or disable plugins.</li></ul>Can also be used to configure the Upload plugin (which handles the Media Library feature) and GraphQL. |
| [TypeScript](/dev-docs/configurations/typescript) | <ul><li>In `tsconfig.json` for general [TypeScript-related configuration](/dev-docs/configurations/typescript#project-structure-and-typescript-specific-configuration-files)</li><li>In the `config/typescript` file for [dedicated TypeScript features](/dev-docs/configurations/typescript#strapi-specific-configuration-for-typescript) specific to Strapi</li></ul> | Required to use TypeScript efficiently |
| [API tokens](/dev-docs/configurations/api-tokens) | In the `config/admin` file | Required if using API tokens for authentication instead of the [Users & Permissions plugin](/dev-docs/plugins/users-permissions) |
| [Lifecycle functions](/dev-docs/configurations/functions) | In the `/src/index` file | Optionally used to perform various actions that happen during the server lifecycle. Includes the `register`, `bootstrap`, and `destroy` functions. |
| [Cron jobs](/dev-docs/configurations/cron) | <ul><li>In the `/config/server` file to enable the feature</li><li>In a dedicated, optional `cron-tasks` file that can be used to declare the jobs</li></ul> | Required to setup CRON jobs for the server. |
| [Environment variables](/dev-docs/configurations/environment) | In dedicated files and folders for the environment (e.g., `config/env/production/server`) | Optionally used to define different environments and their variables. |
| [Single Sign-On (SSO)](/dev-docs/configurations/sso) <EnterpriseBadge /> | In the `config/admin` file | Required to use the Entreprise-only SSO feature if enabled on your project. |
| [Feature flags](/dev-docs/configurations/features) | In the `config/features` file | Optional for a typical, stable Strapi application.<br/>Only required to enable [future flags](/dev-docs/configurations/features).|

## Guides

The following guides will help you address specific use cases related to the Strapi configuration:

<CustomDocCard small title="How to create custom conditions for Role-Based Access Control (RBAC)" link="/dev-docs/configurations/rbac" />

<CustomDocCard small title="How to use public assets" link="/dev-docs/configurations/public-assets" />

<CustomDocCard small title="How to access configuration values from the code" link="/dev-docs/configurations/guides/access-configuration-values" />

<CustomDocCard small title="How to access and cast environment variables" link="/dev-docs/configurations/guides/access-cast-environment-variables" />
