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



_Reminder: Version numbers on this page are for the Strapi Docs package. The latest Strapi CMS version is [5.52.2](https://github.com/strapi/strapi/releases/tag/v5.52.2)._

## 7.1.0

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add callout to mention the beta Media Library](https://github.com/strapi/documentation/pull/3402)
- [Document Users & Permissions Content API session endpoints](https://github.com/strapi/documentation/pull/3395)
- [Document auth.cookie.path requirement when customizing admin.url](https://github.com/strapi/documentation/pull/3390)
- [Document Content History retention and version creation scope](https://github.com/strapi/documentation/pull/3386)
- [Document the status parameter on REST create and update requests](https://github.com/strapi/documentation/pull/3382)
- [Document SVG denial in generated project upload defaults](https://github.com/strapi/documentation/pull/3378)
- [Document GraphQL operation limits startup warning and recommended security profile](https://github.com/strapi/documentation/pull/3377)
- [Clarify partial data transfer stage filtering and preservation behavior](https://github.com/strapi/documentation/pull/3376)
- [Document content-type filtering options for data management CLI](https://github.com/strapi/documentation/pull/3357)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Remove unsupported $eqi from RBAC condition operators](https://github.com/strapi/documentation/pull/3391)
- [Clarify sizeLimit applies to file replacement operations](https://github.com/strapi/documentation/pull/3388)
- [Improve the REST API reference structure and fix response inaccuracies](https://github.com/strapi/documentation/pull/3383)
- [Clarify contact process for Enterprise plan changes](https://github.com/strapi/documentation/pull/3381)
- [Document that MCP actions are recorded in audit logs](https://github.com/strapi/documentation/pull/3380)
- [Correct dbclient value from 'sql' to 'sqlite'](https://github.com/strapi/documentation/pull/3379)
- [Add proxy IP header configuration options to server config documentation](https://github.com/strapi/documentation/pull/3373)
- [Clarify that a release publishes the latest draft, not a snapshot](https://github.com/strapi/documentation/pull/3370)
- [Remove incorrect private-provider section from custom email providers doc](https://github.com/strapi/documentation/pull/3361)
- [Use matching SSO login screenshot for dark mode](https://github.com/strapi/documentation/pull/3358)
- [Fix Document Service API examples not rendering with the redesigned Endpoint](https://github.com/strapi/documentation/pull/3351)

#### Repository
- [Apply the merge pending release flag when the source has not shipped](https://github.com/strapi/documentation/pull/3399)
- [Fetch only the release script in the unflag workflow](https://github.com/strapi/documentation/pull/3398)
- [Automate the merge pending release flag on self-healing doc PRs](https://github.com/strapi/documentation/pull/3397)
- [Fix ApiCall request/response layout at narrow content width](https://github.com/strapi/documentation/pull/3396)
- [Automate docs issue triage into PR creation, Slack ping, or redirect](https://github.com/strapi/documentation/pull/3389)
- [Fix note admonition and linked inline-code contrast/consistency](https://github.com/strapi/documentation/pull/3371)
- [Wrap single-status API responses in one bordered content box](https://github.com/strapi/documentation/pull/3360)
- [Fix content column width and alignment on API reference pages](https://github.com/strapi/documentation/pull/3359)
- [Move data-management CLI pages under features to fix breadcrumbs](https://github.com/strapi/documentation/pull/3354)
- [Fix doc card width so cards fill their grid cell](https://github.com/strapi/documentation/pull/3353)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/OcneanuVlad" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/102417094?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="OcneanuVlad"/>
</a>
<a href="https://github.com/annakudelska" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/140526342?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="annakudelska"/>
</a>
<a href="https://github.com/butcherZ" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8189028?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="butcherZ"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/singhvishalkr" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/107715446?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="singhvishalkr"/>
</a>
<a href="https://github.com/unrevised6419" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1881266?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="unrevised6419"/>
</a>
</div>
<br/>
<br/>


## 7.0.1

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add Inki component authoring guides and a non-Claude-Code usage note](https://github.com/strapi/documentation/pull/3300)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Rework OpenAPI HTTP endpoint config for the new access setting](https://github.com/strapi/documentation/pull/3316)
- [Add note on Users & Permissions role documentId support](https://github.com/strapi/documentation/pull/3292)
- [Document AWS credential provider function support for S3 uploads](https://github.com/strapi/documentation/pull/3289)
- [Add guide on reusing built-in admin panel components in plugins](https://github.com/strapi/documentation/pull/3267)
- [Document unified addSettingsLink and related deprecations in admin nav docs](https://github.com/strapi/documentation/pull/3204)
- [Document OpenAPI HTTP endpoint serving](https://github.com/strapi/documentation/pull/3188)

#### Cloud
- [Update Cloud documentation for Essential, Pro, and Scale pricing](https://github.com/strapi/documentation/pull/3307)
- [Update Cloud CLI deploy documentation for link-first workflow](https://github.com/strapi/documentation/pull/3306)

#### Repository
- [Make Inki review verify docs against the strapi PR they document](https://github.com/strapi/documentation/pull/3305)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Document SendGrid EU data residency region option](https://github.com/strapi/documentation/pull/3293)
- [Document admin logo transfer in data export/import](https://github.com/strapi/documentation/pull/3278)

#### Repository
- [View mode switcher improvements](https://github.com/strapi/documentation/pull/3317)
- [Add shared Claude Code settings to auto-offer the Inki plugin](https://github.com/strapi/documentation/pull/3312)
- [Sidebar UI improvements](https://github.com/strapi/documentation/pull/3311)
- [Update documentation-related label in self-healing workflows](https://github.com/strapi/documentation/pull/3304)
- [Fix scrollbar and unequal heights on doc cards](https://github.com/strapi/documentation/pull/3301)
- [Add Inki authoring guides for redesign MDX components](https://github.com/strapi/documentation/pull/3299)
- [Add an Install Strapi Docs MCP entry to the toolbar dropdown](https://github.com/strapi/documentation/pull/3298)
- [Mention the Inki docs plugin on the What's new page](https://github.com/strapi/documentation/pull/3296)
- [Add note about many-to-many relation ordering with GraphQL pagination](https://github.com/strapi/documentation/pull/3290)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/lucasboilly" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/45385696?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="lucasboilly"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/unrevised6419" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1881266?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="unrevised6419"/>
</a>
</div>
<br/>
<br/>




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
