# Contribute to the Strapi documentation

Strapi is an open-source project administered by [the Strapi team](https://strapi.io/company). We appreciate your interest and efforts to contribute to Strapi.

All efforts to contribute are highly appreciated, we recommend you talk to a maintainer prior to spending a lot of time making a pull request that may not align with the project roadmap. Please note that contributions, pull requests, and issues should be written in English.

## Open Development & Community Driven

Strapi is an open-source project. See the [LICENSE](https://github.com/strapi/documentation/blob/main/LICENSE) file for licensing information. All of the work is available on GitHub.

The core team and the contributors send pull requests which go through the same validation process.

## Code of Conduct

This project and everyone participating in it are governed by the [Strapi Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold the code.

## Documentation Requests

Requests for new documentation are highly encouraged, this is not limited to new additions but also changes or more information requested on existing documentation. Please use our [request documentation](https://github.com/strapi/documentation/issues/new?template=DOC_REQUEST.md&title%5B%5D=REQUEST) issue template. If you are requesting documentation, please feel free to open a pull request.

## Bugs

Bug reports help to improve the documentation. Please use our [Documentation Bug Report](https://github.com/strapi/documentation/issues/new?template=BUG_REPORT.yml) template to report documentation bugs. Before submitting an issue:

- Check for existing pull requests that may address the same issue.
- Check for related open issues, if so, please provide context on the existing issue.
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
    
3. Enter the `developer-docs` folder to contribute to the [Developer Documentation](https://strapi.io/documentation/developer-docs/latest/getting-started/introduction.html), or the `user-docs` folder to contribute to the [User Guide](https://strapi.io/documentation/user-docs/latest/getting-started/introduction.html).
    
    ```bash
    # developer documentation
    cd documentation/docs/developer-docs
    
    # user documentation
    cd documentation/docs/user-docs
    ```
    
4. Choose the branch from which to work: either `main` for a contribution on the current version of Strapi or `v[x]` for a contribution on a previous version of Strapi.
    
    ```bash
    #current version of Strapi (i.e. v4)
    git checkout main
    
    #previous version of Strapi (e.g. v3)
    git checkout v3
    ```
    
    <aside>
    ✋ Previous, non-current versions of the Strapi documentation are only maintained for 6 months after the release of the latest, current version.
    
    </aside>
    
5. From your chosen branch, retrieve the latest modifications to work on an up-to-date branch.
    
    ```bash
    git pull
    ```
    
6. Create your branch, based on either `main` or `v[x]`, to work on your documentation contribution. Make sure your branch name indicates both the type of documentation and the topic.
    
    ```bash
    # developer documentation
    git checkout -b <dev/branch-name>
    
    # user documentation
    git checkout -b <user/branch-name>
    
    ```

7. Run the docs on your computer

  ```bash
    cd docs

    # Install dependencies
    yarn

    # Run user and developer-docs
    yarn dev

    # Run developer-docs only
    yarn dev:dev

    # Run user-docs only
    yarn dev:user

  ```

  The project is now up and running at http://localhost:8080 and you should be able to access it in your browser.

You are now ready to contribute to the Strapi documentation! 🚀

### Write technical documentation

For lengthier contributions, we provide general guidelines that can help you write clear and concise documentation:

- The [12 Rules of Technical Writing](https://handbook.strapi.io/user-success-manual/12-rules-of-technical-writing) gives an overview of how to structure and write clear documentation.
- The [Strapi Documentation Style Guide](https://handbook.strapi.io/user-success-manual/strapi-documentation-style-guide) has formatting guidelines and how to implement formatting in markdown files.

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
