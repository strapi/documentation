---
title: Upgrade tool
description: The Strapi upgrade tool is a CLI command that helps automatically upgrading to a new Strapi version.
displayed_sidebar: devDocsSidebar
---

# Upgrade tool

The upgrade tool assists Strapi users in upgrading their Strapi application dependencies and code to a specific version.

Running the upgrade tool triggers the update of the application dependencies, their installation, and the execution of a series of **codemods** <Annotation>Codemods are automated tools used for large-scale code modifications, especially useful for refactoring, adapting to API changes, or applying coding style updates. They enable precise and programmable alterations to source code.</Annotation> that automatically edit the application codebase according to the breaking changes introduced up until the targeted version.

The upgrade tool is a Strapi package and can be run from the CLI.

## Version types

Strapi version numbers respect the [semantic versioning](https://semver.org/) conventions:

<ThemedImage
  alt="Version numbers explained"
  sources={{
    light: '/img/assets/update-migration/version-numbers.png',
    dark: '/img/assets/update-migration/version-numbers_DARK.png',
  }}
/>

- The first number is the **major** version number.
- The second number is the **minor** version number.
- The third number is the **patch** version number.

The upgrade tool allows upgrading to a major, minor, or patch version.

| The latest Strapi v4 version is v4.16.2 and my Strapi application is currently on… | If I run… | My Strapi application will be upgraded to … |
|----|----|----|
| v4.14.1 | `npx @strapi/upgrade patch` | v4.14.6<br/><br/>(because v4.14.6 is the latest patch version for the v4.14 minor version) |
| v4.14.1 | `npx @strapi/upgrade minor` | v4.16.2 |
| v4.14.1 | `npx @strapi/upgrade major` | Nothing.<br/><br/>I first need to run `npx @strapi/upgrade minor` to upgrade to v4.16.2. |
| v4.16.2 | `npx @strapi/upgrade major` | v5.0.0  |

## Upgrade to a major version

Run the upgrade tool with the `major` parameter to upgrade the project to the next major version of Strapi:

```bash
npx @strapi/upgrade major
```

During the upgrade process, the application dependencies are updated and installed, and the codemods up until the targeted major version are executed.

:::note
If your application is not already running the latest minor and patch version in the current major, the `major` upgrade is prevented, and you will first need to upgrade to the latest [minor.patch](#upgrade-to-a-minor-version) version in the current major version. This means that moving from v4.14.4 to v5.0.0 is a 2-step process because the latest v4 version is v4.16.2.
:::

## Upgrade to a minor version

Run the upgrade tool with the `minor` parameter to upgrade the project to the latest minor and patch version of Strapi:

```bash
npx @strapi/upgrade minor
```

During the upgrade process, the project dependencies are updated and installed, and the codemods up until the targeted patch are executed (if any).

## Upgrade to a patch version

Run the upgrade tool with the `patch` parameter to upgrade the project to the latest major version of Strapi:

```bash
npx @strapi/upgrade patch
```

During the upgrade process, the project dependencies are updated and installed, and the codemods up until the targeted patch are executed (if any).

## Run codemods only

Run the upgrade tool with the `codemods` parameter to execute a utility that allows selecting the codemods to be executed. With this command, only the codemods are run, the dependencies are not updated nor installed.

```bash
npx @strapi/upgrade codemods
```

## Options

The `npx @strapi/upgrade` command can accept the following options:

| Option                                                                   | Description                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`-n, --dry`](#simulate-the-upgrade-without-updating-any-files-dry-run)  | Simulate the upgrade without updating any files (default: false) |
| [`-d, --debug`](#get-detailed-debugging-information)                     | Get more logs in debug mode (default: false)                     |
| [`-s, --silent`](#execute-the-upgrade-silently)                          | Don't log anything (default: false)                              |
| [`-p, --project-path <project-path>`](#select-a-path-for-the-strapi-application-folder) | Path to the Strapi project                                       |
| [`-V, --version`](#get-the-current-strapi-version)                       | Output the version number                                        |
| [`-h, --help`](#get-help)                                                | Print command line options                                       |

### Simulate the upgrade without updating any files (dry run)

When passing the `-n` or `--dry` option, the codemods are executed without actually editing the files. The package.json will not be modified, and the dependencies will not be re-installed. Using this option allows simulating the upgrade of the codebase, checking the outcomes without applying any changes:

Examples:

```bash
npx @strapi/upgrade major --dry
npx @strapi/upgrade minor --dry
npx @strapi/upgrade patch --dry
npx @strapi/upgrade codemods --dry
```

### Select a path for the Strapi application folder

When passing the `-p` option you can specify in which folder the Strapi application is located.

Example:

```bash
npx @strapi/upgrade major -p /path/to/the/Strapi/application/folder
```

### Get the current Strapi version

When passing the `--version` option (or its `-V` shorthand), the current Strapi version is logged.

Example:

```sh
$ npx @strapi/upgrade -V
4.15.1
```

### Get detailed debugging information

When passing the `--debug` option (or its `-d` shorthand), the upgrade tool provides more detailed logs while running:

```bash
npx @strapi/upgrade --debug
```

### Execute the upgrade silently

When passing the `--silent` option (or its `-s` shorthand), the tool executes the upgrade without providing any log:

```bash
npx @strapi/upgrade --silent
```

### Get help

When passing the `--help` option (or its `-h` shorthand), help information is displayed, listing the available options:

Example:

```bash
$ npx @strapi/upgrade -h
Usage: upgrade [options]

Upgrade to the desired version

Options:
  --dry-run                          Simulate the upgrade without updating any files (default: false)
  -d, --debug                        Get more logs in debug mode (default: false)
  -s, --silent                       Don't log anything (default: false)
  -p, --project-path <project-path>  Path to the Strapi project
  -V, --version                      output the version number
  -h, --help                         Print command line options
```
