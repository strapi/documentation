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

The [`status`](/cms/api/document-service/status) parameter selects which **row slice** to read for each document: `draft` rows have `publishedAt: null`, and `published` rows have a non-null `publishedAt`.

The optional `publicationFilter` parameter selects a **derived publication cohort** first: a set of `(documentId, locale)` pairs (or `documentId` only when [Internationalization (i18n)](/cms/features/internationalization) is disabled) defined by how draft and published rows relate. Strapi then returns the row that matches both the cohort and the resolved `status`.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type. If Draft & Publish is disabled, `publicationFilter` has no effect.
:::

`publicationFilter` is supported on `findOne()`, `findFirst()`, `findMany()`, and `count()`. It can be combined with [`filters`](/cms/api/document-service/filters), [`populate`](/cms/api/document-service/populate), and other query parameters. Invalid values raise a validation error.

## Default `status` when `publicationFilter` is used {#default-status}

`publicationFilter` is applied **after** `status` is resolved (explicitly or by default). Defaults differ by API surface:

| API surface | Default `status` when omitted |
| ----------- | ----------------------------- |
| Document Service API (direct) | `'draft'` |
| [REST API](/cms/api/rest/publication-filter) | `'published'` |
| [GraphQL API](/cms/api/graphql#publication-filter) | `PUBLISHED` |

Example with `publicationFilter: 'modified'` and no `status`:

```js
// Document Service API → draft rows in the modified cohort
await strapi.documents('api::restaurant.restaurant').findMany({
  publicationFilter: 'modified',
});

// REST: GET /api/restaurants?publicationFilter=modified → published rows in the modified cohort
```

Pair-scoped modes such as `never-published` only include draft rows in the cohort. With REST or GraphQL defaults (`status=published`), those queries return an empty result set unless you pass `status=draft` / `status: DRAFT`.

## Available values {#values}

REST and the Document Service API use kebab-case strings. GraphQL exposes the same cohorts through the [`PublicationFilter` enum](/cms/api/graphql#publication-filter).

| Value | Scope | Cohort definition (which `(documentId, locale)` pairs match) |
| ----- | ----- | -------------------------------------------------------------- |
| `never-published` | Pair | No row with non-null `publishedAt` exists for the same `(documentId, locale)` |
| `has-published-version` | Pair | **Both** a draft row and a published row exist for the same `(documentId, locale)` |
| `modified` | Pair | Both slices exist and `draft.updatedAt > published.updatedAt` |
| `unmodified` | Pair | Both slices exist and `draft.updatedAt <= published.updatedAt` |
| `never-published-document` | Document | No row with non-null `publishedAt` exists for the same `documentId` in **any** locale |
| `has-published-version-document` | Document | At least one published row exists for the same `documentId` in **any** locale |
| `published-without-draft` | Pair | A published row exists for the pair and **no** draft row exists for the same `(documentId, locale)` |
| `published-with-draft` | Pair | A published row exists for the pair and a draft row **also** exists for the same `(documentId, locale)` |

For content-types without i18n, read `(documentId, locale)` as `documentId` only.

### Semantics notes {#semantics}

- **`has-published-version` excludes orphan published rows**: If only a published row exists for a pair (no draft sibling), that pair is **not** in the `has-published-version` cohort. Orphan published rows can appear under `published-without-draft` when querying with `status: 'published'`.
- **`modified` / `unmodified` require both slices**: Pairs with only a draft or only a published row are not included.
- **`modified` ∪ `unmodified` = `has-published-version`** (for the same `status`): The two modes partition pairs that have both slices.
- **Document-scoped modes**: Existence checks use `documentId` only. A document with draft EN + published NL qualifies for `has-published-version-document` even though EN is never published at the pair level.
- **Published-slice diagnostics** (`published-without-draft`, `published-with-draft`): Only select published rows. They are degenerate (empty) with `status: 'draft'`.

### Content Manager list filters {#content-manager}

The Content Manager **Status** filter (`__status`) is translated server-side. Only the **Draft (never published)** option uses `publicationFilter`:

| Content Manager filter | Document Service query equivalent |
| ---------------------- | --------------------------------- |
| Draft (never published) | `status: 'draft'`, `publicationFilter: 'never-published-document'` |
| Published (all) | `status: 'published'` (no `publicationFilter`) |
| Published (modified) | Internal `publicationStatusFilter` (not a public REST/GraphQL parameter); similar intent to `status: 'published'` + `publicationFilter: 'modified'` but implemented separately in the Content Manager API |
| Published (unmodified) | Internal `publicationStatusFilter` (not a public REST/GraphQL parameter) |

The **Draft (never published)** filter is document-scoped (`never-published-document`), not pair-scoped `never-published`.

## Combine `status` and `publicationFilter` {#status-combination}

| `status` | `publicationFilter` | Rows returned |
| -------- | ------------------- | ------------- |
| `draft` | `never-published` | Draft rows for pairs never published in that locale |
| `published` | `never-published` | Empty (degenerate) |
| `draft` | `has-published-version` | Draft rows for pairs that also have a published version |
| `published` | `has-published-version` | Published rows for pairs that also have a draft version (excludes orphan published-only pairs) |
| `draft` | `modified` | Draft rows newer than their published peer |
| `published` | `modified` | Published rows whose draft peer is newer |
| `draft` | `unmodified` | Draft rows not newer than their published peer |
| `published` | `unmodified` | Published rows whose draft peer is not newer |
| `draft` | `never-published-document` | Draft rows whose document has no published row in any locale |
| `published` | `never-published-document` | Empty (degenerate) |
| `draft` | `has-published-version-document` | Draft rows whose document has at least one published row (any locale) |
| `published` | `has-published-version-document` | Published rows whose document has at least one draft row (any locale) |
| `published` | `published-without-draft` | Published rows with no draft sibling for the same pair |
| `draft` | `published-without-draft` | Empty (degenerate) |
| `published` | `published-with-draft` | Published rows that have a draft sibling for the same pair |
| `draft` | `published-with-draft` | Empty (degenerate) |

Valid but empty combinations do not return validation errors.

## Query never-published drafts {#never-published}

```js
const documents = await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published',
});
```

Returns draft rows for `(documentId, locale)` pairs with no published version for that locale.

## Query has-published-version drafts {#has-published-version}

```js
const documents = await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'has-published-version',
});
```

Returns draft rows where a published row also exists for the same `(documentId, locale)`. Does not return draft rows for pairs that only exist as orphan published rows.

## Query modified or unmodified documents {#modified-unmodified}

```js
// Draft side of modified pairs
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'modified',
});

// Published side of unmodified pairs
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'unmodified',
});
```

Comparison uses `updatedAt` on the draft and published rows for the same pair.

## Query document-scoped cohorts {#document-scoped}

```js
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published-document',
});
```

Returns draft rows for documents that have **never** been published in any locale. A multi-locale document with one published locale is excluded entirely, including its draft-only locales.

```js
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'has-published-version-document',
});
```

Returns draft rows for documents that have at least one published row in any locale (broader than pair-scoped `has-published-version`).

## Query published rows without or with a draft peer {#published-slice}

```js
// Orphan published rows (published row, no draft sibling for the same pair)
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-without-draft',
});

// Published rows that still have a draft sibling
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-with-draft',
});
```

`published-without-draft` and `published-with-draft` partition published rows per `(documentId, locale)` (excluding pairs with no published row).

## Use with `findOne()` and `findFirst()` {#find-one-find-first}

`publicationFilter` applies the same cohort rules. If the requested document (and locale, when applicable) is not in the cohort, `findOne()` and `findFirst()` return `null` even when the `documentId` exists.

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  status: 'draft',
  publicationFilter: 'never-published',
});
```

## Combine with `filters` and `populate` {#filters-populate}

`publicationFilter` is merged with other query filters (logical AND). When [populating relations](/cms/api/document-service/populate), nested queries on draft & publish content-types inherit the same cohort logic so populated results stay consistent with the parent query.

## Count documents in a cohort {#count}

```js
const neverPublishedCount = await strapi
  .documents('api::restaurant.restaurant')
  .count({
    status: 'draft',
    publicationFilter: 'never-published',
  });
```

Without `publicationFilter`, `count({ status: 'draft' })` still counts every draft row, including drafts whose document already has a published version. Use `publicationFilter: 'never-published'` or `'never-published-document'` to count only never-published cohorts (see [`status` documentation](/cms/api/document-service/status#count)).

## Validation {#validation}

Unknown `publicationFilter` values are rejected:

- Document Service API: throws a validation error.
- REST API: returns HTTP `400`.
- GraphQL: invalid enum values fail at query validation.

## Deprecated `hasPublishedVersion` parameter {#has-published-version-deprecated}

The boolean `hasPublishedVersion` parameter is deprecated in favor of `publicationFilter`. Strapi still accepts it on the REST API, GraphQL, and Document Service API and maps it to **document-scoped** modes:

| `hasPublishedVersion` | Maps to |
| --------------------- | ------- |
| `false` (or string `'false'`) | `never-published-document` |
| `true` (or string `'true'`) | `has-published-version-document` |

If both `publicationFilter` and `hasPublishedVersion` are passed, `publicationFilter` takes precedence.

REST and GraphQL examples: [REST API: `publicationFilter`](/cms/api/rest/publication-filter#has-published-version-deprecated), [GraphQL API: `publicationFilter`](/cms/api/graphql#publication-filter).

## Why not filter on `publishedAt` alone? {#why-not-published-at}

A single row's `publishedAt` only describes that row. Cohorts such as `never-published`, `has-published-version`, and `modified` require comparing or correlating **two rows** for the same `(documentId, locale)`. `publicationFilter` encodes those rules in one server-side query instead of multiple client round-trips.
