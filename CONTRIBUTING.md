# Contribute to the Strapi documentation

Strapi is an open-source project administered by [the Strapi team](https://strapi.io/company). We appreciate your interest and efforts to contribute to Strapi.

All efforts to contribute are highly appreciated, we recommend you talk to a maintainer prior to spending a lot of time making a pull request that may not align with the project roadmap.

## Open Development & Community Driven

Strapi is an open-source project. See the [LICENSE](https://github.com/strapi/documentation/blob/main/LICENSE) file for licensing information. All the work done is available on GitHub.

The core team and the contributors send pull requests which go through the same validation process.

## Documentation Requests

Requests for new documentation are highly encouraged, this is not limited to new additions but also changes or more information requested on existing documentation. Please use our [request documentation](https://github.com/strapi/documentation/issues/new?template=DOC_REQUEST.md&title%5B%5D=REQUEST) issue template.

## Code of Conduct

This project and everyone participating in it are governed by the [Strapi Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read the [full text](CODE_OF_CONDUCT.md) so that you can read which actions may or may not be tolerated.

## Documentation

Pull requests relating to fixing documentation for the latest release should be directed towards the [documentation branch](https://github.com/strapi/documentation/tree/documentation) **not** towards the main branch. Any PRs made towards the main branch will not be released until the next Strapi version release.

## Bugs

We are using [GitHub Issues](https://github.com/strapi/documentation/issues) to manage our public bugs. We keep a close eye on this so before filing a new issue, try to make sure the problem does not already exist.

---

## Before Submitting a Pull Request

The core team will review your pull request and will either merge it, request changes to it, or close it.

**Before submitting your pull request** make sure the following requirements are fulfilled:

- Fork the repository and create your branch from `documentation`.
- Run `yarn install` in the repository root. (Please use yarn, not npm as we maintain a yarn.lock file instead of a package-lock.json)

## Contribution Prerequisites

- You have [Node](https://nodejs.org/en/) at v10.16.0+ only and [Yarn](https://yarnpkg.com/en/) at v1.2.0+.
- You are familiar with Git.

## Development Workflow

**Add workflow from internal docs here**

## Miscellaneous

### Repository Organization

We have various types of documentation that are maintained on their own:

- developer-docs
  - This documentation is tailored for developers and administrators and provide documentation on the technical aspects of Strapi
- user-docs
  - This documentation is tailored for users and content-creators of Strapi and outline the user interface and usage of Strapi

We have a few primary branches that are used for different purposes:

- main
  - This branch is used by the Strapi to push documentation on new features before they are released, it should not be used for PRs by the community unless instructed to do so by a Strapi team member
- documentation
  - This branch is for the current released version of Strapi, all documentation requests, updates, and removals should be pointed here
- docs/*
  - This collection of branches is for current work in progress changes, Strapi team members push our changes here to make PRs against the documentation branch

### Reporting an issue

Before submitting an issue you need to make sure:

**Outline support and issue process**