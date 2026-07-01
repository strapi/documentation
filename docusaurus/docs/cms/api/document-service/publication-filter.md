---
title: Using publicationFilter with the Document Service API
description: Use the publicationFilter parameter with Strapi's Document Service API to query derived Draft & Publish cohorts such as never-published or modified documents.
displayed_sidebar: cmsSidebar
sidebar_label: Publication filter
tags:
- API
- Content API
- count()
- Document Service API
- Draft & Publish
- findMany()
- findFirst()
- findOne()
- publicationFilter
- status
---

# Document Service API: `publicationFilter`

<Tldr>

Use the optional `publicationFilter` parameter to query documents by the relationship between their draft and published versions, for example drafts that were never published, or entries modified since they were last published. It works with `findOne()`, `findFirst()`, `findMany()`, and `count()`, and combines with other query parameters. `status` still decides whether you get the draft or the published row.

</Tldr>

The [`status`](/cms/api/document-service/status) parameter answers "do I want the draft or the published version?". The `publicationFilter` parameter answers a different question: "which documents do I want, based on how their draft and published versions relate?".

For example, you can ask for drafts that were never published, or for entries whose draft has unsaved changes compared to what is live. `publicationFilter` selects that group of documents first; `status` then decides which row (draft or published) is returned for each.

:::note Key terms
Strapi Draft & Publish stores each entry as up to 2 database rows for the same document and locale:

- a *draft row* (`publishedAt` is empty)
- a *published row* (`publishedAt` is set)

The `status` parameter picks which of the 2 rows to read.

`publicationFilter` instead selects a *cohort*: a group of documents defined by how their draft and published rows relate (for example, never published, or draft newer than published). Some of these questions compare the 2 rows, so they cannot be expressed by filtering on `publishedAt` alone. That is what `publicationFilter` is for.

Each cohort has a *scope*, shown in the values table below:

- a *pair-scoped* value looks at 1 locale at a time (a `documentId` + `locale` pair). For example, `never-published`.
- a *document-scoped* value looks at the whole document across all locales. For example, `never-published-document`.

Without i18n, both scopes behave the same.
:::

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type. If Draft & Publish is disabled, `publicationFilter` has no effect.
:::

## Quick example {#quick-example}

To read the drafts that have never been published, pass `status: 'draft'` (so you read the draft row) and `publicationFilter: 'never-published'` (so you only keep documents with no published version):

```js
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published',
});
```

The rest of this page lists [all available values](#values), explains [how these cohorts are defined](#how-cohorts-work), and shows [more examples](#examples).

## Available values {#values}

`publicationFilter` accepts one of the following kebab-case values. REST and the Document Service API use these strings directly; GraphQL exposes the same set through the [`PublicationFilter` enum](/cms/api/graphql#publication-filter).

| Value | What it selects | Scope (i18n) |
| ----- | --------------- | ----- |
| `never-published` | Documents never published in that locale | Pair |
| `has-published-version` | Documents that have both a draft and a published version | Pair |
| `modified` | Documents whose draft was edited since it was last published | Pair |
| `unmodified` | Documents whose draft has not changed since it was last published | Pair |
| `published-without-draft` | Published entries with no matching draft | Pair |
| `published-with-draft` | Published entries that also have a matching draft | Pair |
| `never-published-document` | Documents never published in any locale | Document |
| `has-published-version-document` | Documents published in at least one locale | Document |

Unknown values raise a validation error (REST returns HTTP `400`; GraphQL fails at query validation).

The `Scope (i18n)` column matters when [Internationalization (i18n)](/cms/features/internationalization) is enabled: a *Pair* value looks at 1 locale at a time, while a *Document* value looks at the document across all its locales. See [How cohorts work](#how-cohorts-work) for the precise definitions. Without i18n, the 2 scopes behave the same.

`published-without-draft` and `published-with-draft` describe published rows, so they only return results with `status: 'published'`.

## Default `status` per API surface {#default-status}

`publicationFilter` is applied *after* `status` is resolved, so the default `status` of your API surface affects what you get back:

| API surface | Default `status` when omitted |
| ----------- | ----------------------------- |
| Document Service API (direct) | `draft` |
| [REST API](/cms/api/rest/publication-filter) | `published` |
| [GraphQL API](/cms/api/graphql#publication-filter) | `PUBLISHED` |

This matters for pair-scoped values that only contain draft rows, such as `never-published`: with the REST or GraphQL defaults (`published`), the query returns an empty result set unless you explicitly pass `status=draft` / `status: DRAFT`. The Document Service defaults to `draft`, so the [quick example](#quick-example) above works without setting `status`.

## More examples {#examples}

The following examples show the most common cohorts. For the exact rows each combination returns, see [How cohorts work](#how-cohorts-work).

### Never-published and modified documents {#never-published}

Both values below are pair-scoped, so with i18n they consider one locale at a time:

```js
// Drafts never published in this locale
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published',
});

// Draft rows whose draft is newer than the published version
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'modified',
});

// Published rows whose draft is newer (the currently-live version of modified entries)
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'modified',
});
```

### Documents never published in any locale {#document-scoped}

`never-published-document` is document-scoped, so a multi-locale document with even one published locale is excluded entirely, including its draft-only locales:

```js
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published-document',
});
```

### Published entries with or without a draft {#published-slice}

`published-without-draft` and `published-with-draft` describe published rows, so they require `status: 'published'`:

```js
// Published entries with no matching draft
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-without-draft',
});

// Published entries that also have a matching draft
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-with-draft',
});
```

### Use with `findOne()` and `findFirst()` {#find-one-find-first}

If the requested document (and locale, when applicable) is not in the cohort, `findOne()` and `findFirst()` return `null` even when the `documentId` exists:

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  status: 'draft',
  publicationFilter: 'never-published',
});
```

### Count documents in a cohort {#count}

Without `publicationFilter`, `count({ status: 'draft' })` counts every draft row, including drafts whose document already has a published version. Add `publicationFilter` to count only a specific cohort (see the [`status` documentation](/cms/api/document-service/status#count)):

```js
const neverPublishedCount = await strapi
  .documents('api::restaurant.restaurant')
  .count({
    status: 'draft',
    publicationFilter: 'never-published',
  });
```

## How cohorts work {#how-cohorts-work}

This section gives the precise definitions behind the values above (the Key terms box near the top of the page introduces the same concepts in plain language). You do not need it to use the common cohorts, but it is what lets you predict the result of any `status` × `publicationFilter` combination.

### The model {#the-model}

A document can have up to 2 rows for the same `(documentId, locale)` pair: a *draft row* (`publishedAt: null`) and a *published row* (non-null `publishedAt`). The [`status`](/cms/api/document-service/status) parameter picks which of these 2 rows to read, while `publicationFilter` selects the *cohort* of documents first, based on how their draft and published rows relate.

Strapi resolves the cohort first, then returns the row that matches the resolved `status`. Values ending in `-document` compare rows across every locale of a document; the others compare rows within a single `(documentId, locale)` pair (read this as `documentId` only when i18n is disabled).

### Cohort definitions {#cohort-definitions}

| Value | Scope (i18n) | A `(documentId, locale)` pair matches when… |
| ----- | ----- | -------------------------------------------- |
| `never-published` | Pair | no row with a non-null `publishedAt` exists for the pair |
| `has-published-version` | Pair | both a draft row and a published row exist for the pair |
| `modified` | Pair | both rows exist and `draft.updatedAt > published.updatedAt` |
| `unmodified` | Pair | both rows exist and `draft.updatedAt <= published.updatedAt` |
| `published-without-draft` | Pair | a published row exists for the pair and no draft row exists |
| `published-with-draft` | Pair | a published row exists for the pair and a draft row also exists |
| `never-published-document` | Document | no row with a non-null `publishedAt` exists for the `documentId` in any locale |
| `has-published-version-document` | Document | at least one published row exists for the `documentId` in any locale |

:::note
`has-published-version` excludes orphan published rows (a published row with no draft sibling for the same pair). Those rows match `published-without-draft` instead when `status` is `published`.
:::

### Which rows a combination returns {#status-combination}

Because the cohort is resolved before `status` selects a row, some combinations always return nothing. The grid below shows which `status` × `publicationFilter` pairs return rows and which are always empty:

| `publicationFilter` | With `status: 'draft'` | With `status: 'published'` |
| ------------------- | :--------------------: | :------------------------: |
| `never-published` | ✅ | ∅ |
| `never-published-document` | ✅ | ∅ |
| `has-published-version` | ✅ | ✅ |
| `has-published-version-document` | ✅ | ✅ |
| `modified` | ✅ | ✅ |
| `unmodified` | ✅ | ✅ |
| `published-without-draft` | ∅ | ✅ |
| `published-with-draft` | ∅ | ✅ |

✅ returns the rows of the resolved status within the cohort; ∅ is always empty because the cohort has no row of that status.

When a combination returns rows, it returns them as follows:

- With `status: 'draft'`, you get the draft rows of documents in the cohort.
- With `status: 'published'`, you get the published rows of documents in the cohort.

For example, `modified` with `status: 'draft'` returns the newer draft rows, while `modified` with `status: 'published'` returns the currently-live published rows of those same documents.

:::note
Valid but empty combinations (the ∅ cells) do not return validation errors, they return no rows.
:::

## Combine with other parameters {#combine}

`publicationFilter` is combined with other query parameters as a logical `AND`, including [`filters`](/cms/api/document-service/filters) and [`populate`](/cms/api/document-service/populate). When populating draft & publish relations, nested queries inherit the same cohort logic.

## Content Manager mapping {#content-manager}

In the Content Manager, the **Draft (never published)** list filter maps to `status: 'draft'` and `publicationFilter: 'never-published-document'` (document-scoped, not the pair-scoped `never-published`). Other Status filter options use internal APIs rather than public `publicationFilter` values.
