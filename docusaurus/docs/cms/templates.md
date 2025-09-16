---
title: Templates
description: Use and create pre-made Strapi applications designed for a specific use case.
displayed_sidebar: cmsSidebar
tags:
- installation
- templates
- CLI
---

# Templates

<Tldr>
Templates are full Strapi apps that bootstrap new projects via CLI flags such as `--template`, `--template-path`, and `--template-branch`. Instructions in this documentation cover referencing templates from GitHub and turning any Strapi project into a reusable template.
</Tldr>

Templates in Strapi 5 are standalone, pre-made Strapi applications designed for specific use cases.

Strapi 5 templates are folders that include all files and folders that you would find in a typical Strapi application (see [project structure](/cms/project-structure)).

## Using a template

To create a new Strapi project based on a template, run the following command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```sh
yarn create strapi-app my-project --template <template-name-or-url>
```

</TabItem>

<TabItem value="npm" label="NPM">

```sh
npx create-strapi-app@latest my-project --template <template-name-or-url>
```

</TabItem>

</Tabs>

In addition to the mandatory `--template` parameter, you can pass the optional `--template-path` and `--template-branch` options to more precisely define the template to use.

The following table lists all the possible ways to define which template to use:

| Syntax | Description |
|--------|-------------|
| `--template website` | Using one of the <ExternalLink to="https://github.com/strapi/strapi/tree/develop/templates" text="Strapi-maintained templates"/> calling it by its (folder) name. |
| `--template strapi/strapi` | Using the template's GitHub repository shorthand.<br/>This will use the default repository branch. |
| `--template strapi/strapi/some/sub/path` | Using the template's GitHub repository shorthand and specifying a subpath.<br/>This will use the default repository branch. |
| `--template strapi/strapi`<br/>`--template-branch=xxx`<br/>`--template-path=some/sub/path` | The most verbose way, explicitly defining a template branch and a subpath. |
| `--template https://github.com/owner/some-template-repo` | Using a full repository URL.<br/>This will use the default repository branch. |
| `--template https://github.com/owner/some-template-repo --template-branch=xxx --template-path=sub/path` | Using a full repository URL, and specifying both the branch and the subpath for the template. |
| `--template https://github.com/strapi/strapi/tree/branch/sub/path` | Using a repository, branch, and subpath directly.<br/><br/>⚠️ _Warning: This won't work with branch names that include a `/`. In such cases, it's best to explicitly define `--template-branch` and `--template-path`._ |

## Creating a template

Creating a Strapi 5 template is as simple as creating a Strapi application. Create the application (see [CLI installation](/cms/installation/cli)) and the generated folder containing your Strapi 5 application can serve as a template. You can then pass it to the `--template` flag when creating a new Strapi 5 application to use it as a template.

An example of what a template could look like is the <ExternalLink to="https://github.com/strapi/strapi/tree/develop/templates/website" text="Strapi-maintained `website` template"/>.
