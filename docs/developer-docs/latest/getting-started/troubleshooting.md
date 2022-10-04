---
title: Troubleshooting - Strapi Developer Docs
description: Find some answers and solutions to most common issues that you may experience when working with Strapi.
sidebarDepth: 0
canonicalUrl: https://docs.strapi.io/developer-docs/latest/getting-started/troubleshooting.html
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

Strapi does not currently provide any tools for migrating or deploying your data changes between different environments (_ie. from development to production_). With the exception being the Content-Manager settings, to read more about this option please see the following [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-configuration-dump).

## User can't login to the admin panel

With the release of the Strapi beta version a fundamental change occurred in that the end users (REST and GraphQL users) were split from the Administrators (admin panel users) in such a way that normal users can not be given access to the admin panel. If you would like to read more on why this change was done, you can read the Strapi [blog post](https://strapi.io/blog/why-we-split-the-management-of-the-admin-users-and-end-users) about it.

Strapi has released the new Admin & Permissions (RBAC - Role based access control) that does allow for some degree of control over what users can access within the admin panel and includes some field level permissions. You can now also give roles specific permissions for things like content-types, single types, plugins, and settings.

When this new plugin release, there is two versions:

- Community Edition
- Enterprise Edition

By default, the Community Edition includes 3 pre-defined roles (Administrators, Editor, Author). Upgrading to the Enterprise Edition will unlock an unlimited number of roles. There will be certain other field level permission limitations based on the edition and we will be building a detailed guide as to what is included within the "Basic" vs "Advanced" RBAC features. To learn more about what is included as well as pricing please see our [pricing page](https://strapi.io/pricing-self-hosted).

## Relations aren't maintaining their sort order

With the components there is a hidden field called `order` that allows entries to maintain their sort, however with relations there is no such field. If you consider the typical count of of component entries vs relational based entries (in retrospect they function in the backend the same) there is generally a much higher number of relations. If relations were to have an `order` field applied to them as well it could cause significant performance degradation when trying to update the order, and likewise in the case where a relation could be attached to multiple entries it would be quite difficult to maintain the order.

For the time being there is no recommended way to handle this automatically and instead it may be required for you to create custom controllers to handle this within your own project.

We are evaluating if we will natively add support for this in the future. We will add more details when they become available.

## Why are my application's database and uploads resetting on PaaS?

If you used `--quickstart` to create your Strapi project, by default this uses the SQLite database. PaaS systems (Heroku, DigitalOcean Apps, Google App Engine, ect) file systems are typically [ephemeral](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem) or read-only meaning that each time a dyno (container) is reset all filesystem changes are lost. And since both SQLite and local uploads are stored on the filesystem, any changes made to these since the last dyno reset will be deleted. Typically dynos are reset at least once a day, and in most cases multiple times per day or when new code is pushed to these services.

It is recommended you use a database add-on like Heroku's PostgreSQL. For file uploads, you will need to use one of the 3rd party providers such as Cloudinary or AWS S3.

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

Strapi uses a system called [extensions](/developer-docs/latest/development/plugins-extension.md) as plugins are stored in the `node_modules` folder. Due to this extensions work by Strapi detecting newer versions of files and using that as a replacement for the ones stored within the `node_modules`.

You gain the ability to modify these files without forking the plugin package, however you lose the ability to easily update. After each version release you will need to compare your changes to those in the new version and modify your version of the files accordingly.

<!-- TODO: Confirm with Frontend team if this FAQ is accurate -->

## Can I add my own 3rd party auth provider?

Yes, you can either follow the following [guide](/developer-docs/latest/plugins/users-permissions.md#adding-a-new-provider-to-your-project) or you can take a look at the [users-permissions](https://github.com/strapi/strapi/tree/master/packages/plugins/users-permissions) and submit a pull request to include the provider for everyone. Eventually Strapi does plan to move from the current grant/purest provider to a split natured system similar to the upload providers.

There is currently no ETA on this migration however.

## Does Strapi allow me to change the default ID type or name?

No, currently does not have the ability to allow for changing the default id name nor does it allow you to switch the data type (such as UUID in PostgreSQL), support for this is being looked at in future.

## Can you filter and/or deep filter on dynamic zones and polymorphic relations?

At this time we do not plan to allow for filtering on dynamic zones or polymorphic relations due to various complexity and performance issues that come from doing so.

## How do I setup SSL with Strapi?

Strapi implements no SSL solution natively, this is due to the fact that it is extremely insecure to directly offer a Node.js application to the public web on a low port.

On Linux based operating systems you need root permissions to bind to any port below 1024 and with typical SSL being port 443 you would need to run your application as root.

Likewise since Strapi is Node.js based, in order for changes with the SSL certificate to take place (say when it expires) you would need to restart your application for that change to take effect.

Due to these two issues, it is recommended you use a proxy application such as [Nginx](/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.md), [Caddy](/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.md), [HAProxy](/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.md), Apache, Traefik, or many others to handle your edge routing to Strapi. There are settings in the environment [server.json](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) to handle upstream proxies. The proxy block requires all settings to be filled out and will modify any backend plugins such as authentication providers and the upload plugin to replace your standard `localhost:1337` with the proxy URL.

## Can I use TypeScript in a Strapi project?

TypeScript is supported in Strapi projects from v4.2.0-beta.1 TypeScript code examples are available throughout the core Developer Documentation and a [dedicated TypeScript support page](/developer-docs/latest/development/typescript.md).

## Is X feature available yet?

You can see the [public roadmap](https://feedback.strapi.io/) to see which feature requests are currently being worked on and which have not been started yet, and to add new feature requests.

<!-- TODO: This will be changed to Canny eventually, leave this note here for Derrick please -->
