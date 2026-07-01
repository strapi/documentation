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

The [REST API](/cms/api/rest) accepts an optional `publicationFilter` query parameter when [Draft & Publish](/cms/features/draft-and-publish) is enabled. Use it to query derived publication cohorts such as never-published or modified documents. The [`status`](/cms/api/rest/status) parameter still selects whether each matching document returns its draft or published row.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type.
:::

## Default `status` {#default-status}

When `status` is omitted, the REST API defaults to `status=published` **before** applying `publicationFilter`.

| Query | Effective behavior |
| ----- | ------------------ |
| `?publicationFilter=never-published` | Empty (cohort is draft-only; default status is `published`) |
| `?status=draft&publicationFilter=never-published` | Never-published draft rows |
| `?publicationFilter=modified` | Published rows in the modified cohort |
| `?status=draft&publicationFilter=modified` | Draft rows in the modified cohort |
| `?publicationFilter=published-without-draft` | Orphan published rows (default `status=published` is correct) |

The Document Service API defaults to `status=draft` instead. See [Document Service API: default `status`](/cms/api/document-service/publication-filter#default-status).

:::note
Cohort definitions and `status` / `publicationFilter` combination tables are documented on [Document Service API: `publicationFilter`](/cms/api/document-service/publication-filter).
:::

Accepted kebab-case values: `never-published`, `has-published-version`, `modified`, `unmodified`, `never-published-document`, `has-published-version-document`, `published-without-draft`, `published-with-draft`. Invalid values return HTTP `400`.

## Get never-published draft documents {#never-published}

Pair-scoped `never-published` only matches draft rows. Pass `status=draft` because REST defaults to `status=published`.

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

The `modified` cohort includes pairs where the draft row is newer than its published peer. With no `status` parameter, REST returns **published** rows from that cohort. Pass `status=draft` to return the draft rows instead.

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

## Get published rows without a draft peer {#published-without-draft}

The `published-without-draft` cohort matches published rows that have no draft sibling for the same `(documentId, locale)`. Because REST defaults to `status=published`, you can omit `status` in the query URL.

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

## Combine with other parameters {#combine}

`publicationFilter` can be combined with [`filters`](/cms/api/rest/filters), [`locale`](/cms/api/rest/locale), [`populate`](/cms/api/rest/populate-select), and other [REST parameters](/cms/api/rest/parameters). All conditions are applied together.
