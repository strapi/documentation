---
title: "REST API: publicationFilter"
description: Use the publicationFilter parameter with Strapi's REST API to query documents by the relationship between their draft and published versions, such as never-published or modified documents.
sidebarDepth: 3
sidebar_label: Publication filter
next: ./populate-select.md
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- find
- interactive query builder
- publicationFilter
- qs library
- REST API
- status
---

# REST API: `publicationFilter`

<Tldr>

Add the optional `publicationFilter` query parameter to query documents by the relationship between their draft and published versions, for example documents that were never published, or documents modified since they were last published. It combines with other query parameters, and `status` still decides whether you get the draft or the published version.

</Tldr>

The `publicationFilter` is a query parameter that, combined with [the `status` parameter](/cms/api/rest/status), can help you cover complex queries to find exactly what you need with the [REST API](/cms/api/rest).

While `status` answers "do I want the draft or the published version?", the `publicationFilter` parameter answers a different question: "which documents do I want, based on how their draft and published versions relate?". This is useful for example to find documents that were never published, or documents whose draft has unsaved changes compared to what is live.

The underlying model behind how `publicationFilter` works is handled on the back-end server by the [Document Service API](/cms/api/document-service/publication-filter). The present page follows the exact same structure and explanations, but with examples tailored for the REST API, so you don't have to jump between 2 different pages.

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
* Unknown values return an HTTP `400` error.
* Values ending in `-document` consider all locales of a document, which matters when [Internationalization (i18n)](/cms/features/internationalization) is enabled: for example, `never-published-document` excludes a document as soon as one of its locales is published. All other values consider one locale at a time. Without i18n, both variants behave the same.
:::

:::caution Caution: Different default behaviors for different APIs
The REST API returns published versions of documents when `status` is omitted, so queries for draft-only values such as `never-published` need an explicit `status=draft`. The Document Service API returns draft versions instead (see [Document Service API: `publicationFilter`](/cms/api/document-service/publication-filter)).
:::

## Possible use cases {#use-cases}

The following table lists many possible use cases, illustrating how the `status` and `publicationFilter` parameters can be combined to find exactly what you need with the REST API. Click a use case to jump to a complete example:

| I want to… | Use `status` as… | Use `publicationFilter` as… |
| ---------- | ------------------ | ----------------------------- |
| [Find never published drafts](#never-published) | `draft` | `never-published` |
| [Find drafts never published in any locale](#never-published-document) | `draft` | `never-published-document` |
| [Find modified documents](#modified) | `draft` or `published` | `modified` |
| [Find unmodified documents](#unmodified) | `draft` or `published` | `unmodified` |
| [Find documents with a published version](#has-published-version) | `draft` or `published` | `has-published-version` |
| [Find documents with a published version in at least one locale](#has-published-version-document) | `draft` or `published` | `has-published-version-document` |

:::note
Pairing a value with the opposite `status` from the table above is valid but returns nothing rather than an error: for example, `never-published` with `status=published` returns an empty result, because these documents have no published version yet.
:::

## Examples

The following section lists the most common use cases summed up in the [table](#use-cases) above.

### Find never published drafts {#never-published}

One of the most common use cases is to find the drafts that have never been published. To do so, pass `status=draft` and `publicationFilter=never-published`.

This parameter combination works only on a given locale; to find these documents across all locales, [use `never-published-document`](#never-published-document) instead.

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=never-published"
  codePath="/api/restaurants?status=draft&publicationFilter=never-published"
  title="Get draft restaurants that have never been published for their locale"
  description="Return the drafts that have never been published for their locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=never-published' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'never-published',
  }, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "New Restaurant",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

### Find drafts never published in any locale {#never-published-document}

`publicationFilter=never-published-document` returns documents that have never been published in any locale. It looks at the whole document across all its locales, not one locale at a time. To find these documents for a given locale only, [use `never-published`](#never-published) instead.

A document counts as published as soon as one of its locales is published: the document is then left out, even the locales that only exist as a draft. The example below returns the draft versions of documents that were never published anywhere:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=never-published-document"
  codePath="/api/restaurants?status=draft&publicationFilter=never-published-document"
  title="Get drafts of restaurants never published in any locale"
  description="Return the drafts of documents never published in any locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=never-published-document' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'never-published-document',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "d41r46wac4xix5vpba7561at",
        "name": "New Restaurant",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

### Find modified documents {#modified}

`publicationFilter=modified` selects documents whose draft has modified but unpublished changes. `status` then decides which version of those documents you get back.

For instance, with `status=draft`, the query returns the draft versions:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=modified"
  codePath="/api/restaurants?status=draft&publicationFilter=modified"
  title="Get the draft versions of modified restaurants"
  description="Return the draft versions of documents with unpublished changes."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=modified' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'modified',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant (updated)",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

<br/>
With `status=published` (the REST default), the same query returns the currently live version of those documents instead:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=modified"
  codePath="/api/restaurants?publicationFilter=modified"
  title="Get the currently live version of modified restaurants"
  description="Return the currently live versions of documents with unpublished changes."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?publicationFilter=modified' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    publicationFilter: 'modified',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": "2024-03-14T15:40:45.330Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

### Find unmodified documents {#unmodified}

`publicationFilter=unmodified` selects documents whose draft has not changed since it was last published. `status` then decides which version of those documents you get back.

For instance, with `status=draft`, the query returns the draft versions:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=unmodified"
  codePath="/api/restaurants?status=draft&publicationFilter=unmodified"
  title="Get the draft versions of unmodified restaurants"
  description="Return the draft versions of documents unchanged since their last publication."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=unmodified' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'unmodified',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

<br/>
With `status=published` (the REST default), the same query returns the currently live version of those documents instead:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=unmodified"
  codePath="/api/restaurants?publicationFilter=unmodified"
  title="Get the currently live version of unmodified restaurants"
  description="Return the currently live versions of documents unchanged since their last publication."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?publicationFilter=unmodified' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    publicationFilter: 'unmodified',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": "2024-03-14T15:40:45.330Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

### Find documents with a published version {#has-published-version}

`publicationFilter=has-published-version` selects documents that have both a draft and a published version for the same locale. `status` then decides which version of those documents you get back.

For instance, with `status=draft`, the query returns the draft versions:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=has-published-version"
  codePath="/api/restaurants?status=draft&publicationFilter=has-published-version"
  title="Get the draft versions of restaurants that also have a published version"
  description="Return the draft versions of documents that also have a published version for the same locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=has-published-version' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'has-published-version',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

<br/>
With `status=published` (the REST default), the same query returns the currently live version of those documents instead:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=has-published-version"
  codePath="/api/restaurants?publicationFilter=has-published-version"
  title="Get the currently live version of restaurants that also have a draft"
  description="Return the currently live versions of documents that also have a published version for the same locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?publicationFilter=has-published-version' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    publicationFilter: 'has-published-version',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": "2024-03-14T15:40:45.330Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

### Find documents with a published version in at least one locale {#has-published-version-document}

`publicationFilter=has-published-version-document` considers all locales, so it matches a document as soon as one of its locales is published. With `status=draft`, it returns the draft versions of every locale of those documents, including locales that were never published themselves:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=has-published-version-document"
  codePath="/api/restaurants?status=draft&publicationFilter=has-published-version-document"
  title="Get the drafts of restaurants published in at least one locale"
  description="Return the draft versions of documents published in at least one locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?status=draft&publicationFilter=has-published-version-document' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
    publicationFilter: 'has-published-version-document',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": null,
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

## Diagnostic values {#diagnostics}

The `published-without-draft` and `published-with-draft` values are meant for data-integrity checks only, not for everyday queries. In a healthy database, every published document also has a draft version, so these values are only useful to detect documents left in an inconsistent state by legacy data or manual database edits. They describe published rows, so REST returns them with the default `status=published`.

<details>
<summary>Show diagnostic values examples</summary>

`publicationFilter=published-without-draft` selects published documents that have no draft counterpart. In normal operation this should return nothing:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=published-without-draft"
  codePath="/api/restaurants?publicationFilter=published-without-draft"
  title="Get published restaurants with no draft for the same locale"
  description="Return published documents with no matching draft version for the same locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?publicationFilter=published-without-draft' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    publicationFilter: 'published-without-draft',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "j0klm1n2o3p4q5r6s7t8u9v",
        "name": "Legacy Restaurant",
        "publishedAt": "2024-01-10T09:15:00.000Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

`publicationFilter=published-with-draft` selects published documents that also have a draft, which is every published document in a healthy database:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=published-with-draft"
  codePath="/api/restaurants?publicationFilter=published-with-draft"
  title="Get published restaurants that also have a draft for the same locale"
  description="Return published documents that also have a matching draft version for the same locale."
  codeTabs={[
    {
      label: "cURL",
      code: `curl 'http://localhost:1337/api/restaurants?publicationFilter=published-with-draft' \\
  -H 'Authorization: Bearer <token>'`
    },
    {
      label: "JavaScript",
      code: `const qs = require('qs');
const query = qs.stringify({
    publicationFilter: 'published-with-draft',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(\`/api/restaurants?\${query}\`);`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
    "data": [
      {
        "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
        "name": "Biscotte Restaurant",
        "publishedAt": "2024-03-14T15:40:45.330Z",
        "locale": "en"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 1,
        "total": 1
      }
    }
}`
    }
  ]}
/>

</details>

## Combine with other parameters {#combine}

`publicationFilter` can be combined with [`filters`](/cms/api/rest/filters), [`locale`](/cms/api/rest/locale), [`populate`](/cms/api/rest/populate-select), and other [REST parameters](/cms/api/rest/parameters). All conditions are applied together.
