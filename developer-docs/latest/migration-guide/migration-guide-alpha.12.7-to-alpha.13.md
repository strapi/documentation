# Migration guide from alpha.12.7 to alpha.13

**Here are the major changes:**

- Rename hook name
- New settings for content manager plugin

**Useful links:**

- Changelog: [https://github.com/strapi/strapi/releases/tag/v3.0.0-alpha.13](https://github.com/strapi/strapi/releases/tag/v3.0.0-alpha.13)
- GitHub diff: [https://github.com/strapi/strapi/compare/v3.0.0-alpha.12.7...v3.0.0-alpha.13.0.1](https://github.com/strapi/strapi/compare/v3.0.0-alpha.12.7...v3.0.0-alpha.13.0.1)

<br>

::: tip
Feel free to [join us on Slack](http://slack.strapi.io) and ask questions about the migration process.
:::

<br>

## Getting started

Install Strapi `alpha.13` globally on your computer. To do so run `npm install strapi@3.0.0-alpha.13.0.1 -g`.

When it's done, generate a new empty project `strapi new myNewProject` (don't pay attention to the database configuration).

<br>

## Update node modules

Update the Strapi's dependencies version (move Strapi's dependencies to `3.0.0-alpha.13.0.1` version) of your project.

Run `npm install strapi@3.0.0-alpha.13.0.1 --save` to update your strapi version.

<br>

## Update the Admin

::: tip
If you performed updates in the Admin, you will have to manually migrate your changes.
:::

Delete your old admin folder and replace it with the new one.

<br>

## Update the Plugins

::: tip
If you did a custom update on one of the plugins, you will have to manually migrate your update.
:::

Copy the fields and relations you had in your `/plugins/users-permissions/models/User.settings.json` and `/plugins/users-permissions/config/jwt.json` file in the new one.

Then, delete your old `plugins` folder and replace it with the new one.

<br>

## ⚠️ Update hook name

We update the name of the hook and the way we load them. `strapi-mongoose` is now `strapi-hook-mongoose`. This rename is needed for `strapi-bookshelf` and `strapi-knex`.
As you can imagine, you also will have to update your hooks' dependencies in the `package.json` of your application.
You also will have to update connectors of you database connections. Update in `./config/environments/**/database.json` file the `connector` key.

That's all, you have now upgraded to Strapi `alpha.13`.
