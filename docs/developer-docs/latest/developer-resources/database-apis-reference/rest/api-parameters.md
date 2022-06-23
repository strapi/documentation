---
title:
description:
canonicalUrl:
---

<!-- TODO: add SEO tags -->

# API parameters

API parameters can be used with the [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) to filter, sort, and paginate results and to select fields and relations to populate. Additionally, specific parameters related to optional Strapi features can be used, like the publication state and locale of a content-type.

The following API parameters are available:

| Operator           | Type          | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| `sort`             | String/Array  | [Sorting the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#sorting) |
| `filters`          | Object        | [Filter the response](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#filtering) |
| `populate`         | String/Object | [Populate relations, components, or dynamic zones](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#population) |
| `fields`           | Array         | [Select only specific fields to display](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection) |
| `pagination`       | Object        | [Page through entries](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md#pagination) |
| `publicationState` | String        | [Select the draft & publish state](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#publication-state)<br/><br/>Only accepts the following values:<ul><li>`live`</li><li>`preview`</li></ul> |
| `locale`           | String/Array  | [Select one ore multiple locales](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md#locale) |

Query parameters use the LHS bracket syntax (i.e. they are encoded using square brackets `[]`)

::::tip
Strapi takes advantage of the ability of [`qs`](https://github.com/ljharb/qs) to parse nested objects to create more complex queries.
Use `qs` directly to generate complex queries instead of creating them manually.

:::details Example using qs

```js
// GET /api/books?sort[0]=title%3Aasc&filters[title][$eq]=hello&populate=%2A&fields[0]=title&pagination[pageSize]=10&pagination[page]=1&publicationState=live&locale[0]=en

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
  encodeValuesOnly: true, // prettify url
});

await request(`/api/books?${query}`);
```

:::
::::
