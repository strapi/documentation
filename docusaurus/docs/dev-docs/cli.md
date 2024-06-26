---
title: Command Line Interface
displayed_sidebar: devDocsSidebar
description: Strapi comes with a full featured Command Line Interface (CLI) which lets you scaffold and manage your project in seconds.
---

# Command Line Interface (CLI)

Strapi comes with a full featured Command Line Interface (CLI) which lets you scaffold and manage your project in seconds. The CLI works with both the `yarn` and `npm` package managers.

:::caution
Interactive commands such as `strapi admin:create-user` don't display prompts with `npm`. A fix for the `npm` package manager is anticipated by March 2023. In the meantime, consider using the `yarn` package manager.
:::

:::note
It is recommended to install Strapi locally only, which requires prefixing all of the following `strapi` commands with the package manager used for the project setup (e.g `npm run strapi help` or `yarn strapi help`) or a dedicated node package executor (e.g. `npx strapi help`).

To pass options with `npm` use the syntax: `npm run strapi <command> -- --<option>`.

To pass options with `yarn` use the syntax: `yarn run strapi <command> --<option>`
:::

## strapi new

Create a new project.

```bash
strapi new <name>

options: [--no-run|--use-npm|--debug|--quickstart|--dbclient=<dbclient> --dbhost=<dbhost> --dbport=<dbport> --dbname=<dbname> --dbusername=<dbusername> --dbpassword=<dbpassword> --dbssl=<dbssl> --dbauth=<dbauth> --dbforce]
```

- **strapi new &#60;name&#62;**<br/>
  Generates a new project called **&#60;name&#62;** and installs the default plugins through the npm registry.

- **strapi new &#60;name&#62; --debug**<br/>
  Will display the full error message if one is fired during the database connection.

- **strapi new &#60;name&#62; --quickstart**<br/>
  Use the quickstart system to create your app.

- **strapi new &#60;name&#62; --quickstart --no-run**<br/>
  Use the quickstart system to create your app, and do not start the application after creation.

- **strapi new &#60;name&#62; --dbclient=&#60;dbclient&#62; --dbhost=&#60;dbhost&#62; --dbport=&#60;dbport&#62; --dbname=&#60;dbname&#62; --dbusername=&#60;dbusername&#62; --dbpassword=&#60;dbpassword&#62; --dbssl=&#60;dbssl&#62; --dbauth=&#60;dbauth&#62; --dbforce**<br/>

  Generates a new project called **&#60;name&#62;** and skip the interactive database configuration and initialize with these options.

  - **&#60;dbclient&#62;** can be `postgres`, `mysql`.
  - **--dbforce** Allows you to overwrite content if the provided database is not empty. Only available for `postgres`, `mysql`, and is optional.

## strapi develop

**Alias**: `dev`

Start a Strapi application with autoReload enabled.

Strapi modifies/creates files at runtime and needs to restart when new files are created. To achieve this, `strapi develop` adds a file watcher and restarts the application when necessary.

Strapi also adds middlewares to support HMR (Hot Module Replacement) for the administration panel. This allows you to customize the administration panel without having to restart the application or run a separate server. This is only added when you use the `--watch-admin` command.

```bash
strapi develop
```

| Option             | Type   | Description                                                                                                      | Default   |
| ------------------ | :----: | ---------------------------------------------------------------------------------------------------------------- | --------- |
| `--bundler`        | string | Specifies the bundler to use, either `webpack` or `vite`x                                                        | `webpack` |
| `-d, --debug`      | -      | Enable debugging mode with verbose logs                                                                          | false     |
| `--ignore-prompts` | -      | Ignore all prompts                                                                                               | false     |
| `--open`           | -      | Open the admin in your browser                                                                                   | true      |
| `--polling`        | -      | Watch for file changes in network directories                                                                    | false     |
| `--silent`         | -      | Don't log anything                                                                                               | false     |
| `--watch-admin`    | -      | Watch the admin panel for hot changes                                                                            | false     |
| `--no-build`       | -      | [DEPRECATED] Starts your application with the autoReload enabled and skip the administration panel build process | -         |
| `--browser`        | string | [DEPRECATED] Provide a browser name to use instead of the default one                                            | -         |

:::warning
You should never use this command to run a Strapi application in production.
:::

:::caution
Using the `vite` option as a bundler is considered experimental.
:::

## strapi start

Start a Strapi application with autoReload disabled.

This command is to run a Strapi application without restarts and file writes, primarily for use in production.
Certain features such as the Content-type Builder are disabled in the `strapi start` mode because they require application restarts. The `start` command can be prefaced with [environment variables](/dev-docs/configurations/environment.md#strapi-s-environment-variables) to customize the application start.

## strapi build

Builds your admin panel.

```bash
strapi build
```

| Option              | Type   | Description                                                         | Default   |
| ------------------- | :----: | ------------------------------------------------------------------- | --------- |
| `--bundler`         | string | Specifies the bundler you'd like to use, either `webpack` or `vite` | `webpack` |
| `-d, --debug`       | -      | Enable debugging mode with verbose logs                             | false     |
| `--minify`          | -      | Minify the output                                                   | true      |
| `--no-optimization` | -      | [DEPRECATED]: use minify instead                                    | -         |
| `--silent`          | -      | Don't log anything                                                  | false     |
| `--sourcemaps`      | -      | Produce sourcemaps                                                  | false     |
| `--stats`           | -      | Print build statistics to the console                               | false     |

:::caution
Using the `vite` option as a bundler is considered experimental.
:::

## strapi watch-admin

:::note
This has been deprecated, the admin panel is watched as part of the `develop` command.
:::

Starts the admin server. Strapi should already be running with `strapi develop`.

```sh
strapi watch-admin
options: [--browser <name>]
```

## strapi login

Logs in to Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-login) documentation).

## strapi logout

Logs out of Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-logout) documentation).

## strapi deploy

Deploys to Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-deploy) documentation).

## strapi export

[Exports your project data](/dev-docs/data-management). The default settings create a `.tar` file, compressed using `gzip` and encrypted using `aes-128-ecb`.

```bash
strapi export
```

The exported file is automatically named using the format `export_YYYYMMDDHHMMSS` with the current date and timestamp. Alternately, you can specify the filename using the `-f` or `--file` flag. The following table provides all of the available options as command line flags:

| Option              |  Type  | Description                                                                                                                |
| ------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------- |
| `‑‑no‑encrypt`      |   -    | Disables file encryption and disables the `key` option.                                                                    |
| `‑‑no‑compress`     |   -    | Disables file compression.                                                                                                 |
| `-k`, <br/>`--key`  | string | Passes the encryption key as part of the `export` command. <br/> The `--key` option can't be combined with `--no-encrypt`. |
| `-f`, <br/>`--file` | string | Specifies the export filename. Do not include a file extension.                                                            |
| `--exclude`         | string | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                  |
| `--only`            | string | Include only these data. The available types are: `content`, `files`, and `config`.                                        |
| `-h`, <br/>`--help` |   -    | Displays help for the `strapi export` command.                                                                             |

**Examples**

```bash title="Examples of strapi export:"
# export your data with the default options and the filename myData, which results in a file named myData.tar.gz.enc.
strapi export -f myData

# export your data without encryption.
strapi export --no-encrypt
```

## strapi import

[Imports data](/dev-docs/data-management) into your project. The imported data must originate from another Strapi application. You must pass the `--file` option to specify the filename and location for the import action.

```bash
strapi import
```

| Option         | Type   | Description                                                               |
| -------------- | ------ | ------------------------------------------------------------------------- |
| `-k,` `--key`  | string | Provide the encryption key in the command instead of a subsequent prompt. |
| `-f`, `--file` | string | Path and filename with extension for the data to be imported.             |
| `-h`, `--help` | -      | Display the `strapi import` help commands.                                |

**Examples**

```bash title="Example of strapi import:"

# import your data with the default parameters and pass an encryption key:
strapi import -f your-filepath-and-filename --key my-key
```

## strapi transfer

[Transfers data](/dev-docs/data-management/transfer) between 2 Strapi instances. This command is primarily intended for use between a local instance and a remote instance or 2 remote instances. The `transfer` command requires a Transfer token, which is generated in the destination instance Admin panel. See the [User Guide](/user-docs/settings/transfer-tokens) for detailed documentation on creating Transfer tokens.

:::caution
The destination Strapi instance should be running with the `start` command and not the `develop` command.
:::

| Option                       | Description                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--to [destinationURL]`      | Full URL of the `/admin` endpoint on the destination Strapi instance<br />(e.g. `--to https://my-beautiful-strapi-website/admin`)                 |
| `--to-token [transferToken]` | Transfer token for the remote Strapi destination                                                                                                  |
| `--from [sourceURL]`         | Full URL of the `/admin` endpoint of the remote Strapi instance to pull data from<br />(e.g., `--from https://my-beautiful-strapi-website/admin`) |
| `‑‑from‑token`               | Transfer token from the Strapi source instance.                                                                                                   |
| `--force`                    | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                                 |
| `--exclude`                  | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                         |
| `--only`                     | Include only these data. The available types are: `content`, `files`, and `config`.                                                               |
| `-h`, `--help`               | Displays the commands for `strapi transfer`.                                                                                                      |

:::caution
Either `--to` or `--from` is required, but it's not currently allowed to enter both or neither.
:::

**Example**

```bash
strapi transfer --to http://example.com/admin --to-token my-transfer-token
```

## strapi report

Prints out debug information useful for debugging and required when reporting an issue.

| Option                 | Description                   |
| ---------------------- | ----------------------------- |
| `-u`, `--uuid`         | Includes the project UUID     |
| `-d`, `--dependencies` | Includes project dependencies |
| `--all`                | Logs all the data             |

**Examples**

To include the project UUID and dependencies in the output:

```bash
strapi report --uuid --dependencies
```

To log everything, use the `--all` option:

```bash
strapi report --all
```

## strapi configuration:dump

**Alias**: `config:dump`

Dumps configurations to a file or stdout to help you migrate to production.

The dump format will be a JSON array.

```bash title="strapi configuration:dump"

Options:
  -f, --file <file>  Output file, default output is stdout
  -p, --pretty       Format the output JSON with indentation and line breaks (default: false)
```

**Examples**

- `strapi configuration:dump -f dump.json`
- `strapi config:dump --file dump.json`
- `strapi config:dump > dump.json`

All these examples are equivalent.

:::caution
When configuring your application you often enter credentials for third party services (e.g authentication providers). Be aware that those credentials will also be dumped into the output of this command.
In case of doubt, you should avoid committing the dump file into a versioning system. Here are some methods you can explore:

- Copy the file directly to the environment you want and run the restore command there.
- Put the file in a secure location and download it at deploy time with the right credentials.
- Encrypt the file before committing and decrypt it when running the restore command.

:::

## strapi configuration:restore

**Alias**: `config:restore`

Restores a configuration dump into your application.

The input format must be a JSON array.

```bash
strapi configuration:restore

Options:
  -f, --file <file>          Input file, default input is stdin
  -s, --strategy <strategy>  Strategy name, one of: "replace", "merge", "keep". Defaults to: "replace"
```

**Examples**

- `strapi configuration:restore -f dump.json`
- `strapi config:restore --file dump.json -s replace`
- `cat dump.json | strapi config:restore`
- `strapi config:restore < dump.json`

All these examples are equivalent.

**Strategies**

When running the restore command, you can choose from three different strategies:

- **replace**: Will create missing keys and replace existing ones.
- **merge**: Will create missing keys and merge existing keys with their new value.
- **keep**: Will create missing keys and keep existing keys as is.

## strapi admin:create-user

**Alias** `admin:create`

Creates an administrator.
Administrator's first name, last name, email, and password can be:

- passed as options
- or set interactively if you call the command without passing any option.

**Example**

```bash

strapi admin:create-user --firstname=Kai --lastname=Doe --email=chef@strapi.io --password=Gourmet1234
```

**Options**

| Option          | Type   | Description                        | Required |
| --------------- | ------ | ---------------------------------- | -------- |
| -f, --firstname | string | The administrator's first name     | Yes      |
| -l, --lastname  | string | The administrator's last name      | No       |
| -e, --email     | string | The administrator's email          | Yes      |
| -p, --password  | string | New password for the administrator | No       |
| -h, --help      |        | display help for command           |          |

## strapi admin:reset-user-password

**Alias** `admin:reset-password`

Reset an admin user's password.
You can pass the email and new password as options or set them interactively if you call the command without passing the options.

**Example**

```bash

strapi admin:reset-user-password --email=chef@strapi.io --password=Gourmet1234
```

**Options**

| Option         | Type   | Description               |
| -------------- | ------ | ------------------------- |
| -e, --email    | string | The user email            |
| -p, --password | string | New password for the user |
| -h, --help     |        | display help for command  |

## strapi generate

Run a fully interactive CLI to generate APIs, [controllers](/dev-docs/backend-customization/controllers.md), [content-types](/dev-docs/backend-customization/models.md), [plugins](/dev-docs/plugins-development.md#create-a-plugin), [policies](/dev-docs/backend-customization/policies.md), [middlewares](/dev-docs/backend-customization/middlewares.md) and [services](/dev-docs/backend-customization/services.md), and [migrations](/dev-docs/database-migrations).

```bash
strapi generate
```

## strapi templates:generate

Create a template from the current Strapi project.

```bash
strapi templates:generate <path>
```

- **strapi templates:generate &#60;path&#62;**<br/>
  Generates a Strapi template at `<path>`

  Example: `strapi templates:generate ../strapi-template-name` will copy the required files and folders to a `template` directory inside `../strapi-template-name`

## strapi ts:generate-types

Generate [TypeScript](/dev-docs/typescript.md) typings for the project schemas.

```bash
strapi ts:generate-types
```

- **strapi ts:generate-types --debug**<br />
  [DEPRECATED] **strapi ts:generate-types --verbose**<br/>
  Generate typings with the debug mode enabled, displaying a detailed table of the generated schemas.
- **strapi ts:generate-types --silent** or **strapi ts:generate-types -s**<br/>
  Generate typings with the silent mode enabled, completely removing all the logs in the terminal. Cannot be combined with `verbose` or `debug`
- **strapi ts:generate-types --out-dir &#60;path&#62;** or **strapi ts:generate-types -o &#60;path&#62;**<br/>
  Generate typings specifying the output directory in which the file will be created.

:::caution
Strapi requires the project types to be generated in the `types` directory for them to work. The `--out-dir` option should not be used for most cases. However, it can be useful for cases such as generating a second copy to compare the difference between your existing and updated types after changing your content structure.
:::

## strapi routes:list

Display a list of all the available [routes](/dev-docs/backend-customization/routes.md).

```bash
strapi routes:list
```

## strapi policies:list

Display a list of all the registered [policies](/dev-docs/backend-customization/policies.md).

```bash
strapi policies:list
```

## strapi middlewares:list

Display a list of all the registered [middlewares](/dev-docs/backend-customization/middlewares.md).

```bash
strapi middlewares:list
```

## strapi content-types:list

Display a list of all the existing [content-types](/dev-docs/backend-customization/models.md).

```bash
strapi content-types:list
```

## strapi hooks:list

Display a list of all the available hooks.

```bash
strapi hooks:list
```

## strapi controllers:list

Display a list of all the registered [controllers](/dev-docs/backend-customization/controllers.md).

```bash
strapi controllers:list
```

## strapi services:list

Display a list of all the registered [services](/dev-docs/backend-customization/services.md).

```bash
strapi services:list
```

## strapi install

Install a plugin in the project.

```console
strapi install <name>
```

- **strapi install &#60;name&#62;**<br/>
  Installs a plugin called **&#60;name&#62;**.

  Example: `strapi install graphql` will install the plugin `@strapi/plugin-graphql`

:::caution
Some plugins have admin panel integrations, your admin panel might have to be rebuilt. This can take some time.
:::

## strapi uninstall

Uninstall a plugin from the project.

```bash
strapi uninstall <name>

options [--delete-files]
```

- **strapi uninstall &#60;name&#62;**<br/>
  Uninstalls a plugin called **&#60;name&#62;**.

  Example: `strapi uninstall graphql` will remove the plugin `@strapi/plugin-graphql`

- **strapi uninstall &#60;name&#62; --delete-files**<br/>
  Uninstalls a plugin called **&#60;name&#62;** and removes the files in `./extensions/name/`

  Example: `strapi uninstall graphql --delete-files` will remove the plugin `@strapi/plugin-graphql` and all the files in `./extensions/graphql`

:::caution

- In addition to the `uninstall` command you need to remove the plugin configuration from `./config/plugins.js`.
- Some plugins have admin panel integrations, your admin panel might have to be rebuilt. This can take some time.
:::

## strapi telemetry:disable

Disable data collection for the project (see [Usage Information](/dev-docs/usage-information.md)).

```bash
strapi telemetry:disable
```

## strapi telemetry:enable

Re-enable data collection for the project after it was disabled (see [Usage Information](/dev-docs/usage-information.md)).

```bash
strapi telemetry:enable
```

## strapi console

Start the server and eval commands in your application in real time.

```bash
strapi console
```

## strapi version

Print the current globally installed Strapi version.

```bash
strapi version
```

## strapi help

List CLI commands.

```bash
strapi help
```
