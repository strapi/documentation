---
title: Parameters
description: Use API parameters to refine your Strapi REST API queries.
sidebar_label: Parameters
next: ./filtering-locale-publication.md
tags:
- API
- Content API
- filters
- locale
- populate
- REST API
- sort
- status
---

# REST API parameters

API parameters can be used with the [REST API](/cms/api/rest) to filter, sort, and paginate results and to select fields and relations to populate. Additionally, specific parameters related to optional Strapi features can be used, like the publication state and locale of a content-type.

The following API parameters are available:

| Operator           | Type          | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| `filters`          | Object        | [Filter the response](/cms/api/rest/filters) |
| `locale`           | String        | [Select a locale](/cms/api/rest/locale) |
| `status`           | String        | [Select the Draft & Publish status](/cms/api/rest/status) |
| `hasPublishedVersion` | Boolean    | [Filter by whether the document has a published version](/cms/api/rest/status#has-published-version) |
| `populate`         | String or Object | [Populate relations, components, or dynamic zones](/cms/api/rest/populate-select#population) |
| `fields`           | Array         | [Select only specific fields to display](/cms/api/rest/populate-select#field-selection) |
| `sort`             | String or Array  | [Sort the response](/cms/api/rest/sort-pagination.md#sorting) |
| `pagination`       | Object        | [Page through entries](/cms/api/rest/sort-pagination.md#pagination) |

Query parameters use the <ExternalLink to="https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets" text="LHS bracket syntax"/> (i.e. they are encoded using square brackets `[]`).

:::tip
A wide range of REST API parameters can be used and combined to query your content, which can result in long and complex query URLs.<br/>👉 You can use Strapi's [interactive query builder](/cms/api/rest/interactive-query-builder) tool to build query URLs more conveniently. 🤗
:::
