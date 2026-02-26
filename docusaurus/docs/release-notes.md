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

_Reminder: Version numbers on this page are for the Strapi Docs package. The latest Strapi CMS version is [5.37.0](https://github.com/strapi/strapi/releases/tag/v5.37.0)._

## 6.16.2

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add Cursor rules and refine core project instructions](https://github.com/strapi/documentation/pull/2978)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add `strictParams` and custom Content API parameters](https://github.com/strapi/documentation/pull/2974)
- [Improve REST API population page UX](https://github.com/strapi/documentation/pull/2971)
- [SDK plugin v6](https://github.com/strapi/documentation/pull/2919)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix inconsistent database requirements](https://github.com/strapi/documentation/pull/2976)
- [Update example request URL in REST API documentation](https://github.com/strapi/documentation/pull/2972)

#### Repository
- [Update Cursor rules to include auto-chain mode](https://github.com/strapi/documentation/pull/2981)
- [Add auto-chain mode to Docs AI creation/review tools](https://github.com/strapi/documentation/pull/2980)
- [Fix bug in Strapi CMS release notes link generation](https://github.com/strapi/documentation/pull/2970)
- [Fix auto-labelling of PRs by source and content-type](https://github.com/strapi/documentation/pull/2969)
- [Fix branch naming rules](https://github.com/strapi/documentation/pull/2967)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/jhoward1994" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/48524071?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="jhoward1994"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/suhaila-5" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/114446710?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="suhaila-5"/>
</a>
</div>
<br/>
<br/>

## 6.16.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Update docs with persistent list view settings for the Content Manager](https://github.com/strapi/documentation/pull/2959)
- [Add extended AWS S3 provider configuration](https://github.com/strapi/documentation/pull/2949)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add `.strapi/` folder to "fix build issues with the generated types" TypeScript code example](https://github.com/strapi/documentation/pull/2963)
- [Add `--non-interactive` and `--enable-ab-tests` flags for CLI installation](https://github.com/strapi/documentation/pull/2957)
- [Update findOne method to use new document structure](https://github.com/strapi/documentation/pull/2950)
- [Update locale.md (POST requests)](https://github.com/strapi/documentation/pull/2948)
- [Add new `--no-build-admin` parameter for `strapi-develop` CLI](https://github.com/strapi/documentation/pull/2946)

#### Repository
- [Add instructions for URLs validation to Router tool](https://github.com/strapi/documentation/pull/2960)
- [Improve Router output (tables, instructions for pipeline)](https://github.com/strapi/documentation/pull/2956)
- [Improve Drafter tool for API pages](https://github.com/strapi/documentation/pull/2955)
- [Clarify CMS vs.  Docs version numbers in release notes](https://github.com/strapi/documentation/pull/2954)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Bellian" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2890554?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Bellian"/>
</a>
<a href="https://github.com/bart-webleads" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4990499?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="bart-webleads"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

<br/>

_Reminder: Version numbers on this page are for the Strapi Docs package. The latest Strapi CMS version is [**5.37.0**](https://github.com/strapi/strapi/releases/tag/v5.37.0)._

## 6.16.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add Router documentation tool](https://github.com/strapi/documentation/pull/2933)
- [Add Outliner tools for PR reviews](https://github.com/strapi/documentation/pull/2932)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Fix outdated `strapi develop` parameter docs](https://github.com/strapi/documentation/pull/2938)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add direct links to most asked integration pages](https://github.com/strapi/documentation/pull/2935)
- [Fix `ip` middleware not appearing in Configurations > Middlewares secondary sidebar](https://github.com/strapi/documentation/pull/2937)

#### Repository
- [Re-introduce Routing summary in details for documentation specialists (Router tool)](https://github.com/strapi/documentation/pull/2942)
- [Improvements to Router tool ](https://github.com/strapi/documentation/pull/2941)
- [Replace `migration-template.md` with `breaking-change-template.md`](https://github.com/strapi/documentation/pull/2931)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.15.1

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS

- [Add focal point documentation to media library page](https://github.com/strapi/documentation/pull/2930)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix typo in "Populate and Select" documentation](https://github.com/strapi/documentation/pull/2929)
- [Reorganize Media Library providers documentation](https://github.com/strapi/documentation/pull/2922)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/leon-win" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1682136?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="leon-win"/>
</a>
<a href="https://github.com/markkaylor" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/26598053?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="markkaylor"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.15.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Add docs for Media Library retroactive AI generation](https://github.com/strapi/documentation/pull/2918)

#### Repository
- [First documentation automation tools: agents.md, templates, and style checker](https://github.com/strapi/documentation/pull/2923)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Fix favicon docs](https://github.com/strapi/documentation/pull/2899)

#### Repository
- [Add global Annotation for naming conventions (kebab-case and more)](https://github.com/strapi/documentation/pull/2926)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Update supported Node versions](https://github.com/strapi/documentation/pull/2917)

#### Cloud
- [Clarify API request counting in usage billing documentation](https://github.com/strapi/documentation/pull/2924)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/markkaylor" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/26598053?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="markkaylor"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.14.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Fix Admin Panel API example that used deprecated helper plugin](https://github.com/strapi/documentation/pull/2910)

#### Cloud
- [Cloud yearly plans](https://github.com/strapi/documentation/pull/2901)
- [Data transfer between Cloud environments](https://github.com/strapi/documentation/pull/2891)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Doc bugfix: documents().update expects documentId param outside of data](https://github.com/strapi/documentation/pull/2909)

#### Cloud
- [Manage beta badge for Cloud features](https://github.com/strapi/documentation/pull/2913)
- [Update custom domain saving options](https://github.com/strapi/documentation/pull/2906)


#### Repository
- [Close corresponding milestone with automated release script](https://github.com/strapi/documentation/pull/2916)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/mephinet" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1292953?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mephinet"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.14.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add hosted MCP server for docs](https://github.com/strapi/documentation/pull/2889)

### <Icon name='pen-nib' /> Updated content

<br />

#### Repository
- [Document auth fix for 5.24.0+](https://github.com/strapi/documentation/pull/2764)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Suggest using NPM for package manager when deploying to Kubernetes](https://github.com/strapi/documentation/pull/2533)

#### Cloud
- [Update API request limits for the free Cloud plan](https://github.com/strapi/documentation/pull/2893)
- [Update region availability for Cloud](https://github.com/strapi/documentation/pull/2892)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/soheilnikroo" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/62501144?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="soheilnikroo"/>
</a>
</div>
<br/>
<br/>


## 6.13.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add `<Checklist>` component](https://github.com/strapi/documentation/pull/2883)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Checklist in SSO configuration documentation](https://github.com/strapi/documentation/pull/2882)
- [Document Service API intro rework: more details, updated structure](https://github.com/strapi/documentation/pull/2880)
- [Lifecycle functions rework: structure change, more details & examples](https://github.com/strapi/documentation/pull/2878)
- [Tip about nested page hierarchies in Content-type Builder documentation](https://github.com/strapi/documentation/pull/2876)
- [More details regarding image uploading](https://github.com/strapi/documentation/pull/2875)
- [Add example to Theme extension documentation](https://github.com/strapi/documentation/pull/2850)
- [Add TypeScript example and deliverability tip to Email documentation](https://github.com/strapi/documentation/pull/2839)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Notify users about Apollo In Memory Cache ID](https://github.com/strapi/documentation/pull/2884)
- [Add types for Backend Customization Custom Routes](https://github.com/strapi/documentation/pull/2879)

#### Repository
- [Fix unneeded margin on first-in-the-list custom docs card component](https://github.com/strapi/documentation/pull/2881)
- [Remove Amplitude-related elements](https://github.com/strapi/documentation/pull/2873)
- [Fix main content layout shift](https://github.com/strapi/documentation/pull/2872)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
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


## 6.12.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Add a guide about using RBAC from plugins](https://github.com/strapi/documentation/pull/2788)

#### Repository
- [LLMs-code.txt](https://github.com/strapi/documentation/pull/2819)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Update and add details & examples in GraphQL API migration guides](https://github.com/strapi/documentation/pull/2828)
- [Expand caution callout for media asset relations](https://github.com/strapi/documentation/pull/2822)
- [Aggregations section in GraphQL API documentation](https://github.com/strapi/documentation/pull/2810)

#### Cloud
- [Clarify differences between accessing API on self-hosted VS Cloud hosted app](https://github.com/strapi/documentation/pull/2818)

#### Repository
- [Add more information about `allowedHosts` for servers using Vite](https://github.com/strapi/documentation/pull/2813)
- [Fix main content alignment "flash"](https://github.com/strapi/documentation/pull/2812)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix mistake in Middleware documentation](https://github.com/strapi/documentation/pull/2820)

#### Cloud
- [Save & deploy for Node version](https://github.com/strapi/documentation/pull/2808)

#### Repository
- [Mention `/_health` endpoint in server config. & deployment docs](https://github.com/strapi/documentation/pull/2816)
- [Add warning for DATABASE_ environment variables](https://github.com/strapi/documentation/pull/2809)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/boazpoolman" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/9551934?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="boazpoolman"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.11.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add "Open with… [LLM]" buttons](https://github.com/strapi/documentation/pull/2794)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add security configuration documentation for Media Library](https://github.com/strapi/documentation/pull/2790)
- [Add information &  configuration example in Email feature page](https://github.com/strapi/documentation/pull/2801)
- [Add information on controllers & routes](https://github.com/strapi/documentation/pull/2797)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Include `<Tldr>` components content in `llms.txt`](https://github.com/strapi/documentation/pull/2803)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/araksyagevorgyan" target="_blank">
   <img className="no-zoom" src="https://avatars.githubusercontent.com/u/31159659?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="araksyagevorgyan"/>
</a>  
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.10.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [More clarity and precisions on multi relations support](https://github.com/strapi/documentation/pull/2796)
- [AI-powered i18n](https://github.com/strapi/documentation/pull/2773)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix outdated example in Understanding populate guide](https://github.com/strapi/documentation/pull/2798)
- [Add tip about older `npx create-strapi-app@latest` installation command](https://github.com/strapi/documentation/pull/2795)

#### Repository
- [Disable Kapa widget feedback](https://github.com/strapi/documentation/pull/2793)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.10.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Replace Algolia search with MeiliSearch](https://github.com/strapi/documentation/pull/2783)
- [Add a "News Ticker" to homepage](https://github.com/strapi/documentation/pull/2766)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add rate limiting documentation for users-permissions plugin](https://github.com/strapi/documentation/pull/2782)

#### Repository
- [Add contribution program links to footer and top nav](https://github.com/strapi/documentation/pull/2781)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Fix S key in Ask AI modal triggering the MeiliSearch modal](https://github.com/strapi/documentation/pull/2786)
- [Docs Contribution Program: updates in PR template & contribution guide](https://github.com/strapi/documentation/pull/2784)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/crasite" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/9783406?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="crasite"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.9.5

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Rework the Unit testing page for Strapi 5](https://github.com/strapi/documentation/pull/2712)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Cloud
- [Save & deploy for update repository](https://github.com/strapi/documentation/pull/2767)

#### Repository
- [Fix code block buttons overlapping content](https://github.com/strapi/documentation/pull/2772)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.9.4

<br />

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Cloud
- [Update Cloud docs for passwordless authentication](https://github.com/strapi/documentation/pull/2765)
- [Display Subscription ID in the project settings](https://github.com/strapi/documentation/pull/2761)
- [Update Usage & Billing with Free Plan details](https://github.com/strapi/documentation/pull/2762)

#### CMS
- [Update Homepage customization page to add layout customization tips](https://github.com/strapi/documentation/pull/2741)
- [Add FAQ entry for MCP](https://github.com/strapi/documentation/pull/2754)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/mathildeleg" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/82765709?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mathildeleg"/>
</a>
<a href="https://github.com/mazzucchelli" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/12052670?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mazzucchelli"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.9.3

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Strapi AI for Content-Type Builder](https://github.com/strapi/documentation/pull/2737)
- [Strapi AI for Media Library](https://github.com/strapi/documentation/pull/2751)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add information about disabling Strapi AI](https://github.com/strapi/documentation/pull/2749)
- [Fix `secrets.encryptionKey` in API tokens docs](https://github.com/strapi/documentation/pull/2743)

#### Cloud
- [Save & deploy for domains](https://github.com/strapi/documentation/pull/2746)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/laurenskling" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6753724?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="laurenskling"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/remidej" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8087692?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="remidej"/>
</a>
</div>
<br/>
<br/>


## 6.9.2

<br />
### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [fix: proxy breaking change in server example](https://github.com/strapi/documentation/pull/2731)

#### Cloud
- [Fix reactivate subscription errors](https://github.com/strapi/documentation/pull/2734)
- [Save & deploy on branch change](https://github.com/strapi/documentation/pull/2730)
- [Save & deploy Cloud environment variables](https://github.com/strapi/documentation/pull/2729)
- [Add note about cloud project reactivation](https://github.com/strapi/documentation/pull/2701)

#### Repository
- [Fix badges display & positioning](https://github.com/strapi/documentation/pull/2740)
- [Automatically add proper `source:` and `pr:` labels to PRs](https://github.com/strapi/documentation/pull/2735)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Aurelsicoko" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4144726?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Aurelsicoko"/>
</a>
<a href="https://github.com/adabaed" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/40322710?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="adabaed"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.9.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Fix Strapi TypeScript import example](https://github.com/strapi/documentation/pull/2721)
- [Explain `unique` parameter behavior with Draft & Publish](https://github.com/strapi/documentation/pull/2716)
- [Add session management documentation](https://github.com/strapi/documentation/pull/2709)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add additional context to the admin locales and translations page](https://github.com/strapi/documentation/pull/2717)
- [Fix CMS Quick Start for NPM compatibility](https://github.com/strapi/documentation/pull/2710)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/dumb-programmer" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/55425610?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="dumb-programmer"/>
</a>
<a href="https://github.com/jhoward1994" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/48524071?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="jhoward1994"/>
</a>
<a href="https://github.com/nclsndr" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/5462986?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="nclsndr"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.9.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Fix Strapi TypeScript import example](https://github.com/strapi/documentation/pull/2721)
- [Explain `unique` parameter behavior with Draft & Publish](https://github.com/strapi/documentation/pull/2716)
- [Add session management documentation](https://github.com/strapi/documentation/pull/2709)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add additional context to the admin locales and translations page](https://github.com/strapi/documentation/pull/2717)
- [Fix CMS Quick Start for NPM compatibility](https://github.com/strapi/documentation/pull/2710)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/dumb-programmer" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/55425610?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="dumb-programmer"/>
</a>
<a href="https://github.com/jhoward1994" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/48524071?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="jhoward1994"/>
</a>
<a href="https://github.com/nclsndr" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/5462986?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="nclsndr"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.9.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add new "TL;DR" component to all relevant pages](https://github.com/strapi/documentation/pull/2702)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Live Preview improvements](https://github.com/strapi/documentation/pull/2690)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Update docker.md](https://github.com/strapi/documentation/pull/2707)
- [Fix old Strapi code base links wrongly referencing master branch](https://github.com/strapi/documentation/pull/2704)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/the-clint" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/10893868?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="the-clint"/>
</a>
</div>
<br/>
<br/>

## 6.8.1

<br />
### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix typo in Content-type definition for credentials in TypeScript docs code example](https://github.com/strapi/documentation/pull/2697)

#### Repository
- [Automatically tag PRs: `internal` or `contribution`](https://github.com/strapi/documentation/pull/2691)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/busybox11" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/29630035?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="busybox11"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.8.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Contextual AI for codeblocks](https://github.com/strapi/documentation/pull/2675)
- [Add AI Toolbar](https://github.com/strapi/documentation/pull/2673)
- [Add starter questions to Kapa AI modal](https://github.com/strapi/documentation/pull/2672)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Fix the strapi/strapi contributing link](https://github.com/strapi/documentation/pull/2686)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/guptadeepak8" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/91896859?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="guptadeepak8"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.7.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Open API spec generation](https://github.com/strapi/documentation/pull/2665)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Update Admin Panel and Homepage customization pages with new widgets and new guided tour UI](https://github.com/strapi/documentation/pull/2671)
- [Update controller sanitization](https://github.com/strapi/documentation/pull/2661)
- [Document flat archive structure for import and export](https://github.com/strapi/documentation/pull/2658)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix no search results for `db.query`](https://github.com/strapi/documentation/pull/2667)
- [Fix typo in lifecycle functions documentation](https://github.com/strapi/documentation/pull/2660)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/devios327" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/67002707?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="devios327"/>
</a>
<a href="https://github.com/maccomaccomaccomacco" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2686869?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="maccomaccomaccomacco"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.6.6

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Add experimental firstPublishedAt configuration](https://github.com/strapi/documentation/pull/2636)
- [Update admin panel doc to add new 'Reset guided tour' setting](https://github.com/strapi/documentation/pull/2612)

#### Cloud
- [Transfer ownership feature in Strapi Cloud docs](https://github.com/strapi/documentation/pull/2611)
- [Download backup on Strapi Cloud](https://github.com/strapi/documentation/pull/2582)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Clarify `database` vs. `filename` usage in database configuration](https://github.com/strapi/documentation/pull/2657)
- [Database configuration: callout with information on data.db path](https://github.com/strapi/documentation/pull/2655)
- [Expand service docs to mention methods wrap core methods from Document Service API](https://github.com/strapi/documentation/pull/2648)
- [Clarify Content Manager API typing](https://github.com/strapi/documentation/pull/2646)
- [Note in Server about keep alive configuration](https://github.com/strapi/documentation/pull/2645)
- [Improve PostgreSQL database config. example](https://github.com/strapi/documentation/pull/2643)
- [Improve environment variables page](https://github.com/strapi/documentation/pull/2639)
- [Add advanced queries and policies guides to GraphQL docs](https://github.com/strapi/documentation/pull/2634)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix 'v4CompatibilityMode' typo for Strapi 5 migration in step by step guide](https://github.com/strapi/documentation/pull/2640)
- [Fix 'v4CompatibilityMode' typo for Strapi 5 migration](https://github.com/strapi/documentation/pull/2635)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/michael-sadcenko" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/198786895?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="michael-sadcenko"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.6.5

<br />
### <Icon name='sparkle' /> New content

<br />

#### Cloud
- [Async project creation on Strapi Cloud](https://github.com/strapi/documentation/pull/2581)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Improve GraphQL queries explanations (Flat vs. Relay-style)](https://github.com/strapi/documentation/pull/2621)
- [Explain there's only one GraphQL endpoint and how to customize its URL](https://github.com/strapi/documentation/pull/2617)
- [GraphQL & REST API: more information on operators & more examples](https://github.com/strapi/documentation/pull/2615)
- [Update Preview feature docs to mention Desktop/Mobile switch](https://github.com/strapi/documentation/pull/2607)
- [Better explain the move to `documentId`](https://github.com/strapi/documentation/pull/2604)
- [Expand and improve Client docs](https://github.com/strapi/documentation/pull/2602)
- [Mention that the Document Service API `findOne` returns `null` if no document found](https://github.com/strapi/documentation/pull/2614)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Fix MermaidWithFallback diagram display](https://github.com/strapi/documentation/pull/2609)
- [Fix tabs display with long labels](https://github.com/strapi/documentation/pull/2605)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/hanpaine" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/151527179?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="hanpaine"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.6.4

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add callout about overriding image function in Plugins extension docs](https://github.com/strapi/documentation/pull/2601)
- [Extend strapi.console documentation](https://github.com/strapi/documentation/pull/2600)
- [Document pluginOptions in Models](https://github.com/strapi/documentation/pull/2598)
- [Improve strapi-generate docs further](https://github.com/strapi/documentation/pull/2595)
- [Expand strapi generate documentation](https://github.com/strapi/documentation/pull/2593)
- [Document release statuses in Releases feature page](https://github.com/strapi/documentation/pull/2592)

#### Cloud
- [Add cancellation section in Cloud docs](https://github.com/strapi/documentation/pull/2599)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add mention about building the website in Quick Start Guide](https://github.com/strapi/documentation/pull/2590)

#### Cloud
- [Update Strapi Cloud settings screenshots](https://github.com/strapi/documentation/pull/2585)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.6.3

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### Cloud
- [Canny widget](https://github.com/strapi/documentation/pull/2575)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix incorrect wording in the description of the `findOne()` method](https://github.com/strapi/documentation/pull/2586)
- [Fix broken line breaks in step-by-step file](https://github.com/strapi/documentation/pull/2580)
- [Fix strapi network mismatch issues in Docker instructions](https://github.com/strapi/documentation/pull/2578)

#### Repository
- [Fix duplicate footer](https://github.com/strapi/documentation/pull/2589)
- [Fix Amplitude tracking experiment CDN](https://github.com/strapi/documentation/pull/2574)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Mcastres" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/17828745?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Mcastres"/>
</a>
<a href="https://github.com/Tasleem222" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/200180442?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Tasleem222"/>
</a>
<a href="https://github.com/fxm90" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/17249312?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="fxm90"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/ndaemy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/18691542?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ndaemy"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.6.2

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Conditional Fields (stable release)](https://github.com/strapi/documentation/pull/2554)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Remove duplicated sections in Preview docs](https://github.com/strapi/documentation/pull/2568)
- [Use new notation for accessing plugin config](https://github.com/strapi/documentation/pull/2562)

#### Repository
- [New tooltips in table of content](https://github.com/strapi/documentation/pull/2561)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/tung-eh" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/39895547?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="tung-eh"/>
</a>
<a href="https://github.com/unrevised6419" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1881266?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="unrevised6419"/>
</a>
</div>
<br/>
<br/>

## 6.6.1

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Add repeatable components/Document Service API breaking change](https://github.com/strapi/documentation/pull/2551)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Add link to blog article about webhooks and Next.js](https://github.com/strapi/documentation/pull/2549)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.6.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Conditional Fields (beta)](https://github.com/strapi/documentation/pull/2539)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Add tip about using copy markdown button and LLMs.txt files](https://github.com/strapi/documentation/pull/2543)
- [Expandable card docs wrapper](https://github.com/strapi/documentation/pull/2541)
- [Add configuration parameter to allow Kapa analytics](https://github.com/strapi/documentation/pull/2540)
- [Add inline property to custom Badge component](https://github.com/strapi/documentation/pull/2538)
- [Increase "Ask AI" modal width to 720px](https://github.com/strapi/documentation/pull/2536)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.5.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add LLMs.txt and LLMs-full.txt generation](https://github.com/strapi/documentation/pull/2507)

We've started adding <ExternalLink to="https://llmstxt.org/" text="llms.txt" /> support to the Strapi Docs. You can find the files in the footer or access them directly via the following links:
- [`llms.txt`](https://docs.strapi.io/llms.txt)
- [`llms-full.txt`](https://docs.strapi.io/llms-full.txt)

![LLM files in the footer](/img/assets/llms/llms-footer.png)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Update app creation flow to include Growth free trial](https://github.com/strapi/documentation/pull/2496)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Admin Panel API typo in example](https://github.com/strapi/documentation/pull/2508)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/abdallahmz" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/55534657?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="abdallahmz"/>
</a>
<a href="https://github.com/martinschilliger" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/11884891?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="martinschilliger"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.4.0

This release marks some significant additions and rewrites. We've rethought the dev-related content in the CMS docs, with a **clearer table of contents** for the development, configuration, and customization aspects of Strapi.

We've also added a handy **<Icon name="copy"/> Copy Markdown** button to the navigation bar on the right, so you can easily copy & paste raw Markdown content from the page into your favorite LLM!

Enjoy, and watch out for more AI-related features soon 👀

<br />

### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add "Copy Markdown" button](https://github.com/strapi/documentation/pull/2498)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Dev-related content rework, iteration #2 (admin panel configuration and customization)](https://github.com/strapi/documentation/pull/2505)
- [Dev-related content rework, iteration #1](https://github.com/strapi/documentation/pull/2501)
- [Content-type Builder revamp (stable release)](https://github.com/strapi/documentation/pull/2480)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Cloud
- [Cloud Free plan edits for CMS docs ](https://github.com/strapi/documentation/pull/2500)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.3.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### Cloud
- [Free Cloud plan](https://github.com/strapi/documentation/pull/2492)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.3.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Homepage API](https://github.com/strapi/documentation/pull/2474)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Remove Node 18 support and misc. cleanup](https://github.com/strapi/documentation/pull/2486)
- [Remove obsolete version attribute from Docker guide](https://github.com/strapi/documentation/pull/2485)
- [Viewable API tokens in the admin panel](https://github.com/strapi/documentation/pull/2484)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Bassel17" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/37274596?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Bassel17"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/dominicracine" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/23481112?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="dominicracine"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.2.2

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Content-type Builder revamp (beta release)](https://github.com/strapi/documentation/pull/2479)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Update theme extension (colors) in admin panel customization](https://github.com/strapi/documentation/pull/2478)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/soheilnikroo" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/62501144?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="soheilnikroo"/>
</a>
</div>
<br/>
<br/>

## 6.2.1

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add Guideflows to feature pages](https://github.com/strapi/documentation/pull/2473)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Display required version for audit logs, data export and import, and relations reordering](https://github.com/strapi/documentation/pull/2475)
- [Add link to external guide about deploying Strapi on Azure](https://github.com/strapi/documentation/pull/2472)
- [Fix screenshot description in Cloud projects overview](https://github.com/strapi/documentation/pull/2471)

#### Cloud
- [Fix various Cloud docs typos](https://github.com/strapi/documentation/pull/2476)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Mike-pw" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/82603294?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Mike-pw"/>
</a>
<a href="https://github.com/campos20" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/10170850?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="campos20"/>
</a>
<a href="https://github.com/mariekirsch" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/63100752?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mariekirsch"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.2.0

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Rewrite Custom fields documentation as a feature page](https://github.com/strapi/documentation/pull/2469)
- [Add `files` to Strapi Client docs](https://github.com/strapi/documentation/pull/2463)

#### Repository

- [Move contribution link to secondary table of contents on larger viewports](https://github.com/strapi/documentation/pull/2460)
- [New tabs design](https://github.com/strapi/documentation/pull/2459)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Fix plugin init command](https://github.com/strapi/documentation/pull/2467)
- [Remove unused plugins files](https://github.com/strapi/documentation/pull/2462)
- [Update suggested npm production Dockerfile](https://github.com/strapi/documentation/pull/2458)

#### Cloud
- [Add caution about custom domains and Strapi Cloud assets URLs](https://github.com/strapi/documentation/pull/2470)

#### Repository
- [Fix identity cards design](https://github.com/strapi/documentation/pull/2461)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/ClaXXX" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/58471398?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ClaXXX"/>
</a>
<a href="https://github.com/jozzhart" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/662502?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="jozzhart"/>
</a>
<a href="https://github.com/maccomaccomaccomacco" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2686869?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="maccomaccomaccomacco"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.1.0

<br />
### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [New design for features & plugins identity cards](https://github.com/strapi/documentation/pull/2456)
- [Fix issue #2378](https://github.com/strapi/documentation/pull/2454)
- [Update SSO badge style](https://github.com/strapi/documentation/pull/2453)
- [Add missing factory method in TypeScript development example](https://github.com/strapi/documentation/pull/2452)

#### Repository
- [Fix `key` token color in code blocks](https://github.com/strapi/documentation/pull/2455)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/kasperjha" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/49387825?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kasperjha"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.0.1

<br />

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS
- [Improve cors documentation](https://github.com/strapi/documentation/pull/2444)
- [fix broken link in preview.md](https://github.com/strapi/documentation/pull/2450)
- [Update step-by-step.md for Strapi 5 migration](https://github.com/strapi/documentation/pull/2449)
- [Add cross links for admin panel configuration and customization](https://github.com/strapi/documentation/pull/2447)
- [Unhide Testing page](https://github.com/strapi/documentation/pull/2446)

#### Cloud
- [Adding a small note about Cloud sidegrade and display new ui](https://github.com/strapi/documentation/pull/2451)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/HonzaTuron" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/20155254?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="HonzaTuron"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/oktapodia" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2752200?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="oktapodia"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/ztxone" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/39146381?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ztxone"/>
</a>
</div>
<br/>
<br/>

## 6.0.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### CMS
- [Add Design System breaking changes summary](https://github.com/strapi/documentation/pull/2435)

### <Icon name='pen-nib' /> Updated content

<br />

#### CMS
- [Add custom logo doc in Admin Panel page + link in Admin Panel Customi…](https://github.com/strapi/documentation/pull/2439)
- [Preview: Side panel (stable, CMS) ](https://github.com/strapi/documentation/pull/2411)

#### Cloud
- [Various Cloud docs updates](https://github.com/strapi/documentation/pull/2440)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Add support for dark mode to new homepage cards](https://github.com/strapi/documentation/pull/2442)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 6.0.0-beta.5

<br />
### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [Fixes AI button blurry box shadow](https://github.com/strapi/documentation/pull/2426)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/HichamELBSI" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/7756284?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="HichamELBSI"/>
</a>
</div>
<br/>
<br/>


## 6.0.0-beta.4

<br/>

### <Icon name="pen-nib" /> Updated content

<br/>

#### CMS
- [Update Content Manager to mention editing relations on the fly](https://github.com/strapi/documentation/pull/2406)
- [Preview: Side panel](https://github.com/strapi/documentation/pull/2400)

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

<br/>

#### Repository
- [Improve homepage "Ask AI" button effect](https://github.com/strapi/documentation/pull/2424)
- [Third draft of iteration #1 for new homepage](https://github.com/strapi/documentation/pull/2422)
- [Second draft of iteration #1 for new homepage](https://github.com/strapi/documentation/pull/2420)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.0.0-beta.3
<br />

### <Icon name="pen-nib" /> Updated content

<br />

#### Strapi Cloud
- [New Cloud plans (CMS docs)](https://github.com/strapi/documentation/pull/2396)

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

<br />

#### Repository
- [First draft of Iteration #1 for new homepage](https://github.com/strapi/documentation/pull/2416)
- [Apply `<ExternalLink />` component where necessary](https://github.com/strapi/documentation/pull/2415)
- [Fix pagination_next values](https://github.com/strapi/documentation/pull/2414)
- [Mention lifecycle hooks blog article](https://github.com/strapi/documentation/pull/2413)
- [Mention blog article about lifecycle functions](https://github.com/strapi/documentation/pull/2412)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.0.0-beta.2

<br />
### <Icon name='pen-nib' /> Updated content

<br />

#### CMS

- [Add missing TypeScript pages](https://github.com/strapi/documentation/pull/2402)
- [Mention codemods on breaking changes pages](https://github.com/strapi/documentation/pull/2393)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### CMS

- [Remove integration guides](https://github.com/strapi/documentation/pull/2390)

#### Repository
- [Mermaid fallback](https://github.com/strapi/documentation/pull/2403)
- [Update release notes script](https://github.com/strapi/documentation/pull/2395)
- [Add ExternalLink custom component](https://github.com/strapi/documentation/pull/2389)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 6.0.0-beta.1

<br/>

Version 6.0.0 of Strapi Docs is the biggest rewrite of documentation to date!<br/><Icon name="sparkle"/> This release includes:

- _Merge of Dev Docs & User Guide_: You now have one documentation per Strapi product: CMS and Cloud.
- _New Features section & pages_: Everything feature-related is in the new “Features” section of the CMS doc's navigation and each feature is now fully documented in one page.
- _Simplified navigation_: Many users reported frustration because of the too many levels and inconsistent behaviours in the navigation—both issues have been fixed and the navigation design has been improved for better readability.
- _More visuals throughout the docs_: We're slowly adding new interactive demos in pages to offer another way to learn about Strapi. Check out [Admin Panel](/cms/features/admin-panel), [Content Manager](/cms/features/content-manager), and [Content-type Builder](/cms/features/content-type-builder) pages to try the demos!

Feel free to [share your feedback](https://forms.gle/D1SXb8kYBVR7qijp6)!

### <Icon name="sparkle" /> New content

<br/>

#### CMS Docs
- [CMS folder reorganization](https://github.com/strapi/documentation/pull/2375)
- [New CMS documentation - More improvements & additions](https://github.com/strapi/documentation/pull/2359)
- [Proofread & improve CMS docs pages - pt. 2](https://github.com/strapi/documentation/pull/2369)
- [Proofread & improve CMS docs pages - pt. 1](https://github.com/strapi/documentation/pull/2350)
- [RBAC & SSO (Dev Docs) rework for CMS Docs](https://github.com/strapi/documentation/pull/2347)
- [New Features pages with User Guide content](https://github.com/strapi/documentation/pull/2288)
- [New Features pages with Dev Docs content](https://github.com/strapi/documentation/pull/2309)
- [CMS Docs (alpha)](https://github.com/strapi/documentation/pull/2340)

### <Icon name="pen-nib" /> Chore, fixes, typos, and other improvements

- [🎨 More design fixes for CMS Docs](https://github.com/strapi/documentation/pull/2366)
- [🎨 Design fixes for the new design](https://github.com/strapi/documentation/pull/2276)
- [🎨 New design](https://github.com/strapi/documentation/pull/2245)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.8.0

<br />
### <Icon name='sparkle' /> New content

<br />

#### Repository
- [Add a guide on how to create components for plugins](https://github.com/strapi/documentation/pull/2433)

### <Icon name='pen-nib' /> Updated content

<br />

#### Cloud
- [Project settings: Variables page revamp (pt. 2)](https://github.com/strapi/documentation/pull/2425)

#### Repository
- [Add use case for handling database migrations with TypeScript](https://github.com/strapi/documentation/pull/2432)
- [Add Email plugin ratelimiting configuration options](https://github.com/strapi/documentation/pull/2377)

### <Icon name='broom' /> Chore, fixes, typos, and other improvements

<br />

#### Cloud
- [Add callout for downgrade/upgrade Cloud plans](https://github.com/strapi/documentation/pull/2428)

#### Repository
- [Fix broken link to Strapi client README](https://github.com/strapi/documentation/pull/2436)
- [Fix missing location for content-type generation command in Store and Access Data (plugins dev) guide](https://github.com/strapi/documentation/pull/2434)
- [Fix Node versions in installation snippet](https://github.com/strapi/documentation/pull/2431)
- [Convert example in Store and Access Data guide from ES to DS](https://github.com/strapi/documentation/pull/2430)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pastelmind" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/29533079?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pastelmind"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 5.7.0

<br/>

### <Icon name="pen-nib" /> Updated content

<br/>

#### Dev Docs & User Guide

- [Preview: Side panel](https://github.com/strapi/documentation/pull/2410)

#### User Guide

- [Update Content Manager to mention editing relations on the fly](https://github.com/strapi/documentation/pull/2407)

#### Strapi Cloud

- [Strapi Cloud settings: Environment Variables revamp](https://github.com/strapi/documentation/pull/2419)

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

<br/>

#### Strapi Cloud

- [Use new Cloud plans screenshot](https://github.com/strapi/documentation/pull/2418)

#### Repository

- [Added disabled option for LiveEditor so that it does not steal focus - Closes issue #2409](https://github.com/strapi/documentation/pull/2423)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/ankit7201" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/5596406?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ankit7201"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.6.3

<br/>

### <Icon name="pen-nib" /> Updated content

<br/>

#### Dev Docs
- [Enhanced webhooks docs](https://github.com/strapi/documentation/pull/2391)

#### Strapi Cloud
- [New Cloud plans](https://github.com/strapi/documentation/pull/2394)

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

<br/>

#### Dev Docs
- [Fix descriptions for database parameters in CLI installation](https://github.com/strapi/documentation/pull/2404)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Goldbee2" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/56094194?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Goldbee2"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/ssganesh035" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/117903686?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ssganesh035"/>
</a>
</div>
<br/>
<br/>

## 5.6.2

### <Icon name="pen-nib" /> Updated content

#### Dev Docs

- [Setting up local plugin in Strapi without the Plugin SDK](https://github.com/strapi/documentation/pull/2392)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Bassel17" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/37274596?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Bassel17"/>
</a>
</div>
<br/>
<br/>

## 5.6.1

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

#### Dev Docs
- [Update admin-panel-api.md](https://github.com/strapi/documentation/pull/2383)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Rosalko" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/49037355?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Rosalko"/>
</a>
</div>
<br/>
<br/>

## 5.6.0

### <Icon name="sparkle" /> New content

#### Dev Docs

- [Strapi Client library](https://github.com/strapi/documentation/pull/2373)

### <Icon name="pen-nib" /> Updated content

#### Dev Docs

- [Pregenerated API tokens](https://github.com/strapi/documentation/pull/2380)

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

#### Dev Docs

- [Rename SDK to Client in files and diagrams](https://github.com/strapi/documentation/pull/2381)
- [Add missing TypeScript version to Admin Panel API code example](https://github.com/strapi/documentation/pull/2372)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/maccomaccomaccomacco" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2686869?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="maccomaccomaccomacco"/>
</a>
<a href="https://github.com/oktapodia" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2752200?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="oktapodia"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.5.4

### <Icon name="pen-nib" /> Chore, fixes, typos, and other improvements

#### Dev Docs
- [Update Doc Service API middleware example](https://github.com/strapi/documentation/pull/2368)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Gkleinereva" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/23621633?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Gkleinereva"/>
</a>
</div>
<br/>
<br/>

## 5.5.3

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

#### Dev Docs
- [Fix incorrect import of unstable_useContentManagerContext in Helper-plugin migration reference](https://github.com/strapi/documentation/pull/2367)
- [Fix typo in v4 → v5 step-by-step for GraphQL plugin](https://github.com/strapi/documentation/pull/2360)
- [Fix bug in the middlewares example](https://github.com/strapi/documentation/pull/2358)
- [Fix populate examples for Document Service API](https://github.com/strapi/documentation/pull/2356)

#### Strapi Cloud
- [Add last successful deployment’s date of the Production environment](https://github.com/strapi/documentation/pull/2361)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/AhmedMuhsingez" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/76662243?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="AhmedMuhsingez"/>
</a>
<a href="https://github.com/Qbject" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/65710914?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Qbject"/>
</a>
<a href="https://github.com/ahulterstrom" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/55113250?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ahulterstrom"/>
</a>
<a href="https://github.com/olegStrapier" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/148060535?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="olegStrapier"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.5.2

<br/>

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

#### Dev Docs
- [Add graphQL landingPage configuration and update Apollo playground to sandbox](https://github.com/strapi/documentation/pull/2343)
- [Add the --verbose option to the data transfer command description](https://github.com/strapi/documentation/pull/2352)
- [Removing the note about unmodified fields on the update](https://github.com/strapi/documentation/pull/2351)
- [Fix typo in admonition](https://github.com/strapi/documentation/pull/2349)
- [Fix Document Service API example typo](https://github.com/strapi/documentation/pull/2348)

#### Strapi Cloud
- [Update Cloud backups (restoration timestamp)](https://github.com/strapi/documentation/pull/2346)
- [Add the SSO badge for the new, paid add-on](https://github.com/strapi/documentation/pull/2341)
- [Update text for add environment button](https://github.com/strapi/documentation/pull/2299)

#### Repository
- [Add Amplitude's browser SDK and web experiment for future A/B testing](https://github.com/strapi/documentation/pull/2345)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/AtallahFatma" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/26638076?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="AtallahFatma"/>
</a>
<a href="https://github.com/Mcastres" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/17828745?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Mcastres"/>
</a>
<a href="https://github.com/Qbject" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/65710914?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Qbject"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/giu1io" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6680957?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="giu1io"/>
</a>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/maccomaccomaccomacco" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2686869?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="maccomaccomaccomacco"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.5.1

<br/>

### <Icon name="broom" /> Chore, fixes, typos, and other improvements

#### User Guide
- [Update User Guide intro. for stable new homepage](https://github.com/strapi/documentation/pull/2338)

#### Dev Docs
- [Fix typo in react-router-dom-6.md](https://github.com/strapi/documentation/pull/2337)
- [Use yarn/npm tabs in Strapi CLI examples](https://github.com/strapi/documentation/pull/2332)

#### Strapi Cloud
- [Remove account preferences section from cloud docs](https://github.com/strapi/documentation/pull/2333)


***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/giu1io" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6680957?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="giu1io"/>
</a>
<a href="https://github.com/johannesscheiermann" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19613511?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="johannesscheiermann"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.5.0

<Icon name="sparkle" /> The Strapi Docs website now has a brand new design! We hope you like it as much as we loved creating it.
Please feel free to [share your feedback](https://forms.gle/9NM8npMGoTkYetxGA).

### <Icon name="pen-nib" /> Updated content

#### User Guide
- [Mention new admin panel homepage and update screenshots](https://github.com/strapi/documentation/pull/2322)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Dev Docs
- [fix locale prerequisites](https://github.com/strapi/documentation/pull/2320)
- [fix wrong import](https://github.com/strapi/documentation/pull/2319)
- [Fix SDK plugin init command example in the SDK reference](https://github.com/strapi/documentation/pull/2318)
- [SDK beta callout](https://github.com/strapi/documentation/pull/2317)

#### Strapi Cloud
- [Add section about importing env vars](https://github.com/strapi/documentation/pull/2326)
- [Adding notes about GitLab groups](https://github.com/strapi/documentation/pull/2323)

#### Repository
- [Update docs content for Preview switching from beta to stable](https://github.com/strapi/documentation/pull/2325)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/Boegie19" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/34578426?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Boegie19"/>
</a>
<a href="https://github.com/Jimimimi" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1778990?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Jimimimi"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/lucasboilly" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/45385696?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="lucasboilly"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.4.0

<br/>

### <Icon name="sparkle" /> New content

<br/>

#### Repository
- [First iteration of Growth plan](https://github.com/strapi/documentation/pull/2303)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Dev Docs
- [Add a cross-link to the "commonly asked questions" about Strapi 5 article from the blog](https://github.com/strapi/documentation/pull/2313)
- [Add watchIgnoreFiles demo](https://github.com/strapi/documentation/pull/2312)
- [Fix unit testing docs for Strapi 5](https://github.com/strapi/documentation/pull/2308)
- [Mention Preview is under a feature flag](https://github.com/strapi/documentation/pull/2307)

***

This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/declandragon" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/37643710?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="declandragon"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/kasonde" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/13610895?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kasonde"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.3.0

<br/>

### <Icon name="sparkle" /> New content

<br/>

#### Dev Docs
- [Setting up the Preview feature](https://github.com/strapi/documentation/pull/2295)

#### User Guide
- [Previewing content in the Content Manager](https://github.com/strapi/documentation/pull/2295)

### <Icon name="pen-nib" /> Updated content

<br/>

#### Strapi Cloud
- [Rename a project](https://github.com/strapi/documentation/pull/2300)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

<br/>

#### Dev Docs
- [Update cross-link to U&P plugin from dev docs routes documentation](https://github.com/strapi/documentation/pull/2305)

#### Strapi Cloud
- [Update Cloud plans screenshot](https://github.com/strapi/documentation/pull/2304)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/AtallahFatma" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/26638076?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="AtallahFatma"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>

## 5.2.2

<br/>

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Dev Docs

- [Collapse prerequisites and display step 1 in Quick Start Guide](https://github.com/strapi/documentation/pull/2296)

#### Strapi Cloud
- [Design system v2 and new header in cloud docs](https://github.com/strapi/documentation/pull/2298)
- [Deleted old cloud assets](https://github.com/strapi/documentation/pull/2297)
- [Add restoration timestamp to docs and ressources](https://github.com/strapi/documentation/pull/2292)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/giu1io" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6680957?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="giu1io"/>
</a>
<a href="https://github.com/olegStrapier" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/148060535?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="olegStrapier"/>
</a>
<a href="https://github.com/pierreburgy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/5550462?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pierreburgy"/>
</a>
</div>
<br/>
<br/>


## 5.2.1

<br/>

### <Icon name="pen-nib" /> Updated content

- [Add `strapi cloud environment link` to Cloud CLI](https://github.com/strapi/documentation/pull/2282)
- [Add new Cloud regions](https://github.com/strapi/documentation/pull/2290)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Dev Docs
- [Add useTypescriptMigrations](https://github.com/strapi/documentation/pull/2283)
- [Fix typo in retro-compatibility flag value](https://github.com/strapi/documentation/pull/2294)
- [Fix typo in example code for injectComponent in Admin Panel API docs ](https://github.com/strapi/documentation/pull/2287)
- [Fix outdated mention of Gold plan in SSO docs](https://github.com/strapi/documentation/pull/2286)
- [Fix locale param. example in Interactive Query Builder](https://github.com/strapi/documentation/pull/2285)
- [Fix discardDraft() Document Service API example](https://github.com/strapi/documentation/pull/2284)

#### Strapi Cloud
- [Update credit cards handling](https://github.com/strapi/documentation/pull/2262)

#### Repository
- [Add release notes script](https://github.com/strapi/documentation/pull/2289)

***
This release was made possible thanks to the following contributors. Thank you! 🫶
<div>
<a href="https://github.com/DomDew" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/72755955?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="DomDew"/>
</a>
<a href="https://github.com/boiiiboi" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/87666954?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="boiiiboi"/>
</a>
<a href="https://github.com/Jimimimi" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/1778990?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Jimimimi"/>
</a>
<a href="https://github.com/gonbaum" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/14006828?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="gonbaum"/>
</a>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
</div>
<br/>
<br/>


## 5.2.0

<br/>

### <Icon name="sparkle" /> New content

<br/>

#### Dev Docs

- [Add WIP API Reference and Guides for TypeScript](https://github.com/strapi/documentation/pull/2266)

### <Icon name="pen-nib" /> Updated content

<br/>

#### Dev Docs

- [Add Knex Config function support](https://github.com/strapi/documentation/pull/2252)

#### User Guide

- [Integration between the Releases and Review Workflows features](https://github.com/strapi/documentation/pull/2273)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

<br/>

#### Cloud

- [Minor Cloud Docs changes](https://github.com/strapi/documentation/pull/2264)
- [Remove Strapi 5 warning for Cloud in FAQ](https://github.com/strapi/documentation/pull/2272)
- [Move custom cloud provider config warnings higher](https://github.com/strapi/documentation/pull/2278)

#### Dev Docs

- [Fix example request for update method in Document Service API](https://github.com/strapi/documentation/pull/2275)

#### Repo

- [Align navbar search box with 100% width](https://github.com/strapi/documentation/pull/2280)

***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>
<a href="https://github.com/mukulpadwal" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/80583870?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="mukulpadwal"/>
</a>
<a href="https://github.com/dzakki" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/38948296?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="dzakki"/>
</a>
<a href="https://github.com/giu1io" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6680957?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="giu1io"/>
</a>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/Convly" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/25851739?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Convly"/>
</a>
<a href="https://github.com/yanniskadiri" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/47896922?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="yanniskadiri"/>
</a>
</div>

<br/>
<br/>

## 5.1.3

<br/>

### <Icon name="broom" />Chore, fixes, typos, and other improvements

- [Improve instructions for upgrading to Apollo v4](https://github.com/strapi/documentation/pull/2271)
- [Fix code example in breaking change for new response format](https://github.com/strapi/documentation/pull/2270)
- [Update names of removed mutations in GraphQL breaking change](https://github.com/strapi/documentation/pull/2269)
- [Fix typo in a snippet used in Cloud docs](https://github.com/strapi/documentation/pull/2268)

***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>
<a href="https://github.com/laurenskling" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6753724?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="laurenskling"/>
</a>
<a href="https://github.com/xxtf1z" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/98784191?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="xxtf1z"/>
</a>
</div>

<br/>
<br/>

## 5.1.2

<br/>

### <Icon name="pen-nib" /> Updated content

<br/>

#### Dev Docs

- [Add support for 'latest' parameter in the upgrade tool](https://github.com/strapi/documentation/pull/2259)
- [Add example code and resulting screenshot for theme extension](https://github.com/strapi/documentation/pull/2261)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Strapi Cloud

- [Update cloud deployment logs screen](https://github.com/strapi/documentation/pull/2263)
- [Update confirmation modal text in Cloud Update Repository](https://github.com/strapi/documentation/pull/2258)

#### Repository

- [Restore bigger font-size for categories title in sidebar](https://github.com/strapi/documentation/pull/2260)

***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>
<a href="https://github.com/Convly" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/25851739?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Convly"/>
</a>
<a href="https://github.com/giu1io" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6680957?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="giu1io"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>

</div>

<br/>
<br/>

## 5.1.1

<br/>

### <Icon name="pen-nib" /> Updated content

<br/>

#### Strapi Cloud

* [List environments with Cloud CLI](https://github.com/strapi/documentation/pull/2239)

#### Dev Docs

* [`publicationAt` breaking change](https://github.com/strapi/documentation/pull/2249)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

#### Strapi Cloud

* [Update wording on purchasable extra Seats](https://github.com/strapi/documentation/pull/2238)

#### Dev Docs

* [Clarify sorting for relational fields in the Content Manager list view](https://github.com/strapi/documentation/pull/2224)
* [Fix typo for `v4CompatibilityMode` flag](https://github.com/strapi/documentation/pull/2257)
* [Fix step-by-step v4 → v5 migration (v4CompatibilityMode flag)](https://github.com/strapi/documentation/pull/2255)
* [Update environment declaration in Docker guide](https://github.com/strapi/documentation/pull/2253)
* [Fix createStrapi method in TypeScript development documentation](https://github.com/strapi/documentation/pull/2248)
* [Fix links in the REST API documentation](https://github.com/strapi/documentation/pull/2247)
* [Fix CheckPagePermissions code example in helper-plugin deprecation guide](https://github.com/strapi/documentation/pull/2244)
* [Fix typo for init command in Plugin SDK](https://github.com/strapi/documentation/pull/2243)
* [Add link to ms package for examples for JWT expiresIn](https://github.com/strapi/documentation/pull/2242)

#### Repository

* [Update LICENSE](https://github.com/strapi/documentation/pull/2251)


***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>

<a href="https://github.com/viniciuspalma" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3676032?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="viniciuspalma"/>
</a>
<a href="https://github.com/Patryk0494" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/74532122?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Patryk0494"/>
</a>
<a href="https://github.com/oyeamjad" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2516337?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="oyeamjad"/>
</a>
<a href="https://github.com/paulislava" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/43218364?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="paulislava"/>
</a>
<a href="https://github.com/gurdiga" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/53922?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="gurdiga"/>
</a>
<a href="https://github.com/maccomaccomaccomacco" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/2686869?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="maccomaccomaccomacco"/>
</a>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/kibwashere" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/3426213?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="kibwashere"/>
</a>
<a href="https://github.com/gonbaum" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/14006828?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="gonbaum"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>

</div>

<br/>
<br/>

## 5.1.0

<br/>

### <Icon name="sparkle" /> New content

<br/>

#### Cloud Docs

* [Multi-Environments](https://github.com/strapi/documentation/pull/2229)

### <Icon name="pen-nib" /> Updated content

<br/>

#### User Guide

* [Mention Blocked status for Releases](https://github.com/strapi/documentation/pull/2235)

#### Dev Docs

* [Clarify helper-plugin migration guide](https://github.com/strapi/documentation/pull/2230)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

<br/>

#### Dev Docs

* [Fix creating a custom provider example](https://github.com/strapi/documentation/pull/2237)
* [Fix pagination_next for first page of categories](https://github.com/strapi/documentation/pull/2234)
* [Fix SEO issues](https://github.com/strapi/documentation/pull/2233)
* [Fix links to strapi codebase](https://github.com/strapi/documentation/pull/2226)
* [Fix code example in general deployment guidelines](https://github.com/strapi/documentation/pull/2231)
* [Fix grammar in TypeScript development docs](https://github.com/strapi/documentation/pull/2232)

***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>

<a href="https://github.com/ChristopheCVB" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/946345?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="ChristopheCVB"/>
</a>
<a href="https://github.com/imcarlosguerrero" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/173419460?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="imcarlosguerrero"/>
</a>
<a href="https://github.com/stefanhuber" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/5379359?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="stefanhuber"/>
</a>
<a href="https://github.com/butcherZ" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8189028?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="butcherZ"/>
</a>
<a href="https://github.com/jhoward1994" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/48524071?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="jhoward1994"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>

</div>

<br/>
<br/>

## 5.0.0

_The following is an extensive list of all the pull requests that were merged since we started working on Strapi 5 documentation. For a quicker tour, please refer to the [What's new page](/whats-new)._

### <Icon name="sparkle" /> New content

<br/>

#### Dev Docs

* [Breaking change for database columns](https://github.com/strapi/documentation/pull/2221)
* [Content Manager APIs](https://github.com/strapi/documentation/pull/2220)
* [Breaking change for removing the "shared population strategy" for components & dynamic zones](https://github.com/strapi/documentation/pull/2204)
* [Templates](https://github.com/strapi/documentation/pull/2192)
* [Upgrade section revamp](https://github.com/strapi/documentation/pull/2153)
* [Custom U&P providers](https://github.com/strapi/documentation/pull/2138)
* [Breaking change for server.proxy config](https://github.com/strapi/documentation/pull/2131)
* [New "Upgrades" section (replaces updates & migration) for Strapi 5](https://github.com/strapi/documentation/pull/2126)
* [New proxy configuration feature](https://github.com/strapi/documentation/pull/2124)
* [lockIcon → licenseOnly breaking change](https://github.com/strapi/documentation/pull/2123)
* [Breaking change for default input validation](https://github.com/strapi/documentation/pull/2096)
* [Entity Service → Document Service: Breaking change + migration reference](https://github.com/strapi/documentation/pull/2093)
* [Plugins migration summary](https://github.com/strapi/documentation/pull/2089)
* [Breaking change for better-sqlite3](https://github.com/strapi/documentation/pull/2083)
* [Breaking change for Admin RBAC updates](https://github.com/strapi/documentation/pull/2082)
* [Breaking change for model config path uses uid](https://github.com/strapi/documentation/pull/2055)
* [Breaking change for upgrade from apollo v3 to apollo v4](https://github.com/strapi/documentation/pull/2053)
* [Breaking change for removed `localizations` field](https://github.com/strapi/documentation/pull/2050)
* [Breaking change for server log level configuration](https://github.com/strapi/documentation/pull/2049)
* [Breaking change for the removed webpack aliases](https://github.com/strapi/documentation/pull/2047)
* [Breaking change for strict requirements on configuration filenames](https://github.com/strapi/documentation/pull/2009)
* [Breaking change about removed support for some env-only options](https://github.com/strapi/documentation/pull/2007)
* [Breaking change for no findPage() method in Document Service API](https://github.com/strapi/documentation/pull/2006)
* [Breaking change for sorting by id](https://github.com/strapi/documentation/pull/1999)
* [Breaking change for Vite as default bundler](https://github.com/strapi/documentation/pull/1998)
* [Breaking change for U&P register.allowedFields](https://github.com/strapi/documentation/pull/1997)
* [Breaking change for CM redux store](https://github.com/strapi/documentation/pull/1995)
* [Breaking change for `strapi.container`](https://github.com/strapi/documentation/pull/1994)
* [Breaking change for i18n CM locale parameter](https://github.com/strapi/documentation/pull/1991)
* [Breaking change for strapi exports](https://github.com/strapi/documentation/pull/1989)
* [Breaking change for removal of `isSupportedImage`](https://github.com/strapi/documentation/pull/1988)
* [Breaking change about react-router-dom 6](https://github.com/strapi/documentation/pull/1987)
* [Upgrade tool](https://github.com/strapi/documentation/pull/1945)
* [Document Service](https://github.com/strapi/documentation/pull/1935)
* [Breaking change for fetch](https://github.com/strapi/documentation/pull/1915)
* [Breaking change for MySQL v5 support drop](https://github.com/strapi/documentation/pull/1892)
* [Init. breaking changes pages for Strapi v4 → v5 migration](https://github.com/strapi/documentation/pull/1896)
* [New v5 Dev Docs structure](https://github.com/strapi/documentation/pull/1811)

#### User Guide

* [Updated screenshots & last updates in User Guide](https://github.com/strapi/documentation/pull/2207)
* [Releases settings](https://github.com/strapi/documentation/pull/2120)

#### Cloud Docs

* [Port existing Cloud docs content from v4 website to website](https://github.com/strapi/documentation/pull/2154) 
* [Make main categories clickable in breadcrumbs](https://github.com/strapi/documentation/pull/2198)

#### Global

* [AI widget](https://github.com/strapi/documentation/pull/1898) 
* [Tagging system](https://github.com/strapi/documentation/pull/2076)
* [New homepage](https://github.com/strapi/documentation/pull/2087) 

### <Icon name="pen-nib" /> Updated content

<br/>

#### Dev Docs

* [Remove shared population strategy for dynamic zones](https://github.com/strapi/documentation/pull/2222)
* [Update breaking change for default server level log](https://github.com/strapi/documentation/pull/2216)
* [Update breaking change for reserved attributes and content-types names](https://github.com/strapi/documentation/pull/2215)
* [Update breaking change for `is-supported-image`](https://github.com/strapi/documentation/pull/2214)
* [Update codemods list](https://github.com/strapi/documentation/pull/2212)
* [Update some v5 migration and Plugin SDK docs](https://github.com/strapi/documentation/pull/2210)
* [Add more before examples for helper plugin migration](https://github.com/strapi/documentation/pull/2209)
* [Plugin migration updates](https://github.com/strapi/documentation/pull/2208)
* [Update the Quick Start Guide with Cloud CLI and new CLI prompts](https://github.com/strapi/documentation/pull/2203)
* [Update sdk-plugin init with new options](https://github.com/strapi/documentation/pull/2202)
* [Update helper plugin migration doc](https://github.com/strapi/documentation/pull/2200)
* [Update backend customization examples to Document Service API](https://github.com/strapi/documentation/pull/2196)
* [Add scope and warning details to the upgrade tool guide](https://github.com/strapi/documentation/pull/2195)
* [More examples for middlewares context to Document Service API](https://github.com/strapi/documentation/pull/2189)
* [Deprecate integration guides](https://github.com/strapi/documentation/pull/2173)
* [Transfer deployment guides to external resources](https://github.com/strapi/documentation/pull/2172)
* [Database lifecycles vs. Document Service middlewares](https://github.com/strapi/documentation/pull/2170)
* [Admin panel customization section rework](https://github.com/strapi/documentation/pull/2162)
* [Update REST API additional resources with new links and call to write](https://github.com/strapi/documentation/pull/2148)
* [Updates to the CLI installation guide](https://github.com/strapi/documentation/pull/2121)
* [FAQ section for 'Cannot find module @strapi/XXX' build error](https://github.com/strapi/documentation/pull/2116)
* [Update upgrade tool documentation with codemods updates](https://github.com/strapi/documentation/pull/2112)
* [Plugin CLI update for @strapi/sdk-plugin package](https://github.com/strapi/documentation/pull/2109)
* [Updates to relations in API docs](https://github.com/strapi/documentation/pull/2100)
* [Update doc service doc to match latest changes being prepared](https://github.com/strapi/documentation/pull/2074)
* [GraphQL updates](https://github.com/strapi/documentation/pull/2051)
* [REST API updates (incl. i18n and breaking changes)](https://github.com/strapi/documentation/pull/2038)
* [(no-)watch-admin and bundler updates](https://github.com/strapi/documentation/pull/2037)
* [Turn the TypeScript page into a section](https://github.com/strapi/documentation/pull/1913)
* [New Dev Docs introduction](https://github.com/strapi/documentation/pull/1911)
* [Update supported databases](https://github.com/strapi/documentation/pull/1887)

#### User Guide

* [Make main categories clickable in breadcrumbs](https://github.com/strapi/documentation/pull/2197)
* [Update whole content in User Guide](https://github.com/strapi/documentation/pull/2193)
* [Update Draft & Publish](https://github.com/strapi/documentation/pull/2027)

#### Cloud Docs

* [Make main categories clickable in breadcrumbs](https://github.com/strapi/documentation/pull/2198)

### <Icon name="broom" />Chore, fixes, typos, and other improvements

* [AI bot improvements](https://github.com/strapi/documentation/pull/2142)

***

This release was made possible thanks to the following contributors. Thank you! 🫶

<div>
<a href="https://github.com/derrickmehaffy" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/8593673?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="derrickmehaffy"/>
</a>
<a href="https://github.com/pwizla" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/4233866?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="pwizla"/>
</a>
<a href="https://github.com/MbonuJennifer" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/94189270?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="MbonuJennifer"/>
</a>
<a href="https://github.com/innerdvations" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/999278?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="innerdvations"/>
</a>
<a href="https://github.com/alexandrebodin" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/6065744?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="alexandrebodin"/>
</a>
<a href="https://github.com/Convly" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/25851739?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="Convly"/>
</a>
<a href="https://github.com/meganelacheny" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/19183360?v=4" width="40" height="40" style={{borderRadius: '50%'}} alt="meganelacheny"/>
</a>
<a href="https://github.com/Bassel17" target="_blank">
    <img className="no-zoom" src="https://avatars.githubusercontent.com/u/70578187" width="40" height="40" style={{borderRadius: '50%'}} alt="Bassel17"/>
</a>
</div>

</div>
