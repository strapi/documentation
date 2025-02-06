---
title: Interactive Query Builder
description: Use an interactive tool that leverages the querystring library to build your query URL
displayed_sidebar: cmsSidebar
sidebar_label: Interactive Query Builder
tags:
- Content API
- interactive query builder
- REST API
- qs library
---

# Build your query URL with Strapi's interactive tool

A wide range of parameters can be used and combined to query your content with the [REST API](/cms/api/rest), which can result in long and complex query URLs.

Strapi's codebase uses [the `qs` library](https://github.com/ljharb/qs) to parse and stringify nested JavaScript objects. It's recommended to use `qs` directly to generate complex query URLs instead of creating them manually.

You can use the following interactive query builder tool to generate query URLs automatically:

1. Replace the values in the _Endpoint_ and _Endpoint Query Parameters_ fields with content that fits your needs.
2. Click the **Copy to clipboard** button to copy the automatically generated _Query String URL_ which is updated as you type.

:::info Parameters usage
Please refer to the [REST API parameters table](/cms/api/rest/parameters) and read the corresponding parameters documentation pages to better understand parameters usage.
:::

<br />

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
  populate: {
    author: {
      fields: ['firstName', 'lastName']
    }
  },
  fields: ['title'],
  pagination: {
    pageSize: 10,
    page: 1,
  },
  status: 'published',
  locale: ['en'],
}
  `}
/>

<br />
 
<br />

:::note
The default endpoint path is prefixed with `/api/` and should be kept as-is unless you configured a different API prefix using [the `rest.prefix` API configuration option](/cms/configurations/api).<br/> For instance, to query the `books` collection type using the default API prefix, type `/api/books` in the _Endpoint_ field.
:::

:::caution Disclaimer
The `qs` library and the interactive query builder provided on this page:
- might not detect all syntax errors,
- are not aware of the parameters and values available in a Strapi project,
- and do not provide autocomplete features.

Currently, these tools are only provided to transform the JavaScript object in an inline query string URL. Using the generated query URL does not guarantee that proper results will get returned with your API.
:::
