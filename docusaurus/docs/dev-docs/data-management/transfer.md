---
title: Data transfer
description: Transfer data using the Strapi CLI
displayed_sidebar: devDocsSidebar
canonicalUrl: https://docs.strapi.io/dev-docs/data-management/transfer.html
tags:
- data management system
- data transfer
- strapi transfer
- environment 
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Data transfer

<NotV5 />

The `strapi transfer` command streams your data from one Strapi instance to another Strapi instance. The `transfer` command uses strict schema matching, meaning your two Strapi instances need to be exact copies of each other except for the contained data. The default `transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The command allows you to transfer data:

- from a local Strapi instance to a remote Strapi instance
- from a remote Strapi instance to a local Strapi instance

:::caution

* If you are using an SQLite database in the destination instance other database connections will be blocked while the `transfer` operation is running.
* Admin users and API tokens are not transferred.
* If you use websockets or Socket.io in your projects, the transfer command will fail. You will need to **temporarily disable websockets or Socket.io** or ensure that your websocket server is running on a different port than the Strapi server, or a on a specific route within Strapi to use the transfer command.

:::

The CLI command consists of the following arguments:

| Option         | Description                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--to`         | Full URL of the `/admin` endpoint on the destination Strapi instance<br />(e.g. `--to https://my-beautiful-strapi-website/admin`)            |
| `‑‑to‑token`   | Transfer token from the Strapi destination instance.                                                                                         |
| `--from`       | Full URL of the `/admin` endpoint of the remote Strapi instance to pull data from (e.g., `--from https://my-beautiful-strapi-website/admin`) |
| `‑‑from‑token` | Transfer token from the Strapi source instance.                                                                                              |
| `--force`      | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                            |
| `--exclude`    | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                    |
| `--only`       | Include only these data. The available types are: `content`, `files`, and `config`.                                                          |
| `--throttle` | Time in milliseconds to inject an artificial delay between the "chunks" during a transfer. |

:::caution
Either `--to` or `--from` is required.
:::

:::tip
Data transfers are authorized by transfer tokens, which are [managed from the admin panel](/user-docs/settings/transfer-tokens). From the admin panel, you can manage role-based permissions to tokens including `view`, `create`, `read`, `regenerate` and `delete`.
:::

:::warning
When using nginx and a server that proxies requests into a localhost, issues might occur. To prevent them, ensure all the headers are forwarded correctly by changing the configuration file in `/etc/nginx/sites-available/yourdomain` as follows:

```
server {
    listen 80;
    server_name <yourdomain>;
    location / {
        proxy_pass http://localhost:1337;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        include proxy_params;
    }
}
```

:::

## Generate a transfer token

:::prerequisites
A salt transfer token should be defined in the [admin panel configuration](/dev-docs/configurations/admin-panel) file.
:::

The `strapi transfer` command requires a transfer token issued by the destination instance. To generate a transfer token in the admin panel use the instructions in the [User Guide](/user-docs/settings/transfer-tokens).

## Setup and run the data transfer

Initiating a data transfer depends on whether you want to push data to a remote instance or to pull data from the remote:

<Tabs>

<TabItem value="push" label="Push data to remote">

  1. Start the Strapi server for the destination instance.
  2. In a new terminal window, navigate to the root directory of the source instance.
  3. Run the following minimal command to initiate the transfer, ensuring `destinationURL` is the full URL to the admin panel (i.e., the URL includes the `/admin` part):

    <Tabs groupId="yarn-npm">

    <TabItem value="yarn" label="yarn">

    ```bash
    yarn strapi transfer --to destinationURL
    ```

    </TabItem>

    <TabItem value="npm" label="npm">

    ```bash
    npm run strapi transfer -- --to destinationURL
    ```

    </TabItem>

    </Tabs>
  
  4. Add the transfer token when prompted to do so.
  5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete all of the remote Strapi assets and its database. Are you sure you want to proceed?"

</TabItem>

<TabItem value="pull" label="Pull data from remote">

1. Start the Strapi server for the source instance.
2. In a new terminal window, navigate to the root directory of the destination instance.
  3. Run the following minimal command to initiate the transfer, ensuring `remoteURL` is the full URL to the admin panel (i.e., the URL includes the `/admin` part):

  <Tabs groupId="yarn-npm">

  <TabItem value="yarn" label="yarn">

  ```bash
  yarn strapi transfer --from remoteURL
  ```

  </TabItem>

  <TabItem value="npm" label="npm">

  ```bash
  npm run strapi transfer -- --from remoteURL
  ```

  </TabItem>

  </Tabs>

4. Add the transfer token when prompted to do so.
5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete all of the local Strapi assets and its database. Are you sure you want to proceed?".

</TabItem>
</Tabs>

## Bypass all `transfer` command line prompts

When using the `strapi transfer` command, you are required to confirm that the transfer will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is useful for implementing `strapi transfer` programmatically. You must pass the `to-token` option with the transfer token if you use the `--force` option.

:::caution
The `--force` option bypasses all warnings about content deletion.
:::

### Example: bypass the `transfer` command line prompts with `--force`

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token --force
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token --force
```

</TabItem>

</Tabs>

## Include only specified data types during transfer

The default `strapi transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to transfer only the listed items by passing a comma-separated string with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always transferred, as schema matching is used for `strapi transfer`.

### Example: only transfer files

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --only files
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --only files
```

</TabItem>

</Tabs>

## Exclude data types during transfer

The default `strapi transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi transfer`.

### Example: exclude files from transfer

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --exclude files
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --exclude files
```

</TabItem>

</Tabs>

:::warning
Any types excluded from the transfer will be deleted in your destination instance. For example, if you exclude `config` the project configuration in your destination instance will be deleted.
:::

## Manage data transfer with environment variables

The environment variable `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` is available to disable remote data transfer. In addition to the [RBAC permissions](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings) in the admin panel this can help you secure your Strapi application. To use `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` you can add it to your `.env` file or preface the `start` script. See the following example:

```bash
STRAPI_DISABLE_REMOTE_DATA_TRANSFER=true yarn start
```

Additional details on using environment variables in Strapi are available in the [Environment configurations documentation](/dev-docs/configurations/environment).

## Test the transfer command locally

The `transfer` command is not intended for transferring data between two local instances. The [`export`](/dev-docs/data-management/export) and [`import`](/dev-docs/data-management/import) commands were designed for this purpose. However, you might want to test `transfer` locally on test instances to better understand the functionality before using it with a remote instance. The following documentation provides a fully-worked example of the `transfer` process.

### Create and clone a new Strapi project

1. Create a new Strapi project using the installation command:

   ```bash
   npx create-strapi-app@latest <project-name> --quickstart
   ```

2. Create at least 1 content type in the project. See the [Quick Start Guide](/dev-docs/quick-start) if you need instructions on creating your first content type.

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

### Add data to the first Strapi instance

1. Return to the first Strapi instance and add data to the content type.
2. Stop the server on the first instance.

### Create a transfer token

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
3. [Create and copy a transfer token](/user-docs/settings/transfer-tokens).
4. Leave the server running.

### Transfer your data

1. Return the the first Strapi instance.
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
In some cases you might receive a connection refused error targeting `localhost`. Try changing the address to [http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin).
:::

<FeedbackPlaceholder />
