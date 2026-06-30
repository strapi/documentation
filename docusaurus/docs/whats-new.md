---
custom_edit_url: null
---

<br/>

# What's new in Strapi docs?

We gave the Strapi documentation a fresh new look and a set of features designed to make reading, navigating, and reusing the docs easier. Here is a quick tour of what changed.

<Icon name="sparkle" /> **3 reading modes.** Switch any page between **Elegant mode** (the default, fully styled reading experience), **Markdown mode** (a flat, raw-text view that is easy to copy), and **AI mode** (a summary-oriented view built for working with AI assistants). The switcher sits at the top of every documentation page.

<Icon name="arrows-horizontal" /> **Content-width selector.** Prefer a narrower column for comfortable reading or a wider one to see more at once? A floating control lets you adjust the content width to your taste, and your choice is remembered as you browse.

<Icon name="sidebar" /> **Collapsible sidebars.** Both the left navigation and the right "On this page" table of contents can now be collapsed, so you can focus on the content and reclaim screen space whenever you need it.

<Icon name="house" /> **A brand-new homepage.** The [documentation homepage](/) was redesigned from scratch, with clearer entry points to the CMS and Cloud docs, an interactive API explorer, and quick links to the most popular sections.

<Icon name="code" /> **2-column layout for API references.** The [REST API](/cms/api/rest), [GraphQL API](/cms/api/graphql), and [Document Service API](/cms/api/document-service) reference pages now use a 2-column layout: the description and parameters on the left, and the request and response examples on the right, so you can read and try at the same time.

<Icon name="markdown-logo" /> **Clean Markdown for AI agents.** Every page is also available as clean Markdown, with all the layout components resolved into plain text so AI assistants and tools get parseable content. There are three ways to get it:

- Use the **View as Markdown** option in the toolbar below the page title (in Elegant and AI modes).
- In **Markdown mode**, click the **View this page as .md** button next to that toolbar.
- Or go straight to the Markdown URL by adding `.md` to any page address, for example [docs.strapi.io/cms/api/rest.md](/cms/api/rest.md).

You can also point tools at the aggregated [llms.txt](/llms.txt), [llms-full.txt](/llms-full.txt), and [llms-code.txt](/llms-code.txt) files.

<Icon name="chat-circle-dots" /> **Page feedback widget.** Tell us what works and what does not, directly from the docs. You can leave general feedback using the widget at the bottom of each page, or select some text or code and click the floating **Leave feedback** button to send specific feedback about that content. Your input goes straight to the docs team.

<Icon name="pen-nib" /> **Contribute with Inki, our docs plugin for Claude Code.** [Inki](https://github.com/strapi/documentation/tree/main/claude-plugins/inki) is a Claude Code plugin that bundles the skills, prompts, templates, and editorial rules the Strapi docs team uses to research, write, review, and submit documentation. It helps you find where new content belongs, draft it from the right template, check it against our style guide and verify code examples, then open a pull request. You can install it from this repository's marketplace and run the whole workflow, or any single step, from Claude Code.
