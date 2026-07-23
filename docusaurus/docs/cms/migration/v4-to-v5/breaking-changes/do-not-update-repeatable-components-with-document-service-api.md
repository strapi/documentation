---
title: Updating repeatable components with the Document Service API
description: In Strapi 5, updating repeatable components by published component id is not recommended; prefer full-array replace or draft ids until a durable component key exists.
sidebar_label: Updating repeatable components
displayed_sidebar: cmsSidebar
tags:
  - breaking changes
  - Document Service API
  - components
  - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Updating repeatable components with the Document Service API is not recommended

<Tldr>

In Strapi 5, draft and published versions of a document use different numeric component `id`s. Reusing an `id` from a published response to update the draft usually fails. Prefer replacing the full component array (or editing against draft ids) until a durable component identity ships.

</Tldr>

In Strapi 5, it's not recommended to update repeatable components by reusing component `id`s from published API responses, because of how Draft & Publish interacts with the Document Service API.

<Intro />

<BreakingChangeIdCard
  plugins
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

You could partially update a repeatable component by passing its numeric `id`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Documents use a stable [`documentId`](/cms/api/document-service), but nested components still use status-local numeric `id`s. Publishing creates new component rows, so the draft and published versions of the same block have different `id`s. You cannot treat a published component `id` like a document-level identifier.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

With Draft & Publish enabled, a typical Content API flow looks like this:

```js
// Request: Content API returns the published version by default
GET /api/articles

// Response (published)
{
  data: {
    documentId: '…',
    components: [
      { id: 2, name: 'component-1' },
      { id: 4, name: 'component-2' },
    ],
  },
}
```

Updating with those published `id`s writes the draft, which has different component row ids:

```js
PUT /api/articles/{documentId}
{
  data: {
    components: [
      { id: 2, name: 'component-1-updated' }, // published id, usually wrong for draft
    ],
  },
}
```

This often fails with an error such as `Some of the provided components in components are not related to the entity`, because `id: 2` is not linked to the draft entry. This is related to the fact that [components and dynamic zones do not return an `id`](/cms/migration/v4-to-v5/breaking-changes/components-and-dynamic-zones-do-not-return-id) in REST API responses.

The [Document Service](/cms/api/document-service) defaults to the draft on read/update, so in-place updates by `id` can work there (and in the Content Manager) when you use draft component ids. The trap is mixing published ids with draft writes.

### Recommended workarounds

Until a durable nested identity is available, use one of the following.

#### 1. Replace the full component array (preferred for Content API)

Omit component `id`s and send the complete desired list. Strapi recreates the components on the draft. This is the supported, non-fragile approach for REST/GraphQL clients that only see published data:

```js
// Document Service
await strapi.documents('api::article.article').update({
  documentId,
  data: {
    components: [
      { name: 'component-1-updated' },
      { name: 'component-2' },
    ],
  },
});
```

```js
// REST Content API
PUT /api/articles/{documentId}
{
  "data": {
    "components": [
      { "name": "component-1-updated" },
      { "name": "component-2" }
    ]
  }
}
```

:::tip
Include every component you want to keep. Entries omitted from the array are removed from the draft.
:::

#### 2. Edit against draft component ids (Document Service / admin-style)

If you control the backend (custom routes, scripts, Document Service), load the draft, then update using those ids:

```js
const draft = await strapi.documents('api::article.article').findOne({
  documentId,
  status: 'draft',
  populate: ['components'],
});

await strapi.documents('api::article.article').update({
  documentId,
  data: {
    components: draft.components.map((component) =>
      component.id === targetDraftId
        ? { id: component.id, name: 'component-1-updated' }
        : { id: component.id, name: component.name }
    ),
  },
});
```

Do not reuse ids from a default Content API `GET` (published) for this pattern.

#### 3. Draft & Publish disabled

If Draft & Publish is disabled on the content-type, there is only one component row set, so id-based updates are less problematic. Prefer the full-array replace pattern anyway for simpler client code.
