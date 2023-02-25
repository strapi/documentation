---
title: TypeScript configuration
displayed_sidebar: devDocsSidebar
description: How to configure Strapi for TypeScript development. 

---

# TypeScript project configuration

[TypeScript](/dev-docs/typescript)-enabled Strapi applications have a specific [project structure](/dev-docs/project-structure) with the following dedicated folders and configuration files:

| TypeScript-specific directories and files | Location         | Purpose                                                                                                                                           |
|-------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `./dist` directory                        | application root | Adds the location for compiling the project JavaScript source code.                                                                               |
| `build` directory                         | `./dist`         | Contains the compiled administration panel JavaScript source code.  The directory is created on the first `yarn build` or `npm run build` command |
| `tsconfig.json` file                      | application root | Manages TypeScript compilation for the server.                                                                                                    |
| `tsconfig.json` file                      | `./src/admin/`   | Manages TypeScript compilation for the admin panel.                                                                                               |

