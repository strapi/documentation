---
title: Using filters with the Document Service API
description: This document provides information about the filters available in the Document Service API.
displayed_sidebar: cmsSidebar
sidebar_label: Filters
tags:
- API
- Content API
- Document Service API
- filters
- logical operators
---

import DeepFilteringBlogLink from '/docs/snippets/deep-filtering-blog.md'
import Endpoint from '@site/src/components/ApiReference/Endpoint';

# Document Service API: Filters

The [Document Service API](/cms/api/document-service) offers the ability to filter results.

The following operators are available:

| Operator                         | Description                              |
| -------------------------------- | ---------------------------------------- |
| [`$eq`](#eq)                     | Equal                                    |
| [`$eqi`](#eqi)                   | Equal (case-insensitive)                 |
| [`$ne`](#ne)                     | Not equal                                |
| [`$nei`](#nei)                   | Not equal (case-insensitive)             |
| [`$lt`](#lt)                     | Less than                                |
| [`$lte`](#lte)                   | Less than or equal to                    |
| [`$gt`](#gt)                     | Greater than                             |
| [`$gte`](#gte)                   | Greater than or equal to                 |
| [`$in`](#in)                     | Included in an array                     |
| [`$notIn`](#notin)               | Not included in an array                 |
| [`$contains`](#contains)         | Contains                                 |
| [`$notContains`](#notcontains)   | Does not contain                         |
| [`$containsi`](#containsi)       | Contains (case-insensitive)              |
| [`$notContainsi`](#notcontainsi) | Does not contain (case-insensitive)      |
| [`$null`](#null)                 | Is null                                  |
| [`$notNull`](#notnull)           | Is not null                              |
| [`$between`](#between)           | Is between                               |
| [`$startsWith`](#startswith)     | Starts with                              |
| [`$startsWithi`](#startswithi)   | Starts with (case-insensitive)           |
| [`$endsWith`](#endswith)         | Ends with                                |
| [`$endsWithi`](#endswithi)       | Ends with (case-insensitive)             |
| [`$or`](#or)                     | Joins the filters in an "or" expression  |
| [`$and`](#and)                   | Joins the filters in an "and" expression |
| [`$not`](#not)                   | Joins the filters in an "not" expression |

<DeepFilteringBlogLink />

## Attribute operators

<br/>

<Endpoint
  id="not"
  method="GET"
  path="strapi.documents().findMany()"
  title="$not"
  description="Negates the nested condition(s)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $not: {
        $contains: 'Hello World',
      },
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="eq"
  method="GET"
  path="strapi.documents().findMany()"
  title="$eq"
  description="Attribute equals input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eq: 'Hello World',
    },
  },
});`
    },
    {
      label: 'Shorthand',
      code: `// $eq can be omitted:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
  },
});`
    }
  ]}
/>

<Endpoint
  id="eqi"
  method="GET"
  path="strapi.documents().findMany()"
  title="$eqi"
  description="Attribute equals input value (case-insensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eqi: 'HELLO World',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="ne"
  method="GET"
  path="strapi.documents().findMany()"
  title="$ne"
  description="Attribute does not equal input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $ne: 'ABCD',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="nei"
  method="GET"
  path="strapi.documents().findMany()"
  title="$nei"
  description="Attribute does not equal input value (case-insensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $nei: 'abcd',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="in"
  method="GET"
  path="strapi.documents().findMany()"
  title="$in"
  description="Attribute is contained in the input list."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});`
    },
    {
      label: 'Shorthand',
      code: `// $in can be omitted when passing an array of values:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});`
    }
  ]}
/>

<Endpoint
  id="notin"
  method="GET"
  path="strapi.documents().findMany()"
  title="$notIn"
  description="Attribute is not contained in the input list."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notIn: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="lt"
  method="GET"
  path="strapi.documents().findMany()"
  title="$lt"
  description="Attribute is less than the input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lt: 10,
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="lte"
  method="GET"
  path="strapi.documents().findMany()"
  title="$lte"
  description="Attribute is less than or equal to the input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lte: 10,
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="gt"
  method="GET"
  path="strapi.documents().findMany()"
  title="$gt"
  description="Attribute is greater than the input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gt: 5,
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="gte"
  method="GET"
  path="strapi.documents().findMany()"
  title="$gte"
  description="Attribute is greater than or equal to the input value."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gte: 5,
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="between"
  method="GET"
  path="strapi.documents().findMany()"
  title="$between"
  description={<>Attribute is between the 2 input values, boundaries included (e.g., <code>$between[1, 3]</code> will also return <code>1</code> and <code>3</code>).</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $between: [1, 20],
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="contains"
  method="GET"
  path="strapi.documents().findMany()"
  title="$contains"
  description="Attribute contains the input value (case-sensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $contains: 'Hello',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="notcontains"
  method="GET"
  path="strapi.documents().findMany()"
  title="$notContains"
  description="Attribute does not contain the input value (case-sensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContains: 'Hello',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="containsi"
  method="GET"
  path="strapi.documents().findMany()"
  title="$containsi"
  description={<><code>$containsi</code> is not case-sensitive, while <a href="#contains">$contains</a> is.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $containsi: 'hello',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="notcontainsi"
  method="GET"
  path="strapi.documents().findMany()"
  title="$notContainsi"
  description={<><code>$notContainsi</code> is not case-sensitive, while <a href="#notcontains">$notContains</a> is.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContainsi: 'hello',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="startswith"
  method="GET"
  path="strapi.documents().findMany()"
  title="$startsWith"
  description="Attribute starts with input value (case-sensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWith: 'ABCD',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="startswithi"
  method="GET"
  path="strapi.documents().findMany()"
  title="$startsWithi"
  description="Attribute starts with input value (case-insensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWithi: 'ABCD', // will return the same as filtering with 'abcd'
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="endswith"
  method="GET"
  path="strapi.documents().findMany()"
  title="$endsWith"
  description="Attribute ends with input value (case-sensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD',
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="endswithi"
  method="GET"
  path="strapi.documents().findMany()"
  title="$endsWithi"
  description="Attribute ends with input value (case-insensitive)."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD', // will return the same as filtering with 'abcd'
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="null"
  method="GET"
  path="strapi.documents().findMany()"
  title="$null"
  description={<>Attribute is <code>null</code>.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $null: true,
    },
  },
});`
    }
  ]}
/>

<Endpoint
  id="notnull"
  method="GET"
  path="strapi.documents().findMany()"
  title="$notNull"
  description={<>Attribute is not <code>null</code>.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notNull: true,
    },
  },
});`
    }
  ]}
/>

## Logical operators

<Endpoint
  id="and"
  method="GET"
  path="strapi.documents().findMany()"
  title="$and"
  description={<>All nested conditions must be <code>true</code>.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    $and: [
      {
        title: 'Hello World',
      },
      {
        createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
      },
    ],
  },
});`
    },
    {
      label: 'Implicit $and',
      code: `// $and will be used implicitly when passing an object with nested conditions:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
    createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
  },
});`
    }
  ]}
/>

<Endpoint
  id="or"
  method="GET"
  path="strapi.documents().findMany()"
  title="$or"
  description={<>One or many nested conditions must be <code>true</code>.</>}
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    $or: [
      {
        title: 'Hello World',
      },
      {
        createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
      },
    ],
  },
});`
    }
  ]}
/>

<Endpoint
  id="not-logical"
  method="GET"
  path="strapi.documents().findMany()"
  title="$not"
  description="Negates the nested conditions."
  codeTabs={[
    {
      label: 'JavaScript',
      code: `const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    $not: {
      title: 'Hello World',
    },
  },
});`
    }
  ]}
/>

:::note
`$not` can be used as:

- a logical operator (e.g. in `filters: { $not: { // conditions... }}`)
- [an attribute operator](#not) (e.g. in `filters: { attribute-name: $not: { ... } }`).
:::

:::tip
`$and`, `$or` and `$not` operators are nestable inside of another `$and`, `$or` or `$not` operator.
:::
