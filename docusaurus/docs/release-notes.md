---
title: Release notes
description: Learn what has changed with each version of the Strapi 5 documentation, with links to GitHub pull requests for more information.
custom_edit_url: null
---

<div className="release-notes-page">

## 5.0.0

_The following is an extensive list of all the pull requests that were merged since we started working on Strapi 5 documentation. For a quicker tour, please refer to the [What's new page](/dev-docs/whats-new)._

### ✨ New content

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

### 🖌 Updated content

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

### 🧹 Chore, fixes, typos, and other improvements

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
