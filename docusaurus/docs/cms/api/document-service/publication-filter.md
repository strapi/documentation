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

The optional `publicationFilter` parameter selects a **derived publication cohort** first: a set of `(documentId, locale)` pairs (or `documentId` only when [Internationalization (i18n)](/cms/features/internationalization) is disabled) defined by how draft and published rows relate. Cohorts compare draft and published rows for the same document; a single row's `publishedAt` is not enough. Strapi then returns the row that matches both the cohort and the resolved `status`.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type. If Draft & Publish is disabled, `publicationFilter` has no effect.
:::

`publicationFilter` is supported on `findOne()`, `findFirst()`, `findMany()`, and `count()`. It is combined with other query parameters as a logical AND, including [`filters`](/cms/api/document-service/filters) and [`populate`](/cms/api/document-service/populate). When populating draft & publish relations, nested queries inherit the same cohort logic. Unknown values raise a validation error (REST returns HTTP `400`; GraphQL fails at query validation).

In the Content Manager, the **Draft (never published)** list filter maps to `status: 'draft'` and `publicationFilter: 'never-published-document'` (document-scoped, not pair-scoped `never-published`). Other Status filter options use internal APIs, not public `publicationFilter` parameters.

## Default `status` when `publicationFilter` is used {#default-status}

`publicationFilter` is applied **after** `status` is resolved (explicitly or by default). Defaults differ by API surface:

| API surface | Default `status` when omitted |
| ----------- | ----------------------------- |
| Document Service API (direct) | `'draft'` |
| [REST API](/cms/api/rest/publication-filter) | `'published'` |
| [GraphQL API](/cms/api/graphql#publication-filter) | `PUBLISHED` |

The following example compares Document Service and REST behavior when only `publicationFilter: 'modified'` is passed:

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

:::note
`has-published-version` excludes orphan published rows (published-only pairs with no draft sibling). Those pairs match `published-without-draft` when `status` is `'published'`.
:::

## Combine `status` and `publicationFilter` {#status-combination}

Pass `status` explicitly or rely on the [default for your API surface](#default-status). Each table lists which rows a `publicationFilter` returns for that `status`.

### With `status: 'draft'`

| `publicationFilter` | Rows returned |
| ------------------- | ------------- |
| `never-published` | Draft rows for pairs never published in that locale |
| `has-published-version` | Draft rows for pairs that also have a published version |
| `modified` | Draft rows newer than their published peer |
| `unmodified` | Draft rows not newer than their published peer |
| `never-published-document` | Draft rows whose document has no published row in any locale |
| `has-published-version-document` | Draft rows whose document has at least one published row (any locale) |
| `published-without-draft`, `published-with-draft` | No rows |

### With `status: 'published'`

| `publicationFilter` | Rows returned |
| ------------------- | ------------- |
| `has-published-version` | Published rows for pairs that also have a draft version (excludes orphan published-only pairs) |
| `modified` | Published rows whose draft peer is newer |
| `unmodified` | Published rows whose draft peer is not newer |
| `has-published-version-document` | Published rows whose document has at least one draft row (any locale) |
| `published-without-draft` | Published rows with no draft sibling for the same pair |
| `published-with-draft` | Published rows that have a draft sibling for the same pair |
| `never-published`, `never-published-document` | No rows |

:::note
Valid but empty combinations do not return validation errors.
:::

## Examples {#examples}

### Never-published and modified cohorts {#never-published}

```js
// Pair-scoped: drafts never published in this locale
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published',
});

// Modified pairs: draft side vs published side
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'modified',
});

await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'modified',
});
```

### Document-scoped cohorts {#document-scoped}

```js
// Documents with no published row in any locale
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'draft',
  publicationFilter: 'never-published-document',
});
```

A multi-locale document with one published locale is excluded entirely, including its draft-only locales.

### Published rows with or without a draft peer {#published-slice}

`published-without-draft` and `published-with-draft` require `status: 'published'`.

```js
await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-without-draft',
});

await strapi.documents('api::restaurant.restaurant').findMany({
  status: 'published',
  publicationFilter: 'published-with-draft',
});
```

## Use with `findOne()` and `findFirst()` {#find-one-find-first}

If the requested document (and locale, when applicable) is not in the cohort, `findOne()` and `findFirst()` return `null` even when the `documentId` exists:

```js
await strapi.documents('api::restaurant.restaurant').findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  status: 'draft',
  publicationFilter: 'never-published',
});
```

## Count documents in a cohort {#count}

Without `publicationFilter`, `count({ status: 'draft' })` still counts every draft row, including drafts whose document already has a published version. Use `publicationFilter: 'never-published'` or `'never-published-document'` to count only never-published cohorts (see [`status` documentation](/cms/api/document-service/status#count)).

```js
const neverPublishedCount = await strapi
  .documents('api::restaurant.restaurant')
  .count({
    status: 'draft',
    publicationFilter: 'never-published',
  });
```
