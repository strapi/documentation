---
title: Parameters
description: Use API parameters to refine your Strapi REST API queries.

next: ./filtering-locale-publication.md
---

import QsIntroShort from '/docs/snippets/qs-intro-short.md'

# REST API parameters

API parameters can be used with the [REST API](/dev-docs/api/rest) to filter, sort, and paginate results and to select fields and relations to populate. Additionally, specific parameters related to optional Strapi features can be used, like the publication state and locale of a content-type.

The following API parameters are available:

| Operator           | Type          | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| `sort`             | String or Array  | [Sort the response](/dev-docs/api/rest/sort-pagination.md#sorting) |
| `filters`          | Object        | [Filter the response](/dev-docs/api/rest/filters-locale-publication#filtering) |
| `populate`         | String or Object | [Populate relations, components, or dynamic zones](/dev-docs/api/rest/populate-select#population) |
| `fields`           | Array         | [Select only specific fields to display](/dev-docs/api/rest/populate-select#field-selection) |
| `pagination`       | Object        | [Page through entries](/dev-docs/api/rest/sort-pagination.md#pagination) |
| `publicationState` | String        | [Select the Draft & Publish state](/dev-docs/api/rest/filters-locale-publication#publication-state)<br/><br/>Only accepts the following values:<ul><li>`live`(default)</li><li>`preview`</li></ul> |
| `locale`           | String or Array  | [Select one or multiple locales](/dev-docs/api/rest/filters-locale-publication#locale) |

Query parameters use the LHS bracket syntax (i.e. they are encoded using square brackets `[]`)

:::strapi Interactive Query Builder

A wide range of REST API parameters can be used and combined to query your content, which can result in long query URLs. Strapi's codebase uses [the `qs` library](https://github.com/ljharb/qs) to parse and stringify nested objects. It's recommended to use `qs` directly to generate complex query strings from JavaScript objects instead of creating query strings manually. You can use the following interactive query builder that leverages `qs` to generate URLs automatically:

1. In the _Endpoint_ field, type the path of the endpoint you want to query. The default endpoint path is prefixed with `/api/` and should be kept as-is unless you configured a different API prefix using [the `rest.prefix` API configuration option](/dev-docs/configurations/api). For instance, to query the `books` content-type using the default API prefix, type `/api/books`.
2. In the _Endpoint query parameters_ field, type whatever parameters and values you would like to use to define a specific query. Refer to the parameters table at the beginning of this page and read the corresponding parameters pages to better understand parameters usage. The _Query String URL_ field is updated as you type.
3. Click the **Copy to clipboard** button. The automatically generated query string is copied to your clipboard and ready to be pasted in the tool of your choice to query your content.

<InteractiveQueryBuilder
  endpoint="/api/books"
  code={`
{
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
}
  `}
/>

:::

:::caution
The `qs` library and the interactive query builder provided above do not validate the syntax. These tools are only provided to simplify building the query string but do not guarantee a valid syntax or result. 
:::
