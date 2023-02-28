---
title: Data transfer
description: Transfer data using the Strapi CLI
displayed_sidebar: devDocsSidebar
canonicalUrl: https://docs.strapi.io/dev-docs/data-management/transfer.html
---
# Data transfer

The `strapi transfer` command streams your data from one Strapi instance to another Strapi instance. The `transfer` command uses strict schema matching, meaning your two Strapi instances need to be exact copies of each other except for the contained data. The default `transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The command allows you to transfer data between:

- a local Strapi instance and a remote Strapi instance,
- a remote Strapi instance and another remote Strapi instance.

:::caution

- If you are using an SQLite database in the destination instance other database connections will be blocked while the `transfer` operation is running.
- Assets that are contained in the local Media Library provider are transferred to the same provider in the remote instance. This means that if you use the default Media Library locally and an S3 bucket in your remote instance, the `transfer` command does not add assets to your S3 bucket.

:::

The CLI command consists of the following arguments:

| Option     | Description                                                                                                                        | Required |
|------------|--------------------------------------------------------------| :------: |
| `--to`       | URL of the destination Strapi instance. The endpoint is `/admin`.                                                                      | Yes |
| `‑‑to‑token` | Transfer token from the Strapi destination instance.        |No         |
| `--force`    | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                                                          |No         |
| `--exclude`  | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                                                    |No         |
| `--only`     | Include only these data. The available types are: `content`, `files`, and `config`.                                                                    |No         |

:::tip
Data transfers are authorized by Transfer tokens, which are generated in the Admin panel. From the Admin panel you can manage role-based permissions to tokens including `view`, `create`, `read`, `regenerate` and `delete`. See the [User Guide](/user-docs/settings/managing-global-settings#creating-a-new-transfer-token) for details on how to create and manage Transfer tokens.
:::

## Generate a transfer token

The `strapi transfer` command requires a Transfer token issued by the destination instance. To generate a Transfer token in the Admin panel use the instructions in the [User Guide](/user-docs/settings/managing-global-settings#creating-a-new-transfer-token).

## Setup and run the data transfer

To initiate a data transfer:

1. Start the Strapi server for the destination instance.
2. In a new terminal window, navigate to the root directory of the source instance.
3. Run the following minimal command to initiate the transfer:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to destination URL
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm strapi yarn strapi transfer -- --to destination URL
```

</TabItem>

</Tabs>

4. Add the Transfer token when prompted to do so.
5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete all data in the remote database and media files. Are you sure you want to proceed?"

## Bypass all `transfer` command line prompts

When using the `strapi transfer` command, you are required to confirm that the transfer will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is useful for implementing `strapi transfer` programmatically. You must pass the `to-token` option with the Transfer token if you use the `--force` option.

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

The default `strapi transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to transfer only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always transferred, as schema matching is used for `strapi transfer`.

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

The environment variable `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` is available to disable remote data transfer. In addition to the [RBAC permissions](/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings) in the Admin panel this can help you secure your Strapi application. To use `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` you can add it to your `.env` file or preface the `start` script. See the following example:

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
3. [Create and copy a Transfer token](/user-docs/settings/managing-global-settings#creating-a-new-transfer-token).
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

3. When prompted, apply the Transfer token.
4. When the transfer is complete you can return to the second Strapi instance and see that the content is successfully transferred.

:::tip
In some cases you might receive a connection refused error targeting `localhost`. Try changing the address to [http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin).
:::

<FeedbackPlaceholder />
