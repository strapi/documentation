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

Pull requests relating to fixing documentation for the latest release should be directed towards the main branch.

## Bugs

We are using [GitHub Issues](https://github.com/strapi/documentation/issues) to manage our public bugs. We keep a close eye on this so before filing a new issue, try to make sure the problem does not already exist.

---

## Before Submitting a Pull Request

The core team will review your pull request and will either merge it, request changes to it, or close it.

**Before submitting your pull request** make sure the following requirements are fulfilled:

- Fork the repository and create your branch from `main`.
- Run `yarn` and `yarn dev` in the specific documentation root. (Please use yarn, not npm as we maintain a yarn.lock file instead of a package-lock.json)

## Contribution Prerequisites

- You have [Node](https://nodejs.org/en/) at v12 only (Node v13+ are not supported) and [Yarn](https://yarnpkg.com/en/) at v1.2.0+.
- You are familiar with Git.

## Development Workflow

<!-- TODO add contrib-docs and link here -->

**Currently WIP**

At the moment we are under a contribution freeze from the community, we will update this guide once we lift the freeze.

## Miscellaneous

### Repository Organization

We have various types of documentation that are maintained on their own:

- **developer-docs**
  - This documentation is tailored for developers and administrators and provide documentation on the technical aspects of Strapi
- **user-docs**
  - This documentation is tailored for users and content-creators of Strapi and outline the user interface and usage of Strapi

We have a few primary branches that are used for different purposes:

- **main**
  - This branch is used to store the current version of the documentation, all PRs should target this branch
- **docs/\***
  - This collection of branches is for current work in progress changes, Strapi team members push our changes here to make PRs against the documentation branch
- **feature/\***
  - This is a collection of branches used as documentation for features currently in development in the main [strapi/strapi](https://github.com/strapi/strapi) repo

### Reporting an issue

Before submitting an issue you need to make sure:

- Checked for any existing pull requests that may address the same issue
- Checked for any open issues related to your issue, if so, please provide context on that issue
- Follow the issue template and try to fill out as much information as you can
  - Issues not following the templates **will be closed**
  - You may update the closed issue with the required information and it will be reopened
- The issue is with the Strapi **documentation only**, code issues should be directed at the main [strapi/strapi](https://github.com/strapi/strapi) repo issues
- If you are requesting documentation, please do feel free to make a pull request
  - Documentation requests will be handled when we have free room within our roadmap
  - Open requests **are not handled** in a "first come, first serve" basis, they are handled on a "best-effort" depending on the time required to produce
- Do not ask technical questions about how to do something
  - Questions should be directed at the following resources
    - Open a Q&A thread on our [Official Forum](https://forum.strapi.io)
    - Talk with other community members on our [Community Slack](https://slack.strapi.io)
- Rude or impolite comments on issues that violate our [Code of Conduct](./CODE_OF_CONDUCT.md) will be deleted and issues that violate the COC will be closed
