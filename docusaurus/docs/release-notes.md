---
title: Documentation release notes
description: Learn what has changed with each version of the Strapi 5 documentation, with links to GitHub pull requests for more information.
toc_max_heading_level: 2
custom_edit_url: null
---

<div className="release-notes-page">

This page lists all the Strapi Docs version numbers and their corresponding updates.

<details>
<summary><Icon name="graduation-cap" /> Strapi Docs version numbers explained:</summary>

The **Strapi Documentation** (Strapi Docs) at [docs.strapi.io](https://docs.strapi.io) **always documents the latest version of Strapi (CMS and Cloud) products**.

Since Strapi Docs version 5.0.0, the **docs' version number is independent from the Strapi product version**. Thus, the version numbers of <ExternalLink to="https://github.com/strapi/documentation" text="strapi/documentation"/> and <ExternalLink to="https://github.com/strapi/strapi" text="strapi/strapi"/> may differ.

Strapi Docs now follow the **<ExternalLink to="https://semver.org/" text="semantic versioning"/>** philosophy, but adapted to docs:

- **Major version** (6.0.0, 7.0.0…): A **significant rewrite** of the docs (content or framework). This may impact the user experience, redesign the site, or break old links (redirections are handled, but broken links can be <ExternalLink to="https://github.com/strapi/documentation/issues/new/choose" text="reported"/>).
- **Minor version** (5.1.0, 5.2.0…): **New Strapi features** or improvements to the docs framework (e.g., new components or tools).
- **Patch version** (5.1.1, 5.1.2…): **Content updates**, including improvement or extension of existing pages, code examples fixes, and typos.

New versions (minor or patch) are generally released weekly, on Wednesdays.
<br/>

</details>



_Reminder: Version numbers on this page are for the Strapi Docs package. The latest Strapi CMS version is [5.49.0](https://github.com/strapi/strapi/releases/tag/v5.49.0)._

## 7.0.0

The Strapi Documentation has a whole new design, complete with new reading modes, content width selector, redesigned API pages, a new feedback widget, and more! <Icon name="sparkle"/>. You can also contribute more easily to the documentation, with the [Inki plugin](https://github.com/strapi/documentation/tree/main/claude-plugins/inki) for Claude Code, specifically tailored to Strapi Docs. Check out all the new docs features on the [What's new?](/whats-new) page!

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Strapi Docs "v7" full redesign](https://github.com/strapi/documentation/pull/3281)
- [Elegant/Markdown/AI mode selector](https://github.com/strapi/documentation/pull/3156)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Document MCP capability builder helpers for plugin development](https://github.com/strapi/documentation/pull/3263)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Document license sync delay when changing Growth plan seats](https://github.com/strapi/documentation/pull/3285)
- [Fix documentId character count in documentation](https://github.com/strapi/documentation/pull/3275)
- [Restrict MCP capability registration to register() and rename the tools group](https://github.com/strapi/documentation/pull/3268)
- [Document Vite client types for admin image imports](https://github.com/strapi/documentation/pull/3266)
- [Document that the Deploy widget only shows in local development](https://github.com/strapi/documentation/pull/3223)

#### Cloud
- [Document Strapi Cloud admin variable limitation](https://github.com/strapi/documentation/pull/3265)

#### Repository
- [Fix selection feedback failing on the n8n webhook](https://github.com/strapi/documentation/pull/3294)
- [Raise self-healing workflow max-turns to prevent mid-run failures](https://github.com/strapi/documentation/pull/3291)
- [Add inki pitfall: document MCP capability registration in register() only](https://github.com/strapi/documentation/pull/3270)
- [Make `inki:pr` derive the Vercel preview host robustly for long branch names](https://github.com/strapi/documentation/pull/3269)
- [Add review fix loop and max-review-fix-rounds flag to inki](https://github.com/strapi/documentation/pull/3264)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/singhvishalkr" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/107715446?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="singhvishalkr"/>
</a>
<a href="https://github.com/x270" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/42441861?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="x270"/>
</a>
</div>
<br/>
<br/>




---

<p><Icon name="clock-counter-clockwise" /> <a href="/release-notes-archives">See older release notes</a> for all previous Strapi Docs versions (5.x and 6.x).</p>

</div>
