---
title: REST API - Strapi Developer Docs
description: Use API parameters to refine your Strapi REST API queries.
canonicalUrl: http://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html
next: ./filtering-locale-publication.md
---


# API parameters

API parameters can be used with the [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) to filter, sort, and paginate results and to select fields and relations to populate. Additionally, specific parameters related to optional Strapi features can be used, like the publication state and locale of a content-type.

The following API parameters are available:

| Operator           | Type          | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| `sort`             |  String or Array  | [Sort the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#sorting) |
| `filters`          | Object        | [Filter the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#filtering) |
| `populate`         | String or Object | [Populate relations, components, or dynamic zones](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#population) |
| `fields`           | Array         | [Select only specific fields to display](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection) |
| `pagination`       | Object        | [Page through entries](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#pagination) |
| `publicationState` | String        | [Select the Draft & Publish state](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#publication-state)<br/><br/>Only accepts the following values:<ul><li>`live`</li><li>`preview`</li></ul> |
| `locale`           | String or Array  | [Select one ore multiple locales](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#locale) |

Query parameters use the LHS bracket syntax (i.e. they are encoded using square brackets `[]`)

::::tip
!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-intro-short.md)!!!

:::details Example using qs:

```js
// Use qs to build the following query URL:
// /api/books?sort[0]=title%3Aasc&filters[title][$eq]=hello&populate=%2A&fields[0]=title&pagination[pageSize]=10&pagination[page]=1&publicationState=live&locale[0]=en

const qs = require('qs');
const query = qs.stringify({
  sort: ['title:asc'],
  filters: {
    title: {
      $eq: 'hello',
    },
  },
  populate: '*',
  fields: ['title'],
  pagination: {
    pageSize: 10,
    page: 1,
  },
  publicationState: 'live',
  locale: ['en'],
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/books?${query}`);
```

:::
::::
