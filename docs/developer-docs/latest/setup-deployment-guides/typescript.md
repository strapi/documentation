---
title: Typescript - Strapi Developer Docs
description: Learn how you can use Typescript for your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/databases/typescript.html
---

# TypeScript 

::: callout 🚧  Typescript documentation
This section is still a work in progress and will continue to be updated and improved. In the meantime, feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
:::

TypeScript adds an additional type system layer above JavaScript, which means that existing JavaScript code is also TypeScript code. Strapi supports TypeScript in new and existing projects running v4.2.0 and above. The core Developer Documentation contains code snippets in both JavaScript and TypeScript.

## Creating a new TypeScript project

Create a Strapi project with Typescript support by using the `--ts` or `--typescript` flags with either the npm or yarn package manager.

::: tip
Adding the quickstart flag `--quickstart` will create the project with an SQlite database.
:::

<code-group>

<code-block title="NPM">
```sh
npx create-strapi-app@beta my-app --ts
#or
npx create-strapi-app@beta my-app --typescript
```
</code-block>

<code-block title="YARN">
```sh
[code goes here]
```
</code-block>

</code-group>

## Understanding TypeScript Support

When a Strapi project is created with the TypeScript enabled, two `tsconfig.json` files are created

- `tsconfig.json` file at the root of the project, to manage TypeScript compilation for the server
- `/src/admin/tsconfig.json` to manage TypeScript compilation for the admin

TypeScript-enabled projects also contain a `dist` directory, which is used to compile the project JavaScript source code.

## Adding TypeScript to an existing project

## Backend customization (routes, controllers, services)
