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

# Document Service API: Filters

<Tldr>

The Document Service API provides attribute operators (`$eq`, `$lt`, `$contains`, etc.) and logical operators (`$and`, `$or`, `$not`) to filter query results with support for case-sensitive and case-insensitive matching.

</Tldr>


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
  kind="js"
  path="strapi.documents().findMany()"
  title="$not"
  description="Negates the nested condition(s).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $not: {
        $contains: 'Hello World',
      },
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="eq"
  kind="js"
  path="strapi.documents().findMany()"
  title="$eq"
  description="Attribute equals input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

</TabItem>
<TabItem value="shorthand" label="Shorthand">

```js
// $eq can be omitted:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="eqi"
  kind="js"
  path="strapi.documents().findMany()"
  title="$eqi"
  description="Attribute equals input value (case-insensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eqi: 'HELLO World',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="ne"
  kind="js"
  path="strapi.documents().findMany()"
  title="$ne"
  description="Attribute does not equal input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $ne: 'ABCD',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="nei"
  kind="js"
  path="strapi.documents().findMany()"
  title="$nei"
  description="Attribute does not equal input value (case-insensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $nei: 'abcd',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="in"
  kind="js"
  path="strapi.documents().findMany()"
  title="$in"
  description="Attribute is contained in the input list.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

</TabItem>
<TabItem value="shorthand" label="Shorthand">

```js
// $in can be omitted when passing an array of values:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="notin"
  kind="js"
  path="strapi.documents().findMany()"
  title="$notIn"
  description="Attribute is not contained in the input list.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notIn: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="lt"
  kind="js"
  path="strapi.documents().findMany()"
  title="$lt"
  description="Attribute is less than the input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lt: 10,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="lte"
  kind="js"
  path="strapi.documents().findMany()"
  title="$lte"
  description="Attribute is less than or equal to the input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lte: 10,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="gt"
  kind="js"
  path="strapi.documents().findMany()"
  title="$gt"
  description="Attribute is greater than the input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gt: 5,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="gte"
  kind="js"
  path="strapi.documents().findMany()"
  title="$gte"
  description="Attribute is greater than or equal to the input value.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gte: 5,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="between"
  kind="js"
  path="strapi.documents().findMany()"
  title="$between"
  description={<>Attribute is between the 2 input values, boundaries included (e.g., <code>$between[1, 3]</code> will also return <code>1</code> and <code>3</code>).</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $between: [1, 20],
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="contains"
  kind="js"
  path="strapi.documents().findMany()"
  title="$contains"
  description="Attribute contains the input value (case-sensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $contains: 'Hello',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="notcontains"
  kind="js"
  path="strapi.documents().findMany()"
  title="$notContains"
  description="Attribute does not contain the input value (case-sensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContains: 'Hello',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="containsi"
  kind="js"
  path="strapi.documents().findMany()"
  title="$containsi"
  description={<><code>$containsi</code> is not case-sensitive, while <a href="#contains">$contains</a> is.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $containsi: 'hello',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="notcontainsi"
  kind="js"
  path="strapi.documents().findMany()"
  title="$notContainsi"
  description={<><code>$notContainsi</code> is not case-sensitive, while <a href="#notcontains">$notContains</a> is.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContainsi: 'hello',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="startswith"
  kind="js"
  path="strapi.documents().findMany()"
  title="$startsWith"
  description="Attribute starts with input value (case-sensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWith: 'ABCD',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="startswithi"
  kind="js"
  path="strapi.documents().findMany()"
  title="$startsWithi"
  description="Attribute starts with input value (case-insensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWithi: 'ABCD', // will return the same as filtering with 'abcd'
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="endswith"
  kind="js"
  path="strapi.documents().findMany()"
  title="$endsWith"
  description="Attribute ends with input value (case-sensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="endswithi"
  kind="js"
  path="strapi.documents().findMany()"
  title="$endsWithi"
  description="Attribute ends with input value (case-insensitive).">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD', // will return the same as filtering with 'abcd'
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="null"
  kind="js"
  path="strapi.documents().findMany()"
  title="$null"
  description={<>Attribute is <code>null</code>.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $null: true,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="notnull"
  kind="js"
  path="strapi.documents().findMany()"
  title="$notNull"
  description={<>Attribute is not <code>null</code>.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notNull: true,
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

## Logical operators

<Endpoint
  id="and"
  kind="js"
  path="strapi.documents().findMany()"
  title="$and"
  description={<>All nested conditions must be <code>true</code>.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
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
});
```

</TabItem>
<TabItem value="implicit-and" label="Implicit $and">

```js
// $and will be used implicitly when passing an object with nested conditions:
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
    createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="or"
  kind="js"
  path="strapi.documents().findMany()"
  title="$or"
  description={<>One or many nested conditions must be <code>true</code>.</>}>

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
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
});
```

</TabItem>
</Tabs>

</Endpoint>

<Endpoint
  id="not-logical"
  kind="js"
  path="strapi.documents().findMany()"
  title="$not"
  description="Negates the nested conditions.">

<Tabs>
<TabItem value="javascript" label="JavaScript">

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    $not: {
      title: 'Hello World',
    },
  },
});
```

</TabItem>
</Tabs>

</Endpoint>

:::note
`$not` can be used as:

- a logical operator (e.g. in `filters: { $not: { // conditions... }}`)
- [an attribute operator](#not) (e.g. in `filters: { attribute-name: $not: { ... } }`).
:::

:::tip
`$and`, `$or` and `$not` operators are nestable inside of another `$and`, `$or` or `$not` operator.
:::
