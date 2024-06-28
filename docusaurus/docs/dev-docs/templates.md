---
title: Templates
description: Quickly create a pre-made Strapi application designed for a specific use case. It allows you to quickly bootstrap a custom Strapi application.
displayed_sidebar: devDocsSidebar

---

# Templates

:::caution
Templates are currently not usable with Strapi 5 pre-releases versions (beta or release candidate versions). Templates will be available again with the Strapi 5 stable release.
:::

Templates are pre-made Strapi configurations designed for specific use cases. They allow bootstrapping a custom Strapi application. A template can configure [collection types and single types](/user-docs/content-type-builder), [components](/dev-docs/backend-customization/models.md#components-2) and [dynamic zones](/dev-docs/backend-customization/models.md#dynamic-zones), and [plugins](/dev-docs/plugins).

:::strapi Templates vs. Starters

- A template is only useful once applied on top of a default Strapi application via the CLI. It is not a configured application and cannot be run on its own since it lacks many files (e.g. database configurations, `package.json`, etc.).
- A starter is a pre-made frontend application that consumes a Strapi API. Only one starter is currently available, the [Next.js starter](https://strapi.io/starters).

:::

## Using a template

To create a new Strapi project based on a template, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```sh
yarn create strapi-app my-project --template <template-package>
```

</TabItem>

<TabItem value="npm" label="NPM">

```sh
npx create-strapi-app@latest my-project --template <template-package>
```

</TabItem>

</Tabs>

npm is used to install template packages, so `<template-package>` can match [any format](https://docs.npmjs.com/cli/v8/commands/npm-install) supported by `npm install`. This includes npm packages, scoped packages, packages with a precise version or tag, and local directories for development.

:::tip
For convenience, official Strapi templates also have a shorthand, making it possible to omit the `@strapi/template-` prefix from the template npm package name:

```sh
# use the full template name
yarn create strapi-app my-project --template @strapi/template-blog

# use the shorthand
yarn create strapi-app my-project --template blog
```

:::

The `--template` option can be used in combination with all other `create-strapi-app` options (e.g. `--quickstart` or `--no-run`).

## Creating a template

Templates are generated from a customized Strapi application and published to the npm package registry. Before creating a template make sure you have a Strapi application that matches your use case and that you have read the [template requirements](#requirements).

### Requirements

Keep the following requirements in mind when creating a template:

* Templates should not deal with environment-specific configurations (e.g. databases or upload and email providers). This keeps templates maintainable and avoids conflicts with other CLI options (e.g. `--quickstart`).

* Templates must follow a specific file structure, containing the following at the repository's root:
    * [`template` directory](#template-directory)
    * [`package.json` file](https://docs.npmjs.com/creating-a-package-json-file)
    * [`template.json` file](#template-json-file)

This structure can be created manually or automatically generated with the [`strapi templates:generate` command](/dev-docs/cli#strapi-templates-generate):

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```sh
yarn strapi templates:generate <path>
```

</TabItem>

<TabItem value="npm" label="NPM">
  
```sh
npx strapi templates:generate [path]
```
  
</TabItem>

</Tabs>

The repository root can contain any other files or directories desired, but must include the `template` directory, `package.json` file, and `template.json` file at a minimum.

#### `template` directory

The `template` directory is used to extend the file contents of a Strapi project and should only include the files that will overwrite the default Strapi application.

Only the following contents are allowed inside the `template` directory:

- `README.md`: the readme of an application made with this template
- `.env.example` to specify required environment variables
- `src/`
- `data/` to store the data imported by a seed script
- `public/` to serve files
- `scripts/` for custom scripts

:::caution
If any unexpected file or directory is found, the installation will crash.
:::

#### `template.json` file

The `template.json` is used to extend the Strapi application's default `package.json`. All properties overwriting the default `package.json` should be included in a root `package` property:

```json title="./template.json"

{
  "package": {
    "dependencies": {
      "@strapi/plugin-graphql": "^4.0.0"
    },
    "scripts": {
      "custom": "node ./scripts/custom.js"
    }
  }
}
```

### Packaging and publishing

With the above [requirements](#requirements) in mind, follow these steps to create and publish a template:

1. [Create a standard Strapi application](/dev-docs/quick-start) with `create-strapi-app`, using the `--quickstart` option.
2. Customize your application to match the needs of your use case.
3. Generate your template using the [CLI](/dev-docs/cli#strapi-templates-generate) by running `strapi templates:generate <path>`
4. Navigate to this path to see your generated template.
5. If you have modified your application's `package.json`, include these changes (and _only_ these changes) in `template.json` in a `package` property. If not, leave it as an empty object.
6. Enter `npm publish` to make your template available on the npm package registry.

:::strapi List of templates
[Strapi-maintained](https://github.com/strapi/starters-and-templates) templates and [community-maintained](https://github.com/strapi/community-content/tree/master/templates) templates can be found on GitHub.
:::
