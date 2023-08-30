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
| `populate`         | String or Object | [Populate relations, components, or dynamic zones](/dev-docs/api/rest/populate-select#population) |
| `fields`           | Array         | [Select only specific fields to display](/dev-docs/api/rest/populate-select#field-selection) |
| `filters`          | Object        | [Filter the response](/dev-docs/api/rest/filters-locale-publication#filtering) |
| `locale`           | String or Array  | [Select one or multiple locales](/dev-docs/api/rest/filters-locale-publication#locale) |
| `publicationState` | String        | [Select the Draft & Publish state](/dev-docs/api/rest/filters-locale-publication#publication-state)<br/><br/>Only accepts the following values:<ul><li>`live`(default)</li><li>`preview`</li></ul> |
| `sort`             | String or Array  | [Sort the response](/dev-docs/api/rest/sort-pagination.md#sorting) |
| `pagination`       | Object        | [Page through entries](/dev-docs/api/rest/sort-pagination.md#pagination) |

Query parameters use the [LHS bracket syntax](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets) (i.e. they are encoded using square brackets `[]`).

:::tip
A wide range of REST API parameters can be used and combined to query your content, which can result in long and complex query URLs.<br/>👉 You can use Strapi's [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool to build query URLs more conveniently. 🤗
:::

:::warning
In Strapi 4.13+, sending invalid query parameters will result in an error status instead of ignoring them. Please ensure that you are only querying fields that:
- are in the correct format for the parameter
- are not private or password fields
- you have read permission on

If you need your API to have the old behavior of ignoring invalid parameters, you will need to customize your controller to only sanitize and not validate.
:::
