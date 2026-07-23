---
title: Using publicationFilter with the Document Service API
description: Use the publicationFilter parameter with Strapi's Document Service API to query documents by the relationship between their draft and published versions, such as never-published or modified documents.
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

Use the optional `publicationFilter` parameter to query documents by the relationship between their draft and published versions, for example drafts that were never published, or entries modified since they were last published. It works with `findOne()`, `findFirst()`, `findMany()`, and `count()`, and combines with other query parameters. `status` still decides whether you get the draft or the published version.

</Tldr>

The `publicationFilter` is a parameter that, combined with [the `status` parameter](/cms/api/document-service/status), can help you cover complex queries to find exactly what you need with the [Document Service API](/cms/api/document-service).

While `status` answers "do I want the draft or the published version?", the `publicationFilter` parameter answers a different question: "which documents do I want, based on how their draft and published versions relate?". This is useful for example to find drafts that were never published, or entries whose draft has unsaved changes compared to what is live.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type. If Draft & Publish is disabled, `publicationFilter` has no effect.
:::

## Available values {#values}

`publicationFilter` accepts one of the following values:

| Value | Selects |
| ----- | ------- |
| `never-published` | Documents never published in a given locale |
| `never-published-document` | Documents never published in any locale |
| `modified` | Documents whose draft was edited since it was last published |
| `unmodified` | Documents whose draft has not changed since it was last published |
| `has-published-version` | Documents that have both a draft and a published version |
| `published-without-draft` | Published documents with no draft counterpart<br/>([diagnostics only](#diagnostics)) |
| `published-with-draft` | Published documents that also have a draft<br/>([diagnostics only](#diagnostics)) |
| `has-published-version-document` | Documents published in at least one locale<br/>(useful when [i18n](/cms/features/internationalization) is enabled) |

For detailed examples of how to use the `publicationFilter` values, including with the `status` parameter, see the [possible use cases](#use-cases) table.

:::note
* Unknown values raise a validation error. 
* Values ending in `-document` consider all locales of a document, which matters when [Internationalization (i18n)](/cms/features/internationalization) is enabled: for example, `never-published-document` excludes a document as soon as one of its locales is published. All other values consider one locale at a time. Without i18n, both variants behave the same.
:::

:::caution Caution: Different default behaviors for different APIs
The Document Service API returns draft versions of documents when `status` is omitted, while REST and GraphQL return the published ones instead, so REST API queries need an explicit `status` (see [REST API: `publicationFilter`](/cms/api/rest/publication-filter)).
:::

## Possible use cases {#use-cases}

The following table lists many possible use cases, illustrating how the `status` and `publicationFilter` parameters can be combined to find exactly what you need with the Document Service API. Click a use case to jump to a complete example:

| I want to… | Use `status` as… | Use `publicationFilter` as… |
| ---------- | ------------------ | ----------------------------- |
| [Find never published drafts](#never-published) | `draft` | `never-published` |
| [Find drafts never published in any locale](#never-published-document) | `draft` | `never-published-document` |
| [Find modified documents](#modified) | `draft` or `published` | `modified` |
| [Find unmodified documents](#unmodified) | `draft` or `published` | `unmodified` |
| [Find documents with a published version](#has-published-version) | `draft` or `published` | `has-published-version` |
| [Find documents published in at least one locale](#has-published-version-document) | `draft` or `published` | `has-published-version-document` |
| [Use with `findOne()` and `findFirst()`](#find-one-find-first) | `draft` or `published` | any value |
| [Count only matching documents](#count) | `draft` or `published` | any value |

:::note
Pairing a value with the opposite `status` from the table above is valid but returns nothing rather than an error: for example, `never-published` with `status: 'published'` returns an empty result, because these documents have no published version yet.
:::

## Examples

The following section lists the most common use cases summed up in the [table](#use-cases) above.

### Find never published drafts {#never-published}

One of the most common use cases is to find the drafts that have never been published. To do so, pass `status: 'draft'` and `publicationFilter: 'never-published'`.

This parameter combination works only on a given locale; to find these documents across all locales, [use `never-published-document`](#never-published-document) instead.

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'never-published'"
  description="Return the drafts that have never been published for their locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'never-published',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "New Restaurant",
      publishedAt: null,
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Find drafts never published in any locale {#never-published-document}

`publicationFilter: never-published-document` returns documents that have never been published in any locale. It looks at the whole document across all its locales, not one locale at a time.  To find these documents for a given locale only, [use `never-published`](#never-published) instead.

A document counts as published as soon as one of its locales is published: the document is then left out, even the locales that only exist as a draft. The example below returns the draft versions of documents that were never published anywhere:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'never-published-document'"
  description="Return the drafts of documents never published in any locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'never-published-document',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "d41r46wac4xix5vpba7561at",
      name: "New Restaurant",
      publishedAt: null,
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Find modified documents {#modified}

`publicationFilter: modified` selects documents whose draft has modified but unpublished changes. `status` then decides which version of those documents you get back.

For instance, with `status: 'draft'`, the query returns the draft versions:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'modified' and status: 'draft'"
  description="Return the draft versions of documents with unpublished changes.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'modified',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant (updated)",
      publishedAt: null,
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

<br/>
With `status: 'published'`, the same query returns the currently live version of those documents instead:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'modified' and status: 'published'"
  description="Return the currently live versions of documents with unpublished changes.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'published',
    publicationFilter: 'modified',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: "2024-03-14T15:40:45.330Z",
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Find unmodified documents {#unmodified}

`publicationFilter: unmodified` selects documents whose draft has not changed since it was last published. `status` then decides which version of those documents you get back.

For instance, with `status: 'draft'`, the query returns the draft versions:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'unmodified' and status: 'draft'"
  description="Return the draft versions of documents unchanged since their last publication.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'unmodified',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: null,
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

<br/>
With `status: 'published'`, the same query returns the currently live version of those documents instead:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'unmodified' and status: 'published'"
  description="Return the currently live versions of documents unchanged since their last publication.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'published',
    publicationFilter: 'unmodified',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: "2024-03-14T15:40:45.330Z",
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Find documents with a published version {#has-published-version}

`publicationFilter: has-published-version` selects documents that have both a draft and a published version for the same locale. `status` then decides which version of those documents you get back.

For instance, with `status: 'draft'`, the query returns the draft versions:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'has-published-version' and status: 'draft'"
  description="Return the draft versions of documents that also have a published version for the same locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'has-published-version',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: null,
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

<br/>
With `status: 'published'`, the same query returns the currently live version of those documents instead:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'has-published-version' and status: 'published'"
  description="Return the currently live versions of documents that also have a published version for the same locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'published',
    publicationFilter: 'has-published-version',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: "2024-03-14T15:40:45.330Z",
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Find documents with a published version in at least one locale {#has-published-version-document}

`publicationFilter: has-published-version-document` considers all locales, so it matches a document as soon as one of its locales is published. With `status: 'draft'`, it returns the draft versions of every locale of those documents, including locales that were never published themselves:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'has-published-version-document'"
  description="Return the draft versions of documents published in at least one locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'draft',
    publicationFilter: 'has-published-version-document',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: null,
      locale: "en", // published in at least one locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

### Use with `findOne()` and `findFirst()` {#find-one-find-first}

If the requested document (and locale, when applicable) does not match the filter, `findOne()` and `findFirst()` return `null` even when the `documentId` exists:

<Endpoint
  kind="js"
  path="strapi.documents().findOne()"
  title="findOne() with publicationFilter: 'never-published'"
  description="Return the document only if it matches the filter, null otherwise.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findOne({
    documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
    status: 'draft',
    publicationFilter: 'never-published',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
null // the documentId exists, but the document does not match never-published
```

</ResponseTab>
</Responses>

</Endpoint>

### Count only matching documents {#count}

Without `publicationFilter`, `count({ status: 'draft' })` counts every draft version, including drafts whose document already has a published version. Add `publicationFilter` to count only the documents that match a given value (see the [`status` documentation](/cms/api/document-service/status#count)):

<Endpoint
  kind="js"
  path="strapi.documents().count()"
  title="count() with publicationFilter: 'never-published'"
  description="Count only the documents that match a given value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const neverPublishedCount = await strapi
    .documents('api::restaurant.restaurant')
    .count({
      status: 'draft',
      publicationFilter: 'never-published',
    });
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
12 // the number of never-published drafts
```

</ResponseTab>
</Responses>

</Endpoint>

## Diagnostic values {#diagnostics}

The `published-without-draft` and `published-with-draft` values are meant for data-integrity checks only, not for everyday queries. In a healthy database, every published document also has a draft version, so these values are only useful to detect documents left in an inconsistent state by legacy data or manual database edits. They only work with `status: 'published'`.

<details>
<summary>Show diagnostic values examples</summary>

`publicationFilter: published-without-draft` selects published documents that have no draft counterpart. In normal operation this should return nothing:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'published-without-draft'"
  description="Return published documents with no matching draft version for the same locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'published',
    publicationFilter: 'published-without-draft',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
  {
    documentId: "j0klm1n2o3p4q5r6s7t8u9v",
    name: "Legacy Restaurant",
    publishedAt: "2024-01-10T09:15:00.000Z",
    locale: "en", // default locale
    // …
  }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

<br/>
`publicationFilter: published-with-draft` selects published documents that also have a draft, which is every published document in a healthy database:

<Endpoint
  kind="js"
  path="strapi.documents().findMany()"
  title="findMany() with publicationFilter: 'published-with-draft'"
  description="Return published documents that also have a matching draft version for the same locale.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
await strapi.documents('api::restaurant.restaurant').findMany({
    status: 'published',
    publicationFilter: 'published-with-draft',
});
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
[
    {
      documentId: "a1b2c3d4e5f6g7h8i9j0klm",
      name: "Biscotte Restaurant",
      publishedAt: "2024-03-14T15:40:45.330Z",
      locale: "en", // default locale
      // …
    }
  // …
]
```

</ResponseTab>
</Responses>

</Endpoint>

</details>

## Combination with other parameters {#combine}

`publicationFilter` is combined with other query parameters as a logical `AND`, including [`filters`](/cms/api/document-service/filters) and [`populate`](/cms/api/document-service/populate). When populating draft & publish relations, nested queries inherit the same filter logic.

## Content Manager mapping {#content-manager}

In the Content Manager, the **Draft (never published)** list filter maps to `status: 'draft'` and `publicationFilter: 'never-published-document'` (document-scoped, not the per-locale `never-published`).

