---
title: "'status' cannot be used as an attribute name when Draft & Publish is enabled"
description: In Strapi 5, a user-defined 'status' attribute collides with the Draft & Publish publication status parameter and is rejected by the Content-type Builder.
sidebar_label: Reserved 'status' for Draft & Publish
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - draft & publish
 - content types
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `status` cannot be used as an attribute name when Draft & Publish is enabled

In Strapi 5, `status` is the reserved parameter used by the Document Service API and REST API to distinguish draft and published content. A user-defined attribute also named `status` on a Draft & Publish-enabled content type causes a naming collision.

<Intro />

<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Content types with Draft & Publish enabled can have a user-defined attribute named `status`. No conflict exists between this attribute name and the publication workflow, which uses the `publicationState` parameter.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

`status` is the reserved query parameter for Draft & Publish (it replaced `publicationState`). Defining a user attribute named `status` on a Draft & Publish-enabled content type causes a naming collision. Strapi 5 enforces this restriction as follows:

- **Content-type Builder:** Blocks creating a `status` attribute on any content type that has Draft & Publish enabled. Also blocks enabling Draft & Publish on a content type that already has a `status` attribute.
- **Server bootstrap:** Logs a warning (once per content type UID) when a `status` attribute is detected alongside Draft & Publish. The server continues booting so existing projects are not broken.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- The `status` attribute name is also part of the broader list of globally reserved names in Strapi 5. See [Some attributes and content-types names are reserved](/cms/migration/v4-to-v5/breaking-changes/attributes-and-content-types-names-reserved) for the full list.
- This breaking change adds a context-specific restriction: the `status` collision is only enforced when Draft & Publish is enabled on the content type.
- See [Draft & Publish](/cms/features/draft-and-publish) for details on how the `status` parameter works for querying draft and published content.

### Manual procedure

If a content type has a `status` attribute and Draft & Publish is enabled (or you intend to enable it), rename the `status` attribute before enabling Draft & Publish.

1. In the Content-type Builder, open the content type that has a `status` attribute.
2. Rename the `status` attribute to a non-reserved name (for example, `approval_status` or `workflow_state`).
3. Click **Save** to apply the schema change.
4. Update any queries, controllers, services, policies, or front-end code that references the old `status` attribute name.
5. If Draft & Publish was blocked from being enabled, re-enable it in the **Advanced settings** tab of the content type.
