---
title: FAQ
description: Find some answers and solutions to most common issues that you may experience when working with Strapi.
tags:
- content-type
- admin panel
- deployment
- migration
- Content Manager 
- serverless environment
- PaaS
- plugins
- dynamic zones
- UUID
- default ID type
- default ID name
- SSL
- typescript

---

# Frequently Asked Questions

Below are answers and solutions to most common issues that you may experience when working with Strapi.

## Why can't I create or update content-types in production/staging?

Strapi stores model configuration files (what defines the model schema) in files such as `./src/api/restaurant/content-types/restaurant/schema.json`. Due to how Node.js works, in order for changes to take effect, that would require Node to restart the server. This could potentially cause downtime of your production service and likewise these changes should be tracked in some kind of source control.

Generally your "flow" of development would follow the following path:

- Development - Develop your Strapi application locally on your host machine, then push changes into source control
- Staging - Deploy changes from source control to a "production-like" environment for testing
- Production - If no other changes are needed, deploy into production
- Repeat as needed, it is recommended that you properly version and test your application as you go

At this time and in the future there is no plan to allow model creating or updating while in a production environment, and there is currently no plans to move model settings into the database. There are no known nor recommended workarounds for this.

## Does Strapi handle deploying or migrating of content?

Strapi does offer a feature known as [Data Transfer](/cms/data-management/transfer) that allows you to export and import content from one Strapi instance to another or exporting and importing from a file archive. This is useful for migrating content from one environment to another.

## User can't login to the admin panel

With the release of the Strapi 3.0 beta version a fundamental change occurred in that the end users (REST and GraphQL users) were split from the Administrators (admin panel users) in such a way that normal users can not be given access to the admin panel. If you would like to read more on why this change was done, you can read the Strapi <ExternalLink to="https://strapi.io/blog/why-we-split-the-management-of-the-admin-users-and-end-users" text="blog post"/> about it.

Strapi has released the Admin & Permissions (RBAC - Role-Based Access Control) that does allow for some degree of control over what users can access within the admin panel and includes some field level permissions. You can also give roles specific permissions for things like content-types, single types, plugins, and settings.

## Why are my application's database and uploads resetting on PaaS-type services?

If you used `--quickstart` to create your Strapi project, by default this uses the SQLite database. PaaS systems (Heroku, DigitalOcean Apps, Google App Engine, etc.) file systems are typically <ExternalLink to="https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem" text="ephemeral"/> or read-only meaning that each time a dyno (container) is reset all filesystem changes are lost. And since both SQLite and local uploads are stored on the filesystem, any changes made to these since the last dyno reset will be deleted. Typically dynos are reset at least once a day, and in most cases multiple times per day or when new code is pushed to these services.

It is recommended you use a database add-on like Heroku's PostgreSQL. For file uploads, you will need to use one of the 3rd party providers such as Cloudinary or AWS S3.

## How can I upgrade my free Strapi Cloud to a paid plan?

Strapi Cloud provides a free plan. Whenever you're ready to upgrade to one of the <ExternalLink to="https://strapi.io/pricing-cloud" text="paid plans"/>, please use the _Plans_ section of your Strapi Cloud project's settings (see [Cloud documentation](/cloud/projects/settings#upgrading-to-another-plan) for more details).

## Can Strapi be run in serverless environments?

Strapi is not well suited for serverless environments due to how the application is structured. Several actions happen while Strapi is booting that can take several seconds. Serverless deployment usually requires an application to cold boot very quickly. Strapi is designed to run as an always-on service, and we don't plan to decrease the cold boot time for the foreseeable future. Therefore, running Strapi in serverless environments is not a great experience, as every request will take seconds to respond to instead of milliseconds. Choosing between a cold boot or a warm boot is an architectural decision that many software developers need to take from a very early stage, so please consider this when choosing to use Strapi.

## Can I store my Content Manager layout configurations in the model settings?

Currently Strapi does not support this, a `config:dump` and `config:restore` command has been added to make migration of these settings easier when moving between different deployments and environments.

We don't offer the ability to store these configurations in the model settings for several reasons:

- It will create conflicts in case of content internationalization and translations in the admin interface.
- The layout might be different according to the roles and permissions.
- While the model is the same whatever the content created, the contribution interface can be different. For instance, we have an idea to create a mobile application for contributors only. The labels and layout configurations could be different according the device & interface.

For all these reasons, and others, we think it'll be a mistake and might confuse users if we store the configuration in the model settings file. The final solution is to make the migration and deployment across environment easier.

## How do I customize a plugin?

Strapi uses a system called [extension](/cms/plugins-development/plugins-extension) as plugins are stored in the `node_modules` folder. Due to this extensions work by Strapi utilizing programmatic hooks to override certain parts of the plugin.

## Can I add my own 3rd party auth provider?

Yes, you can either follow the following [documentation](/cms/configurations/users-and-permissions-providers/new-provider-guide) or you can take a look at the <ExternalLink to="https://github.com/strapi/strapi/tree/main/packages/plugins/users-permissions" text="users-permissions"/> code and submit a pull request to include the provider for everyone. Eventually Strapi does plan to move from the current grant/purest provider to a split natured system similar to the upload providers.

There is currently no ETA on this migration however.

## Does Strapi allow me to change the default ID type or name?

No, currently does not have the ability to allow for changing the default id name nor does it allow you to switch the data type (such as UUID in PostgreSQL), support for this is being looked at in future.

## Can you filter and/or deep filter on dynamic zones and polymorphic relations?

At this time we do not plan to allow for filtering on dynamic zones or polymorphic relations due to various complexity and performance issues that come from doing so.

## How do I setup SSL with Strapi?

Strapi implements no SSL solution natively, this is due to the fact that it is extremely insecure to directly offer a Node.js application to the public web on a low port.

On Linux based operating systems you need root permissions to bind to any port below 1024 and with typical SSL being port 443 you would need to run your application as root.

Likewise since Strapi is Node.js based, in order for changes with the SSL certificate to take place (say when it expires) you would need to restart your application for that change to take effect.

Due to these two issues, it is recommended you use a proxy application such as <ExternalLink to="https://forum.strapi.io/t/nginx-proxing-with-strapi/" text="Nginx"/>, <ExternalLink to="https://forum.strapi.io/t/caddy-proxying-with-strapi/40616" text="Caddy"/>, <ExternalLink to="https://forum.strapi.io/t/haproxy-proxying-with-strapi/" text="HAProxy"/>, Apache, Traefik, or many others to handle your edge routing to Strapi. There are settings in the environment [server.json](/cms/configurations/server) to handle upstream proxies. The proxy block requires all settings to be filled out and will modify any backend plugins such as authentication providers and the upload plugin to replace your standard `localhost:1337` with the proxy URL.

## Can I use TypeScript in a Strapi project?

TypeScript is supported in Strapi projects from v4.2.0-beta.1 TypeScript code examples are available throughout the core Developer Documentation and a [dedicated TypeScript support page](/cms/typescript).

## How to fix the build error `Error: Cannot find module @strapi/XXX`

:::caution
Before trying the fix below, ensure you've executed your package manager's install command in your project.
:::

Strapi in its current version requires dependency hoisting.

By default, most package managers enable hoisting, however, if it's not functioning as expected, you can try enforcing it via your package manager's configuration.

- If you are using npm or pnpm: Add `hoist=true` to your project's `.npmrc` file. Learn more about this from the <ExternalLink to="https://pnpm.io/npmrc#hoist" text="official pnpm documentation"/>
- If you are using Yarn: Set `nmHoistingLimits` in your `.yarnrc` file. More details can be found in the <ExternalLink to="https://yarnpkg.com/configuration/yarnrc#nmHoistingLimits" text="Yarn official documentation"/>

## Is X feature available yet?

You can see the <ExternalLink to="https://feedback.strapi.io/" text="public roadmap"/> to see which feature requests are currently being worked on and which have not been started yet, and to add new feature requests.
