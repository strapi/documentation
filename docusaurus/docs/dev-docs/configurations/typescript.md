---
title: TypeScript configuration
displayed_sidebar: devDocsSidebar
description: How to configure Strapi for TypeScript development. 

---

# TypeScript project configuration

Adding [TypeScript](/dev-docs/typescript) to your Strapi project results in 2 main differences as compared to a vanilla JavaScript project:

- Projects have a specific [project structure](/dev-docs/project-structure) with additional folders and TypeScript-specific configuration files.
- An additional `config/typescript.js|ts` configuration file can be added to define some [Strapi-specific configuration](#strapi-specific-configuration-for-typescript) related to TypeScript.

## Project structure and TypeScript-specific configuration files

[TypeScript](/dev-docs/typescript)-enabled Strapi applications have a specific [project structure](/dev-docs/project-structure) with the following dedicated folders and configuration files:

| TypeScript-specific directories and files | Location         | Purpose                                                                                                                                           |
|-------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `./dist` directory                        | application root | Adds the location for compiling the project JavaScript source code.                                                                               |
| `build` directory                         | `./dist`         | Contains the compiled administration panel JavaScript source code.  The directory is created on the first `yarn build` or `npm run build` command |
| `tsconfig.json` file                      | application root | Manages TypeScript compilation for the server.                                                                                                    |
| `tsconfig.json` file                      | `./src/admin/`   | Manages TypeScript compilation for the admin panel.                                                                                               |

## Strapi-specific configuration for TypeScript <BetaBadge />

When a Strapi project uses TypeScript, an optional `config/typescript.js|ts` configuration file can be added, which currently accepts only one parameter:

| Parameter      | Description                                            | Type      | Default |
| -------------- | ------------------------------------------------------ | --------- | ------- |
| `autogenerate` | Automatically generate typings as you develop (see [generating typings](/dev-docs/typescript#generate-typings-for-project-schemas)) | `Boolean` | `false` |

**Example:**

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/typescript.js"

module.exports = ({ env }) => ({
  autogenerate: true,
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/typescript.ts"

export default ({ env }) => ({
  autogenerate: true,
});
```

</TabItem>

</Tabs>
