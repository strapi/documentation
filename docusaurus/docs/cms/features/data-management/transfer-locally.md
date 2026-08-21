---
title: Test a data transfer locally
description: Practice the strapi transfer workflow between two local Strapi instances before transferring to a remote instance
displayed_sidebar: cmsSidebar
pagination_prev: cms/features/data-management/transfer
pagination_next: cms/features/draft-and-publish
tags:
- data management system
- data transfer
- strapi transfer
---

# Test a data transfer locally

<Tldr>

A fully-worked example of the `strapi transfer` workflow between two local Strapi instances, to get familiar with the command before using it against a remote instance.

</Tldr>

The `transfer` command is not intended for transferring data between two local instances. The [`export`](/cms/features/data-management/export) and [`import`](/cms/features/data-management/import) commands were designed for this purpose. However, you might want to test `transfer` locally on test instances to better understand the functionality before using it with a remote instance. The following documentation provides a fully-worked example of the `transfer` process.

## Create and clone a new Strapi project

1. Create a new Strapi project using the installation command:

   ```bash
   npx create-strapi-app@latest <project-name> --quickstart
   ```

2. Create at least 1 content type in the project. See the [Quick Start Guide](/cms/quick-start) if you need instructions on creating your first content type.

   :::caution
   Do not add any data to your project at this step.
   :::

3. Commit the project to a git repository:

   ```bash
   git init
   git add .
   git commit -m "first commit"
   ```

4. Clone the project repository:

   ```bash
   cd .. # move to the parent directory
   git clone <path to created git repository>.git/ <new-instance-name>
   ```

5. Move into the cloned project and install its dependencies:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="yarn">

```bash
cd <new-instance-name>
yarn install
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
cd <new-instance-name>
npm install
```

</TabItem>
</Tabs>

   Without this step, the next `build` and `start` commands fail because `strapi` is not yet on the project's local executable path.

## Add data to the first Strapi instance

1. Return to the first Strapi instance and add data to the content type.
2. Stop the server on the first instance.

## Create a transfer token

1. Navigate to the second Strapi instance and run the `build` and `start` commands in the root directory:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn build && yarn start
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run build && npm run start
```

</TabItem>

</Tabs>

2. Register an admin user.
3. [Create and copy a transfer token](/cms/features/data-management#admin-panel-settings).
4. Leave the server running.

## Transfer your data

1. Return to the first Strapi instance.
2. In the terminal run the `strapi transfer` command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to http://localhost:1337/admin
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to http://localhost:1337/admin
```

</TabItem>

</Tabs>

3. When prompted, apply the transfer token.
4. When the transfer is complete you can return to the second Strapi instance and see that the content is successfully transferred.

:::tip
In some cases you might receive a connection refused error targeting `localhost`. Try changing the address to <ExternalLink to="http://127.0.0.1:1337/admin" text="http://127.0.0.1:1337/admin"/>.
:::

