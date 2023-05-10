---
title: Interactive Query Builder
---

# Interactive Query Builder | PoC #2

Using `react-live` combined with `qs`.

<InteractiveQueryBuilder
  endpoint="/api/recipes"
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
