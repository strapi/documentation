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

## Attribute operators

<br/>

### `$not`

Negates the nested condition(s).

**Example**

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

### `$eq`

Attribute equals input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

`$eq` can be omitted:

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
  },
});
```

### `$eqi`

Attribute equals input value (case-insensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $eqi: 'HELLO World',
    },
  },
});
```

### `$ne`

Attribute does not equal input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $ne: 'ABCD',
    },
  },
});
```

### `$nei`

Attribute does not equal input value (case-insensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $nei: 'abcd',
    },
  },
});
```

### `$in`

Attribute is contained in the input list.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be omitted when passing an array of values:

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$notIn`

Attribute is not contained in the input list.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notIn: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

### `$lt`

Attribute is less than the input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lt: 10,
    },
  },
});
```

### `$lte`

Attribute is less than or equal to the input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $lte: 10,
    },
  },
});
```

### `$gt`

Attribute is greater than the input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gt: 5,
    },
  },
});
```

### `$gte`

Attribute is greater than or equal to the input value.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $gte: 5,
    },
  },
});
```

### `$between`

Attribute is between the 2 input values, boundaries included (e.g., `$between[1, 3]` will also return `1` and `3`).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    rating: {
      $between: [1, 20],
    },
  },
});
```

### `$contains`

Attribute contains the input value (case-sensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $contains: 'Hello',
    },
  },
});
```

### `$notContains`

Attribute does not contain the input value (case-sensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContains: 'Hello',
    },
  },
});
```

### `$containsi`

Attribute contains the input value. `$containsi` is not case-sensitive, while [$contains](#contains) is.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $containsi: 'hello',
    },
  },
});
```

### `$notContainsi`

Attribute does not contain the input value. `$notContainsi` is not case-sensitive, while [$notContains](#notcontains) is.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notContainsi: 'hello',
    },
  },
});
```

### `$startsWith`

Attribute starts with input value (case-sensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWith: 'ABCD',
    },
  },
});
```

### `$startsWithi`

Attribute starts with input value (case-insensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $startsWithi: 'ABCD', // will return the same as filtering with 'abcd'
    },
  },
});
```

### `$endsWith`

Attribute ends with input value (case-sensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD',
    },
  },
});
```

### `$endsWithi`

Attribute ends with input value (case-insensitive).

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $endsWith: 'ABCD', // will return the same as filtering with 'abcd'
    },
    },
  },
});
```

### `$null`

Attribute is `null`.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $null: true,
    },
  },
});
```

### `$notNull`

Attribute is not `null`.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: {
      $notNull: true,
    },
  },
});
```

## Logical operators

### `$and`

All nested conditions must be `true`.

**Example**

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

`$and` will be used implicitly when passing an object with nested conditions:

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    title: 'Hello World',
    createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
  },
});
```

### `$or`

One or many nested conditions must be `true`.

**Example**

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

### `$not`

Negates the nested conditions.

**Example**

```js
const entries = await strapi.documents('api::article.article').findMany({
  filters: {
    $not: {
      title: 'Hello World',
    },
  },
});
```

:::note
`$not` can be used as:

- a logical operator (e.g. in `filters: { $not: { // conditions… }}`)
- [an attribute operator](#not) (e.g. in `filters: { attribute-name: $not: { … } }`).
:::

:::tip
`$and`, `$or` and `$not` operators are nestable inside of another `$and`, `$or` or `$not` operator.
:::
