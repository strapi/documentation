<details>
<summary>Steps required to push your Strapi project code to GitHub:</summary>

1. In the terminal, ensure you are in the folder that hosts the Strapi project you created.
2. Run the `git init` command to initialize git for this folder.
3. Run the `git add .` command to add all modified files to the git index.
4. Run the `git commit -m "Initial commit"` command to create a commit with all the added changes.
5. Log in to your GitHub account and <ExternalLink to="https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories" text="create a new repository"/>. Give the new repository a name, for instance `my-strapi-project`, and remember this name.
6. Go back to the terminal and push your local repository to GitHub:

  a. Run a command similar to the following: `git remote add origin git@github.com:yourname/my-strapi-project.git`, ensuring you replace `yourname` by your own GitHub profile name, and `my-strapi-project` by the actual name you used at step 5.

  b. Run the `git push --set-upstream origin main` command to finally push the commit to your GitHub repository.

Additional information about using git with the command line interface can be found in the <ExternalLink to="https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#adding-a-local-repository-to-github-using-git" text="official GitHub documentation"/>.

</details>
