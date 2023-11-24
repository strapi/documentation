---
title: Publishing a Strapi plugin to the Marketplace
# description: todo
displayed_sidebar: devDocsSidebar
---

# Publishing your Strapi plugin

_Coming soon…_

:::tip
Check [this blog post](https://strapi.io/blog/how-to-create-a-strapi-v4-plugin-publish-on-npm-6-6) to learn how to publish your Strapi plugin on npm.
:::

<!-- Publishing your plugin on npm will allow anyone to use it in their Strapi project. Also, if you want to submit it on the Strapi Marketplace, this is mandatory to publish it first on npm.

But before publishing on npm, you must push it on GitHub. In order to develop your plugin, you might have, or not, develop your plugin in a Strapi project. The thing is, you don't want to push your Strapi application, only your plugin.

Note: You might have already pushed your code on GitHub, if this is the case, that's perfect. You can skip this and go to the npm part down below.
Make your plugin open-source on GitHub

    Create a new public repository on GitHub.
    Be sure to be in the root of your plugin (./src/plugins/<plugin-namem>) and create a new repository from there:

1
2
3
4
5
6
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<github_username>/<github_repository_name>.git
git push -u origin main

Your plugin is now open-source.

Caution: If you are willing to list your plugin on the Strapi Marketplace, be sure to check the guidelines first. When your package.json is ready, push it on GitHub and proceed to publish it on npm.

This is what a very basic plugin package.json looks like:

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
{
  "name": "@strapi/plugin-seo",
  "version": "1.7.2",
  "description": "Make your Strapi content SEO friendly.",
  "strapi": { // This section is the most important
    "name": "seo",
    "displayName": "SEO",
    "description": "Make your Strapi content SEO friendly.",
    "kind": "plugin"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/strapi/strapi-plugin-seo.git"
  },
  "dependencies": {
    "eslint-plugin-react-hooks": "^4.3.0",
    "lodash": "^4.17.21",
    "showdown": "^1.9.1"
  },
  "resolutions": {
    "yargs": "^17.2.1"
  },
  "peerDependencies": {
    "@strapi/strapi": "^4.0.0" // This is mandatory for the marketplace
  },
  "author": {
    "name": "Strapi Solutions SAS",
    "email": "hi@strapi.io",
    "url": "https://strapi.io"
  },
  "maintainers": [
    {
      "name": "Strapi Solutions SAS",
      "email": "hi@strapi.io",
      "url": "https://strapi.io"
    }
  ],
  "engines": {
    "node": ">=12.x. <=16.x.x",
    "npm": ">=6.0.0"
  },
  "license": "MIT"
}

Don't forget to provide a complete README.md that explains what your plugin is about at the root of your plugin. It will be the content of your npm package page.
Publishing on npm

We assume that you have an npm account in order to follow this section.
You can create two kinds of public packages. You'll see how to publish them accordingly just below.
Scoped package

Scopes are a way of grouping related packages together and also affect a few things about the way npm treats the package.

Each npm user/organization has its own scope, and only you can add packages to your scope. This means you don't have to worry about someone taking your package name ahead of you. Thus it is also a good way to signal official packages for organizations.

Scoped packages are private by default. You'll need to use a specific option to make it public during the publishing process.

At Strapi, we are using the @strapi scope. Every plugin developed by use will be scoped packages like this: @strapi/<plugin-name>
Publish a scoped package

Be sure that everything in your package.json is fine, it is recommended to have a 1.0.0 version to start with.

    Run the following command to publish your package on npm:

npm publish --access public

By default, scoped packages are private, this --access public option will make it public.
Unscoped packaged

Unscoped packages are always public and are referred to by the package name only: strapi-plugin-...
Publish an unscoped package

    Run the following command to publish your package on npm:

npm publish

Your plugin is now live on npm. You can now install this plugin in a Strapi project by running the following command:

# yarn
yarn add strapi-plugin-<name>

# npm
npm install strapi-plugin-<name>

Managing your plugin

You might bring updates, features, or patches to your plugin. To do this, you'll need to update the code on GitHub but also update the package on npm.

The npm version command allows you to automatically update the version of your package while creating a commit also:

1
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

If you want to push a patch to your package you can execute the following command:

npm version patch

It will create a commit with a tag associated with the version, and update the version in your package.json file. Assuming that your actual package version is 1.0.0, for a patch it will be 1.0.1, 1.1.0 for a minor, and 2.0.0 for a major.

    Push your code on GitHub by making a PR and merging or directly pushing on the main branch.
    Push the tag that npm created for you:

git push origin v1.0.1

If you browse the tags of your plugin on GitHub, you should see your new tag. You can make a release out of it to explain what were the modifications or not.

Then, you can run:

npm publish --access public # option for scoped package only

Publish on the marketplace

If you follow the guide, you might be ready to submit your plugin on the Strapi marketplace. Again, be sure to read the guidelines.

Submit my plugin on the Marketplace -->


