---
title: TypeScript
description: Get started with TypeScript for your Strapi application
displayed_sidebar: cmsSidebar
tags:
- introduction
- typescript
---

# TypeScript 
<VersionBadge version="4.3.0" />

<ExternalLink to="https://www.typescriptlang.org/" text="TypeScript"/> adds an additional type system layer above JavaScript, which means that any valid JavaScript code is also valid TypeScript code. In the context of Strapi development, TypeScript allows for a more type-safe codebase for your application, and provides you with a set of tools for automatic type generation and autocompletion.

## Getting Started with TypeScript in Strapi

There are 2 ways of getting started with TypeScript in Strapi:

- Create a new TypeScript project in Strapi by running the following command in a terminal (additional details can be found in the  [CLI installation](/cms/installation/cli) documentation):

  <Tabs groupId="yarn-npm">

  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn create strapi-app my-project --typescript
  ```
  
  </TabItem>

  <TabItem value="npm" label="NPM">

  ```bash
  npx create-strapi-app@latest my-project --typescript
  ```
  
  </TabItem>

  </Tabs>

- Add TypeScript support to an existing Strapi project using the provided [conversion](/cms/typescript/adding-support-to-existing-project) steps.

<br />

:::strapi What to do next?
- Understand the [structure](/cms/project-structure) of a TypeScript-based Strapi project
- Learn about the [configuration options](/cms/configurations/typescript) options related to TypeScript
- Deep dive into TypeScript-related development [options and features](/cms/typescript/development)
- Read the [guides](/cms/typescript/guides) for specific use cases
:::
