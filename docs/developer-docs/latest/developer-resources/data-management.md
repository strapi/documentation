---
title: Data Management System - Strapi Developer Docs
description: Import, export, and transfer data using the Strapi CLI
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/export-import.html
---

# Data Management System

:::callout 🚧 Feature under development
The data management system is under development. Not all use cases are covered by the initial release. You can provide feedback about desired functionality on the [Strapi feedback website](https://feedback.strapi.io). The feature is available in v4.6.0 and later versions.

The `strapi transfer` command is available in beta release only. See [Transfer data using the CLI tool](#transfer-data-using-the-cli-tool) for beta version installation instructions.

:::

Occasionally you need to move data out of or into a Strapi instance. The data management system allows you to efficiently extract data from an existing instance or archive and import that data into a separate instance. Additionally, the data management system allows you to transfer data between a local Strapi instance and a remote Strapi instance. Strapi provides CLI-based commands that allow you to export, import, and transfer data. Common use cases include:

- [creating a data backup](#export-data-using-the-cli-tool),
- [restoring data from a backup](#import-data-using-the-cli-tool),
- [transfer data from a local to remote instance](#transfer-data-using-the-cli-tool).

 The following documentation details examples of how to use the `strapi export`, `strapi import`, and `strapi transfer` commands.

:::strapi Command Line Interface (CLI) shortcut
If you want to skip the details and examples the `strapi export`, `strapi import`, and `strapi tranfer` CLI commands with all of the available options are listed in the [Command Line Interface documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-export).
:::

:::caution
Interactive CLI commands do not currently work with the `npm` package manager. For `strapi export` and `strapi import` this means the encryption key prompt is not visible in the CLI. A fix is anticipated by early March 2023. In the meantime consider using the `yarn` package manager.
:::

## Export data using the CLI tool

The `strapi export` command, by default, exports data as an encrypted and compressed `.tar.gz.enc` file. The default export command exports:

- the project configuration,
- entities: all of your content,
- links: relations between your entities,
- assets: files stored in the uploads folder,
- schemas,
- the `metadata.json` file.

:::caution
Admin users and API tokens are not exported.
:::

### Name the export file

Exported data are contained in a `.tar` file that is automatically named using the format `export_YYYYMMDDHHMMSS`. You can optionally name the exported file by passing the `--file` or `-f` option with the `strapi export` command. Do not include a file extension.

#### Example: Export data with a custom filename
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --file my-strapi-export
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export  -- --file my-strapi-export
```

</code-block>
</code-group>

### Configure data encryption

The default `strapi export` command encrypts your project data using `aes-128-ecb` encryption and adds the file extension `.enc`. To use encryption you need to pass an encryption key using the `-k` or `--key` option or enter an encryption key when prompted. The encryption key is a `string` with no minimum character count.

:::tip Encryption keys
Strong encryption keys are encouraged to protect sensitive data in your project. [OpenSSL](https://www.openssl.org/) is a resource for generating encryption keys.
:::

To disable encryption, pass the `--no-encrypt` option with the `strapi export` command.

#### Example: Export data without encryption

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --no-encrypt
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export -- --no-encrypt
```

</code-block>
</code-group>

#### Example: Export data with the encryption `--key` option

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export -- --key my-encryption-key
```

</code-block>
</code-group>

### Disable data compression

The default `strapi export` command compresses your project data using `gzip` compression and adds the `.gz` file extension.

To disable compression, pass the `--no-compress` option with the `strapi export` command.

#### Example: Export data without compression
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --no-compress
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export -- --no-compress
```

</code-block>
</code-group>

### Export only selected types of data

The default `strapi export` command exports your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to export only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always exported, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--only` flag to export `content`, the asset database records are still included, and could render as broken links.
:::

#### Example: Export only entities and relations
<br/>

<code-group>
<code-block title="YARN">

```bash
yarn strapi export --only content
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export -- --only content
```

</code-block>
</code-group>

### Exclude items from export

The default `strapi export` command exports your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--exclude` flag to remove assets, the database records are still included, and could render as broken links.
:::

#### Example: Export data excluding assets, entities, and relations
<br/>

<code-group>
<code-block title="YARN">

```bash
yarn strapi export --exclude files,content
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi export -- --exclude files,content
```

</code-block>
</code-group>

:::note
The `--exclude` option and `--only` option cannot be used together.
:::

## Import data using the CLI tool

:::warning

- `strapi import` deletes all existing data, including the database and uploads directory, before importing the backup file.
- The source and destination schemas must match to successfully use `strapi import`, meaning all content types must be identical.
- Restored data does not include the `Admin users` table, which means that `createdBy` and `updatedBy` are empty in a restored instance.  

:::

### Specify the import file

To import data into a Strapi instance use the `strapi import` command in the project root directory. Specify the file to be imported using the `-f` or `--file` option. The filename, extension, and path are required. If the file is encrypted, you are prompted for the encryption key before the import starts.
 
#### Example: Minimum command to import data from a file in the Strapi project root

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi import -- -f export_20221213105643.tar.gz.enc
```

</code-block>
</code-group>

### Provide an encryption key

If you are importing data from an encrypted file the encryption key can be passed with the `strapi import` command by using the `-k` or `--key` option.

#### Example: Pass the encryption key with the `strapi import` command
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi import -- -f export_20221213105643.tar.gz.enc --key my-encryption-key
```

</code-block>
</code-group>

### Bypass all `import` command line prompts

When using the `strapi import` command, you are required to confirm that the import will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is particularly useful for implementing `strapi import` programmatically. For programmatic use, you must also pass the `--key` option for encrypted files.

#### Example: bypass command line prompts with `--force`

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc --force --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi import -- -f export_20221213105643.tar.gz.enc --force --key my-encryption-key
```

</code-block>
</code-group>

### Exclude data types during import

The default `strapi import` command imports your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi import`.

::: warning
Any types excluded from the import will be deleted in your destination instance. For example, if you exclude `config` the project configuration in your destination instance will be deleted.
:::

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--exclude` flag to remove assets, the database records are still included, and could render as broken links.
:::

#### Example: exclude assets from an import

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc --exclude files
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi import -- -f export_20221213105643.tar.gz.enc --exclude files
```

</code-block>
</code-group>

### Include only specified data types during import

The default `strapi import` command imports your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to export only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always imported, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--only` flag to import `content` the asset database records are still included, and could render as broken links.
:::

#### Example: import only the project configuration

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc --only config
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi import -- -f export_20221213105643.tar.gz.enc --only config
```

</code-block>
</code-group>

## Transfer data using the CLI tool <BetaBadge />

:::strapi Install the beta version
`strapi transfer` is only available in the current beta version. To create a new project using the beta version, run the following command in your terminal:

```bash
npx create-strapi-app@beta <project-name>
```

:::

The `strapi transfer` command streams your data from one Strapi instance to another Strapi instance. The `transfer` command uses strict schema matching, meaning your two Strapi instances need to be exact copies of each other except for the contained data. The default `transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas.

:::caution

- If you are using an SQLite database in the destination instance other database connections will be blocked while the `transfer` operation is running.
- Assets that are contained in the local Media Library provider are transferred to the same provider in the remote instance. This means that if you use the default Media Library locally and an S3 bucket in your remote instance, the `transfer` command does not add assets to your S3 bucket.

:::

The CLI command consists of the following arguments:

| Option     | Description                                                                                                                        | Required |
|------------|--------------------------------------------------------------| :------: |
| `--to`       | URL of the destination Strapi instance. The endpoint is `/admin`.                                                                      | required |
| `‑‑to‑token` | Transfer token from the Strapi destination instance.        |-         |
| `--force`    | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                                                           |-         |
| `--exclude`  | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                                                    |-         |
| `--only`     | Include only these data. The available types are: `content`, `files`, and `config`.                                                                    |-         |

 The command allows you to transfer data between:

- a local Strapi instance and a remote Strapi instance,
- a remote Strapi instance and another remote Strapi instance.

:::tip
Data transfers are authorized by Transfer tokens, which are generated in the Admin panel. From the Admin panel you can manage role-based permissions to tokens including `view`, `create`, `read`, `regenerate` and `delete`. See the [User Guide](/user-docs/latest/settings/managing-global-settings.md#creating-a-new-transfer-token) for details on how to create and manage Transfer tokens.
:::

### Generate a transfer token

The `strapi transfer` command requires a Transfer token issued by the destination instance. To generate a Transfer token in the Admin panel use the instructions in the [User Guide](/user-docs/latest/settings/managing-global-settings.md#creating-a-new-transfer-token).


### Setup and run the data transfer

To initiate a data transfer:

1. Start the Strapi server for the destination instance.
2. In a new terminal window, navigate to the root directory of the source instance.
3. Run the following minimal command to initiate the transfer:

    <code-group>
    <code-block title="YARN">

    ```bash
    yarn strapi transfer --to <destination URL>
    ```

    </code-block>

    <code-block title="NPM">

    ```bash
    npm strapi yarn strapi transfer -- --to <destination URL>
    ```

    </code-block>
    </code-group>

4. Add the Transfer token when prompted to do so.
5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete all data in the remote database and media files. Are you sure you want to proceed?"
6. If you answer **Yes** in step 4, the transfer operation initiates and, when completed, prints a summary of the transferred types in the CLI.

### Bypass all `transfer` command line prompts

When using the `strapi transfer` command, you are required to confirm that the transfer will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is particularly useful for implementing `strapi transfer` programmatically. You must pass the `to-token` option with the Transfer token if you use the --force option.

#### Example: bypass the `transfer` command line prompts with `--force`

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi transfer --to https://example.com/admin --to-token <my-transfer-token> --force 
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token <my-transfer-token> --force 
```

</code-block>
</code-group>

### Include only specified data types during transfer

The default `strapi transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to transfer only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always transferred, as schema matching is used for `strapi transfer`.

#### Example: only transfer files
<br/>

<code-group>
<code-block title="YARN">

```bash
yarn strapi transfer --to https://example.com/admin --only files
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi transfer -- --to https://example.com/admin --only files
```

</code-block>
</code-group>

### Exclude data types during transfer

The default `strapi transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi transfer`.

#### Example: exclude files from transfer
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi transfer --to https://example.com/admin --exclude files
```

</code-block>

<code-block title="NPM">

```bash
npm run strapi transfer -- --to https://example.com/admin --exclude files
```

</code-block>
</code-group>

::: warning
Any types excluded from the transfer will be deleted in your destination instance. For example, if you exclude `config` the project configuration in your destination instance will be deleted.
:::

### Managing data transfer with environment variables

The environment variable `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` is available to disable remote data transfer. In addition to the RBAC permissions in the Admin panel this can help you secure your Strapi application. To use `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` you can add it to your `.env` file or preface the `start` script. See the following example:

```bash
STRAPI_DISABLE_REMOTE_DATA_TRANSFER=true yarn start
```

Additional details on using environment variables in Strapi are available in the [Environment configurations documentation](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md).

### Test the transfer command locally

The `transfer` command is not intended for transferring data between two local instances. The [`export`](#export-data-using-the-cli-tool) and [`import`](#import-data-using-the-cli-tool) commands were designed for this purpose. However, you might want to test `transfer` locally on test instances to better understand the functionality before using it with a remote instance. The following documentation provides a fully-worked example of the `transfer` process.

#### Create and clone a new Strapi project

1. Create a new Strapi project using the `beta` installation command:

    ```bash
    npx create-strapi-app@beta <project-name> --quickstart
    ```

2. Create at least 1 content type in the project. See the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md) if you need instructions on creating your first content type.

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

#### Add data to the first Strap instance

1. Return to the first Strapi instance and add data to the content type.
2. Stop the server on the first instance.

#### Create a transfer token

1. Navigate to the second Strapi instance and run the `build` and `start` commands in the root directory:

    <code-group>
    <code-block title="YARN">

    ```bash
    yarn build && yarn start
    ```

    </code-block>

    <code-block title="NPM">

    ```bash
    npm run build && npm run start
    ```

    </code-block>
    </code-group>

2. Register an admin user.
3. [Create and copy a Transfer token](user-docs/latest/settings/managing-global-settings.md#managing-transfer-tokens).
4. Leave the server running.

#### Transfer your data

1. Return the the first Strapi instance.
2. In the terminal run the `strapi transfer` command:

    <code-group>
    <code-block title="YARN">

    ```bash
    yarn strapi transfer --to http://localhost:1337/admin
    ```

    </code-block>

    <code-block title="NPM">

    ```bash
    npm run strapi transfer -- --to http://localhost:1337/admin
    ```

    </code-block>
    </code-group>

3. When prompted, apply the Transfer token.
4. When the transfer is complete you can return to the second Strapi instance and see that the content is successfully transferred.

:::tip
In some cases you might receive a connection refused error targeting `localhost`. Try changing the address to [http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin).
:::

<FeedbackPlaceholder />
