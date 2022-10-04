# Contribute to the Strapi documentation

Strapi is an open-source project administered by [the Strapi team](https://strapi.io/company). We appreciate your interest and efforts to contribute to Strapi.

All efforts to contribute are highly appreciated, we recommend you talk to a maintainer prior to spending a lot of time making a pull request that may not align with the project roadmap. Please note that contributions, pull requests, and issues should be written in English.

## Open Development & Community Driven

Strapi is an open-source project. See the [LICENSE](https://github.com/strapi/documentation/blob/main/LICENSE) file for licensing information. All the work done is available on GitHub.

The core team and the contributors send pull requests which go through the same validation process.

## Documentation Requests

Requests for new documentation are highly encouraged, this is not limited to new additions but also changes or more information requested on existing documentation. Please use our [request documentation](https://github.com/strapi/documentation/issues/new?template=DOC_REQUEST.md&title%5B%5D=REQUEST) issue template.

## Code of Conduct

This project and everyone participating in it are governed by the [Strapi Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read the [full text](CODE_OF_CONDUCT.md) so that you can read which actions may or may not be tolerated.

## Bugs

We are using [GitHub Issues](https://github.com/strapi/documentation/issues) to manage our public bugs. Before submitting an issue you need to make sure:

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
    - Talk with other community members on our [Community Discord](https://discord.strapi.io)

Please note that rude or impolite comments on issues that violate our [Code of Conduct](./CODE_OF_CONDUCT.md) will be deleted and issues that violate the COC will be closed.

---

## Submitting a Pull Request

The core team will review your pull request and will either merge it, request changes to it, or close it.

### Setup and pull request creation

Follow the procedure below to contribute to the Strapi documentation.

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
    
4. Choose the branch from which to work: either `main` for a contribution on the latest, current version or Strapi ; or `v[x]` for a contribution on a previous version of Strapi.
    
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
    
6. Create your own branch, based on either `main` or `v[x]` , on which you will work on your documentation contribution. Make sure the name of your branch indicates both the type of documentation and the topic.
    
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

🤗 Make sure to follow the [12 Rules of Technical Writing](https://handbook.strapi.io/user-success-manual/12-rules-of-technical-writing) and the [Strapi Documentation Style Guide](https://handbook.strapi.io/user-success-manual/strapi-documentation-style-guide) when writing your documentation contribution. These documents are meant to help you write a contribution that fits the whole Strapi documentation and make the reviewing process easier and quicker.

When you are finished writing, create a pull request from your forked repository to the original `documentation` repository (see [the GitHub docs](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) for more information).

✋ To be able to submit your contribution, you must sign the CLA (Contributor License Agreement), directly via GitHub (see [our dedicated blog post](https://strapi.io/blog/switching-from-dco-to-cla) for more information).

### Pull request review and management

Read the information below to know how your contribution will be handled by the Strapi Documentation team until it is merged and deployed.

#### Handling

When a new pull request is submitted in the Strapi `documentation` repository, it is handled in the following week, meaning that the Strapi team:

- acknowledges the new pull request, leaving a 👀 reaction on the description
- tags the pull request, to indicate the type of documentation that is being updated, and optionally the level of priority for the contribution
- assigns the pull request to a member of the Strapi Documentation team, who will be in charge of the reviewing and merging

#### Review

Once all of the handling steps are done by the Strapi team, you can expect your pull request to be reviewed in the next week or so.

Here is what the Strapi Documentation team will review in your pull request:

- The accuracy and coherence of the contribution, by testing any new piece of code or action for example,
- The quality of the technical writing, to make sure it is proper technical documentation that is easy to understand (see [12 Rules of Technical Writing](https://www.notion.so/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04))
- The fit of the contribution among the rest of the Strapi documentation (see [Strapi Documentation Style Guide](https://www.notion.so/Strapi-Documentation-Style-Guide-b9c21387732741ed8b0a3f9701612577))

The pull request will be validated once the contribution ticks all the boxes. At least the validation of the Strapi Documentation team member in charge of the pull request is necessary for it to be merged.

#### Deployment

Once your pull request is validated and merged, it will be deployed with the next batch of merged pull requests. The Strapi Documentation team only deploys the documentation on Wednesdays, but not every week.

Every documentation deployment is communicated through a message in [the "News" section of the Strapi forum](https://forum.strapi.io/c/news/5).


