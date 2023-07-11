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

:::tip
A wide range of REST API parameters can be used and combined to query your content, which can result in long and complex query URLs.<br/>👉 You can use Strapi's [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool to build query URLs more conveniently. 🤗
:::
