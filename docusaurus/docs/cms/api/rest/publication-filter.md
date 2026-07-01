---
title: Publication filter
description: Use the publicationFilter parameter with Strapi's REST API to query derived Draft & Publish cohorts such as never-published or modified documents.
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

Add the optional `publicationFilter` query parameter to filter results by the relationship between a document's draft and published versions, for example never-published or modified entries. The [`status`](/cms/api/rest/status) parameter still selects whether each result returns its draft or published row. REST defaults to `status=published`, so pass `status=draft` for draft-only cohorts.

</Tldr>

The [REST API](/cms/api/rest) accepts an optional `publicationFilter` query parameter when [Draft & Publish](/cms/features/draft-and-publish) is enabled. A *cohort* is a set of documents grouped by how their draft and published versions relate, for example documents never published, or documents whose draft was edited since it was last published. `publicationFilter` selects the cohort; [`status`](/cms/api/rest/status) then selects whether each result returns its draft or published row.

This page shows how to query the most common cohorts over REST. For the full list of values, their exact definitions, and every `status` combination, see [Document Service API: `publicationFilter`](/cms/api/document-service/publication-filter), which is the reference for the underlying model.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type.
:::

## Get never-published draft documents {#never-published}

`never-published` matches documents with no published version for that locale, so only draft rows exist. Pass `status=draft`, because REST defaults to `status=published`:

<Endpoint
  method="GET"
  path="/api/restaurants?status=draft&publicationFilter=never-published"
  title="Get draft restaurants that have never been published for their locale"
  codeTabs={[
    {
      label: "REST",
      code: `GET /api/restaurants?status=draft&publicationFilter=never-published`
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

## Get modified documents {#modified}

The `modified` cohort contains documents whose draft is newer than their published version. With no `status` parameter, REST returns the **published** rows of those documents. Pass `status=draft` to return the newer draft rows instead:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=modified"
  title="Get published restaurants in the modified cohort (default status)"
  codeTabs={[
    {
      label: "REST",
      code: `GET /api/restaurants?publicationFilter=modified`
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
      "documentId": "znrlzntu9ei5onjvwfaalu2v",
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

## Get published documents without a draft {#published-without-draft}

The `published-without-draft` cohort matches published rows that have no draft for the same `(documentId, locale)`. REST defaults to `status=published`, so you can omit `status`:

<Endpoint
  method="GET"
  path="/api/restaurants?publicationFilter=published-without-draft"
  title="Get published restaurants with no draft row for the same locale"
  codeTabs={[
    {
      label: "REST",
      code: `GET /api/restaurants?publicationFilter=published-without-draft`
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
      "documentId": "abcdefghijklmno456",
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

## Understand the default `status` {#default-status}

When `status` is omitted, REST defaults to `status=published` **before** applying `publicationFilter`. This is the most common source of unexpected empty results: a draft-only cohort such as `never-published` returns nothing under the default status. The table below shows the effect for the values used above:

| Query | Result |
| ----- | ------ |
| `?publicationFilter=never-published` | Empty (this cohort has draft rows only, and the default status is `published`) |
| `?status=draft&publicationFilter=never-published` | Never-published draft rows |
| `?publicationFilter=modified` | Published rows of modified documents |
| `?status=draft&publicationFilter=modified` | Draft rows of modified documents |
| `?publicationFilter=published-without-draft` | Published rows with no draft (default `status=published` is correct) |

The Document Service API defaults to `status=draft` instead. See [Document Service API: default `status`](/cms/api/document-service/publication-filter#default-status) for the full comparison across API surfaces.

## Reference: accepted values {#values}

REST accepts these kebab-case values: `never-published`, `has-published-version`, `modified`, `unmodified`, `never-published-document`, `has-published-version-document`, `published-without-draft`, `published-with-draft`. Invalid values return HTTP `400`.

Each value, its scope (pair or document), and its exact cohort definition are documented on [Document Service API: `publicationFilter`](/cms/api/document-service/publication-filter#values).

## Combine with other parameters {#combine}

`publicationFilter` can be combined with [`filters`](/cms/api/rest/filters), [`locale`](/cms/api/rest/locale), [`populate`](/cms/api/rest/populate-select), and other [REST parameters](/cms/api/rest/parameters). All conditions are applied together.
