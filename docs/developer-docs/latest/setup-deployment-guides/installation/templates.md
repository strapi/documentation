---
title: Templates - Strapi Developer Docs
description: Quickly create a pre-made Strapi application designed for a specific use case. It allows you to quickly bootstrap a custom Strapi app.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation/templates.html
---

# Templates

A template is a pre-made Strapi configuration designed for a specific use case. It allows bootstrapping a custom Strapi application. A template can configure [collection types and single types](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md), [components](/developer-docs/latest/development/backend-customization/models.html#components-2) and [dynamic zones](/developer-docs/latest/development/backend-customization/models.html#dynamic-zones), and [plugins](/developer-docs/latest/plugins/plugins-intro.html).

:::note
Templates and starters are not the same thing:

- A _template_ is a pre-made Strapi configuration. Note that it's only a configuration, not a configured application. That's because it cannot be run on its own, since it lacks many files, like database configs or the `package.json`. A template is only useful once applied on top of a default Strapi app via the CLI.
- A _starter_ is a pre-made frontend application that consumes a Strapi API.

:::

## Using a template

To create a new Strapi project based on a template, run the following command:

:::: tabs

::: tab yarn

```bash
yarn create strapi-app my-project --template <template-package>
```

:::

::: tab npx

```bash
npx create-strapi-app@latest my-project --template <template-package>
```

:::

::::

Because we use npm to install template packages, `<template-package>` can match [any format](https://docs.npmjs.com/cli/v8/commands/npm-install) that you would give to `npm install`. This includes npm packages, scoped packages, packages with a precise version or tag, as well as local directories for development.

::: tip
For convenience, official Strapi templates also have a shorthand. It lets you omit the `@strapi/template-` prefix from the template npm package name. So the following commands are equivalent:

```bash
# Shorthand
yarn create strapi-app my-project --template blog

# npm package name
yarn create strapi-app my-project --template @strapi/template-blog
```

:::

The `--template` option can be used in combination with all other `create-strapi-app` options (e.g. `--quickstart` or `--no-run`).

## Creating a template

To create a Strapi template, you need to publish a package that follows some rules.

* A template's only concern should be to adapt Strapi to a use case. It should not deal with environment-specific configurations (e.g. databases or upload and email providers). This keeps templates maintainable and avoids conflicts with other CLI options (e.g. `--quickstart`).

* A template should follow a specific file structure, which can be created manually or automatically generated with the [`strapi templates:generate` command](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-templates-generate):

    <code-group>

    <code-block title="YARN">
      yarn strapi templates:generate <path>
    </code-block>

    <code-block title="NPM">
      npx strapi templates:generate <path>
    </code-block>

    </code-group>

### File structure

You can add as many files as you want to the root of your template repository. But it must at least have `template` directory, a `package.json`, and a `template.json` file.

The `template.json` is used to extend the Strapi app's default `package.json`. You can put all the properties that should overwrite the default `package.json` in a root `package` property. For example, a `template.json` might look like this:

```json
{
  "package": {
    "dependencies": {
      "strapi-plugin-graphql": "^4.0.0"
    },
    "scripts": {
      "custom": "node ./scripts/custom.js"
    }
  }
}
```

The `template` directory is where you can extend the file contents of a Strapi project. All the children are optional, you should only include the files that will overwrite the default Strapi app.

Only the following contents are allowed inside the `template` directory:

- `README.md`: the readme of an app made with this template
- `.env.example`: to specify required environment variables
- `src/`
- `data/` to store the data imported by a seed script
- `public/` to serve files
- `scripts/` for custom scripts

If any unexpected file or directory is found, the installation will crash.

### Step by step

After reading the above rules, follow these steps to create your template:

1. Create a standard Strapi app with `create-strapi-app`, using the `--quickstart` option.
2. Customize your app to match the needs of your use case.
3. Generate your template using the [CLI](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-templates-generate) by running `strapi templates:generate <path>`
4. Navigate to this path to see your generated template
5. If you have modified your app's `package.json`, include these changes (and _only_ these changes) in `template.json` in a `package` property. Otherwise, leave it as an empty object.
6. Enter `npm publish` to make your template available on the npm package registry.
