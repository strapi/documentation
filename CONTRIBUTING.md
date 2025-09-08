# Contribute to the Strapi documentation

Strapi’s documentation is open-source, hosted on GitHub in the present `strapi/documentation` repository. The [Strapi Documentation team](https://strapi.io/company) maintains the repository and the corresponding official website hosted at [docs.strapi.io](https://docs.strapi.io).

The Strapi Documentation team does not maintain blog articles hosted at [strapi.io/blog](https://strapi.io/blog) or any other educational or informational content not hosted on the [official documentation website](docs.strapi.io); these should not be subject to GitHub pull requests or issues on the present repository.

We appreciate your interest and efforts to contribute to Strapi! Though all contributions are highly appreciated, we recommend you talk to a maintainer (`@pwizla` or `@meganelacheny`) prior to investing a lot of time in a pull request that may not align with the project roadmap or would modify the UI, UX, or any other part of the Strapi Documentation product experience. Please note that contributions, pull requests, and issues should be written in English.

The Strapi Documentation team reviews pull requests and either merges, requests changes, or comments and closes the pull request. You can open a documentation pull request by:

- forking the `documentation` repository and working locally,
- or, for smaller updates, clicking the `Improve this page` link at the bottom of any documentation page to directly edit in GitHub.

Contributing to the Strapi documentation implies 2 steps:

1. Learn how to use [Docusaurus](#-docusaurus), the tool used to write and generate Strapi's documentation.

2. [Submit a pull request](#-pull-requests) for review.

## 🦖 Docusaurus

Strapi’s documentation is built with the React- and Markdown-based [Docusaurus](https://docusaurus.io) framework.

To start contributing to Strapi’s documentation using Docusaurus, you need to understand the [files and branches architecture](#use-the-files-architecture-and-branch-names-conventions-appropriately), and use the proper [syntax to format content](#use-the-proper-formatting-and-syntax). Additionally, if you want to work locally from a repository fork, you should [set up the Docusaurus project](#working-locally-set-up-the-project) on your machine.

### Use the files architecture and branch names conventions appropriately

Strapi’s documentation includes 3 big sections, 2 for the CMS and 1 for Strapi Cloud, each section living in a different folder. You should prefix the name of your contribution’s branch with the corresponding section name:

| Section name      | Target content                                                    | Folder                        | Branch name prefix |
| ------------------| ----------------------------------------------------------------- | ----------------------------- | ------------------ |
| [CMS Docs](https://docs.strapi.io/cms) | For all things related to Strapi CMS | `/docusaurus/docs/cms/` | `cms/`            |
| [Cloud Docs](https://docs.strapi.io/cloud) | For all things related to Strapi Cloud                            | `/docusaurus/docs/cloud/`     | `cloud/`           |

ℹ️ In the rare case of a pull request that impacts multiple parts of the repository (for instance user guide + dev docs), please prefix your branch with `repo/`.

### Use the proper formatting and syntax

Docusaurus is MDX-based, meaning the content you write is [Markdown](https://daringfireball.net/projects/markdown/syntax) that accepts [React](https://reactjs.org/) components.

The Strapi Documentation team has created a complete style guide for you to make the best out of the various options available:

👉 [Strapi Documentation Style Guide](STYLE_GUIDE.pdf) 

💁 While writing, please consider the [12 Rules of Technical Writing](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04) that the Strapi Documentation team will use to assess the quality and consistency of the contribution. 😊

⚠️ **Important: Please disable any linter or automatic formatting tool(s)** before saving and submitting your files. Not doing so could, at best, add unnecessary formatting changes to the submitted PR or, at worst, prevent Docusaurus from properly rendering some pages.

### Working locally: Set up the project

To set up the Docusaurus project on your machine, perform the following steps from a terminal instance:

1. Clone the repository: `git clone [access-path-to-your-forked-repository]`<br/>(for instance, `git clone git@github.com:my-github-handle/documentation.git`<br/>— see GitHub documentation for [more information about forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)).
2. Enter the `documentation` folder (which is the name of the repository) and then the `docusaurus` folder: `cd documentation/docusaurus`
3. _(optional, if the repository already exists on your machine)_<br/>Get the latest updates from the `main` branch: `git checkout main && git pull`
4. Install dependencies and start the server: `yarn && yarn dev`
    
    ⚠️ Docusaurus requires node 16.14+. You may use [nvm](https://github.com/nvm-sh/nvm) to install and run the correct node version.
    
5. Once the terminal reads “`client (webpack [version number] compiled successfully`,” open [localhost:8080](http://localhost:8080) in your browser to view the website.

You can now start changing content and see the website updated live each time you save a new file. 🤓

## 👀 Pull requests

***
⚠️ **Important prerequisite: Build the content locally before submitting a pull request 👇**

The documentation repository uses a continuous integration/continuous delivery workflow. If the pages are not built and rendered properly, the auto-deployment process on [docs.strapi.io](http://docs.strapi.io) triggered when the pull request is merged with `main` will fail.

To prevent building issues upstream, before submitting your pull request, please stop the development server and build the page locally: in the terminal instance, press `Ctrl-C` to stop the server, then run `yarn build`.

- If no issues are reported (”client” and “server compiled successfully”), go ahead and submit the pull request. 
- If some issues are reported (e.g., broken links), please use information reported by the terminal to fix issues, then try another `yarn build`, and repeat until no issues are reported.

***

Your pull request should usually target the `main` branch, though the Strapi Documentation team might sometimes ask you to target another branch.

To submit your contribution for review:

1. Create a new [pull request on GitHub](https://github.com/strapi/documentation/compare).
2. Give it a proper title and description.
3. Click the “Create pull request” button to create the pull request effectively.
    
    ✏️ If your pull request is not ready for review yet, choose the “[Create draft pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)” in the dropdown. The Strapi documentation team will review your pull request only when you will mark it as “[Ready for review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request)”. 
   ⚠️ Please use Draft PRs to work incrementally. A PR that is not marked as draft is considered ready for review and merge once approved, unless it documents a feature that is not merged yet. There is no need to write "ready to merge" in the PR description or comments.
   
4. _(optional — if not set, the Strapi Documentation team will set or update this for you)_:<br/>Add GitHub labels for:
   - the section of the documentation targeted by the pull request: `source: CMS` or `source: Strapi Cloud`
   - the type of updates introduced by the pull request: 
     - `pr: new content` for new features,
     - `pr: updated content` for significant (20+ lines) updates to existing features,
     - or `pr: chore` for smaller improvements (fixes, typos, chore tasks…).
    
**⚠️ Important: Add the `flag: merge pending release` if the Strapi Documentation team should wait before merging the pull request.** Approved pull requests are usually merged immediately into the `main` branch, automatically triggering a deployment on docs.strapi.io. Please use the `flag: merge pending release` label if the pull request content should only be released publicly in sync with a product release (e.g., if you submit a pull request to document a contribution to the `strapi/strapi` repository).


That’s it! 🥳 Once the pull request is [reviewed and approved](#review-and-management-of-pull-requests), the Strapi Documentation team will merge it, and the content will be live on [docs.strapi.io](http://docs.strapi.io) a few minutes later. 🚀


## Review and management of pull requests

The pull request review process and timeline are based on the availability of the Strapi Documentation team to handle community contributions. The workflow is as follows:

1. The pull request is assigned to a member of the Documentation team.
2. At least 1 member of the Documentation team will review the pull request for:

   - accuracy,
   - quality,
   - alignment with the documentation scope and roadmap.

3. Reviewers will either approve, ask for changes, or reject the pull request.
4. Accepted pull requests will be merged and automatically deployed on [docs.strapi.io](https://docs.strapi.io) a few minutes later. 

This is a test.