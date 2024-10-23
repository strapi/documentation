---
title: TypeScript
description: Get started with TypeScript for your Strapi application
pagination_next: dev-docs/typescript/development
tags:
- introduction
- typescript
---

# TypeScript 

[TypeScript](https://www.typescriptlang.org/) adds an additional type system layer above JavaScript, which means that any valid JavaScript code is also valid TypeScript code. In the context of Strapi development, TypeScript allows for a more type-safe codebase for your application, and provides you with a set of tools for automatic type generation and autocompletion.

## Getting Started with TypeScript in Strapi

:::prerequisites Prerequisite
You're running Strapi version 4.3.0 and above.
:::

There are 2 ways of getting started with TypeScript in Strapi:

- Create a new TypeScript project in Strapi by running the following command in a terminal (additional details can be found in the  [CLI installation](/dev-docs/installation/cli) documentation):

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

- Add TypeScript support to an existing Strapi project using the provided [conversion](/dev-docs/typescript/adding-support-to-existing-project) steps.

<br />

:::strapi What to do next? 
- Understand the [structure](/dev-docs/project-structure) of a TypeScript-based Strapi project
- Learn about the [configuration options](/dev-docs/configurations/typescript) options related to TypeScript
- Deep dive into TypeScript-related development [options and features](/dev-docs/typescript/development)
:::
