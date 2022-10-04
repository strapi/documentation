---
title: TypeScript configuration - Strapi Developer Docs
description: Details for TypeScript configuration 
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/typescript.html
---

# TypeScript project configuration

[TypeScript](/developer-docs/latest/development/typescript.md)-enabled Strapi applications have a specific [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md) with the following dedicated folders and configuration files:

| TypeScript-specific directories and files | Location         | Purpose                                                                                                                                           |
|-------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `./dist` directory                        | application root | Adds the location for compiling the project JavaScript source code.                                                                               |
| `build` directory                         | `./dist`         | Contains the compiled administration panel JavaScript source code.  The directory is created on the first `yarn build` or `npm run build` command |
| `tsconfig.json` file                      | application root | Manages TypeScript compilation for the server.                                                                                                    |
| `tsconfig.json` file                      | `./src/admin/`   | Manages TypeScript compilation for the admin panel.                                                                                               |
