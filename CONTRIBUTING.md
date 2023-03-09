# Contribute to the Strapi documentation

Strapi is an open-source project administered by [the Strapi team](https://strapi.io/company). We appreciate your interest and efforts to contribute to Strapi.

All contributions are highly appreciated, we recommend you talk to a maintainer prior to investing a lot of time in a pull request that may not align with the project roadmap. Please note that contributions, pull requests, and issues should be written in English.

## Open Development & Community Driven

Strapi is an open-source project. See the [LICENSE](https://github.com/strapi/documentation/blob/main/LICENSE) file for licensing information. All of the work is available on GitHub.

The core team and contributors submit pull requests that go through the same validation process.

## Code of Conduct

This project and everyone participating in it are governed by the [Strapi Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold the code.

## Documentation Requests

Requests for new documentation are highly encouraged, this is not limited to new additions but also changes or more information requested on existing documentation. Please use our [request documentation](https://github.com/strapi/documentation/issues/new?template=DOC_REQUEST.md&title%5B%5D=REQUEST) issue template.

## Bugs

Bug reports help to improve the documentation. Please use our [Documentation Bug Report](https://github.com/strapi/documentation/issues/new?template=BUG_REPORT.yml) template to report documentation bugs. To submit an issue:

- Follow the issue template and fill out as much information as you can.
- Verify the issue is only with the Strapi documentation, code issues should be directed at the main [strapi/strapi](https://github.com/strapi/strapi) repository.
  
Technical questions should be asked using the following resources:

- Open a Q&A thread on our [Official Forum](https://forum.strapi.io)
- Engage with other community members on our [Community Discord](https://discord.strapi.io)

---

## Pull Requests

The core team reviews community pull requests and either merges, requests changes, or comments and closes the pull request. You can open a documentation pull request by:

- clicking the `Improve this page` link at the bottom of any documentation page to directly edit in GitHub,
- forking the `documentation` repository and working locally.

### Setup and write locally

The following procedure allows you to work locally on the Strapi documentation.

1. Fork the `documentation` repository.
2. Clone your forked `documentation` repository.
    
    ```bash
    git clone git@github.com:yourgithubname/documentation.git
    ```
    
3. Enter the `dev-docs` folder to contribute to the [Developer Documentation](https://docs.strapi.io/), or the `user-docs` folder to contribute to the [User Guide](https://docs.strapi.io/user-docs/intro).
    
    ```bash
    # developer documentation
    cd documentation/docusaurus/docs/dev-docs
    
    # user documentation
    cd documentation/docusaurus/docs/user-docs
    ```
    
4. Ensure you are looking at the `main` branch and retrieve the latest modifications:
    
    ```bash
    git checkout main
    git pull
    ```
    
6. Create your branch to work on your documentation contribution. Make sure your branch name indicates both the type of documentation and the topic.
    
    ```bash
    # developer docs
    git checkout -b <dev/branch-name>
    
    # user guide
    git checkout -b <user/branch-name>
    
    ```

7. Run the docs on your computer. From the `documentation/docusaurus` folder:

  ```bash

    # Install dependencies
    yarn

    # Run the local development server
    yarn dev

  ```

  The project is now up and running at http://localhost:8080 and you should be able to access it in your browser.

You are now ready to contribute to the Strapi documentation! 🚀

### Write technical documentation

The Strapi documentation follows the [Strapi formatting & style guide](STYLE_GUIDE.pdf) (also available on [Notion](https://handbook.strapi.io/user-success-manual/strapi-documentation-style-guide)). Feel free to also take a look at the [Google Style Guide](https://developers.google.com/style) and especially the [Highlights](https://developers.google.com/style/highlights) section for more information on technical writing tone, structure, and formatting.

When you are finished writing, create a pull request from your forked repository to the original `documentation` repository (see [the GitHub docs](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) for more information) or use the _Create a new branch for this commit and start a pull request_ option if you are using the GitHub web browser interface (see [the GitHub docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)).

✋ Sign the CLA (Contributor License Agreement), directly via GitHub (see [our dedicated blog post](https://strapi.io/blog/switching-from-dco-to-cla) for more information).

### Review and management of pull requests

The pull request review process and timeline are based on the availability of Strapi's Documentation team to handle community contributions. The workflow is:

1. The pull request is assigned to a member of the Documentation team.
2. At least 1 member of the Documentation team will review the pull request for:

- accuracy,
- quality,
- alignment with the documentation scope and roadmap.

3. Reviewers will either approve, ask for changes, or reject the pull request.
4. Accepted pull requests will be merged and deployed as part of the regular documentation deployments on Wednesdays every 2 weeks.

Every documentation deployment is communicated through a message in [the "News" section of the Strapi forum](https://forum.strapi.io/c/news/5).
