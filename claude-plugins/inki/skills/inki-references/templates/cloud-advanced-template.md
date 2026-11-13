---
title: TEMPLATE — Cloud Advanced Topic Title
displayed_sidebar: cloudSidebar
description: One-sentence summary of the Strapi Cloud topic this page covers.
canonicalUrl: https://docs.strapi.io/cloud/advanced/<slug>.html
tags:
  - configuration
---
# Template — Cloud Advanced Topic Title

<Tldr>
What this page covers, scoped to Strapi Cloud, and the key takeaway at a glance.
</Tldr>

Intro paragraph stating what the page covers and how it applies to Strapi Cloud.

<!--
  STRUCTURE GUIDANCE
  ==================
  Pages under `cloud/advanced/` document a single advanced Strapi Cloud topic
  (e.g. database, email, middlewares, upload provider configuration). They do
  NOT follow a fixed H2 skeleton — H2 sections are thematic and depend on the
  topic. The existing pages (database.md, email.md, middlewares.md, upload.md)
  are the reference for tone and depth.

  Common core (always present):
  - Frontmatter (title, displayed_sidebar: cloudSidebar, description, tags),
    H1, <Tldr>, intro paragraph naming the topic.

  Then thematic H2s scoped to the topic.

  ONE PAGE = ONE TOPIC (most important rule for this type)
  ========================================================
  The H1 title must describe ALL the page's content, not just its first or
  largest section. Before adding a new top-level section, ask:

  - Does the page title still describe the whole page once this section is in?
    If the title says "Upload Provider Configuration" but the new section is
    about infrastructure size limits, the title no longer covers the page.
  - Is the new section a prerequisite/step of the page's stated task, or a
    separate reference topic that merely relates to it? Separate reference
    topics belong on their own page that this page links to, NOT inlined at
    the top.
  - Do other pages deep-link to the new section as a destination? If so, it
    wants to be its own page, not a sub-section of an unrelated page.

  If a section would broaden the page past its title, prefer one of:
  1. Extract it to its own `cloud/advanced/<topic>.md` page and cross-link.
  2. Place it below the page's primary content, not above it.
  3. Only if neither fits: broaden the H1 and <Tldr> so the title honestly
     reflects every top-level section.

  BUILDING BLOCKS (use where applicable):
  - Parameter / environment-variable tables
  - JS/TS Tabs for code examples (<Tabs groupId="js-ts">)
  - :::caution / :::note / :::tip callouts
  - <details> for advanced or edge-case examples

  Delete this comment block before publishing.
-->

## [Thematic section 1]

Description scoped to the page topic.

## [Thematic section 2]

...
