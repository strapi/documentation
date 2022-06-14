---
title: TypeScript configuration - Strapi Developer Docs
description: Details for the configuration of TypeScript projects
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html
---

# TypeScript project configuration

TypeScript-enabled Strapi applications have a specific [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) with the following dedicated folders and configuration files:

| TypeScript-Specific directories and files | Purpose                                                                                                                                           | Location         |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `./dist` directory                        | Adds the location for compiling the project JavaScript source code.                                                                               | application root |
| `build` directory                         | Contains the compiled administration panel JavaScript source code.  The directory is created on the first `yarn build` or `npm run build` command | `./dist/`         |
| `tsconfig.json` file                      | Manages TypeScript compilation for the server.                                                                                                    | application root |
| `tsconfig.json` file                      | Manages TypeScript compilation for the admin panel.                                                                                               | `./src/admin/`   |

Starting the development environment for a TypeScript-enabled project requires building the admin panel prior to starting the server. In development mode, the application source code is compiled to the `./dist/build` directory and recompiled with each change in the Content-type Builder. To start the application, run the following commands in the root directory:

<code-group>

<code-block title="NPM">

```sh
npm run build
npm run develop
```

</code-block>

 <code-block title="YARN">

```sh
yarn build
yarn develop
```

</code-block>

</code-group>
